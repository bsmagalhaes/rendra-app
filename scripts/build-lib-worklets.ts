// Passo do `build:lib` que corrige a lacuna 2 do veredito Fable sobre o pacote npm: recompila,
// com o Babel do próprio Expo, só os arquivos-fonte que declaram a diretiva `'worklet'`, substituindo
// o `.js` que o `tsc` (`tsconfig.lib.json`) gerou para eles. Ver o comentário de topo de
// `scripts/lib/build-lib-worklets.ts` para a causa raiz completa. Roda depois do `tsc -p
// tsconfig.lib.json` e antes de `scripts/add-banner.ts --lib`.

// Mesmo desvio H3 do resto do projeto (tsconfig.json restringe `types` a `["jest"]`).
const { existsSync, readFileSync, writeFileSync } = require('fs') as {
  existsSync: (path: string) => boolean
  readFileSync: (path: string, encoding: 'utf8') => string
  writeFileSync: (path: string, data: string) => void
}

import { sourceFilesWithWorkletDirective, distJsPathFor, SRC_DIR } from './lib/build-lib-worklets'

const DIST_MARKER = 'dist-lib/index.js'

function main() {
  if (!existsSync(DIST_MARKER)) {
    console.error('build-lib-worklets: dist-lib/index.js não existe; rode "tsc -p tsconfig.lib.json" antes.')
    process.exit(1)
  }

  const { globSync } = require('glob') as typeof import('glob')
  const candidatos = globSync(`${SRC_DIR}/**/*.{ts,tsx}`, { posix: true }).filter(
    (f: string) => !/\.test\.|__tests__|__canary__|__fixtures__/.test(f),
  )
  const arquivos = candidatos.map((path: string) => ({ path, content: readFileSync(path, 'utf8') }))
  const comWorklet = sourceFilesWithWorkletDirective(arquivos)

  if (comWorklet.length === 0) {
    console.log('build-lib-worklets: nenhum arquivo com a diretiva worklet, nada a recompilar.')
    return
  }

  // NODE_ENV=production desliga o Fast Refresh e outros ramos de desenvolvimento do
  // babel-preset-expo: o `dist-lib` publicado nunca deve carregar `react-refresh/runtime`.
  const nodeEnvAnterior = process.env.NODE_ENV
  process.env.NODE_ENV = 'production'
  try {
    const babel = require('@babel/core') as typeof import('@babel/core')
    let recompilados = 0
    for (const srcPath of comWorklet) {
      const distPath = distJsPathFor(srcPath)
      if (!existsSync(distPath)) continue // não faz parte do grafo público emitido pelo tsc.
      const resultado = babel.transformFileSync(srcPath, {
        presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }]],
        babelrc: false,
        configFile: false,
        filename: srcPath,
      })
      if (!resultado?.code) {
        throw new Error(`build-lib-worklets: Babel não produziu código para ${srcPath}.`)
      }
      writeFileSync(distPath, resultado.code)
      recompilados++
    }
    console.log(`build-lib-worklets: ${recompilados} arquivo(s) com worklet recompilado(s) via Babel.`)
  } finally {
    process.env.NODE_ENV = nodeEnvAnterior
  }
}

if ((require as unknown as { main?: unknown }).main === module) {
  main()
}
