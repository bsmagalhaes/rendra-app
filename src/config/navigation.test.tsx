import { getBottomNavItems, getNavigationTargets } from '../components/app-shell/navigation-utils'
import { exampleNavigation, exampleUser } from './navigation'

describe('menu de exemplo da vitrine', () => {
  it('põe 4 itens na barra inferior: Painel, Componentes, Galeria e Configurações', () => {
    expect(getBottomNavItems(exampleNavigation).map((i) => i.title)).toEqual([
      'Painel',
      'Componentes',
      'Galeria',
      'Configurações',
    ])
  })

  it('leva às rotas da vitrine, com a raiz para o início', () => {
    expect(getNavigationTargets(exampleNavigation).map((t) => t.to)).toEqual([
      '/',
      '/painel',
      '/componentes',
      '/tokens',
      '/galeria',
      '/configuracoes',
    ])
  })

  it('tem um usuário de exemplo com nome e e-mail', () => {
    expect(exampleUser).toEqual({ name: 'Ana Ribeiro', email: 'ana@exemplo.com' })
  })
})
