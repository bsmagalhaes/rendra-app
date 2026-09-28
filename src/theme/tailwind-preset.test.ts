import rendraPreset from './tailwind-preset'

describe('rendraPreset (src/theme/tailwind-preset.ts)', () => {
  it('traz o token de toque minimo e a cor primaria resolvida por variavel css', () => {
    expect(rendraPreset.theme.spacing.touch).toBe('44px')
    expect(rendraPreset.theme.colors.primary).toContain('var(--rendra-primary)')
  })

  it('inclui o preset do nativewind', () => {
    // O preset do nativewind (`nativewind/preset`) e uma funcao (node_modules/nativewind/preset),
    // nao um objeto: `typeof` real e 'function', nao 'object' como um primeiro rascunho supunha.
    const tiposDePreset = rendraPreset.presets.map((p: unknown) => typeof p)
    expect(tiposDePreset).toContain('function')
  })

  it('tambem sai em CommonJS puro (module.exports), para o tailwind.config.js de quem instala o pacote', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- prova deliberada do module.exports em CommonJS puro (o que o tailwind.config.js de quem instala faz), nao um import de conveniencia
    const viaRequire = require('./tailwind-preset')
    expect(viaRequire.theme.spacing.touch).toBe('44px')
    expect(viaRequire.presets.length).toBe(rendraPreset.presets.length)
  })
})
