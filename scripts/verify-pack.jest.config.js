// Config de Jest dedicada ao `verify:pack` (Tarefa 4.3): igual à principal (`jest.config.js`),
// mas `transformIgnorePatterns` também deixa `@rendra-ui/app` passar pelo Babel (que inclui o
// plugin do `react-native-reanimated` via `babel-preset-expo`). Sem isso, o pacote empacotado
// (`dist-lib/`, já compilado por `tsc`, nunca visto pelo Babel) executa `useAnimatedStyle` sem
// dependências inferidas e sem o plugin, erro que só acontece sob Jest: o Metro de um
// consumidor real transforma todo módulo, inclusive `node_modules`, pelo `babel-preset-expo`.
const base = require('../jest.config.js')

module.exports = {
  ...base,
  // `--config` fora da raiz faz o Jest resolver `rootDir` a partir da pasta do próprio arquivo
  // de config (`scripts/`); `jest.setup.js` mora na raiz do projeto. `process.cwd()` (não
  // `__dirname`, que precisaria de `env: node` no ESLint) é seguro aqui porque este arquivo só
  // é carregado por `npm run verify:pack`/`scripts/verify-pack.ts`, sempre disparado da raiz.
  rootDir: process.cwd(),
  transformIgnorePatterns: [base.transformIgnorePatterns[0].replace(/\)$/, '|@rendra-ui/.*)')],
}
