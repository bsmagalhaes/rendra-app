import { getBackTarget, getBottomNavItems, getNavigationTargets, resolveActiveTo } from './navigation-utils'
import { IconStub, navComPagina } from '../../test-utils/shell-fixtures'
import type { NavGroup } from './types'

describe('getBottomNavItems', () => {
  it('traz só os itens marcados, na ordem do menu', () => {
    expect(getBottomNavItems(navComPagina).map((i) => i.title)).toEqual(['Início', 'Páginas'])
  })

  it('limita a 4 itens mesmo com mais marcados', () => {
    const muitos: NavGroup[] = [
      {
        title: 'G',
        items: ['A', 'B', 'C', 'D', 'E'].map((title) => ({ title, to: `/${title}`, icon: IconStub, bottomNav: true })),
      },
    ]
    expect(getBottomNavItems(muitos).map((i) => i.title)).toEqual(['A', 'B', 'C', 'D'])
  })
})

describe('getNavigationTargets', () => {
  it('achata itens com rota e filhos, com o grupo de cada um', () => {
    const alvos = getNavigationTargets(navComPagina)
    expect(alvos.map((a) => [a.title, a.to, a.group])).toEqual([
      ['Início', '/', 'Geral'],
      ['Páginas', '/paginas', 'Geral'],
      ['Ações', '/paginas/acoes', 'Páginas'],
      ['Tokens', '/tokens', 'Geral'],
    ])
  })

  it('ignora item sem rota, mantendo os filhos', () => {
    const semRota: NavGroup[] = [
      { title: 'G', items: [{ title: 'Pai', icon: IconStub, children: [{ title: 'Filho', to: '/filho' }] }] },
    ]
    expect(getNavigationTargets(semRota).map((a) => a.to)).toEqual(['/filho'])
  })
})

describe('resolveActiveTo', () => {
  const alvos = getNavigationTargets(navComPagina)

  it('prefere o destino mais específico', () => {
    expect(resolveActiveTo(alvos, '/paginas/acoes')).toBe('/paginas/acoes')
    expect(resolveActiveTo(alvos, '/paginas/outra')).toBe('/paginas')
  })

  it('a raiz só combina com a raiz', () => {
    expect(resolveActiveTo(alvos, '/')).toBe('/')
    expect(resolveActiveTo(alvos, '/outra')).toBeNull()
  })

  it('não confunde prefixo de texto com prefixo de caminho', () => {
    expect(resolveActiveTo(alvos, '/paginasx')).toBeNull()
  })
})

describe('getBackTarget', () => {
  it('em rota filha devolve o item pai', () => {
    expect(getBackTarget(navComPagina, '/paginas/acoes')).toEqual({ title: 'Páginas', to: '/paginas' })
  })

  it('em subrota de item de primeiro nível devolve esse item', () => {
    expect(getBackTarget(navComPagina, '/tokens/sub')).toEqual({ title: 'Tokens', to: '/tokens' })
  })

  it('no destino de primeiro nível não há para onde voltar', () => {
    expect(getBackTarget(navComPagina, '/paginas')).toBeNull()
    expect(getBackTarget(navComPagina, '/')).toBeNull()
  })

  it('sem destino ativo devolve nulo', () => {
    expect(getBackTarget(navComPagina, '/outra')).toBeNull()
  })

  it('filho de item sem rota própria não tem para onde voltar', () => {
    const semRota: NavGroup[] = [
      { title: 'G', items: [{ title: 'Pai', icon: IconStub, children: [{ title: 'Filho', to: '/filho' }] }] },
    ]
    expect(getBackTarget(semRota, '/filho')).toBeNull()
  })
})
