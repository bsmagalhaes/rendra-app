import { otimizarParaWebp, otimizarPng } from './image-optimize'

// PNG 8x8 laranja opaco, em bytes fixos (gerar o PNG com o próprio sharp tornaria o teste circular).
const PNG_8X8 = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAEklEQVQYlWN4kcr1Hx9mGBkKAB5LlYGV/Y/PAAAAAElFTkSuQmCC'), (c) => c.charCodeAt(0))

describe('image-optimize', () => {
  it('otimizarParaWebp devolve um WebP (assinatura RIFF....WEBP)', async () => {
    const saida = await otimizarParaWebp(PNG_8X8)
    expect(String.fromCharCode(...saida.subarray(0, 4))).toBe('RIFF')
    expect(String.fromCharCode(...saida.subarray(8, 12))).toBe('WEBP')
  })

  it('otimizarPng continua devolvendo PNG', async () => {
    const saida = await otimizarPng(PNG_8X8)
    expect(Array.from(saida.subarray(1, 4))).toEqual([0x50, 0x4e, 0x47])
  })
})
