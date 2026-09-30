import type { ReactNode } from 'react'
import { Pressable, View } from 'react-native'
import { ArrowLeft } from 'lucide-react-native'
import { Text } from '../internal/text'
import { Gradient } from '../gradient/gradient'
import { BrandLogo } from '../ui/brand-logo'
import { RendraCredit } from '../ui/rendra-credit'
import { useBrand } from '../../brand/use-brand'
import { useRendraNavigation } from '../../navigation/rendra-navigation'
import { a11yPresets } from '../../lib/a11y'

/*
 * Moldura das telas públicas (entrar, recuperar senha, cadastro): painel de marca no topo (o
 * único `Gradient` da tela, com o logotipo e a frase do modelo), título, descrição, o conteúdo,
 * o rodapé e, por último, o crédito "Feito com Rendra" (removível por `credit={false}`). Sem
 * rolagem própria: a tela que usa o layout põe o `ScrollView`. Fica fora do `AppShell`.
 */

export interface AuthLayoutProps {
  title: string
  description?: string
  /** Link de voltar acima do título (ex.: "Voltar ao login"). */
  back?: { href: string; label: string }
  children: ReactNode
  footer?: ReactNode
  /** Padrão true; false remove o crédito. */
  credit?: boolean
  creditText?: string
  creditHref?: string
}

function BackLink({ href, label }: { href: string; label: string }) {
  const { navigate, linkComponent: LinkComponent } = useRendraNavigation()
  const conteudo = (
    <Pressable
      accessibilityRole={a11yPresets.link.accessibilityRole}
      onPress={LinkComponent ? undefined : () => navigate(href)}
      className="min-h-touch flex-row items-center gap-2 self-start rounded-item"
    >
      <ArrowLeft className="size-icon-md text-muted-foreground" />
      <Text weight="medium" className="text-sm text-muted-foreground">
        {label}
      </Text>
    </Pressable>
  )
  return LinkComponent ? (
    <LinkComponent href={href} asChild>
      {conteudo}
    </LinkComponent>
  ) : (
    conteudo
  )
}

export function AuthLayout({ title, description, back, children, footer, credit, creditText, creditHref }: AuthLayoutProps) {
  const { brand } = useBrand()

  return (
    <View className="w-full gap-6 p-4">
      <View className="relative overflow-hidden rounded-block p-6">
        <View
          aria-hidden
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          className="absolute inset-0"
        >
          <Gradient token="brand" className="size-full" />
        </View>
        <View className="gap-4">
          <BrandLogo on="brand" />
          <Text className="text-sm text-gradient-brand-foreground">{brand.tagline}</Text>
        </View>
      </View>
      <View className="w-full max-w-sm gap-6 self-center">
        {back ? <BackLink href={back.href} label={back.label} /> : null}
        <View className="gap-2">
          <Text weight="semibold" accessibilityRole={a11yPresets.header.accessibilityRole} className="text-2xl text-foreground">
            {title}
          </Text>
          {description ? <Text className="text-sm text-muted-foreground">{description}</Text> : null}
        </View>
        {children}
        {footer}
        <RendraCredit credit={credit} text={creditText} href={creditHref} />
      </View>
    </View>
  )
}
