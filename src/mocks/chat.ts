import type { ChatMessage, Conversation } from '../components/ui/chat/types'
import type { QuickReply } from '../components/ui/chat/chat-composer'

/** Etapa do atendimento: robo (URA/IA), fila, em atendimento ou encerrado. */
export type TicketStage = 'ura' | 'fila' | 'atendimento' | 'encerrado'

/** Conversa de demonstracao: o resumo da lista, a etapa, o cliente da carteira e as mensagens da conversa aberta. */
export type Ticket = Conversation & { stage: TicketStage; clienteId: number; messages: ChatMessage[] }

// Datas fixas em torno de segunda, 05/10/2026 (nada de Date.now), como os demais mocks.
const t = (dia: number, h: number, m: number) => new Date(2026, 9, dia, h, m)
// A conversa da fila e anterior ao relogio fixo das capturas (29/09/2026 12:00), para a espera ser plausivel.
const antes = (h: number, m: number) => new Date(2026, 8, 29, h, m)

const conversaAna: ChatMessage[] = [
  { id: 'a0', from: 'system', text: 'Conversa iniciada pelo WhatsApp', time: t(5, 9, 0) },
  { id: 'a1', from: 'bot', text: 'Olá! Sou o assistente virtual. Sobre o que você quer falar?', time: t(5, 9, 0), author: 'Assistente virtual' },
  { id: 'a2', from: 'contact', author: 'Ana Souza', text: 'Preciso da segunda via do boleto de outubro, o link que recebi é https://exemplo.com.br/financeiro/segunda-via/boleto/2026/10/cliente/ana-souza/documento/1234567890123456789012345678901234567890', time: t(5, 9, 2) },
  {
    id: 'a3',
    from: 'agent',
    author: 'Bruno Lima',
    text: 'Claro, Ana! Já envio o boleto atualizado.',
    time: t(5, 9, 4),
    status: 'read',
    reactions: ['👍'],
    replyTo: { id: 'a2', author: 'Ana Souza', text: 'Preciso da segunda via do boleto de outubro, o link que recebi é https://exemplo.com.br/financeiro/segunda-via/boleto/2026/10/cliente/ana-souza/documento/1234567890123456789012345678901234567890' },
  },
  {
    id: 'a4',
    from: 'agent',
    author: 'Bruno Lima',
    text: 'Boleto de outubro, vence em 10/10/2026.',
    time: t(5, 9, 5),
    status: 'delivered',
    attachments: [{ name: 'Boleto-outubro.pdf', url: 'https://exemplo.com.br/boleto-outubro.pdf', type: 'application/pdf', size: 184320 }],
  },
  { id: 'a5', from: 'contact', author: 'Ana Souza', text: 'Recebi, muito obrigada!', time: t(5, 9, 8), reactions: ['🙏', '🙏'] },
]

const conversaCarlos: ChatMessage[] = [
  { id: 'c1', from: 'contact', author: 'Carlos Dias', text: 'Bom dia, o relatório de vendas não abre aqui.', time: t(5, 8, 10) },
  { id: 'c2', from: 'agent', author: 'Bruno Lima', text: 'Bom dia, Carlos. Pode me mandar um print da tela?', time: t(5, 8, 15), status: 'read' },
  { id: 'c3', from: 'contact', author: 'Carlos Dias', text: 'Segue o print.', time: t(5, 8, 20), attachments: [{ name: 'erro-relatorio.png', type: 'image/png', size: 524288 }] },
  {
    id: 'c4',
    from: 'agent',
    author: 'Bruno Lima',
    text: 'Corrigimos o acesso ao relatório, pode testar de novo?',
    editedFrom: 'Corrigimos o acesso ao relatorio.',
    time: t(5, 8, 40),
    status: 'sent',
  },
  { id: 'c5', from: 'agent', author: 'Bruno Lima', text: 'Mensagem enviada por engano.', time: t(5, 8, 41), deleted: true },
]

const conversaDiana: ChatMessage[] = [
  { id: 'd1', from: 'contact', author: 'Diana Melo', text: 'Vocês atendem aos sábados?', time: antes(11, 30) },
  { id: 'd2', from: 'bot', author: 'Assistente virtual', text: 'Nosso atendimento humano é de segunda a sexta, das 8h às 18h.', time: antes(11, 31) },
  { id: 'd3', from: 'contact', author: 'Diana Melo', text: 'Preciso falar com uma pessoa, é sobre um contrato.', time: antes(11, 35) },
]

/** Tres conversas de exemplo: uma em atendimento, uma com aviso de nao lidas e uma esperando na fila. */
export const demoTickets: Ticket[] = [
  {
    id: 't1',
    stage: 'atendimento',
    clienteId: 1000,
    name: 'Ana Souza',
    channel: 'whatsapp',
    account: 'Comercial',
    department: 'Financeiro',
    assignee: 'Bruno Lima',
    lastMessage: conversaAna[conversaAna.length - 1]!.text ?? '',
    time: conversaAna[conversaAna.length - 1]!.time,
    messages: conversaAna,
  },
  {
    id: 't2',
    stage: 'atendimento',
    clienteId: 1009,
    name: 'Carlos Dias',
    channel: 'email',
    department: 'Suporte',
    assignee: 'Bruno Lima',
    lastMessage: conversaCarlos[conversaCarlos.length - 1]!.text ?? '',
    time: conversaCarlos[conversaCarlos.length - 1]!.time,
    unread: 2,
    messages: conversaCarlos,
  },
  {
    id: 't3',
    stage: 'fila',
    clienteId: 1018,
    name: 'Diana Melo',
    channel: 'site',
    department: 'Fila',
    lastMessage: conversaDiana[conversaDiana.length - 1]!.text ?? '',
    time: conversaDiana[conversaDiana.length - 1]!.time,
    unread: 1,
    waitingSince: antes(11, 35),
    messages: conversaDiana,
  },
]

/** Mensagens rapidas cadastradas: o atendente escolhe e revisa antes de enviar. */
export const quickRepliesDemo: QuickReply[] = [
  { id: 'q1', title: 'Saudação', text: 'Olá! Tudo bem? Sou do time de atendimento, como posso ajudar?' },
  { id: 'q2', title: 'Aguarde um instante', text: 'Só um instante, já estou verificando isso para você.' },
  { id: 'q3', title: 'Encerramento', text: 'Posso ajudar em mais alguma coisa? Se não, agradeço o contato e até logo!' },
]
