import { Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Menu } from 'lucide-react-native'
import { Text } from '../internal/text'
import { cn } from '../../lib/cn'
import { ShellLink } from './shell-link'
import { useShell } from './shell-context'
import type { NavItem } from './types'

/**
 * Barra inferior: até 4 atalhos e, no centro, o botão redondo do menu, subindo metade acima da
 * linha da barra. É a dona do inset inferior. O botão central leva `shadow-md` sempre (nunca
 * condicional: classe de sombra que aparece depois do primeiro render derruba o css-interop no
 * Android), e o item ativo declara os dois estados de cor.
 */
export function BottomNav() {
  const insets = useSafeAreaInsets()
  const { bottomNavItems, activeTo, setMobileNavOpen } = useShell()

  const item = (entry: NavItem) => {
    const to = entry.to ?? entry.children?.[0]?.to ?? '/'
    const Icon = entry.icon
    const ativo = to === activeTo || Boolean(entry.children?.some((filho) => filho.to === activeTo))
    return (
      <View key={entry.title} className="flex-1">
        <ShellLink
          to={to}
          active={ativo}
          className="min-h-touch flex-col items-center justify-center gap-1 py-2"
        >
          <Icon className={cn('size-icon-md', ativo ? 'text-primary-text' : 'text-muted-foreground')} />
          <Text
            weight="medium"
            numberOfLines={1}
            className={cn('px-1 text-xs', ativo ? 'text-primary-text' : 'text-muted-foreground')}
          >
            {entry.shortTitle ?? entry.title}
          </Text>
        </ShellLink>
      </View>
    )
  }

  const metade = Math.ceil(bottomNavItems.length / 2)

  return (
    <View
      role="navigation"
      accessibilityLabel="Navegação rápida"
      className="flex-row items-end border-t border-border bg-card"
      style={{ paddingBottom: Math.max(0, insets.bottom) }}
    >
      {bottomNavItems.slice(0, metade).map(item)}
      <View className="flex-1 items-center">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir menu"
          onPress={() => setMobileNavOpen(true)}
          className="-mt-6 mb-1 size-12 items-center justify-center rounded-full border-4 border-card bg-primary shadow-md"
        >
          <Menu className="size-icon-lg text-primary-foreground" />
        </Pressable>
      </View>
      {bottomNavItems.slice(metade).map(item)}
    </View>
  )
}
