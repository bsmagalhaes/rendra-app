import { ScrollView, View } from 'react-native'
import { Text } from '../../../src/components/internal/text'
import { useBrand } from '../../../src/brand'
import {
  isColorMode,
  isModelId,
  modeLabel,
  modeOptions,
  modelOptions,
  paletteOptions,
} from '../../../src/config/appearance'
import { useDocumentTitle } from '../../../src/lib/use-document-title'
import { PageHeader, Stack } from '../../../src/components/layout'
import { ActionBar, Badge, ButtonGroup, Card, StatCard, Tabs, toast } from '../../../src/components/ui'

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
        <Text className="text-sm text-muted-foreground">{`Modo ativo: ${modeLabel(mode)}`}</Text>
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
