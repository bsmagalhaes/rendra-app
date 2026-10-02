// Funções puras que `scripts/verify-pack.ts` (Tarefa 4.3) orquestra sobre o `package.json` real,
// o `CHANGELOG.md` real e a lista de arquivos do tarball (`npm pack`). Testáveis sem tocar disco
// nem rede (achado do levantamento 1.7, item 2 e 6; "validatePackFiles do rascunho, aproveitável
// em parte", seção 1.9).

interface PackageJsonMinimo {
  private?: boolean
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependenciesMeta?: Record<string, { optional?: boolean }>
}

/**
 * `private: true` fica em `package.json` até a confirmação manual do Bruno (achado B15 do
 * Opus: a trava de publicação não é o campo `private`, é o gatilho por tag do `publish.yml` mais
 * esta checagem, que `verify-pack.ts` só chama no modo `--publicacao`).
 */
export function privateFieldError(pkg: PackageJsonMinimo): string | null {
  if (pkg.private) return 'package.json tem private: true; publicação bloqueada até a confirmação do Bruno.'
  return null
}

// Lista branca (achado B12 do Opus): tudo que `src/` importa e não tem código nativo, sem
// versão presa ao Expo. Qualquer outro nome em `dependencies` (ferramenta de teste/build, peer
// real, ou pacote de infraestrutura do Expo/Metro) é erro.
const DEPENDENCIAS_PERMITIDAS = [
  // F3: `d3-shape` (JS puro, ISC) so para os caminhos do `Chart`; vive no subcaminho `./chart`.
  // F3: `@10play/tentap-editor` (JS puro, MIT) so para o `RichTextEditor`; vive no subcaminho
  // `./rich-text-editor` e, por ser so `dependencies`, nunca entra no bundle de quem nao o importa.
  // Correção da lacuna 2 do veredito Fable (2026-09-27-pacote-link-validacao-final-fable.md):
  // `scripts/build-lib-worklets.ts` recompila os arquivos com a diretiva `'worklet'` via Babel
  // (`babel-preset-expo`), que injeta helpers de interop (`interopRequireWildcard` etc.) desse
  // pacote em tempo de execução, não só de build.
  '@10play/tentap-editor',
  '@babel/runtime',
  '@expo-google-fonts/dm-sans',
  '@expo-google-fonts/inter',
  '@expo-google-fonts/poppins',
  '@hookform/resolvers',
  'clsx',
  'd3-shape',
  'date-fns',
  'imask',
  'lucide-react-native',
  'react-hook-form',
  'tailwind-merge',
  'zod',
]

export function forbiddenDependenciesError(pkg: PackageJsonMinimo): string | null {
  const encontrados = Object.keys(pkg.dependencies ?? {}).filter(
    (nome) => !DEPENDENCIAS_PERMITIDAS.includes(nome),
  )
  if (encontrados.length === 0) return null
  return `dependencies tem pacote fora da lista permitida (ferramenta de teste/build, peer ou dependência nativa do Expo, que devem estar em peerDependencies/devDependencies): ${encontrados.join(', ')}.`
}

// Achado M2 do veredito da entrega dos Blocos 3 e 4 (Fable): `src/index.ts` exporta
// `ThemedStatusBar`, que importa `expo-status-bar` no topo do arquivo (sem checagem de
// existência). Um peer opcional não é instalado pelo npm por padrão; quem não instala
// `expo-status-bar` teria o bundle do Metro quebrado ao importar qualquer coisa de
// `@rendra-ui/app`, não só `ThemedStatusBar`. `expo-font` e `react-native-web` continuam
// opcionais de verdade (nenhum require deles fora de `./fonts`, que é subcaminho à parte).
const PEERS_QUE_NAO_PODEM_SER_OPCIONAIS = ['expo-status-bar']

export function optionalPeerRequiredByEntryError(pkg: PackageJsonMinimo): string | null {
  const encontrados = PEERS_QUE_NAO_PODEM_SER_OPCIONAIS.filter(
    (nome) => pkg.peerDependenciesMeta?.[nome]?.optional,
  )
  if (encontrados.length === 0) return null
  return `peerDependenciesMeta marca como opcional um peer que a entrada principal exige sem checagem: ${encontrados.join(', ')}.`
}

