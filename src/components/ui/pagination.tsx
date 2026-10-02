import { View } from 'react-native'
import { ChevronLeft, ChevronRight } from 'lucide-react-native'
import { Text } from '../internal/text'
import { Button } from './button'

export interface PaginationProps {
  /** Página atual, começando em 1. */
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  /**
   * 'pages' mostra anterior e próxima com "Página 2 de 25"; 'loadMore' troca por um botão
   * "Carregar mais". Só existe o formato de celular: números de página, "Itens por página" e
   * "X a Y de Z" são do desktop do web e ficam fora.
   */
  mobileMode?: 'pages' | 'loadMore'
  loading?: boolean
  testID?: string
}

const fmt = (n: number) => n.toLocaleString('pt-BR')

/** Paginação compacta: anterior e próxima com "Página X de Y", ou um botão "Carregar mais". */
export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  mobileMode = 'pages',
  loading = false,
  testID,
}: PaginationProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const to = Math.min(total, page * pageSize)

  return (
    <View
      testID={testID}
      role="navigation"
      accessibilityLabel="Paginação"
      dataSet={{ rendra: 'PAG-001' }}
      className="min-w-0 flex-col gap-3"
    >
      {mobileMode === 'loadMore' ? (
        page < pages ? (
          <Button variant="outline" fullWidth loading={loading} onPress={() => onPageChange(page + 1)}>
            Carregar mais
          </Button>
        ) : null
      ) : (
        <View className="flex-row gap-3">
          <Button
            variant="outline"
            icon={<ChevronLeft className="text-foreground" />}
            disabled={page <= 1}
            onPress={() => onPageChange(page - 1)}
            className="flex-1"
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            iconRight={<ChevronRight className="text-foreground" />}
            disabled={page >= pages}
            onPress={() => onPageChange(page + 1)}
            className="flex-1"
          >
            Próxima
          </Button>
        </View>
      )}
      <Text className="text-center text-xs tabular-nums text-muted-foreground">
        {mobileMode === 'loadMore' ? `${fmt(to)} de ${fmt(total)}` : `Página ${fmt(page)} de ${fmt(pages)}`}
      </Text>
    </View>
  )
}
