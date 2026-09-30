import type { NavGroup } from '../components/app-shell/types'

export function IconStub(): null {
  return null
}

/** Menu de teste do AppShell: dois itens na barra inferior, um deles com submenu, e um só na gaveta. */
export const navComPagina: NavGroup[] = [
  {
    title: 'Geral',
    items: [
      { title: 'Início', to: '/', icon: IconStub, bottomNav: true },
      {
        title: 'Páginas',
        to: '/paginas',
        icon: IconStub,
        bottomNav: true,
        children: [{ title: 'Ações', to: '/paginas/acoes' }],
      },
      { title: 'Tokens', to: '/tokens', icon: IconStub },
    ],
  },
]
