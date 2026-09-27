import { Children, cloneElement, Fragment, isValidElement } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { View, type ViewProps } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from '../internal/text'
import { InfoHint } from '../ui/info-hint'
import { cn } from '../../lib/cn'
import { a11yPresets } from '../../lib/a11y'

export interface PageHeaderProps extends ViewProps {
  title: ReactNode
  showTitle?: boolean
  description?: ReactNode
  help?: ReactNode
  actions?: ReactNode
  children?: ReactNode
}

// Equivalente RN da técnica sr-only do web: visível a leitor de tela, invisível na tela.
// Sem opacity-0: alpha 0 também esconde o nó do TalkBack/VoiceOver, o que anularia o objetivo.
const visuallyHiddenClassName = 'absolute h-px w-px overflow-hidden'

export function PageHeader({
  title,
  showTitle = false,
  description,
  help,
  actions,
  children,
  className,
  ...rest
}: PageHeaderProps) {
  const insets = useSafeAreaInsets()
  const inlineHelp = help ? (
    <InfoHint title={typeof title === 'string' ? title : 'Sobre esta tela'}>{help}</InfoHint>
  ) : null
  const titleVisible = showTitle || Boolean(inlineHelp)
  const visible = showTitle || Boolean(description) || Boolean(actions) || Boolean(children) || Boolean(inlineHelp)

  return (
    <View
      className={cn('-mb-2 flex-col gap-4', !visible && visuallyHiddenClassName, className)}
      style={{ paddingTop: Math.max(0, insets.top) }}
      {...rest}
    >
      <View className="flex-col gap-4">
        <View className="flex-col gap-1">
          <View className="flex-row min-w-0 items-center gap-1">
            <Text
              weight="semibold"
              accessibilityRole={a11yPresets.header.accessibilityRole}
              className={titleVisible ? 'text-2xl text-foreground' : visuallyHiddenClassName}
            >
              {title}
            </Text>
            {inlineHelp}
          </View>
          {description && <Text className="text-sm text-muted-foreground">{description}</Text>}
        </View>
        {actions && (
          <View className="w-full flex-row gap-3">
            {(() => {
              const actionItems =
                isValidElement(actions) && actions.type === Fragment
                  ? (actions.props as { children?: ReactNode }).children
                  : actions
              return Children.map(actionItems, (action) =>
                isValidElement(action)
                  ? cloneElement(action as ReactElement<{ className?: string }>, {
                      className: cn((action.props as { className?: string }).className, 'flex-1'),
                    })
                  : action,
              )
            })()}
          </View>
        )}
      </View>
      {children}
    </View>
  )
}
