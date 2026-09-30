// Mesmo desvio já registrado em scripts/verify-build.test.ts e scripts/lib/agent-files.test.ts:
// tsconfig.json restringe `types` a `["jest"]`, então `@types/node` não entra no programa;
// `require` com cast local em vez de `import ... from 'fs'/'os'/'path'`.
const { mkdtempSync, writeFileSync, readFileSync, rmSync } = require('fs') as {
  mkdtempSync: (prefix: string) => string
  writeFileSync: (path: string, data: string) => void
  readFileSync: (path: string, encoding: 'utf8') => string
  rmSync: (path: string, options: { recursive: boolean; force: boolean }) => void
}
const { tmpdir } = require('os') as { tmpdir: () => string }
const { join } = require('path') as { join: (...parts: string[]) => string }

import {
  cleanPackageJson,
  cleanAppJson,
  isAlreadyClean,
  cleanCiYml,
  cleanPlaywrightConfig,
  cleanPagesStage,
  stripPackageCommands,
  buildCloneReadme,
  buildCloneChangelog,
  cleanSeoConfig,
  isNomeValido,
  type PackageJsonLike,
} from './clean-clone'

describe('cleanPackageJson', () => {
  it('troca o nome, zera a versao, remove campos de publicacao e poe private true, mantendo author e license', () => {
    const entrada: PackageJsonLike = {
      name: '@rendra-ui/app',
      version: '0.3.0',
      author: { name: 'Bruno Magalhaes' },
      license: 'MIT',
      publishConfig: { access: 'public' },
      exports: { '.': './dist-lib/index.js' },
      peerDependencies: { react: '>=19' },
      homepage: 'https://github.com/bsmagalhaes/rendra-ui-app#readme',
      scripts: {
        'build:lib': 'x',
        'verify:pack': 'y',
        'clean:clone': 'z',
        'docs:images': 'w',
        'pages:stage': 'tsx scripts/pages-stage.ts',
        'test:site': 'playwright test e2e/site.spec.ts',
        'test:demo': 'playwright test e2e/demo-subcaminho.spec.ts',
        start: 'expo start',
      },
    }
    const saida = cleanPackageJson(entrada, 'meu-app') as PackageJsonLike & {
      scripts: Record<string, string>
    }
    expect(saida.name).toBe('meu-app')
    expect(saida.version).toBe('0.1.0')
    expect(saida.private).toBe(true)
    expect(saida.publishConfig).toBeUndefined()
    expect(saida.exports).toBeUndefined()
    expect(saida.peerDependencies).toBeUndefined()
    expect(saida.homepage).toBeUndefined()
    expect(saida.scripts['build:lib']).toBeUndefined()
    expect(saida.scripts['verify:pack']).toBeUndefined()
    expect(saida.scripts['clean:clone']).toBeUndefined()
    // Achado M1/M2 da validacao da entrega (Blocos 5 e 6, Fable): `docs:images` continua util a
    // quem clonou (capturas do proprio README), so os scripts do pacote saem.
    expect(saida.scripts['docs:images']).toBe('w')
    expect(saida.scripts.start).toBe('expo start')
    // A página de apresentação e o /demo/ são do Rendra: o clone volta a copiar o export direto para
    // .pages/<nome>, sem scripts/pages-stage.ts (apagado) e sem subpasta demo (achado B5).
    expect(saida.scripts['pages:stage']).toBe(
      "node -e \"const fs=require('fs');fs.rmSync('.pages',{recursive:true,force:true});fs.mkdirSync('.pages/meu-app',{recursive:true});fs.cpSync('dist','.pages/meu-app',{recursive:true})\"",
    )
    expect(saida.scripts['pages:stage']).not.toContain('demo')
    expect(saida.scripts['test:site']).toBeUndefined()
    expect(saida.scripts['test:demo']).toBeUndefined()
    expect(saida.author).toEqual({ name: 'Bruno Magalhaes' })
    expect(saida.license).toBe('MIT')
    expect(saida.description).toBe('App meu-app, feito com Rendra App')
  })
})

