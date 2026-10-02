import { Stack, useRouter } from 'expo-router'
import { AppShell } from '../../src/components/app-shell'
import { buildNavigation, exampleUser } from '../../src/config/navigation'
import { useClientes } from '../../src/demo/clients-store'
import { useNaoLidas } from '../../src/demo/tickets-store'

/**
 * Rotas com o AppShell (cabeçalho, barra inferior e menu). O grupo entre parênteses não entra na
 * URL: `/componentes`, `/tokens` e `/galeria` continuam nos mesmos endereços. Home, login e
 * `+not-found` ficam fora do grupo, em tela cheia. "Sair" no menu do usuário volta ao login (o
 * `router.replace` vem do `expo-router` porque `useRendraNavigation` não tem `replace`).
 */
export default function ShellLayout() {
  const router = useRouter()
  const total = useClientes().length
  const naoLidas = useNaoLidas()
  return (
    <AppShell navigation={buildNavigation(total, naoLidas)} user={exampleUser} onLogout={() => router.replace('/login')}>
      <Stack screenOptions={{ headerShown: false }} />
    </AppShell>
  )
}
