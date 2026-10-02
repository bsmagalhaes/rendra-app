import { ScrollView, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useBrand } from '../../src/brand'
import { PageHeader } from '../../src/components/layout'
import { Kanban } from '../../src/components/ui'
import { moverCard, useCards } from '../../src/demo/planning-store'
import { useDocumentTitle } from '../../src/lib/use-document-title'
import { pipelineColumns } from '../../src/mocks/planning'

const campos = [
  { key: 'ps', label: 'P&S' },
  { key: 'mrr', label: 'MRR' },
]

/**
 * Funil comercial da demonstração: o `Kanban` com os cards do `planning-store`. Mover pelo menu do
 * card muda a coluna e a ordem e sobrevive à navegação; tocar no card abre o detalhe do cliente
 * dele. O quadro fica dentro da rolagem da página (`scrollEnabled={false}`), como na vitrine.
 */
export default function Funil() {
  const { brand } = useBrand()
  const router = useRouter()
  useDocumentTitle(`Funil comercial · ${brand.productName}`)
  const cards = useCards()

  return (
    <View className="flex-1 bg-background">
      <ScrollView tabIndex={0} className="flex-1" contentContainerClassName="gap-6 p-4" keyboardShouldPersistTaps="handled">
        <PageHeader title="Funil comercial" description="Acompanhe os negócios de cada etapa e mova os cards." />
        <Kanban
          aria-label="Funil comercial"
          columns={pipelineColumns}
          cards={[...cards]}
          valueFields={campos}
          scrollEnabled={false}
          onCardMove={(id, coluna, indice) => moverCard(id, coluna, indice)}
          onCardClick={(card) => {
            const clienteId = cards.find((c) => c.id === card.id)?.clienteId
            if (clienteId !== undefined) router.push(`/clientes/${clienteId}`)
          }}
        />
      </ScrollView>
    </View>
  )
}
