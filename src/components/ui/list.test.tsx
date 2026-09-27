import { useState, type ReactNode } from 'react'
import { fireEvent, render, within } from '@testing-library/react-native'
import { renderRouter } from 'expo-router/testing-library'
import { Pressable, Text, View } from 'react-native'
import { BrandProvider } from '../../brand'
import { RendraNavigationProvider } from '../../navigation/rendra-navigation'
import { RendraRouterBridge } from '../../router-bridge'
import { List } from './list'

const items = [
  { id: '1', title: 'Ana Souza', description: 'ana@exemplo.com' },
  { id: '2', title: 'Bruno Lima', description: 'bruno@exemplo.com' },
  { id: '3', title: 'Carla Dias', description: 'carla@exemplo.com' },
]

// C3 (veredito do Opus): a asserção de efeito de `onPress` afirma um texto que muda no
// wrapper, não só a chamada do handler.
function Arquivavel() {
  const [feito, setFeito] = useState(false)
  return (
    <List
      items={[{ id: '1', title: feito ? 'Arquivado' : 'Arquivar', onPress: () => setFeito(true) }]}
    />
  )
}

describe('List', () => {
  it('com divided (padrão), rende 2 separadores para 3 itens; divided=false rende 0', async () => {
    const { getAllByRole, rerender, queryAllByRole } = await render(
      <BrandProvider><List items={items} /></BrandProvider>,
    )
    expect(getAllByRole('separator')).toHaveLength(2)
    await rerender(<BrandProvider><List items={items} divided={false} /></BrandProvider>)
    expect(queryAllByRole('separator')).toHaveLength(0)
  })

  it('sem itens, mostra empty; com itens, o empty some', async () => {
    const { findByText } = await render(
      <BrandProvider>
        <List items={[]} empty={<Text className="text-muted-foreground">Nada por aqui</Text>} />
      </BrandProvider>,
    )
    expect(await findByText('Nada por aqui')).toBeTruthy()
    const { queryByText } = await render(
      <BrandProvider>
        <List items={items} empty={<Text className="text-muted-foreground">Nada por aqui</Text>} />
      </BrandProvider>,
    )
    expect(queryByText('Nada por aqui')).toBeNull()
  })

  // B4 (veredito do Opus): `Text` interno (`src/components/internal/text.tsx`) chama `useBrand()`
  // e lança sem `BrandProvider`; a rota `index` precisa envolver o `List` no provider. Depois da
  // Tarefa 2.3, o `List` lê `navigate`/`linkComponent` do contexto de navegação, então a rota
  // também precisa do `RendraRouterBridge` (fornece o `Link` real do Expo Router, preservando o
  // `<a href>` no export web).
  it('item com href navega para a rota de destino', async () => {
    const context = await renderRouter(
      {
        index: () => (
          <BrandProvider>
            <RendraRouterBridge>
              <List items={[{ id: '1', title: 'Cliente', href: '/destino' }]} />
            </RendraRouterBridge>
          </BrandProvider>
        ),
        destino: () => <Text className="text-foreground">Tela de destino</Text>,
      },
      { initialUrl: '/' },
    )
    await fireEvent.press(await context.findByRole('link', { name: 'Cliente' }))
    expect(await context.findByText('Tela de destino')).toBeTruthy()
  })

  // B5 (veredito do Opus): sem `linkComponent` no contexto, o item com `href` cai no `Pressable`
  // que chama `navigate` do contexto (não o `Link` do Expo Router).
  it('sem linkComponent no contexto, item com href chama navigate ao tocar', async () => {
    const navigate = jest.fn()
    const { findByRole } = await render(
      <BrandProvider>
        <RendraNavigationProvider value={{ navigate }}>
          <List items={[{ id: '1', title: 'Item', href: '/destino' }]} />
        </RendraNavigationProvider>
      </BrandProvider>,
    )
    await fireEvent.press(await findByRole('link', { name: 'Item' }))
    expect(navigate).toHaveBeenCalledWith('/destino')
  })

  // B5 (veredito do Opus): com `linkComponent` no contexto, o `List` usa esse componente em vez
  // do `Pressable` com `navigate`.
  it('com linkComponent no contexto, o List usa o componente do bridge em vez de navigate', async () => {
    function LinkDeMentira({ href, children }: { href: string; children?: ReactNode }) {
      return <View testID={`link-${href}`}>{children}</View>
    }
    const { getByTestId } = await render(
      <BrandProvider>
        <RendraNavigationProvider value={{ navigate: jest.fn(), linkComponent: LinkDeMentira }}>
          <List items={[{ id: '1', title: 'Item', href: '/destino' }]} />
        </RendraNavigationProvider>
      </BrandProvider>,
    )
    const wrapper = getByTestId('link-/destino')
    expect(wrapper).toBeTruthy()
    expect(within(wrapper).getByRole('link', { name: 'Item' })).toBeTruthy()
  })

  it('item com onPress muda o texto do wrapper ao tocar (Arquivar -> Arquivado)', async () => {
    const { findByRole, findByText } = await render(<BrandProvider><Arquivavel /></BrandProvider>)
    await fireEvent.press(await findByRole('button', { name: 'Arquivar' }))
    expect(await findByText('Arquivado')).toBeTruthy()
  })

  // C3 (veredito do Opus): o chevron leva testID próprio por item; a asserção lê a presença
  // real do nó, não só a ausência do papel interativo.
  it('item sem acao nao tem papel interativo; chevron so aparece nos interativos', async () => {
    const { queryByRole, findByRole, queryByTestId, getByTestId } = await render(
      <BrandProvider>
        <List items={[{ id: '1', title: 'So leitura' }, { id: '2', title: 'Toca', onPress: () => {} }]} />
      </BrandProvider>,
    )
    expect(queryByRole('button', { name: 'So leitura' })).toBeNull()
    expect(queryByRole('link', { name: 'So leitura' })).toBeNull()
    expect(await findByRole('button', { name: 'Toca' })).toBeTruthy()
    // O ChevronRight (lucide) é decorativo (sem accessibilityLabel), então o próprio pacote
    // marca `aria-hidden="true"` por padrão; o RNTL exclui nós ocultos por padrão
    // (desvios3:36-41, mesmo achado do B7 do veredito do Opus para o BrandLogo).
    expect(queryByTestId('list-chevron-1', { includeHiddenElements: true })).toBeNull()
    expect(getByTestId('list-chevron-2', { includeHiddenElements: true })).toBeTruthy()
  })

  it('titulo trunca em 1 linha e descricao em 2', async () => {
    const { findByText } = await render(<BrandProvider><List items={items} /></BrandProvider>)
    expect((await findByText('Ana Souza')).props.numberOfLines).toBe(1)
    expect((await findByText('ana@exemplo.com')).props.numberOfLines).toBe(2)
  })

  it('item interativo com trailing tambem interativo: trailing fica fora do Pressable da linha (M4, Fable)', async () => {
    // M4 (Fable, validacao da entrega): trailing e composicao autorizada (Button), mas antes
    // desta correcao ficava dentro da Pressable da linha inteira, dando controle aninhado em
    // controle (axe nested-interactive no web). O trailing agora e irmao da Pressable, nunca
    // descendente, quando o item tem href/onPress.
    const { findByRole } = await render(
      <BrandProvider>
        <List
          items={[
            {
              id: '1',
              title: 'Pedido 42',
              onPress: () => {},
              trailing: (
                <Pressable accessibilityRole="button" testID="trailing-btn">
                  <Text>Cancelar</Text>
                </Pressable>
              ),
            },
          ]}
        />
      </BrandProvider>,
    )
    const linha = await findByRole('button', { name: 'Pedido 42' })
    expect(within(linha).queryByTestId('trailing-btn')).toBeNull()
    expect(await findByRole('button', { name: 'Cancelar' })).toBeTruthy()
  })

  it('scrollEnabled e testID sao repassados ao FlatList (scrollEnabled padrao true)', async () => {
    const { getByTestId } = await render(
      <BrandProvider><List items={items} testID="lista" scrollEnabled={false} /></BrandProvider>,
    )
    expect(getByTestId('lista').props.scrollEnabled).toBe(false)
  })

  // B1 (veredito do Fable, validacao da entrega): a correcao anterior (M4) pos `min-h-touch
  // py-3` no View externo (a linha inteira) E `min-h-touch` de novo na Pressable interna,
  // somando 68px (12+44+12) contra os 44px do contrato (secao 12.28) e contra a linha nao interativa
  // da mesma lista. `py-3` precisa estar só no nó que efetivamente vira o toque mínimo (a
  // Pressable), nunca duplicado no View externo quando o item é interativo.
  it('item interativo tem a mesma altura minima (44px) da linha nao interativa: py-3 so na Pressable, nao duplicado no View externo (B1, veredito Fable)', async () => {
    const { getByRole, getByText } = await render(
      <BrandProvider>
        <List items={[{ id: '1', title: 'So leitura' }, { id: '2', title: 'Toca', onPress: () => {} }]} />
      </BrandProvider>,
    )
    const linhaInterativa = getByRole('button', { name: 'Toca' })
    const classesInterativa = linhaInterativa.props.className.split(' ')
    expect(classesInterativa).toContain('min-h-touch')
    expect(classesInterativa).toContain('py-3')
    // O View externo da linha interativa (avô do texto do título) não pode repetir `py-3`
    // (senão soma 68px); só a Pressable interna leva o padding vertical.
    const tituloInterativo = getByText('Toca')
    const viewExternoInterativo = tituloInterativo.parent?.parent?.parent
    expect(viewExternoInterativo?.props.className.split(' ')).not.toContain('py-3')
  })

  // M1 (veredito do Fable): o contrato §12.28 põe `trailing` antes do `ChevronRight`; a
  // correção do M4 (Fable anterior) inverteu a ordem. Confirma que, quando a linha é
  // interativa e o `trailing` também é interativo (mesmo caso do teste M4 acima), o chevron
  // aparece depois do `trailing` na árvore, não antes.
  it('trailing vem antes do chevron na ordem da arvore (M1, veredito Fable)', async () => {
    const { findByRole, findByTestId } = await render(
      <BrandProvider>
        <List
          items={[
            {
              id: '1',
              title: 'Pedido 42',
              onPress: () => {},
              trailing: (
                <Pressable accessibilityRole="button" testID="trailing-btn">
                  <Text>Cancelar</Text>
                </Pressable>
              ),
            },
          ]}
        />
      </BrandProvider>,
    )
    const cancelar = await findByRole('button', { name: 'Cancelar' })
    const chevron = await findByTestId('list-chevron-1', { includeHiddenElements: true })
    // `cancelar` (o botão) é filho direto do invólucro de `trailing` (`View
    // className="shrink-0 flex-row items-center"`); o pai desse invólucro é o View externo da
    // linha inteira, o mesmo nível onde o chevron precisa estar depois da correção. Compara os
    // filhos diretos do View externo: o invólucro do trailing precisa vir antes do chevron.
    const invólucroTrailing = cancelar.parent
    const linhaExterna = invólucroTrailing?.parent
    const indiceTrailing = linhaExterna?.children.indexOf(invólucroTrailing as never) ?? -1
    const indiceChevron = linhaExterna?.children.indexOf(chevron as never) ?? -1
    expect(indiceTrailing).toBeGreaterThanOrEqual(0)
    expect(indiceChevron).toBeGreaterThanOrEqual(0)
    expect(indiceTrailing).toBeLessThan(indiceChevron)
  })
})
