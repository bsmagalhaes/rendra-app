import { parseModelCode, formatModelCode, defaultModelCode } from './presets'

describe('parseModelCode', () => {
  it('T1-C4', () => {
    const r = parseModelCode('T1-C4')
    expect(r.theme?.brand).toBe('safira')
    expect(r.color?.palette).toBe('ardosia')
  })
  it('c3 minúsculo', () => {
    expect(parseModelCode('c3').color?.palette).toBe('aurora')
  })
  it('código desconhecido vira objeto vazio', () => {
    expect(parseModelCode('T9-X1')).toEqual({})
  })
  it('ignora M (menu não existe no app)', () => {
    expect(formatModelCode(parseModelCode('M2 C1 T3'))).toBe('T3-C1')
  })
})

describe('formatModelCode', () => {
  it('monta na ordem tema, cores', () => {
    expect(formatModelCode(parseModelCode('C1 T3'))).toBe('T3-C1')
  })
})

describe('defaultModelCode', () => {
  it('é T1-C1', () => {
    expect(defaultModelCode).toBe('T1-C1')
  })
})
