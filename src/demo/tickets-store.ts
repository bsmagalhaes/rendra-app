import { useSyncExternalStore } from 'react'
import type { ChatFile, ChatMessage } from '../components/ui/chat/types'
import { exampleUser } from '../config/navigation'
import { demoTickets, type Ticket } from '../mocks/chat'

/*
 * Atendimento da demonstração: as conversas são constantes de `src/mocks/chat`, e este módulo guarda
 * o que muda nesta sessão (não lidas zeradas, mensagens enviadas, reações, edições, exclusões e
 * conversas assumidas). A lista, a conversa e o selo do menu leem o mesmo estado, e recarregar a
 * página devolve os tickets originais (nada é gravado).
 */

let estado: readonly Ticket[] = demoTickets
let contador = 0
const ouvintes = new Set<() => void>()

function emitir() {
  ouvintes.forEach((ouvinte) => ouvinte())
}

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte)
  return () => {
    ouvintes.delete(ouvinte)
  }
}

function mudar(id: string, fn: (ticket: Ticket) => Ticket) {
  estado = estado.map((t) => (t.id === id ? fn(t) : t))
  emitir()
}

function mudarMensagem(id: string, mensagemId: string, fn: (mensagem: ChatMessage) => ChatMessage) {
  mudar(id, (t) => ({ ...t, messages: t.messages.map((m) => (m.id === mensagemId ? fn(m) : m)) }))
}

/** Abrir a conversa zera as não lidas dela. */
export function abrirTicket(id: string) {
  mudar(id, (t) => ({ ...t, unread: 0 }))
}

export interface NovaMensagem {
  text: string
  files: ChatFile[]
  audioSeconds?: number
  replyTo?: ChatMessage['replyTo']
}

/** Acrescenta a mensagem do atendente ao fim da conversa e atualiza o resumo da lista. */
export function enviarMensagem(id: string, { text, files, audioSeconds, replyTo }: NovaMensagem) {
  contador += 1
  mudar(id, (t) => {
    const nova: ChatMessage = {
      id: `${id}-nova-${contador}`,
      from: 'agent',
      author: t.assignee ?? exampleUser.name,
      text: text || undefined,
      time: new Date(),
      status: 'sent',
      replyTo,
      attachments: files.length
        ? files.map((f) => ({
            name: f.name,
            type: f.type,
            size: f.size,
            ...(f.type?.startsWith('audio/') ? { duration: audioSeconds } : {}),
          }))
        : undefined,
    }
    return {
      ...t,
      messages: [...t.messages, nova],
      lastMessage: text || files[0]?.name || t.lastMessage,
      time: nova.time,
    }
  })
}

/** Liga ou desliga a reação com o emoji na mensagem. */
export function reagirMensagem(id: string, mensagemId: string, emoji: string) {
  mudarMensagem(id, mensagemId, (m) => {
    const reacoes = m.reactions ?? []
    return { ...m, reactions: reacoes.includes(emoji) ? reacoes.filter((r) => r !== emoji) : [...reacoes, emoji] }
  })
}

/** Troca o texto e guarda o original (só o primeiro) em `editedFrom`. */
export function editarMensagem(id: string, mensagemId: string, text: string) {
  mudarMensagem(id, mensagemId, (m) => ({ ...m, text, editedFrom: m.editedFrom ?? m.text }))
}

export function excluirMensagem(id: string, mensagemId: string) {
  mudarMensagem(id, mensagemId, (m) => ({ ...m, deleted: true }))
}

/** Assumir a conversa da fila: o usuário vira atendente, a espera acaba e entra o aviso de sistema. */
export function assumirTicket(id: string) {
  contador += 1
  mudar(id, (t) => {
    const aviso: ChatMessage = {
      id: `${id}-sistema-${contador}`,
      from: 'system',
      text: `${exampleUser.name} assumiu a conversa`,
      time: new Date(),
    }
    return {
      ...t,
      stage: 'atendimento',
      assignee: exampleUser.name,
      waitingSince: undefined,
      unread: 0,
      messages: [...t.messages, aviso],
    }
  })
}

export function restaurarTickets() {
  estado = demoTickets
  contador = 0
  emitir()
}

/** A conversa ligada ao cliente da carteira, se houver. */
export function ticketDoCliente(clienteId: number): Ticket | undefined {
  return estado.find((t) => t.clienteId === clienteId)
}

const lerEstado = () => estado

/** Os tickets visíveis agora. */
export function useTickets(): readonly Ticket[] {
  return useSyncExternalStore(assinar, lerEstado, lerEstado)
}

/** Total de mensagens não lidas, para o selo do menu. */
export function useNaoLidas(): number {
  const tickets = useTickets()
  return tickets.reduce((soma, t) => soma + (t.unread ?? 0), 0)
}

/** A conversa ligada ao cliente, reagindo às mudanças. */
export function useTicketDoCliente(clienteId: number): Ticket | undefined {
  useTickets()
  return ticketDoCliente(clienteId)
}
