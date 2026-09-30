import { imagensForaDoPadrao, readPngSize } from './docs-images-check'

function png(largura: number, altura: number): Uint8Array {
  const bytes = new Uint8Array(24)
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0)
  const visao = new DataView(bytes.buffer)
  visao.setUint32(8, 13)
  bytes.set([0x49, 0x48, 0x44, 0x52], 12)
  visao.setUint32(16, largura)
  visao.setUint32(20, altura)
  return bytes
}

describe('docs-images-check', () => {
  it('lê largura e altura do cabeçalho do PNG', () => {
    expect(readPngSize(png(1170, 2532))).toEqual({ width: 1170, height: 2532 })
  })

  it('recusa arquivo que não é PNG', () => {
    expect(() => readPngSize(new TextEncoder().encode('isto não é um png de verdade'))).toThrow(/não é um PNG/)
  })

  it('acusa imagem larga (1920x1080) e aceita celular em pé e a og-image 1200x630', () => {
    const lista = [
      { nome: 'safira-componentes.png', png: png(1920, 1080) },
      { nome: 'safira-home-mobile.png', png: png(1194, 2556) },
      { nome: 'og-image.png', png: png(1200, 630) },
    ]
    expect(imagensForaDoPadrao(lista)).toEqual(['safira-componentes.png'])
  })

  it('acusa og-image fora de 1200x630', () => {
    expect(imagensForaDoPadrao([{ nome: 'og-image.png', png: png(1200, 600) }])).toEqual(['og-image.png'])
  })
})
