import { siteUrlFrom, routeUrl, distFileFor, buildSitemapXml, NOINDEX_FILES, groupVariationFiles } from './seo-paths'

describe('siteUrlFrom', () => {
  it('usa SITE_URL do env quando informado, garantindo barra final', () => {
    expect(siteUrlFrom('/rendra-ui-app', 'https://exemplo.com/x')).toBe('https://exemplo.com/x/')
    expect(siteUrlFrom('/rendra-ui-app', 'https://exemplo.com/x/')).toBe('https://exemplo.com/x/')
  })

  it('monta a partir do baseUrl do app.json quando SITE_URL nao existe', () => {
    expect(siteUrlFrom('/rendra-ui-app')).toBe('https://bsmagalhaes.github.io/rendra-ui-app/')
  })

  it('sem SITE_URL, deriva o dominio do github a partir do homepage do package.json (achado M6, quem clonou e trocou o homepage nao herda o dominio do Rendra)', () => {
    expect(siteUrlFrom('/meu-app', undefined, 'https://github.com/gabriel/meu-app#readme')).toBe(
      'https://gabriel.github.io/meu-app/',
    )
  })

  it('sem SITE_URL nem homepage reconhecivel, cai no dominio padrao do Rendra', () => {
    expect(siteUrlFrom('/rendra-ui-app', undefined, undefined)).toBe('https://bsmagalhaes.github.io/rendra-ui-app/')
    expect(siteUrlFrom('/meu-app', undefined, 'https://exemplo.com/sem-github')).toBe(
      'https://bsmagalhaes.github.io/meu-app/',
    )
  })
})

describe('routeUrl', () => {
  const u = 'https://bsmagalhaes.github.io/rendra-ui-app/'

  it('a raiz devolve a propria siteUrl, sem duplicar', () => {
    expect(routeUrl(u, '/')).toBe(u)
  })

  it('rota interna concatena sem barra inicial dobrada', () => {
    expect(routeUrl(u, '/componentes/acoes')).toBe(`${u}componentes/acoes`)
  })
})

describe('distFileFor', () => {
  const distDir = '/tmp/dist'

  it('raiz aponta para index.html', () => {
    const arquivos = new Set([`${distDir}/index.html`])
    expect(distFileFor(distDir, '/', (p) => arquivos.has(p))).toBe(`${distDir}/index.html`)
  })

  it('escolhe <rota>.html quando ele existe', () => {
    const arquivos = new Set([`${distDir}/componentes/acoes.html`])
    expect(distFileFor(distDir, '/componentes/acoes', (p) => arquivos.has(p))).toBe(
      `${distDir}/componentes/acoes.html`,
    )
  })

  it('escolhe <rota>/index.html quando <rota>.html nao existe', () => {
    const arquivos = new Set([`${distDir}/componentes/index.html`])
    expect(distFileFor(distDir, '/componentes', (p) => arquivos.has(p))).toBe(
      `${distDir}/componentes/index.html`,
    )
  })

  it('lanca erro quando nenhum arquivo existe', () => {
    expect(() => distFileFor(distDir, '/inexistente', () => false)).toThrow(/nenhum arquivo encontrado/)
  })
})

describe('buildSitemapXml', () => {
  const u = 'https://bsmagalhaes.github.io/rendra-ui-app/'

  it('contem a raiz indexavel e nao contem rota nao indexavel', () => {
    const xml = buildSitemapXml(u, [
      { path: '/', indexable: true },
      { path: '/_sitemap', indexable: false },
    ])
    expect(xml).toContain(`<loc>${u}</loc>`)
    expect(xml).not.toContain('_sitemap')
  })
})

describe('NOINDEX_FILES', () => {
  it('lista tambem +not-found.html, alem de _sitemap.html e componentes/[slug].html', () => {
    expect(NOINDEX_FILES).toContain('+not-found.html')
    expect(NOINDEX_FILES).toContain('_sitemap.html')
    expect(NOINDEX_FILES).toContain('componentes/[slug].html')
    expect(NOINDEX_FILES).toHaveLength(3)
  })
})

describe('groupVariationFiles', () => {
  it('separa as variações com o grupo de rota (shell) que o export estático grava a mais', () => {
    const arquivos = [
      'index.html',
      'componentes/index.html',
      'tokens/index.html',
      '(shell)/tokens/index.html',
      '(shell)/componentes/acoes.html',
      'outro/(grupo)/pagina.html',
      '+not-found.html',
    ]
    expect(groupVariationFiles(arquivos)).toEqual([
      '(shell)/tokens/index.html',
      '(shell)/componentes/acoes.html',
      'outro/(grupo)/pagina.html',
    ])
  })

  it('sem grupos devolve lista vazia', () => {
    expect(groupVariationFiles(['index.html', 'galeria/index.html'])).toEqual([])
  })
})
