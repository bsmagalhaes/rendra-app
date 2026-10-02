/**
 * Move um card na lista (para usar no `onCardMove` do `Kanban`): devolve a lista nova, ou a mesma
 * lista quando o card nao existe. `toIndex` e a posicao dentro da coluna de destino (0 = topo).
 * Mesmo comportamento do `moveKanbanCard` do design system web.
 */
export function moveKanbanCard<T extends { id: string; columnId: string }>(
  cards: T[],
  cardId: string,
  toColumnId: string,
  toIndex: number,
): T[] {
  const card = cards.find((c) => c.id === cardId)
  if (!card) return cards
  const rest = cards.filter((c) => c.id !== cardId)
  const target = rest.filter((c) => c.columnId === toColumnId)
  const before = target[Math.min(toIndex, target.length)]
  const moved = { ...card, columnId: toColumnId }
  if (!before) {
    const lastIndex = rest.map((c) => c.columnId).lastIndexOf(toColumnId)
    const at = lastIndex === -1 ? rest.length : lastIndex + 1
    return [...rest.slice(0, at), moved, ...rest.slice(at)]
  }
  const at = rest.indexOf(before)
  return [...rest.slice(0, at), moved, ...rest.slice(at)]
}
