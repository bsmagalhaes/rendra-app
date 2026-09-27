import { useState } from 'react'
import type { ReactNode } from 'react'
import { View } from 'react-native'
import { MoreHorizontal, Wallet } from 'lucide-react-native'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Text } from '../components/internal/text'
import {
  ActionBar,
  Button,
  ButtonGroup,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  BrandFeedbackIcon,
  InfoHint,
  Modal,
  Input,
  Textarea,
  Select,
  Checkbox,
  RadioGroup,
  Switch,
  Slider,
  OtpInput,
  DatePicker,
  Field,
  Form,
  FormField,
  FormSection,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Skeleton,
  Progress,
  Alert,
  toast,
  EmptyState,
  Drawer,
  Separator,
  Badge,
  Avatar,
  AvatarGroup,
  List,
  StatCard,
  Accordion,
  Tabs,
  BrandLogo,
} from '../components/ui'
import { Gradient } from '../components/gradient/gradient'
import { Container, Grid, Inline, PageHeader, Section, Stack } from '../components/layout'
import { zBR } from '../lib/validators'

export interface ShowcaseEntry {
  name: string
  description: string
  render: () => ReactNode
}

export interface ShowcaseGroup {
  slug: string
  title: string
  entries: ShowcaseEntry[]
}

function ButtonExample() {
  return <Button onPress={() => {}}>Salvar</Button>
}

function ButtonGroupExample() {
  const [value, setValue] = useState('dia')
  return (
    <ButtonGroup
      options={[
        { value: 'dia', label: 'Dia' },
        { value: 'semana', label: 'Semana' },
        { value: 'mes', label: 'Mês' },
      ]}
      value={value}
      onChange={setValue}
    />
  )
}

function ActionBarExample() {
  return (
    <ActionBar
      sticky={false}
      primary={{ label: 'Salvar', onPress: () => {} }}
      cancel={{ label: 'Cancelar', onPress: () => {} }}
      secondary={[{ label: 'Duplicar', onPress: () => {} }]}
    />
  )
}

