import { useEffect, useState } from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import { BrandProvider, useBrand } from '../../brand'
import { Text } from '../internal/text'
import { Alert } from './alert'
import { nodesWithCode } from '../../test-utils/rendra-code'

// M2 (veredito do Fable, entrega das Tarefas 1-10): o Alert dispensavel some da tela quando o
// pai controla `open` a partir de `onDismiss` (uso real, ActionBarExample/showcase nao aplica
// aqui, mas o padrao de consumo de um Alert com onDismiss e sempre este). O wrapper local prova
// o efeito visivel (titulo sumindo), nao so a chamada do callback.
function AlertDispensavel() {
  const [open, setOpen] = useState(true)
  if (!open) return null
  return <Alert type="info" title="Aviso" onDismiss={() => setOpen(false)} />
}

// B3 (veredito do Opus): o Probe original tipava setModelCode como (code: string) => void, mas o
// contexto declara (code: ModelId) => void; com strict, typecheck falhava. TrocaParaT3 troca o
// modelo dentro de um useEffect, sem expor a função de troca como estado do teste.
function TrocaParaT3() {
  const { setModelCode, hydrated } = useBrand()
  useEffect(() => {
    if (hydrated) setModelCode('T3')
  }, [hydrated, setModelCode])
  return null
}

describe('Alert', () => {
  it('aplica as classes de tom success na raiz e a cor em cada Text', async () => {
    const { findByTestId, findByText } = await render(
      <BrandProvider>
        <Alert testID="a" type="success" title="Salvo" description="Tudo certo" />
      </BrandProvider>,
    )
    const raiz = await findByTestId('a')
    expect(raiz.props.className.split(' ')).toEqual(
      expect.arrayContaining(['border-success/25', 'bg-success-soft']),
    )
    expect((await findByText('Salvo')).props.className.split(' ')).toContain('text-success-soft-foreground')
    expect((await findByText('Tudo certo')).props.className.split(' ')).toContain('text-success-soft-foreground')
  })

  it('error usa alert/assertive; warning usa alert/polite; success e info usam status/polite (C4)', async () => {
    const { findByTestId, rerender } = await render(
      <BrandProvider>
        <Alert testID="a" type="error" title="Falhou" />
      </BrandProvider>,
    )
    let raiz = await findByTestId('a')
    expect(raiz.props.accessibilityRole).toBe('alert')
    expect(raiz.props.accessibilityLiveRegion).toBe('assertive')

    await rerender(
      <BrandProvider>
        <Alert testID="a" type="warning" title="Cuidado" />
      </BrandProvider>,
    )
    raiz = await findByTestId('a')
    expect(raiz.props.accessibilityRole).toBe('alert')
    expect(raiz.props.accessibilityLiveRegion).toBe('polite')

    await rerender(
      <BrandProvider>
        <Alert testID="a" type="success" title="Ok" />
      </BrandProvider>,
    )
    raiz = await findByTestId('a')
    expect(raiz.props.role).toBe('status')
    expect(raiz.props.accessibilityLiveRegion).toBe('polite')

    await rerender(
      <BrandProvider>
        <Alert testID="a" type="info" title="Aviso" />
      </BrandProvider>,
    )
    raiz = await findByTestId('a')
    expect(raiz.props.role).toBe('status')
    expect(raiz.props.accessibilityLiveRegion).toBe('polite')
  })

  it('sem onDismiss nao mostra o botao fechar', async () => {
    const { queryByLabelText } = await render(
      <BrandProvider>
        <Alert type="info" title="Aviso" />
      </BrandProvider>,
    )
    expect(queryByLabelText('Fechar aviso')).toBeNull()
  })

  it('com onDismiss, tocar em Fechar aviso remove o alerta da tela (M2)', async () => {
    const { findByLabelText, findByText, queryByText } = await render(
      <BrandProvider>
        <AlertDispensavel />
      </BrandProvider>,
    )
    expect(await findByText('Aviso')).toBeTruthy()
    await fireEvent.press(await findByLabelText('Fechar aviso'))
    await waitFor(() => expect(queryByText('Aviso')).toBeNull())
  })

  it('renderiza a action recebida', async () => {
    const { findByText } = await render(
      <BrandProvider>
        <Alert type="warning" title="Cuidado" action={<Text className="text-warning-soft-foreground">Desfazer</Text>} />
      </BrandProvider>,
    )
    expect(await findByText('Desfazer')).toBeTruthy()
  })

  it('com shape pill (T3), troca p-4 por py-3 pr-4 pl-4 e centraliza os itens', async () => {
    const { findByTestId } = await render(
      <BrandProvider>
        <TrocaParaT3 />
        <Alert testID="a" type="info" title="Aviso" />
      </BrandProvider>,
    )
    await waitFor(async () => {
      const classes = (await findByTestId('a')).props.className.split(' ')
      expect(classes).toEqual(expect.arrayContaining(['items-center', 'py-3', 'pr-4', 'pl-4']))
      expect(classes).not.toContain('p-4')
    })
  })

  it('carrega dataSet.rendra = ALRT-001 na raiz (item D12 do levantamento da Sincronizacao 1)', async () => {
    const { container } = await render(
      <BrandProvider>
        <Alert type="info" title="Aviso" />
      </BrandProvider>,
    )
    expect(nodesWithCode(container, 'ALRT-001')).toHaveLength(1)
  })
})
