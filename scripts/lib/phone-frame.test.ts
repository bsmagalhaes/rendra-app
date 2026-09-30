// Mesmo desvio H3 dos demais scripts (achado B2 do Opus): `require` com cast estrutural local.
const { readFileSync } = require('fs') as { readFileSync: (caminho: string, codificacao: 'utf8') => string }
const { Buffer: NodeBuffer } = require('buffer') as {
  Buffer: { from: (dados: Uint8Array) => { toString: (codificacao: 'base64') => string } }
}

import { buildPhoneFrameHtml, PHONE_CSS_PATH } from './phone-frame'

const base64 = (bytes: Uint8Array): string => NodeBuffer.from(bytes).toString('base64')

describe('buildPhoneFrameHtml', () => {
  it('embute o CSS de docs/phone.css e a captura como data URI dentro da moldura', () => {
    const png = new TextEncoder().encode('imagem-falsa')
    const html = buildPhoneFrameHtml(png)
    expect(html).toContain(readFileSync(PHONE_CSS_PATH, 'utf8'))
    expect(html).toContain(`src="data:image/png;base64,${base64(png)}"`)
    expect(html).toContain('class="phone"')
  })

  it('R4: uma faixa de status de 44px, com a cor da tela, fica abaixo do recorte da câmera', () => {
    const html = buildPhoneFrameHtml(new TextEncoder().encode('x'), 'rgb(255, 255, 255)')
    expect(html).toContain('<div class="status" style="background:rgb(255, 255, 255)"></div>')
    expect(html.indexOf('class="status"')).toBeLessThan(html.indexOf('<img'))
    const css = readFileSync(PHONE_CSS_PATH, 'utf8')
    expect(css).toMatch(/\.phone \.status\{[^}]*height:44px/)
  })

  it('a moldura mantém 390 por 844 e não puxa nada de fora', () => {
    const css = readFileSync(PHONE_CSS_PATH, 'utf8')
    expect(css).toContain('aspect-ratio: 390 / 844')
    expect(css).not.toMatch(/url\(\s*['"]?https?:/)
  })

  it('desliga transição com prefers-reduced-motion', () => {
    const css = readFileSync(PHONE_CSS_PATH, 'utf8')
    expect(css).toMatch(/prefers-reduced-motion:\s*no-preference/)
  })

  it('usa a identidade da família (adendo): moldura #0b0b0b e contorno #2c2c2c', () => {
    const css = readFileSync(PHONE_CSS_PATH, 'utf8')
    expect(css).toContain('#0b0b0b')
    expect(css).toContain('#2c2c2c')
    expect(css).not.toContain('#0b0f19')
  })
})
