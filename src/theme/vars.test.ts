import { buildThemeVars, themeColorString } from './vars'
import { models } from './models'
import { createPalette } from '../brand/palette'
import { paletteSeeds } from '../brand/palettes'

const palette = createPalette(paletteSeeds[0]!) // Safira

const colorKeys = [
  '--rendra-background', '--rendra-foreground', '--rendra-card', '--rendra-card-foreground', '--rendra-popover', '--rendra-popover-foreground',
  '--rendra-muted', '--rendra-muted-foreground', '--rendra-border', '--rendra-input', '--rendra-field', '--rendra-ring', '--rendra-overlay',
  '--rendra-primary', '--rendra-primary-hover', '--rendra-primary-foreground', '--rendra-primary-hover-foreground',
  '--rendra-primary-soft', '--rendra-primary-soft-foreground', '--rendra-primary-text',
  '--rendra-secondary', '--rendra-secondary-hover', '--rendra-secondary-foreground', '--rendra-secondary-hover-foreground',
  '--rendra-accent', '--rendra-accent-foreground',
  '--rendra-destructive', '--rendra-destructive-hover', '--rendra-destructive-foreground', '--rendra-destructive-soft', '--rendra-destructive-soft-foreground',
  '--rendra-success', '--rendra-success-foreground', '--rendra-success-soft', '--rendra-success-soft-foreground',
  '--rendra-warning', '--rendra-warning-foreground', '--rendra-warning-soft', '--rendra-warning-soft-foreground',
  '--rendra-info', '--rendra-info-foreground', '--rendra-info-soft', '--rendra-info-soft-foreground',
  '--rendra-sidebar', '--rendra-sidebar-foreground', '--rendra-sidebar-muted-foreground', '--rendra-sidebar-border', '--rendra-sidebar-accent',
  '--rendra-sidebar-active', '--rendra-sidebar-active-foreground', '--rendra-sidebar-indicator', '--rendra-gradient-brand-foreground',
  '--rendra-chart-1', '--rendra-chart-2', '--rendra-chart-3', '--rendra-chart-4', '--rendra-chart-5',
]

describe('buildThemeVars', () => {
  it.each(['light', 'dark'] as const)('modo %s: tem todas as 58 chaves de cor, mais raio e sombra, sem degradê', (mode) => {
    const vars = buildThemeVars(models.T1, palette, mode)
    for (const key of colorKeys) expect(vars).toHaveProperty(key)
    expect(vars).toHaveProperty('--rendra-shape-control')
    expect(vars).toHaveProperty('--rendra-shape-item')
    expect(vars).toHaveProperty('--rendra-shape-surface')
    expect(vars).toHaveProperty('--rendra-shape-block')
    expect(vars).toHaveProperty('--rendra-shape-avatar')
    expect(vars).toHaveProperty('--rendra-shadow-color')
    expect(vars).toHaveProperty('--rendra-shadow-opacity-sm')
    expect(vars).toHaveProperty('--rendra-shadow-opacity-md')
    expect(vars).toHaveProperty('--rendra-shadow-opacity-lg')
    expect(vars['--rendra-gradient-brand']).toBeUndefined()
    expect(vars['--rendra-sidebar-image']).toBeUndefined()
  })

  it('raio muda por modelo (Safira square = 0px, Aurora pill = 28px no control), sempre com unidade', () => {
    const safira = buildThemeVars(models.T1, palette, 'light')
    const aurora = buildThemeVars(models.T3, palette, 'light')
    expect(safira['--rendra-shape-control']).toBe('0px')
    expect(aurora['--rendra-shape-control']).toBe('28px')
  })

  it('opacidade de sombra difere entre claro e escuro', () => {
    const light = buildThemeVars(models.T1, palette, 'light')
    const dark = buildThemeVars(models.T1, palette, 'dark')
    expect(light['--rendra-shadow-opacity-sm']).toBe('0.06')
    expect(dark['--rendra-shadow-opacity-sm']).toBe('0.3')
  })

  it('cor sólida vira trio r g b sem rgb(), inclusive cores de sistema', () => {
    const light = buildThemeVars(models.T1, palette, 'light')
    const dark = buildThemeVars(models.T1, palette, 'dark')
    expect(light['--rendra-primary']).toMatch(/^\d+ \d+ \d+$/)
    expect(light['--rendra-destructive']).toMatch(/^\d+ \d+ \d+$/)
    expect(light['--rendra-background']).toMatch(/^\d+ \d+ \d+$/)
    expect(dark['--rendra-card']).toMatch(/^\d+ \d+ \d+$/)
  })

  it('overlay já vem como rgb completo, sem conversão de trio', () => {
    const vars = buildThemeVars(models.T1, palette, 'light')
    expect(vars['--rendra-overlay']).toMatch(/^rgb\(/)
  })

  it('sidebar é cor sólida normal: vira trio r g b, igual --rendra-primary/--rendra-background (correção C1/C5)', () => {
    const vars = buildThemeVars(models.T1, palette, 'light')
    expect(vars['--rendra-sidebar']).toMatch(/^\d+ \d+ \d+$/)
  })

  it('--rendra-shadow-color é copiado direto de palette (já é trio, nunca hex)', () => {
    const light = buildThemeVars(models.T1, palette, 'light')
    const dark = buildThemeVars(models.T1, palette, 'dark')
    expect(light['--rendra-shadow-color']).toBe(palette.light['--rendra-shadow-color'])
    expect(dark['--rendra-shadow-color']).toBe('0 0 0')
  })

  it('toda chave comeca com --rendra- (item A1 do levantamento da Sincronizacao 1)', () => {
    const light = buildThemeVars(models.T1, palette, 'light')
    const dark = buildThemeVars(models.T1, palette, 'dark')
    for (const chave of [...Object.keys(light), ...Object.keys(dark)]) {
      expect(chave.startsWith('--rendra-')).toBe(true)
    }
  })

  it('--rendra-label-color e --rendra-help-color no claro e no escuro (item A2 do levantamento)', () => {
    const claro = buildThemeVars(models.T1, palette, 'light')
    const escuro = buildThemeVars(models.T1, palette, 'dark')
    expect(claro['--rendra-label-color']).toBe('95 111 130')
    expect(escuro['--rendra-label-color']).toBe('148 163 184')
    expect(claro['--rendra-help-color']).toBe(claro['--rendra-muted-foreground'])
    expect(escuro['--rendra-help-color']).toBe(escuro['--rendra-muted-foreground'])
  })
})

describe('themeColorString', () => {
  it('trio "R G B" vira rgb(...) usável como cor CSS', () => {
    const vars = buildThemeVars(models.T1, palette, 'light')
    expect(vars['--rendra-muted-foreground']).toMatch(/^\d+ \d+ \d+$/)
    expect(themeColorString(vars, '--rendra-muted-foreground')).toBe(`rgb(${vars['--rendra-muted-foreground']})`)
  })

  it('valor que já é rgb(...) (ex. --rendra-overlay) passa direto, sem envolver de novo', () => {
    const vars = buildThemeVars(models.T1, palette, 'light')
    expect(themeColorString(vars, '--rendra-overlay')).toBe(vars['--rendra-overlay'])
  })

  it('chave ausente devolve string vazia', () => {
    expect(themeColorString({}, '--rendra-nao-existe')).toBe('')
  })
})
