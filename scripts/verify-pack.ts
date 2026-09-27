// Mesmo desvio H3 já registrado em check-rules.ts (tsconfig.json restringe `types` a `["jest"]`,
// sem @types/node no programa): `require` com cast estrutural local em vez de `import ... from
// 'fs'/'os'/'path'/'child_process'`.
const {
  existsSync,
  readFileSync,
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  rmSync,
  symlinkSync,
} = require('fs') as {
  existsSync: (path: string) => boolean
  readFileSync: (path: string, encoding: 'utf8') => string
  mkdtempSync: (prefix: string) => string
  mkdirSync: (path: string, options?: { recursive?: boolean }) => void
  writeFileSync: (path: string, data: string) => void
  rmSync: (path: string, options: { recursive?: boolean; force: boolean; maxRetries?: number; retryDelay?: number }) => void
  symlinkSync: (target: string, path: string, type: string) => void
}
const { tmpdir } = require('os') as { tmpdir: () => string }
const { join, dirname } = require('path') as { join: (...parts: string[]) => string; dirname: (path: string) => string }
const { spawnSync } = require('child_process') as {
  spawnSync: (
    command: string,
    args?: string[],
    options?: {
      cwd?: string
      shell?: boolean
      encoding?: string
      env?: Record<string, string | undefined>
      timeout?: number
      stdio?: string
    },
  ) => { status: number | null; stdout: string; stderr: string }
}

import { buildBanner } from './add-banner'
import {
  privateFieldError,
  forbiddenDependenciesError,
  peersOutsideDevDependenciesError,
  optionalPeerRequiredByEntryError,
  validatePackFiles,
  changelogMissingEntryError,
  pluginVersionLeakError,
  buildWindowsShellCommand,
} from './lib/verify-pack-checks'
import {
  EXPO_APP_PEER_LINKS,
  expoAppPackageJson,
  expoAppJson,
  expoBabelConfig,
  expoMetroConfig,
  expoAppLayoutTsx,
  expoAppIndexTsx,
  expoAppGlobalCss,
  expoAppTailwindConfig,
} from './lib/verify-pack-expo-app'

// R7 (Windows): `spawnSync` de `npm`/`tar` via `shell: true` só no `win32`.
const WIN = process.platform === 'win32'

interface PackageJsonReal {
  name: string
  version: string
  private?: boolean
  publishConfig?: { access?: string }
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  peerDependenciesMeta?: Record<string, { optional?: boolean }>
  devDependencies?: Record<string, string>
  exports?: Record<string, unknown>
}

// Achados B1/M3 do veredito da entrega dos Blocos 3 e 4 (Fable): `falhar` lançava
// `process.exit(1)` direto, o que pula qualquer `finally` e deixa pastas temporárias para trás
// no caminho de erro. Agora lança um erro; só o bloco de guarda no fim do arquivo decide o
// código de saída, depois que o `finally` de `main()` já rodou a limpeza.
class VerifyPackError extends Error {}

function falhar(mensagem: string): never {
  throw new VerifyPackError(mensagem)
}

/**
 * Substitui `spawnSync(cmd, args, { shell: WIN, ... })` direto: Node 24 emite `[DEP0190]
 * DeprecationWarning` quando `shell: true` recebe um array de argumentos separado. No Windows,
 * `npm.cmd`/`tar.exe`/`expo.cmd` só resolvem via `shell: true` (sem shell, `EINVAL`); a saída é
 * montar a linha inteira já escapada (`buildWindowsShellCommand`) e passá-la sozinha, com um
 * array de argumentos vazio. Fora do Windows, `shell` continua `false`, array de argumentos
 * normal, comportamento inalterado.
 */
function run(
  command: string,
  args: string[],
  options: {
    cwd?: string
    encoding?: string
    env?: Record<string, string | undefined>
    timeout?: number
    stdio?: string
  } = {},
): { status: number | null; stdout: string; stderr: string } {
  if (WIN) {
    return spawnSync(buildWindowsShellCommand(command, args), [], { ...options, shell: true })
  }
  return spawnSync(command, args, { ...options, shell: false })
}

