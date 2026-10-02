import { useEffect, useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useBrand } from '../../../src/brand'
import { PageHeader } from '../../../src/components/layout'
import { ActionBar, Button, ChatComposer, ChatThread, EmptyState, chatChannels } from '../../../src/components/ui'
import type { ChatMessage } from '../../../src/components/ui/chat/types'
import {
  abrirTicket,
  assumirTicket,
  editarMensagem,
  enviarMensagem,
  excluirMensagem,
  reagirMensagem,
  useTickets,
} from '../../../src/demo/tickets-store'
import { useDocumentTitle } from '../../../src/lib/use-document-title'
import { demoTickets, quickRepliesDemo } from '../../../src/mocks/chat'

/** Uma página estática por conversa no export web (sem isso `/atendimento/t1` daria 404 no `serve` e no Pages). */
export function generateStaticParams() {
  return demoTickets.map((t) => ({ id: t.id }))
}

/**
 * Conversa da demonstração (rota dinâmica): o histórico em `ChatThread` com altura limitada e o
 * `ChatComposer` fixo abaixo. Abrir zera as não lidas; enviar, reagir, editar e excluir mexem no
 * `tickets-store`. Na fila o campo fica desativado até "Assumir atendimento". O título do
 * cabeçalho do shell é o nome do contato.
 */
export default function Conversa() {
  const { brand } = useBrand()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const tickets = useTickets()
  const ticket = tickets.find((t) => t.id === id)
  const ticketId = ticket?.id
  const [quote, setQuote] = useState<ChatMessage | null>(null)
  const [editing, setEditing] = useState<ChatMessage | null>(null)
  useDocumentTitle(
    ticket ? `${ticket.name} · ${brand.productName}` : `Conversa não encontrada · ${brand.productName}`,
  )

  useEffect(() => {
    if (ticketId) abrirTicket(ticketId)
  }, [ticketId])

  if (!ticket) {
    return (
      <ScrollView tabIndex={0} className="flex-1 bg-background" contentContainerClassName="flex-grow justify-center p-4">
        <EmptyState
          title="Conversa não encontrada"
          description="Esta conversa não existe."
          type="warning"
          actions={<Button onPress={() => router.replace('/atendimento')}>Ver todas as conversas</Button>}
        />
      </ScrollView>
    )
  }

  const canal = chatChannels[ticket.channel].label
  const naFila = ticket.stage === 'fila'

  return (
    <View className="flex-1 bg-background">
      <View className="p-4">
        <PageHeader
          title={ticket.name}
          description={[canal, ticket.assignee].filter(Boolean).join(' · ')}
        />
      </View>
      <View className="min-h-0 flex-1 overflow-hidden border-t border-border">
        <ChatThread
          messages={ticket.messages}
          onReply={(m) => {
            setEditing(null)
            setQuote(m)
          }}
          onReact={(m, emoji) => reagirMensagem(ticket.id, m.id, emoji)}
          onEdit={(m) => {
            setQuote(null)
            setEditing(m)
          }}
          onDelete={(m) => excluirMensagem(ticket.id, m.id)}
        />
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ChatComposer
          disabled={naFila}
          disabledHint="Assuma a conversa para responder."
          disabledAction={
            <ActionBar
              sticky={false}
              primary={{ label: 'Assumir atendimento', onPress: () => assumirTicket(ticket.id) }}
            />
          }
          quote={quote ? { author: quote.author, text: quote.text } : null}
          onCancelQuote={() => setQuote(null)}
          editing={editing ? { id: editing.id, text: editing.text } : null}
          onCancelEdit={() => setEditing(null)}
          quickReplies={quickRepliesDemo}
          onPickFiles={async () => [
            { name: 'Orçamento.pdf', uri: 'exemplo://orcamento.pdf', type: 'application/pdf', size: 184320 },
          ]}
          onPickMedia={async () => [
            { name: 'Foto da vitrine.jpg', uri: 'exemplo://vitrine.jpg', type: 'image/jpeg', size: 921600 },
          ]}
          onSend={({ text, files, audioSeconds }) => {
            if (editing) {
              editarMensagem(ticket.id, editing.id, text)
              setEditing(null)
              return
            }
            enviarMensagem(ticket.id, {
              text,
              files,
              audioSeconds,
              replyTo: quote ? { id: quote.id, author: quote.author, text: quote.text } : undefined,
            })
            setQuote(null)
          }}
        />
      </KeyboardAvoidingView>
    </View>
  )
}
