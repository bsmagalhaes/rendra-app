import { models } from './models'

describe('models', () => {
  it('T1 Safira: Poppins, square, radius 10', () => {
    expect(models.T1).toMatchObject({
      brandId: 'safira', shape: 'square', radius: 10,
      fontFamily: { normal: 'Poppins_400Regular', medium: 'Poppins_500Medium', semibold: 'Poppins_600SemiBold' },
      productName: 'Rendra Safira', tagline: 'Precisão lapidada em cada tela.',
    })
  })
  it('T2 Equilíbrio: DM Sans, rounded, radius 10', () => {
    expect(models.T2).toMatchObject({
      brandId: 'equilibrio', shape: 'rounded', radius: 10,
      fontFamily: { normal: 'DMSans_400Regular', medium: 'DMSans_500Medium', semibold: 'DMSans_600SemiBold' },
      productName: 'Rendra Equilíbrio', tagline: 'O ponto certo entre firmeza e leveza.',
    })
  })
  it('T3 Aurora: Inter, pill, radius 6', () => {
    expect(models.T3).toMatchObject({
      brandId: 'aurora', shape: 'pill', radius: 6,
      fontFamily: { normal: 'Inter_400Regular', medium: 'Inter_500Medium', semibold: 'Inter_600SemiBold' },
      productName: 'Rendra Aurora', tagline: 'Um novo dia, claro e leve, em cada tela.',
    })
  })
})
