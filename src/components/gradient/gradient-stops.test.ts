import { gradientStops } from './gradient'
import { createPalette } from '../../brand/palette'
import { paletteSeeds } from '../../brand/palettes'

describe('gradientStops', () => {
  it('token brand devolve as 3 cores do degradê da paleta ativa (Safira)', () => {
    const palette = createPalette(paletteSeeds[0]!)
    expect(gradientStops(palette, 'light', 'brand')).toEqual(['#034889', '#0b1d37', '#07142a'])
  })

  // Correção pós-validação (item recomendado 5): Gradient passou a usar gradientStops também
  // para os ramos soft e accent (antes duplicava esta lógica dentro do componente); estes dois
  // casos travam o contrato da função para esses tokens antes/depois do refactor.
  it('token soft devolve [primary-soft, branco] no modo claro', () => {
    const palette = createPalette(paletteSeeds[0]!)
    expect(gradientStops(palette, 'light', 'soft')).toEqual([palette.light['--rendra-primary-soft']!, '#ffffff'])
  })

  it('token soft devolve [primary-soft, card] no modo escuro', () => {
    const palette = createPalette(paletteSeeds[0]!)
    expect(gradientStops(palette, 'dark', 'soft')).toEqual([palette.dark['--rendra-primary-soft']!, palette.dark['--rendra-card']!])
  })

  it('token accent devolve [primária semente, secundária semente], sem depender do modo', () => {
    const palette = createPalette(paletteSeeds[0]!)
    expect(gradientStops(palette, 'light', 'accent')).toEqual([paletteSeeds[0]!.primary, paletteSeeds[0]!.secondary])
    expect(gradientStops(palette, 'dark', 'accent')).toEqual([paletteSeeds[0]!.primary, paletteSeeds[0]!.secondary])
  })
})
