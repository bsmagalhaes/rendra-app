import { act, fireEvent, render, waitFor } from '@testing-library/react-native'
import { BackHandler } from 'react-native'
import { fireGestureHandler, getByGestureTestId } from 'react-native-gesture-handler/jest-utils'
import { BrandProvider } from '../../brand'
import { Text } from '../internal/text'
import { Drawer, drawerTranslateX } from './drawer'

describe('drawerTranslateX', () => {
  it('closed fica na largura da janela', () => {
    expect(drawerTranslateX('closed', 390)).toBe(390)
  })
  it('settled fica em 0', () => {
    expect(drawerTranslateX('settled', 390)).toBe(0)
  })
})

describe('Drawer', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('fechado nao renderiza o conteudo', async () => {
    const { queryByText } = await render(
      <BrandProvider>
        <Drawer open={false} onOpenChange={() => {}} title="Editar cliente">
          <Text className="text-foreground">Corpo</Text>
        </Drawer>
      </BrandProvider>,
    )
    expect(queryByText('Corpo')).toBeNull()
  })

  it('aberto, mostra o titulo uma unica vez, a descricao e o corpo; o card tem role dialog', async () => {
    const { queryAllByText, findByText, findByLabelText } = await render(
      <BrandProvider>
        <Drawer open onOpenChange={() => {}} title="Editar cliente" description="Dados cadastrais">
          <Text className="text-foreground">Corpo</Text>
        </Drawer>
      </BrandProvider>,
    )
    expect(queryAllByText('Editar cliente').length).toBe(1)
    expect(await findByText('Dados cadastrais')).toBeTruthy()
    expect(await findByText('Corpo')).toBeTruthy()
    const card = await findByLabelText('Editar cliente')
    expect(card.props.role).toBe('dialog')
    expect(card.props.accessibilityViewIsModal).toBe(true)
  })

  it('X do shell chama onOpenChange(false) quando nao esta dirty', async () => {
    const onOpenChange = jest.fn()
    const { findByLabelText } = await render(
      <BrandProvider>
        <Drawer open onOpenChange={onOpenChange} title="Editar cliente">
          <Text className="text-foreground">Corpo</Text>
        </Drawer>
      </BrandProvider>,
    )
    await fireEvent.press(await findByLabelText('Fechar'))
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })

  it('dirty: X mostra a confirmacao e nao chama onOpenChange direto', async () => {
    const onOpenChange = jest.fn()
    const { findByLabelText, findByText } = await render(
      <BrandProvider>
        <Drawer open onOpenChange={onOpenChange} title="Editar cliente" dirty>
          <Text className="text-foreground">Corpo</Text>
        </Drawer>
      </BrandProvider>,
    )
    await fireEvent.press(await findByLabelText('Fechar'))
    expect(await findByText('Descartar alterações?')).toBeTruthy()
    expect(await findByText('As informações preenchidas neste painel serão perdidas.')).toBeTruthy()
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('dirty: Descartar chama onOpenChange(false); Continuar editando so fecha a confirmacao', async () => {
    const onOpenChange = jest.fn()
    const { findByLabelText, findByText, queryByText } = await render(
      <BrandProvider>
        <Drawer open onOpenChange={onOpenChange} title="Editar cliente" dirty>
          <Text className="text-foreground">Corpo</Text>
        </Drawer>
      </BrandProvider>,
    )
    await fireEvent.press(await findByLabelText('Fechar'))
    await fireEvent.press(await findByText('Continuar editando'))
    await waitFor(() => expect(queryByText('Descartar alterações?')).toBeNull())
    expect(onOpenChange).not.toHaveBeenCalled()
    await fireEvent.press(await findByLabelText('Fechar'))
    await fireEvent.press(await findByText('Descartar'))
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })

  it('discardTitle e discardDescription customizados', async () => {
    const { findByLabelText, findByText } = await render(
      <BrandProvider>
        <Drawer
          open
          onOpenChange={() => {}}
          title="Editar cliente"
          dirty
          discardTitle="Sair sem salvar?"
          discardDescription="Voce perdera as alteracoes."
        >
          <Text className="text-foreground">Corpo</Text>
        </Drawer>
      </BrandProvider>,
    )
    await fireEvent.press(await findByLabelText('Fechar'))
    expect(await findByText('Sair sem salvar?')).toBeTruthy()
    expect(await findByText('Voce perdera as alteracoes.')).toBeTruthy()
  })

  // C11 (veredito do Opus): o roteiro original nunca exercitava o ajuste de prevOpen (depois de
  // "Descartar", o Modal já zera `confirming` por close()); o roteiro certo é o pai fechando por
  // fora com a confirmação ainda aberta.
  it('o pai fechando o Drawer por fora com a confirmacao aberta nao deixa a confirmacao presa na reabertura', async () => {
    const onOpenChange = jest.fn()
    const { findByLabelText, findByText, queryByText, rerender } = await render(
      <BrandProvider>
        <Drawer open onOpenChange={onOpenChange} title="Editar cliente" dirty>
          <Text className="text-foreground">Corpo</Text>
        </Drawer>
      </BrandProvider>,
    )
    await fireEvent.press(await findByLabelText('Fechar'))
    expect(await findByText('Descartar alterações?')).toBeTruthy()
    await rerender(
      <BrandProvider>
        <Drawer open={false} onOpenChange={onOpenChange} title="Editar cliente" dirty>
          <Text className="text-foreground">Corpo</Text>
        </Drawer>
      </BrandProvider>,
    )
    await rerender(
      <BrandProvider>
        <Drawer open onOpenChange={onOpenChange} title="Editar cliente" dirty>
          <Text className="text-foreground">Corpo</Text>
        </Drawer>
      </BrandProvider>,
    )
    expect(queryByText('Descartar alterações?')).toBeNull()
  })

  it('gesto de arraste acima do limiar fecha sem dirty', async () => {
    const onOpenChange = jest.fn()
    await render(
      <BrandProvider>
        <Drawer open onOpenChange={onOpenChange} title="Editar cliente" testID="drawer">
          <Text className="text-foreground">Corpo</Text>
        </Drawer>
      </BrandProvider>,
    )
    const gesture = getByGestureTestId('drawer-arraste')
    fireGestureHandler(gesture, [
      { translationX: 0 },
      { translationX: 120 },
      { state: 5, translationX: 140 },
    ])
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })

  it('gesto de arraste acima do limiar com dirty abre a confirmacao', async () => {
    const { findByText } = await render(
      <BrandProvider>
        <Drawer open onOpenChange={() => {}} title="Editar cliente" dirty testID="drawer">
          <Text className="text-foreground">Corpo</Text>
        </Drawer>
      </BrandProvider>,
    )
    const gesture = getByGestureTestId('drawer-arraste')
    // setConfirming(true) roda dentro do onEnd do gesto (setState real, não um jest.fn() como no
    // caso "sem dirty"): sem envolver em act, o React acusa "update not wrapped in act".
    await act(async () => {
      fireGestureHandler(gesture, [
        { translationX: 0 },
        { translationX: 120 },
        { state: 5, translationX: 140 },
      ])
    })
    expect(await findByText('Descartar alterações?')).toBeTruthy()
  })

  it('animationType e none e o teclado envolve o corpo', async () => {
    const { getByTestId, findByTestId } = await render(
      <BrandProvider>
        <Drawer open onOpenChange={() => {}} title="Editar cliente" testID="drawer">
          <Text className="text-foreground">Corpo</Text>
        </Drawer>
      </BrandProvider>,
    )
    expect(getByTestId('drawer').props.animationType).toBe('none')
    expect(await findByTestId('drawer-teclado')).toBeTruthy()
  })

  it('footer e o rodape fixo, renderizado dentro do shell', async () => {
    const { findByText } = await render(
      <BrandProvider>
        <Drawer open onOpenChange={() => {}} title="Editar cliente" footer={<Text className="text-foreground">Salvar</Text>}>
          <Text className="text-foreground">Corpo</Text>
        </Drawer>
      </BrandProvider>,
    )
    expect(await findByText('Salvar')).toBeTruthy()
  })

  // C12 (veredito do Opus): faltavam os casos de onRequestClose (voltar do iOS/gesture do RNModal)
  // e do botão físico de voltar do Android.
  it('dirty: requestClose do RNModal abre a confirmação sem chamar onOpenChange', async () => {
    const onOpenChange = jest.fn()
    const { getByTestId, findByText } = await render(
      <BrandProvider>
        <Drawer open onOpenChange={onOpenChange} title="Editar cliente" dirty testID="drawer">
          <Text className="text-foreground">Corpo</Text>
        </Drawer>
      </BrandProvider>,
    )
    await fireEvent(getByTestId('drawer'), 'requestClose')
    expect(await findByText('Descartar alterações?')).toBeTruthy()
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('sem dirty: botão voltar do Android chama onOpenChange(false)', async () => {
    const onOpenChange = jest.fn()
    let backHandler: () => boolean = () => false
    jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_event, handler) => {
      backHandler = handler as () => boolean
      return { remove: jest.fn() }
    })
    await render(
      <BrandProvider>
        <Drawer open onOpenChange={onOpenChange} title="Editar cliente">
          <Text className="text-foreground">Corpo</Text>
        </Drawer>
      </BrandProvider>,
    )
    await act(async () => {
      backHandler()
    })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
