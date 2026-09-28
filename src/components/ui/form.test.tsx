import { Component } from 'react'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import { BrandProvider } from '../../brand/brand-provider'
import { Text } from '../internal/text'
import { Form, FormField, FormSection } from './form'
import { Input } from './input'
import { ActionBar } from './action-bar'
import { zBR } from '../../lib/validators'
import { nodesWithCode } from '../../test-utils/rendra-code'

// React 19: `render(...).rejects.toThrow` é instável para um erro síncrono de render
// (o rejeitar da promise do RNTL não é garantido nessa versão do React). Um error
// boundary local é o padrão determinístico para capturar o throw síncrono de FormField.
class TestErrorBoundary extends Component<{ children: ReactNode }, { message: string | null }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { message: null }
  }
  static getDerivedStateFromError(error: Error) {
    return { message: error.message }
  }
  render() {
    if (this.state.message) {
      return <Text>{this.state.message}</Text>
    }
    return this.props.children
  }
}

const schema = z.object({ nome: zBR.required('Nome') })

function makeExemplo(onSubmit: (values: { nome: string }) => void) {
  return function Exemplo() {
    const form = useForm({ resolver: zodResolver(schema), mode: 'onTouched', defaultValues: { nome: '' } })
    return (
      <Form form={form} onSubmit={onSubmit}>
        <FormSection title="Dados pessoais">
          <FormField name="nome" label="Nome" required render={(f) => <Input {...f} />} />
        </FormSection>
        <ActionBar sticky={false} primary={{ label: 'Salvar', onPress: form.handleSubmit(onSubmit) }} />
      </Form>
    )
  }
}

describe('Form', () => {
  it('mostra o erro de validação e não chama onSubmit quando inválido', async () => {
    const onSubmit = jest.fn()
    const Exemplo = makeExemplo(onSubmit)
    const { findByText } = await render(
      <BrandProvider>
        <Exemplo />
      </BrandProvider>,
    )
    const salvar = await findByText('Salvar')
    await fireEvent.press(salvar)
    expect(await findByText('Nome é obrigatório.')).toBeTruthy()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('chama onSubmit com os valores quando válido', async () => {
    const onSubmit = jest.fn()
    const Exemplo = makeExemplo(onSubmit)
    const { findByText, findByLabelText } = await render(
      <BrandProvider>
        <Exemplo />
      </BrandProvider>,
    )
    // Field clona o filho com accessibilityLabel = label ("Nome") quando o controle
    // não define o seu próprio (decisão do redator 2 / Tarefa 19); Input repassa isso
    // ao TextInput (Tarefa 9), então findByLabelText já basta para localizar o campo.
    const campo = await findByLabelText('Nome')
    await fireEvent.changeText(campo, 'Ana')
    const salvar = await findByText('Salvar')
    await fireEvent.press(salvar)
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ nome: 'Ana' }, expect.anything()))
  })

  it('FormSection renderiza um Card com CardTitle', async () => {
    const onSubmit = jest.fn()
    const Exemplo = makeExemplo(onSubmit)
    const { findByText } = await render(
      <BrandProvider>
        <Exemplo />
      </BrandProvider>,
    )
    expect(await findByText('Dados pessoais')).toBeTruthy()
  })

  it('FormField fora de Form lança, capturado por um error boundary local', async () => {
    // O fallback do error boundary usa <Text> (../internal/text), que por sua vez chama
    // useBrand() e exige um BrandProvider por perto (igual a todo outro render deste
    // arquivo); sem ele, a própria renderização do fallback lança um segundo erro
    // ("useBrand precisa estar dentro de <BrandProvider>."), mascarando o que o teste
    // realmente quer comprovar.
    jest.spyOn(console, 'error').mockImplementation(() => {})
    const { findByText } = await render(
      <BrandProvider>
        <TestErrorBoundary>
          <FormField name="nome" render={(f) => <Input {...f} />} />
        </TestErrorBoundary>
      </BrandProvider>,
    )
    expect(await findByText('FormField precisa estar dentro de <Form>.')).toBeTruthy()
  })

  it('carrega dataSet.rendra = FORM-001 na raiz (item D12/B9 do levantamento da Sincronizacao 1)', async () => {
    const Exemplo = makeExemplo(jest.fn())
    const { container } = await render(
      <BrandProvider>
        <Exemplo />
      </BrandProvider>,
    )
    expect(nodesWithCode(container, 'FORM-001')).toHaveLength(1)
  })

  it('FormSection carrega dataSet.rendra = FORM-002 no Card interno (item D4 do levantamento da Sincronizacao 1)', async () => {
    const Exemplo = makeExemplo(jest.fn())
    const { container } = await render(
      <BrandProvider>
        <Exemplo />
      </BrandProvider>,
    )
    expect(nodesWithCode(container, 'FORM-002')).toHaveLength(1)
  })
})
