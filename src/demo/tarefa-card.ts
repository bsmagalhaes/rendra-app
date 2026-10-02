import { parse } from 'date-fns'
import { clients } from '../mocks/clients'
import type { CardFunil } from '../mocks/planning'
import type { Tarefa } from '../mocks/tasks'

/**
 * Card do funil para a tarefa que cita um cliente da carteira (`clienteId`): entra na primeira
 * coluna, com o nome e o CNPJ do cliente, o MRR dele e o prazo da tarefa. O id sai da tarefa, então
 * enviar a mesma tarefa duas vezes não duplica o card. Sem cliente, não há card.
 */
export function cardDaTarefa(tarefa: Tarefa): CardFunil | undefined {
  const cliente = clients.find((c) => c.id === tarefa.clienteId)
  if (!cliente) return undefined
  return {
    id: `tarefa-${tarefa.id}`,
    columnId: 'novo',
    title: cliente.nome,
    subtitle: cliente.cnpj,
    clienteId: cliente.id,
    dueDate: parse(tarefa.prazo, 'dd/MM/yyyy', new Date(2026, 0, 1)),
    values: { mrr: cliente.mrr },
  }
}
