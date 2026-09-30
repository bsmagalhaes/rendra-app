import { useSyncExternalStore } from 'react'
import { clients, type Cliente } from '../mocks/clients'

/*
 * Carteira da demonstração: os clientes são constantes de `src/mocks`, então "excluir" só marca o
 * id como excluído e "cadastrar" acrescenta o cliente à frente da lista, nesta sessão. A lista,
 * o detalhe, o painel e o selo do menu leem o mesmo estado, e recarregar a página devolve a
 * carteira original (nada é gravado).
 */

interface Estado {
  excluidos: ReadonlySet<number>
  adicionados: readonly Cliente[]
  todos: readonly Cliente[]
}

const montar = (excluidos: ReadonlySet<number>, adicionados: readonly Cliente[]): Estado => ({
  excluidos,
  adicionados,
  todos: [...adicionados, ...clients].filter((c) => !excluidos.has(c.id)),
})

let estado: Estado = montar(new Set(), [])
const ouvintes = new Set<() => void>()

function emitir() {
  ouvintes.forEach((ouvinte) => ouvinte())
}

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte)
  return () => {
    ouvintes.delete(ouvinte)
  }
}

export function excluirCliente(id: number) {
  estado = montar(new Set(estado.excluidos).add(id), estado.adicionados)
  emitir()
}

export type NovoCliente = Partial<Omit<Cliente, 'id'>> & Pick<Cliente, 'nome'>

/** Cadastra o cliente à frente da carteira (id seguinte ao maior já usado) e o devolve. */
export function adicionarCliente(dados: NovoCliente): Cliente {
  const maiorId = Math.max(...clients.map((c) => c.id), ...estado.adicionados.map((c) => c.id))
  const cliente: Cliente = {
    email: '',
    telefone: '',
    cnpj: '',
    segmento: 'Serviços',
    situacao: 'Em análise',
    cidade: 'São Paulo',
    mrr: 490,
    ...dados,
    id: maiorId + 1,
  }
  estado = montar(estado.excluidos, [cliente, ...estado.adicionados])
  emitir()
  return cliente
}

export function restaurarClientes() {
  estado = montar(new Set(), [])
  emitir()
}

/** A carteira visível agora: os cadastrados na frente, sem os excluídos. */
export function useClientes(): readonly Cliente[] {
  return useSyncExternalStore(
    assinar,
    () => estado.todos,
    () => estado.todos,
  )
}
