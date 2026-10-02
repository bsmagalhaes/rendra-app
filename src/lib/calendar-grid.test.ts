import { eventHeight, eventTop, HOUR_HEIGHT, MIN_EVENT_HEIGHT, nowTop } from './calendar-grid'

describe('grade de horas do Calendar', () => {
  it('calcula o topo e a altura do evento na grade de 48px por hora', () => {
    expect(eventTop({ start: new Date(2026, 0, 1, 8, 30) }, 7)).toBeCloseTo((8.5 - 7) * 48)
    expect(eventHeight({ start: new Date(2026, 0, 1, 8, 0), end: new Date(2026, 0, 1, 9, 30) })).toBeCloseTo(1.5 * 48)
    expect(eventHeight({ start: new Date(2026, 0, 1, 8, 0) })).toBe(48) // sem end, dura 1h
    expect(eventHeight({ start: new Date(2026, 0, 1, 8, 0), end: new Date(2026, 0, 1, 8, 5) })).toBe(24) // minimo 24px
  })

  it('exporta as constantes da grade', () => {
    expect(HOUR_HEIGHT).toBe(48)
    expect(MIN_EVENT_HEIGHT).toBe(24)
  })

  it('a linha de agora segue a mesma conta do evento', () => {
    expect(nowTop(new Date(2026, 9, 5, 10, 30), 7)).toBeCloseTo((10.5 - 7) * 48)
  })
})
