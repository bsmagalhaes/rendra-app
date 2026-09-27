import {
  parseLocaleNumber,
  formatCurrency,
  toE164,
  toCents,
  formatCents,
  masks,
  phoneCountries,
  DEFAULT_DDI,
  internationalPhoneMask,
} from './masks'
import type { MaskName } from './masks'

describe('parseLocaleNumber', () => {
  it.each([
    ['R$ 1.250,00', 1250],
    ['12,5 %', 12.5],
    ['R$ 0,99', 0.99],
  ])('%s -> %s', (input, expected) => {
    expect(parseLocaleNumber(input)).toBe(expected)
  })
  it.each(['', 'R$ '])('%s -> null', (input) => {
    expect(parseLocaleNumber(input)).toBeNull()
  })
})

describe('formatCurrency', () => {
  it('1250 -> R$ 1.250,00', () => {
    expect(formatCurrency(1250).replace(/\s/g, ' ')).toBe('R$ 1.250,00')
  })
})

describe('toE164', () => {
  it.each([
    ['55', '(11) 91234-5678', '+5511912345678'],
    ['351', '912 345 678', '+351912345678'],
    ['55', '', ''],
  ])('(%s, %s) -> %s', (ddi, national, expected) => {
    expect(toE164(ddi, national)).toBe(expected)
  })
})

describe('toCents', () => {
  it.each([
    ['R$ 1.250,50', 125050],
    ['R$ 0,10', 10],
    ['R$ 0,1', 10],
    ['R$ 19,99', 1999],
    ['R$ 1.000', 100000],
  ])('%s -> %s', (input, expected) => {
    expect(toCents(input)).toBe(expected)
  })
  it('soma de dois valores em centavos', () => {
    expect((toCents('R$ 0,10') ?? 0) + (toCents('R$ 0,20') ?? 0)).toBe(30)
  })
  it.each(['', 'R$ '])('%s -> null', (input) => {
    expect(toCents(input)).toBeNull()
  })
})

describe('formatCents', () => {
  it('125050 -> R$ 1.250,50', () => {
    expect(formatCents(125050).replace(/\s/g, ' ')).toBe('R$ 1.250,50')
  })
})

describe('masks, cobertura das 9 chaves e valores extremos', () => {
  it.each(Object.keys(masks) as MaskName[])('mask %s define options, inputMode e placeholder', (nome) => {
    expect(masks[nome].options).toBeTruthy()
    expect(['numeric', 'tel', 'decimal']).toContain(masks[nome].inputMode)
    expect(masks[nome].placeholder.length).toBeGreaterThan(0)
  })

  it('phoneCountries tem 14 paises, Brasil primeiro com o DDI padrao', () => {
    expect(phoneCountries).toHaveLength(14)
    expect(phoneCountries[0]).toEqual({ ddi: DEFAULT_DDI, name: 'Brasil' })
    expect(internationalPhoneMask.inputMode).toBe('tel')
  })

  it('parseLocaleNumber devolve null quando o texto limpo nao e numero finito', () => {
    expect(parseLocaleNumber('1-2')).toBeNull()
  })

  it('toCents com parte inteira vazia usa zero', () => {
    expect(toCents(',50')).toBe(50)
  })
})
