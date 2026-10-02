import { historicoContrato } from './timeline'

describe('mocks da timeline', () => {
  it('cinco eventos com ids unicos, cobrindo os tres resultados e um tom', () => {
    expect(historicoContrato).toHaveLength(5)
    expect(new Set(historicoContrato.map((e) => e.id)).size).toBe(5)
    expect(historicoContrato.map((e) => e.status).filter(Boolean)).toEqual(['succeeded', 'failed', 'skipped'])
    expect(historicoContrato.some((e) => e.tone === 'info')).toBe(true)
  })
})
