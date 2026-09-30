import { act, renderHook } from '@testing-library/react-native'
import { clients } from '../mocks/clients'
import {
  adicionarCliente,
  excluirCliente,
  restaurarClientes,
  useClientes,
} from './clients-store'

afterEach(() => {
  restaurarClientes()
})

describe('clientes excluídos da demonstração', () => {
  it('a exclusão tira o cliente da carteira visível e restaurar devolve', async () => {
    const { result } = await renderHook(() => useClientes())
    expect(result.current).toHaveLength(48)
    await act(async () => {
      excluirCliente(1000)
      excluirCliente(1001)
    })
    expect(result.current.map((c) => c.id)).not.toContain(1000)
    expect(result.current).toHaveLength(46)
    await act(async () => {
      restaurarClientes()
    })
    expect(result.current).toHaveLength(48)
  })
})

describe('clientes cadastrados na demonstração', () => {
  it('o cliente novo entra na frente da carteira, com id seguinte, e sai ao restaurar', async () => {
    const { result } = await renderHook(() => useClientes())
    expect(result.current).toHaveLength(48)
    await act(async () => {
      adicionarCliente({ nome: 'Padaria Nova Ltda', email: 'nova@exemplo.com.br', cnpj: '11.222.333/0001-81' })
    })
    expect(result.current).toHaveLength(49)
    expect(result.current[0]!.nome).toBe('Padaria Nova Ltda')
    expect(result.current[0]!.id).toBe(clients[clients.length - 1]!.id + 1)
    expect(result.current[0]!.situacao).toBe('Em análise')
    await act(async () => {
      restaurarClientes()
    })
    expect(result.current).toHaveLength(48)
  })

  it('a exclusão também vale para o cliente cadastrado', async () => {
    const { result } = await renderHook(() => useClientes())
    let id = 0
    await act(async () => {
      id = adicionarCliente({ nome: 'Padaria Nova Ltda' }).id
      excluirCliente(id)
    })
    expect(result.current.some((c) => c.id === id)).toBe(false)
    expect(result.current).toHaveLength(48)
  })
})
