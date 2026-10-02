import { clients } from '../mocks/clients'
import { tasks } from '../mocks/tasks'
import { cardDaTarefa } from './tarefa-card'

describe('card do funil a partir da tarefa', () => {
  it('leva o cliente, o CNPJ, o MRR e o prazo da tarefa, na primeira coluna, com id derivado da tarefa', () => {
    const tarefa = tasks.find((t) => t.id === 1)!
    const cliente = clients.find((c) => c.id === 1000)!
    const card = cardDaTarefa(tarefa)!
    expect(card).toMatchObject({
      id: 'tarefa-1',
      columnId: 'novo',
      title: cliente.nome,
      subtitle: cliente.cnpj,
      clienteId: 1000,
      values: { mrr: cliente.mrr },
    })
    expect(card.dueDate).toEqual(new Date(2026, 9, 2))
  })

  it('tarefa sem cliente não vira card', () => {
    expect(cardDaTarefa(tasks.find((t) => t.id === 8)!)).toBeUndefined()
    expect(cardDaTarefa(tasks.find((t) => t.id === 11)!)).toBeUndefined()
  })

  it('toda tarefa com cliente gera um card com id próprio', () => {
    const cards = tasks.map(cardDaTarefa).filter(Boolean)
    expect(cards).toHaveLength(10)
    expect(new Set(cards.map((c) => c!.id)).size).toBe(10)
  })
})
