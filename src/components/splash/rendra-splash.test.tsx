import { AccessibilityInfo, StyleSheet } from 'react-native'
import { act, render, screen } from '@testing-library/react-native'
import { BrandProvider } from '../../brand/brand-provider'
import {
  RendraSplash,
  SPLASH_FADE_MS,
  splashOverlayStyle,
  splashRingStyle,
  splashSeloStyle,
  splashTextStyle,
} from './rendra-splash'

const OCULTOS = { includeHiddenElements: true }

async function avancar(ms: number) {
  await act(async () => {
    jest.advanceTimersByTime(ms)
  })
}

// A promessa de `isReduceMotionEnabled` e a hidratação do BrandProvider resolvem em microtarefas:
// esvazia a fila antes de contar o tempo da animação.
async function esvaziar() {
  await act(async () => {
    for (let i = 0; i < 5; i++) await Promise.resolve()
  })
}

function montar(props: { minDuration?: number; visible?: boolean; onFinished: () => void }) {
  return render(
    <BrandProvider>
      <RendraSplash visible={props.visible ?? true} onFinished={props.onFinished} minDuration={props.minDuration} />
    </BrandProvider>,
  )
}

beforeEach(() => {
  jest.useFakeTimers()
})

afterEach(() => {
  jest.useRealTimers()
  jest.restoreAllMocks()
})

describe('RendraSplash', () => {
  it('mostra o overlay com a marca e o lema, fora da árvore de acessibilidade e sem capturar toques', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false)
    await montar({ onFinished: jest.fn() })
    const overlay = await screen.findByTestId('rendra-splash', OCULTOS)
    expect(overlay.props['aria-hidden']).toBe(true)
    expect(overlay.props.importantForAccessibility).toBe('no-hide-descendants')
    expect(StyleSheet.flatten(overlay.props.style)).toEqual(expect.objectContaining({ pointerEvents: 'none' }))
    expect(screen.getByText('Rendra', OCULTOS)).toBeTruthy()
    expect(screen.getByText('Safira', OCULTOS)).toBeTruthy()
    expect(screen.getByText('Precisão lapidada em cada tela.', OCULTOS)).toBeTruthy()
  })

  it('animado: só chama onFinished depois de minDuration mais o fade, e então o overlay sai da tela', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false)
    const onFinished = jest.fn()
    await montar({ minDuration: 900, onFinished })
    await esvaziar()
    await avancar(900 + SPLASH_FADE_MS - 1)
    expect(onFinished).not.toHaveBeenCalled()
    expect(screen.queryByTestId('rendra-splash', OCULTOS)).not.toBeNull()
    await avancar(1)
    expect(onFinished).toHaveBeenCalledTimes(1)
    expect(screen.queryByTestId('rendra-splash', OCULTOS)).toBeNull()
  })

  it('com reduzir movimento: fica estático por minDuration e sai sem o tempo do fade', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true)
    const onFinished = jest.fn()
    await montar({ minDuration: 300, onFinished })
    await esvaziar()
    await avancar(299)
    expect(onFinished).not.toHaveBeenCalled()
    await avancar(1)
    expect(onFinished).toHaveBeenCalledTimes(1)
    expect(screen.queryByTestId('rendra-splash', OCULTOS)).toBeNull()
  })

  it('se isReduceMotionEnabled rejeitar, o overlay ainda termina como no caminho animado', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockRejectedValue(new Error('indisponível'))
    const onFinished = jest.fn()
    await montar({ minDuration: 300, onFinished })
    await esvaziar()
    await avancar(300 + SPLASH_FADE_MS - 1)
    expect(onFinished).not.toHaveBeenCalled()
    await avancar(1)
    expect(onFinished).toHaveBeenCalledTimes(1)
    expect(screen.queryByTestId('rendra-splash', OCULTOS)).toBeNull()
  })

  it('não começa a contar antes de saber se o usuário reduz movimento', async () => {
    let resolver: (valor: boolean) => void = () => {}
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockReturnValue(new Promise<boolean>((r) => (resolver = r)))
    const onFinished = jest.fn()
    await montar({ minDuration: 300, onFinished })
    await avancar(5000)
    expect(onFinished).not.toHaveBeenCalled()
    resolver(true)
    await esvaziar()
    await avancar(300)
    expect(onFinished).toHaveBeenCalledTimes(1)
  })

  it('com visible falso não mostra nada nem chama onFinished', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false)
    const onFinished = jest.fn()
    await montar({ visible: false, onFinished })
    await esvaziar()
    await avancar(5000)
    expect(screen.queryByTestId('rendra-splash', OCULTOS)).toBeNull()
    expect(onFinished).not.toHaveBeenCalled()
  })

  it('desmontar no meio da animação cancela o fim (onFinished não é chamado depois)', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false)
    const onFinished = jest.fn()
    const { unmount } = await montar({ minDuration: 900, onFinished })
    await esvaziar()
    await unmount()
    await avancar(5000)
    expect(onFinished).not.toHaveBeenCalled()
  })
})

describe('estilos puros da animação (worklets)', () => {
  it('splashSeloStyle vai de invisível e pequeno a opaco e no tamanho final', () => {
    expect(splashSeloStyle(0)).toEqual({ opacity: 0, transform: [{ scale: 0.6 }] })
    expect(splashSeloStyle(1)).toEqual({ opacity: 1, transform: [{ scale: 2 }] })
  })

  it('splashTextStyle sobe 12 pontos enquanto aparece', () => {
    expect(splashTextStyle(0)).toEqual({ opacity: 0, transform: [{ translateY: 12 }] })
    expect(splashTextStyle(1)).toEqual({ opacity: 1, transform: [{ translateY: 0 }] })
  })

  it('splashRingStyle abre o anel e o apaga no fim', () => {
    expect(splashRingStyle(0)).toEqual(expect.objectContaining({ opacity: 0.5, transform: [{ scale: 0.7 }] }))
    expect(splashRingStyle(1)).toEqual(expect.objectContaining({ opacity: 0, transform: [{ scale: 1.5 }] }))
  })

  it('splashOverlayStyle cobre a tela, não recebe toque e leva a opacidade do fade', () => {
    expect(splashOverlayStyle(0.4)).toEqual({
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      opacity: 0.4,
    })
  })
})
