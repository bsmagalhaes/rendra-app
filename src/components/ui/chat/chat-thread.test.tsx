import { useState } from 'react'
import { Linking, Pressable, Text } from 'react-native'
import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { BrandProvider } from '../../../brand/brand-provider'
import { nodesWithCode } from '../../../test-utils/rendra-code'
import { ChatThread } from './chat-thread'
import type { ChatMessage } from './types'

afterEach(() => {
  jest.useRealTimers()
  jest.restoreAllMocks()
})

const TIMERS_REAIS = ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'setImmediate', 'clearImmediate', 'nextTick', 'queueMicrotask'] as const

/** Relogio fixo em 05/10/2026 12:00, sem congelar os temporizadores do React. */
function hoje() {
  jest.useFakeTimers({ now: new Date(2026, 9, 5, 12, 0), doNotFake: [...TIMERS_REAIS] })
}

const t = (h: number, m: number) => new Date(2026, 9, 5, h, m)

const mensagens: ChatMessage[] = [
  { id: 'm0', from: 'system', text: 'Conversa iniciada', time: t(9, 0) },
  { id: 'm1', from: 'contact', author: 'Ana Souza', text: 'Preciso de ajuda com a fatura.', time: t(9, 1) },
  {
    id: 'm2',
    from: 'agent',
    author: 'Bruno',
    text: 'Claro, vou verificar agora.',
    time: t(9, 2),
    status: 'read',
    reactions: ['👍', '👍', '❤️'],
    replyTo: { id: 'm1', author: 'Ana Souza', text: 'Preciso de ajuda com a fatura.' },
  },
  { id: 'm3', from: 'bot', text: 'Protocolo 1234 aberto.', time: t(9, 3) },
  { id: 'm4', from: 'agent', author: 'Bruno', text: 'Texto apagado', time: t(9, 4), deleted: true },
  { id: 'm5', from: 'agent', author: 'Bruno', text: 'Texto novo', editedFrom: 'Texto velho', time: t(9, 5), status: 'delivered' },
  { id: 'm6', from: 'agent', author: 'Bruno', text: 'Enviado agora', time: t(9, 6), status: 'sent' },
]

const renderizar = (ui: React.ReactElement) => render(<BrandProvider>{ui}</BrandProvider>)
const classes = (id: string) => String(screen.getByTestId(id).props.className).split(' ')

