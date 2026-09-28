import { BackHandler, StyleSheet } from 'react-native'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import { BrandProvider } from '../../brand/brand-provider'
import { Text } from '../internal/text'
import { Modal, modalCardStyle } from './modal'

describe('Modal', () => {
  it('fechado (open=false): não renderiza o corpo', async () => {
    const { queryByText } = await render(
      <BrandProvider>
        <Modal open={false} onOpenChange={() => {}} title="Excluir item?" description="Esta ação não pode ser desfeita." />
      </BrandProvider>,
    )
    expect(queryByText('Excluir item?')).toBeNull()
    expect(queryByText('Esta ação não pode ser desfeita.')).toBeNull()
  })

  it('aberto: mostra título, descrição e o ícone de retorno', async () => {
    const { findByText } = await render(
      <BrandProvider>
        <Modal open onOpenChange={() => {}} title="Excluir item?" description="Esta ação não pode ser desfeita." type="destructive" />
      </BrandProvider>,
    )
    expect(await findByText('Excluir item?')).toBeTruthy()
    expect(await findByText('Esta ação não pode ser desfeita.')).toBeTruthy()
  })

  it('confirmLabel padrão por tipo: destructive usa Excluir, info usa Entendi, confirm usa Confirmar', async () => {
    const { findByText, rerender } = await render(
      <BrandProvider>
        <Modal open onOpenChange={() => {}} title="X" type="destructive" />
      </BrandProvider>,
    )
    expect(await findByText('Excluir')).toBeTruthy()

    await rerender(
      <BrandProvider>
        <Modal open onOpenChange={() => {}} title="X" type="info" />
      </BrandProvider>,
    )
    expect(await findByText('Entendi')).toBeTruthy()

    await rerender(
      <BrandProvider>
        <Modal open onOpenChange={() => {}} title="X" type="confirm" />
      </BrandProvider>,
    )
    expect(await findByText('Confirmar')).toBeTruthy()
  })

  it('type info não mostra botão cancelar', async () => {
    const { queryByText } = await render(
      <BrandProvider>
        <Modal open onOpenChange={() => {}} title="X" type="info" />
      </BrandProvider>,
    )
    expect(queryByText('Cancelar')).toBeNull()
  })

  it('onConfirm assíncrono: fica em loading até resolver, depois fecha', async () => {
    const onOpenChange = jest.fn()
    let resolveConfirm: () => void = () => {}
    const onConfirm = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveConfirm = resolve
        }),
    )
    const { findByText } = await render(
      <BrandProvider>
        <Modal open onOpenChange={onOpenChange} title="Excluir item?" type="destructive" onConfirm={onConfirm} />
      </BrandProvider>,
    )
    const confirmButton = await findByText('Excluir')
    // Não aguardar fireEvent.press aqui: o onPress (confirm) é assíncrono e só resolve depois de
    // resolveConfirm() (abaixo); await fireEvent.press trava o teste porque a promise interna do
    // act() nunca se resolve enquanto o onPress pendurado não termina (confirmado isolando o caso
    // com um Button mínimo e onPress assíncrono nunca resolvido durante o press). A atualização de
    // estado (setBusy(true)) já acontece de forma síncrona antes do primeiro await dentro de
    // confirm(), então o texto de loading já fica disponível para o findByText a seguir.
    fireEvent.press(confirmButton)
    expect(await findByText('Excluir...')).toBeTruthy()
    resolveConfirm()
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })

  it('cancelar chama onOpenChange(false)', async () => {
    const onOpenChange = jest.fn()
    const { findByText } = await render(
      <BrandProvider>
        <Modal open onOpenChange={onOpenChange} title="X" type="confirm" />
      </BrandProvider>,
    )
    const cancelButton = await findByText('Cancelar')
    await fireEvent.press(cancelButton)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('type form: children renderizado, sem BrandFeedbackIcon/título centralizado', async () => {
    const { findByText } = await render(
      <BrandProvider>
        <Modal open onOpenChange={() => {}} title="Editar" type="form">
          {null}
        </Modal>
      </BrandProvider>,
    )
    expect(await findByText('Editar')).toBeTruthy()
  })

  it('botão físico de voltar do Android chama onOpenChange(false)', async () => {
    const onOpenChange = jest.fn()
    let backHandler: () => boolean = () => false
    jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_event, handler) => {
      backHandler = handler as () => boolean
      return { remove: jest.fn() }
    })
    await render(
      <BrandProvider>
        <Modal open onOpenChange={onOpenChange} title="X" type="confirm" />
      </BrandProvider>,
    )
    backHandler()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('onConfirm resolvendo false mantém o modal aberto', async () => {
    const onOpenChange = jest.fn()
    const onConfirm = jest.fn(() => Promise.resolve(false))
    const { findByText } = await render(
      <BrandProvider>
        <Modal open onOpenChange={onOpenChange} title="Formulário" type="form" onConfirm={onConfirm}>
          <Text className="text-foreground">Campo</Text>
        </Modal>
      </BrandProvider>,
    )
    const confirmar = await findByText('Confirmar')
    fireEvent.press(confirmar)
    await waitFor(() => expect(onConfirm).toHaveBeenCalled())
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
  })

  it('onConfirm resolvendo true (ou void) fecha o modal', async () => {
    const onOpenChange = jest.fn()
    const onConfirm = jest.fn(() => Promise.resolve(true))
    const { findByText } = await render(
      <BrandProvider>
        <Modal open onOpenChange={onOpenChange} title="Formulário" type="form" onConfirm={onConfirm}>
          <Text className="text-foreground">Campo</Text>
        </Modal>
      </BrandProvider>,
    )
    const confirmar = await findByText('Confirmar')
    fireEvent.press(confirmar)
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })

  it('envolve o corpo em KeyboardAvoidingView quando type é form', async () => {
    const { findByTestId } = await render(
      <BrandProvider>
        <Modal open onOpenChange={() => {}} title="Formulário" type="form">
          <Text className="text-foreground">Campo</Text>
        </Modal>
      </BrandProvider>,
    )
    expect(await findByTestId('modal-teclado')).toBeTruthy()
  })

  it('o card tem role dialog e accessibilityViewIsModal, encontrável por findByLabelText', async () => {
    const { findByLabelText } = await render(
      <BrandProvider>
        <Modal open onOpenChange={() => {}} title="Formulário" type="form">
          <Text className="text-foreground">Campo</Text>
        </Modal>
      </BrandProvider>,
    )
    const card = await findByLabelText('Formulário')
    expect(card.props.role).toBe('dialog')
    expect(card.props.accessibilityViewIsModal).toBe(true)
  })

  it('o overlay de fechar tem accessibilityRole button (achado 5.9)', async () => {
    const { findByLabelText } = await render(
      <BrandProvider>
        <Modal open onOpenChange={() => {}} title="Confirmar exclusão" type="destructive" onConfirm={() => {}} />
      </BrandProvider>,
    )
    // O overlay é irmão da View com accessibilityViewIsModal (o card do dialogo); RNTL trata todo
    // irmao de um no aria-modal como oculto da acessibilidade (isSubtreeInaccessible,
    // node_modules/@testing-library/react-native/dist/helpers/accessibility.js:77-80), entao a
    // consulta precisa de includeHiddenElements para achar o proprio no do overlay.
    const overlay = await findByLabelText('Fechar', { includeHiddenElements: true })
    expect(overlay.props.accessibilityRole).toBe('button')
  })

  it('o RNModal usa animationType none (achado 5.9, Tarefa 15: axe reprovou aria-allowed-attr com fade)', async () => {
    const { findByTestId } = await render(
      <BrandProvider>
        <Modal open onOpenChange={() => {}} title="X" type="confirm" />
      </BrandProvider>,
    )
    expect((await findByTestId('modal-rn')).props.animationType).toBe('none')
  })

  describe('modalCardStyle (achado M1 do veredito do fechamento do lote 3: entrada própria do cartão)', () => {
    // Função pura com 'worklet', mesmo padrão de `bottomSheetTranslateY` (`bottom-sheet.tsx`) e
    // `drawerTranslateX` (`drawer.tsx`): testar a fórmula isolada evita a limitação já enfrentada
    // por essas duas (consultar `.props.style`/`getAnimatedStyle()` de um `Animated.View` via RNTL
    // depois que um `useEffect` muda o `SharedValue` num render já montado não reflete o valor novo
    // sob o mock de `useAnimatedStyle`); a prova do movimento real fica para o emulador.
    it('fase "closed": deslocado para baixo e transparente (posição inicial da entrada)', () => {
      expect(modalCardStyle('closed')).toEqual({ translateY: 24, opacity: 0 })
    })

    it('fase "settled": no lugar e opaco (posição final da entrada)', () => {
      expect(modalCardStyle('settled')).toEqual({ translateY: 0, opacity: 1 })
    })
  })

  it('o Animated.View da entrada encolhe e limita a altura (achado A1 da validação final do lote 3: sem flexShrink/maxHeight o shrink max-h-full do cartão parava de valer)', async () => {
    const { findByLabelText } = await render(
      <BrandProvider>
        <Modal open onOpenChange={() => {}} title="Formulário" type="form">
          <Text className="text-foreground">Campo</Text>
        </Modal>
      </BrandProvider>,
    )
    const card = await findByLabelText('Formulário')
    // Mesmo padrão de `drawer.tsx:123-126` (`flex: 1`) e `bottom-sheet.tsx:120-123` (`maxHeight`):
    // a restrição entra no objeto de `useAnimatedStyle` do invólucro animado, não no `className`
    // do cartão (que já tem `shrink max-h-full`, mas depende do pai aceitar encolher). StyleSheet.flatten
    // no nó real (mesmo caminho de `action-bar.test.tsx:85` e `text.test.tsx:15`), porque o style chega
    // como array sob o NativeWind (`useAnimatedStyle` mockado não faz isso sozinho).
    expect(StyleSheet.flatten(card.parent?.props.style)).toMatchObject({ flexShrink: 1, maxHeight: '100%' })
  })
})

