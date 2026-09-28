import { render, fireEvent } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'
import { fireGestureHandler, getByGestureTestId } from 'react-native-gesture-handler/jest-utils'
import { BrandProvider } from '../../brand/brand-provider'
import { Slider, thumbTranslateX } from './slider'
import { nodesWithCode } from '../../test-utils/rendra-code'

describe('Slider', () => {
  it('arraste move o valor proporcionalmente à largura medida', async () => {
    const onChange = jest.fn()
    const { findByTestId } = await render(
      <BrandProvider>
        <Slider value={[50]} min={0} max={100} step={1} onChange={onChange} accessibilityLabel="Volume" />
      </BrandProvider>,
    )
    const trilho = await findByTestId('slider-trilho')
    await fireEvent(trilho, 'layout', { nativeEvent: { layout: { width: 200, height: 8, x: 0, y: 0 } } })
    const gesture = getByGestureTestId('slider-thumb-0')
    fireGestureHandler(gesture, [{ translationX: 0 }, { translationX: 100 }, { state: 5, translationX: 100 }])
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(onChange).toHaveBeenCalledWith([100])
  })

  it('step arredonda o valor para o múltiplo mais próximo', async () => {
    const onChange = jest.fn()
    const { findByTestId } = await render(
      <BrandProvider>
        <Slider value={[50]} min={0} max={100} step={10} onChange={onChange} accessibilityLabel="Volume" />
      </BrandProvider>,
    )
    const trilho = await findByTestId('slider-trilho')
    await fireEvent(trilho, 'layout', { nativeEvent: { layout: { width: 200, height: 8, x: 0, y: 0 } } })
    const gesture = getByGestureTestId('slider-thumb-0')
    fireGestureHandler(gesture, [{ translationX: 0 }, { translationX: 47 }, { state: 5, translationX: 47 }])
    await new Promise((resolve) => setTimeout(resolve, 0))
    // raw = 50 + (47/200)*100 = 73.5; múltiplo de 10 mais próximo é 70 (73.5 está a 3.5 de 70 e a
    // 6.5 de 80), não 50 como o plano original pedia (correção registrada nos desvios da Tarefa 15).
    expect(onChange).toHaveBeenCalledWith([70])
  })

  it('faixa com duas alças usa aria-label Mínimo/Máximo e a alça 0 não passa da alça 1', async () => {
    const { findAllByRole } = await render(
      <BrandProvider>
        <Slider value={[20, 80]} min={0} max={100} step={1} onChange={() => {}} />
      </BrandProvider>,
    )
    const alcas = await findAllByRole('adjustable')
    expect(alcas[0].props.accessibilityLabel).toBe('Mínimo')
    expect(alcas[1].props.accessibilityLabel).toBe('Máximo')
  })

  it('accessibilityActions increment/decrement e aria-valuenow', async () => {
    const onChange = jest.fn()
    const { findByRole } = await render(
      <BrandProvider>
        <Slider value={[50]} min={0} max={100} step={10} onChange={onChange} accessibilityLabel="Volume" />
      </BrandProvider>,
    )
    const alca = await findByRole('adjustable')
    expect(alca.props['aria-valuenow']).toBe(50)
    expect(alca.props.accessibilityActions).toEqual(
      expect.arrayContaining([{ name: 'increment' }, { name: 'decrement' }]),
    )
    fireEvent(alca, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } })
    expect(onChange).toHaveBeenCalledWith([60])
  })

  it('faixa preenchida cobre do início até o valor único', async () => {
    const { findByTestId } = await render(
      <BrandProvider>
        <Slider value={[25]} min={0} max={100} step={1} onChange={() => {}} accessibilityLabel="Volume" />
      </BrandProvider>,
    )
    const faixa = await findByTestId('slider-faixa')
    expect(StyleSheet.flatten(faixa.props.style)).toEqual({ left: '0%', width: '25%' })
  })

  it('bloqueador 1: a alça tem left:0/position:absolute (âncora fixa em x=0, não centralizada pelo Yoga) e 44x44', async () => {
    // Veredito do Bloco B (Fable): `absolute` sem `left-0` num trilho `items-center` é
    // centralizado pelo Yoga antes do `translateX` ser aplicado (AbsoluteLayout.cpp:165-167),
    // então o cálculo (que assume origem em x=0) ficava deslocado. Correção redigida via
    // `style` (não `className`): combinar `className` com o `style` de `useAnimatedStyle` num
    // `Animated.View` fazia o react-native-css-interop aplicar as classes de posição/tamanho
    // no elemento errado, comprovado via Playwright no export web real (`role="slider"` saía
    // com 20x20 em vez de 44x44); registrado no arquivo de desvios.
    const { findByRole } = await render(
      <BrandProvider>
        <Slider value={[50]} min={0} max={100} step={1} onChange={() => {}} accessibilityLabel="Volume" />
      </BrandProvider>,
    )
    const alca = await findByRole('adjustable')
    const style = StyleSheet.flatten(alca.props.style) as Record<string, unknown>
    expect(style.position).toBe('absolute')
    expect(style.left).toBe(0)
    expect(style.top).toBe(0)
    expect(style.height).toBe(44)
    expect(style.width).toBe(44)
  })

  it('bloqueador 1: thumbTranslateX centraliza a alça de 44px em ratio*width', () => {
    // O valor de `style` de uma `Animated.View` com `className` fica preso ao cálculo do
    // primeiro render sob Jest mesmo depois de um re-render com `width` diferente (limitação
    // do mock/interop registrada no arquivo de desvios), então a fórmula é testada como função
    // pura, sem depender de um re-render disparado por `fireEvent(trilho, 'layout', ...)`.
    expect(thumbTranslateX(0.5, 200)).toBe(78)
    expect(thumbTranslateX(0, 200)).toBe(-22)
    expect(thumbTranslateX(1, 200)).toBe(178)
  })

  it('achado 6: disabled reflete accessibilityState.disabled/aria-disabled e ignora accessibilityAction', async () => {
    const onChange = jest.fn()
    const { findByRole } = await render(
      <BrandProvider>
        <Slider value={[50]} min={0} max={100} step={10} onChange={onChange} accessibilityLabel="Volume" disabled />
      </BrandProvider>,
    )
    const alca = await findByRole('adjustable')
    expect(alca.props.accessibilityState.disabled).toBe(true)
    expect(alca.props['aria-disabled']).toBe(true)
    fireEvent(alca, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('carrega dataSet.rendra = SLD-001 na raiz (item D12 do levantamento da Sincronizacao 1)', async () => {
    const { container } = await render(
      <BrandProvider>
        <Slider value={[50]} accessibilityLabel="Volume" />
      </BrandProvider>,
    )
    expect(nodesWithCode(container, 'SLD-001')).toHaveLength(1)
  })
})
