import { Linking, Platform } from 'react-native'
import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { WebView } from 'react-native-webview'
import { BrandProvider } from '../../brand/brand-provider'
import { nodesWithCode } from '../../test-utils/rendra-code'
import { DocumentViewer } from './document-viewer'

const webview = WebView as unknown as jest.Mock
const URL_PDF = 'https://exemplo.com.br/contrato.pdf'

beforeEach(() => {
  webview.mockClear()
})
afterEach(() => {
  jest.restoreAllMocks()
})

const renderizar = (ui: React.ReactElement) => render(<BrandProvider>{ui}</BrandProvider>)
const ultimasProps = () => webview.mock.calls[webview.mock.calls.length - 1]![0] as {
  source: { uri: string }
  onLoadEnd: () => void
  onError: () => void
  onHttpError: () => void
}

describe('DocumentViewer (nativo)', () => {
  it('sem url mostra o estado vazio, com os textos padrao ou os recebidos, e nenhum WebView', async () => {
    const { container, unmount } = await renderizar(<DocumentViewer url={null} title="Contrato" />)
    expect(nodesWithCode(container, 'DOC-001')).toHaveLength(1)
    expect(screen.getByText('Nenhum documento selecionado')).toBeTruthy()
    expect(screen.getByText('Escolha um arquivo PDF para visualizar aqui.')).toBeTruthy()
    expect(webview).not.toHaveBeenCalled()
    await unmount()
    await renderizar(<DocumentViewer url={null} title="Contrato" emptyTitle="Sem contrato" emptyDescription="Anexe o contrato." />)
    expect(screen.getByText('Sem contrato')).toBeTruthy()
    expect(screen.getByText('Anexe o contrato.')).toBeTruthy()
  })

  it('a raiz e um grupo com o nome do documento', async () => {
    await renderizar(<DocumentViewer url={URL_PDF} title="Contrato de outubro" />)
    const raiz = screen.getByLabelText('Contrato de outubro')
    expect(raiz.props.role).toBe('group')
  })

  it('no iOS abre o PDF no WebView, com o aviso de carregamento ate o fim', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios')
    await renderizar(<DocumentViewer url={URL_PDF} title="Contrato" />)
    expect(ultimasProps().source).toEqual({ uri: URL_PDF })
    expect(screen.getByText('Carregando documento...')).toBeTruthy()
    await act(async () => {
      ultimasProps().onLoadEnd()
    })
    expect(screen.queryByText('Carregando documento...')).toBeNull()
  })

  it('o texto de carregamento pode ser trocado', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios')
    await renderizar(<DocumentViewer url={URL_PDF} title="Contrato" loadingLabel="Buscando o contrato..." />)
    expect(screen.getByText('Buscando o contrato...')).toBeTruthy()
  })

  it.each(['onError', 'onHttpError'] as const)('%s mostra o erro, tira o WebView e oferece abrir fora', async (evento) => {
    jest.replaceProperty(Platform, 'OS', 'ios')
    const abrir = jest.spyOn(Linking, 'openURL').mockResolvedValue(true)
    await renderizar(<DocumentViewer url={URL_PDF} title="Contrato" />)
    await act(async () => {
      ultimasProps()[evento]()
    })
    expect(screen.getByText('Não foi possível abrir o documento')).toBeTruthy()
    expect(screen.getByText('O arquivo pode estar indisponível ou corrompido.')).toBeTruthy()
    expect(screen.queryByText('Carregando documento...')).toBeNull()
    const chamadasAntes = webview.mock.calls.length
    await fireEvent.press(screen.getByRole('button', { name: 'Abrir no aplicativo de PDF' }))
    expect(abrir).toHaveBeenCalledWith(URL_PDF)
    expect(webview.mock.calls.length).toBe(chamadasAntes)
  })

  it('o WebView dispara onLoadEnd depois do erro: o erro continua na tela', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios')
    await renderizar(<DocumentViewer url={URL_PDF} title="Contrato" />)
    const props = ultimasProps()
    await act(async () => {
      props.onError()
    })
    await act(async () => {
      props.onLoadEnd()
    })
    expect(screen.getByText('Não foi possível abrir o documento')).toBeTruthy()
  })

  it('trocar a url volta ao carregamento', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios')
    const { rerender } = await renderizar(<DocumentViewer url={URL_PDF} title="Contrato" />)
    await act(async () => {
      ultimasProps().onError()
    })
    expect(screen.getByText('Não foi possível abrir o documento')).toBeTruthy()
    await rerender(
      <BrandProvider>
        <DocumentViewer url="https://exemplo.com.br/outro.pdf" title="Contrato" />
      </BrandProvider>,
    )
    expect(screen.queryByText('Não foi possível abrir o documento')).toBeNull()
    expect(screen.getByText('Carregando documento...')).toBeTruthy()
    expect(ultimasProps().source).toEqual({ uri: 'https://exemplo.com.br/outro.pdf' })
  })

  it('no Android nao ha WebView: mostra o painel com o nome do documento e o botao de abrir fora', async () => {
    jest.replaceProperty(Platform, 'OS', 'android')
    const abrir = jest.spyOn(Linking, 'openURL').mockResolvedValue(true)
    await renderizar(<DocumentViewer url={URL_PDF} title="Contrato de outubro" />)
    expect(webview).not.toHaveBeenCalled()
    expect(screen.getByText('Contrato de outubro')).toBeTruthy()
    await fireEvent.press(screen.getByRole('button', { name: 'Abrir no aplicativo de PDF' }))
    expect(abrir).toHaveBeenCalledWith(URL_PDF)
  })

  it('openLabel troca o texto do botao', async () => {
    jest.replaceProperty(Platform, 'OS', 'android')
    await renderizar(<DocumentViewer url={URL_PDF} title="Contrato" openLabel="Ver contrato" />)
    expect(screen.getByRole('button', { name: 'Ver contrato' })).toBeTruthy()
  })

  it('se nenhum aplicativo abre o PDF, o painel mostra o erro e o botao continua la', async () => {
    jest.replaceProperty(Platform, 'OS', 'android')
    jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('sem aplicativo'))
    await renderizar(<DocumentViewer url={URL_PDF} title="Contrato" />)
    expect(screen.queryByText('Não foi possível abrir o documento')).toBeNull()
    await fireEvent.press(screen.getByRole('button', { name: 'Abrir no aplicativo de PDF' }))
    expect(await screen.findByText('Não foi possível abrir o documento')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Abrir no aplicativo de PDF' })).toBeTruthy()
  })
})
