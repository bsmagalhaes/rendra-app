import { useState } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { fireGestureHandler, getByGestureTestId } from 'react-native-gesture-handler/jest-utils'
import { BackHandler } from 'react-native'
import { BrandProvider } from '../../brand/brand-provider'
import { nodesWithCode } from '../../test-utils/rendra-code'
import { ImageViewer, type ViewerImage } from './image-viewer'

const imagens: ViewerImage[] = [
  { src: 'https://exemplo.com/a.png', alt: 'Captura A', caption: 'Componentes' },
  { src: 'https://exemplo.com/b.png', alt: 'Captura B', caption: 'Galeria' },
  { src: 'https://exemplo.com/c.png', alt: 'Captura C' },
  { src: 'https://exemplo.com/d.png', alt: 'Captura D', caption: 'Tokens' },
]

function Controlado({
  lista = imagens,
  inicial = 0,
  onIndexChange,
}: {
  lista?: ViewerImage[]
  inicial?: number | null
  onIndexChange?: (i: number | null) => void
}) {
  const [index, setIndex] = useState<number | null>(inicial)
  return (
    <ImageViewer
      images={lista}
      index={index}
      onIndexChange={(i) => {
        setIndex(i)
        onIndexChange?.(i)
      }}
    />
  )
}

const renderizar = (ui: React.ReactElement) => render(<BrandProvider>{ui}</BrandProvider>)

describe('ImageViewer', () => {
  it('aberto: e um dialogo IMG-001, com a legenda no cabecalho e o contador', async () => {
    const { container } = await renderizar(<Controlado />)
    expect(nodesWithCode(container, 'IMG-001')).toHaveLength(1)
    expect(screen.getByTestId('image-viewer').props.role).toBe('dialog')
    expect(screen.getByText('Componentes')).toBeTruthy()
    expect(screen.getByText('1 de 4')).toBeTruthy()
    expect(screen.getByLabelText('Captura A')).toBeTruthy()
  })

  it('sem legenda, o titulo e o texto alternativo', async () => {
    await renderizar(<Controlado inicial={2} />)
    expect(screen.getByRole('header', { name: 'Captura C' })).toBeTruthy()
    expect(screen.getByText('3 de 4')).toBeTruthy()
  })

  it('Proxima avanca, e Anterior no primeiro volta para o ultimo (circular)', async () => {
    await renderizar(<Controlado />)
    await fireEvent.press(screen.getByLabelText('Próxima'))
    expect(screen.getByText('2 de 4')).toBeTruthy()
    expect(screen.getByRole('header', { name: 'Galeria' })).toBeTruthy()
    await fireEvent.press(screen.getByLabelText('Anterior'))
    expect(screen.getByText('1 de 4')).toBeTruthy()
    await fireEvent.press(screen.getByLabelText('Anterior'))
    expect(screen.getByText('4 de 4')).toBeTruthy()
    expect(screen.getByRole('header', { name: 'Tokens' })).toBeTruthy()
    await fireEvent.press(screen.getByLabelText('Próxima'))
    expect(screen.getByText('1 de 4')).toBeTruthy()
  })

  it('index null nao renderiza o dialogo; Fechar chama onIndexChange(null) e ele sai da arvore', async () => {
    const onIndexChange = jest.fn()
    const { unmount } = await renderizar(<Controlado inicial={null} />)
    expect(screen.queryByTestId('image-viewer')).toBeNull()
    await unmount()
    await renderizar(<Controlado onIndexChange={onIndexChange} />)
    expect(screen.getByTestId('image-viewer').props.role).toBe('dialog')
    await fireEvent.press(screen.getByLabelText('Fechar'))
    expect(onIndexChange).toHaveBeenCalledWith(null)
    expect(screen.queryByTestId('image-viewer')).toBeNull()
  })

  it('com uma imagem so, o rodape de navegacao nao existe', async () => {
    await renderizar(<Controlado lista={[imagens[0]!]} />)
    expect(screen.queryByLabelText('Próxima')).toBeNull()
    expect(screen.queryByLabelText('Anterior')).toBeNull()
    expect(screen.queryByText('1 de 1')).toBeNull()
  })

  it('o botao voltar do aparelho fecha o visualizador', async () => {
    let voltar: (() => boolean) | undefined
    const espiao = jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_evento, handler) => {
      voltar = handler as () => boolean
      return { remove: jest.fn() }
    })
    const onIndexChange = jest.fn()
    await renderizar(<Controlado onIndexChange={onIndexChange} />)
    let tratado: boolean | undefined
    await act(async () => {
      tratado = voltar?.()
    })
    expect(tratado).toBe(true)
    expect(onIndexChange).toHaveBeenCalledWith(null)
    espiao.mockRestore()
  })

  it('arrastar a galeria para o lado troca a imagem e avisa o indice novo', async () => {
    const onIndexChange = jest.fn()
    await renderizar(<Controlado onIndexChange={onIndexChange} />)
    const paginas = screen.getByTestId('image-viewer-paginas')
    await fireEvent(paginas, 'momentumScrollEnd', {
      nativeEvent: { contentOffset: { x: 1500, y: 0 }, layoutMeasurement: { width: 750, height: 1200 } },
    })
    expect(onIndexChange).toHaveBeenCalledWith(2)
    expect(screen.getByText('3 de 4')).toBeTruthy()
  })

  it('o arraste da imagem so liga depois da pinca; o toque duplo volta a 1x e o desliga de novo', async () => {
    await renderizar(<Controlado />)
    const arraste = () => getByGestureTestId('image-viewer-pagina-0-arraste').config.enabled
    expect(arraste()).toBe(false)
    await act(async () => {
      fireGestureHandler(getByGestureTestId('image-viewer-pagina-0-pinca'), [{ scale: 1 }, { scale: 5 }, { state: 5, scale: 5 }])
    })
    expect(arraste()).toBe(true)
    await act(async () => {
      fireGestureHandler(getByGestureTestId('image-viewer-pagina-0-toque-duplo'), [{ state: 5 }])
    })
    expect(arraste()).toBe(false)
    await act(async () => {
      fireGestureHandler(getByGestureTestId('image-viewer-pagina-0-toque-duplo'), [{ state: 5 }])
    })
    expect(arraste()).toBe(true)
  })

  it('so a pagina ativa reage aos gestos; trocar de imagem desliga o arraste da anterior', async () => {
    await renderizar(<Controlado />)
    expect(getByGestureTestId('image-viewer-pagina-1-pinca').config.enabled).toBe(false)
    expect(getByGestureTestId('image-viewer-pagina-0-pinca').config.enabled).toBe(true)
    await act(async () => {
      fireGestureHandler(getByGestureTestId('image-viewer-pagina-0-toque-duplo'), [{ state: 5 }])
    })
    expect(getByGestureTestId('image-viewer-pagina-0-arraste').config.enabled).toBe(true)
    await fireEvent.press(screen.getByLabelText('Próxima'))
    expect(getByGestureTestId('image-viewer-pagina-1-pinca').config.enabled).toBe(true)
    expect(getByGestureTestId('image-viewer-pagina-0-arraste').config.enabled).toBe(false)
  })
})
