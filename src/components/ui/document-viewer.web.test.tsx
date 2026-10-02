import { Linking } from 'react-native'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { BrandProvider } from '../../brand/brand-provider'
import { nodesWithCode } from '../../test-utils/rendra-code'
// O Jest deste projeto resolve a plataforma `ios`; o arquivo do navegador entra pelo nome.
import { DocumentViewer } from './document-viewer.web'

// eslint-disable-next-line @typescript-eslint/no-require-imports -- sem @types/node no tsconfig
const { readFileSync } = require('fs') as { readFileSync: (caminho: string, codificacao: 'utf8') => string }
// eslint-disable-next-line @typescript-eslint/no-require-imports -- sem @types/node no tsconfig
const { join } = require('path') as { join: (...partes: string[]) => string }

afterEach(() => {
  jest.restoreAllMocks()
})

const renderizar = (ui: React.ReactElement) => render(<BrandProvider>{ui}</BrandProvider>)
const URL_PDF = 'https://exemplo.com.br/contrato.pdf'

describe('DocumentViewer (navegador: abrir fora)', () => {
  it('sem url mostra o estado vazio e a raiz carrega DOC-001', async () => {
    const { container } = await renderizar(<DocumentViewer url={null} title="Contrato" />)
    expect(nodesWithCode(container, 'DOC-001')).toHaveLength(1)
    expect(screen.getByText('Nenhum documento selecionado')).toBeTruthy()
    expect(screen.getByText('Escolha um arquivo PDF para visualizar aqui.')).toBeTruthy()
  })

  it('com url mostra o nome e o botao de abrir fora, que usa Linking.openURL', async () => {
    const abrir = jest.spyOn(Linking, 'openURL').mockResolvedValue(true)
    await renderizar(<DocumentViewer url={URL_PDF} title="Contrato de outubro" />)
    expect(screen.getByLabelText('Contrato de outubro').props.role).toBe('group')
    expect(screen.getByText('Contrato de outubro')).toBeTruthy()
    await fireEvent.press(screen.getByRole('button', { name: 'Abrir no aplicativo de PDF' }))
    expect(abrir).toHaveBeenCalledWith(URL_PDF)
  })

  it('se abrir falha, mostra o erro', async () => {
    jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('bloqueado'))
    await renderizar(<DocumentViewer url={URL_PDF} title="Contrato" errorTitle="Falhou" errorDescription="Tente de novo." />)
    await fireEvent.press(screen.getByRole('button', { name: 'Abrir no aplicativo de PDF' }))
    expect(await screen.findByText('Falhou')).toBeTruthy()
    expect(screen.getByText('Tente de novo.')).toBeTruthy()
  })

  it('o arquivo do navegador e o painel nunca importam react-native-webview', () => {
    for (const arquivo of ['document-viewer.web.tsx', 'document-viewer-fallback.tsx']) {
      const fonte = readFileSync(join(process.cwd(), 'src', 'components', 'ui', arquivo), 'utf8')
      expect(fonte).not.toMatch(/(from|require\()\s*['"]react-native-webview/)
    }
  })
})