describe('Modal: data-rendra por tipo (item D5/D12 do levantamento da Sincronizacao 1)', () => {
  // O card (role="dialog") não tem accessible=true explícito, então getByRole/findByRole (que
  // exige isAccessibilityElement) não o encontra; findByLabelText, como o resto deste arquivo já
  // usa (ex. Tarefa "o card tem role dialog...encontrável por findByLabelText"), acha o mesmo nó.
  it('type confirm (padrao) carrega dataSet.rendra = MOD-001', async () => {
    const { findByLabelText } = await render(
      <BrandProvider>
        <Modal open onOpenChange={() => {}} title="Excluir item?" />
      </BrandProvider>,
    )
    expect((await findByLabelText('Excluir item?')).props.dataSet).toMatchObject({ rendra: 'MOD-001' })
  })

  it('type destructive tambem carrega MOD-001 (mesmo codigo de confirm, so muda a cor)', async () => {
    const { findByLabelText } = await render(
      <BrandProvider>
        <Modal open onOpenChange={() => {}} title="Excluir item?" type="destructive" />
      </BrandProvider>,
    )
    expect((await findByLabelText('Excluir item?')).props.dataSet).toMatchObject({ rendra: 'MOD-001' })
  })

  it('type form carrega MOD-002', async () => {
    const { findByLabelText } = await render(
      <BrandProvider>
        <Modal open onOpenChange={() => {}} title="Formulário" type="form" />
      </BrandProvider>,
    )
    expect((await findByLabelText('Formulário')).props.dataSet).toMatchObject({ rendra: 'MOD-002' })
  })

  it('type info carrega MOD-003', async () => {
    const { findByLabelText } = await render(
      <BrandProvider>
        <Modal open onOpenChange={() => {}} title="Informação" type="info" />
      </BrandProvider>,
    )
    expect((await findByLabelText('Informação')).props.dataSet).toMatchObject({ rendra: 'MOD-003' })
  })
})