function DropdownMenuExample() {
  const [open, setOpen] = useState(false)
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger>
        <Button
          variant="outline"
          iconOnly
          accessibilityLabel="Mais ações"
          icon={<MoreHorizontal className="text-foreground" />}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent accessibilityLabel="Mais ações">
        <DropdownMenuItem onSelect={() => {}}>Editar</DropdownMenuItem>
        <DropdownMenuItem destructive onSelect={() => {}}>
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function BrandFeedbackIconExample() {
  return <BrandFeedbackIcon type="success" label="Sucesso" />
}

function InfoHintExample() {
  return <InfoHint title="Sobre este campo">Este é um texto de ajuda orientativo.</InfoHint>
}

const modalExampleSchema = z.object({ nome: zBR.required('Nome') })

function ModalExample() {
  const [open, setOpen] = useState(false)
  const form = useForm({
    resolver: zodResolver(modalExampleSchema),
    mode: 'onTouched',
    defaultValues: { nome: '' },
  })
  return (
    <>
      <ButtonGroup>
        <Button onPress={() => setOpen(true)}>Abrir modal</Button>
      </ButtonGroup>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Novo contato"
        type="form"
        onConfirm={() =>
          new Promise<boolean>((resolve) => {
            form.handleSubmit(
              () => resolve(true),
              () => resolve(false),
            )()
          })
        }
      >
        <Form form={form} onSubmit={() => {}}>
          <FormField name="nome" label="Nome" required render={(f) => <Input {...f} />} />
        </Form>
      </Modal>
    </>
  )
}

function ContainerExample() {
  return (
    <Container padded className="rounded-control border border-border">
      <Text className="text-foreground">Conteúdo dentro do Container</Text>
    </Container>
  )
}

function StackExample() {
  return (
    <Stack gap="2">
      <Text className="text-foreground">Um</Text>
      <Text className="text-foreground">Dois</Text>
    </Stack>
  )
}

function InlineExample() {
  return (
    <Inline gap="2">
      <Text className="text-foreground">Um</Text>
      <Text className="text-foreground">Dois</Text>
    </Inline>
  )
}

function GridExample() {
  return (
    <Grid cols={2} gap="4">
      <Text className="text-foreground">1</Text>
      <Text className="text-foreground">2</Text>
      <Text className="text-foreground">3</Text>
      <Text className="text-foreground">4</Text>
    </Grid>
  )
}

function SectionExample() {
  return (
    <Section title="Seção" description="Descrição breve da seção.">
      <Text className="text-foreground">Conteúdo da seção</Text>
    </Section>
  )
}

function PageHeaderExample() {
  return <PageHeader title="Título da página" showTitle description="Descrição curta da tela." />
}

function InputExample() {
  const [cpf, setCpf] = useState('')
  const [valor, setValor] = useState('')
  const [telefone, setTelefone] = useState('')
  return (
    <Stack gap="4">
      <Input mask="cpf" placeholder="000.000.000-00" value={cpf} onChange={setCpf} clearable />
      <Input mask="currency" placeholder="R$ 0,00" value={valor} onChange={setValor} clearable />
      <Input mask="phone" placeholder="(00) 00000-0000" value={telefone} onChange={setTelefone} clearable />
    </Stack>
  )
}

function TextareaExample() {
  const [value, setValue] = useState('')
  return <Textarea placeholder="Escreva uma mensagem" value={value} onChange={setValue} counter maxLength={200} />
}

function SelectExample() {
  const [value, setValue] = useState<string[]>([])
  return (
    <Select
      multiple
      label="Categoria"
      placeholder="Selecione as categorias"
      options={[
        { value: 'a', label: 'Alfa' },
        { value: 'b', label: 'Beta' },
        { value: 'c', label: 'Gama' },
      ]}
      value={value}
      onChange={setValue}
      searchable
    />
  )
}

const ESTADOS_BRASILEIROS = [
  'Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará', 'Distrito Federal',
  'Espírito Santo', 'Goiás', 'Maranhão', 'Mato Grosso', 'Mato Grosso do Sul',
  'Minas Gerais', 'Pará', 'Paraíba', 'Paraná', 'Pernambuco', 'Piauí',
  'Rio de Janeiro', 'Rio Grande do Norte', 'Rio Grande do Sul', 'Rondônia',
  'Roraima', 'Santa Catarina', 'São Paulo', 'Sergipe', 'Tocantins',
]

function SelectListaLongaExample() {
  // Lista maior que a folha (27 estados), usada para provar que a lista rola por dentro,
  // até o último item, no export web (bloqueador do veredito do fechamento, select.tsx:301).
  const [value, setValue] = useState<string | null>(null)
  return (
    <Select
      label="Estado"
      placeholder="Selecione um estado"
      options={ESTADOS_BRASILEIROS.map((nome) => ({ value: nome, label: nome }))}
      value={value}
      onChange={setValue}
    />
  )
}

function CheckboxExample() {
  const [checked, setChecked] = useState(false)
  return <Checkbox label="Aceito os termos de uso" checked={checked} onCheckedChange={setChecked} />
}

function RadioGroupExample() {
  const [value, setValue] = useState('mensal')
  return (
    <RadioGroup
      options={[
        { value: 'mensal', label: 'Mensal' },
        { value: 'anual', label: 'Anual', description: 'Economize 20%' },
      ]}
      value={value}
      onChange={setValue}
    />
  )
}

function SwitchExample() {
  const [checked, setChecked] = useState(true)
  return <Switch label="Notificações por e-mail" checked={checked} onCheckedChange={setChecked} />
}

function SliderExample() {
  const [value, setValue] = useState([50])
  return <Slider value={value} onChange={setValue} showValue accessibilityLabel="Volume" />
}

function OtpInputExample() {
  const [value, setValue] = useState('')
  return <OtpInput value={value} onChange={setValue} />
}

function DatePickerExample() {
  const [value, setValue] = useState<Date | null>(null)
  return <DatePicker label="Data e hora do evento" value={value} onChange={setValue} time dropdowns />
}

function FieldExample() {
  const [value, setValue] = useState('')
  return (
    <Stack gap="4">
      <Field label="Nome completo" required help="Como aparece no documento">
        <Input value={value} onChange={setValue} />
      </Field>
      <Field label="E-mail" error="E-mail inválido.">
        <Input value="" onChange={() => {}} invalid />
      </Field>
    </Stack>
  )
}

const formularioRhfSchema = z.object({ nome: zBR.required('Nome'), email: zBR.email() })

function FormularioRhfExample() {
  const form = useForm({
    resolver: zodResolver(formularioRhfSchema),
    mode: 'onTouched',
    defaultValues: { nome: '', email: '' },
  })
  function onSubmit() {
    // vitrine: sem envio real, só demonstra a validação
  }
  return (
    <Form form={form} onSubmit={onSubmit}>
      <FormSection title="Dados pessoais">
        <FormField name="nome" label="Nome" required render={(f) => <Input {...f} />} />
        <FormField name="email" label="E-mail" render={(f) => <Input {...f} />} />
      </FormSection>
      <ActionBar sticky={false} primary={{ label: 'Salvar', onPress: form.handleSubmit(onSubmit) }} />
    </Form>
  )
}

function CardExample() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo do pedido</CardTitle>
        <CardDescription>3 itens, entrega em 25/09/2026</CardDescription>
      </CardHeader>
      <CardContent>
        <View />
      </CardContent>
    </Card>
  )
}

