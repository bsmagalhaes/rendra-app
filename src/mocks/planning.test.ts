import { clients } from './clients'
import { demoCards, demoEvents, pipelineColumns, referencia } from './planning'

describe('mocks de planejamento', () => {
  it('eventos tem ids unicos, datas fixas e o dia de referencia tem compromissos', () => {
    expect(new Set(demoEvents.map((e) => e.id)).size).toBe(demoEvents.length)
    const doDia = demoEvents.filter((e) => e.start.toDateString() === referencia.toDateString())
    expect(doDia.map((e) => e.title)).toEqual(['Reunião de equipe', 'Visita: Padaria Bom Grão'])
  })

  it('todo evento com fim termina depois de comecar', () => {
    for (const e of demoEvents) if (e.end) expect(e.end.getTime()).toBeGreaterThan(e.start.getTime())
  })
})

describe('mocks do funil (kanban)', () => {
  it('todo card aponta para uma coluna existente e os ids sao unicos', () => {
    const colunas = new Set(pipelineColumns.map((c) => c.id))
    expect(new Set(demoCards.map((c) => c.id)).size).toBe(demoCards.length)
    for (const card of demoCards) expect(colunas.has(card.columnId)).toBe(true)
  })

  it('todo card tem clienteId da carteira, com o mesmo nome e o CNPJ do cliente', () => {
    const ids = { k1: 1000, k2: 1018, k3: 1009, k4: 1036, k5: 1027, k6: 1045, k7: 1006, k8: 1015 }
    expect(demoCards).toHaveLength(8)
    for (const card of demoCards) {
      expect(card.clienteId).toBe(ids[card.id as keyof typeof ids])
      const cliente = clients.find((c) => c.id === card.clienteId)!
      expect(card.title).toBe(cliente.nome)
      expect(card.subtitle).toBe(cliente.cnpj)
    }
  })

  it('a coluna de proposta passa do limite (mostra o alerta) e a de fechamento nao', () => {
    const naColuna = (id: string) => demoCards.filter((c) => c.columnId === id).length
    expect(naColuna('proposta')).toBeGreaterThan(pipelineColumns.find((c) => c.id === 'proposta')!.limit!)
    expect(naColuna('fechamento')).toBeGreaterThan(0)
  })
})
