import { act, fireEvent } from '@testing-library/react-native'
import { screen } from 'expo-router/testing-library'
import { Text } from 'react-native'
import ShellLayout from '../../../app/(shell)/_layout'
import Lista from '../../../app/(shell)/clientes/index'
import Novo from '../../../app/(shell)/clientes/novo'
import { restaurarClientes } from '../../demo/clients-store'
import { toast } from '../../components/ui'
import { renderDemo } from '../../test-utils/render-demo'

const rotas = {
  '(shell)/_layout': ShellLayout,
  '(shell)/clientes/novo': Novo,
  '(shell)/clientes/index': () => <Text>Lista de clientes</Text>,
}

afterEach(async () => {
  restaurarClientes()
  await act(async () => {
    toast.dismiss()
  })
})

describe('novo cliente', () => {
  it('mostra os erros quando envia vazio', async () => {
    const tela = await renderDemo(rotas, '/clientes/novo')
    await fireEvent.press(await screen.findByRole('button', { name: 'Salvar cliente' }))
    expect(await screen.findByText('Informe a razão social.')).toBeTruthy()
    expect(await screen.findByText('CNPJ inválido.')).toBeTruthy()
    expect(tela.getPathname()).toBe('/clientes/novo')
  })

  // Correção C15/D5: sem botão de busca no corpo do formulário (R12); a busca dispara quando a
  // máscara completa os 14 dígitos e preenche a razão social pela função fictícia local.
  it('aplica a máscara de CNPJ e preenche a razão social pela busca', async () => {
    await renderDemo(rotas, '/clientes/novo')
    await fireEvent.changeText(await screen.findByLabelText('CNPJ'), '11222333000181')
    expect(screen.getByLabelText('CNPJ').props.value).toBe('11.222.333/0001-81')
    await screen.findByDisplayValue('Comercial Aurora Ltda')
  })

  it('busca de CEP preenche a cidade', async () => {
    await renderDemo(rotas, '/clientes/novo')
    await fireEvent.changeText(await screen.findByLabelText('CEP'), '01310100')
    expect(screen.getByLabelText('CEP').props.value).toBe('01310-100')
    await screen.findByDisplayValue('São Paulo')
  })

  it('CNPJ desconhecido não preenche a razão social', async () => {
    await renderDemo(rotas, '/clientes/novo')
    await fireEvent.changeText(await screen.findByLabelText('CNPJ'), '00000000000191')
    expect(screen.getByLabelText('Razão social').props.value).toBe('')
  })

  it('e-mail de contato inválido mostra o erro', async () => {
    await renderDemo(rotas, '/clientes/novo')
    await fireEvent.changeText(await screen.findByLabelText('Razão social'), 'Padaria Estrela Ltda')
    await fireEvent.changeText(screen.getByLabelText('CNPJ'), '11222333000181')
    await fireEvent.changeText(screen.getByLabelText('E-mail'), 'sem-arroba')
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar cliente' }))
    expect(await screen.findByText('E-mail inválido.')).toBeTruthy()
    expect(screen.queryByText('Cliente cadastrado (simulado)')).toBeNull()
  })

  it('salva com dados válidos e volta à lista', async () => {
    const tela = await renderDemo(rotas, '/clientes/novo')
    await fireEvent.changeText(await screen.findByLabelText('Razão social'), 'Padaria Estrela Ltda')
    await fireEvent.changeText(screen.getByLabelText('CNPJ'), '11222333000181')
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar cliente' }))
    expect(await screen.findByText('Cliente cadastrado (simulado)')).toBeTruthy()
    expect(await screen.findByText('Lista de clientes')).toBeTruthy()
    expect(tela.getPathname()).toBe('/clientes')
  })

  it('Cancelar volta à lista sem salvar', async () => {
    await renderDemo(rotas, '/clientes/novo')
    await fireEvent.press(await screen.findByRole('button', { name: 'Cancelar' }))
    expect(await screen.findByText('Lista de clientes')).toBeTruthy()
    expect(screen.queryByText('Cliente cadastrado (simulado)')).toBeNull()
  })
})

describe('novo cliente na carteira da demonstração', () => {
  it('a busca de CNPJ não sobrescreve a razão social já digitada', async () => {
    await renderDemo(rotas, '/clientes/novo')
    await fireEvent.changeText(await screen.findByLabelText('Razão social'), 'Minha Empresa Ltda')
    await fireEvent.changeText(screen.getByLabelText('CNPJ'), '11222333000181')
    await act(async () => {})
    expect(screen.getByLabelText('Razão social').props.value).toBe('Minha Empresa Ltda')
  })

  it('o cliente salvo aparece na lista real, com o total maior, até recarregar', async () => {
    await renderDemo({ ...rotas, '(shell)/clientes/index': Lista }, '/clientes/novo')
    await fireEvent.changeText(await screen.findByLabelText('Razão social'), 'Padaria Nova Ltda')
    await fireEvent.changeText(screen.getByLabelText('CNPJ'), '11222333000181')
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar cliente' }))
    expect((await screen.findAllByText('Padaria Nova Ltda')).length).toBeGreaterThan(0)
    expect(await screen.findByText('Mostrando 10 de 49 clientes')).toBeTruthy()
  })
})
