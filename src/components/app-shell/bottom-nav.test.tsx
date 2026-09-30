import { StyleSheet, Text } from 'react-native'
import { fireEvent, render } from '@testing-library/react-native'
import * as SafeAreaContext from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { BrandProvider } from '../../brand/brand-provider'
import { RendraNavigationProvider, type RendraNavigationValue } from '../../navigation/rendra-navigation'
import { IconStub, navComPagina } from '../../test-utils/shell-fixtures'
import { BottomNav } from './bottom-nav'
import { ShellProvider, useShell } from './shell-context'
import type { NavGroup } from './types'

function SondaMenu() {
  const { mobileNavOpen } = useShell()
  return <Text testID="menu-aberto">{String(mobileNavOpen)}</Text>
}

function montar(navegacao: Partial<RendraNavigationValue> = {}, navigation: NavGroup[] = navComPagina) {
  return render(
    <BrandProvider>
      <RendraNavigationProvider value={{ navigate: jest.fn(), currentPath: '/paginas', ...navegacao }}>
        <ShellProvider navigation={navigation}>
          <BottomNav />
          <SondaMenu />
        </ShellProvider>
      </RendraNavigationProvider>
    </BrandProvider>,
  )
}

beforeEach(async () => {
  await AsyncStorage.clear()
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('BottomNav', () => {
  it('é uma navegação chamada "Navegação rápida" com os itens marcados como links', async () => {
    const tela = await montar()
    // Consulta por rótulo: o RNTL só acha por `role` nós acessíveis, e marcar a barra como
    // `accessible` esconderia os links dela dos leitores de tela; o papel é conferido na prop.
    const barra = await tela.findByLabelText('Navegação rápida')
    expect(barra.props.role).toBe('navigation')
    expect(await tela.findByRole('link', { name: 'Início' })).toBeTruthy()
    expect(await tela.findByRole('link', { name: 'Páginas' })).toBeTruthy()
    expect(tela.queryByRole('link', { name: 'Tokens' })).toBeNull()
  })

  it('marca só o destino ativo como selecionado (e o pai quando o ativo é um filho)', async () => {
    const tela = await montar({ currentPath: '/paginas/acoes' })
    const paginas = await tela.findByRole('link', { name: 'Páginas' })
    const inicio = await tela.findByRole('link', { name: 'Início' })
    expect(paginas.props.accessibilityState).toMatchObject({ selected: true })
    expect(inicio.props.accessibilityState).toMatchObject({ selected: false })
  })

  it('tocar num item navega para a rota dele', async () => {
    const navigate = jest.fn()
    const tela = await montar({ navigate })
    await fireEvent.press(await tela.findByRole('link', { name: 'Início' }))
    expect(navigate).toHaveBeenCalledWith('/')
  })

  it('o botão central "Abrir menu" abre o menu do mesmo shell', async () => {
    const tela = await montar()
    expect((await tela.findByTestId('menu-aberto')).props.children).toBe('false')
    await fireEvent.press(await tela.findByRole('button', { name: 'Abrir menu' }))
    expect((await tela.findByTestId('menu-aberto')).props.children).toBe('true')
  })

  it('usa shortTitle como rótulo e cai no primeiro filho quando o item não tem rota', async () => {
    const navigate = jest.fn()
    const menu: NavGroup[] = [
      {
        title: 'G',
        items: [
          { title: 'Configurações do sistema', shortTitle: 'Ajustes', icon: IconStub, bottomNav: true, children: [{ title: 'Marca', to: '/marca' }] },
        ],
      },
    ]
    const tela = await montar({ navigate, currentPath: '/marca' }, menu)
    const ajustes = await tela.findByRole('link', { name: 'Ajustes' })
    expect(ajustes.props.accessibilityState).toMatchObject({ selected: true })
    await fireEvent.press(ajustes)
    expect(navigate).toHaveBeenCalledWith('/marca')
  })

  it('a barra é dona do inset inferior: paddingBottom igual a insets.bottom', async () => {
    jest.spyOn(SafeAreaContext, 'useSafeAreaInsets').mockReturnValue({ top: 0, bottom: 34, left: 0, right: 0 })
    const tela = await montar()
    const barra = await tela.findByLabelText('Navegação rápida')
    expect(StyleSheet.flatten(barra.props.style)).toMatchObject({ paddingBottom: 34 })
  })

  it('os dois estados de cor do item existem sempre (sem classe que aparece só depois)', async () => {
    const tela = await montar()
    const ativo = await tela.findByText('Páginas')
    const inativo = await tela.findByText('Início')
    expect(ativo.props.className.split(' ')).toContain('text-primary-text')
    expect(inativo.props.className.split(' ')).toContain('text-muted-foreground')
  })
})
