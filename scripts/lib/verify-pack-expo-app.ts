// Conteúdo (puro, sem tocar disco, testável isolado) do app Expo mínimo que
// `scripts/verify-pack.ts` monta para reproduzir a lacuna 2 do veredito Fable sobre o pacote
// npm: `expo export --platform web` precisa terminar sem o `ReferenceError: Cannot access
// '...' before initialization` que o `react-native-worklets/plugin` do consumidor causava no
// `dist-lib` (ver `scripts/lib/build-lib-worklets.ts`).
//
// Os peers (react, react-native, expo, nativewind, reanimated, worklets etc.) nunca são
// reinstalados aqui: `scripts/verify-pack.ts` cria um link simbólico direto para o
// `node_modules` deste repositório (que já os tem, como devDependencies) e nunca roda `npm
// install` de novo nessa pasta depois de criar os links. Rodar `npm install` depois de linkar
// uma pasta de escopo inteira (`@expo`, `@babel`) apagaria o conteúdo real do `node_modules`
// deste repositório ao "podar" o que parece `extraneous` (investigado e registrado no registro
// de desvios desta investigação, fora do git).
export const EXPO_APP_PEER_LINKS = [
  'react',
  'react-dom',
  'react-native',
  'react-native-web',
  'expo',
  'expo-router',
  'expo-status-bar',
  'expo-constants',
  'expo-linking',
  'expo-font',
  'expo-asset',
  'expo-splash-screen',
  'nativewind',
  'react-native-css-interop',
  'tailwindcss',
  'react-native-reanimated',
  'react-native-worklets',
  'react-native-gesture-handler',
  'react-native-safe-area-context',
  'react-native-svg',
  'react-native-screens',
  'metro',
  'metro-config',
  'metro-resolver',
  'babel-preset-expo',
  '@babel',
  '@expo',
  '@react-native-async-storage',
]

export function expoAppPackageJson(): string {
  return (
    JSON.stringify(
      { name: 'rendra-verify-pack-expo-app', version: '0.0.0', private: true, main: 'expo-router/entry' },
      null,
      2,
    ) + '\n'
  )
}

export function expoAppJson(): string {
  return (
    JSON.stringify(
      {
        expo: {
          name: 'rendra-verify-pack-expo-app',
          slug: 'rendra-verify-pack-expo-app',
          scheme: 'rendraverifypackexpoapp',
          version: '0.0.0',
          plugins: ['expo-router'],
          web: { bundler: 'metro', output: 'static' },
        },
      },
      null,
      2,
    ) + '\n'
  )
}

export function expoBabelConfig(): string {
  return [
    'module.exports = function (api) {',
    '  api.cache(true)',
    '  return {',
    "    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],",
    '  }',
    '}',
    '',
  ].join('\n')
}

/**
 * `nodeModulesPaths` aponta pro `node_modules` deste repositório (nunca reinstalado nesta
 * pasta): esta investigação achou que o Metro do Expo não resolve de forma confiável um link
 * simbólico criado por `fs.symlinkSync` no topo do `node_modules` do app; o fallback por
 * `nodeModulesPaths` resolve os peers direto pelo caminho real, sem depender disso.
 *
 * `withNativeWind` (melhoria não bloqueadora do veredito Fable v2): o app temporário original só
 * tinha o Babel do NativeWind (`jsxImportSource`), nunca o Metro (`withCssInterop`), então o
 * `expo export` nunca exercitava o CSS interop de verdade, só o app novo do Perfil 1 (fora deste
 * repositório) tinha passado por isso. `react-native-css-interop` já está em
 * `EXPO_APP_PEER_LINKS`, então a infraestrutura do symlink já cobre esse require.
 */
export function expoMetroConfig(nodeModulesDoRepo: string): string {
  return [
    "const { getDefaultConfig } = require('expo/metro-config')",
    "const { withNativeWind } = require('nativewind/metro')",
    '',
    'const config = getDefaultConfig(__dirname)',
    `config.resolver.nodeModulesPaths = [${JSON.stringify(nodeModulesDoRepo)}]`,
    '',
    "module.exports = withNativeWind(config, { input: './global.css' })",
    '',
  ].join('\n')
}

