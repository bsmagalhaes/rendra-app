import { useRendraFonts, FONT_ASSETS } from './fonts'
import * as themeFonts from './theme/fonts'

describe('src/fonts.ts', () => {
  it('reexporta useRendraFonts e FONT_ASSETS de src/theme/fonts, sem duplicar', () => {
    expect(useRendraFonts).toBe(themeFonts.useRendraFonts)
    expect(FONT_ASSETS).toBe(themeFonts.FONT_ASSETS)
  })
})