export function peersOutsideDevDependenciesError(pkg: PackageJsonMinimo): string | null {
  const faltando = Object.keys(pkg.peerDependencies ?? {}).filter((nome) => !(pkg.devDependencies ?? {})[nome])
  if (faltando.length === 0) return null
  return `peerDependencies sem devDependencies correspondente: ${faltando.join(', ')}.`
}

// Achado C9 do Opus: `ARQUIVOS_OBRIGATORIOS` cobre as 4 entradas de `exports` (mais `.d.ts`);
// `ARQUIVOS_PROIBIDOS_PREFIXO` cobre pastas de desenvolvimento e a sobra de uma rodada anterior
// do próprio `verify:pack`; `ARQUIVOS_PROIBIDOS_EXATOS` cobre arquivos que `tsconfig.lib.json`
// (Tarefa 3.4) já deixa fora do `dist-lib/`, mas que uma regressão futura poderia reintroduzir.
const ARQUIVOS_PROIBIDOS_PREFIXO = ['src/', 'app/', 'e2e/', 'docs/', 'assets/', 'scripts/', 'public/', 'dist-lib/.verify-pack/']
const ARQUIVOS_OBRIGATORIOS = [
  'dist-lib/index.js',
  'dist-lib/index.d.ts',
  'dist-lib/router-bridge.js',
  'dist-lib/router-bridge.d.ts',
  'dist-lib/fonts.js',
  'dist-lib/fonts.d.ts',
  'dist-lib/theme/tailwind-preset.js',
  'dist-lib/theme/tailwind-preset.d.ts',
  'dist-lib/chart.js',
  'dist-lib/chart.d.ts',
  // F3 (Bloco 6): o editor tem DUAS variantes e as duas precisam ir ao pacote; sem o `.web.js` o
  // Metro web do consumidor cai no arquivo nativo, que exige o WebView (B3 do parecer do Opus).
  'dist-lib/rich-text-editor.js',
  'dist-lib/rich-text-editor.d.ts',
  'dist-lib/components/ui/rich-text-editor.js',
  'dist-lib/components/ui/rich-text-editor.web.js',
  // F3 (Bloco 7): mesma regra das duas variantes para o visualizador de documentos.
  'dist-lib/document-viewer.js',
  'dist-lib/document-viewer.d.ts',
  'dist-lib/components/ui/document-viewer.js',
  'dist-lib/components/ui/document-viewer.web.js',
]
const ARQUIVOS_PROIBIDOS_EXATOS = [
  'dist-lib/brand/index.js',
  'dist-lib/brand/brand.config.js',
  'dist-lib/lib/robots.js',
  'dist-lib/lib/llms-txt.js',
  'dist-lib/lib/axe-false-positives.js',
  'dist-lib/config/showcase.js',
  'dist-lib/config/seo.js',
]

export function validatePackFiles(arquivos: string[]): string | null {
  const proibidoPrefixo = ARQUIVOS_PROIBIDOS_PREFIXO.find((prefixo) => arquivos.some((a) => a.startsWith(prefixo)))
  if (proibidoPrefixo) return `tarball contém arquivo de desenvolvimento: ${proibidoPrefixo}`
  const proibidoExato = ARQUIVOS_PROIBIDOS_EXATOS.find((nome) => arquivos.includes(nome))
  if (proibidoExato) return `tarball contém arquivo que não deveria estar alcançável: ${proibidoExato}`
  const faltando = ARQUIVOS_OBRIGATORIOS.filter((esperado) => !arquivos.includes(esperado))
  if (faltando.length > 0) return `tarball sem arquivo obrigatório: ${faltando.join(', ')}`
  return null
}

/**
 * `exigirSimulacao` (achado B13 do Opus): sem a flag, só confere a entrada `[version]`; o modo
 * `--publicacao` (Tarefa 4.3) também exige a frase da simulação dos dois leigos (Regra um, item
 * 7), que só existe depois da validação da entrega do lote inteiro.
 */
