module.exports = {
  preset: 'jest-expo',
  // react-native-worklets (dependencia do react-native-reanimated 4.x) publica um resolver de Jest
  // proprio para evitar carregar o binario nativo (NativeWorklets.native.ts) sob Jest; sem isso,
  // require('react-native-reanimated').setUpTests() lanca "Cannot read properties of undefined
  // (reading 'loadUnpackers')" (achado da Tarefa A3).
  resolver: 'react-native-worklets/jest/resolver.js',
  // `lucide-react-native` expõe "exports" com a condição "react-native" apontando só para a
  // build ESM (dist/esm/lucide-react-native.mjs); jest-expo prioriza essa condição na resolução
  // (para imitar o Metro), então `import { icons } from 'lucide-react-native'` (Tarefa B14,
  // src/lib/icon-interop.ts) resolve para o .mjs sob Jest. O transform padrão do jest-expo só
  // cobre `\.[jt]sx?$` (sem `.mjs`), e o .mjs cru quebra com `SyntaxError: Unexpected token
  // 'export'`. moduleNameMapper aponta direto para o arquivo da build CJS (que expõe o mesmo
  // `icons`), contornando a resolução por "exports" do package.json (mapeamento é caminho de
  // arquivo, não specifier de módulo).
  moduleNameMapper: {
    '^lucide-react-native$': '<rootDir>/node_modules/lucide-react-native/dist/cjs/lucide-react-native.js',
    // `app/_layout.tsx` importa `../global.css` (efeito colateral, diretivas `@tailwind`); sem
    // este mapeamento, o Jest tenta interpretar o CSS como JS e quebra. Ver jest.css-mock.js.
    '\\.css$': '<rootDir>/jest.css-mock.js',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/e2e/', '<rootDir>/dist/', '<rootDir>/.pages/', '<rootDir>/dist-lib/'],
  transformIgnorePatterns: [
    // `d3-shape` e `d3-path` (F3, Chart) publicam so ESM; sem a excecao o Jest quebra com
    // `SyntaxError: Unexpected token 'export'`, mesmo achado do `lucide-react-native`.
    // `standard-navigation` (dependencia de expo-router/testing-library, Tarefa B16) publica só
    // `"type": "module"` em `lib/src/index.js`; sem entrar nesta lista de excecao, o Jest tenta
    // exigir o arquivo como CommonJS puro e quebra em `SyntaxError: Cannot use import statement
    // outside a module`.
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|nativewind|react-native-css-interop|lucide-react-native|standard-navigation|d3-shape|d3-path)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/__canary__/**',
    '!src/test-utils/**',
    '!src/types/**',
  ],
  coverageThreshold: {
    './src/components/': { branches: 80, functions: 80, lines: 80, statements: 80 },
    './src/navigation/': { branches: 80, functions: 80, lines: 80, statements: 80 },
    './src/theme/': { branches: 80, functions: 80, lines: 80, statements: 80 },
    './src/theme/tailwind-preset.ts': { branches: 100, functions: 100, lines: 100, statements: 100 },
    './src/fonts.ts': { branches: 100, functions: 100, lines: 100, statements: 100 },
    './src/lib/': { branches: 90, functions: 90, lines: 90, statements: 90 },
    './src/lib/masks.ts': { branches: 87, functions: 100, lines: 100, statements: 100 },
    './src/lib/validators.ts': { branches: 92, functions: 100, lines: 100, statements: 100 },
    './src/brand/palette.ts': { branches: 86, functions: 95, lines: 96, statements: 97 },
    './src/theme/vars.ts': { branches: 100, functions: 100, lines: 100, statements: 100 },
    './src/config/presets.ts': { branches: 80, functions: 100, lines: 100, statements: 100 },
    './src/config/showcase.tsx': { branches: 0, functions: 76, lines: 90, statements: 89 },
    './src/lib/robots.ts': { branches: 100, functions: 100, lines: 100, statements: 100 },
    './src/lib/llms-txt.ts': { branches: 100, functions: 100, lines: 100, statements: 100 },
    './src/config/seo.ts': { branches: 100, functions: 100, lines: 100, statements: 100 },
    // Piso medido antes de fixar (risco R4 do levantamento da Sincronizacao 1): 100/77,5/100/100
    // no commit da Tarefa 1.1; branches com margem porque os ramos ainda descobertos sao
    // fallbacks defensivos (map.get sem entrada previa, entries[0] sem isDefault).
    './src/catalog/components.ts': { branches: 75, functions: 100, lines: 100, statements: 100 },
    // Piso medido antes de fixar (Tarefa 8.1, risco R4): 87,5/88,88/100/86,66 no commit desta
    // tarefa; margem porque o ramo descoberto e o ramo defensivo do reduce motion no proprio
    // useEffect do componente (o pure function spinnerRotationStyle ja cobre o calculo isolado).
    './src/components/ui/spinner.tsx': { branches: 85, functions: 100, lines: 85, statements: 85 },
  },
}
