import { useMemo, type ReactNode } from 'react'
import { Link, useGlobalSearchParams, usePathname, useRouter } from 'expo-router'
import { RendraNavigationProvider, type RendraNavigationValue } from './navigation/rendra-navigation'

/**
 * Único ponto de `src/` que importa `expo-router` (fora de testes), pensado para entrar só pelo
 * subcaminho `./router-bridge` do pacote publicado, nunca pela entrada principal. Alimenta o
 * `RendraNavigationProvider` com o roteador real do app: `navigate` empurra rota, `currentPath`
 * e `searchParams` vêm do Expo Router, e `linkComponent` é o `Link` do Expo Router (preserva o
 * `<a href>` no export web, em vez de um `Pressable role="link"`).
 */
export function RendraRouterBridge({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useGlobalSearchParams<Record<string, string>>()

  // M4 (veredito Fable, Blocos 1 e 2): sem `useMemo`, este objeto era recriado a cada render do
  // bridge, fazendo todo consumidor de `useRendraNavigation` (cada item de `List`,
  // `ModelCodeFromUrl`) rerenderizar mesmo quando rota e parâmetros não mudam.
  // `useGlobalSearchParams`/`usePathname` vêm de `useSyncExternalStore` (expo-router,
  // `useRouteInfo`), que devolve a mesma referência enquanto a rota não muda, então
  // `searchParams` como dependência funciona (não é um objeto novo a cada render).
  const value = useMemo<RendraNavigationValue>(
    () => ({
      navigate: (href: string) => router.push(href),
      goBack: () => router.back(),
      canGoBack: () => router.canGoBack(),
      currentPath: pathname,
      searchParams: searchParams as Record<string, string | undefined>,
      linkComponent: Link,
    }),
    [router, pathname, searchParams],
  )

  return <RendraNavigationProvider value={value}>{children}</RendraNavigationProvider>
}

export { ModelCodeFromUrl } from './brand/model-code-from-url'
