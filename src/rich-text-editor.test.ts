import * as entrada from './rich-text-editor'
import * as principal from './index'
import * as barrilUi from './components/ui'

describe('src/rich-text-editor.ts, entrada do subcaminho @rendra-ui/app/rich-text-editor', () => {
  it('exporta o RichTextEditor', () => {
    expect(typeof entrada.RichTextEditor).toBe('function')
  })

  it('a entrada principal e o barril de ui nao reexportam o editor (tentap e webview fora do grafo principal)', () => {
    expect((principal as Record<string, unknown>).RichTextEditor).toBeUndefined()
    expect((barrilUi as Record<string, unknown>).RichTextEditor).toBeUndefined()
  })
})
