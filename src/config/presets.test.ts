import { parseModelCode, formatModelCode, defaultModelCode, navCodes } from './presets'

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
  it('reconhece a parte N e devolve a navegação escolhida', () => {
    const r = parseModelCode('T2-C3-N2')
    expect(r.nav?.code).toBe('N2')
    expect(r.nav?.name).toBe('Folha e barra')
    expect(r.theme?.brand).toBe('equilibrio')
    expect(r.color?.palette).toBe('aurora')
    expect(formatModelCode(r)).toBe('T2-C3-N2')
  })
  it('N desconhecido não define navegação', () => {
    expect(parseModelCode('N9').nav).toBeUndefined()
    expect(parseModelCode('T1-N9')).toEqual({ theme: expect.objectContaining({ code: 'T1' }) })
  })
  it('T1-C4 sem N continua sem nav', () => {
    expect(parseModelCode('T1-C4').nav).toBeUndefined()
    expect(formatModelCode(parseModelCode('T1-C4'))).toBe('T1-C4')
  })
})

describe('navCodes', () => {
  it('descreve N1 a N3 com código, nome e descrição', () => {
    expect(navCodes.map((n) => n.code)).toEqual(['N1', 'N2', 'N3'])
    expect(navCodes[0]!.description).toMatch(/gaveta/i)
    expect(navCodes[1]!.description).toMatch(/folha/i)
    expect(navCodes[2]!.description).toMatch(/só gaveta/i)
  })
})

describe('formatModelCode', () => {
  it('monta na ordem tema, cores', () => {
    expect(formatModelCode(parseModelCode('C1 T3'))).toBe('T3-C1')
  })
})

describe('defaultModelCode', () => {
  it('é T1-C1-N1', () => {
    expect(defaultModelCode).toBe('T1-C1-N1')
  })
  it('round trip: o padrão volta idêntico por parse e format', () => {
    expect(formatModelCode(parseModelCode(defaultModelCode))).toBe(defaultModelCode)
  })
})
