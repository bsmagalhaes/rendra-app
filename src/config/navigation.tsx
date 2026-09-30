import { Blocks, House, Images, LayoutDashboard, Palette, Settings } from 'lucide-react-native'
import type { NavGroup, ShellUser } from '../components/app-shell/types'

/**
 * Menu e usuário de exemplo da vitrine (mesmo papel de `brand.config.ts`): ficam em `src/config`
 * e NÃO são exportados por `src/index.ts`. Quem instala o pacote escreve o próprio menu.
 * Painel, Componentes, Galeria e Configurações aparecem na barra inferior (no máximo 4).
 */
export const exampleNavigation: NavGroup[] = [
  {
    title: 'Geral',
    items: [
      { title: 'Início', to: '/', icon: House },
      { title: 'Painel', to: '/painel', icon: LayoutDashboard, bottomNav: true },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { title: 'Componentes', to: '/componentes', icon: Blocks, bottomNav: true, shortTitle: 'Vitrine' },
      { title: 'Tokens', to: '/tokens', icon: Palette },
      { title: 'Galeria', to: '/galeria', icon: Images, bottomNav: true },
      { title: 'Configurações', to: '/configuracoes', icon: Settings, bottomNav: true, shortTitle: 'Ajustes' },
    ],
  },
]

export const exampleUser: ShellUser = { name: 'Ana Ribeiro', email: 'ana@exemplo.com' }
