import { systemColorsLight, systemColorsDark } from './tokens'

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
