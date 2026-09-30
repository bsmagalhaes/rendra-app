import { createContext, useContext, type ComponentType, type ReactNode } from 'react'

export interface RendraLinkProps {
  href: string
  asChild?: boolean
  children?: ReactNode
}

export interface RendraNavigationValue {
  navigate: (href: string) => void
  /** Volta uma tela no histórico (campo aditivo da 1.1.0). */
  goBack?: () => void
  /** Diz se há para onde voltar; sem provider responde `false`. */
  canGoBack?: () => boolean
  currentPath?: string
  searchParams?: Record<string, string | undefined>
  linkComponent?: ComponentType<RendraLinkProps>
}

const RendraNavigationContext = createContext<RendraNavigationValue | undefined>(undefined)

function navigateSemProvider(): never {
  throw new Error(
    'Envolva o app com <RendraRouterBridge> de @rendra-ui/app/router-bridge, ou forneça um RendraNavigationProvider.',
  )
}

export function RendraNavigationProvider({
  value,
  children,
}: {
  value: RendraNavigationValue
  children: ReactNode
}) {
  return <RendraNavigationContext.Provider value={value}>{children}</RendraNavigationContext.Provider>
}

export function useRendraNavigation(): RendraNavigationValue {
  const contexto = useContext(RendraNavigationContext)
  if (contexto) return contexto
  return {
    navigate: navigateSemProvider,
    goBack: navigateSemProvider,
    canGoBack: () => false,
    currentPath: undefined,
    searchParams: undefined,
    linkComponent: undefined,
  }
}
