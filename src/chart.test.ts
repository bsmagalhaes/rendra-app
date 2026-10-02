import * as entrada from './chart'
import * as principal from './index'
import * as barrilUi from './components/ui'

describe('src/chart.ts, entrada do subcaminho @rendra-ui/app/chart', () => {
  it('exporta o Chart e a funcao de cor da serie', () => {
    expect(typeof entrada.Chart).toBe('function')
    expect(typeof entrada.seriesColor).toBe('function')
  })

  it('a entrada principal e o barril de ui nao reexportam o Chart (d3-shape fora do grafo principal)', () => {
    expect((principal as Record<string, unknown>).Chart).toBeUndefined()
    expect((principal as Record<string, unknown>).seriesColor).toBeUndefined()
    expect((barrilUi as Record<string, unknown>).Chart).toBeUndefined()
  })
})
