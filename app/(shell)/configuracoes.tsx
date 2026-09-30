import { useState } from 'react'
import { ScrollView, View } from 'react-native'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Text } from '../../src/components/internal/text'
import { useBrand } from '../../src/brand'
import { PageHeader } from '../../src/components/layout'
import { layoutOptions, useShell } from '../../src/components/app-shell'
import type { ShellLayoutCode } from '../../src/components/app-shell'
import {
  ActionBar,
  ButtonGroup,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Field,
  Form,
  FormField,
  FormSection,
  Input,
  List,
  Modal,
  Switch,
  Tabs,
  toast,
} from '../../src/components/ui'
import type { ActionBarAction } from '../../src/components/ui'
import {
  isColorMode,
  isModelId,
  modeLabel,
  modeOptions,
  modelOptions,
  paletteOptions,
} from '../../src/config/appearance'
import { exampleUser } from '../../src/config/navigation'
import { navCodes } from '../../src/config/presets'
import { useDocumentTitle } from '../../src/lib/use-document-title'
import { zBR } from '../../src/lib/validators'

const layoutGroupOptions = navCodes.map((n) => ({ value: n.code, label: n.name }))
const isLayoutCode = (value: string): value is ShellLayoutCode => value in layoutOptions

const perfilSchema = z.object({ nome: zBR.required('Nome'), email: zBR.email() })
const empresaSchema = z.object({
  razaoSocial: z.string().trim().min(1, 'Informe a razão social.'),
  cnpj: zBR.cnpj(),
  telefone: zBR.phone(),
})

type Secao = 'perfil' | 'empresa' | 'notificacoes' | 'seguranca' | 'aparencia' | 'layout'

/**
 * Configurações da demonstração, dentro do shell, em seis seções por `Tabs` (no celular estreito
 * o próprio `Tabs` vira um `Select` "Seção"): Perfil, Empresa, Notificações, Segurança, Aparência
 * (modelo, paleta e modo) e Layout (`N1` a `N3`, gravado no aparelho pelo `ShellProvider`). As
 * seções salváveis têm o `ActionBar` fixo; os envios só mostram o aviso, o app real troca por uma
 * chamada à própria API.
 */
