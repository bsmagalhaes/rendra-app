import { View } from 'react-native'
import { Gradient } from '../gradient/gradient'
import { BrandFeedbackIcon } from './brand-feedback-icon'
import { ActionBar } from './action-bar'
import { Text } from '../internal/text'
import { useRendraNavigation } from '../../navigation/rendra-navigation'
import { a11yPresets } from '../../lib/a11y'
import { cn } from '../../lib/cn'
import type { FeedbackType } from '../../brand/types'

/*
 * Tela de erro de página inteira: 404 (não encontrada) ou 500 (falha do lado do servidor).
 * Marcação própria, sem EmptyState, como no web: o círculo com degradê suave, o ícone da marca
 * animado, o código, os textos e a barra de ações (Voltar 30%, Ir para o início 70%). Sem
 * histórico (404 aberto direto), Voltar leva à raiz em vez de chamar goBack sem destino.
 */

export interface ErrorPageProps {
  code: 404 | 500
  /** Padrão: o texto do código. */
  title?: string
  /** Padrão: o texto do código. */
  description?: string
  /** Ocupa a tela toda, centralizada (usado pela rota `+not-found`). */
  fullScreen?: boolean
  className?: string
  testID?: string
}

const content: Record<ErrorPageProps['code'], { type: FeedbackType; title: string; description: string }> = {
  404: {
    type: 'warning',
    title: 'Página não encontrada',
    description: 'O endereço que você abriu não existe ou foi movido.',
  },
  500: {
    type: 'error',
    title: 'Algo deu errado do nosso lado',
    description: 'Tivemos um problema para concluir a ação. Tente de novo em instantes.',
  },
}

export function ErrorPage({ code, title, description, fullScreen = false, className, testID }: ErrorPageProps) {
  const { navigate, goBack, canGoBack } = useRendraNavigation()
  const c = content[code]

  return (
    <View
      testID={testID}
      dataSet={{ rendra: 'ERRO-001' }}
      className={cn('items-center justify-center gap-4 px-4 py-12', fullScreen ? 'flex-1' : '', className)}
    >
      <View className="relative items-center justify-center">
        <View
          aria-hidden
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          className="absolute size-16 rounded-full overflow-hidden"
        >
          <Gradient token="soft" className="size-full" />
        </View>
        <BrandFeedbackIcon type={c.type} size="2xl" animated className="relative" />
      </View>
      <Text weight="medium" className="text-center text-sm text-muted-foreground">
        {`Erro ${code}`}
      </Text>
      <Text
        weight="semibold"
        accessibilityRole={a11yPresets.header.accessibilityRole}
        className="text-center text-base text-foreground"
      >
        {title ?? c.title}
      </Text>
      <Text className="text-center text-sm text-muted-foreground">{description ?? c.description}</Text>
      <View className="w-full max-w-sm">
        <ActionBar
          sticky={false}
          cancel={{ label: 'Voltar', onPress: () => (canGoBack?.() ? goBack?.() : navigate('/')) }}
          primary={{ label: 'Ir para o início', onPress: () => navigate('/') }}
        />
      </View>
    </View>
  )
}
