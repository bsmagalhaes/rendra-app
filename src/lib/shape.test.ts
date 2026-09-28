import { radiusByRole, shapeLabels } from './shape'

describe('radiusByRole', () => {
  it('square: tudo 0', () => {
    expect(radiusByRole('square', 10)).toEqual({ control: 0, item: 0, surface: 0, block: 0, avatar: 0 })
  })
  it('rounded, radius 8 (Equilíbrio)', () => {
    expect(radiusByRole('rounded', 8)).toEqual({ control: 6, item: 4, surface: 8, block: 4, avatar: 9999 })
  })
  it('pill, radius 6 (Aurora)', () => {
    expect(radiusByRole('pill', 6)).toEqual({ control: 28, item: 28, surface: 18, block: 6, avatar: 9999 })
  })
  it('rótulos em pt-BR', () => {
    expect(shapeLabels.square).toBe('Quadrado')
    expect(shapeLabels.rounded).toBe('Meio-termo')
    expect(shapeLabels.pill).toBe('100% arredondado')
  })
})
