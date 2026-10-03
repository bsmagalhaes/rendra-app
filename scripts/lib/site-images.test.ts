// Mesmo desvio H3 dos demais scripts (achado B2 do Opus): `require` com cast estrutural local.
const { existsSync, readFileSync } = require('fs') as {
  existsSync: (caminho: string) => boolean
  readFileSync: (caminho: string, codificacao: 'utf8') => string
}
const { join } = require('path') as { join: (...partes: string[]) => string }

import { CAPTURAS } from './readme-images-list'

const html = readFileSync(join(process.cwd(), 'docs', 'index.html'), 'utf8')

describe('imagens da página', () => {
  it.each(CAPTURAS.map((c) => c.nome))('%s existe e a página a referencia', (nome) => {
    expect(existsSync(join(process.cwd(), 'docs', 'images', `${nome}.webp`))).toBe(true)
    expect(html).toContain(nome)
  })

  it('toda imagem que a página cita em images/ existe no disco', () => {
    const citadas = [...html.matchAll(/images\/([a-z0-9-]+)\.webp/g)].map((m) => m[1] as string)
    expect(citadas.length).toBeGreaterThan(0)
    for (const nome of citadas) expect(existsSync(join(process.cwd(), 'docs', 'images', `${nome}.webp`))).toBe(true)
  })

  it('galeria, miniaturas e lightbox montam o endereço em WebP, nunca em PNG (regra 9)', () => {
    expect(html).toContain("'.webp")
    // Nenhum `.png` na página além da og-image (meta tags e JSON-LD): nem estático, nem montado em JS.
    const todos = html.match(/\.png/g) ?? []
    const daOg = html.match(/og-image\.png/g) ?? []
    expect(daOg.length).toBeGreaterThan(0)
    expect(todos.length).toBe(daOg.length)
  })

  it('a og-image da página existe', () => {
    expect(existsSync(join(process.cwd(), 'docs', 'og-image.png'))).toBe(true)
  })
})
