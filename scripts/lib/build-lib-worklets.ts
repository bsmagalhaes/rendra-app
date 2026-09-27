// Correção da lacuna 2 do veredito Fable (2026-09-27-pacote-link-validacao-final-fable.md):
// `tsc` (`tsconfig.lib.json`, `module: commonjs`) emite, para toda função exportada marcada
// `'worklet'`, um `exports.x = x;` içado para o topo do arquivo (otimização válida só enquanto
// `x` continuar sendo uma `function` içada de verdade). O `react-native-worklets/plugin` do
// consumidor reescreve essa função numa `const` (fábrica do worklet), que não é içada; o
// `exports.x = x` içado passa a rodar antes da `const` existir, e o import do pacote inteiro
// (`src/index.ts` reexporta `components/ui`) lança `ReferenceError: Cannot access '<nome>'
// before initialization` em qualquer app Expo que o importe (`expo export --platform web`).
//
// Causa raiz: o `tsc` decide içar o `exports.x = x` estaticamente, sem saber que um Babel
// downstream vai transformar a função. O Babel do próprio consumidor, quando compila o mesmo
// código-fonte diretamente (função + `export`), NÃO comete esse erro: ele reconhece que o
// binding pode ser reatribuído e emite `exports.x = void 0` cedo (placeholder seguro) mais a
// atribuição de verdade no lugar exato da declaração (`var x = exports.x = function
// xFactory(...)`), depois do `react-native-worklets/plugin` já ter rodado. Provado em
// `scripts/lib/build-lib-worklets.test.ts` e no registro de desvios desta investigação (fora do
// git).
//
// Correção: qualquer arquivo-fonte que declare uma função `'worklet'` é recompilado, depois do
// `tsc`, com o Babel do próprio Expo (`babel-preset-expo`, a mesma cadeia que roda em qualquer
// app Expo real: TypeScript, JSX com `jsxImportSource: nativewind`, `react-native-worklets/plugin`
// e o `commonjs` do Babel, nesta ordem), substituindo o `.js` que o `tsc` gerou para esse arquivo
// só. Os demais 67 arquivos (sem `'worklet'`) continuam saindo do `tsc`, sem mudança de
// comportamento.

// Mesmo desvio H3 já registrado em check-rules.ts/verify-pack.ts: tsconfig.json restringe
// `types` a `["jest"]`, sem @types/node no programa; `require` com cast estrutural local em vez
// de `import ... from 'path'`.
const { join, relative } = require('path') as {
  join: (...parts: string[]) => string
  relative: (from: string, to: string) => string
}

export const SRC_DIR = 'src'
export const DIST_DIR = 'dist-lib'

/** Diretiva `'worklet'` (aspas simples, mesmo estilo usado nos 6 arquivos de componente). */
const WORKLET_DIRECTIVE = "'worklet'"

/**
 * Entre os arquivos varridos (par caminho/conteúdo, sem tocar disco: testável isolado), devolve
 * os que declaram a diretiva `'worklet'` em algum ponto do corpo (qualquer função marcada,
 * `bottomSheetTranslateY`, `thumbTranslateX` etc.), ordenados como vieram.
 */
export function sourceFilesWithWorkletDirective(files: { path: string; content: string }[]): string[] {
  return files.filter((f) => f.content.includes(WORKLET_DIRECTIVE)).map((f) => f.path)
}

/**
 * Espelha o mapeamento `rootDir`/`outDir` de `tsconfig.lib.json` (`src` -> `dist-lib`, mesma
 * subárvore, `.ts`/`.tsx` -> `.js`). Pura, sem tocar disco.
 */
export function distJsPathFor(srcPath: string): string {
  const rel = relative(SRC_DIR, srcPath)
  const semExtensao = rel.replace(/\.(tsx|ts)$/, '')
  return join(DIST_DIR, `${semExtensao}.js`).split('\\').join('/')
}

export { WORKLET_DIRECTIVE }
