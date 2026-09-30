import { Platform, Pressable } from 'react-native'
import type { ReactNode } from 'react'
import { useRendraNavigation } from '../../navigation/rendra-navigation'

export interface ShellLinkProps {
  to: string
  active: boolean
  className?: string
  /** Chamado ao tocar, depois de navegar (a gaveta usa para fechar). */
  onNavigate?: () => void
  children: ReactNode
}

/**
 * Link de navegação do shell. Com `linkComponent` (Expo Router) vira `<a href>` no export web;
 * sem ele, um `Pressable role="link"` que chama `navigate`. O destino ativo vai como
 * `aria-current="page"` no web (`aria-selected` não é permitido em `<a>`, axe `aria-allowed-attr`)
 * e como `accessibilityState.selected` no nativo.
 */
export function ShellLink({ to, active, className, onNavigate, children }: ShellLinkProps) {
  const { navigate, linkComponent: LinkComponent } = useRendraNavigation()
  const estado =
    Platform.OS === 'web'
      ? { 'aria-current': active ? ('page' as const) : undefined }
      : { accessibilityState: { selected: active } }

  const pressable = (
    <Pressable
      accessibilityRole="link"
      className={className}
      {...estado}
      onPress={
        LinkComponent
          ? onNavigate
          : () => {
              navigate(to)
              onNavigate?.()
            }
      }
    >
      {children}
    </Pressable>
  )

  return LinkComponent ? (
    <LinkComponent href={to} asChild>
      {pressable}
    </LinkComponent>
  ) : (
    pressable
  )
}
