import * as pacote from './index'

describe('src/index.ts, entrada principal do pacote', () => {
  it('exporta os componentes de UI e o BrandProvider, funcoes de verdade', () => {
    // Button e forwardRef (React.forwardRef devolve um objeto com $$typeof, nao uma funcao);
    // os demais aqui sao funcoes de componente ou hooks comuns.
    expect(typeof pacote.Button).toBe('object')
    expect(pacote.Button).toBeTruthy()
    expect(typeof pacote.BrandProvider).toBe('function')
    expect(typeof pacote.useBrand).toBe('function')
    expect(typeof pacote.Gradient).toBe('function')
    expect(typeof pacote.registerIconInterop).toBe('function')
    expect(typeof pacote.useControlledState).toBe('function')
    expect(typeof pacote.usePlaceholderColor).toBe('function')
    expect(typeof pacote.createPalette).toBe('function')
    expect(typeof pacote.buildThemeVars).toBe('function')
  })

  it('exporta RendraNavigationProvider e useRendraNavigation (lacuna 4 do veredito Fable: README.md:262, docs/PROMPT_MIGRACAO.md:43, docs/COMO_APLICAR.md:33 prometem os dois)', () => {
    expect(typeof pacote.RendraNavigationProvider).toBe('function')
    expect(typeof pacote.useRendraNavigation).toBe('function')
  })

  it('nao exporta a marca de demonstracao nem o componente ligado ao roteador', () => {
    expect((pacote as Record<string, unknown>).brandConfigs).toBeUndefined()
    expect((pacote as Record<string, unknown>).activeBrandCode).toBeUndefined()
    expect((pacote as Record<string, unknown>).ModelCodeFromUrl).toBeUndefined()
  })
})