describe('cleanPagesStage', () => {
  it('copia dist direto para .pages/<nome>, sem subpasta demo nem scripts/pages-stage.ts', () => {
    const saida = cleanPagesStage('meu-app')
    expect(saida).toContain("fs.mkdirSync('.pages/meu-app'")
    expect(saida).toContain("fs.cpSync('dist','.pages/meu-app'")
    expect(saida).not.toMatch(/demo|pages-stage/)
  })
})

describe('cleanAppJson', () => {
  it('troca name/slug/scheme e o valor de experiments.baseUrl, sem apagar o campo (achado B16)', () => {
    const saida = cleanAppJson(
      {
        expo: {
          name: 'Rendra App',
          slug: 'rendra-ui-app',
          scheme: 'rendra',
          version: '0.3.0',
          experiments: { baseUrl: '/rendra-ui-app' },
        },
      },
      'meu-app',
    )
    expect(saida.expo.name).toBe('meu-app')
    expect(saida.expo.slug).toBe('meu-app')
    expect(saida.expo.scheme).toBe('meu-app')
    expect(saida.expo.version).toBe('0.1.0')
    expect(saida.expo.experiments).toEqual({ baseUrl: '/meu-app' })
  })
})

describe('isAlreadyClean', () => {
  it('detecta um package.json que ja passou pela limpeza', () => {
    expect(isAlreadyClean({ private: true })).toBe(true)
    expect(isAlreadyClean({ publishConfig: { access: 'public' } })).toBe(false)
  })
})

describe('cleanCiYml', () => {
  it('remove so os passos de build:lib e verify:pack, mantendo o resto do workflow', () => {
    const texto = [
      '      - run: npm ci',
      '      - run: npm run typecheck',
      '      - run: npm run build:lib',
      '      - run: npm run verify:pack',
      '      - run: npm run build',
    ].join('\n')
    const saida = cleanCiYml(texto, 'meu-app')
    expect(saida).not.toContain('build:lib')
    expect(saida).not.toContain('verify:pack')
    expect(saida).toContain('npm run typecheck')
    expect(saida).toContain('npm run build')
  })

  it('tira os passos da página e da demo e volta o artefato para .pages/<nome> (achado B5)', () => {
    const texto = [
      '      - run: npm run build',
      '      - run: npm run pages:stage',
      '      - run: npm run docs:images:check',
      '      - run: npm run test:a11y',
      '      - run: npm run test:site',
      '      - run: npm run test:demo',
      '        with: { name: pages, path: .pages/rendra-ui-app }',
    ].join('\n')
    const saida = cleanCiYml(texto, 'meu-app')
    for (const fora of ['pages:stage', 'docs:images:check', 'test:site', 'test:demo']) expect(saida).not.toContain(fora)
    expect(saida).toContain('npm run test:a11y')
    expect(saida).toContain('path: .pages/meu-app }')
  })
})

