import { useSyncExternalStore } from 'react'
import type { CalendarEvent } from '../components/ui/calendar'
import { moveKanbanCard } from '../lib/kanban-move'
import { demoCards, demoEvents, type CardFunil } from '../mocks/planning'

/*
 * Funil e agenda da demonstração: os cards e os eventos são constantes de `src/mocks/planning`, e
 * este módulo guarda o que muda nesta sessão (card movido ou enviado do menu da tarefa, evento
 * novo). As telas leem o mesmo estado, então o card movido e o evento novo sobrevivem à navegação;
 * recarregar a página devolve o original (nada é gravado).
 */

interface Estado {
  cards: readonly CardFunil[]
  eventos: readonly CalendarEvent[]
}

const inicial: Estado = { cards: demoCards, eventos: demoEvents }

let estado: Estado = inicial
let contador = 0
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

/** Move o card para a coluna e a posição de destino (0 = topo). */
export function moverCard(cardId: string, colunaId: string, indice: number) {
  estado = { ...estado, cards: moveKanbanCard([...estado.cards], cardId, colunaId, indice) }
  emitir()
}

/** Põe o card no topo da coluna dele; um id que já está no funil não entra de novo. */
export function adicionarCard(card: CardFunil) {
  if (estado.cards.some((c) => c.id === card.id)) return
  estado = { ...estado, cards: moveKanbanCard([card, ...estado.cards], card.id, card.columnId, 0) }
  emitir()
}

/** Cria o evento (id gerado) ao fim da lista e o devolve. */
export function adicionarEvento(dados: Omit<CalendarEvent, 'id'>): CalendarEvent {
  contador += 1
  const evento: CalendarEvent = { ...dados, id: `ev-novo-${contador}` }
  estado = { ...estado, eventos: [...estado.eventos, evento] }
  emitir()
  return evento
}

export function restaurarPlanejamento() {
  estado = inicial
  contador = 0
  emitir()
}

const lerCards = () => estado.cards
const lerEventos = () => estado.eventos

/** Os cards do funil agora. */
export function useCards(): readonly CardFunil[] {
  return useSyncExternalStore(assinar, lerCards, lerCards)
}

/** Os eventos da agenda agora. */
export function useEventos(): readonly CalendarEvent[] {
  return useSyncExternalStore(assinar, lerEventos, lerEventos)
}
