// @testing-library/react-native@14.0.1 (conferido em node_modules) já estende os matchers do Jest
// automaticamente ao importar o pacote principal (dist/index.js -> require('./matchers/extend-expect')),
// sem precisar do import '@testing-library/react-native/extend-expect'.
import 'react-native-gesture-handler/jestSetup'

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
)

jest.mock('react-native-safe-area-context', () => {
  // O mock oficial (node_modules/react-native-safe-area-context/jest/mock.tsx) é publicado como
  // `export default {...}`; sob o babel.config.js deste projeto (babel-preset-expo), esse arquivo
  // .tsx é transformado (o transformIgnorePatterns do Jest não ignora nada que comece com
  // "react-native", incluindo "react-native-safe-area-context") e vira, em CommonJS,
  // `{ __esModule: true, default: {...} }`, não `{ SafeAreaProvider, ... }` direto. Sem
  // desembrulhar `.default`, `import { SafeAreaProvider } from 'react-native-safe-area-context'`
  // resolve `undefined` (só descoberto na Tarefa B16, primeira a montar de verdade o
  // `SafeAreaProvider` real via `ExpoRoot`/`expo-router/testing-library`; nenhum teste anterior
  // renderizava `app/_layout.tsx`).
  const mock = require('react-native-safe-area-context/jest/mock')
  return { __esModule: true, ...(mock.default ?? mock) }
})

require('react-native-reanimated').setUpTests()

require('./src/lib/icon-interop').registerIconInterop()
