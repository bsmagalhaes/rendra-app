import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowLeft, Menu } from 'lucide-react-native'
import { Text } from '../internal/text'
import { Button } from '../ui/button'
import { InfoHint } from '../ui/info-hint'
import { useBrand } from '../../brand/use-brand'
import { useRendraNavigation } from '../../navigation/rendra-navigation'
import { getBackTarget } from './navigation-utils'
import { useShell } from './shell-context'
import { UserMenu } from './user-menu'

/**
 * Cabeçalho do AppShell: seta de voltar (rota de segundo nível) ou botão de menu (sem barra
 * inferior), título da tela e, à direita, o menu do usuário. É o único dono do inset superior:
 * a altura fixa (`h-header`) fica num filho, porque no React Native a altura de uma `View`
 * inclui o `padding`, e o padding de área segura dentro dela comeria o espaço do conteúdo.
 */
export function Header() {
  const insets = useSafeAreaInsets()
  const { brand } = useBrand()
  const { navigate, goBack, canGoBack, currentPath } = useRendraNavigation()
  const {
    layout,
    hydrated,
    navigation,
    navigationTargets,
    activeTo,
    pageTitle,
    pageHelp,
    setMobileNavOpen,
    user,
    userMenuItems,
    onLogout,
  } = useShell()

  const back = currentPath === undefined ? null : getBackTarget(navigation, currentPath)
  const title =
    pageTitle ?? navigationTargets.find((alvo) => alvo.to === activeTo)?.title ?? brand.productName

  return (
    <View className="border-b border-border bg-card" style={{ paddingTop: insets.top }} testID="shell-cabecalho">
      <View className="h-header flex-row items-center gap-1 px-2">
        {back ? (
          <Button
            variant="ghost"
            iconOnly
            accessibilityLabel={`Voltar para ${back.title}`}
            icon={<ArrowLeft className="text-foreground" />}
            onPress={() => (canGoBack?.() ? goBack?.() : navigate(back.to))}
          />
        ) : hydrated && !layout.bottomNav ? (
          <Button
            variant="ghost"
            iconOnly
            accessibilityLabel="Abrir menu"
            icon={<Menu className="text-foreground" />}
            onPress={() => setMobileNavOpen(true)}
          />
        ) : null}
        <View className="min-w-0 flex-1 flex-row items-center gap-1">
          <Text weight="semibold" className="shrink text-base text-foreground" numberOfLines={1}>
            {title}
          </Text>
          {pageHelp ? <InfoHint title={pageTitle ?? title}>{pageHelp}</InfoHint> : null}
        </View>
        {user ? <UserMenu user={user} userMenuItems={userMenuItems} onLogout={onLogout} /> : null}
      </View>
    </View>
  )
}
