import { brandConfigs, activeBrandCode } from './brand.config'

describe('brandConfigs', () => {
  it('T1 Safira', () => {
    expect(brandConfigs.T1).toMatchObject({
      id: 'safira', productName: 'Rendra Safira', companyName: 'Rendra',
      shape: 'square', logoMode: 'themed', sidebarLogo: 'dark',
    })
  })
  it('T2 Equilíbrio', () => {
    expect(brandConfigs.T2).toMatchObject({ id: 'equilibrio', shape: 'rounded' })
  })
  it('T3 Aurora', () => {
    expect(brandConfigs.T3).toMatchObject({ id: 'aurora', shape: 'pill' })
  })
  it('padrão é T1', () => {
    expect(activeBrandCode).toBe('T1')
  })
  it('symbol e logo ficam undefined (sem arte própria, campos opcionais)', () => {
    expect(brandConfigs.T1.symbol).toBeUndefined()
    expect(brandConfigs.T1.logo).toBeUndefined()
  })
})
