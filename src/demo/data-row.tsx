import { View } from 'react-native'
import { Text } from '../components/internal/text'

/** Par rótulo e valor das telas de dados da demonstração (detalhe do cliente, revisão do cadastro). */
export function DataRow({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View className="gap-1">
      <Text className="text-xs text-muted-foreground">{rotulo}</Text>
      <Text className="text-sm text-foreground">{valor}</Text>
    </View>
  )
}
