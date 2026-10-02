/**
 * ENTRADA SEPARADA (`@rendra-ui/app/rich-text-editor`): o `RichTextEditor` fica fora da entrada
 * principal de proposito, porque o arquivo nativo carrega `@10play/tentap-editor` e
 * `react-native-webview` (WebView nativo, peer opcional). Nunca reexporte daqui para
 * `src/index.ts` nem para `src/components/ui/index.ts` (o `verify:pack` barra os dois fora de
 * `components/ui/rich-text-editor.js`). O Metro troca `rich-text-editor.tsx` por
 * `rich-text-editor.web.tsx` no navegador, e os dois precisam estar no grafo de `tsconfig.lib.json`.
 */
export * from './components/ui/rich-text-editor'
