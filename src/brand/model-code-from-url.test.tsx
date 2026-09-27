import { renderRouter, screen, waitFor } from 'expo-router/testing-library'
import { Slot } from 'expo-router'
import { fireEvent } from '@testing-library/react-native'
import { Pressable, Text } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { BrandProvider, useBrand } from './index'
import { ModelCodeFromUrl } from './model-code-from-url'
import { RendraRouterBridge } from '../router-bridge'
// B1 (veredito do Opus): `app/_layout.tsx` exporta `RootLayout` como `default`, nunca nomeado;
// este arquivo já declara uma função local `RootLayout` (abaixo), então o layout real da árvore
// do app entra sob um nome próprio, sem colidir com ele.
import RealRootLayout from '../../app/_layout'

function Probe() {
  const { modelCode, paletteId, resolvedMode } = useBrand()
  return <Text>{`${modelCode}-${paletteId}-${resolvedMode}`}</Text>
}

// Achado B4 (veredito do Opus): `ModelCodeFromUrl` deixa de ler `expo-router` direto e passa a
// ler `searchParams` do contexto de navegação (`useRendraNavigation`); o `RootLayout` local
// precisa fornecer esse contexto com o `RendraRouterBridge`, mesmo padrão que `app/_layout.tsx`
// real passa a usar.
function RootLayout() {
  return (
    <BrandProvider>
      <RendraRouterBridge>
        <ModelCodeFromUrl />
        <Slot />
      </RendraRouterBridge>
    </BrandProvider>
  )
}

describe('ModelCodeFromUrl', () => {
  // Melhoria da rodada 4 de validação: sem limpar o AsyncStorage entre casos, o 2º caso falha
  // deterministicamente (herda o estado persistido pelo 1º caso, `?codigo=T3-C4`).
  beforeEach(() => AsyncStorage.clear())

  it('aplica ?codigo=T3-C4 depois de hydrated, em qualquer rota (não só /galeria)', async () => {
    await renderRouter(
      { _layout: RootLayout, tokens: Probe },
      { initialUrl: '/tokens?codigo=T3-C4' },
    )
    await waitFor(() => expect(screen.getByText('T3-ardosia-light')).toBeTruthy())
  })

  it('aplica ?modo=escuro depois de hydrated', async () => {
    await renderRouter(
      { _layout: RootLayout, tokens: Probe },
      { initialUrl: '/tokens?modo=escuro' },
    )
    await waitFor(() => expect(screen.getByText('T1-safira-dark')).toBeTruthy())
  })

  // B1 (veredito do Opus): teste de regressão da armadilha da troca ao vivo (levantamento 2.6).
  // Reproduz a causa: `persist` muda de identidade a cada troca de modelo/paleta/modo
  // (brand-provider.tsx:100-105), então `setModelAndPalette`/`setMode` (deps do useEffect de
  // ModelCodeFromUrl) também mudam de identidade a cada troca; sem a guarda por valor aplicado,
  // o efeito reaplicava `?codigo=T1-C1` da URL a cada re-render, revertendo a troca manual.
  it('depois de aplicar ?codigo=, uma troca manual de setModelCode nao e revertida (regressao)', async () => {
    function Probe2() {
      const { setModelCode, hydrated } = useBrand()
      return (
        <Pressable
          testID="trocar"
          onPress={() => {
            if (hydrated) setModelCode('T3')
          }}
        >
          <Text>Trocar</Text>
        </Pressable>
      )
    }
    await renderRouter({ _layout: RealRootLayout, index: Probe2 }, { initialUrl: '/?codigo=T1-C1' })
    await screen.findByTestId('rendra-T1-C1')
    await fireEvent.press(screen.getByTestId('trocar'))
    expect(await screen.findByTestId('rendra-T3-C1')).toBeTruthy()
    expect(screen.queryByTestId('rendra-T1-C1')).toBeNull()
  })
})
