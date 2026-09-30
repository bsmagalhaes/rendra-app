import { Blocks, House, Images, LayoutDashboard, ListChecks, Palette, Settings, UserPlus, Users } from 'lucide-react-native'
import type { NavGroup, ShellUser } from '../components/app-shell/types'

/**
 * Menu e usuário de exemplo da vitrine (mesmo papel de `brand.config.ts`): ficam em `src/config`
 * e NÃO são exportados por `src/index.ts`. Quem instala o pacote escreve o próprio menu.
 * Painel, Componentes, Galeria e Configurações aparecem na barra inferior (no máximo 4). Clientes,
 * Cadastros e Tarefas são as telas de exemplo da demonstração (mocks em `src/mocks`); Atendimento,
 * Agenda e Funil entram com a F3. O selo de Clientes leva o total da carteira visível, que muda
 * com a exclusão e o cadastro da demonstração (o layout do shell chama `buildNavigation` com `useClientes`).
 */
export function buildNavigation(totalClientes: number): NavGroup[] {
  return [
    {
      title: 'Geral',
      items: [
        { title: 'Início', to: '/', icon: House },
        { title: 'Painel', to: '/painel', icon: LayoutDashboard, bottomNav: true },
        { title: 'Clientes', to: '/clientes', icon: Users, badge: String(totalClientes) },
        {
          title: 'Cadastros',
          icon: UserPlus,
          children: [
            { title: 'Novo cliente', to: '/clientes/novo' },
            { title: 'Cadastro guiado', to: '/cadastro' },
          ],
        },
        { title: 'Tarefas', to: '/tarefas', icon: ListChecks },
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
}

export const exampleUser: ShellUser = { name: 'Ana Ribeiro', email: 'ana@exemplo.com' }
