// Mesmo desvio H3 dos demais scripts: `require` com cast estrutural local (tsconfig.json restringe `types` a `["jest"]`).
interface Pipeline {
  webp: (opcoes: { lossless?: boolean; quality?: number; alphaQuality?: number; effort?: number }) => Pipeline
  png: (opcoes: { compressionLevel: number; effort: number }) => Pipeline
  toBuffer: () => Promise<Uint8Array>
}
const sharp = require('sharp') as (entrada: Uint8Array) => Pipeline

/**
 * WebP otimizado de uma captura de tela: grava sem perda e com perda (qualidade 90, alfa sem perda) e
 * devolve o menor. Captura de interface com poucas cores fica menor sem perda e com o texto intacto;
 * a de tela cheia de gradiente e foto fica menor com perda, sem borda perceptível no texto.
 */
export async function otimizarParaWebp(png: Uint8Array): Promise<Uint8Array> {
  const [semPerda, comPerda] = await Promise.all([
    sharp(png).webp({ lossless: true, effort: 6 }).toBuffer(),
    sharp(png).webp({ quality: 90, alphaQuality: 100, effort: 6 }).toBuffer(),
  ])
  return semPerda.length <= comPerda.length ? semPerda : comPerda
}

/** PNG recomprimido sem perda (`og-image.png`, que continua PNG por causa dos rastreadores sociais). */
export function otimizarPng(png: Uint8Array): Promise<Uint8Array> {
  return sharp(png).png({ compressionLevel: 9, effort: 10 }).toBuffer()
}
