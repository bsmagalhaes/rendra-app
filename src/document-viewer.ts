/**
 * ENTRADA SEPARADA (`@rendra-ui/app/document-viewer`): o `DocumentViewer` fica fora da entrada
 * principal de proposito, porque o arquivo nativo carrega `react-native-webview` (WebView nativo,
 * peer opcional, o mesmo do `RichTextEditor`). Nunca reexporte daqui para `src/index.ts` nem para
 * `src/components/ui/index.ts` (o `verify:pack` barra o WebView fora de
 * `components/ui/document-viewer.js`). O Metro troca `document-viewer.tsx` por
 * `document-viewer.web.tsx` no navegador, e os dois precisam estar no grafo de `tsconfig.lib.json`.
 */
export * from './components/ui/document-viewer'