function SkeletonExample() {
  return (
    <Stack gap="3">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="size-12 rounded-avatar" />
    </Stack>
  )
}

function ProgressExample() {
  return (
    <Stack gap="3">
      <Progress value={62} showValue accessibilityLabel="Progresso do exemplo" />
      <Progress tone="brand" value={45} accessibilityLabel="Envio em andamento" />
      <Progress accessibilityLabel="Carregando" />
    </Stack>
  )
}

function AlertExample() {
  return (
    <Stack gap="3">
      <Alert type="success" title="Cadastro salvo" description="Os dados foram atualizados." />
      <Alert
        type="info"
        title="Nova versão disponível"
        description="Atualize quando puder."
        onDismiss={() => {}}
      />
      <Alert type="warning" title="Plano perto do limite" description="Restam 2 usuários." />
      <Alert type="error" title="Falha na sincronização" description="Tente de novo em instantes." />
    </Stack>
  )
}

function ToastExample() {
  return (
    <ButtonGroup>
      <Button
        onPress={() =>
          toast.success('Cadastro salvo', { description: 'Os dados foram atualizados.' })
        }
      >
        Mostrar sucesso
      </Button>
      <Button
        variant="outline"
        onPress={() =>
          toast.error('Falha ao salvar', { action: { label: 'Tentar de novo', onPress: () => {} } })
        }
      >
        Mostrar erro
      </Button>
    </ButtonGroup>
  )
}

function EmptyStateExample() {
  return (
    <EmptyState
      title="Nenhum cliente ainda"
      description="Cadastre o primeiro cliente para começar."
      actions={
        <ActionBar
          sticky={false}
          primary={{ label: 'Adicionar cliente', onPress: () => {} }}
          cancel={{ label: 'Importar', onPress: () => {} }}
        />
      }
    />
  )
}

function DrawerExample() {
  const [open, setOpen] = useState(false)
  const [nome, setNome] = useState('')
  const fechar = (next: boolean) => {
    setOpen(next)
    if (!next) setNome('')
  }
  return (
    <>
      <ButtonGroup>
        <Button onPress={() => setOpen(true)}>Abrir drawer</Button>
      </ButtonGroup>
      <Drawer
        open={open}
        onOpenChange={fechar}
        title="Editar cliente"
        description="Dados cadastrais"
        dirty={nome !== ''}
        footer={<ActionBar sticky={false} primary={{ label: 'Salvar', onPress: () => fechar(false) }} />}
      >
        <Input accessibilityLabel="Nome do cliente" placeholder="Nome" value={nome} onChange={setNome} />
      </Drawer>
    </>
  )
}

function SeparatorExample() {
  return (
    <Stack gap="3">
      <Separator />
      <Separator label="ou" />
    </Stack>
  )
}

function BadgeExample() {
  return (
    <Inline gap="2">
      <Badge dot>Neutro</Badge>
      <Badge tone="primary" dot>
        Primario
      </Badge>
      <Badge tone="success" dot>
        Ativo
      </Badge>
      <Badge tone="warning" dot>
        Alerta
      </Badge>
      <Badge tone="error" dot>
        Critico
      </Badge>
      <Badge tone="info" dot>
        Informativo
      </Badge>
      <Badge tone="outline" dot>
        Rascunho
      </Badge>
    </Inline>
  )
}

