import { Children, cloneElement, Fragment, isValidElement, useContext, useEffect, useRef } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { View, type ViewProps } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from '../internal/text'
import { InfoHint } from '../ui/info-hint'
import { ShellContext } from '../app-shell/shell-context'
import { useRendraNavigation } from '../../navigation/rendra-navigation'
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
  // Fora do AppShell o contexto é nulo e o componente se comporta como sempre.
  const shell = useContext(ShellContext)
  const setPageMeta = shell?.setPageMeta
  const titleText = typeof title === 'string' ? title : undefined
  const helpText = typeof help === 'string' ? help : undefined

  // Dentro do shell, título e ajuda em texto vão para o cabeçalho (só strings: um `ReactNode`
  // novo a cada render entraria em laço com o estado do shell).
  // Cada tela reivindica uma rota para o título (ver R2 abaixo) e nunca a de outra tela.
  const { currentPath } = useRendraNavigation()
  // R2 (validação da entrega do P3): num push, o roteador ainda entrega o pathname antigo no
  // primeiro render da tela nova. A tela reivindica a rota da montagem e, se a rota mudar enquanto
  // ela ainda está com esse valor, adota a nova, mas só enquanto a tela é recém-montada (antes do primeiro `setTimeout`). A tela
  // que fica por baixo na pilha já passou desse ponto, então não reivindica a rota alheia.
  const mountPath = useRef(currentPath)
  const claimed = useRef<string | undefined>(undefined)
  const settled = useRef(false)
  useEffect(() => {
    const id = setTimeout(() => {
      settled.current = true
    }, 0)
    return () => clearTimeout(id)
  }, [])
  useEffect(() => {
    if (!setPageMeta) return
    if (claimed.current === undefined || (!settled.current && claimed.current === mountPath.current)) claimed.current = currentPath
    setPageMeta({ title: titleText, help: helpText, path: claimed.current })
    return () => setPageMeta(null)
  }, [setPageMeta, titleText, helpText, currentPath])

  const helpInShell = Boolean(shell) && helpText !== undefined
  const inlineHelp =
    help && !helpInShell ? (
      <InfoHint title={typeof title === 'string' ? title : 'Sobre esta tela'}>{help}</InfoHint>
    ) : null
  // No shell o título visível é o do cabeçalho; aqui fica só o título semântico, oculto.
  const titleVisible = !shell && (showTitle || Boolean(inlineHelp))
  const visible =
    (!shell && showTitle) || Boolean(description) || Boolean(actions) || Boolean(children) || Boolean(inlineHelp)

  return (
    <View
      className={cn('-mb-2 flex-col gap-4', !visible && visuallyHiddenClassName, className)}
      style={{ paddingTop: shell ? 0 : Math.max(0, insets.top) }}
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
