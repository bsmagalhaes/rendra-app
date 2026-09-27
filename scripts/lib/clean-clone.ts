// Funções puras que `scripts/clean-clone.ts` (CLI fina) orquestra sobre os arquivos reais de um
// clone do Rendra App, para cumprir a Regra um, item 5 ("clone limpo"): quem começa um projeto
// novo a partir deste repositório não herda a identidade de pacote do Rendra. Testáveis sem
// tocar disco (levantamento seção 2, item 5; achados B16/C13 do veredito Opus).

export interface PackageJsonLike {
  [chave: string]: unknown
  scripts?: Record<string, string>
}

const CAMPOS_DE_PUBLICACAO = [
  'publishConfig',
  'exports',
  'types',
  'files',
  'sideEffects',
  'peerDependencies',
  'peerDependenciesMeta',
  'homepage',
  'repository',
  'bugs',
  'keywords',
]
// Achado M1/M2 da validacao da entrega (Blocos 5 e 6, Fable): `docs:images` fica de fora desta
// lista (nao e so do pacote, e util a qualquer clone que queira capturas do proprio README); só
// os três scripts que existem por causa do pacote npm saem do `package.json` do clone.
const SCRIPTS_DE_PACOTE = ['build:lib', 'verify:pack', 'clean:clone']

/**
 * Achado B16: a versão original do `pages:stage` copia para `.pages/rendra-app`; sem a troca, o
 * export estático de quem clonou continua sendo servido sob `/rendra-app/`, incompatível com o
 * `app.json` renomeado (`cleanAppJson`) e com `playwright.config.ts` (`cleanPlaywrightConfig`).
 */
export function cleanPagesStage(script: string, nome: string): string {
  return script.replace(/\.pages\/rendra-app/g, `.pages/${nome}`)
}

export function cleanPackageJson(pkg: PackageJsonLike, nome: string): PackageJsonLike {
  const saida: PackageJsonLike = { ...pkg }
  saida.name = nome
  saida.version = '0.1.0'
  saida.private = true
  saida.description = `App ${nome}, feito com Rendra App`
  for (const campo of CAMPOS_DE_PUBLICACAO) delete saida[campo]
  const scripts = { ...(pkg.scripts ?? {}) }
  for (const script of SCRIPTS_DE_PACOTE) delete scripts[script]
  if (scripts['pages:stage']) scripts['pages:stage'] = cleanPagesStage(scripts['pages:stage'], nome)
  saida.scripts = scripts
  return saida
}

export interface AppJsonLike {
  expo: {
    name?: string
    slug?: string
    scheme?: string
    version?: string
    experiments?: { baseUrl?: string; [chave: string]: unknown }
    [chave: string]: unknown
  }
}

/**
 * Achado B16: `experiments.baseUrl` não é apagado (apagar quebra `pages:stage`/Playwright, que
 * continuam esperando um prefixo); o valor vira `/${nome}`, coerente com `cleanPagesStage` e
 * `cleanPlaywrightConfig`.
 */
export function cleanAppJson(app: AppJsonLike, nome: string): AppJsonLike {
  const expo = { ...app.expo }
  expo.name = nome
  expo.slug = nome
  expo.scheme = nome
  expo.version = '0.1.0'
  if (expo.experiments) expo.experiments = { ...expo.experiments, baseUrl: `/${nome}` }
  return { ...app, expo }
}

export function isAlreadyClean(pkg: PackageJsonLike): boolean {
  return Boolean(pkg.private) && !pkg.publishConfig
}

/** Achado B16 (a): remove só os dois passos que o clone não tem mais, mantém o resto do workflow. */
export function cleanCiYml(texto: string): string {
  return texto
    .split('\n')
    .filter((linha) => !/^\s*-\s*run:\s*npm run (build:lib|verify:pack)\s*$/.test(linha))
    .join('\n')
}