export default function Configuracoes() {
  const { brand, model, modelCode, setModelCode, palette, paletteId, setPaletteId, mode, setMode } = useBrand()
  const { layout, applyLayout, resetLayout } = useShell()
  useDocumentTitle(`Configurações · ${brand.productName}`)
  const [secao, setSecao] = useState<Secao>('perfil')
  const [notificacoes, setNotificacoes] = useState({ email: true, aparelho: true, semanal: false })
  const [doisFatores, setDoisFatores] = useState(false)
  const [trocandoSenha, setTrocandoSenha] = useState(false)
  const [encerrando, setEncerrando] = useState(false)

  const layoutCode = (Object.keys(layoutOptions) as ShellLayoutCode[]).find(
    (code) => layoutOptions[code].layout.bottomNav === layout.bottomNav && layoutOptions[code].layout.menu === layout.menu,
  )

  const perfil = useForm({
    resolver: zodResolver(perfilSchema),
    mode: 'onTouched',
    defaultValues: { nome: exampleUser.name, email: exampleUser.email ?? '' },
  })
  const empresa = useForm({
    resolver: zodResolver(empresaSchema),
    mode: 'onTouched',
    defaultValues: { razaoSocial: 'Padaria Estrela Ltda', cnpj: '11.222.333/0001-81', telefone: '(11) 3456-7890' },
  })

  function salvarPerfil() {
    toast.success('Perfil salvo')
  }

  function salvarConfiguracoes() {
    toast.success('Configurações salvas')
  }

  function confirmarEncerramento() {
    setEncerrando(false)
    toast.success('Sessões encerradas (simulado)')
  }

  const salvar: Partial<Record<Secao, ActionBarAction>> = {
    perfil: { label: 'Salvar perfil', onPress: perfil.handleSubmit(salvarPerfil) },
    empresa: { label: 'Salvar alterações', onPress: empresa.handleSubmit(salvarConfiguracoes) },
    notificacoes: { label: 'Salvar alterações', onPress: salvarConfiguracoes },
    seguranca: { label: 'Salvar alterações', onPress: salvarConfiguracoes },
  }
  const acaoSalvar = salvar[secao]

  return (
    <View className="flex-1 bg-background">
      <ScrollView tabIndex={0} className="flex-1" contentContainerClassName="gap-6 p-4" keyboardShouldPersistTaps="handled">
        <PageHeader title="Configurações" description="Perfil, empresa, notificações, segurança, aparência e layout do menu." />

        <Tabs
          variant="pill"
          accessibilityLabel="Seção"
          value={secao}
          onChange={(proxima) => setSecao(proxima as Secao)}
          items={[
            {
              value: 'perfil',
              label: 'Perfil',
              content: (
                <View className="pt-4">
                  <Form form={perfil} onSubmit={salvarPerfil}>
                    <FormSection title="Perfil">
                      <FormField name="nome" label="Nome" required render={(f) => <Input {...f} />} />
                      <FormField name="email" label="E-mail" required render={(f) => <Input {...f} />} />
                    </FormSection>
                  </Form>
                </View>
              ),
            },
            {
              value: 'empresa',
              label: 'Empresa',
              content: (
                <View className="pt-4">
                  <Form form={empresa} onSubmit={salvarConfiguracoes}>
                    <FormSection title="Empresa">
                      <FormField name="razaoSocial" label="Razão social" required render={(f) => <Input {...f} />} />
                      <FormField name="cnpj" label="CNPJ" required render={(f) => <Input {...f} mask="cnpj" />} />
                      <FormField name="telefone" label="Telefone" render={(f) => <Input {...f} mask="phone" hideDdi />} />
                    </FormSection>
                  </Form>
                </View>
              ),
            },
            {
              value: 'notificacoes',
              label: 'Notificações',
              content: (
                <View className="pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notificações</CardTitle>
                    </CardHeader>
                    <CardContent noTopPadding className="gap-4">
                      <Switch
                        label="Alertas por e-mail"
                        description="Faturas, contratos e chamados."
                        checked={notificacoes.email}
                        onCheckedChange={(email) => setNotificacoes((n) => ({ ...n, email }))}
                      />
                      <Switch
                        label="Notificações no aparelho"
                        description="Avisos na tela do celular."
                        checked={notificacoes.aparelho}
                        onCheckedChange={(aparelho) => setNotificacoes((n) => ({ ...n, aparelho }))}
                      />
                      <Switch
                        label="Resumo semanal"
                        description="Um e-mail por semana com os números."
                        checked={notificacoes.semanal}
                        onCheckedChange={(semanal) => setNotificacoes((n) => ({ ...n, semanal }))}
                      />
                    </CardContent>
                  </Card>
                </View>
              ),
            },
            {
              value: 'seguranca',
              label: 'Segurança',
              content: (
                <View className="gap-4 pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Acesso</CardTitle>
                    </CardHeader>
                    <CardContent noTopPadding className="gap-4">
                      <Switch
                        label="Verificação em duas etapas"
                        description="Pede um código a cada novo acesso."
                        checked={doisFatores}
                        onCheckedChange={setDoisFatores}
                      />
                      <Field label="Senha">
                        <Input
                          variant="secret"
                          hasValue
                          isEditing={trocandoSenha}
                          onStartEdit={() => setTrocandoSenha(true)}
                          onCancelEdit={() => setTrocandoSenha(false)}
                          secureTextEntry
                        />
                      </Field>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Sessões</CardTitle>
                    </CardHeader>
                    <CardContent noTopPadding className="gap-4">
                      <Text className="text-sm text-muted-foreground">Você está conectado em 2 aparelhos.</Text>
                      <ActionBar
                        sticky={false}
                        primary={{ label: 'Encerrar sessões', destructive: true, onPress: () => setEncerrando(true) }}
                      />
                    </CardContent>
                  </Card>
                </View>
              ),
            },
            {
              value: 'aparencia',
              label: 'Aparência',
              content: (
                <View className="pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Aparência</CardTitle>
                    </CardHeader>
                    <CardContent noTopPadding className="gap-4">
                      <View className="gap-2">
                        <ButtonGroup
                          accessibilityLabel="Modelo"
                          options={modelOptions}
                          value={modelCode}
                          onChange={(next) => {
                            if (isModelId(next)) setModelCode(next)
                          }}
                        />
                        <Text className="text-sm text-muted-foreground">{`Modelo ativo: ${model.name}`}</Text>
                      </View>
                      <View className="gap-2">
                        <ButtonGroup
                          accessibilityLabel="Paleta"
                          options={paletteOptions}
                          value={paletteId}
                          onChange={setPaletteId}
                        />
                        <Text className="text-sm text-muted-foreground">{`Paleta ativa: ${palette.seeds.name}`}</Text>
                      </View>
                      <View className="gap-2">
                        <ButtonGroup
                          accessibilityLabel="Modo"
                          options={modeOptions}
                          value={mode}
                          onChange={(next) => {
                            if (isColorMode(next)) setMode(next)
                          }}
                        />
                        <Text className="text-sm text-muted-foreground">{`Modo ativo: ${modeLabel(mode)}`}</Text>
                      </View>
                    </CardContent>
                  </Card>
                </View>
              ),
            },
            {
              value: 'layout',
              label: 'Layout',
              content: (
                <View className="pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Layout</CardTitle>
                    </CardHeader>
                    <CardContent noTopPadding className="gap-4">
                      <View className="gap-2">
                        <ButtonGroup
                          accessibilityLabel="Layout"
                          options={layoutGroupOptions}
                          value={layoutCode}
                          onChange={(next) => {
                            if (isLayoutCode(next)) applyLayout(next)
                          }}
                        />
                        <Text className="text-sm text-muted-foreground">
                          {layoutCode ? layoutOptions[layoutCode].label : 'Layout personalizado.'}
                        </Text>
                      </View>
                      <List
                        scrollEnabled={false}
                        items={[
                          {
                            id: 'restaurar-layout',
                            title: 'Restaurar layout padrão',
                            description: 'Volta ao layout definido pelo app.',
                            onPress: resetLayout,
                          },
                        ]}
                      />
                    </CardContent>
                  </Card>
                </View>
              ),
            },
          ]}
        />
      </ScrollView>
      {acaoSalvar ? <ActionBar primary={acaoSalvar} /> : null}

      <Modal
        open={encerrando}
        onOpenChange={setEncerrando}
        type="destructive"
        title="Encerrar todas as sessões?"
        description="Você será desconectado dos outros aparelhos."
        confirmLabel="Confirmar encerramento"
        onConfirm={confirmarEncerramento}
      />
    </View>
  )
}
