import { useState } from 'react'
import { ScrollView, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Text } from '../../../src/components/internal/text'
import { useBrand } from '../../../src/brand'
import { PageHeader } from '../../../src/components/layout'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  List,
  Modal,
  StatCard,
  Tabs,
  Timeline,
  toast,
} from '../../../src/components/ui'
import { DataRow } from '../../../src/demo/data-row'
import { excluirCliente, useClientes } from '../../../src/demo/clients-store'
import { useTicketDoCliente } from '../../../src/demo/tickets-store'
import { formatCurrency } from '../../../src/lib/masks'
import { useDocumentTitle } from '../../../src/lib/use-document-title'
import { activityOf, clients, contractsOf, statusTone, type Cliente } from '../../../src/mocks/clients'

/** Uma página estática por cliente no export web (sem isso `/clientes/1000` daria 404 no `serve` e no Pages). */
export function generateStaticParams() {
  return clients.map((c) => ({ id: String(c.id) }))
}

function Resumo({ cliente }: { cliente: Cliente }) {
  const vigentes = contractsOf(cliente.id).filter((c) => c.situacao === 'Vigente').length
  return (
    <View className="gap-4 pt-4">
      <Card>
        <CardHeader>
          <CardTitle>Dados do cliente</CardTitle>
        </CardHeader>
        <CardContent noTopPadding className="gap-4">
          <DataRow rotulo="CNPJ" valor={cliente.cnpj} />
          <DataRow rotulo="E-mail" valor={cliente.email} />
          <DataRow rotulo="Telefone" valor={cliente.telefone} />
          <DataRow rotulo="Segmento" valor={cliente.segmento} />
          <View className="items-start gap-1">
            <Text className="text-xs text-muted-foreground">Situação</Text>
            <Badge tone={statusTone[cliente.situacao]}>{cliente.situacao}</Badge>
          </View>
        </CardContent>
      </Card>
      <StatCard label="Receita mensal" value={formatCurrency(cliente.mrr)} />
      <StatCard label="Contratos vigentes" value={String(vigentes)} />
    </View>
  )
}

/**
 * Detalhe do cliente da demonstração (rota dinâmica): quatro abas (Resumo, Contratos, Atividade e
 * Documentos), "Conversar" (só para quem tem conversa), exclusão com confirmação e o estado "Cliente não encontrado" para id inexistente.
 * O título do cabeçalho do shell é o nome do cliente.
 */
export default function ClienteDetalhe() {
  const { brand } = useBrand()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const carteira = useClientes()
  const conversa = useTicketDoCliente(Number(id))
  const [excluindo, setExcluindo] = useState(false)
  const encontrado = carteira.find((c) => c.id === Number(id))
  useDocumentTitle(
    encontrado ? `${encontrado.nome} · ${brand.productName}` : `Cliente não encontrado · ${brand.productName}`,
  )

  if (!encontrado) {
    return (
      <ScrollView tabIndex={0} className="flex-1 bg-background" contentContainerClassName="flex-grow justify-center p-4">
        <EmptyState
          title="Cliente não encontrado"
          description="Este cliente não existe ou já foi excluído."
          type="warning"
          actions={<Button onPress={() => router.replace('/clientes')}>Ver todos os clientes</Button>}
        />
      </ScrollView>
    )
  }

  function confirmarExclusao() {
    excluirCliente(encontrado!.id)
    setExcluindo(false)
    toast.success('Cliente excluído')
    router.replace('/clientes')
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView tabIndex={0} className="flex-1" contentContainerClassName="gap-6 p-4">
        <PageHeader
          title={encontrado.nome}
          description={`${encontrado.segmento} · ${encontrado.cidade}`}
          actions={
            <>
              {conversa ? (
                <Button variant="outline" onPress={() => router.push(`/atendimento/${conversa.id}`)}>
                  Conversar
                </Button>
              ) : null}
              <Button variant="outline" onPress={() => toast.info('Edição simulada nesta demonstração')}>
                Editar
              </Button>
              <Button variant="destructive" onPress={() => setExcluindo(true)}>
                Excluir cliente
              </Button>
            </>
          }
        />
        <Tabs
          accessibilityLabel="Seção do cliente"
          items={[
            { value: 'resumo', label: 'Resumo', content: <Resumo cliente={encontrado} /> },
            {
              value: 'contratos',
              label: 'Contratos',
              content: (
                <View className="pt-4">
                  <List
                    scrollEnabled={false}
                    items={contractsOf(encontrado.id).map((c) => ({
                      id: c.id,
                      title: c.titulo,
                      description: `Início em ${c.inicio}`,
                      trailing: (
                        <View className="items-end justify-center gap-1">
                          <Text weight="medium" className="text-sm text-foreground">
                            {formatCurrency(c.valor)}
                          </Text>
                          <Badge tone={c.situacao === 'Vigente' ? 'success' : 'neutral'}>{c.situacao}</Badge>
                        </View>
                      ),
                    }))}
                  />
                </View>
              ),
            },
            {
              value: 'atividade',
              label: 'Atividade',
              content: (
                <View className="pt-4">
                  <Timeline
                    events={activityOf(encontrado.id).map((a) => ({
                      id: a.id,
                      title: a.titulo,
                      date: a.data,
                      tone: a.tone,
                    }))}
                  />
                </View>
              ),
            },
            {
              value: 'documentos',
              label: 'Documentos',
              content: (
                <EmptyState
                  title="Nenhum documento anexado"
                  description="Os contratos e comprovantes deste cliente aparecem aqui."
                  actions={
                    <Button variant="outline" onPress={() => toast.info('Anexo simulado nesta demonstração')}>
                      Anexar documento
                    </Button>
                  }
                />
              ),
            },
          ]}
        />
      </ScrollView>

      <Modal
        open={excluindo}
        onOpenChange={setExcluindo}
        type="destructive"
        title="Excluir cliente?"
        description={`${encontrado.nome} sai da lista desta demonstração.`}
        confirmLabel="Confirmar exclusão"
        onConfirm={confirmarExclusao}
      />
    </View>
  )
}
