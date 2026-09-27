import { act, fireEvent, render, waitFor } from '@testing-library/react-native'
import { AccessibilityInfo, StyleSheet } from 'react-native'
import * as SafeAreaContext from 'react-native-safe-area-context'
import { BrandProvider } from '../../brand'
import { toast, Toaster } from './toast'

describe('Toast e Toaster', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    toast.dismiss()
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('toast.success mostra o titulo no Toaster', async () => {
    const { findByText } = await render(
      <BrandProvider>
        <Toaster />
      </BrandProvider>,
    )
    await act(async () => {
      toast.success('Um')
    })
    expect(await findByText('Um')).toBeTruthy()
  })

  // B5 (veredito do Opus): o BrandProvider sempre renderiza uma View raiz (a árvore nunca fica
  // null), então toJSON() nunca é null; a asserção correta é a ausência do host do Toaster.
  it('sem fila, o Toaster nao renderiza o host', async () => {
    const { queryByTestId } = await render(
      <BrandProvider>
        <Toaster />
      </BrandProvider>,
    )
    expect(queryByTestId('toast-host')).toBeNull()
  })

  it('o quarto toast remove o primeiro (so 3 visiveis)', async () => {
    const { findByText, queryByText } = await render(
      <BrandProvider>
        <Toaster />
      </BrandProvider>,
    )
    await act(async () => {
      toast.info('Um')
      toast.info('Dois')
      toast.info('Tres')
      toast.info('Quatro')
    })
    expect(queryByText('Um')).toBeNull()
    expect(await findByText('Quatro')).toBeTruthy()
  })

  it('some aos 4000ms por padrao, e aos 8000ms para error', async () => {
    const { findByText, queryByText } = await render(
      <BrandProvider>
        <Toaster />
      </BrandProvider>,
    )
    await act(async () => {
      toast.success('Sucesso')
      toast.error('Erro')
    })
    await act(async () => {
      jest.advanceTimersByTime(4000)
    })
    expect(queryByText('Sucesso')).toBeNull()
    expect(await findByText('Erro')).toBeTruthy()
    await act(async () => {
      jest.advanceTimersByTime(4000)
    })
    expect(queryByText('Erro')).toBeNull()
  })

  it('duration explicito sobrescreve o padrao', async () => {
    const { queryByText } = await render(
      <BrandProvider>
        <Toaster />
      </BrandProvider>,
    )
    await act(async () => {
      toast.info('Custom', { duration: 1000 })
    })
    await act(async () => {
      jest.advanceTimersByTime(1000)
    })
    expect(queryByText('Custom')).toBeNull()
  })

  it('dismiss(id) remove um; dismiss() remove todos', async () => {
    const { findByText, queryByText } = await render(
      <BrandProvider>
        <Toaster />
      </BrandProvider>,
    )
    let id = ''
    await act(async () => {
      id = toast.info('Um')
      toast.info('Dois')
    })
    await act(async () => {
      toast.dismiss(id)
    })
    expect(queryByText('Um')).toBeNull()
    expect(await findByText('Dois')).toBeTruthy()
    await act(async () => {
      toast.dismiss()
    })
    expect(queryByText('Dois')).toBeNull()
  })

  it('action.onPress executa e o cartao some', async () => {
    const onPress = jest.fn()
    const { findByText, queryByText } = await render(
      <BrandProvider>
        <Toaster />
      </BrandProvider>,
    )
    await act(async () => {
      toast.info('Com acao', { action: { label: 'Desfazer', onPress } })
    })
    await fireEvent.press(await findByText('Desfazer'))
    await waitFor(() => expect(onPress).toHaveBeenCalled())
    expect(queryByText('Com acao')).toBeNull()
  })

  // C8 (veredito do Opus): o caso original só afirmava o error; ampliado para conferir também o
  // info (role status, live region polite).
  it('error tem accessibilityRole alert/assertive; info tem role status/polite', async () => {
    const { findByTestId } = await render(
      <BrandProvider>
        <Toaster />
      </BrandProvider>,
    )
    let idErro = ''
    let idInfo = ''
    await act(async () => {
      idErro = toast.error('Falhou')
      idInfo = toast.info('Aviso')
    })
    const cartaoErro = await findByTestId(`toast-${idErro}`)
    expect(cartaoErro.props.accessibilityRole).toBe('alert')
    expect(cartaoErro.props.accessibilityLiveRegion).toBe('assertive')
    const cartaoInfo = await findByTestId(`toast-${idInfo}`)
    expect(cartaoInfo.props.role).toBe('status')
    expect(cartaoInfo.props.accessibilityLiveRegion).toBe('polite')
  })

  it('anuncia o titulo com AccessibilityInfo.announceForAccessibility', async () => {
    const spy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility')
    const { findByText } = await render(
      <BrandProvider>
        <Toaster />
      </BrandProvider>,
    )
    await act(async () => {
      toast.info('Anunciado')
    })
    await findByText('Anunciado')
    expect(spy).toHaveBeenCalledWith('Anunciado')
  })

  // C7 (veredito do Opus): className + style pode chegar como array; StyleSheet.flatten
  // normaliza (mesmo padrão de action-bar.test.tsx:77-98). Casos com bottom 34 e bottom 0.
  it('paddingBottom usa o inset inferior, no minimo 16', async () => {
    jest.spyOn(SafeAreaContext, 'useSafeAreaInsets').mockReturnValue({ top: 0, bottom: 34, left: 0, right: 0 })
    const { findByTestId } = await render(
      <BrandProvider>
        <Toaster />
      </BrandProvider>,
    )
    await act(async () => {
      toast.info('Com inset')
    })
    const host = await findByTestId('toast-host')
    expect(StyleSheet.flatten(host.props.style)).toMatchObject({ paddingBottom: 34 })
  })

  it('paddingBottom fica no minimo 16 quando o inset inferior e 0', async () => {
    jest.spyOn(SafeAreaContext, 'useSafeAreaInsets').mockReturnValue({ top: 0, bottom: 0, left: 0, right: 0 })
    const { findByTestId } = await render(
      <BrandProvider>
        <Toaster />
      </BrandProvider>,
    )
    await act(async () => {
      toast.info('Sem inset')
    })
    const host = await findByTestId('toast-host')
    expect(StyleSheet.flatten(host.props.style)).toMatchObject({ paddingBottom: 16 })
  })
})
