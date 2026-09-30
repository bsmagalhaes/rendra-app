// Mesmo desvio H3 dos demais scripts (achado B2 do Opus): tsconfig.json restringe `types` a
// `["jest"]`, sem @types/node no programa; `require` com cast estrutural local.
const { readFileSync } = require('fs') as { readFileSync: (caminho: string, codificacao: 'utf8') => string }
const { join } = require('path') as { join: (...partes: string[]) => string }
const { Buffer: NodeBuffer } = require('buffer') as {
  Buffer: { from: (dados: Uint8Array) => { toString: (codificacao: 'base64') => string } }
}

export const PHONE_CSS_PATH = join(process.cwd(), 'docs', 'phone.css')

/**
 * Moldura com a captura dentro. `statusBg` (a cor do cabeçalho da tela) pinta a faixa de status de
 * 44 px que fica abaixo do recorte da câmera: é o que o aparelho real faz com o inset superior, e
 * sem ela o recorte cobre o título do cabeçalho. Sem `statusBg` a moldura sai sem a faixa.
 */
export function buildPhoneFrameHtml(png: Uint8Array, statusBg?: string): string {
  const css = readFileSync(PHONE_CSS_PATH, 'utf8')
  const status = statusBg === undefined ? '' : `<div class="status" style="background:${statusBg}"></div>`
  const base64 = NodeBuffer.from(png).toString('base64')
  return `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:transparent}${css}</style></head><body><div class="phone">${status}<img alt="" src="data:image/png;base64,${base64}"></div></body></html>`
}
