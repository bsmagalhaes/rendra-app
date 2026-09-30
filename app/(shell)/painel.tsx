import { useState } from 'react'
import { ScrollView, View } from 'react-native'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { UserPlus } from 'lucide-react-native'
import { Text } from '../../src/components/internal/text'
import { useBrand } from '../../src/brand'
import { PageHeader } from '../../src/components/layout'
import {
  ActionBar,
  Avatar,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Drawer,
  Form,
  FormField,
  Input,
  List,
  StatCard,
  toast,
} from '../../src/components/ui'
import { adicionarCliente, useClientes } from '../../src/demo/clients-store'
import { formatCurrency } from '../../src/lib/masks'
import { useDocumentTitle } from '../../src/lib/use-document-title'
import { zBR } from '../../src/lib/validators'
import { filterClients, resumoPeriodo } from '../../src/mocks/clients'
import { notifications } from '../../src/mocks/notifications'

const opcoesPeriodo = [
  { value: '6', label: '6 meses' },
  { value: '12', label: '12 meses' },
]

const novoClienteSchema = z.object({
  razaoSocial: z.string().trim().min(1, 'Informe a razão social.'),
  email: zBR.email(),
})

/**
 * Painel da demonstração: o período (6 ou 12 meses) alimenta os indicadores por
 * `resumoPeriodo`, os clientes recentes vêm dos mocks e cada um leva ao detalhe, e "Novo cliente"
 * abre um `Drawer` com dois campos. Um único degradê na rota (o indicador em destaque).
 */
export default function Painel() {
  const { brand } = useBrand()
  useDocumentTitle(`Painel · ${brand.productName}`)
  const carteira = useClientes()
  const [periodo, setPeriodo] = useState('6')
  const [novoAberto, setNovoAberto] = useState(false)
  const form = useForm({
    resolver: zodResolver(novoClienteSchema),
    mode: 'onTouched',
    defaultValues: { razaoSocial: '', email: '' },
  })

  const resumo = resumoPeriodo(Number(periodo))
  const ativos = carteira.filter((c) => c.situacao === 'Ativo').length
  const recentes = filterClients({ porPagina: 3, base: carteira }).itens

  function salvarNovoCliente() {
    adicionarCliente({ nome: form.getValues().razaoSocial, email: form.getValues().email })
    setNovoAberto(false)
    form.reset()
    toast.success('Cliente cadastrado (simulado)')
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView tabIndex={0} className="flex-1" contentContainerClassName="gap-6 p-4" keyboardShouldPersistTaps="handled">
        <PageHeader
          title="Painel"
          description="Resumo da sua conta no período escolhido."
          actions={
            <Button icon={<UserPlus className="text-primary-foreground" />} onPress={() => setNovoAberto(true)}>
              Novo cliente
            </Button>
          }
        />

        <ButtonGroup accessibilityLabel="Período" options={opcoesPeriodo} value={periodo} onChange={setPeriodo} />

        <View className="gap-4">
          <StatCard label="Receita do período" value={formatCurrency(resumo.receita)} change={resumo.variacaoReceita} highlight />
          <StatCard label="Novos clientes" value={String(resumo.novosClientes)} />
          <StatCard label="Clientes ativos" value={String(ativos)} />
        </View>

        <Card>
          <CardHeader>
            <CardTitle>Clientes recentes</CardTitle>
          </CardHeader>
          <CardContent noTopPadding>
            <List
              scrollEnabled={false}
              items={recentes.map((c) => ({
                id: String(c.id),
                title: c.nome,
                description: `${c.segmento} · ${c.cidade}`,
                leading: <Avatar name={c.nome} />,
                href: `/clientes/${c.id}`,
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividade</CardTitle>
          </CardHeader>
          <CardContent noTopPadding>
            <List
              scrollEnabled={false}
              items={notifications.map((n) => ({
                id: String(n.id),
                title: n.titulo,
                description: n.descricao,
                trailing: <Text className="text-xs text-muted-foreground">{n.data}</Text>,
              }))}
            />
          </CardContent>
        </Card>
      </ScrollView>

      <Drawer
        open={novoAberto}
        onOpenChange={setNovoAberto}
        title="Novo cliente"
        description="Cadastro rápido, só com o essencial."
        dirty={form.formState.isDirty}
        footer={<ActionBar sticky={false} primary={{ label: 'Salvar', onPress: form.handleSubmit(salvarNovoCliente) }} />}
      >
        <Form form={form} onSubmit={salvarNovoCliente} className="gap-4 p-4">
          <FormField name="razaoSocial" label="Razão social" required render={(f) => <Input {...f} />} />
          <FormField name="email" label="E-mail" required render={(f) => <Input {...f} />} />
        </Form>
      </Drawer>
    </View>
  )
}
