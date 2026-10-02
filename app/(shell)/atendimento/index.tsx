import { useState } from 'react'
import { ScrollView, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useBrand } from '../../../src/brand'
import { PageHeader } from '../../../src/components/layout'
import { ConversationList, Input, Select, Tabs, chatChannels } from '../../../src/components/ui'
import { useTickets } from '../../../src/demo/tickets-store'
import { useDocumentTitle } from '../../../src/lib/use-document-title'
import type { TicketStage } from '../../../src/mocks/chat'

const etapas: { value: TicketStage; label: string }[] = [
  { value: 'ura', label: 'URA/IA' },
  { value: 'fila', label: 'Fila' },
  { value: 'atendimento', label: 'Atendimento' },
  { value: 'encerrado', label: 'Encerrado' },
]

const opcoesCanal = Object.entries(chatChannels).map(([value, canal]) => ({ value, label: canal.label }))

/**
 * Atendimento da demonstração: as conversas por etapa (URA/IA, Fila, Atendimento e Encerrado), com
 * busca pelo nome ou pela última mensagem e filtro por canal. Tocar numa conversa abre a conversa
 * dela. Os tickets vêm do `tickets-store`, o mesmo estado da conversa e do selo do menu.
 */
export default function Atendimento() {
  const { brand } = useBrand()
  const router = useRouter()
  useDocumentTitle(`Atendimento · ${brand.productName}`)
  const tickets = useTickets()
  const [busca, setBusca] = useState('')
  const [canais, setCanais] = useState<string[]>([])

  const termo = busca.trim().toLowerCase()
  const filtrados = tickets.filter(
    (t) =>
      (!termo || t.name.toLowerCase().includes(termo) || t.lastMessage.toLowerCase().includes(termo)) &&
      (canais.length === 0 || canais.includes(t.channel)),
  )
  const filtrando = termo.length > 0 || canais.length > 0

  return (
    <View className="flex-1 bg-background">
      <ScrollView tabIndex={0} className="flex-1" contentContainerClassName="gap-6 p-4" keyboardShouldPersistTaps="handled">
        <PageHeader title="Atendimento" description="Acompanhe as conversas por etapa e assuma as da fila." />
        <Input
          value={busca}
          onChange={setBusca}
          accessibilityLabel="Buscar conversa"
          placeholder="Buscar conversa"
          clearable
        />
        <Select
          multiple
          showCount
          label="Canal"
          options={opcoesCanal}
          value={canais}
          onChange={setCanais}
        />
        <Tabs
          variant="pill"
          defaultValue="fila"
          accessibilityLabel="Etapa do atendimento"
          items={etapas.map((etapa) => {
            const daEtapa = filtrados.filter((t) => t.stage === etapa.value)
            return {
              value: etapa.value,
              label: etapa.label,
              count: daEtapa.length,
              content: (
                <ConversationList
                  items={daEtapa}
                  empty={filtrando ? 'Nenhuma conversa com essa busca ou filtros.' : 'Nenhuma conversa aqui.'}
                  onSelect={(id) => router.push(`/atendimento/${id}`)}
                />
              ),
            }
          })}
        />
      </ScrollView>
    </View>
  )
}
