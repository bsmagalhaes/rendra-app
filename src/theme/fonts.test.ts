import { FONT_ASSETS } from './fonts'
import { models } from './models'

describe('FONT_ASSETS', () => {
  it('tem os 9 pesos, 3 por modelo', () => {
    expect(Object.keys(FONT_ASSETS)).toHaveLength(9)
  })

  it('cada nome de fontFamily de models.ts existe em FONT_ASSETS', () => {
    for (const model of Object.values(models)) {
      for (const weight of Object.values(model.fontFamily)) {
        expect(Object.keys(FONT_ASSETS)).toContain(weight)
      }
    }
  })
})