describe('cleanPlaywrightConfig', () => {
  it('troca o prefixo /rendra-ui-app/ do baseURL pelo nome do projeto', () => {
    const texto = "use: { baseURL: 'http://localhost:4173/rendra-ui-app/' },"
    expect(cleanPlaywrightConfig(texto, 'meu-app')).toBe(
      "use: { baseURL: 'http://localhost:4173/meu-app/' },",
    )
  })

  it('o baseURL da demo (/rendra-ui-app/demo/) vira /<nome>/, sem /demo (achado B5)', () => {
    const texto = "use: { baseURL: 'http://localhost:4173/rendra-ui-app/demo/' },"
    expect(cleanPlaywrightConfig(texto, 'meu-app')).toBe("use: { baseURL: 'http://localhost:4173/meu-app/' },")
  })

  it('tira os projetos site-* e o testIgnore, com fim de linha LF ou CRLF', () => {
    for (const eol of ['\n', '\r\n']) {
      const texto = [
        'projects: [',
        '  { name: "w360", metadata: {},',
        '    testIgnore: /site\\.spec\\.ts/,',
        '  },',
        '    // site:inicio (página de apresentação)',
        "    { name: 'site-desktop', baseURL: 'http://localhost:4173/rendra-ui-app/' },",
        "    { name: 'site-mobile' },",
        '    // site:fim',
        '  ],',
      ].join(eol)
      const saida = cleanPlaywrightConfig(texto, 'meu-app')
      expect(saida).not.toContain('site-')
      expect(saida).not.toContain('site:')
      expect(saida).not.toContain('testIgnore')
      expect(saida).toContain('projects: [')
      expect(saida).toContain('  ],')
    }
  })
})

describe('stripPackageCommands', () => {
  it('remove as linhas que citam build:lib/verify:pack dos arquivos de agente', () => {
    const texto = ['npm run typecheck', 'npm run build:lib', 'npm run verify:pack', 'npm run test:coverage'].join(
      '\n',
    )
    expect(stripPackageCommands(texto)).toBe('npm run typecheck\nnpm run test:coverage')
  })

  it('remove as linhas de test:site e test:demo (achado B5), preservando docs:images e test:a11y', () => {
    const texto = [
      'npm run test:a11y      # Playwright + axe',
      'npm run test:site      # a página',
      'npm run test:demo      # a demo',
      'npm run docs:images    # capturas',
    ].join('\n')
    expect(stripPackageCommands(texto)).toBe('npm run test:a11y      # Playwright + axe\nnpm run docs:images    # capturas')
  })

  it('remove tambem a linha de npm run clean:clone (achado M1), mas preserva docs:images', () => {
    const texto = [
      '5. `npm run clean:clone -- --nome <nome>` (troca a identidade de pacote).',
      'npm run docs:images',
      'npm run test:coverage',
    ].join('\n')
    const saida = stripPackageCommands(texto)
    expect(saida).not.toContain('npm run clean:clone')
    expect(saida).toContain('npm run docs:images')
    expect(saida).toContain('npm run test:coverage')
  })

  // Lacuna não bloqueadora do veredito Fable v2: `CONTRIBUTING.md` sai inteiro em todo clone
  // (ARQUIVOS_SO_DO_PACOTE), mas a linha que o cita em AGENTS.md/docs/BRIEFING_MODELO.md
  // sobrevivia, apontando para um arquivo que não existe mais no projeto clonado.
  it('remove a linha que cita CONTRIBUTING.md (arquivo removido em todo clone), preserva o resto da lista', () => {
    const texto = [
      '1. Projeto novo (ramo b).',
      '2. Migração de um sistema existente (ramo c).',
      '3. Contribuição para o próprio Rendra App (ramo a, ver `CONTRIBUTING.md`).',
    ].join('\n')
    const saida = stripPackageCommands(texto)
    expect(saida).not.toContain('CONTRIBUTING.md')
    expect(saida).toContain('1. Projeto novo (ramo b).')
    expect(saida).toContain('2. Migração de um sistema existente (ramo c).')
  })
})

describe('buildCloneReadme e buildCloneChangelog', () => {
  it('README curto cita o nome, o crédito Feito com Rendra App e a Licença', () => {
    const readme = buildCloneReadme('meu-app')
    expect(readme).toContain('# meu-app')
    expect(readme).toContain('Feito com Rendra App')
    expect(readme).toContain('https://github.com/bsmagalhaes/rendra-ui-app')
    expect(readme).toContain('Licença')
  })

  it('CHANGELOG recomeça em 0.1.0 citando a versão de origem', () => {
    const changelog = buildCloneChangelog('0.3.0', '27/09/2026')
    expect(changelog).toContain('## [0.1.0] - 27/09/2026')
    expect(changelog).toContain('Rendra App v0.3.0')
  })
})

