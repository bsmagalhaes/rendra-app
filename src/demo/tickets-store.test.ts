import { act, renderHook } from '@testing-library/react-native'
import { demoTickets } from '../mocks/chat'
import {
  abrirTicket,
  assumirTicket,
  editarMensagem,
  enviarMensagem,
  excluirMensagem,
  reagirMensagem,
  restaurarTickets,
  ticketDoCliente,
  useNaoLidas,
  useTickets,
} from './tickets-store'

afterEach(() => {
  restaurarTickets()
})

const doTicket = (lista: readonly { id: string }[], id: string) => lista.find((t) => t.id === id) as (typeof demoTickets)[number]

describe('tickets da demonstração', () => {
  it('começa com os três tickets e 3 não lidas (t2 com 2, t3 com 1)', async () => {
    const { result } = await renderHook(() => ({ tickets: useTickets(), naoLidas: useNaoLidas() }))
    expect(result.current.tickets.map((t) => t.id)).toEqual(['t1', 't2', 't3'])
    expect(result.current.naoLidas).toBe(3)
    expect(doTicket(result.current.tickets, 't2').unread).toBe(2)
  })

  it('abrir o ticket zera as não lidas dele (t2 passa de 2 para 0) e o total cai para 1', async () => {
    const { result } = await renderHook(() => ({ tickets: useTickets(), naoLidas: useNaoLidas() }))
    await act(async () => {
      abrirTicket('t2')
    })
    expect(doTicket(result.current.tickets, 't2').unread).toBe(0)
    expect(result.current.naoLidas).toBe(1)
  })

  it('enviar acrescenta mensagem do atendente ao ticket certo, atualiza o resumo e não toca nos outros', async () => {
    const { result } = await renderHook(() => useTickets())
    const antes = doTicket(result.current, 't1').messages.length
    await act(async () => {
      enviarMensagem('t1', { text: 'Boleto reenviado.', files: [] })
    })
    const t1 = doTicket(result.current, 't1')
    expect(t1.messages).toHaveLength(antes + 1)
    const nova = t1.messages[t1.messages.length - 1]!
    expect(nova).toMatchObject({ from: 'agent', text: 'Boleto reenviado.', status: 'sent' })
    expect(t1.lastMessage).toBe('Boleto reenviado.')
    expect(doTicket(result.current, 't2').messages).toHaveLength(demoTickets[1]!.messages.length)
  })

  it('enviar com anexo e citação grava o anexo e a citação', async () => {
    const { result } = await renderHook(() => useTickets())
    await act(async () => {
      enviarMensagem('t1', {
        text: '',
        files: [{ name: 'Orçamento.pdf', uri: 'exemplo://o.pdf', type: 'application/pdf', size: 10 }],
        replyTo: { id: 'a5', author: 'Ana Souza', text: 'Recebi, muito obrigada!' },
      })
    })
    const t1 = doTicket(result.current, 't1')
    const nova = t1.messages[t1.messages.length - 1]!
    expect(nova.attachments?.[0]).toMatchObject({ name: 'Orçamento.pdf' })
    expect(nova.replyTo).toMatchObject({ id: 'a5' })
    expect(t1.lastMessage).toBe('Orçamento.pdf')
  })

  it('a duração vai só no anexo de áudio, não nos outros anexos', async () => {
    const { result } = await renderHook(() => useTickets())
    await act(async () => {
      enviarMensagem('t1', {
        text: '',
        files: [
          { name: 'Orçamento.pdf', uri: 'exemplo://o.pdf', type: 'application/pdf', size: 10 },
          { name: 'Áudio.m4a', uri: 'exemplo://a.m4a', type: 'audio/mp4', size: 20 },
        ],
        audioSeconds: 7,
      })
    })
    const t1 = doTicket(result.current, 't1')
    const anexos = t1.messages[t1.messages.length - 1]!.attachments!
    expect(anexos[0]!.duration).toBeUndefined()
    expect(anexos[1]!.duration).toBe(7)
  })

  it('reagir alterna o emoji, editar guarda o texto original e excluir marca a mensagem', async () => {
    const { result } = await renderHook(() => useTickets())
    await act(async () => {
      reagirMensagem('t1', 'a3', '❤️')
    })
    expect(doTicket(result.current, 't1').messages.find((m) => m.id === 'a3')!.reactions).toEqual(['👍', '❤️'])
    await act(async () => {
      reagirMensagem('t1', 'a3', '❤️')
    })
    expect(doTicket(result.current, 't1').messages.find((m) => m.id === 'a3')!.reactions).toEqual(['👍'])
    await act(async () => {
      editarMensagem('t1', 'a3', 'Claro, Ana! Envio agora.')
    })
    expect(doTicket(result.current, 't1').messages.find((m) => m.id === 'a3')).toMatchObject({
      text: 'Claro, Ana! Envio agora.',
      editedFrom: 'Claro, Ana! Já envio o boleto atualizado.',
    })
    await act(async () => {
      excluirMensagem('t1', 'a3')
    })
    expect(doTicket(result.current, 't1').messages.find((m) => m.id === 'a3')!.deleted).toBe(true)
  })

  it('assumir tira o ticket da fila: etapa atendimento, atendente é o usuário, sem espera, sem não lidas, com aviso de sistema', async () => {
    const { result } = await renderHook(() => ({ tickets: useTickets(), naoLidas: useNaoLidas() }))
    await act(async () => {
      assumirTicket('t3')
    })
    const t3 = doTicket(result.current.tickets, 't3')
    expect(t3.stage).toBe('atendimento')
    expect(t3.assignee).toBe('Ana Ribeiro')
    expect(t3.waitingSince).toBeUndefined()
    expect(t3.unread ?? 0).toBe(0)
    const ultima = t3.messages[t3.messages.length - 1]!
    expect(ultima).toMatchObject({ from: 'system', text: 'Ana Ribeiro assumiu a conversa' })
    expect(result.current.naoLidas).toBe(2)
  })

  it('restaurar devolve os tickets originais, e dois leitores veem o mesmo estado', async () => {
    const a = await renderHook(() => useTickets())
    const b = await renderHook(() => useTickets())
    await act(async () => {
      abrirTicket('t2')
      enviarMensagem('t2', { text: 'Teste', files: [] })
    })
    expect(doTicket(b.result.current, 't2').messages).toHaveLength(demoTickets[1]!.messages.length + 1)
    expect(b.result.current).toBe(a.result.current)
    await act(async () => {
      restaurarTickets()
    })
    expect(doTicket(a.result.current, 't2').unread).toBe(2)
    expect(doTicket(a.result.current, 't2').messages).toHaveLength(demoTickets[1]!.messages.length)
  })

  it('ticketDoCliente acha a conversa pelo clienteId e devolve undefined para quem não tem', () => {
    expect(ticketDoCliente(1000)?.id).toBe('t1')
    expect(ticketDoCliente(1009)?.id).toBe('t2')
    expect(ticketDoCliente(1018)?.id).toBe('t3')
    expect(ticketDoCliente(1001)).toBeUndefined()
  })
})
