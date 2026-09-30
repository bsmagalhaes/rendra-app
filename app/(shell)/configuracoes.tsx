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
  Form,
  FormField,
  FormSection,
  Input,
  List,
  toast,
} from '../../src/components/ui'
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

/**
 * Configurações de exemplo, dentro do shell: aparência (modelo, paleta e modo), layout do menu
 * (`N1` a `N3`, gravado no aparelho pelo `ShellProvider`) e um perfil com validação. O envio do
 * perfil só mostra o aviso; o app real troca por uma chamada à própria API.
 */
export default function Configuracoes() {
  const { brand, model, modelCode, setModelCode, palette, paletteId, setPaletteId, mode, setMode } = useBrand()
  const { layout, applyLayout, resetLayout } = useShell()
  useDocumentTitle(`Configurações · ${brand.productName}`)

  const layoutCode = (Object.keys(layoutOptions) as ShellLayoutCode[]).find(
    (code) => layoutOptions[code].layout.bottomNav === layout.bottomNav && layoutOptions[code].layout.menu === layout.menu,
  )

  const perfil = useForm({
    resolver: zodResolver(perfilSchema),
    mode: 'onTouched',
    defaultValues: { nome: exampleUser.name, email: exampleUser.email ?? '' },
  })

  function salvarPerfil() {
    toast.success('Perfil salvo')
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView tabIndex={0} className="flex-1" contentContainerClassName="gap-6 p-4">
        <PageHeader title="Configurações" description="Aparência, layout do menu e dados do seu perfil." />

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

        <Form form={perfil} onSubmit={salvarPerfil}>
          <FormSection title="Perfil">
            <FormField name="nome" label="Nome" required render={(f) => <Input {...f} />} />
            <FormField name="email" label="E-mail" required render={(f) => <Input {...f} />} />
          </FormSection>
        </Form>
      </ScrollView>
      <ActionBar primary={{ label: 'Salvar perfil', onPress: perfil.handleSubmit(salvarPerfil) }} />
    </View>
  )
}
