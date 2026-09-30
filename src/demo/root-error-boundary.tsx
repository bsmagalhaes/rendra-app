import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { BrandProvider } from '../brand'
import { brandConfigs } from '../brand/brand.config'
import { ErrorPage } from '../components/ui'
import { RendraRouterBridge } from '../router-bridge'

/**
 * `ErrorBoundary` do layout raiz (recurso do Expo Router): quando uma rota quebra, o roteador
 * troca a árvore do layout raiz por este componente, então ele traz os próprios provedores
 * (área segura, marca e ponte de navegação) para a `ErrorPage` (que usa `useRendraNavigation`)
 * sair com o tema e com os botões funcionando. Fica em `src/demo` porque um arquivo em `app/`
 * viraria rota. O `retry` que o roteador entrega não tem onde entrar na `ErrorPage` (ela não
 * tem essa prop): "Ir para o início" navega para `/`, o que monta a árvore de novo.
 */
export function RootErrorBoundary() {
  return (
    <SafeAreaProvider>
      <BrandProvider brands={brandConfigs}>
        <RendraRouterBridge>
          <SafeAreaView edges={['top']} className="flex-1 bg-background" testID="safe-area-tela">
            <ErrorPage code={500} fullScreen />
          </SafeAreaView>
        </RendraRouterBridge>
      </BrandProvider>
    </SafeAreaProvider>
  )
}
