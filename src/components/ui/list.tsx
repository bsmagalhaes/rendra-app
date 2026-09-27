import type { ReactNode } from 'react'
import { FlatList, Pressable, View } from 'react-native'
import { ChevronRight } from 'lucide-react-native'
import { Text } from '../internal/text'
import { Separator } from './separator'
import { useRendraNavigation } from '../../navigation/rendra-navigation'
import { a11yPresets } from '../../lib/a11y'
import { cn } from '../../lib/cn'

export interface ListItem {
  id: string
  title: ReactNode
  description?: ReactNode
  leading?: ReactNode
  trailing?: ReactNode
  href?: string
  onPress?: () => void
}

export interface ListProps {
  items: ListItem[]
  divided?: boolean
  empty?: ReactNode
  /** Aditivo ao contrato §12.28 (decisão do plano do lote 4): evita o aviso de VirtualizedList
   *  aninhada quando o List está dentro de outra rolagem (ex.: vitrine). Padrão `true`. */
  scrollEnabled?: boolean
  testID?: string
  className?: string
}

// Função de módulo (não criada dentro do render): mesma referência em toda renderização, como
// o contrato pede para ItemSeparatorComponent (C3 do veredito do Opus).
function ListSeparator() {
  return <Separator />
}

function ListRow({ item }: { item: ListItem }) {
  const { navigate, linkComponent: LinkComponent } = useRendraNavigation()
  const interactive = Boolean(item.href) || Boolean(item.onPress)
  // B1 (veredito do Fable, validacao da entrega): `py-3` só entra aqui (no View externo, a
  // linha inteira) quando a linha NÃO é interativa; a linha interativa leva `py-3` só na
  // Pressable (abaixo), nunca nos dois nós ao mesmo tempo (isso somava 68px, 12+44+12, contra
  // os 44px do contrato quando o item tinha só título, sem descrição para forçar a altura).
  const rowClassName = cn('min-h-touch flex-row items-center gap-3', interactive ? 'rounded-item px-2' : 'py-3')
  // `self-stretch` acompanha a altura da Pressable (que agora é quem define os 44px mínimos),
  // em vez de encolher para o tamanho do próprio conteúdo do trailing.
  const trailing = item.trailing ? <View className="shrink-0 flex-row items-center self-stretch">{item.trailing}</View> : null
  // M1 (veredito do Fable): o contrato põe `trailing` antes do `ChevronRight`; o chevron é só
  // decorativo (`aria-hidden` via lucide) e não precisa estar dentro da Pressable, então sai de
  // `mainContent` e vira irmão de `trailing`, sempre depois dele, nos dois ramos interativos.
  const chevron = interactive ? (
    <ChevronRight testID={`list-chevron-${item.id}`} className="size-icon-sm shrink-0 text-muted-foreground self-center" />
  ) : null

  const mainContent = (
    <>
      {item.leading ? <View className="shrink-0">{item.leading}</View> : null}
      <View className="min-w-0 flex-1 flex-col gap-1">
        <Text weight="medium" numberOfLines={1} className="text-sm text-foreground">
          {item.title}
        </Text>
        {item.description ? (
          <Text numberOfLines={2} className="text-sm text-muted-foreground">
            {item.description}
          </Text>
        ) : null}
      </View>
      {/* M4 (Fable, validacao da entrega): quando a linha e interativa, o trailing (Button e
          composicao autorizada) so entra aqui dentro da Pressable se NAO for interativo; um
          trailing interativo fica fora, irmao da Pressable, para nao dar controle aninhado em
          controle (axe nested-interactive no web). */}
      {!interactive ? trailing : null}
    </>
  )

  if (item.href) {
    return (
      <View className={rowClassName}>
        {LinkComponent ? (
          <LinkComponent href={item.href} asChild>
            <Pressable accessibilityRole={a11yPresets.link.accessibilityRole} className="min-h-touch flex-1 flex-row items-center gap-3 py-3">
              {mainContent}
            </Pressable>
          </LinkComponent>
        ) : (
          <Pressable
            accessibilityRole={a11yPresets.link.accessibilityRole}
            onPress={() => navigate(item.href!)}
            className="min-h-touch flex-1 flex-row items-center gap-3 py-3"
          >
            {mainContent}
          </Pressable>
        )}
        {trailing}
        {chevron}
      </View>
    )
  }

  if (item.onPress) {
    return (
      <View className={rowClassName}>
        <Pressable
          accessibilityRole={a11yPresets.button.accessibilityRole}
          onPress={item.onPress}
          className="min-h-touch flex-1 flex-row items-center gap-3 py-3"
        >
          {mainContent}
        </Pressable>
        {trailing}
        {chevron}
      </View>
    )
  }

  return <View className={rowClassName}>{mainContent}</View>
}

export function List({ items, divided = true, empty, scrollEnabled = true, testID, className }: ListProps) {
  if (items.length === 0) return <>{empty ?? null}</>

  return (
    <FlatList
      testID={testID}
      scrollEnabled={scrollEnabled}
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ListRow item={item} />}
      ItemSeparatorComponent={divided ? ListSeparator : undefined}
      contentContainerClassName={className}
    />
  )
}
