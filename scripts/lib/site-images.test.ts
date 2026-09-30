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
    expect(existsSync(join(process.cwd(), 'docs', 'images', `${nome}.png`))).toBe(true)
    expect(html).toContain(nome)
  })

  it('toda imagem que a página cita em images/ existe no disco', () => {
    const citadas = [...html.matchAll(/images\/([a-z0-9-]+)\.png/g)].map((m) => m[1] as string)
    expect(citadas.length).toBeGreaterThan(0)
    for (const nome of citadas) expect(existsSync(join(process.cwd(), 'docs', 'images', `${nome}.png`))).toBe(true)
  })

  it('a og-image da página existe', () => {
    expect(existsSync(join(process.cwd(), 'docs', 'og-image.png'))).toBe(true)
  })
})
