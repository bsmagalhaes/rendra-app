import { SafeAreaView } from 'react-native-safe-area-context'
import { ErrorPage } from '../src/components/ui'
import { useBrand } from '../src/brand'
import { useDocumentTitle } from '../src/lib/use-document-title'

/**
 * Rota inexistente. Fica fora do grupo `(shell)`: tela cheia, com o próprio `SafeAreaView` (só o
 * inset superior; o rodapé de ações é da própria tela). O export web grava `404.html` a partir
 * daqui (`seo-build.ts`).
 */
export default function NotFound() {
  const { brand } = useBrand()
  useDocumentTitle(`Página não encontrada · ${brand.productName}`)
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background" testID="safe-area-tela">
      <ErrorPage code={404} fullScreen />
    </SafeAreaView>
  )
}
