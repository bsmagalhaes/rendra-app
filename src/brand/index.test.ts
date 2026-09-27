import * as barrel from './index'

// M2 (veredito Fable, Blocos 1 e 2): a decisão 9 do plano ("brand.config.ts sai do barrel
// src/brand/index.ts") não tinha teste nem registro; `brandConfigs`/`activeBrandCode` (marca de
// demonstração da vitrine) continuavam saindo pelo barrel, mesmo sem nenhum arquivo de produto
// (fora de `app/`) importando dali. Este teste prova a ausência real, não só o diff.
describe('src/brand/index.ts, barrel', () => {
  it('nao exporta a marca de demonstracao (brandConfigs/activeBrandCode ficam so em app/, decisao 9 do plano)', () => {
    expect((barrel as Record<string, unknown>).brandConfigs).toBeUndefined()
    expect((barrel as Record<string, unknown>).activeBrandCode).toBeUndefined()
  })

  it('continua exportando useBrand e BrandProvider (contrato publico do barrel intacto)', () => {
    expect(typeof barrel.useBrand).toBe('function')
    expect(typeof barrel.BrandProvider).toBe('function')
  })
})