describe('cleanSeoConfig', () => {
  it('troca productName e limpa repositoryUrl herdados do template', () => {
    const texto = "productName: 'Rendra App',\n  repositoryUrl: 'https://github.com/bsmagalhaes/rendra-ui-app',"
    const saida = cleanSeoConfig(texto, 'meu-app')
    expect(saida).toContain("productName: 'meu-app'")
    expect(saida).toContain("repositoryUrl: ''")
  })

  // Lacuna não bloqueadora do veredito Fable v2: cleanSeoConfig não tocava tagline/audience, então
  // o llms.txt gerado pelo build do clone (buildLlmsTxt lê siteSeo.tagline/audience direto,
  // src/lib/llms-txt.ts) continuava com a tagline original do Rendra App, não a do projeto novo.
  it('troca tagline e audience por um placeholder do projeto novo, sem herdar a tagline do Rendra App', () => {
    const texto = [
      "  tagline: 'Design system e boilerplate mobile do Rendra, em React Native (Expo) com Expo Router e NativeWind.',",
      '  audience:',
      "    'Quem começa um app novo em React Native (Expo) e quer um design system pronto, ou quem já tem um app e quer migrar a camada visual para o Rendra.',",
    ].join('\n')
    const saida = cleanSeoConfig(texto, 'meu-app')
    expect(saida).not.toContain('boilerplate mobile do Rendra')
    expect(saida).not.toContain('migrar a camada visual para o Rendra')
    expect(saida).toContain("tagline: 'Descreva aqui o que meu-app faz.',")
    expect(saida).toContain("audience: 'Descreva aqui para quem meu-app serve.',")
  })
})

describe('isNomeValido', () => {
  it('aceita minusculas/numeros/hifen, comecando por letra ou numero', () => {
    expect(isNomeValido('meu-app')).toBe(true)
    expect(isNomeValido('app2')).toBe(true)
  })

  it('recusa maiuscula, espaco ou comeco por hifen', () => {
    expect(isNomeValido('Meu-App')).toBe(false)
    expect(isNomeValido('meu app')).toBe(false)
    expect(isNomeValido('-meu-app')).toBe(false)
  })
})

describe('integração: cópia real de package.json e app.json deste repositório', () => {
  it('lê os arquivos reais, aplica as funções puras e o resultado é JSON válido e limpo', () => {
    const dir = mkdtempSync(join(tmpdir(), 'clean-clone-integracao-'))
    const pkgReal = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as PackageJsonLike
    const appReal = JSON.parse(readFileSync(join(process.cwd(), 'app.json'), 'utf8')) as {
      expo: { name?: string; slug?: string; scheme?: string; version?: string; experiments?: { baseUrl?: string } }
    }

    const pkgLimpo = cleanPackageJson(pkgReal, 'meu-app')
    const appLimpo = cleanAppJson(appReal, 'meu-app')

    const pkgPath = join(dir, 'package.json')
    const appPath = join(dir, 'app.json')
    writeFileSync(pkgPath, `${JSON.stringify(pkgLimpo, null, 2)}\n`)
    writeFileSync(appPath, `${JSON.stringify(appLimpo, null, 2)}\n`)

    const pkgRelido = JSON.parse(readFileSync(pkgPath, 'utf8')) as PackageJsonLike
    const appRelido = JSON.parse(readFileSync(appPath, 'utf8')) as { expo: { experiments?: { baseUrl?: string } } }

    rmSync(dir, { recursive: true, force: true })

    expect(pkgRelido.private).toBe(true)
    expect(pkgRelido.name).toBe('meu-app')
    expect(pkgRelido.publishConfig).toBeUndefined()
    expect(appRelido.expo.experiments?.baseUrl).toBe('/meu-app')
  })
})
