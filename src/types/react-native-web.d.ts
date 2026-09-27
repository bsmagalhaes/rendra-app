// Correção de execução da Tarefa F3: `tabIndex` já é encaminhado pelo `View`/`ScrollView` do
// react-native-web até o elemento DOM
// (react-native-web/src/modules/forwardedProps), mas nenhuma tipagem de `react-native`/`expo`
// declara essa prop em `ViewProps` (só em `TextProps`, ver node_modules/expo/types/react-native-web.d.ts).
// `ScrollViewProps` estende `ViewProps` (node_modules/react-native/Libraries/Components/ScrollView/ScrollView.d.ts),
// então esta única declaração cobre `View` e `ScrollView`. Necessário para corrigir uma violação
// real do axe (regra scrollable-region-focusable): uma região rolável sem nenhum conteúdo focável
// dentro precisa ser focável ela mesma via teclado.
import 'react-native'

declare module 'react-native' {
  interface ViewProps {
    /** @platform web */
    tabIndex?: number
  }
}
