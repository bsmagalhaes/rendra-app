import { contrast, createPalette } from '../brand/palette'
import { paletteSeeds } from '../brand/palettes'
import { systemColorsLight, systemColorsDark } from './tokens'

const SUPERFICIES_ESCURO = ['--rendra-card', '--rendra-background', '--rendra-popover'] as const

describe('contraste AA do rotulo e da orientacao, nas 4 paletas, claro e escuro (item H4 do levantamento)', () => {
  it('rotulo discreto no claro (#5f6f82), sobre branco e sobre field, pelo menos 4.5:1', () => {
    expect(contrast(systemColorsLight.labelColor, '#ffffff')).toBeGreaterThanOrEqual(4.5)
    expect(contrast(systemColorsLight.labelColor, systemColorsLight.field)).toBeGreaterThanOrEqual(4.5)
  })

  it.each(paletteSeeds)('rotulo discreto no escuro (#94a3b8) sobre card/background/popover de %s, pelo menos 4.5:1', (seed) => {
    const escuro = createPalette(seed).dark
    for (const chave of SUPERFICIES_ESCURO) {
      expect(contrast(systemColorsDark.labelColor, escuro[chave]!)).toBeGreaterThanOrEqual(4.5)
    }
  })

  it.each(paletteSeeds)('foreground e muted-foreground de %s continuam AA sobre card/background/popover no escuro', (seed) => {
    const escuro = createPalette(seed).dark
    for (const chave of SUPERFICIES_ESCURO) {
      expect(contrast(escuro['--rendra-foreground']!, escuro[chave]!)).toBeGreaterThanOrEqual(4.5)
      expect(contrast(escuro['--rendra-muted-foreground']!, escuro[chave]!)).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('registra que #6b7a8d falha o contraste (nao usar essa cor)', () => {
    expect(contrast('#6b7a8d', '#ffffff')).toBeLessThan(4.5)
  })
})
