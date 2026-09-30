import { lookupCep, lookupCnpj } from './lookups'

describe('lookups fictícios', () => {
  it('CEP conhecido devolve cidade e UF', async () => {
    await expect(lookupCep('01310100')).resolves.toEqual({ cidade: 'São Paulo', uf: 'SP' })
  })

  it('CNPJ conhecido devolve a razão social de exemplo', async () => {
    await expect(lookupCnpj('11222333000181')).resolves.toEqual({ razaoSocial: 'Comercial Aurora Ltda' })
  })

  it('desconhecidos devolvem null', async () => {
    await expect(lookupCep('00000000')).resolves.toBeNull()
    await expect(lookupCnpj('00000000000000')).resolves.toBeNull()
  })

  it('aceita o valor com máscara', async () => {
    await expect(lookupCep('01310-100')).resolves.toEqual({ cidade: 'São Paulo', uf: 'SP' })
    await expect(lookupCnpj('11.222.333/0001-81')).resolves.toEqual({ razaoSocial: 'Comercial Aurora Ltda' })
  })
})
