import { paletteSeeds } from './palettes'

describe('paletteSeeds', () => {
  it('tem as 4 paletas prontas, na ordem do contrato', () => {
    expect(paletteSeeds.map((s) => s.id)).toEqual(['safira', 'equilibrio', 'aurora', 'ardosia'])
  })

  it('só a Ardósia define onSecondary', () => {
    for (const s of paletteSeeds) {
      if (s.id === 'ardosia') expect(s.onSecondary).toBe('light')
      else expect(s.onSecondary).toBeUndefined()
      expect(s.onPrimary).toBeUndefined()
    }
  })

  it('Safira tem as sementes literais do contrato', () => {
    const safira = paletteSeeds[0]!
    expect(safira).toMatchObject({
      primary: '#0b6fe0', primaryHover: '#98d10a',
      secondary: '#98d10a', secondaryHover: '#0b6fe0',
      gradient: ['#034889', '#0b1d37', '#07142a'],
    })
  })
})
