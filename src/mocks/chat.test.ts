import { demoTickets, quickRepliesDemo } from './chat'
import { clients } from './clients'
import { waited } from '../lib/chat-format'

describe('mocks do atendimento (chat)', () => {
  it('tres conversas com ids unicos, canais diferentes e datas fixas (nada de Date.now)', () => {
    expect(demoTickets).toHaveLength(3)
    expect(new Set(demoTickets.map((t) => t.id)).size).toBe(3)
    expect(new Set(demoTickets.map((t) => t.channel)).size).toBe(3)
    for (const t of demoTickets) expect(t.time.getFullYear()).toBe(2026)
  })

  it('o resumo de cada conversa e a ultima mensagem dela', () => {
    for (const t of demoTickets) {
      const ultima = t.messages[t.messages.length - 1]!
      expect(t.lastMessage).toBe(ultima.text)
      expect(t.time).toEqual(ultima.time)
    }
  })

  it('ids de mensagem unicos no conjunto, e toda citacao aponta para uma mensagem da mesma conversa', () => {
    const todos = demoTickets.flatMap((t) => t.messages.map((m) => m.id))
    expect(new Set(todos).size).toBe(todos.length)
    for (const t of demoTickets) {
      const ids = new Set(t.messages.map((m) => m.id))
      for (const m of t.messages) if (m.replyTo?.id) expect(ids.has(m.replyTo.id)).toBe(true)
    }
  })

  it('cobre o que a vitrine mostra: robo, sistema, editada, excluida, reacao, anexo e espera na fila', () => {
    const msgs = demoTickets.flatMap((t) => t.messages)
    expect(msgs.some((m) => m.from === 'bot')).toBe(true)
    expect(msgs.some((m) => m.from === 'system')).toBe(true)
    expect(msgs.some((m) => m.editedFrom)).toBe(true)
    expect(msgs.some((m) => m.deleted)).toBe(true)
    expect(msgs.some((m) => m.reactions?.length)).toBe(true)
    expect(msgs.some((m) => m.attachments?.length)).toBe(true)
    expect(demoTickets.some((t) => t.waitingSince)).toBe(true)
  })

  it('mensagens rapidas com titulo e texto', () => {
    expect(quickRepliesDemo.length).toBeGreaterThanOrEqual(3)
    for (const q of quickRepliesDemo) {
      expect(q.title.length).toBeGreaterThan(0)
      expect(q.text.length).toBeGreaterThan(0)
    }
  })
})

describe('mocks do atendimento: etapa, cliente e espera (P4)', () => {
  it('cada conversa tem etapa e aponta para um cliente da carteira', () => {
    const etapas = new Set(['ura', 'fila', 'atendimento', 'encerrado'])
    for (const t of demoTickets) {
      expect(etapas.has(t.stage)).toBe(true)
      expect(clients.some((c) => c.id === t.clienteId)).toBe(true)
    }
    expect(demoTickets.map((t) => t.clienteId)).toEqual([1000, 1009, 1018])
    expect(new Set(demoTickets.map((t) => t.clienteId)).size).toBe(3)
  })

  it('a conversa sem atendente esta na fila e as demais em atendimento', () => {
    const porId = (id: string) => demoTickets.find((t) => t.id === id)!
    expect(porId('t3').stage).toBe('fila')
    expect(porId('t3').assignee).toBeUndefined()
    expect(porId('t1').stage).toBe('atendimento')
    expect(porId('t2').stage).toBe('atendimento')
  })

  it('com o relogio fixo das capturas (29/09/2026 12:00) a espera do t3 e plausivel, nunca 0 min', () => {
    const agora = new Date(2026, 8, 29, 12, 0)
    const t3 = demoTickets.find((t) => t.id === 't3')!
    expect(t3.waitingSince!.getTime()).toBeLessThan(agora.getTime())
    expect(waited(t3.waitingSince!, agora)).not.toBe('0 min')
    // a espera comeca na ultima mensagem do contato, nunca antes dela
    const ultima = t3.messages[t3.messages.length - 1]!
    expect(t3.waitingSince!.getTime()).toBeGreaterThanOrEqual(ultima.time.getTime())
    expect(ultima.time.getTime()).toBeLessThan(agora.getTime())
  })

  it('a soma das nao lidas inicial e 3 (t2 com 2, t3 com 1)', () => {
    expect(demoTickets.reduce((s, t) => s + (t.unread ?? 0), 0)).toBe(3)
  })
})
