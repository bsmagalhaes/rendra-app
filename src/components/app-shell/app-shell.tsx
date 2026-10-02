import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { KeyboardAvoidingView, Platform, View } from 'react-native'
import { BottomSheet } from '../internal/bottom-sheet'
import { useRendraNavigation } from '../../navigation/rendra-navigation'
import { BottomNav } from './bottom-nav'
import { Header } from './header'
import { NavDrawer, NavMenuList } from './nav-drawer'
import { ShellProvider, useShell } from './shell-context'
import type { ShellProviderProps } from './shell-context'

export interface AppShellProps extends Omit<ShellProviderProps, 'children'> {
  children: ReactNode
}

function ShellFrame({ children }: { children: ReactNode }) {
  const { layout, hydrated, navigation, mobileNavOpen, setMobileNavOpen } = useShell()
  const { currentPath } = useRendraNavigation()

  // A gaveta (ou a folha) fecha sozinha quando a rota muda, como no web.
  useEffect(() => {
    setMobileNavOpen(false)
  }, [currentPath, setMobileNavOpen])

  return (
    <View className="flex-1 bg-background">
      <Header />
      {/* Área da tela: sem rolagem própria, cada tela mantém a sua (`ScrollView`/`FlatList`). */}
      {/* Android (edge-to-edge, RN 0.81+): a janela nao redimensiona com o teclado, entao ele cobriria o campo e a
          rolagem nao ganharia area. O padding encolhe a area da tela e a barra inferior sobe junto. No iOS e no web
          nada muda: as telas com campo ja tratam o teclado e compensar de novo dobraria o espaco. */}
      <KeyboardAvoidingView testID="shell-teclado" behavior={Platform.OS === 'android' ? 'padding' : undefined} className="flex-1">
        <View className="flex-1">{children}</View>
        {hydrated && layout.bottomNav ? <BottomNav /> : null}
      </KeyboardAvoidingView>
      {layout.menu === 'drawer' ? (
        <NavDrawer open={mobileNavOpen} onOpenChange={setMobileNavOpen} navigation={navigation} />
      ) : (
        <BottomSheet
          open={mobileNavOpen}
          onOpenChange={setMobileNavOpen}
          accessibilityLabel="Menu"
          testID="nav-sheet"
          contentContainerClassName="p-2"
        >
          <NavMenuList navigation={navigation} on="surface" onNavigate={() => setMobileNavOpen(false)} />
        </BottomSheet>
      )}
    </View>
  )
}

/**
 * Estrutura de navegação do app: cabeçalho, área da tela, barra inferior e menu (gaveta ou
 * folha). Só `navigation` é obrigatório. Nunca importa o roteador: usa `useRendraNavigation()`,
 * então funciona com o Expo Router (via `RendraRouterBridge`) ou com um provider próprio.
 */
export function AppShell({ children, ...props }: AppShellProps) {
  return (
    <ShellProvider {...props}>
      <ShellFrame>{children}</ShellFrame>
    </ShellProvider>
  )
}