/**
 * Achado do veredito Fable v2 (validação final v2 do pacote npm): `scripts/build-lib-worklets.ts`
 * roda com `NODE_ENV=production`, o que faz o `react-native-worklets/plugin` pular a injeção de
 * `__pluginVersion` nos arquivos recompilados; é essa omissão que evita a checagem de versão do
 * runtime (`serializable.native.js`) prender o pacote publicado à versão do plugin de quem o
 * compilou. Recebe um mapa `caminho -> conteúdo` (o `dist-lib` real, lido por
 * `scripts/verify-pack.ts`) para ficar testável sem tocar disco.
 */
export function pluginVersionLeakError(arquivosComConteudo: Record<string, string>): string | null {
  const comVazamento = Object.entries(arquivosComConteudo)
    .filter(([, conteudo]) => conteudo.includes('__pluginVersion'))
    .map(([arquivo]) => arquivo)
  if (comVazamento.length === 0) return null
  return `dist-lib com __pluginVersion (worklet recompilado fora de NODE_ENV=production, prenderia o pacote à versão do plugin de quem publicou): ${comVazamento.join(', ')}.`
}

/**
 * Node 24 emite `[DEP0190] DeprecationWarning` quando `child_process.spawnSync`/`spawn` recebe
 * `shell: true` junto de um array de argumentos separado (concatenados sem escapar). No Windows,
 * `npm.cmd`/`tar.exe`/`expo.cmd` só resolvem com `shell: true` (`spawnSync('npm.cmd', [...])`
 * sem shell falha com `EINVAL`, confirmado nesta investigação); a saída é montar a linha inteira
 * já escapada e passar `spawnSync(linha, [], { shell: true })`, nunca `spawnSync(cmd, args, {
 * shell: true })`.
 */
