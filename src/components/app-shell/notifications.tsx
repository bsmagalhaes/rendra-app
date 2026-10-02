import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { Bell } from 'lucide-react-native'
import { BottomSheet } from '../internal/bottom-sheet'
import { Text } from '../internal/text'
import { BrandFeedbackIcon } from '../ui/brand-feedback-icon'
import { Button } from '../ui/button'
import { a11yPresets } from '../../lib/a11y'
import { useShell } from './shell-context'

/**
 * Sino de notificações do cabeçalho. Só aparece quando o shell recebe `notifications`; os itens
 * e os dois retornos (marcar todas, tocar um item) vêm dessa prop, nunca de um mock interno. A
 * lista é copiada uma vez, na montagem. A lista abre numa folha (`BottomSheet`); tocar num item
 * o marca como lido e não fecha a folha.
 */
export function Notifications() {
  const { notifications } = useShell()
  const [items, setItems] = useState(() => notifications?.items ?? [])
  const [open, setOpen] = useState(false)
  const unread = items.filter((n) => !n.read).length

  if (!notifications) return null

  const markAllRead = () => {
    setItems((all) => all.map((n) => ({ ...n, read: true })))
    notifications.onMarkAllRead?.()
  }
  const markRead = (id: string) => {
    setItems((all) => all.map((n) => (n.id === id ? { ...n, read: true } : n)))
    notifications.onItemClick?.(id)
  }

  return (
    <>
      <View className="relative">
        <Button
          variant="ghost"
          iconOnly
          accessibilityLabel={unread > 0 ? `Notificações, ${unread} não lidas` : 'Notificações'}
          icon={<Bell className="text-foreground" />}
          onPress={() => setOpen(true)}
        />
        {unread > 0 ? (
          // O número já está no rótulo do sino: a pílula fica escondida da leitura de tela.
          <View
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            testID="notificacoes-contador"
            className="absolute right-1 top-1 h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1"
          >
            <Text weight="medium" className="text-xs leading-none text-destructive-foreground">
              {unread}
            </Text>
          </View>
        ) : null}
      </View>
      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        accessibilityLabel="Notificações"
        testID="notificacoes"
        header={
          <View className="flex-row items-center justify-between gap-2 px-4 pb-2">
            <Text weight="semibold" className="text-base text-popover-foreground">
              Notificações
            </Text>
            <Button variant="ghost" size="sm" disabled={!unread} onPress={markAllRead}>
              Marcar como lidas
            </Button>
          </View>
        }
      >
        {items.map((n) => (
          <Pressable
            key={n.id}
            accessibilityRole={a11yPresets.button.accessibilityRole}
            accessibilityLabel={`${n.title}, ${n.time}${n.read ? '' : ', não lida'}`}
            onPress={() => markRead(n.id)}
            className="min-h-touch flex-row items-start gap-3 rounded-item p-2"
          >
            <BrandFeedbackIcon type={n.type} size="md" />
            <View className="min-w-0 flex-1 gap-1">
              <Text weight={n.read ? 'normal' : 'medium'} className="text-sm text-foreground">
                {n.title}
              </Text>
              <Text className="text-xs text-muted-foreground">{n.time}</Text>
            </View>
            {!n.read ? <View accessibilityLabel="Não lida" className="mt-2 size-2 shrink-0 rounded-full bg-primary" /> : null}
          </Pressable>
        ))}
      </BottomSheet>
    </>
  )
}
