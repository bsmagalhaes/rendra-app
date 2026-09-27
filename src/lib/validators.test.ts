import { isValidCpf, isValidCnpj, isValidDateBR, zBR } from './validators'

describe('isValidCpf', () => {
  it.each([['529.982.247-25', true], ['52998224725', true], ['529.982.247-24', false], ['5299822472', false], ['111.111.111-11', false], ['', false]])(
    '%s -> %s', (input, expected) => { expect(isValidCpf(input)).toBe(expected) },
  )
})

describe('isValidCnpj', () => {
  it.each([['11.222.333/0001-81', true], ['11222333000181', true], ['11.222.333/0001-80', false], ['00.000.000/0000-00', false]])(
    '%s -> %s', (input, expected) => { expect(isValidCnpj(input)).toBe(expected) },
  )
})

describe('isValidDateBR', () => {
  it.each([['23/09/2026', true], ['29/02/2024', true], ['29/02/2026', false], ['31/04/2026', false], ['2026-09-23', false]])(
    '%s -> %s', (input, expected) => { expect(isValidDateBR(input)).toBe(expected) },
  )
})

describe('zBR', () => {
  it('required', () => {
    const r = zBR.required('Nome').safeParse('  ')
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.issues[0]?.message).toBe('Nome é obrigatório.')
  })
  it('email', () => {
    const r = zBR.email().safeParse('ana@')
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.issues[0]?.message).toBe('E-mail inválido.')
  })
  it('cpfCnpj', () => {
    expect(zBR.cpfCnpj().safeParse('529.982.247-25').success).toBe(true)
    expect(zBR.cpfCnpj().safeParse('11.222.333/0001-81').success).toBe(true)
    expect(zBR.cpfCnpj().safeParse('11.222.333/0001-80').success).toBe(false)
  })
  it('phone', () => {
    expect(zBR.phone().safeParse('(11) 3333-4444').success).toBe(true)
    expect(zBR.phone().safeParse('(11) 93333-4444').success).toBe(true)
    expect(zBR.phone().safeParse('(11) 3333-444').success).toBe(false)
  })
})

describe('zBR, cobertura completa das 8 chaves', () => {
  it.each([
    ['required', '', false],
    ['required', 'x', true],
    ['email', 'nome@exemplo.com', true],
    ['email', 'nome@', false],
    ['cpf', '111.444.777-35', true],
    ['cpf', '111.111.111-11', false],
    ['cnpj', '11.222.333/0001-81', true],
    ['cnpj', '11.111.111/1111-11', false],
    ['cpfCnpj', '111.444.777-35', true],
    ['cpfCnpj', '11.222.333/0001-81', true],
    ['phone', '(11) 98888-7777', true],
    ['phone', '123', false],
    ['cep', '01310-100', true],
    ['cep', '000', false],
    ['dateBR', '31/12/2026', true],
    ['dateBR', '31/02/2026', false],
  ] as const)('zBR.%s com "%s" resolve valido=%s', (chave, valor, esperado) => {
    const resultado = zBR[chave]().safeParse(valor)
    expect(resultado.success).toBe(esperado)
  })
})