/**
 * Acompanha `acharExpoRouterForaDoBridge`: varre `dist-lib/**\/*.js` procurando `__pluginVersion`
 * (achado do veredito Fable v2, ver `pluginVersionLeakError`).
 */
function acharPluginVersionEmDistLib(): string | null {
  const { globSync } = require('glob') as typeof import('glob')
  const arquivos = globSync('dist-lib/**/*.js', { posix: true })
  const conteudos: Record<string, string> = {}
  for (const arquivo of arquivos) conteudos[arquivo] = readFileSync(arquivo, 'utf8')
  return pluginVersionLeakError(conteudos)
}

/**
 * Varre `dist-lib/**\/*.js` (fora de `router-bridge.js`, o único ponto autorizado a importar
 * `expo-router`) procurando `require("expo-router")` (levantamento 1.2, item 7).
 */
function acharExpoRouterForaDoBridge(): string | null {
  const { globSync } = require('glob') as typeof import('glob')
  const arquivos = globSync('dist-lib/**/*.js', { posix: true }).filter(
    (f: string) => !f.endsWith('router-bridge.js') && !f.includes('.verify-pack'),
  )
  for (const arquivo of arquivos) {
    const conteudo = readFileSync(arquivo, 'utf8')
    if (conteudo.includes('require("expo-router")') || conteudo.includes("require('expo-router')")) {
      return arquivo
    }
  }
  return null
}

/**
 * Reproduz a lacuna 2 do veredito Fable: monta um app Expo mínimo (Expo Router + NativeWind,
 * mesmo perfil 1 do roteiro de simulação), aponta `@rendra-ui/app` para o pacote já
 * instalado/extraído em `entradaPacote` (passo 5/6, nunca reinstalado de novo aqui) e os peers
 * para o `node_modules` deste repositório (`nodeModulesDoRepo`), por link simbólico direto.
 * Roda `expo export --platform web` de verdade (o binário deste repositório, nunca `npx`, para
 * não depender de rede) e falha se o export falhar, com a saída completa na mensagem.
 *
 * Deliberadamente NUNCA roda `npm install`/`npm ci` nesta pasta depois de criar os links: o
 * `@expo` e o `@babel` são linkados como pasta de escopo inteira (não pacote por pacote), e um
 * `npm install` posterior, ao "podar" o que parece `extraneous` num escopo assim, atravessa o
 * link e apaga o conteúdo de verdade do `node_modules` do repositório (comprovado e registrado
 * no registro de desvios desta investigação, fora do git).
 */
