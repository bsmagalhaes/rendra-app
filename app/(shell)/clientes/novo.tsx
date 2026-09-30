import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useBrand } from '../../../src/brand'
import { PageHeader } from '../../../src/components/layout'
import {
  ActionBar,
  Form,
  FormField,
  FormSection,
  Input,
  RadioGroup,
  Switch,
  Textarea,
  toast,
} from '../../../src/components/ui'
import { adicionarCliente } from '../../../src/demo/clients-store'
import { lookupCep, lookupCnpj } from '../../../src/demo/lookups'
import { useDocumentTitle } from '../../../src/lib/use-document-title'
import { zBR } from '../../../src/lib/validators'
import { segmentos } from '../../../src/mocks/clients'

const opcoesSegmento = segmentos.map((s) => ({ value: s, label: s }))
const digitos = (valor: string) => valor.replace(/\D/g, '')

const schema = z.object({
  razaoSocial: z.string().trim().min(1, 'Informe a razão social.'),
  cnpj: zBR.cnpj(),
  segmento: z.string(),
  cep: z.string().refine((v) => v === '' || digitos(v).length === 8, 'CEP incompleto.'),
  cidade: z.string(),
  email: z.string().trim().refine((v) => v === '' || z.email().safeParse(v).success, 'E-mail inválido.'),
  telefone: z.string().refine((v) => v === '' || [10, 11].includes(digitos(v).length), 'Telefone incompleto.'),
  observacoes: z.string(),
  ativo: z.boolean(),
})

/**
 * Novo cliente da demonstração: formulário completo com máscaras e validação. A busca de CNPJ e de
 * CEP dispara sozinha quando a máscara completa 14 ou 8 dígitos (funções fictícias em
 * `src/demo/lookups.ts`) e preenche razão social e cidade; nada é gravado.
 */
export default function NovoCliente() {
  const { brand } = useBrand()
  const router = useRouter()
  useDocumentTitle(`Novo cliente · ${brand.productName}`)
  const form = useForm({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      razaoSocial: '',
      cnpj: '',
      segmento: segmentos[0] as string,
      cep: '',
      cidade: '',
      email: '',
      telefone: '',
      observacoes: '',
      ativo: true,
    },
  })

  function onSubmit() {
    const v = form.getValues()
    adicionarCliente({
      nome: v.razaoSocial,
      cnpj: v.cnpj,
      segmento: v.segmento,
      email: v.email,
      telefone: v.telefone,
      cidade: v.cidade || undefined,
      situacao: v.ativo ? 'Ativo' : 'Inativo',
    })
    toast.success('Cliente cadastrado (simulado)')
    router.replace('/clientes')
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-background">
      <ScrollView tabIndex={0} className="flex-1" contentContainerClassName="gap-6 p-4" keyboardShouldPersistTaps="handled">
        <PageHeader title="Novo cliente" description="Cadastre uma empresa na sua carteira." />
        <Form form={form} onSubmit={onSubmit} className="gap-6">
          <FormSection title="Empresa">
            <FormField
              name="razaoSocial"
              label="Razão social"
              required
              render={(f) => <Input {...f} />}
            />
            <FormField
              name="cnpj"
              label="CNPJ"
              required
              help="A busca preenche a razão social vazia."
              render={(f) => (
                <Input
                  {...f}
                  mask="cnpj"
                  onValueChange={(semMascara) => {
                    if (semMascara.length !== 14) return
                    lookupCnpj(semMascara).then((r) => {
                      if (r && !form.getValues('razaoSocial').trim()) form.setValue('razaoSocial', r.razaoSocial, { shouldValidate: true })
                    })
                  }}
                />
              )}
            />
            <FormField
              name="segmento"
              label="Segmento"
              render={(f) => <RadioGroup options={opcoesSegmento} value={f.value} onChange={f.onChange} />}
            />
          </FormSection>

          <FormSection title="Endereço">
            <FormField
              name="cep"
              label="CEP"
              help="A busca preenche a cidade."
              render={(f) => (
                <Input
                  {...f}
                  mask="cep"
                  onValueChange={(semMascara) => {
                    if (semMascara.length !== 8) return
                    lookupCep(semMascara).then((r) => {
                      if (r) form.setValue('cidade', r.cidade)
                    })
                  }}
                />
              )}
            />
            <FormField name="cidade" label="Cidade" render={(f) => <Input {...f} />} />
          </FormSection>

          <FormSection title="Contato">
            <FormField name="email" label="E-mail" render={(f) => <Input {...f} />} />
            <FormField name="telefone" label="Telefone" render={(f) => <Input {...f} mask="phone" hideDdi />} />
          </FormSection>

          <FormSection title="Observações">
            <FormField
              name="observacoes"
              label="Observações"
              render={(f) => <Textarea {...f} maxLength={300} counter />}
            />
            <FormField
              name="ativo"
              render={(f) => (
                <View>
                  <Switch label="Cliente ativo" checked={Boolean(f.value)} onCheckedChange={f.onChange} />
                </View>
              )}
            />
          </FormSection>
        </Form>
      </ScrollView>
      <ActionBar
        primary={{ label: 'Salvar cliente', onPress: form.handleSubmit(onSubmit) }}
        cancel={{ label: 'Cancelar', onPress: () => router.replace('/clientes') }}
      />
    </KeyboardAvoidingView>
  )
}
