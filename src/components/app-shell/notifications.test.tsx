import { Text } from 'react-native'
import { fireEvent, render, waitFor, within } from '@testing-library/react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { BrandProvider } from '../../brand/brand-provider'
import { RendraNavigationProvider } from '../../navigation/rendra-navigation'
import { navComPagina } from '../../test-utils/shell-fixtures'
import { AppShell } from './app-shell'
import type { NavItem, ShellNotificationItem, ShellNotificationsConfig } from './index'

const itens = (): ShellNotificationItem[] => [
  { id: '1', type: 'success', title: 'Fatura paga', time: '29/09/2026', read: false },
  { id: '2', type: 'info', title: 'Novo cliente', time: '28/09/2026', read: false },
  { id: '3', type: 'warning', title: 'Contrato a vencer', time: '27/09/2026', read: true },
]

function arvore(notifications?: ShellNotificationsConfig) {
  return (
    <BrandProvider>
      <RendraNavigationProvider value={{ navigate: jest.fn(), currentPath: '/paginas' }}>
        <AppShell navigation={navComPagina} user={{ name: 'Ana Ribeiro' }} notifications={notifications}>
          <Text>Conteúdo da tela</Text>
        </AppShell>
      </RendraNavigationProvider>
    </BrandProvider>
  )
}

const sino = (n: number) => (n > 0 ? `Notificações, ${n} não lidas` : 'Notificações')

beforeEach(async () => {
  await AsyncStorage.clear()
})

describe('AppShell notifications (sino)', () => {
  it('sem a prop notifications não existe sino na árvore', async () => {
    const tela = await render(arvore())
    expect(await tela.findByText('Conteúdo da tela')).toBeTruthy()
    expect(tela.queryByRole('button', { name: /Notificações/ })).toBeNull()
  })

  it('com itens não lidos o sino mostra o rótulo com a contagem e o contador numérico, escondido da leitura de tela', async () => {
    const tela = await render(arvore({ items: itens() }))
    expect(await tela.findByRole('button', { name: sino(2) })).toBeTruthy()
    const contador = tela.getByText('2', { includeHiddenElements: true })
    expect(contador).toBeTruthy()
    expect(tela.queryByText('2')).toBeNull()
  })

  it('sem não lidos o rótulo é só "Notificações" e não há contador', async () => {
    const tela = await render(arvore({ items: itens().map((n) => ({ ...n, read: true })) }))
    expect(await tela.findByRole('button', { name: 'Notificações' })).toBeTruthy()
    expect(tela.queryByTestId('notificacoes-contador', { includeHiddenElements: true })).toBeNull()
  })

  it('acionar o sino abre a folha com o título e o horário de cada item', async () => {
    const tela = await render(arvore({ items: itens() }))
    expect(tela.queryByText('Fatura paga')).toBeNull()
    await fireEvent.press(await tela.findByRole('button', { name: sino(2) }))
    for (const n of itens()) {
      expect(await tela.findByText(n.title)).toBeTruthy()
      expect(await tela.findByText(n.time)).toBeTruthy()
    }
    expect(await tela.findByText('Marcar como lidas')).toBeTruthy()
  })

  it('tocar um item remove o indicador "Não lida" dele, chama onItemClick, atualiza o rótulo e a folha continua aberta', async () => {
    const onItemClick = jest.fn()
    const tela = await render(arvore({ items: itens(), onItemClick }))
    await fireEvent.press(await tela.findByRole('button', { name: sino(2) }))
    expect(await tela.findAllByLabelText('Não lida')).toHaveLength(2)
    const item = await tela.findByRole('button', { name: /^Fatura paga/ })
    await fireEvent.press(item)
    await waitFor(() => expect(tela.getAllByLabelText('Não lida')).toHaveLength(1))
    expect(within(await tela.findByRole('button', { name: /^Fatura paga/ })).queryByLabelText('Não lida')).toBeNull()
    expect(onItemClick).toHaveBeenCalledWith('1')
    expect(tela.getByRole('button', { name: sino(1) })).toBeTruthy()
    expect(tela.getByText('Marcar como lidas')).toBeTruthy()
    expect(tela.getByText('Novo cliente')).toBeTruthy()
  })

  it('"Marcar como lidas" marca todas, chama onMarkAllRead e o rótulo volta a "Notificações"; com tudo lido o botão fica desabilitado', async () => {
    const onMarkAllRead = jest.fn()
    const tela = await render(arvore({ items: itens(), onMarkAllRead }))
    await fireEvent.press(await tela.findByRole('button', { name: sino(2) }))
    await fireEvent.press(await tela.findByRole('button', { name: 'Marcar como lidas' }))
    await waitFor(() => expect(tela.queryAllByLabelText('Não lida')).toHaveLength(0))
    expect(onMarkAllRead).toHaveBeenCalledTimes(1)
    expect(tela.getByRole('button', { name: 'Notificações' })).toBeTruthy()
    expect(tela.getByRole('button', { name: 'Marcar como lidas' }).props.accessibilityState.disabled).toBe(true)
  })

  it('lista vazia: só o cabeçalho, com "Marcar como lidas" desabilitado e sem texto de estado vazio', async () => {
    const tela = await render(arvore({ items: [] }))
    await fireEvent.press(await tela.findByRole('button', { name: 'Notificações' }))
    expect(await tela.findByText('Marcar como lidas')).toBeTruthy()
    expect(tela.getByRole('button', { name: 'Marcar como lidas' }).props.accessibilityState.disabled).toBe(true)
    expect(tela.queryByLabelText('Não lida')).toBeNull()
  })

  it('fechar a folha a remove da árvore', async () => {
    const tela = await render(arvore({ items: itens() }))
    await fireEvent.press(await tela.findByRole('button', { name: sino(2) }))
    expect(await tela.findByText('Fatura paga')).toBeTruthy()
    await fireEvent.press(await tela.findByTestId('notificacoes-overlay'))
    await waitFor(() => expect(tela.queryByText('Fatura paga')).toBeNull())
  })

  it('a lista vem copiada na montagem: mudar a prop depois não altera os itens', async () => {
    const tela = await render(arvore({ items: itens() }))
    await tela.rerender(arvore({ items: [] }))
    expect(await tela.findByRole('button', { name: sino(2) })).toBeTruthy()
  })

  it('não regressão: NavItem.badge continua string', () => {
    const item: NavItem = { title: 'x', icon: () => null, badge: '9+' }
    expect(item.badge).toBe('9+')
  })
})
