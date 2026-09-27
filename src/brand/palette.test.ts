import { createPalette, contrast, mix, paletteCss, type PaletteSeeds } from './palette'
import { paletteSeeds } from './palettes'

const pairs: [string, string][] = [
  ['--primary-foreground', '--primary'],
  ['--primary-hover-foreground', '--primary-hover'],
  ['--secondary-foreground', '--secondary'],
  ['--secondary-hover-foreground', '--secondary-hover'],
  ['--primary-soft-foreground', '--primary-soft'],
]

const cliente: PaletteSeeds = {
  id: 'cliente', name: 'Cliente',
  primary: '#ffcc00', primaryHover: '#e6b800',
  secondary: '#ff6699', secondaryHover: '#e0507f',
  gradient: ['#ffe680', '#ffcc00', '#b38f00'],
}

describe('createPalette', () => {
  it.each([...paletteSeeds, cliente])('AA em todos os pares texto/fundo de %s, claro e escuro', (seeds) => {
    const palette = createPalette(seeds)
    for (const mode of ['light', 'dark'] as const) {
      for (const [fg, bg] of pairs) {
        expect(contrast(palette[mode][fg]!, palette[mode][bg]!)).toBeGreaterThanOrEqual(4.5)
        expect(palette[mode][fg]).toMatch(/^#[0-9a-f]{6}$/)
      }
    }
    expect(contrast(palette.light['--primary-text']!, '#f5f6f7')).toBeGreaterThanOrEqual(4.5)
    expect(contrast(palette.dark['--primary-text']!, palette.dark['--card']!)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(palette.dark['--foreground']!, palette.dark['--card']!)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(palette.dark['--muted-foreground']!, palette.dark['--muted']!)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(palette.light['--sidebar-foreground']!, seeds.gradient[0])).toBeGreaterThanOrEqual(4.5)
    expect(contrast(palette.light['--sidebar-muted-foreground']!, seeds.gradient[0])).toBeGreaterThanOrEqual(4.5)
  })

  it('Safira: primária e secundária cruas, sem ajuste', () => {
    const p = createPalette(paletteSeeds[0]!)
    expect(p.light['--primary']).toBe('#0b6fe0')
    expect(p.light['--secondary']).toBe('#98d10a')
    expect(p.adjustments).toEqual([])
  })

  it('Ardósia: secundária ajustada, com nota', () => {
    const ardosia = paletteSeeds.find((s) => s.id === 'ardosia')!
    const p = createPalette(ardosia)
    expect(p.light['--secondary']).not.toBe('#ea600d')
    expect(p.light['--secondary-foreground']).toBe('#ffffff')
    expect(p.adjustments.join()).toMatch(/Secundária: #EA600D ajustada/)
  })

  it('sidebarLogo por paleta', () => {
    expect(createPalette(cliente).sidebarLogo).toBe('light')
    expect(createPalette(paletteSeeds[0]!).sidebarLogo).toBe('dark')
  })

  it('lança em cor inválida', () => {
    expect(() => createPalette({ ...cliente, primary: 'azul' })).toThrow(/Cor inválida/)
  })

  it('--shadow-color já é um trio RGB nos dois modos, nunca hex (spec 5.3)', () => {
    const p = createPalette(paletteSeeds[0]!)
    expect(p.light['--shadow-color']).toMatch(/^\d+ \d+ \d+$/)
    expect(p.dark['--shadow-color']).toBe('0 0 0')
  })
})

describe('mix e contrast', () => {
  it('mix meio a meio de preto e branco é cinza médio', () => {
    expect(mix('#000000', '#ffffff', 0.5)).toBe('#808080')
  })
  it('contraste preto/branco é próximo de 21', () => {
    expect(Math.round(contrast('#000000', '#ffffff'))).toBe(21)
  })
  it('contraste de uma cor com ela mesma é 1', () => {
    expect(contrast('#777777', '#777777')).toBe(1)
  })
})

describe('paletteCss', () => {
  it('gera os seletores certos', () => {
    const css = paletteCss(createPalette(cliente))
    expect(css).toContain(":root[data-palette='cliente'] {")
    expect(css).toContain(":root[data-palette='cliente'].dark {")
  })
})
