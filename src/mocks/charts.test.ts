import { funilVendas, metaDoMes, porSegmento, receitaMensal } from './charts'

describe('mocks dos graficos', () => {
  it('receita mensal tem 12 meses unicos, com receita e meta positivas', () => {
    expect(receitaMensal).toHaveLength(12)
    expect(new Set(receitaMensal.map((m) => m.mes)).size).toBe(12)
    for (const m of receitaMensal) {
      expect(m.receita).toBeGreaterThan(0)
      expect(m.meta).toBeGreaterThan(0)
    }
    expect(receitaMensal[11]).toEqual({ mes: 'Set', receita: 61300, meta: 56000 })
  })

  it('segmentos vem do maior para o menor, sem repetir', () => {
    expect(porSegmento).toHaveLength(5)
    expect(porSegmento.map((s) => s.clientes)).toEqual([18, 16, 14, 12, 10])
    expect(new Set(porSegmento.map((s) => s.segmento)).size).toBe(5)
    expect(porSegmento.map((s) => s.segmento)).not.toContain('Alimentação')
  })

  it('o funil afunila etapa a etapa e a meta do mes cabe no maximo', () => {
    const valores = funilVendas.map((e) => e.value)
    expect([...valores].sort((a, b) => b - a)).toEqual(valores)
    expect(metaDoMes.value).toBeLessThan(metaDoMes.max)
    expect(metaDoMes.target).toBeLessThan(metaDoMes.max)
  })
})
