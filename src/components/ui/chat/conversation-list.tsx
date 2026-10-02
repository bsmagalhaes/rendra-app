import { Pressable, View } from 'react-native'
import { Text } from '../../internal/text'
import { Avatar } from '../avatar'
import { channelTextClass, chatChannels, ChannelMark, type ChannelLogos } from './channel-badge'
import type { Conversation } from './types'
import { stamp, waited } from '../../../lib/chat-format'
import { a11yPresets } from '../../../lib/a11y'
import { resolveCatalogCode } from '../../../catalog/components'
import { cn } from '../../../lib/cn'

export interface ConversationListProps {
  items: Conversation[]
  activeId?: string | null
  onSelect: (id: string) => void
  /** Texto quando nao ha conversas (ex.: com os filtros aplicados). */
  empty?: string
  /** Logotipos dos canais, injetados pelo app (marcas de terceiros nao vao no pacote). */
  channelLogos?: ChannelLogos
  className?: string
}

export function ConversationList({
  items,
  activeId,
  onSelect,
  empty = 'Nenhuma conversa aqui.',
  channelLogos,
  className,
}: ConversationListProps) {
  if (!items.length) {
    return (
      <View dataSet={{ rendra: resolveCatalogCode('ConversationList') }}>
        <Text className="p-6 text-center text-sm text-muted-foreground">{empty}</Text>
      </View>
    )
  }
  return (
    <View testID="conversation-list" {...a11yPresets.list} dataSet={{ rendra: resolveCatalogCode('ConversationList') }} className={cn('gap-1 p-2', className)}>
      {items.map((c) => {
        const active = c.id === activeId
        const canal = chatChannels[c.channel]
        const linha2 = [c.department, c.assignee].filter(Boolean).join(' · ') || c.lastMessage
        return (
          <View key={c.id} testID={`conversation-item-${c.id}`} {...a11yPresets.listitem}>
            <Pressable
              {...a11yPresets.button}
              accessibilityState={{ selected: active }}
              onPress={() => onSelect(c.id)}
              className={cn('min-h-touch flex-row items-start gap-3 rounded-item px-3 py-3', active ? 'bg-primary-soft' : 'bg-transparent')}
            >
              <View className="shrink-0">
                <Avatar name={c.name} src={c.avatar} size="lg" />
                <ChannelMark channel={c.channel} logos={channelLogos} id={c.id} className="absolute -bottom-1 -right-1" />
              </View>
              <View className="min-w-0 flex-1 gap-1">
                <View className="flex-row items-baseline gap-2">
                  <Text weight="semibold" numberOfLines={1} className="min-w-0 flex-1 text-sm text-foreground">
                    {c.name}
                  </Text>
                  <Text className="shrink-0 text-xs text-muted-foreground">{stamp(c.time)}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text numberOfLines={1} className="min-w-0 flex-1 text-xs text-muted-foreground">
                    {linha2}
                  </Text>
                  {c.unread ? (
                    <View className="min-w-6 shrink-0 items-center justify-center rounded-full bg-primary px-1">
                      <Text weight="semibold" className="text-xs text-primary-foreground">
                        {String(c.unread)}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <View className="min-w-0 flex-row items-center gap-1">
                  <Text weight="semibold" className={cn('shrink-0 text-xs', channelTextClass[c.channel])}>
                    {`${canal.label}${c.account ? ':' : ''}`}
                  </Text>
                  {c.account ? (
                    <Text numberOfLines={1} className="text-xs text-muted-foreground">
                      {c.account}
                    </Text>
                  ) : null}
                </View>
                {c.waitingSince ? (
                  <Text weight="medium" className="text-xs text-warning-soft-foreground">
                    {`Esperando há ${waited(c.waitingSince)}`}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          </View>
        )
      })}
    </View>
  )
}
