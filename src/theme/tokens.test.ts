import { systemColorsLight, systemColorsDark } from './tokens'
import { buildThemeVars, themeColorString } from './vars'
import { models } from './models'
import { createPalette } from '../brand/palette'
import { paletteSeeds } from '../brand/palettes'

describe('cores fixas de sistema', () => {
  it('claro tem os 29 pares do contrato', () => {
    expect(systemColorsLight.background).toBe('#f5f6f7')
    expect(systemColorsLight.destructive).toBe('#b72c05')
    expect(systemColorsLight.destructiveHover).toBe('#962404')
    expect(systemColorsLight.infoSoftForeground).toBe('#0b58b5')
  })

  it('escuro só tem as cores de sistema fixas (sem os neutros, que vêm da paleta)', () => {
    expect(systemColorsDark.destructive).toBe('#b72c05')
    expect(systemColorsDark.destructiveHover).toBe('#cf3b0e')
    expect(systemColorsDark.successForeground).toBe('#04200f')
    expect(systemColorsDark.infoSoftForeground).toBe('#7fb4ef')
    expect((systemColorsDark as Record<string, string>).background).toBeUndefined()
  })
})

describe('cores do medidor do Chart gauge (F3, B1 do parecer)', () => {
  it('guarda o valor cru do web nos dois modos', () => {
    expect(systemColorsLight.meterLow).toBe('#dc2626')
    expect(systemColorsLight.meterMid).toBe('#f5b400')
    expect(systemColorsLight.meterHigh).toBe('#16a34a')
    expect(systemColorsDark.meterLow).toBe('#f05252')
    expect(systemColorsDark.meterMid).toBe('#facc15')
    expect(systemColorsDark.meterHigh).toBe('#34d399')
  })

  it('buildThemeVars grava o trio RGB de --rendra-meter-low/mid/high, nunca o hex', () => {
    const palette = createPalette(paletteSeeds[0]!)
    const clara = buildThemeVars(models.T1, palette, 'light')
    expect(clara['--rendra-meter-low']).toBe('220 38 38')
    expect(clara['--rendra-meter-mid']).toBe('245 180 0')
    expect(clara['--rendra-meter-high']).toBe('22 163 74')
    const escura = buildThemeVars(models.T1, palette, 'dark')
    expect(escura['--rendra-meter-low']).toBe('240 82 82')
    expect(escura['--rendra-meter-mid']).toBe('250 204 21')
    expect(escura['--rendra-meter-high']).toBe('52 211 153')
    expect(themeColorString(clara, '--rendra-meter-low')).toBe('rgb(220 38 38)')
  })
})
