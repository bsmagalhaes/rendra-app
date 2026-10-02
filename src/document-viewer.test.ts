import * as entrada from './document-viewer'
import * as principal from './index'
import * as barrilUi from './components/ui'

describe('src/document-viewer.ts, entrada do subcaminho @rendra-ui/app/document-viewer', () => {
  it('exporta o DocumentViewer', () => {
    expect(typeof entrada.DocumentViewer).toBe('function')
  })

  it('a entrada principal e o barril de ui nao reexportam o visualizador (WebView fora do grafo principal)', () => {
    expect((principal as Record<string, unknown>).DocumentViewer).toBeUndefined()
    expect((barrilUi as Record<string, unknown>).DocumentViewer).toBeUndefined()
  })
})
