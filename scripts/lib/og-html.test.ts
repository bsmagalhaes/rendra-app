import { buildOgHtml } from './og-html'

const a = new TextEncoder().encode('a')
const b = new TextEncoder().encode('b')
const SELO = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"><rect width="44" height="44"/></svg>'

describe('buildOgHtml', () => {
  it('compõe 1200x630 com título, tagline e dois aparelhos', () => {
    const html = buildOgHtml({
      produto: 'Rendra App',
      tagline: 'Design system mobile em React Native',
      imagens: [a, b],
      selo: SELO,
    })
    expect(html).toContain('width:1200px')
    expect(html).toContain('height:630px')
    expect(html).toContain('Design system mobile em React Native')
    expect((html.match(/class="phone"/g) ?? []).length).toBe(2)
  })

  it('com o selo, leva a marca da família: <svg> e RENDRA <span>APP</span>', () => {
    const html = buildOgHtml({ produto: 'Rendra App', tagline: 't', imagens: [a, b], selo: SELO })
    expect(html).toContain('<svg')
    expect(html).toContain('RENDRA <span>APP</span>')
  })

  it('sem o selo (clone), não carrega a marca Rendra nem o svg (D4)', () => {
    const html = buildOgHtml({ produto: 'meu-app', tagline: 'Meu app', imagens: [a, b] })
    expect(html).not.toContain('<svg')
    expect(html).not.toContain('RENDRA')
    expect(html).toContain('MEU-APP')
  })

  it('usa a identidade escura da família e escapa o texto', () => {
    const html = buildOgHtml({ produto: 'A<b>', tagline: 'x & y', imagens: [a, b] })
    expect(html).toContain('#111111')
    expect(html).toContain('#e8650a')
    expect(html).toContain('A&lt;b&gt;')
    expect(html).toContain('x &amp; y')
    expect(html).not.toContain('A<b>')
  })
})
