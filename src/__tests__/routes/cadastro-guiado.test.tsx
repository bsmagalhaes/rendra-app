import { act, fireEvent } from '@testing-library/react-native'
import { screen } from 'expo-router/testing-library'
import { Text } from 'react-native'
import ShellLayout from '../../../app/(shell)/_layout'
import Cadastro from '../../../app/(shell)/cadastro'
import { toast } from '../../components/ui'
import { renderDemo } from '../../test-utils/render-demo'

const rotas = {
  '(shell)/_layout': ShellLayout,
  '(shell)/cadastro': Cadastro,
  '(shell)/clientes/index': () => <Text>Lista de clientes</Text>,
}

afterEach(async () => {
  await act(async () => {
    toast.dismiss()
  })
})

async function continuar() {
  await fireEvent.press(await screen.findByRole('button', { name: 'Continuar' }))
}

describe('cadastro guiado', () => {
  it('começa na etapa 1 de 4 e não avança com campos vazios', async () => {
    await renderDemo(rotas, '/cadastro')
    expect(await screen.findByText('Etapa 1 de 4')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Voltar' })).toBeNull()
    await continuar()
    expect(await screen.findByText('Informe a razão social.')).toBeTruthy()
    expect(screen.getByText('Etapa 1 de 4')).toBeTruthy()
  })

  it('o progresso acompanha a etapa', async () => {
    await renderDemo(rotas, '/cadastro')
    expect((await screen.findByRole('progressbar', { name: 'Progresso do cadastro' })).props.accessibilityValue.now).toBe(25)
    await fireEvent.changeText(await screen.findByLabelText('Razão social'), 'Padaria Estrela Ltda')
    await fireEvent.changeText(screen.getByLabelText('CNPJ'), '11222333000181')
    await continuar()
    expect(await screen.findByText('Etapa 2 de 4')).toBeTruthy()
    expect((await screen.findByRole('progressbar', { name: 'Progresso do cadastro' })).props.accessibilityValue.now).toBe(50)
  })

  it('a etapa de contato exige nome e e-mail válido', async () => {
    await renderDemo(rotas, '/cadastro')
    await fireEvent.changeText(await screen.findByLabelText('Razão social'), 'Padaria Estrela Ltda')
    await fireEvent.changeText(screen.getByLabelText('CNPJ'), '11222333000181')
    await continuar()
    await fireEvent.changeText(await screen.findByLabelText('E-mail'), 'sem-arroba')
    await continuar()
    expect(await screen.findByText('Nome do contato é obrigatório.')).toBeTruthy()
    expect(await screen.findByText('E-mail inválido.')).toBeTruthy()
    expect(screen.getByText('Etapa 2 de 4')).toBeTruthy()
  })

  it('avança, volta e conclui, preservando o que foi digitado', async () => {
    const tela = await renderDemo(rotas, '/cadastro')
    await fireEvent.changeText(await screen.findByLabelText('Razão social'), 'Padaria Estrela Ltda')
    await fireEvent.changeText(screen.getByLabelText('CNPJ'), '11222333000181')
    await continuar()
    expect(await screen.findByText('Etapa 2 de 4')).toBeTruthy()
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }))
    expect(await screen.findByDisplayValue('Padaria Estrela Ltda')).toBeTruthy()
    await continuar()
    await fireEvent.changeText(await screen.findByLabelText('Nome do contato'), 'Ana Ribeiro')
    await fireEvent.changeText(screen.getByLabelText('E-mail'), 'ana@exemplo.com.br')
    await continuar()
    // Correção D18: a opção do plano leva a descrição com o preço, então o nome acessível
    // começa por "Profissional" e a consulta usa regex.
    await fireEvent.press(await screen.findByRole('radio', { name: /^Profissional/ }))
    await continuar()
    expect(await screen.findByText('Etapa 4 de 4')).toBeTruthy()
    expect(await screen.findByText('Padaria Estrela Ltda')).toBeTruthy()
    expect(await screen.findByText('Profissional, R$ 199,00 por mês')).toBeTruthy()
    await fireEvent.press(screen.getByRole('button', { name: 'Concluir cadastro' }))
    expect(await screen.findByText('Cadastro concluído (simulado)')).toBeTruthy()
    expect(await screen.findByText('Lista de clientes')).toBeTruthy()
    expect(tela.getPathname()).toBe('/clientes')
  })
})
