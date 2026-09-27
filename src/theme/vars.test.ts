import { buildThemeVars, themeColorString } from './vars'
import { models } from './models'
import { createPalette } from '../brand/palette'
import { paletteSeeds } from '../brand/palettes'

const palette = createPalette(paletteSeeds[0]!) // Safira

const colorKeys = [
  '--background', '--foreground', '--card', '--card-foreground', '--popover', '--popover-foreground',
  '--muted', '--muted-foreground', '--border', '--input', '--field', '--ring', '--overlay',
  '--primary', '--primary-hover', '--primary-foreground', '--primary-hover-foreground',
  '--primary-soft', '--primary-soft-foreground', '--primary-text',
  '--secondary', '--secondary-hover', '--secondary-foreground', '--secondary-hover-foreground',
  '--accent', '--accent-foreground',
  '--destructive', '--destructive-hover', '--destructive-foreground', '--destructive-soft', '--destructive-soft-foreground',
  '--success', '--success-foreground', '--success-soft', '--success-soft-foreground',
  '--warning', '--warning-foreground', '--warning-soft', '--warning-soft-foreground',
  '--info', '--info-foreground', '--info-soft', '--info-soft-foreground',
  '--sidebar', '--sidebar-foreground', '--sidebar-muted-foreground', '--sidebar-border', '--sidebar-accent',
  '--sidebar-active', '--sidebar-active-foreground', '--sidebar-indicator', '--gradient-brand-foreground',
  '--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5',
]

describe('buildThemeVars', () => {
  it.each(['light', 'dark'] as const)('modo %s: tem todas as 58 chaves de cor, mais raio e sombra, sem degradê', (mode) => {
    const vars = buildThemeVars(models.T1, palette, mode)
    for (const key of colorKeys) expect(vars).toHaveProperty(key)
    expect(vars).toHaveProperty('--radius-control')
    expect(vars).toHaveProperty('--radius-item')
    expect(vars).toHaveProperty('--radius-surface')
    expect(vars).toHaveProperty('--radius-block')
    expect(vars).toHaveProperty('--radius-avatar')
    expect(vars).toHaveProperty('--shadow-color')
    expect(vars).toHaveProperty('--shadow-opacity-sm')
    expect(vars).toHaveProperty('--shadow-opacity-md')
    expect(vars).toHaveProperty('--shadow-opacity-lg')
    expect(vars['--gradient-brand']).toBeUndefined()
    expect(vars['--sidebar-image']).toBeUndefined()
  })

  it('raio muda por modelo (Safira square = 0px, Aurora pill = 28px no control), sempre com unidade', () => {
    const safira = buildThemeVars(models.T1, palette, 'light')
    const aurora = buildThemeVars(models.T3, palette, 'light')
    expect(safira['--radius-control']).toBe('0px')
    expect(aurora['--radius-control']).toBe('28px')
  })

  it('opacidade de sombra difere entre claro e escuro', () => {
    const light = buildThemeVars(models.T1, palette, 'light')
    const dark = buildThemeVars(models.T1, palette, 'dark')
    expect(light['--shadow-opacity-sm']).toBe('0.06')
    expect(dark['--shadow-opacity-sm']).toBe('0.3')
  })

  it('cor sólida vira trio r g b sem rgb(), inclusive cores de sistema', () => {
    const light = buildThemeVars(models.T1, palette, 'light')
    const dark = buildThemeVars(models.T1, palette, 'dark')
    expect(light['--primary']).toMatch(/^\d+ \d+ \d+$/)
    expect(light['--destructive']).toMatch(/^\d+ \d+ \d+$/)
    expect(light['--background']).toMatch(/^\d+ \d+ \d+$/)
    expect(dark['--card']).toMatch(/^\d+ \d+ \d+$/)
  })

  it('overlay já vem como rgb completo, sem conversão de trio', () => {
    const vars = buildThemeVars(models.T1, palette, 'light')
    expect(vars['--overlay']).toMatch(/^rgb\(/)
  })

  it('sidebar é cor sólida normal: vira trio r g b, igual --primary/--background (correção C1/C5)', () => {
    const vars = buildThemeVars(models.T1, palette, 'light')
    expect(vars['--sidebar']).toMatch(/^\d+ \d+ \d+$/)
  })

  it('--shadow-color é copiado direto de palette (já é trio, nunca hex)', () => {
    const light = buildThemeVars(models.T1, palette, 'light')
    const dark = buildThemeVars(models.T1, palette, 'dark')
    expect(light['--shadow-color']).toBe(palette.light['--shadow-color'])
    expect(dark['--shadow-color']).toBe('0 0 0')
  })
})

describe('themeColorString', () => {
  it('trio "R G B" vira rgb(...) usável como cor CSS', () => {
    const vars = buildThemeVars(models.T1, palette, 'light')
    expect(vars['--muted-foreground']).toMatch(/^\d+ \d+ \d+$/)
    expect(themeColorString(vars, '--muted-foreground')).toBe(`rgb(${vars['--muted-foreground']})`)
  })

  it('valor que já é rgb(...) (ex. --overlay) passa direto, sem envolver de novo', () => {
    const vars = buildThemeVars(models.T1, palette, 'light')
    expect(themeColorString(vars, '--overlay')).toBe(vars['--overlay'])
  })

  it('chave ausente devolve string vazia', () => {
    expect(themeColorString({}, '--nao-existe')).toBe('')
  })
})
