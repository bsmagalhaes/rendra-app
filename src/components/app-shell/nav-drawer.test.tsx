import { BackHandler, StyleSheet } from 'react-native'
import { act, fireEvent, render, waitFor } from '@testing-library/react-native'
import { fireGestureHandler, getByGestureTestId } from 'react-native-gesture-handler/jest-utils'
import * as SafeAreaContext from 'react-native-safe-area-context'
import { BrandProvider } from '../../brand/brand-provider'
import { RendraNavigationProvider, type RendraNavigationValue } from '../../navigation/rendra-navigation'
import { navComPagina } from '../../test-utils/shell-fixtures'
import { NavDrawer, navDrawerTranslateX } from './nav-drawer'

function montar(
  props: { open?: boolean; onOpenChange?: (open: boolean) => void } = {},
  navegacao: Partial<RendraNavigationValue> = {},
) {
  return render(
    <BrandProvider>
      <RendraNavigationProvider value={{ navigate: jest.fn(), currentPath: '/', ...navegacao }}>
        <NavDrawer
          open={props.open ?? true}
          onOpenChange={props.onOpenChange ?? (() => {})}
          navigation={navComPagina}
        />
      </RendraNavigationProvider>
    </BrandProvider>,
  )
}

afterEach(() => {
  jest.restoreAllMocks()
})

describe('navDrawerTranslateX', () => {
  it('fechada fica fora da tela, à esquerda (-largura)', () => {
    expect(navDrawerTranslateX('closed', 312)).toBe(-312)
  })
  it('assentada fica em 0', () => {
    expect(navDrawerTranslateX('settled', 312)).toBe(0)
  })
})

describe('NavDrawer', () => {
  it('fechada não renderiza o menu', async () => {
    const tela = await montar({ open: false })
    expect(tela.queryByText('Tokens')).toBeNull()
  })

  it('aberta, é um diálogo "Menu" modal com a navegação principal e os grupos', async () => {
    const tela = await montar()
    const dialogo = await tela.findByLabelText('Menu')
    expect(dialogo.props.role).toBe('dialog')
    expect(dialogo.props.accessibilityViewIsModal).toBe(true)
    const nav = await tela.findByLabelText('Navegação principal')
    expect(nav.props.role).toBe('navigation')
    expect(await tela.findByText('Geral')).toBeTruthy()
    expect(await tela.findByRole('link', { name: 'Tokens' })).toBeTruthy()
  })

  it('tocar num item navega e fecha a gaveta', async () => {
    const navigate = jest.fn()
    const onOpenChange = jest.fn()
    const tela = await montar({ onOpenChange }, { navigate })
    await fireEvent.press(await tela.findByRole('link', { name: 'Páginas' }))
    expect(navigate).toHaveBeenCalledWith('/paginas')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('marca o destino ativo e mostra os filhos sempre abertos, sem chevron', async () => {
    const tela = await montar({}, { currentPath: '/paginas/acoes' })
    const filho = await tela.findByRole('link', { name: 'Ações' })
    expect(filho.props.accessibilityState).toMatchObject({ selected: true })
    const pai = await tela.findByRole('link', { name: 'Páginas' })
    expect(pai.props.accessibilityState).toMatchObject({ selected: false })
    expect(tela.queryByTestId('nav-chevron')).toBeNull()
  })

  it('o item ativo e o inativo declaram os dois estados de fundo (sem classe que só aparece depois)', async () => {
    const tela = await montar({}, { currentPath: '/tokens' })
    const ativo = await tela.findByRole('link', { name: 'Tokens' })
    const inativo = await tela.findByRole('link', { name: 'Início' })
    expect(ativo.props.className.split(' ')).toContain('bg-sidebar-active')
    expect(inativo.props.className.split(' ')).toContain('bg-transparent')
  })

  it('o botão "Fechar menu" e a área escura fecham', async () => {
    const onOpenChange = jest.fn()
    const tela = await montar({ onOpenChange })
    await fireEvent.press(await tela.findByLabelText('Fechar menu'))
    await fireEvent.press(await tela.findByLabelText('Fechar'))
    expect(onOpenChange).toHaveBeenNthCalledWith(1, false)
    expect(onOpenChange).toHaveBeenNthCalledWith(2, false)
  })

  it('o botão voltar do Android fecha e consome o evento', async () => {
    const onOpenChange = jest.fn()
    let voltar: () => boolean = () => false
    jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_evento, handler) => {
      voltar = handler as () => boolean
      return { remove: jest.fn() }
    })
    await montar({ onOpenChange })
    let consumido = false
    await act(async () => {
      consumido = voltar()
    })
    expect(consumido).toBe(true)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('arrastar para a esquerda além do limiar fecha', async () => {
    const onOpenChange = jest.fn()
    await montar({ onOpenChange })
    const gesto = getByGestureTestId('nav-drawer-arraste')
    fireGestureHandler(gesto, [{ translationX: 0 }, { translationX: -120 }, { state: 5, translationX: -140 }])
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })

  it('arrastar pouco não fecha', async () => {
    const onOpenChange = jest.fn()
    await montar({ onOpenChange })
    const gesto = getByGestureTestId('nav-drawer-arraste')
    fireGestureHandler(gesto, [{ translationX: 0 }, { translationX: -30 }, { state: 5, translationX: -40 }])
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('o painel respeita a área segura: paddingTop e paddingBottom dos insets', async () => {
    jest.spyOn(SafeAreaContext, 'useSafeAreaInsets').mockReturnValue({ top: 24, bottom: 34, left: 0, right: 0 })
    const tela = await montar()
    const painel = await tela.findByTestId('nav-drawer-painel')
    expect(StyleSheet.flatten(painel.props.style)).toMatchObject({ paddingTop: 24, paddingBottom: 34 })
  })
})
