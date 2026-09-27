export interface ApplyRouteSeoInput {
  html: string
  title: string
  description: string
  url: string
  siteName: string
  ogImageUrl: string
  indexable?: boolean
}

/**
 * Escapa `&`, `"`, `<` e `>` para uso seguro dentro de atributo HTML (`title`/`description`
 * podem trazer texto livre, como "&" em nome de produto ou frase).
 */
function escapeAttr(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

const MARCADOR_INICIO = '<!-- rendra-seo:inicio -->'
const MARCADOR_FIM = '<!-- rendra-seo:fim -->'

/**
 * Remove um bloco de SEO já injetado por `applyRouteSeo` (entre os marcadores), se existir.
 * Sem isso, rodar `applyRouteSeo` uma segunda vez sobre o mesmo HTML duplicaria o canonical e
 * as demais metas (achado B3 da validação do plano, `seo-build` idempotente).
 */
function removeBlocoAnterior(html: string): string {
  const inicio = html.indexOf(MARCADOR_INICIO)
  const fim = html.indexOf(MARCADOR_FIM)
  if (inicio === -1 || fim === -1) return html
  return html.slice(0, inicio) + html.slice(fim + MARCADOR_FIM.length)
}

/**
 * Reescreve o HTML já exportado pelo Expo para uma rota estática: título, description,
 * canonical, robots de indexação (index/follow por padrão, noindex/nofollow quando
 * `indexable` é falso) e Open Graph. Não mexe na meta de política (`noai, noimageai`), que
 * vem de `app/+html.tsx` igual em toda página (achado B9 da validação do plano). Idempotente:
 * aplicar duas vezes sobre o mesmo HTML deixa só um bloco de SEO (achado B3 da validação do
 * plano).
 */
export function applyRouteSeo(input: ApplyRouteSeoInput): string {
  const indexable = input.indexable ?? true
  const robots = indexable ? 'index, follow' : 'noindex, nofollow'
  const title = escapeAttr(input.title)
  const description = escapeAttr(input.description)
  let saida = removeBlocoAnterior(input.html)
  saida = saida.replace(/<title[^>]*>[^<]*<\/title>/, `<title>${title}</title>`)
  saida = saida.replace(/<html[^>]*>/, '<html lang="pt-BR">')
  const metas = [
    `<meta name="description" content="${description}" />`,
    `<meta name="robots" content="${robots}" />`,
    `<link rel="canonical" href="${input.url}" />`,
    '<meta property="og:type" content="website" />',
    '<meta property="og:locale" content="pt_BR" />',
    `<meta property="og:site_name" content="${escapeAttr(input.siteName)}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${input.url}" />`,
    `<meta property="og:image" content="${input.ogImageUrl}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
  ].join('\n')
  const bloco = `${MARCADOR_INICIO}\n${metas}\n${MARCADOR_FIM}`
  saida = saida.replace('</head>', `${bloco}\n</head>`)
  return saida
}
