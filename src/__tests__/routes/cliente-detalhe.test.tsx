import { act, fireEvent } from '@testing-library/react-native'
import { screen } from 'expo-router/testing-library'
import { Text } from 'react-native'
import ShellLayout from '../../../app/(shell)/_layout'
import Detalhe, { generateStaticParams } from '../../../app/(shell)/clientes/[id]'
import { toast } from '../../components/ui'
import { restaurarClientes } from '../../demo/clients-store'
import { clients } from '../../mocks/clients'
import { renderDemo } from '../../test-utils/render-demo'

const rotas = {
  '(shell)/_layout': ShellLayout,
  '(shell)/clientes/[id]': Detalhe,
  '(shell)/clientes/index': () => <Text>Lista de clientes</Text>,
}

afterEach(async () => {
  restaurarClientes()
  await act(async () => {
    toast.dismiss()
  })
})

describe('detalhe do cliente', () => {
  it('gera uma página estática por cliente (B8)', () => {
    expect(generateStaticParams()).toHaveLength(48)
    expect(generateStaticParams()).toContainEqual({ id: '1000' })
  })

  it('mostra o nome e as quatro abas', async () => {
    await renderDemo(rotas, `/clientes/${clients[0]!.id}`)
    expect((await screen.findAllByText(clients[0]!.nome)).length).toBeGreaterThan(0)
    for (const aba of ['Resumo', 'Contratos', 'Atividade', 'Documentos']) {
      expect(screen.getByRole('tab', { name: aba })).toBeTruthy()
    }
  })

  it('o Resumo mostra os dados do cliente', async () => {
    await renderDemo(rotas, `/clientes/${clients[0]!.id}`)
    expect(await screen.findByText(clients[0]!.cnpj)).toBeTruthy()
    expect(await screen.findByText(clients[0]!.email)).toBeTruthy()
  })

  it('a aba Contratos lista valores em reais', async () => {
    await renderDemo(rotas, `/clientes/${clients[0]!.id}`)
    await fireEvent.press(await screen.findByRole('tab', { name: 'Contratos' }))
    expect((await screen.findAllByText(/^R\$\s\d/)).length).toBeGreaterThan(0)
    expect(await screen.findByText('Plano mensal')).toBeTruthy()
  })

  it('a aba Atividade lista os eventos com data', async () => {
    await renderDemo(rotas, `/clientes/${clients[0]!.id}`)
    await fireEvent.press(await screen.findByRole('tab', { name: 'Atividade' }))
    expect(await screen.findByText('Fatura de setembro paga')).toBeTruthy()
    expect(await screen.findByText('29/09/2026')).toBeTruthy()
  })

  it('a aba Documentos mostra o estado vazio e Anexar só avisa', async () => {
    await renderDemo(rotas, `/clientes/${clients[0]!.id}`)
    await fireEvent.press(await screen.findByRole('tab', { name: 'Documentos' }))
    expect(await screen.findByText('Nenhum documento anexado')).toBeTruthy()
    await fireEvent.press(screen.getByRole('button', { name: 'Anexar documento' }))
    expect(await screen.findByText('Anexo simulado nesta demonstração')).toBeTruthy()
  })

  it('id inexistente mostra o estado de não encontrado', async () => {
    await renderDemo(rotas, '/clientes/9999')
    expect(await screen.findByText('Cliente não encontrado')).toBeTruthy()
    expect(screen.queryByRole('tab', { name: 'Resumo' })).toBeNull()
  })

  it('excluir pelo cabeçalho pede confirmação e volta à lista', async () => {
    const tela = await renderDemo(rotas, `/clientes/${clients[0]!.id}`)
    await fireEvent.press(await screen.findByRole('button', { name: 'Excluir cliente' }))
    expect(await screen.findByText('Excluir cliente?')).toBeTruthy()
    await fireEvent.press(await screen.findByRole('button', { name: 'Confirmar exclusão' }))
    expect(await screen.findByText('Lista de clientes')).toBeTruthy()
    expect(tela.getPathname()).toBe('/clientes')
    expect(await screen.findByText('Cliente excluído')).toBeTruthy()
  })

  it('cancelar a exclusão fica no detalhe', async () => {
    const tela = await renderDemo(rotas, `/clientes/${clients[0]!.id}`)
    await fireEvent.press(await screen.findByRole('button', { name: 'Excluir cliente' }))
    await fireEvent.press(await screen.findByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByText('Excluir cliente?')).toBeNull()
    expect(tela.getPathname()).toBe(`/clientes/${clients[0]!.id}`)
  })
})