export function quoteWindowsArg(arg: string): string {
  if (arg === '') return '""'
  if (!/[\s"^&|<>()%!]/.test(arg)) return arg
  return `"${arg.replace(/"/g, '""')}"`
}

export function buildWindowsShellCommand(command: string, args: string[]): string {
  return [command, ...args].map(quoteWindowsArg).join(' ')
}

/**
 * Achado B5 do veredito do Opus (Sincronizacao 1, item H6): nenhuma cor/raio/sombra do preset
 * instalado pode resolver `var(--x)` sem o prefixo `--rendra-` (nem `--tw-`, das utilities do
 * proprio Tailwind). Varre o preset inteiro (`JSON.stringify`), nao so `colors`, porque
 * `borderRadius` e `boxShadow` tambem resolvem `var(--...)`.
 */
export function presetVarsWithoutPrefix(theme: unknown): string[] {
  const json = JSON.stringify(theme)
  const nomes = [...json.matchAll(/var\(--([a-zA-Z0-9-]+)\)/g)].map((m) => m[1]!)
  const semPrefixo = nomes.filter((nome) => !nome.startsWith('rendra-') && !nome.startsWith('tw-'))
  return [...new Set(semPrefixo)]
}

export function changelogMissingEntryError(
  changelog: string,
  version: string,
  exigirSimulacao = false,
): string | null {
  if (!changelog.includes(`[${version}]`)) return `CHANGELOG.md sem a entrada [${version}].`
  if (!exigirSimulacao) return null
  // Achado N1 do veredito do Fable (validacao da entrega da Sincronizacao 1): recortar so ate o
  // fim do arquivo deixava a frase de uma entrada MAIS ANTIGA (ex. [0.3.0]) satisfazer a checagem
  // de uma versao nova sem simulacao propria (ex. [1.0.0]); recorta ate o proximo cabecalho de
  // versao (`\n## [`), ou ate o fim quando nao houver um proximo.
  const inicio = changelog.indexOf(`[${version}]`)
  const proximaEntrada = changelog.indexOf('\n## [', inicio)
  const entrada = proximaEntrada === -1 ? changelog.slice(inicio) : changelog.slice(inicio, proximaEntrada)
  if (!/[Ss]imula[cç][aã]o dos dois leigos aprovada/.test(entrada)) {
    return `CHANGELOG.md, entrada [${version}], sem a frase "Simulação dos dois leigos aprovada" (padrão Regra um, item 7).`
  }
  return null
}

/**
 * Subcaminhos que `exports` do `package.json` precisa ter (F3, achado B2 do parecer do Opus):
 * a lista nasce com `./chart` e cada subcaminho novo entra aqui junto do bloco que o cria
 * (`./rich-text-editor` na Tarefa 6.2, `./document-viewer` na 7.1, ja criados), nunca antes, para nenhuma
 * versao publicar um subcaminho vazio.
 */
export const SUBCAMINHOS_ESPERADOS = [
  '.',
  './router-bridge',
  './fonts',
  './tailwind-preset',
  './package.json',
  './chart',
  './rich-text-editor',
  './document-viewer',
]

export function exportsTemEntradasEsperadas(
  exportsDoPacote: Record<string, unknown> | undefined,
  esperados: string[],
): string | null {
  if (!exportsDoPacote) return `package.json sem "exports"; esperado: ${esperados.join(', ')}.`
  const faltando = esperados.filter((entrada) => !(entrada in exportsDoPacote))
  if (faltando.length === 0) return null
  return `exports sem as entradas esperadas: ${faltando.join(', ')}.`
}

/**
 * Varre um mapa `caminho -> conteudo` (o `dist-lib` real, lido por `scripts/verify-pack.ts`)
 * atras de `require("<pacote>")` fora da lista exata de arquivos permitidos: molde de
 * `acharExpoRouterForaDoBridge`, generico para `d3-shape` (so em `chart.js`) e, nos blocos
 * seguintes, `react-native-webview`/`@10play/tentap-editor`. A lista e de caminhos exatos, sem
 * curinga: um `.web.js` vizinho do arquivo permitido tambem e acusado (B3 do parecer).
 */
export function requireForaDoSubcaminho(
  arquivosComConteudo: Record<string, string>,
  nomeDoPacote: string,
  arquivosPermitidos: string[],
): string[] {
  const dupla = `require("${nomeDoPacote}")`
  const simples = `require('${nomeDoPacote}')`
  return Object.entries(arquivosComConteudo)
    .filter(([arquivo, conteudo]) => !arquivosPermitidos.includes(arquivo) && (conteudo.includes(dupla) || conteudo.includes(simples)))
    .map(([arquivo]) => arquivo)
}

/**
 * Quem pode exigir cada pacote pesado de subcaminho (F3, `requireForaDoSubcaminho`): lista exata
 * de arquivos do `dist-lib`, sem curinga. O `.web.js` do editor fica de fora de proposito: ele e
 * o fallback do navegador e nunca pode carregar `react-native-webview` nem o tentap (B3 do parecer
 * do Opus). `./document-viewer` (Tarefa 7.1) entra na lista do `react-native-webview`, so no arquivo nativo.
 */
export const PACOTES_DE_SUBCAMINHO: Record<string, string[]> = {
  'd3-shape': ['dist-lib/components/ui/chart.js'],
  'react-native-webview': ['dist-lib/components/ui/rich-text-editor.js', 'dist-lib/components/ui/document-viewer.js'],
  '@10play/tentap-editor': ['dist-lib/components/ui/rich-text-editor.js'],
}

/**
 * Bundle web exportado (`expo export --platform web`) que carregou o WebView nativo ou o tentap:
 * prova de que o Metro resolveu `rich-text-editor.tsx` em vez do `.web.tsx` (F3, B3 do parecer).
 * Recebe um mapa `caminho -> conteudo`. `RNCWebView` e o nome do modulo nativo; a mencao textual
 * a `react-native-webview` vem do `@expo/dom-webview` (recurso do Expo Router) e nao conta.
 */
export function bundleWebComPacoteNativo(arquivosComConteudo: Record<string, string>): string[] {
  const marcas = ['RNCWebView', '10play', 'tiptap']
  return Object.entries(arquivosComConteudo)
    .filter(([, conteudo]) => marcas.some((marca) => conteudo.includes(marca)))
    .map(([arquivo]) => arquivo)
}