function AvatarExample() {
  return (
    <Stack gap="3">
      <Inline gap="2">
        <Avatar name="Ana Souza" size="sm" />
        <Avatar name="Bruno Lima" size="md" />
        <Avatar name="Carla Dias" size="lg" />
      </Inline>
      <AvatarGroup
        people={[
          { name: 'Ana Souza' },
          { name: 'Bruno Lima' },
          { name: 'Carla Dias' },
          { name: 'Diego Nunes' },
          { name: 'Elis Prado' },
          { name: 'Fabio Rocha' },
        ]}
        max={4}
      />
    </Stack>
  )
}

function ListExample() {
  return (
    <List
      scrollEnabled={false}
      items={[
        { id: '1', title: 'Ana Souza', description: 'ana@exemplo.com', href: '/componentes/exibicao' },
        { id: '2', title: 'Bruno Lima', description: 'bruno@exemplo.com', onPress: () => {} },
        { id: '3', title: 'Carla Dias', description: 'carla@exemplo.com' },
      ]}
    />
  )
}

function StatCardExample() {
  return (
    <StatCard
      label="Receita mensal"
      value="R$ 12.480,00"
      change={8.2}
      icon={<Wallet />}
      highlight
    />
  )
}

function AccordionExample() {
  return (
    <Accordion
      defaultValue={['envio']}
      items={[
        { value: 'envio', title: 'Envio', content: 'Prazo de 5 dias úteis para todo o Brasil.' },
        { value: 'pagamento', title: 'Pagamento', content: 'Aceita Pix, boleto e cartão em até 12x.' },
        { value: 'trocas', title: 'Trocas e devoluções', content: 'Até 30 dias após o recebimento.' },
      ]}
    />
  )
}

function TabsExample() {
  return (
    <Tabs
      accessibilityLabel="Seções do exemplo"
      items={[
        { value: 'visao-geral', label: 'Visão geral', content: 'Resumo consolidado do período selecionado.' },
        { value: 'pedidos', label: 'Pedidos', count: 12, content: 'Lista de pedidos em aberto.' },
        { value: 'pagamentos', label: 'Pagamentos', content: 'Histórico de pagamentos recebidos.' },
        { value: 'configuracoes', label: 'Configurações', content: 'Preferências gerais da conta.' },
        { value: 'relatorios', label: 'Relatórios', content: 'Exportação de dados em PDF ou CSV.' },
      ]}
    />
  )
}

// C8 (veredito do Opus): exemplo exato do achado, um degradê por variante sobre o fundo que ela
// pressupõe (sidebar, degradê de marca), único <Gradient> literal deste arquivo.
function BrandLogoExample() {
  return (
    <Stack gap="3">
      <BrandLogo />
      <View className="rounded-surface bg-sidebar p-4">
        <BrandLogo on="sidebar" size="sm" />
      </View>
      <View className="relative overflow-hidden rounded-surface p-4">
        <View
          aria-hidden
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          className="absolute inset-0"
        >
          <Gradient token="brand" className="size-full" />
        </View>
        <BrandLogo on="brand" />
      </View>
      <BrandLogo symbolOnly />
    </Stack>
  )
}

