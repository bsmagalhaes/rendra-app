import type { Shape } from '../lib/shape'

export type ModelId = 'T1' | 'T2' | 'T3'

export interface Model {
  code: ModelId
  brandId: 'safira' | 'equilibrio' | 'aurora'
  name: string
  productName: string
  tagline: string
  fontFamily: { normal: string; medium: string; semibold: string }
  shape: Shape
  radius: number
}

export const models: Record<ModelId, Model> = {
  T1: {
    code: 'T1', brandId: 'safira', name: 'Safira',
    productName: 'Rendra Safira', tagline: 'Precisão lapidada em cada tela.',
    fontFamily: { normal: 'Poppins_400Regular', medium: 'Poppins_500Medium', semibold: 'Poppins_600SemiBold' },
    shape: 'square', radius: 10,
  },
  T2: {
    code: 'T2', brandId: 'equilibrio', name: 'Equilíbrio',
    productName: 'Rendra Equilíbrio', tagline: 'O ponto certo entre firmeza e leveza.',
    fontFamily: { normal: 'DMSans_400Regular', medium: 'DMSans_500Medium', semibold: 'DMSans_600SemiBold' },
    shape: 'rounded', radius: 8,
  },
  T3: {
    code: 'T3', brandId: 'aurora', name: 'Aurora',
    productName: 'Rendra Aurora', tagline: 'Um novo dia, claro e leve, em cada tela.',
    fontFamily: { normal: 'Inter_400Regular', medium: 'Inter_500Medium', semibold: 'Inter_600SemiBold' },
    shape: 'pill', radius: 6,
  },
}