describe('ChatThread: conteudo', () => {
  it('a raiz e um log com CHAT-002, regiao viva educada e nome; a lista interna nao leva papel', async () => {
    hoje()
    const { container } = await renderizar(<ChatThread messages={mensagens} />)
    expect(nodesWithCode(container, 'CHAT-002')).toHaveLength(1)
    const raiz = screen.getByTestId('chat-thread')
    expect(raiz.props.role).toBe('log')
    expect(raiz.props.accessibilityLiveRegion).toBe('polite')
    expect(raiz.props.accessibilityLabel).toBe('Mensagens da conversa')
    expect(screen.getByTestId('chat-thread-list').props.role).toBeUndefined()
    expect(screen.getByTestId('chat-thread-list').props.accessibilityLiveRegion).toBeUndefined()
  })

  it('separa por dia: Hoje, Ontem e a data por extenso', async () => {
    hoje()
    const antigas: ChatMessage[] = [
      { id: 'a', from: 'contact', text: 'Antiga', time: new Date(2026, 8, 20, 10, 0) },
      { id: 'b', from: 'contact', text: 'De ontem', time: new Date(2026, 9, 4, 10, 0) },
      { id: 'c', from: 'contact', text: 'De hoje', time: t(10, 0) },
    ]
    await renderizar(<ChatThread messages={antigas} />)
    expect(screen.getByText('20 de setembro')).toBeTruthy()
    expect(screen.getByText('Ontem')).toBeTruthy()
    expect(screen.getByText('Hoje')).toBeTruthy()
  })

  it('mensagem de sistema vira texto central com a hora', async () => {
    hoje()
    await renderizar(<ChatThread messages={mensagens} />)
    expect(screen.getByText('Conversa iniciada · 09:00')).toBeTruthy()
  })

  it('robo mostra Assistente virtual; contato e atendente mostram o autor e a data', async () => {
    hoje()
    await renderizar(<ChatThread messages={mensagens} />)
    expect(screen.getByText('Assistente virtual')).toBeTruthy()
    expect(screen.getAllByText('Ana Souza').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Bruno').length).toBeGreaterThan(0)
    expect(screen.getByText('05/10/2026 09:01')).toBeTruthy()
  })

  it('mensagem excluida mostra Mensagem excluida com o texto riscado, em bloco destrutivo suave', async () => {
    hoje()
    await renderizar(<ChatThread messages={mensagens} />)
    expect(screen.getByText('Mensagem excluída')).toBeTruthy()
    expect(String(screen.getByText('Texto apagado').props.className)).toContain('line-through')
    expect(classes('message-bubble-m4')).toContain('bg-destructive-soft')
  })

  it('mensagem editada mostra o texto novo e Editada. Antes: com o original riscado', async () => {
    hoje()
    await renderizar(<ChatThread messages={mensagens} />)
    expect(screen.getByText('Texto novo')).toBeTruthy()
    expect(screen.getByText(/Editada\. Antes:/)).toBeTruthy()
    expect(String(screen.getByText('Texto velho').props.className)).toContain('line-through')
  })

  it('o status da mensagem do atendente aparece como Enviada, Entregue ou Lida', async () => {
    hoje()
    await renderizar(<ChatThread messages={mensagens} />)
    expect(screen.getByLabelText('Lida')).toBeTruthy()
    expect(screen.getByLabelText('Entregue')).toBeTruthy()
    expect(screen.getByLabelText('Enviada')).toBeTruthy()
  })

  it('o status nao aparece em mensagem do contato', async () => {
    hoje()
    const contato: ChatMessage[] = [{ id: 'c', from: 'contact', text: 'Oi', time: t(9, 0), status: 'read' }]
    await renderizar(<ChatThread messages={contato} />)
    expect(screen.queryByLabelText('Lida')).toBeNull()
  })

  it('o balao do atendente fica em bg-primary; o do contato em bg-card; o do robo tracejado', async () => {
    hoje()
    await renderizar(<ChatThread messages={mensagens} />)
    expect(classes('message-bubble-m2')).toContain('bg-primary')
    expect(classes('message-bubble-m1')).toContain('bg-card')
    expect(classes('message-bubble-m3')).toContain('border-dashed')
  })

  it('reacoes aparecem abaixo do balao, agrupadas com a contagem, e tocar chama onReact com a mensagem', async () => {
    hoje()
    const onReact = jest.fn()
    await renderizar(<ChatThread messages={mensagens} onReact={onReact} />)
    const polegar = screen.getByLabelText('Reação 👍. Remover')
    expect(screen.getByText('2')).toBeTruthy()
    expect(screen.getByLabelText('Reação ❤️. Remover')).toBeTruthy()
    await fireEvent.press(polegar)
    expect(onReact).toHaveBeenCalledWith(expect.objectContaining({ id: 'm2' }), '👍')
  })
})

describe('ChatThread: cabecalho do balao', () => {
  // O balao encolhe ao conteudo. Com `flex-1` (base 0) a data nao entra na largura do balao: no Android ele fecha estreito,
  // a data quebra caractere a caractere e o corpo da mensagem fica fora da altura medida (balao "cortado").
  it('a data entra na largura natural do balao (base auto) e nao quebra em varias linhas', async () => {
    hoje()
    await renderizar(<ChatThread messages={mensagens} />)
    for (const hora of ['05/10/2026 09:01', '05/10/2026 09:02']) {
      const data = screen.getByText(hora)
      const classe = String(data.props.className).split(' ')
      expect(classe).toContain('flex-auto')
      expect(classe).not.toContain('flex-1')
      expect(data.props.numberOfLines).toBe(1)
    }
  })
})

describe('ChatThread: menu de acoes', () => {
  const handlers = () => ({ onReply: jest.fn(), onReact: jest.fn(), onEdit: jest.fn(), onDelete: jest.fn() })

  it('pressao longa no balao do atendente abre Reagir, Responder, Editar e Excluir', async () => {
    hoje()
    await renderizar(<ChatThread messages={mensagens} {...handlers()} />)
    expect(screen.queryByText('Responder')).toBeNull()
    await fireEvent(screen.getByTestId('message-bubble-m2'), 'longPress')
    expect(screen.getByText('Reagir')).toBeTruthy()
    expect(screen.getByText('Responder')).toBeTruthy()
    expect(screen.getByText('Editar')).toBeTruthy()
    expect(screen.getByText('Excluir')).toBeTruthy()
    expect(screen.getAllByLabelText(/^Reagir com /)).toHaveLength(6)
  })

  it('o botao Acoes da mensagem abre o mesmo menu', async () => {
    hoje()
    await renderizar(<ChatThread messages={mensagens} {...handlers()} />)
    await fireEvent.press(screen.getAllByLabelText('Ações da mensagem')[1])
    expect(screen.getByText('Responder')).toBeTruthy()
  })

  it('na mensagem do contato, do robo e na excluida nao existem Editar nem Excluir', async () => {
    hoje()
    await renderizar(<ChatThread messages={mensagens} {...handlers()} />)
    for (const id of ['m1', 'm3', 'm4']) {
      await fireEvent(screen.getByTestId(`message-bubble-${id}`), 'longPress')
      expect(screen.getByText('Responder')).toBeTruthy()
      expect(screen.queryByText('Editar')).toBeNull()
      expect(screen.queryByText('Excluir')).toBeNull()
      await fireEvent.press(screen.getByText('Responder'))
    }
  })

  it('escolher uma acao chama o callback com a mensagem e fecha o menu', async () => {
    hoje()
    const h = handlers()
    await renderizar(<ChatThread messages={mensagens} {...h} />)
    await fireEvent(screen.getByTestId('message-bubble-m2'), 'longPress')
    await fireEvent.press(screen.getByText('Editar'))
    expect(h.onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'm2' }))
    expect(screen.queryByText('Excluir')).toBeNull()
    await fireEvent(screen.getByTestId('message-bubble-m2'), 'longPress')
    await fireEvent.press(screen.getByText('Excluir'))
    expect(h.onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: 'm2' }))
    await fireEvent(screen.getByTestId('message-bubble-m1'), 'longPress')
    await fireEvent.press(screen.getByText('Responder'))
    expect(h.onReply).toHaveBeenCalledWith(expect.objectContaining({ id: 'm1' }))
    await fireEvent(screen.getByTestId('message-bubble-m1'), 'longPress')
    await fireEvent.press(screen.getByLabelText('Reagir com 🙏'))
    expect(h.onReact).toHaveBeenCalledWith(expect.objectContaining({ id: 'm1' }), '🙏')
    expect(screen.queryByText('Responder')).toBeNull()
  })

  it('sem nenhum callback nao ha menu nem botao de acoes', async () => {
    hoje()
    await renderizar(<ChatThread messages={mensagens} />)
    expect(screen.queryByLabelText('Ações da mensagem')).toBeNull()
    await fireEvent(screen.getByTestId('message-bubble-m2'), 'longPress')
    expect(screen.queryByText('Responder')).toBeNull()
  })

  it('so oferece as acoes cujo callback existe', async () => {
    hoje()
    await renderizar(<ChatThread messages={mensagens} onReply={() => {}} />)
    await fireEvent(screen.getByTestId('message-bubble-m2'), 'longPress')
    expect(screen.getByText('Responder')).toBeTruthy()
    expect(screen.queryByText('Reagir')).toBeNull()
    expect(screen.queryByText('Editar')).toBeNull()
    expect(screen.queryByText('Excluir')).toBeNull()
  })
})