function executarReproducaoExpoExport(entradaPacote: string, nodeModulesDoRepo: string): void {
  const baseDir = process.env.RENDRA_VERIFY_PACK_EXPO_DIR || tmpdir()
  mkdirSync(baseDir, { recursive: true })
  const appDir = mkdtempSync(join(baseDir, 'rendra-verify-pack-expo-'))
  const linksCriados: string[] = []
  try {
    mkdirSync(join(appDir, 'app'), { recursive: true })
    mkdirSync(join(appDir, 'node_modules', '@rendra-ui'), { recursive: true })
    writeFileSync(join(appDir, 'package.json'), expoAppPackageJson())
    writeFileSync(join(appDir, 'app.json'), expoAppJson())
    writeFileSync(join(appDir, 'babel.config.js'), expoBabelConfig())
    writeFileSync(join(appDir, 'metro.config.js'), expoMetroConfig(nodeModulesDoRepo))
    writeFileSync(join(appDir, 'global.css'), expoAppGlobalCss())
    writeFileSync(join(appDir, 'tailwind.config.js'), expoAppTailwindConfig())
    writeFileSync(join(appDir, 'app', '_layout.tsx'), expoAppLayoutTsx())
    writeFileSync(join(appDir, 'app', 'index.tsx'), expoAppIndexTsx())

    const linkPacote = join(appDir, 'node_modules', '@rendra-ui', 'app')
    symlinkSync(entradaPacote, linkPacote, WIN ? 'junction' : 'dir')
    linksCriados.push(linkPacote)

    // `dist-lib/theme/tailwind-preset.js` (dentro de `entradaPacote`, fisicamente em
    // `tmpDir/node_modules/@rendra-ui/app`, nunca em `appDir`) faz `require('nativewind/preset')`
    // (achado desta rodada, ao acrescentar `withNativeWind`/`tailwind.config.js` acima): a
    // resolução de módulo do Node segue o caminho real do arquivo, não o link em `appDir`, e
    // `tmpDir/node_modules` não tem `nativewind` (só peer, nunca instalado ali). Num consumidor de
    // verdade, `nativewind` mora no mesmo `node_modules` que `@rendra-ui/app` (irmãos); aqui, o
    // link equivalente é dentro do próprio `entradaPacote` (`node_modules/nativewind`), o primeiro
    // lugar que o Node confere ao resolver esse `require`.
    const nativewindDestino = join(entradaPacote, 'node_modules', 'nativewind')
    if (existsSync(join(nodeModulesDoRepo, 'nativewind')) && !existsSync(nativewindDestino)) {
      mkdirSync(dirname(nativewindDestino), { recursive: true })
      symlinkSync(join(nodeModulesDoRepo, 'nativewind'), nativewindDestino, WIN ? 'junction' : 'dir')
      linksCriados.push(nativewindDestino)
    }

    for (const nome of EXPO_APP_PEER_LINKS) {
      const alvo = join(nodeModulesDoRepo, nome)
      if (!existsSync(alvo)) continue
      const destino = join(appDir, 'node_modules', nome)
      mkdirSync(dirname(destino), { recursive: true })
      symlinkSync(alvo, destino, WIN ? 'junction' : 'dir')
      linksCriados.push(destino)
    }

    const expoBin = join(nodeModulesDoRepo, '.bin', WIN ? 'expo.cmd' : 'expo')
    // `--clear` (achado desta investigação): sem isso, o cache do Metro entre rodadas pode
    // devolver um bundle antigo e mascarar o defeito (falso verde).
    const exportResult = run(expoBin, ['export', '--platform', 'web', '--clear'], {
      cwd: appDir,
      encoding: 'utf8',
      env: { ...process.env, CI: '1' },
      timeout: 180000,
    })
    if (exportResult.status !== 0) {
      falhar(
        `"expo export --platform web" falhou no app Expo mínimo (lacuna 2 do veredito Fable, dist-lib com worklet quebrando o consumidor):\n${exportResult.stdout}\n${exportResult.stderr}`,
      )
    }
  } finally {
    // Remove primeiro os links (um por um: `rmSync` sem `recursive` numa junction/symlink só
    // desfaz o link, nunca desce pro alvo), só depois o restante da pasta (arquivos de verdade,
    // pequenos: package.json, app.json, dist do export).
    for (const link of linksCriados.reverse()) {
      try {
        rmSync(link, { force: true })
      } catch {
        // melhor esforço; a limpeza final do diretório inteiro cobre qualquer sobra.
      }
    }
    rmSync(appDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
  }
}

function main() {
  const publicacao = process.argv.includes('--publicacao')

  // 1. Pré-condição.
  if (!existsSync('dist-lib/index.js')) {
    falhar('dist-lib/index.js não existe, rode "npm run build:lib" primeiro.')
  }

  // 2. package.json e CHANGELOG.md reais.
  const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as PackageJsonReal
  const changelog = readFileSync('CHANGELOG.md', 'utf8')

  if (publicacao) {
    const erroPrivate = privateFieldError(pkg)
    if (erroPrivate) falhar(erroPrivate)
  } else if (pkg.private) {
    console.warn('verify-pack: aviso: private: true, publicação bloqueada até a confirmação do Bruno.')
  }
  if (pkg.name !== '@rendra-ui/app') falhar(`name deveria ser "@rendra-ui/app", veio "${pkg.name}".`)
  if (pkg.publishConfig?.access !== 'public') falhar('publishConfig.access deveria ser "public".')
  const erroDeps = forbiddenDependenciesError(pkg)
  if (erroDeps) falhar(erroDeps)
  const erroPeers = peersOutsideDevDependenciesError(pkg)
  if (erroPeers) falhar(erroPeers)
  const erroPeerOpcional = optionalPeerRequiredByEntryError(pkg)
  if (erroPeerOpcional) falhar(erroPeerOpcional)
  const erroChangelog = changelogMissingEntryError(changelog, pkg.version, publicacao)
  if (erroChangelog) falhar(erroChangelog)
  if (!pkg.exports || !pkg.exports['./router-bridge'] || !pkg.exports['./fonts'] || !pkg.exports['./tailwind-preset']) {
    falhar('exports precisa ter ".", "./router-bridge", "./fonts" e "./tailwind-preset".')
  }

  const expoRouterVazando = acharExpoRouterForaDoBridge()
  if (expoRouterVazando) {
    falhar(`${expoRouterVazando} importa expo-router fora de router-bridge.js.`)
  }

  // Achado do veredito Fable v2: dist-lib nunca pode carregar __pluginVersion (ver
  // pluginVersionLeakError, scripts/lib/verify-pack-checks.ts).
  const erroPluginVersion = acharPluginVersionEmDistLib()
  if (erroPluginVersion) falhar(erroPluginVersion)

  // 3. npm pack de verdade, tarball real (nunca --dry-run). Achado B1 do veredito da entrega dos
  //    Blocos 3 e 4 (Fable): o destino do tarball de prova NUNCA fica dentro de `dist-lib/`
  //    (`files` do package.json é `["dist-lib", ...]`; uma sobra ali entraria no próximo
  //    `npm pack`/`npm publish`). Fica em `os.tmpdir()`, ao lado do projeto temporário do
  //    consumidor, e os dois são removidos no `finally` abaixo, inclusive no caminho de erro
  //    (achado M3: `falhar` agora lança em vez de `process.exit`, então o `finally` sempre roda).
  const packOutDir = mkdtempSync(join(tmpdir(), 'rendra-app-pack-'))
  let tmpDir: string | null = null
  try {
    const packResult = run('npm', ['pack', '.', '--pack-destination', packOutDir, '--json'], {
      encoding: 'utf8',
    })
    if (packResult.status !== 0) falhar(`"npm pack" falhou: ${packResult.stderr}`)
    if (packResult.stderr && packResult.stderr.includes('was invalid and removed')) {
      falhar(`"npm pack" removeu um campo inválido do package.json: ${packResult.stderr}`)
    }
    const packJson = JSON.parse(packResult.stdout) as {
      filename: string
      files: { path: string }[]
    }[]
    const [{ filename, files }] = packJson

    // 4. Lista de arquivos do tarball.
    const arquivos = files.map((f) => f.path)
    const erroArquivos = validatePackFiles(arquivos)
    if (erroArquivos) falhar(erroArquivos)

    const tarballPath = join(packOutDir, filename)

    // 5. Projeto temporário, instalação do tarball real.
    tmpDir = mkdtempSync(join(tmpdir(), 'rendra-app-verify-pack-'))
    writeFileSync(
      join(tmpDir, 'package.json'),
      JSON.stringify({ name: 'consumidor-temporario', version: '0.0.0', private: true }, null, 2),
    )

    let caminhoUsado: 'instalação' | 'estrutural' = 'instalação'
    const install = run(
      'npm',
      ['install', tarballPath, '--prefer-offline', '--no-audit', '--no-fund', '--legacy-peer-deps'],
      { cwd: tmpDir, encoding: 'utf8', timeout: 180000 },
    )
    if (install.status !== 0) {
      caminhoUsado = 'estrutural'
      const destino = join(tmpDir, 'node_modules', '@rendra-ui', 'app')
      mkdirSync(destino, { recursive: true })
      const tarExtract = run(
        'tar',
        ['--force-local', '-xzf', tarballPath, '-C', destino, '--strip-components=1'],
        { encoding: 'utf8' },
      )
      if (tarExtract.status !== 0) {
        falhar(`instalação e extração estrutural falharam.\nnpm install: ${install.stderr}\ntar: ${tarExtract.stderr}`)
      }
    }

    const entradaPacote = join(tmpDir, 'node_modules', '@rendra-ui', 'app')

    // 6. package.json instalado/extraído.
    const pkgInstalado = JSON.parse(readFileSync(join(entradaPacote, 'package.json'), 'utf8')) as PackageJsonReal
    if (pkgInstalado.name !== '@rendra-ui/app') falhar('package.json instalado tem o nome errado.')
    if (pkgInstalado.publishConfig?.access !== 'public') falhar('package.json instalado sem publishConfig.access public.')
    if (pkgInstalado.dependencies?.['expo-router']) falhar('package.json instalado tem expo-router em dependencies.')
    if (
      !pkgInstalado.exports ||
      !pkgInstalado.exports['./router-bridge'] ||
      !pkgInstalado.exports['./fonts'] ||
      !pkgInstalado.exports['./tailwind-preset']
    ) {
      falhar('package.json instalado sem as 4 entradas de exports esperadas.')
    }

    // require.resolve, só faz sentido no caminho de instalação real (decisão do redator 8).
    if (caminhoUsado === 'instalação') {
      const resolveResult = spawnSync(process.execPath, ['-p', "require.resolve('@rendra-ui/app')"], {
        cwd: tmpDir,
        encoding: 'utf8',
      })
      const resolvido = resolveResult.stdout.trim().replace(/\\/g, '/')
      if (!resolvido.endsWith('dist-lib/index.js')) {
        falhar(`require.resolve('@rendra-ui/app') deveria terminar em dist-lib/index.js, veio "${resolvido}".`)
      }
    }

    // 7. Cabeçalho de autoria nos arquivos gerados.
    const banner = buildBanner(pkg.version)
    const arquivosComCabecalho = [
      'index.js',
      'router-bridge.js',
      'fonts.js',
      join('theme', 'tailwind-preset.js'),
      join('components', 'ui', 'button.js'),
    ]
    for (const relativo of arquivosComCabecalho) {
      const caminho = join(entradaPacote, 'dist-lib', relativo)
      const conteudo = readFileSync(caminho, 'utf8')
      if (!conteudo.startsWith(banner)) falhar(`${relativo} não começa com o cabeçalho de autoria.`)
    }

    // 8. Achado M6 do veredito da entrega dos Blocos 3 e 4 (Fable): confere de verdade, no
    //    pacote instalado, que o JSX saiu com o runtime do NativeWind (jsxImportSource:
    //    nativewind, Tarefa 3.4), nunca com react/jsx-runtime (decisão 1 do plano: sem isso, o
    //    className dos componentes nunca chega ao runtime do NativeWind em quem instala).
    //    `acharExpoRouterForaDoBridge`, já rodado no início, cobre a outra metade do passo 8 do
    //    levantamento (nenhum expo-router fora do bridge).
    const buttonPath = join(entradaPacote, 'dist-lib', 'components', 'ui', 'button.js')
    const buttonConteudo = readFileSync(buttonPath, 'utf8')
    if (buttonConteudo.includes('require("react/jsx-runtime")') || buttonConteudo.includes("require('react/jsx-runtime')")) {
      falhar('dist-lib/components/ui/button.js instalado usa react/jsx-runtime; jsxImportSource: nativewind não foi aplicado.')
    }
    if (
      !buttonConteudo.includes('require("nativewind/jsx-runtime")') &&
      !buttonConteudo.includes("require('nativewind/jsx-runtime')")
    ) {
      falhar('dist-lib/components/ui/button.js instalado não usa require("nativewind/jsx-runtime").')
    }

    // 9. Consumidor de verdade: renderiza componente real a partir do dist-lib instalado.
    //    NODE_PATH aponta para o node_modules deste repositório: o projeto temporário não instala
    //    os peers (react, react-native, nativewind), então o require() dentro do dist-lib
    //    instalado precisa encontrá-los aqui, do mesmo jeito que um consumidor real já os teria
    //    instalado no próprio projeto (achado B14 do Opus).
    const nodeModulesDoRepo = join(process.cwd(), 'node_modules')
    const jestResult = run(
      'npx',
      [
        'jest',
        '--config',
        'scripts/verify-pack.jest.config.js',
        'src/__tests__/pack-consumer.test.tsx',
        '--modulePaths',
        nodeModulesDoRepo,
      ],
      {
        env: {
          ...process.env,
          RENDRA_PACK_ENTRY: join(entradaPacote, 'dist-lib', 'index.js'),
        },
        stdio: 'inherit',
      },
    )
    if (jestResult.status !== 0) falhar('teste do consumidor (src/__tests__/pack-consumer.test.tsx) falhou.')

    // 10. tailwind-preset instalado, em processo filho isolado (com NODE_PATH para o nativewind
    //     não instalado no projeto temporário).
    const presetPath = join(entradaPacote, 'dist-lib', 'theme', 'tailwind-preset.js')
    const presetCheck = spawnSync(
      process.execPath,
      [
        '-e',
        `const p = require(${JSON.stringify(presetPath)}); if (p.theme.spacing.touch !== '44px' || !String(p.theme.colors.primary).includes('var(--primary)')) { console.error('preset instalado sem os tokens esperados'); process.exit(1); }`,
      ],
      { encoding: 'utf8', env: { ...process.env, NODE_PATH: nodeModulesDoRepo } },
    )
    if (presetCheck.status !== 0) {
      falhar(`tailwind-preset instalado não tem os tokens esperados: ${presetCheck.stderr}`)
    }

    // 11. Reproduz a lacuna 2 do veredito Fable sobre o pacote npm: o Jest do
    //     passo 9 não pega o TDZ do worklet (transformIgnorePatterns não reprocessa
    //     @rendra-ui/app com o babel do consumidor); só um `expo export --platform web` de
    //     verdade pega. App Expo mínimo num diretório configurável (RENDRA_VERIFY_PACK_EXPO_DIR,
    //     padrão os.tmpdir()); os peers vêm por link simbólico direto do node_modules deste
    //     repositório (nunca reinstalados: ver o comentário de
    //     scripts/lib/verify-pack-expo-app.ts sobre o risco de rodar "npm install" depois de
    //     linkar uma pasta de escopo inteira).
    executarReproducaoExpoExport(entradaPacote, nodeModulesDoRepo)

    // 12. Autoverificação (achado B1): o próximo `npm pack`/`npm publish` sobre este repositório
    //     não pode empacotar nada desta rodada. Roda `npm pack --dry-run` de novo (sem tocar
    //     disco além do próprio dry-run) e passa pela mesma `validatePackFiles`.
    const packDeFechamento = run('npm', ['pack', '.', '--dry-run', '--json'], { encoding: 'utf8' })
    if (packDeFechamento.status !== 0) falhar(`"npm pack --dry-run" de fechamento falhou: ${packDeFechamento.stderr}`)
    const [{ files: filesDeFechamento }] = JSON.parse(packDeFechamento.stdout) as { files: { path: string }[] }[]
    const erroFechamento = validatePackFiles(filesDeFechamento.map((f) => f.path))
    if (erroFechamento) falhar(`dist-lib ficou sujo depois do verify:pack: ${erroFechamento}`)

    console.log('verify-pack: tudo passou.')
    console.log(`Caminho usado: ${caminhoUsado}`)
  } finally {
    // 13. Limpeza, sempre, inclusive no caminho de erro (achados B1 e M3).
    if (tmpDir) rmSync(tmpDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
    rmSync(packOutDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
  }
}

if ((require as unknown as { main?: unknown }).main === module) {
  try {
    main()
  } catch (erro) {
    console.error(`verify-pack: ${erro instanceof Error ? erro.message : String(erro)}`)
    process.exit(1)
  }
}
