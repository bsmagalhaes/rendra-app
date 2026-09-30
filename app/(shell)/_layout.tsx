import { Stack } from 'expo-router'
import { AppShell } from '../../src/components/app-shell'
import { exampleNavigation, exampleUser } from '../../src/config/navigation'

/**
 * Rotas com o AppShell (cabeçalho, barra inferior e menu). O grupo entre parênteses não entra na
 * URL: `/componentes`, `/tokens` e `/galeria` continuam nos mesmos endereços. Home, login e
 * `+not-found` ficam fora do grupo, em tela cheia.
 */
export default function ShellLayout() {
  return (
    <AppShell navigation={exampleNavigation} user={exampleUser}>
      <Stack screenOptions={{ headerShown: false }} />
    </AppShell>
  )
}