describe('ChatThread: citacao', () => {
  it('tocar na citacao destaca a mensagem citada por 1,6 s, por borda com estado', async () => {
    jest.useFakeTimers({ now: t(12, 0) })
    await renderizar(<ChatThread messages={mensagens} />)
    expect(classes('message-bubble-m1')).not.toContain('border-ring')
    await fireEvent.press(screen.getByLabelText('Ir para a mensagem citada de Ana Souza'))
    expect(classes('message-bubble-m1')).toContain('border-ring')
    expect(classes('message-bubble-m2')).not.toContain('border-ring')
    await act(async () => {
      jest.advanceTimersByTime(1700)
    })
    expect(classes('message-bubble-m1')).not.toContain('border-ring')
  })

  it('citacao sem id aparece, mas nao e um botao', async () => {
    hoje()
    const semId: ChatMessage[] = [
      { id: 'x', from: 'agent', text: 'Resposta', time: t(9, 0), replyTo: { author: 'Ana', text: 'Pergunta antiga' } },
    ]
    await renderizar(<ChatThread messages={semId} />)
    expect(screen.getByText('Pergunta antiga')).toBeTruthy()
    expect(screen.queryByLabelText(/Ir para a mensagem citada/)).toBeNull()
  })
})

describe('ChatThread: anexos', () => {
  const anexos: ChatMessage[] = [
    {
      id: 'an',
      from: 'contact',
      time: t(9, 0),
      attachments: [
        { name: 'foto.png', url: 'https://exemplo.com/foto.png', type: 'image/png' },
        { name: 'nota.mp3', url: 'https://exemplo.com/nota.mp3', type: 'audio/mpeg', duration: 75 },
        { name: 'contrato.pdf', url: 'https://exemplo.com/contrato.pdf', type: 'application/pdf', size: 2621440 },
        { name: 'sem-endereco.txt', type: 'text/plain', size: 100 },
      ],
    },
  ]

  it('sem renderAttachment cada anexo vira chip com nome, tamanho ou duracao e Baixar', async () => {
    hoje()
    await renderizar(<ChatThread messages={anexos} />)
    expect(screen.getByLabelText('foto.png')).toBeTruthy()
    expect(screen.getByText('nota.mp3')).toBeTruthy()
    expect(screen.getByText('1:15')).toBeTruthy()
    expect(screen.getByText('contrato.pdf')).toBeTruthy()
    expect(screen.getByText('2,5 MB')).toBeTruthy()
    expect(screen.getByLabelText('Baixar contrato.pdf')).toBeTruthy()
    expect(screen.queryByLabelText('Baixar sem-endereco.txt')).toBeNull()
  })

  it('Baixar abre o endereco do arquivo', async () => {
    hoje()
    const abrir = jest.spyOn(Linking, 'openURL').mockResolvedValue(true)
    await renderizar(<ChatThread messages={anexos} />)
    await fireEvent.press(screen.getByLabelText('Baixar contrato.pdf'))
    expect(abrir).toHaveBeenCalledWith('https://exemplo.com/contrato.pdf')
  })

  it('renderAttachment troca o chip pelo que o app devolve e diz se a mensagem e do atendente', async () => {
    hoje()
    const renderAttachment = jest.fn((file: { name: string }) => <Text>{`Player de ${file.name}`}</Text>)
    await renderizar(<ChatThread messages={anexos} renderAttachment={renderAttachment} />)
    expect(screen.getByText('Player de nota.mp3')).toBeTruthy()
    expect(screen.queryByText('nota.mp3')).toBeNull()
    expect(renderAttachment).toHaveBeenCalledWith(expect.objectContaining({ name: 'nota.mp3' }), false)
  })

  it('mensagem excluida nao mostra os anexos', async () => {
    hoje()
    const apagada: ChatMessage[] = [{ ...anexos[0], id: 'ap', deleted: true, text: 'Foi embora' }]
    await renderizar(<ChatThread messages={apagada} />)
    expect(screen.queryByText('contrato.pdf')).toBeNull()
    expect(screen.getByText('Foi embora')).toBeTruthy()
  })
})

describe('ChatThread: mensagem nova', () => {
  it('a mensagem acrescentada pelo pai aparece na lista', async () => {
    hoje()
    function Exemplo() {
      const [lista, setLista] = useState(mensagens.slice(0, 3))
      return (
        <>
          <ChatThread messages={lista} />
          <Pressable
            accessibilityLabel="Adicionar"
            onPress={() => setLista((l) => [...l, { id: 'nova', from: 'agent', text: 'Mais uma', time: t(10, 0) }])}
          >
            <Text>+</Text>
          </Pressable>
        </>
      )
    }
    await renderizar(<Exemplo />)
    expect(screen.queryByText('Mais uma')).toBeNull()
    await fireEvent.press(screen.getByLabelText('Adicionar'))
    expect(screen.getByText('Mais uma')).toBeTruthy()
  })
})
