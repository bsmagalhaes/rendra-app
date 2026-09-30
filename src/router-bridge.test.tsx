import { useState } from 'react'
import { fireEvent, waitFor } from '@testing-library/react-native'
import { renderRouter } from 'expo-router/testing-library'
import { Text, Pressable } from 'react-native'
import { RendraRouterBridge } from './router-bridge'
import { useRendraNavigation, type RendraNavigationValue } from './navigation/rendra-navigation'

function Sonda() {
  const nav = useRendraNavigation()
  return <Text testID="path">{`${nav.currentPath}|${nav.searchParams?.codigo}`}</Text>
}

function SondaNavega() {
  const nav = useRendraNavigation()
  return (
    <Pressable accessibilityRole="button" onPress={() => nav.navigate('/destino')}>
      <Text>Ir</Text>
    </Pressable>
  )
}

function SondaVolta() {
  const nav = useRendraNavigation()
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        if (nav.canGoBack?.()) nav.goBack?.()
      }}
    >
      <Text>Voltar</Text>
    </Pressable>
  )
}

function SondaPodeVoltar() {
  const nav = useRendraNavigation()
  return <Text>{`pode:${String(nav.canGoBack?.())}`}</Text>
}

describe('RendraRouterBridge', () => {
  // C5 (veredito do Opus): o teste afirma o valor de verdade (currentPath e searchParams.codigo
  // lidos do expo-router real), nao so que o bridge montou sem erro.
  it('alimenta currentPath e searchParams a partir do expo-router', async () => {
    const context = await renderRouter(
      {
        index: () => (
          <RendraRouterBridge>
            <Sonda />
          </RendraRouterBridge>
        ),
      },
      { initialUrl: '/?codigo=T2-C2' },
    )
    expect((await context.findByTestId('path')).props.children).toBe('/|T2-C2')
  })

  it('navigate do contexto chama o router de verdade, chegando na rota de destino', async () => {
    const context = await renderRouter(
      {
        index: () => (
          <RendraRouterBridge>
            <SondaNavega />
          </RendraRouterBridge>
        ),
        destino: () => <Text>Tela de destino</Text>,
      },
      { initialUrl: '/' },
    )
    await fireEvent.press(await context.findByRole('button', { name: 'Ir' }))
    expect(await context.findByText('Tela de destino')).toBeTruthy()
  })

  it('goBack do contexto volta para a tela anterior de verdade', async () => {
    const context = await renderRouter(
      {
        index: () => (
          <RendraRouterBridge>
            <SondaNavega />
            <Text>Tela inicial</Text>
          </RendraRouterBridge>
        ),
        destino: () => (
          <RendraRouterBridge>
            <SondaVolta />
          </RendraRouterBridge>
        ),
      },
      { initialUrl: '/' },
    )
    await fireEvent.press(await context.findByRole('button', { name: 'Ir' }))
    await fireEvent.press(await context.findByRole('button', { name: 'Voltar' }))
    expect(await context.findByText('Tela inicial')).toBeTruthy()
  })

  it('canGoBack responde falso na primeira tela e verdadeiro depois de navegar', async () => {
    const context = await renderRouter(
      {
        index: () => (
          <RendraRouterBridge>
            <SondaNavega />
            <SondaPodeVoltar />
          </RendraRouterBridge>
        ),
        destino: () => (
          <RendraRouterBridge>
            <SondaPodeVoltar />
          </RendraRouterBridge>
        ),
      },
      { initialUrl: '/' },
    )
    expect(await context.findByText('pode:false')).toBeTruthy()
    await fireEvent.press(await context.findByRole('button', { name: 'Ir' }))
    expect(await context.findByText('pode:true')).toBeTruthy()
  })

  // M4 (veredito Fable, Blocos 1 e 2): sem useMemo, este value era recriado a cada render do
  // bridge, e todo consumidor de useRendraNavigation rerenderizava mesmo sem mudança de rota.
  // O teste afirma o efeito real (mesma referência entre dois renders), não a chamada do hook.
  it('memoiza o value do contexto: rerender sem mudar rota mantem a mesma referencia', async () => {
    const capturados: RendraNavigationValue[] = []
    function SondaReferencia() {
      const nav = useRendraNavigation()
      capturados.push(nav)
      return null
    }
    function ComContador() {
      const [n, setN] = useState(0)
      return (
        <RendraRouterBridge>
          <Pressable accessibilityRole="button" onPress={() => setN((v) => v + 1)}>
            <Text>{`n:${n}`}</Text>
          </Pressable>
          <SondaReferencia />
        </RendraRouterBridge>
      )
    }
    const context = await renderRouter({ index: () => <ComContador /> }, { initialUrl: '/' })
    const antesDoToque = capturados.length
    await fireEvent.press(await context.findByRole('button', { name: 'n:0' }))
    await waitFor(() => expect(context.getByText('n:1')).toBeTruthy())
    expect(capturados.length).toBeGreaterThan(antesDoToque)
    expect(capturados[capturados.length - 1]).toBe(capturados[0])
  })
})
