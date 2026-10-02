import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { BrandProvider } from '../../../brand/brand-provider'
import { nodesWithCode } from '../../../test-utils/rendra-code'
import { ChannelBadge, chatChannels } from './channel-badge'
import { ConversationList } from './conversation-list'
import type { Conversation } from './types'

afterEach(() => {
  jest.useRealTimers()
})

const conversas: Conversation[] = [
  {
    id: 'c1',
    name: 'Ana Souza',
    channel: 'whatsapp',
    account: 'Comercial',
    department: 'Suporte',
    assignee: 'Bruno',
    lastMessage: 'Oi, tudo bem?',
    time: new Date(2026, 9, 5, 9, 30),
    unread: 3,
    waitingSince: new Date(2026, 9, 5, 9, 0),
  },
  { id: 'c2', name: 'Carla Dias', channel: 'email', lastMessage: 'Segue o comprovante.', time: new Date(2026, 9, 4, 18, 10) },
  { id: 'c3', name: 'Diego Melo', channel: 'site', lastMessage: 'Preciso de ajuda', time: new Date(2026, 9, 5, 8, 0) },
]

const renderizar = (ui: React.ReactElement) => render(<BrandProvider>{ui}</BrandProvider>)

function hojeAs(h: number, m: number) {
  jest.useFakeTimers({ now: new Date(2026, 9, 5, h, m), doNotFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'setImmediate', 'clearImmediate', 'nextTick', 'queueMicrotask'] })
}

describe('ConversationList', () => {
  it('mostra nome, canal, conta, nao lidas, horario e a espera, com o codigo CHAT-001', async () => {
    hojeAs(10, 0)
    const { container } = await renderizar(<ConversationList items={conversas} onSelect={() => {}} />)
    expect(nodesWithCode(container, 'CHAT-001')).toHaveLength(1)
    expect(screen.getByText('Ana Souza')).toBeTruthy()
    expect(screen.getByText('WhatsApp:')).toBeTruthy()
    expect(screen.getByText('Comercial')).toBeTruthy()
    expect(screen.getByText('3')).toBeTruthy()
    expect(screen.getByText('09:30')).toBeTruthy()
    expect(screen.getByText('04/10/2026 18:10')).toBeTruthy()
    expect(screen.getByText('Esperando há 1 h 0 min')).toBeTruthy()
  })

  it('a segunda linha mostra departamento e responsavel, ou a ultima mensagem', async () => {
    await renderizar(<ConversationList items={conversas} onSelect={() => {}} />)
    expect(screen.getByText('Suporte · Bruno')).toBeTruthy()
    expect(screen.getByText('Segue o comprovante.')).toBeTruthy()
    expect(screen.queryByText('Oi, tudo bem?')).toBeNull()
  })

  it('sem conversas mostra o texto padrao ou o recebido', async () => {
    const { unmount } = await renderizar(<ConversationList items={[]} onSelect={() => {}} />)
    expect(screen.getByText('Nenhuma conversa aqui.')).toBeTruthy()
    await unmount()
    await renderizar(<ConversationList items={[]} onSelect={() => {}} empty="Nada com esse filtro." />)
    expect(screen.getByText('Nada com esse filtro.')).toBeTruthy()
  })

  it('selecionar chama onSelect e marca a conversa ativa (selected), so ela', async () => {
    function Controlada() {
      const [ativa, setAtiva] = useState<string | null>(null)
      return <ConversationList items={conversas} activeId={ativa} onSelect={setAtiva} />
    }
    await renderizar(<Controlada />)
    const botao = () => screen.getByRole('button', { name: /Carla Dias/ })
    expect(botao().props.accessibilityState.selected).toBe(false)
    await fireEvent.press(botao())
    expect(botao().props.accessibilityState.selected).toBe(true)
    expect(screen.getByRole('button', { name: /Ana Souza/ }).props.accessibilityState.selected).toBe(false)
  })

  it('onSelect recebe o id da conversa tocada', async () => {
    const onSelect = jest.fn()
    await renderizar(<ConversationList items={conversas} onSelect={onSelect} />)
    await fireEvent.press(screen.getByRole('button', { name: /Diego Melo/ }))
    expect(onSelect).toHaveBeenCalledWith('c3')
  })

  it('o contêiner e uma lista e cada conversa um item, em filhos diretos', async () => {
    await renderizar(<ConversationList items={conversas} onSelect={() => {}} />)
    expect(screen.getByTestId('conversation-list').props.role).toBe('list')
    expect(screen.getAllByTestId(/^conversation-item-/)).toHaveLength(3)
    expect(screen.getByTestId('conversation-item-c1').props.role).toBe('listitem')
  })

  it('sem channelLogos o canal aparece como icone; com a prop, como imagem', async () => {
    const { unmount } = await renderizar(<ConversationList items={conversas} onSelect={() => {}} />)
    expect(screen.getByTestId('channel-icone-c1', { includeHiddenElements: true })).toBeTruthy()
    expect(screen.queryByTestId('channel-logo-c1')).toBeNull()
    await unmount()
    await renderizar(
      <ConversationList items={conversas} onSelect={() => {}} channelLogos={{ whatsapp: { uri: 'https://exemplo.com/w.png' } }} />,
    )
    expect(screen.getByTestId('channel-logo-c1', { includeHiddenElements: true })).toBeTruthy()
    expect(screen.getByTestId('channel-icone-c2', { includeHiddenElements: true })).toBeTruthy()
  })
})

describe('ChannelBadge e chatChannels', () => {
  it('a etiqueta mostra o nome do canal', async () => {
    await renderizar(<ChannelBadge channel="google" />)
    expect(screen.getByText('Google Meu Negócio')).toBeTruthy()
  })

  it('os dez canais tem nome, icone e tom, e nenhum carrega logo no pacote', () => {
    const canais = Object.keys(chatChannels)
    expect(canais).toHaveLength(10)
    for (const canal of canais) {
      const c = chatChannels[canal as keyof typeof chatChannels]
      expect(c.label.length).toBeGreaterThan(0)
      expect(c.icon).toBeTruthy()
      expect(c.tone).toBeTruthy()
      expect((c as Record<string, unknown>).logo).toBeUndefined()
    }
  })
})
