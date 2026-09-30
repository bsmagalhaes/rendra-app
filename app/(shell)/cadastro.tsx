import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Text } from '../../src/components/internal/text'
import { useBrand } from '../../src/brand'
import { PageHeader } from '../../src/components/layout'
import {
  ActionBar,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Form,
  FormField,
  Input,
  Progress,
  RadioGroup,
  toast,
} from '../../src/components/ui'
import { DataRow } from '../../src/demo/data-row'
import { formatCurrency } from '../../src/lib/masks'
import { useDocumentTitle } from '../../src/lib/use-document-title'
import { zBR } from '../../src/lib/validators'

const ETAPAS = ['Empresa', 'Contato', 'Plano', 'Revisão'] as const
const TOTAL = ETAPAS.length

const planos = [
  { value: 'essencial', label: 'Essencial', preco: 99 },
  { value: 'profissional', label: 'Profissional', preco: 199 },
  { value: 'empresarial', label: 'Empresarial', preco: 399 },
] as const

const opcoesPlano = planos.map((p) => ({
  value: p.value,
  label: p.label,
  description: `${formatCurrency(p.preco)} por mês`,
}))

const schema = z.object({
  razaoSocial: z.string().trim().min(1, 'Informe a razão social.'),
  cnpj: zBR.cnpj(),
  contato: zBR.required('Nome do contato'),
  email: zBR.email(),
  telefone: z.string().refine((v) => v === '' || [10, 11].includes(v.replace(/\D/g, '').length), 'Telefone incompleto.'),
  plano: z.string().min(1, 'Escolha um plano.'),
})

type Campos = keyof z.infer<typeof schema>

const camposDaEtapa: Record<number, Campos[]> = {
  1: ['razaoSocial', 'cnpj'],
  2: ['contato', 'email', 'telefone'],
  3: ['plano'],
}

/**
 * Cadastro guiado em quatro etapas, por composição (sem componente `Wizard`): estado local da
 * etapa, um `useForm` só (o que foi digitado sobrevive a "Voltar"), `Progress` mais o texto
 * "Etapa x de 4", um `Card` por etapa e `ActionBar` com "Voltar" e "Continuar". Cada etapa é
 * validada antes de avançar; a última mostra a revisão e conclui.
 */
export default function CadastroGuiado() {
  const { brand } = useBrand()
  const router = useRouter()
  useDocumentTitle(`Cadastro guiado · ${brand.productName}`)
  const [etapa, setEtapa] = useState(1)
  const form = useForm({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: { razaoSocial: '', cnpj: '', contato: '', email: '', telefone: '', plano: 'essencial' },
  })

  async function continuar() {
    if (etapa < TOTAL) {
      const valida = await form.trigger(camposDaEtapa[etapa])
      if (valida) setEtapa(etapa + 1)
      return
    }
    toast.success('Cadastro concluído (simulado)')
    router.replace('/clientes')
  }

  const valores = form.getValues()
  const plano = planos.find((p) => p.value === valores.plano) ?? planos[0]

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-background">
      <ScrollView tabIndex={0} className="flex-1" contentContainerClassName="gap-6 p-4" keyboardShouldPersistTaps="handled">
        <PageHeader title="Cadastro guiado" description="Cadastre um cliente em quatro etapas." />
        <View className="gap-2">
          <Text weight="medium" className="text-sm text-foreground">{`Etapa ${etapa} de ${TOTAL}`}</Text>
          <Progress value={etapa * 25} accessibilityLabel="Progresso do cadastro" />
        </View>

        <Card>
          <CardHeader>
            <CardTitle>{ETAPAS[etapa - 1]}</CardTitle>
          </CardHeader>
          <CardContent noTopPadding>
            <Form form={form} onSubmit={continuar} className="gap-4">
              {etapa === 1 ? (
                <>
                  <FormField name="razaoSocial" label="Razão social" required render={(f) => <Input {...f} />} />
                  <FormField name="cnpj" label="CNPJ" required render={(f) => <Input {...f} mask="cnpj" />} />
                </>
              ) : null}
              {etapa === 2 ? (
                <>
                  <FormField name="contato" label="Nome do contato" required render={(f) => <Input {...f} />} />
                  <FormField name="email" label="E-mail" required render={(f) => <Input {...f} />} />
                  <FormField name="telefone" label="Telefone" render={(f) => <Input {...f} mask="phone" hideDdi />} />
                </>
              ) : null}
              {etapa === 3 ? (
                <FormField
                  name="plano"
                  label="Plano"
                  render={(f) => <RadioGroup options={opcoesPlano} value={f.value} onChange={f.onChange} />}
                />
              ) : null}
              {etapa === 4 ? (
                <View className="gap-4">
                  <DataRow rotulo="Razão social" valor={valores.razaoSocial} />
                  <DataRow rotulo="CNPJ" valor={valores.cnpj} />
                  <DataRow rotulo="Contato" valor={valores.contato} />
                  <DataRow rotulo="E-mail" valor={valores.email} />
                  <DataRow rotulo="Telefone" valor={valores.telefone || 'Não informado'} />
                  <DataRow rotulo="Plano" valor={`${plano.label}, ${formatCurrency(plano.preco)} por mês`} />
                </View>
              ) : null}
            </Form>
          </CardContent>
        </Card>
      </ScrollView>
      <ActionBar
        primary={{ label: etapa === TOTAL ? 'Concluir cadastro' : 'Continuar', onPress: continuar }}
        cancel={etapa > 1 ? { label: 'Voltar', onPress: () => setEtapa(etapa - 1) } : undefined}
      />
    </KeyboardAvoidingView>
  )
}
