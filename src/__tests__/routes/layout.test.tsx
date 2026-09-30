import { act, renderRouter, screen, waitFor } from 'expo-router/testing-library'
import { Text } from 'react-native'
import * as SplashScreen from 'expo-splash-screen'
import RootLayout from '../../../app/_layout'
import { toast } from '../../components/ui'

// B16 (veredito do Opus): o módulo é trocado por funções de mock, porque `jest.spyOn` sobre um
// `import * as` não é confiável sob o interop do Babel.
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve(true)),
  setOptions: jest.fn(),
  hideAsync: jest.fn(() => Promise.resolve()),
}))

// Sob o Jest `isRunningInExpoGo()` é verdadeiro; o layout só configura o splash nativo fora do
// Expo Go (lá `setOptions` só emite aviso), então o teste simula um build de desenvolvimento.
jest.mock('expo', () => ({ ...jest.requireActual('expo'), isRunningInExpoGo: () => false }))

const OCULTOS = { includeHiddenElements: true }

describe('RootLayout', () => {
  it('a raiz não tem SafeAreaView: o inset superior é do cabeçalho do shell e das telas fora dele (raiz-rotas)', async () => {
    await renderRouter({ _layout: RootLayout, index: () => <Text>Tela</Text> }, { initialUrl: '/' })
    await waitFor(() => expect(screen.getByTestId('raiz-rotas')).toBeTruthy())
    expect(screen.queryByTestId('safe-area-raiz')).toBeNull()
  })

  // C9 (veredito do Opus): o caso original (fila vazia) passava antes e depois do Toaster
  // montado, sem afirmar nenhum efeito da montagem. Este caso só passa com o Toaster de fato
  // montado no layout raiz: dispara um toast de qualquer tela e confere que o texto aparece.
  it('o Toaster montado no layout raiz mostra um toast disparado de qualquer tela', async () => {
    await renderRouter({ _layout: RootLayout, index: () => <Text>Tela</Text> }, { initialUrl: '/' })
    await waitFor(() => expect(screen.getByTestId('raiz-rotas')).toBeTruthy())
    await act(async () => {
      toast.success('Salvo no layout')
    })
    expect(await screen.findByText('Salvo no layout')).toBeTruthy()
    await act(async () => {
      toast.dismiss()
    })
  })

  // B16: o overlay do splash entra na árvore e só depois o splash nativo é escondido; o mesmo
  // efeito confere que o nativo foi configurado para sair com fade.
  it('monta o overlay animado por cima das rotas e só então esconde o splash nativo', async () => {
    const chamadasAntes = jest.mocked(SplashScreen.hideAsync).mock.calls.length
    await renderRouter({ _layout: RootLayout, index: () => <Text>Tela</Text> }, { initialUrl: '/' })
    expect(await screen.findByTestId('rendra-splash', OCULTOS)).toBeTruthy()
    await waitFor(() => expect(SplashScreen.hideAsync).toHaveBeenCalledTimes(chamadasAntes + 1))
    expect(SplashScreen.setOptions).toHaveBeenCalledWith({ fade: true, duration: 300 })
    expect(screen.getByText('Tela')).toBeTruthy()
  })

  it('o overlay sai sozinho depois da animação e deixa a tela', async () => {
    await renderRouter({ _layout: RootLayout, index: () => <Text>Tela</Text> }, { initialUrl: '/' })
    await screen.findByTestId('rendra-splash', OCULTOS)
    await waitFor(() => expect(screen.queryByTestId('rendra-splash', OCULTOS)).toBeNull(), { timeout: 4000 })
    expect(screen.getByText('Tela')).toBeTruthy()
  })
})
