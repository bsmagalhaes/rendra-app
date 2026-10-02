/**
 * Tipos do Chat de atendimento (F3), os mesmos do design system web, com uma diferenca assumida de
 * contrato: o `File` do DOM vira `ChatFile { name, uri, type?, size? }`, porque o celular nao tem
 * `File`; quem escolhe arquivo e midia e o app (callbacks `onPickFiles` e `onPickMedia`).
 */

export type ChatChannel =
  | 'whatsapp'
  | 'whatsapp-web'
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'google'
  | 'reclameaqui'
  | 'site'
  | 'email'
  | 'sms'

/** Arquivo escolhido no aparelho, pronto para enviar. */
export interface ChatFile {
  name: string
  uri: string
  type?: string
  size?: number
}

export interface ChatAttachment {
  name: string
  /** Endereco do arquivo. */
  url?: string
  type?: string
  size?: number
  /** Duracao em segundos (audio e video). */
  duration?: number
}

export interface ChatMessage {
  id: string
  /** Foto de quem enviou (cliente ou atendente). */
  avatar?: string
  /** Quem enviou: o cliente, o atendente, o robo (URA/IA) ou um aviso do sistema. */
  from: 'contact' | 'agent' | 'bot' | 'system'
  text?: string
  time: Date
  /** Nome de quem enviou (atendente ou robo). */
  author?: string
  /** Mensagem citada. Com o id, tocar na citacao leva ate a original. */
  replyTo?: { id?: string; author?: string; text?: string }
  /** Reacoes com emoji. */
  reactions?: string[]
  /** Excluida: continua no chat, riscada e em vermelho claro. */
  deleted?: boolean
  /** Texto antes da edicao: a mensagem mostra o novo e o original. */
  editedFrom?: string
  /** Situacao da mensagem enviada: enviada, entregue, lida. */
  status?: 'sent' | 'delivered' | 'read'
  attachments?: ChatAttachment[]
}

export interface Conversation {
  id: string
  name: string
  /** Foto do contato. */
  avatar?: string
  channel: ChatChannel
  /** Conta ou numero do canal que recebeu (ex.: "Comercial"). */
  account?: string
  /** Departamento ou fila (ex.: "Suporte"). */
  department?: string
  lastMessage: string
  time: Date
  unread?: number
  /** Esperando desde (fila): mostra o tempo de espera. */
  waitingSince?: Date
  assignee?: string
}
