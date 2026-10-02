/**
 * Posicao da grade de horas do `Calendar` (F3). Funcoes puras: o `top`/`height` calculado vai em
 * `style` no `calendar.tsx` (excecao R3 registrada). O valor vem de chamada de funcao, nunca de
 * numero literal no `style`, que e o unico caso que R4 acusa; por isso o minuto exato do web
 * (`(inicio em horas - hora inicial) * 48`) e mantido, sem arredondar a 24px.
 */

/** Altura de uma hora na grade, em px (`h-12`). */
export const HOUR_HEIGHT = 48
/** Altura minima de um evento, em px (`spacing-6`). */
export const MIN_EVENT_HEIGHT = 24

const hours = (date: Date) => date.getHours() + date.getMinutes() / 60

export function eventTop(event: { start: Date }, firstHour: number): number {
  return (hours(event.start) - firstHour) * HOUR_HEIGHT
}

/** Sem `end`, o evento dura 1 hora. */
export function eventHeight(event: { start: Date; end?: Date }): number {
  const spanHours = event.end ? (event.end.getTime() - event.start.getTime()) / 3_600_000 : 1
  return Math.max(spanHours * HOUR_HEIGHT, MIN_EVENT_HEIGHT)
}

/** Topo da linha de "agora". */
export function nowTop(now: Date, firstHour: number): number {
  return (hours(now) - firstHour) * HOUR_HEIGHT
}
