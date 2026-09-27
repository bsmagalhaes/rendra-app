import { act, renderRouter, screen, waitFor } from 'expo-router/testing-library'
import { Text } from 'react-native'
import RootLayout from '../../../app/_layout'
import { toast } from '../../components/ui'

describe('RootLayout', () => {
  it('envolve as rotas num SafeAreaView com inset superior (safe-area-raiz)', async () => {
    await renderRouter({ _layout: RootLayout, index: () => <Text>Tela</Text> }, { initialUrl: '/' })
    await waitFor(() => expect(screen.getByTestId('safe-area-raiz')).toBeTruthy())
    // O SafeAreaView real (react-native-safe-area-context) normaliza a prop `edges` recebida
    // (array com só 'top') para um Record com as 4 bordas antes de repassar ao componente nativo
    // (node_modules/react-native-safe-area-context/src/SafeAreaView.tsx); por isso a checagem é
    // no valor 'additive' da borda 'top', não numa lista contendo a string 'top'.
    const edges = screen.getByTestId('safe-area-raiz').props.edges
    expect(edges.top).toBe('additive')
    expect(edges.bottom).toBe('off')
    expect(edges.left).toBe('off')
    expect(edges.right).toBe('off')
  })

  // C9 (veredito do Opus): o caso original (fila vazia) passava antes e depois do Toaster
  // montado, sem afirmar nenhum efeito da montagem. Este caso só passa com o Toaster de fato
  // montado no layout raiz: dispara um toast de qualquer tela e confere que o texto aparece.
  it('o Toaster montado no layout raiz mostra um toast disparado de qualquer tela', async () => {
    await renderRouter({ _layout: RootLayout, index: () => <Text>Tela</Text> }, { initialUrl: '/' })
    await waitFor(() => expect(screen.getByTestId('safe-area-raiz')).toBeTruthy())
    await act(async () => {
      toast.success('Salvo no layout')
    })
    expect(await screen.findByText('Salvo no layout')).toBeTruthy()
    await act(async () => {
      toast.dismiss()
    })
  })
})
