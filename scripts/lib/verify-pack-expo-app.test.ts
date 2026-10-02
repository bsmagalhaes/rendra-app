// Mesmo desvio já registrado em outras suítes deste diretório (tsconfig.json restringe `types` a
// `["jest"]`, sem @types/node): `require` com cast local em vez de `import ... from 'fs'/'path'`.
const { readFileSync } = require('fs') as { readFileSync: (path: string, encoding: 'utf8') => string }
const { join } = require('path') as { join: (...parts: string[]) => string }

import {
  EXPO_APP_PEER_LINKS,
  expoAppPackageJson,
  expoAppJson,
  expoBabelConfig,
  expoMetroConfig,
  expoAppLayoutTsx,
  expoAppIndexTsx,
  expoAppEditorTsx,
  expoAppGlobalCss,
  expoAppTailwindConfig,
} from './verify-pack-expo-app'

describe('conteúdo do app Expo mínimo do verify:pack (lacuna 2 do veredito Fable)', () => {
  it('package.json usa expo-router/entry, sem dependencies (peers vêm por symlink)', () => {
    const pkg = JSON.parse(expoAppPackageJson())
    expect(pkg.main).toBe('expo-router/entry')
    expect(pkg.private).toBe(true)
    expect(pkg.dependencies).toBeUndefined()
  })

  it('app.json habilita o plugin expo-router e o bundler metro no web', () => {
    const appJson = JSON.parse(expoAppJson())
    expect(appJson.expo.plugins).toContain('expo-router')
    expect(appJson.expo.web.bundler).toBe('metro')
  })

  it('babel.config.js usa babel-preset-expo com jsxImportSource nativewind', () => {
    expect(expoBabelConfig()).toContain("jsxImportSource: 'nativewind'")
    expect(expoBabelConfig()).toContain('babel-preset-expo')
  })

  it('metro.config.js usa o getDefaultConfig padrão do Expo e aponta nodeModulesPaths pro repositório', () => {
    const conteudo = expoMetroConfig('/repo/node_modules')
    expect(conteudo).toContain("require('expo/metro-config')")
    expect(conteudo).toContain('/repo/node_modules')
  })

  // Melhoria não bloqueadora do veredito Fable v2: o app temporário do verify:pack não tinha
  // withNativeWind/global.css, então nunca exercitava o CSS interop do NativeWind no export
  // (só o consumidor de verdade, num app novo à parte, tinha passado por isso). Aproxima o app
  // temporário do consumidor real sem tirar o que já existia (nodeModulesPaths continua).
  it('metro.config.js envolve o config com withNativeWind, apontando pro global.css', () => {
    const conteudo = expoMetroConfig('/repo/node_modules')
    expect(conteudo).toContain("require('nativewind/metro')")
    expect(conteudo).toContain('withNativeWind(config')
    expect(conteudo).toContain("input: './global.css'")
  })

  it('global.css tem as três diretivas do Tailwind, igual ao global.css deste repositório', () => {
    const css = expoAppGlobalCss()
    expect(css).toContain('@tailwind base;')
    expect(css).toContain('@tailwind components;')
    expect(css).toContain('@tailwind utilities;')
  })

  it('tailwind.config.js usa o preset publicado do pacote (nativewind exige o preset pra achar o CSS)', () => {
    const conteudo = expoAppTailwindConfig()
    expect(conteudo).toContain("require('@rendra-ui/app/tailwind-preset')")
    expect(conteudo).toContain('presets')
    expect(conteudo).toContain('content')
  })

  it('_layout.tsx e index.tsx importam de @rendra-ui/app (reproduz o import do consumidor real)', () => {
    expect(expoAppLayoutTsx()).toContain("from '@rendra-ui/app'")
    expect(expoAppIndexTsx()).toContain("from '@rendra-ui/app'")
  })

  it('editor.tsx importa o subcaminho do editor, sem react-native-webview nem tentap (prova a resolucao .web.js do Metro, B3)', () => {
    const rota = expoAppEditorTsx()
    expect(rota).toContain("from '@rendra-ui/app/rich-text-editor'")
    expect(rota).toContain('RichTextEditor')
    expect(rota).toContain("from '@rendra-ui/app/document-viewer'")
    expect(rota).toContain('DocumentViewer')
    expect(rota).not.toMatch(/react-native-webview|tentap/)
  })

  it('o app do verify:pack nao linka react-native-webview nem o tentap (quem instala sem o peer opcional)', () => {
    expect(EXPO_APP_PEER_LINKS).not.toContain('react-native-webview')
    expect(EXPO_APP_PEER_LINKS).not.toContain('@10play')
  })

  it('_layout.tsx importa o global.css, como o consumidor real faz na raiz do app', () => {
    expect(expoAppLayoutTsx()).toContain("import '../global.css'")
  })

  it('a lista de peers linkados por symlink cobre os peerDependencies do Reanimated/worklets', () => {
    expect(EXPO_APP_PEER_LINKS).toContain('react-native-reanimated')
    expect(EXPO_APP_PEER_LINKS).toContain('react-native-worklets')
    expect(EXPO_APP_PEER_LINKS).toContain('expo-router')
  })

  // Achado do Fable na validação da entrega desta rodada: `_layout.tsx` importava `BottomSheet`
  // direto de `@rendra-ui/app`, mas ele é interno (não sai em `src/index.ts` nem em
  // `src/components/ui/index.ts`); um consumidor real não conseguiria fazer esse import. `Select`
  // é público e chega em `BottomSheet` por dentro (`Select` usa `PickerPanel`, que usa
  // `BottomSheet`), cobrindo o mesmo objetivo (o `require()` de `bottom-sheet.js` entra no grafo
  // do `expo export`) só com API pública.
  it('_layout.tsx não importa BottomSheet (interno); usa Select, que é público e chega em BottomSheet por dentro', () => {
    const layout = expoAppLayoutTsx()
    expect(layout).not.toContain('BottomSheet')
    expect(layout).toContain('Select')

    const uiIndex = readFileSync(join(process.cwd(), 'src/components/ui/index.ts'), 'utf8')
    expect(uiIndex).toMatch(/export \{ Select \} from '\.\/select'/)
    expect(uiIndex).not.toMatch(/export \{ BottomSheet \}/)

    const pickerPanel = readFileSync(join(process.cwd(), 'src/components/internal/picker-panel.tsx'), 'utf8')
    expect(pickerPanel).toMatch(/BottomSheet/)
  })
})
