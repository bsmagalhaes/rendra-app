export interface PngSize {
  width: number
  height: number
}

export interface ImagemNomeada {
  nome: string
  png: Uint8Array
}

const ASSINATURA = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

/** Lê largura e altura do cabeçalho IHDR (bytes 16 e 20); recusa arquivo sem a assinatura PNG. */
export function readPngSize(bytes: Uint8Array): PngSize {
  if (bytes.length < 24 || ASSINATURA.some((valor, i) => bytes[i] !== valor)) {
    throw new Error('arquivo não é um PNG válido')
  }
  const visao = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  return { width: visao.getUint32(16), height: visao.getUint32(20) }
}

/**
 * Nomes fora do padrão de um produto mobile: qualquer imagem que não seja a `og-image.png` e não
 * seja em pé (altura maior que a largura), e a `og-image.png` diferente de 1200x630.
 */
export function imagensForaDoPadrao(arquivos: ImagemNomeada[]): string[] {
  return arquivos
    .filter(({ nome, png }) => {
      const { width, height } = readPngSize(png)
      return nome === 'og-image.png' ? width !== 1200 || height !== 630 : height <= width
    })
    .map(({ nome }) => nome)
}
