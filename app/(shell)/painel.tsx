import { ScrollView, View } from 'react-native'
import { Text } from '../../src/components/internal/text'
import { useBrand } from '../../src/brand'
import { PageHeader } from '../../src/components/layout'
import { Avatar, Card, CardContent, CardHeader, CardTitle, List, StatCard } from '../../src/components/ui'
import { useRendraNavigation } from '../../src/navigation/rendra-navigation'
import { useDocumentTitle } from '../../src/lib/use-document-title'

/** Dados de exemplo do painel; o app real troca por chamadas à própria API. */
const clientesRecentes = [
  { id: 'marina-costa', nome: 'Marina Costa', detalhe: 'Plano Pro, desde 12/09/2026' },
  { id: 'rafael-nunes', nome: 'Rafael Nunes', detalhe: 'Plano Essencial, desde 18/09/2026' },
  { id: 'beatriz-lima', nome: 'Beatriz Lima', detalhe: 'Plano Pro, desde 24/09/2026' },
]

const atividade = ['Fatura de setembro paga por Marina Costa.', 'Novo chamado aberto por Rafael Nunes.']

export default function Painel() {
  const { brand } = useBrand()
  const { searchParams } = useRendraNavigation()
  useDocumentTitle(`Painel · ${brand.productName}`)
  const emFoco = clientesRecentes.find((c) => c.id === searchParams?.cliente)

  return (
    <ScrollView tabIndex={0} className="flex-1 bg-background" contentContainerClassName="gap-6 p-4">
      <PageHeader title="Painel" description="Resumo do mês da sua conta." />

      <View className="gap-4">
        <StatCard label="Receita do mês" value="R$ 8.420,00" change={5.4} highlight />
        <StatCard label="Clientes ativos" value="128" change={2.1} />
        <StatCard label="Chamados abertos" value="12" change={-8} inverse />
      </View>

      <Card>
        <CardHeader>
          <CardTitle>Clientes recentes</CardTitle>
        </CardHeader>
        <CardContent noTopPadding>
          <List
            scrollEnabled={false}
            items={clientesRecentes.map((c) => ({
              id: c.id,
              title: c.nome,
              description: c.detalhe,
              leading: <Avatar name={c.nome} />,
              href: `/painel?cliente=${c.id}`,
            }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Atividade</CardTitle>
        </CardHeader>
        <CardContent noTopPadding className="gap-2">
          <Text weight="medium" className="text-sm text-foreground">
            {emFoco ? `Cliente em foco: ${emFoco.nome}` : 'Nenhum cliente em foco.'}
          </Text>
          {atividade.map((linha) => (
            <Text key={linha} className="text-sm text-muted-foreground">
              {linha}
            </Text>
          ))}
        </CardContent>
      </Card>
    </ScrollView>
  )
}
