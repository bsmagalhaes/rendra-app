import { dayLabel, hhmm, secs, sizeLabel, stamp, waited } from './chat-format'

afterEach(() => {
  jest.useRealTimers()
})

function hojeAs(h: number, m: number) {
  jest.useFakeTimers({ now: new Date(2026, 9, 5, h, m), doNotFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'setImmediate', 'clearImmediate', 'nextTick', 'queueMicrotask'] })
}

describe('hhmm e secs', () => {
  it('formata a hora e a duracao', () => {
    expect(hhmm(new Date(2026, 9, 5, 9, 7))).toBe('09:07')
    expect(secs(0)).toBe('0:00')
    expect(secs(65)).toBe('1:05')
    expect(secs(600)).toBe('10:00')
  })
})

describe('stamp', () => {
  it('hoje mostra so a hora; outro dia mostra data e hora', () => {
    hojeAs(12, 0)
    expect(stamp(new Date(2026, 9, 5, 8, 30))).toBe('08:30')
    expect(stamp(new Date(2026, 9, 4, 23, 59))).toBe('04/10/2026 23:59')
  })
})

describe('dayLabel', () => {
  it('Hoje, Ontem e a data por extenso', () => {
    hojeAs(12, 0)
    expect(dayLabel(new Date(2026, 9, 5, 1, 0))).toBe('Hoje')
    expect(dayLabel(new Date(2026, 9, 4, 22, 0))).toBe('Ontem')
    expect(dayLabel(new Date(2026, 8, 20))).toBe('20 de setembro')
  })
})

describe('sizeLabel', () => {
  it('KB abaixo de 1 MB (minimo 1), MB com virgula acima, vazio sem tamanho', () => {
    expect(sizeLabel(undefined)).toBe('')
    expect(sizeLabel(10)).toBe('1 KB')
    expect(sizeLabel(2048)).toBe('2 KB')
    expect(sizeLabel(1024 * 1024)).toBe('1,0 MB')
    expect(sizeLabel(2.5 * 1024 * 1024)).toBe('2,5 MB')
  })
})

describe('waited', () => {
  it('minutos abaixo de uma hora; horas e minutos acima; nunca negativo', () => {
    const agora = new Date(2026, 9, 5, 12, 0)
    expect(waited(new Date(2026, 9, 5, 11, 45), agora)).toBe('15 min')
    expect(waited(new Date(2026, 9, 5, 10, 30), agora)).toBe('1 h 30 min')
    expect(waited(new Date(2026, 9, 5, 12, 10), agora)).toBe('0 min')
  })

  it('sem o segundo argumento usa a hora atual', () => {
    hojeAs(12, 0)
    expect(waited(new Date(2026, 9, 5, 11, 50))).toBe('10 min')
  })
})
