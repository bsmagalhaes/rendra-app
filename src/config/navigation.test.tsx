import { getBottomNavItems, getNavigationTargets } from '../components/app-shell/navigation-utils'
import { buildNavigation, exampleUser } from './navigation'

const exampleNavigation = buildNavigation(48)
const itens = exampleNavigation.flatMap((grupo) => grupo.items)
const porTitulo = (titulo: string) => itens.find((i) => i.title === titulo)

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
    // P3.7 (correção D8, mudança de comportamento registrada): Clientes, Cadastros (com os filhos)
    // e Tarefas entram no grupo Geral, na ordem do menu do web.
    expect(getNavigationTargets(exampleNavigation).map((t) => t.to)).toEqual([
      '/',
      '/painel',
      '/clientes',
      '/clientes/novo',
      '/cadastro',
      '/tarefas',
      '/componentes',
      '/tokens',
      '/galeria',
      '/configuracoes',
    ])
  })

  it('tem um usuário de exemplo com nome e e-mail', () => {
    expect(exampleUser).toEqual({ name: 'Ana Ribeiro', email: 'ana@exemplo.com' })
  })

  it('tem Clientes com selo, Cadastros com filhos e Tarefas', () => {
    expect(porTitulo('Clientes')?.to).toBe('/clientes')
    expect(porTitulo('Clientes')?.badge).toBe('48')
    expect(porTitulo('Cadastros')?.children?.map((f) => [f.title, f.to])).toEqual([
      ['Novo cliente', '/clientes/novo'],
      ['Cadastro guiado', '/cadastro'],
    ])
    expect(porTitulo('Tarefas')?.to).toBe('/tarefas')
  })

  it('ainda não mostra Atendimento, Agenda e Funil (dependem da F3)', () => {
    for (const titulo of ['Atendimento', 'Agenda', 'Funil']) expect(porTitulo(titulo)).toBeUndefined()
  })
})

describe('selo de contagem do menu', () => {
  it('acompanha a quantidade de clientes informada', () => {
    const itensCom = (total: number) => buildNavigation(total).flatMap((g) => g.items)
    expect(itensCom(47).find((i) => i.title === 'Clientes')?.badge).toBe('47')
    expect(itensCom(49).find((i) => i.title === 'Clientes')?.badge).toBe('49')
  })
})
