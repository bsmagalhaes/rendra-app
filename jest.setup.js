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

// F3 (Bloco 6, achado B4 do parecer do Opus): `react-native-webview` e o `@10play/tentap-editor` sao
// nativos/WebView e nao rodam sob Jest. O preset `jest-expo` resolve a plataforma `ios`, entao o
// `RichTextEditor` nativo (e o `DocumentViewer`) sobem em todo `npm test` pela vitrine. O mock do
// editor devolve sempre o MESMO objeto (`__editor`), para o teste conferir as chamadas, e guarda
// as opcoes de `useEditorBridge` (`__options.onChange`) para simular uma edicao.
// `WebView` e um `jest.fn` para o teste ler as props da ultima renderizacao (`mock.calls`): `source`,
// `onLoadEnd`, `onError`, `onHttpError` (DocumentViewer, Bloco 7).
jest.mock('react-native-webview', () => {
  const WebView = jest.fn(() => null)
  return { __esModule: true, WebView, default: WebView }
})
jest.mock('@10play/tentap-editor', () => {
  const editor = {
    toggleBold: jest.fn(),
    toggleItalic: jest.fn(),
    toggleUnderline: jest.fn(),
    toggleStrike: jest.fn(),
    toggleCode: jest.fn(),
    toggleHeading: jest.fn(),
    toggleBulletList: jest.fn(),
    toggleOrderedList: jest.fn(),
    toggleBlockquote: jest.fn(),
    setLink: jest.fn(),
    setImage: jest.fn(),
    undo: jest.fn(),
    redo: jest.fn(),
    setContent: jest.fn(),
    setPlaceholder: jest.fn(),
    setEditable: jest.fn(),
    getHTML: jest.fn(() => Promise.resolve('<p></p>')),
  }
  const state = { current: {} }
  return {
    __esModule: true,
    __editor: editor,
    __options: { current: undefined },
    __state: state,
    TenTapStartKit: [],
    RichText: () => null,
    useEditorBridge: jest.fn(function (options) {
      require('@10play/tentap-editor').__options.current = options
      return editor
    }),
    useBridgeState: jest.fn(() => state.current),
  }
})

require('react-native-reanimated').setUpTests()

require('./src/lib/icon-interop').registerIconInterop()
