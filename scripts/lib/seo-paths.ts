export interface SeoPathRoute {
  path: string
  indexable: boolean
}

/**
 * Rotas do export estático sem `path` próprio em `routeSeo` (molde de rota dinâmica e página de
 * desenvolvimento do Expo Router), mas que existem em `dist/` e precisam de `noindex` (achado B10
 * da validação do plano).
 */
export const NOINDEX_FILES = ['_sitemap.html', 'componentes/[slug].html', '+not-found.html'] as const

/**
 * Arquivos de `dist/` (caminhos relativos, com `/`) que o `expo export` grava a mais por causa
 * dos grupos de rota entre parênteses (`dist/(shell)/tokens/index.html`, achado C8 do Opus): são
 * cópias da página sem o SEO da rota real, então recebem `noindex`.
 */
export function groupVariationFiles(files: string[]): string[] {
  return files.filter((arquivo) => /(^|\/)\([^/]+\)\//.test(arquivo))
}

/**
 * URL do site, sempre com barra final. Usa `SITE_URL` do ambiente quando informado (garantindo a
 * barra); senão tenta derivar o domínio do GitHub Pages a partir do `homepage` do `package.json`
 * (achado M6 da validação da entrega, Blocos 5 e 6, Fable): sem isso, todo clone que ainda não
 * definiu `SITE_URL` publica `sitemap.xml`/`robots.txt`/`og:url` apontando para o domínio do
 * Rendra (`bsmagalhaes.github.io`), nunca para o do dono do clone. Sem `homepage` reconhecível
 * (removido pelo `clean-clone`, ou apontando para outro domínio), cai no domínio padrão do
 * Rendra, o único disponível sem informação nenhuma.
 */
export function siteUrlFrom(baseUrl: string, envSiteUrl?: string, homepage?: string): string {
  if (envSiteUrl) return envSiteUrl.endsWith('/') ? envSiteUrl : `${envSiteUrl}/`
  const usuarioGithub = homepage?.match(/github\.com\/([^/#]+)\//)?.[1]
  if (usuarioGithub) return `https://${usuarioGithub}.github.io${baseUrl}/`
  return `https://bsmagalhaes.github.io${baseUrl}/`
}

/**
 * URL completa de uma rota: a raiz devolve a própria `siteUrl` (sem duplicar), as demais
 * concatenam sem barra inicial dobrada (achado B7 da validação do plano).
 */
export function routeUrl(siteUrl: string, routePath: string): string {
  return routePath === '/' ? siteUrl : siteUrl + routePath.replace(/^\//, '')
}

/**
 * Arquivo em `distDir` correspondente a `routePath`, respeitando os nomes que o `expo export`
 * realmente emite: a raiz é sempre `index.html`; uma rota interna pode ser `<rota>.html`
 * (arquivo próprio) ou `<rota>/index.html` (pasta com índice, como `componentes/`); lança erro
 * quando nenhum dos dois existe, em vez de avisar e pular (achado B6 da validação do plano).
 * `exists` é injetado para permitir teste sem tocar disco.
 */
export function distFileFor(distDir: string, routePath: string, exists: (path: string) => boolean): string {
  if (routePath === '/') {
    const arquivo = `${distDir}/index.html`
    if (exists(arquivo)) return arquivo
    throw new Error(`seo-paths: nenhum arquivo encontrado para a rota / (tentado ${arquivo})`)
  }
  const limpo = routePath.replace(/^\//, '')
  const comoArquivo = `${distDir}/${limpo}.html`
  if (exists(comoArquivo)) return comoArquivo
  const comoIndice = `${distDir}/${limpo}/index.html`
  if (exists(comoIndice)) return comoIndice
  throw new Error(
    `seo-paths: nenhum arquivo encontrado para a rota ${routePath} (tentado ${comoArquivo} e ${comoIndice})`,
  )
}

/**
 * `sitemap.xml` só com as rotas `indexable` (nunca `_sitemap`/`+not-found`/moldes de rota
 * dinâmica).
 */
export function buildSitemapXml(siteUrl: string, routes: SeoPathRoute[]): string {
  const entradas = routes
    .filter((r) => r.indexable)
    .map((r) => `  <url><loc>${routeUrl(siteUrl, r.path)}</loc></url>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entradas}\n</urlset>\n`
}
