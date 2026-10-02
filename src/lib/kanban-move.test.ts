import { moveKanbanCard } from './kanban-move'

const cards = [
  { id: 'a', columnId: 'x', title: 'A' },
  { id: 'b', columnId: 'x', title: 'B' },
  { id: 'c', columnId: 'y', title: 'C' },
]
const ordem = (lista: typeof cards, coluna: string) => lista.filter((c) => c.columnId === coluna).map((c) => c.id)

describe('moveKanbanCard', () => {
  it('move para outra coluna na posicao pedida', () => {
    const r = moveKanbanCard(cards, 'a', 'y', 0)
    expect(ordem(r, 'y')).toEqual(['a', 'c'])
    expect(ordem(r, 'x')).toEqual(['b'])
  })

  it('move para o fim da coluna quando o indice passa do tamanho', () => {
    expect(ordem(moveKanbanCard(cards, 'a', 'y', 9), 'y')).toEqual(['c', 'a'])
  })

  it('reordena dentro da mesma coluna', () => {
    expect(ordem(moveKanbanCard(cards, 'b', 'x', 0), 'x')).toEqual(['b', 'a'])
  })

  it('move para coluna vazia', () => {
    expect(ordem(moveKanbanCard(cards, 'c', 'z', 0), 'z')).toEqual(['c'])
  })

  it('card inexistente devolve a mesma lista, sem alterar', () => {
    expect(moveKanbanCard(cards, 'nao-existe', 'y', 0)).toBe(cards)
  })

  it('nao altera a lista original e preserva os demais campos do card', () => {
    const copia = JSON.parse(JSON.stringify(cards))
    const r = moveKanbanCard(cards, 'a', 'y', 0)
    expect(cards).toEqual(copia)
    expect(r.find((c) => c.id === 'a')).toEqual({ id: 'a', columnId: 'y', title: 'A' })
  })

  it('card que entra no fim de uma coluna fica logo depois do ultimo card dela, mesmo no meio da lista', () => {
    const lista = [
      { id: 'a', columnId: 'x', title: 'A' },
      { id: 'b', columnId: 'y', title: 'B' },
      { id: 'c', columnId: 'y', title: 'C' },
    ]
    const r = moveKanbanCard(lista, 'c', 'x', 99)
    expect(r.map((c) => c.id)).toEqual(['a', 'c', 'b'])
  })
})
