import { ScrollView, View } from 'react-native'
import { Text } from '../../src/components/internal/text'
import { useBrand } from '../../src/brand'
import type { ColorMode } from '../../src/brand'
import type { ModelId } from '../../src/theme/models'
import { themeCodes, colorCodes } from '../../src/config/presets'
import { useDocumentTitle } from '../../src/lib/use-document-title'
import { PageHeader, Stack } from '../../src/components/layout'
import { ActionBar, Badge, ButtonGroup, Card, StatCard, Tabs, toast } from '../../src/components/ui'

// C10 (veredito do Opus, resolve o [verificar] da Tarefa 10): campos reais de
// `src/config/presets.ts`: `ThemeCode { code, brand, name }`, `ColorCode { code, palette, name }`.
// O `value` das opções usa o campo de código real (`code`/`palette`), não `ModelId`/`paletteId`
// direto, e um guarda de tipo local decide se o valor recebido de volta é aplicável.
const isModelId = (value: string): value is ModelId => value === 'T1' || value === 'T2' || value === 'T3'
const isColorMode = (value: string): value is ColorMode =>
  value === 'light' || value === 'dark' || value === 'system'

const modelOptions = themeCodes.map((t) => ({ value: t.code, label: t.name }))
const paletteOptions = colorCodes.map((c) => ({ value: c.palette, label: c.name }))
const modeOptions = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
  { value: 'system', label: 'Sistema' },
]

function modoAtivoLabel(mode: ColorMode): string {
  if (mode === 'system') return 'sistema'
  return mode === 'dark' ? 'escuro' : 'claro'
}

export default function GaleriaIndex() {
  const { brand, model, modelCode, setModelCode, palette, paletteId, setPaletteId, mode, setMode } = useBrand()
  useDocumentTitle(`Galeria · ${brand.productName}`)

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-6 p-4">
      <PageHeader
        title="Galeria"
        showTitle
        description="Troque modelo, paleta e modo ao vivo, sem sair da tela."
      />

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
        <Text className="text-sm text-muted-foreground">{`Modo ativo: ${modoAtivoLabel(mode)}`}</Text>
      </View>

      <Card className="gap-4 p-4">
        <Stack gap="4">
          <StatCard label="Receita do mês" value="R$ 8.420,00" change={5.4} highlight />
          <Badge tone="success">Em dia</Badge>
          <Tabs
            accessibilityLabel="Seções do exemplo"
            items={[
              { value: 'resumo', label: 'Resumo', content: 'Panorama geral da conta.' },
              { value: 'atividade', label: 'Atividade', content: 'Últimos eventos registrados.' },
            ]}
          />
          <ActionBar
            sticky={false}
            primary={{ label: 'Salvar preferências', onPress: () => toast.success('Salvo') }}
          />
        </Stack>
      </Card>
    </ScrollView>
  )
}
