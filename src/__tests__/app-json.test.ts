import { createPalette } from '../brand/palette'
import { paletteSeeds } from '../brand/palettes'
import { systemColorsLight } from '../theme/tokens'

type PluginEntry = string | [string, Record<string, unknown>]

function pluginDoSplash() {
  // app.json é lido como dados, sem tipos
  const plugins = require('../../app.json').expo.plugins as PluginEntry[]
  const entrada = plugins.find((p) => Array.isArray(p) && p[0] === 'expo-splash-screen')
  return Array.isArray(entrada) ? entrada[1] : undefined
}

// C14 (veredito do Opus): o splash nativo não conhece a paleta escolhida, por isso é neutro e usa
// o fundo do tema padrão; estes testes impedem que as cores do JSON se desencontrem do tema.
describe('app.json, splash nativo', () => {
  it('configura o expo-splash-screen com o ícone e o fundo do tema padrão, claro e escuro', () => {
    const opcoes = pluginDoSplash()
    expect(opcoes).toBeDefined()
    expect(opcoes?.image).toBe('./assets/splash-icon.png')
    expect(opcoes?.backgroundColor).toBe(systemColorsLight.background)
  })

  it('o fundo escuro é o --rendra-background escuro da paleta padrão', () => {
    const escuro = createPalette(paletteSeeds[0]!).dark['--rendra-background']
    expect((pluginDoSplash()?.dark as { backgroundColor?: string } | undefined)?.backgroundColor).toBe(escuro)
  })
})