/** Mesmas três diretivas do `global.css` deste repositório (raiz), que `withNativeWind` lê. */
export function expoAppGlobalCss(): string {
  return ['@tailwind base;', '@tailwind components;', '@tailwind utilities;', ''].join('\n')
}

/**
 * `withNativeWind` exige um `tailwind.config` com o preset da NativeWind presente (direto ou
 * aninhado em `presets`, ver `node_modules/nativewind/dist/metro/tailwind/v3/index.js`,
 * `tailwindConfigV3`): sem isso, `expo export` falha antes mesmo de montar o bundle. O preset
 * publicado do pacote (`@rendra-ui/app/tailwind-preset`) já inclui `require('nativewind/preset')`
 * (`src/theme/tailwind-preset.ts`), então basta usá-lo, do jeito que `docs/COMO_APLICAR.md` manda
 * quem instala o pacote fazer.
 */
export function expoAppTailwindConfig(): string {
  return [
    "module.exports = {",
    "  presets: [require('@rendra-ui/app/tailwind-preset')],",
    "  content: ['./app/**/*.{js,jsx,ts,tsx}'],",
    '}',
    '',
  ].join('\n')
}

/**
 * Importa e usa `Select` (não só `Button`): esta investigação achou que o `expo export
 * --platform web`, em modo `output: static`, elimina como morto o código de um componente do
 * barrel que nenhuma rota usa de verdade (`Button` sozinho não bastava para chegar em
 * `bottom-sheet.js`). `Select` é público (`src/components/ui/index.ts`) e chega em `BottomSheet`
 * por dentro (`Select` usa `PickerPanel`, que usa `BottomSheet`, os dois internos), garantindo
 * que o `require()` dele entra no grafo sem o app de teste importar API interna do pacote
 * (achado do Fable na validação da entrega desta rodada: `BottomSheet` não é exportado por
 * `src/index.ts` nem por `src/components/ui/index.ts`).
 */
export function expoAppLayoutTsx(): string {
  return [
    "import { Stack } from 'expo-router'",
    "import { Select } from '@rendra-ui/app'",
    "import '../global.css'",
    '',
    'export default function Layout() {',
    '  return (',
    '    <>',
    "      <Select options={[{ value: '1', label: 'Um' }]} />",
    '      <Stack />',
    '    </>',
    '  )',
    '}',
    '',
  ].join('\n')
}

export function expoAppIndexTsx(): string {
  return [
    "import { View } from 'react-native'",
    "import { Button } from '@rendra-ui/app'",
    '',
    'export default function Index() {',
    '  return (',
    '    <View>',
    '      <Button>ok</Button>',
    '    </View>',
    '  )',
    '}',
    '',
  ].join('\n')
}

/**
 * Rota extra do app minimo (F3, Blocos 6 e 7, B3 do parecer do Opus): importa o editor e o visualizador do subcaminho
 * SEM `react-native-webview` linkado. No `expo export --platform web` o Metro precisa escolher
 * `rich-text-editor.web.js`; se escolhesse o nativo, o bundle traria o WebView e o tentap, e
 * `scripts/verify-pack.ts` (`bundleWebComPacoteNativo`) reprova.
 */
export function expoAppEditorTsx(): string {
  return [
    "import { BrandProvider } from '@rendra-ui/app'",
    "import { RichTextEditor } from '@rendra-ui/app/rich-text-editor'",
    "import { DocumentViewer } from '@rendra-ui/app/document-viewer'",
    '',
    'export default function Editor() {',
    '  return (',
    '    <BrandProvider>',
    '      <RichTextEditor defaultValue="<p>ok</p>" />',
    '      <DocumentViewer url="https://exemplo.com.br/a.pdf" title="Contrato" />',
    '    </BrandProvider>',
    '  )',
    '}',
    '',
  ].join('\n')
}