export const showcaseGroups: ShowcaseGroup[] = [
  {
    slug: 'acoes',
    title: 'Ações',
    entries: [
      { name: 'Button', description: 'Botão de ação principal.', render: () => <ButtonExample /> },
      { name: 'ButtonGroup', description: 'Grupo segmentado ou grupo de botões encostados.', render: () => <ButtonGroupExample /> },
      { name: 'ActionBar', description: 'Barra de ações de rodapé.', render: () => <ActionBarExample /> },
      { name: 'DropdownMenu', description: 'Menu de ações em folha inferior.', render: () => <DropdownMenuExample /> },
    ],
  },
  {
    slug: 'formulario',
    title: 'Formulário',
    entries: [
      { name: 'Input', description: 'Campo de texto com máscara e adornos.', render: () => <InputExample /> },
      {
        name: 'Textarea',
        description: 'Campo de texto multilinha com auto-crescimento.',
        render: () => <TextareaExample />,
      },
      { name: 'Select', description: 'Seletor em folha inferior com busca.', render: () => <SelectExample /> },
      {
        name: 'Select (lista longa)',
        description: 'Mesmo Select, com lista maior que a folha, rolável até o último item.',
        render: () => <SelectListaLongaExample />,
      },
      { name: 'Checkbox', description: 'Caixa de marcação isolada.', render: () => <CheckboxExample /> },
      { name: 'RadioGroup', description: 'Escolha única entre opções.', render: () => <RadioGroupExample /> },
      { name: 'Switch', description: 'Alternância ligado/desligado.', render: () => <SwitchExample /> },
      {
        name: 'Slider',
        description: 'Seleção de valor numérico por arraste.',
        render: () => <SliderExample />,
      },
      {
        name: 'OtpInput',
        description: 'Código de verificação por dígitos.',
        render: () => <OtpInputExample />,
      },
      { name: 'DatePicker', description: 'Seleção de data em calendário.', render: () => <DatePickerExample /> },
      { name: 'Field', description: 'Rótulo, ajuda e erro ao redor de um campo.', render: () => <FieldExample /> },
      {
        name: 'Formulário (RHF)',
        description: 'Formulário completo com react-hook-form e validação.',
        render: () => <FormularioRhfExample />,
      },
    ],
  },
  {
    slug: 'feedback',
    title: 'Feedback',
    entries: [
      { name: 'BrandFeedbackIcon', description: 'Ícone de retorno com o símbolo da marca.', render: () => <BrandFeedbackIconExample /> },
      { name: 'Alert', description: 'Aviso em linha com tom, ação e fechar.', render: () => <AlertExample /> },
      { name: 'Toast', description: 'Notificação temporária no rodapé.', render: () => <ToastExample /> },
      { name: 'Progress', description: 'Barra de progresso determinada ou indeterminada.', render: () => <ProgressExample /> },
      { name: 'Skeleton', description: 'Marcador de carregamento.', render: () => <SkeletonExample /> },
      { name: 'EmptyState', description: 'Estado vazio com ícone, texto e ações.', render: () => <EmptyStateExample /> },
      { name: 'InfoHint', description: 'Ajuda contextual em modal.', render: () => <InfoHintExample /> },
      { name: 'Modal', description: 'Diálogo de confirmação, exclusão, informação ou formulário.', render: () => <ModalExample /> },
      { name: 'Drawer', description: 'Painel lateral em tela cheia com confirmação de descarte.', render: () => <DrawerExample /> },
    ],
  },
  {
    slug: 'exibicao',
    title: 'Exibição',
    entries: [
      { name: 'Card', description: 'Contêiner com cabeçalho, conteúdo e rodapé.', render: () => <CardExample /> },
      { name: 'Badge', description: 'Selo de status em 7 tons.', render: () => <BadgeExample /> },
      { name: 'Avatar', description: 'Foto ou iniciais, isolado ou em grupo.', render: () => <AvatarExample /> },
      { name: 'List', description: 'Lista de itens com navegação, ação ou só leitura.', render: () => <ListExample /> },
      { name: 'StatCard', description: 'Cartão de indicador com variação.', render: () => <StatCardExample /> },
      { name: 'Accordion', description: 'Conteúdo recolhível em seções.', render: () => <AccordionExample /> },
      { name: 'Tabs', description: 'Seções alternadas por abas ou seletor.', render: () => <TabsExample /> },
      { name: 'Separator', description: 'Linha divisória, com ou sem rótulo.', render: () => <SeparatorExample /> },
      { name: 'BrandLogo', description: 'Selo e nome da marca ativa.', render: () => <BrandLogoExample /> },
    ],
  },
  {
    slug: 'layout',
    title: 'Layout',
    entries: [
      { name: 'Container', description: 'Largura máxima e respiro lateral da tela.', render: () => <ContainerExample /> },
      { name: 'Stack', description: 'Empilhamento vertical com espaçamento.', render: () => <StackExample /> },
      { name: 'Inline', description: 'Disposição horizontal com quebra de linha.', render: () => <InlineExample /> },
      { name: 'Grid', description: 'Grade de colunas fixas.', render: () => <GridExample /> },
      { name: 'Section', description: 'Bloco de conteúdo com título e descrição.', render: () => <SectionExample /> },
      { name: 'PageHeader', description: 'Cabeçalho de tela com título, descrição e ajuda.', render: () => <PageHeaderExample /> },
    ],
  },
]