/** Achado B16 (b): troca o prefixo `/rendra-app/` do `baseURL` pelo nome do projeto clonado. */
export function cleanPlaywrightConfig(texto: string, nome: string): string {
  return texto.replace(/\/rendra-app\//g, `/${nome}/`)
}

/**
 * Achado B16 (c), estendido pelo achado M1 da validação da entrega (Blocos 5 e 6, Fable): tira as
 * linhas de comando que o clone não tem mais (`build:lib`/`verify:pack`/`clean:clone`, este
 * último porque o próprio script se autorremove ao final) dos arquivos de agente, sem tocar no
 * resto do texto (inclusive o bloco marcado de verificação, que continua igual nos demais
 * comandos, e `docs:images`, que continua existindo no clone).
 *
 * Estendido pelo veredito Fable v2: `CONTRIBUTING.md` sai inteiro em todo clone
 * (`ARQUIVOS_SO_DO_PACOTE`), mas a linha que o cita em `AGENTS.md` ("Passo 2") e
 * `docs/BRIEFING_MODELO.md` ("Tipo de trabalho") sobrevivia, apontando para um arquivo que não
 * existe mais; nos dois arquivos ela é o último item de uma lista numerada de três, então
 * removê-la não deixa buraco de numeração.
 */
export function stripPackageCommands(texto: string): string {
  return texto
    .split('\n')
    .filter((linha) => !/npm run (build:lib|verify:pack|clean:clone)\b/.test(linha))
    .filter((linha) => !/CONTRIBUTING\.md/.test(linha))
    .join('\n')
}

/** Achado C13: README curto do projeto clonado, com o crédito e a licença. */
export function buildCloneReadme(nome: string): string {
  return `# ${nome}\n\nProjeto criado a partir do [Rendra App](https://github.com/bsmagalhaes/rendra-app).\n\n## Feito com Rendra App\n\nEste projeto usa o [Rendra App](https://github.com/bsmagalhaes/rendra-app) como base (design system e boilerplate mobile em React Native/Expo, licença MIT).\n\n## Licença\n\nVer [LICENSE](LICENSE).\n`
}

/** Achado C13: `CHANGELOG.md` do clone recomeça do zero, citando a versão de origem. */
export function buildCloneChangelog(versaoDeOrigem: string, data: string): string {
  return `# Changelog\n\n## [0.1.0] - ${data}\n\n### Adicionado\n\n- Projeto iniciado a partir do Rendra App v${versaoDeOrigem}.\n`
}

/**
 * Achado C13: `src/config/seo.ts` do clone não cita mais o produto nem o repositório do Rendra
 * (a IA preenche `productName`/`repositoryUrl` de verdade no briefing; aqui só troca os
 * placeholders herdados do template).
 *
 * Estendido pelo veredito Fable v2: `tagline`/`audience` também vêm do template original (texto
 * sobre o Rendra App, "boilerplate mobile do Rendra", "migrar ... para o Rendra") e alimentam
 * `llms.txt` de verdade no build do clone (`buildLlmsTxt` lê `siteSeo.tagline`/`siteSeo.audience`
 * direto, `src/lib/llms-txt.ts`); ficavam sem trocar, então o `llms.txt` do projeto novo descrevia
 * o Rendra App, não o projeto. Viram um placeholder curto com o nome do projeto novo, que a IA
 * substitui pelo texto real no briefing (mesmo padrão de `productName`/`repositoryUrl` acima).
 */
export function cleanSeoConfig(texto: string, nome: string): string {
  return texto
    .replace(/productName: 'Rendra App'/, `productName: '${nome}'`)
    .replace(/tagline:\s*'[^']*',/, `tagline: 'Descreva aqui o que ${nome} faz.',`)
    .replace(/audience:\s*'[^']*',/, `audience: 'Descreva aqui para quem ${nome} serve.',`)
    .replace(/repositoryUrl: 'https:\/\/github\.com\/bsmagalhaes\/rendra-app'/, "repositoryUrl: ''")
}

export function isNomeValido(nome: string): boolean {
  return /^[a-z0-9][a-z0-9-]*$/.test(nome)
}
