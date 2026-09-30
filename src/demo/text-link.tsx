import { Pressable } from 'react-native'
import { Text } from '../components/internal/text'
import { useRendraNavigation } from '../navigation/rendra-navigation'

/**
 * Link de texto das telas de autenticação da demonstração ("Esqueci a senha", "Criar conta").
 * Não é componente público (fica em `src/demo`, fora do pacote): usa o `Link` do roteador quando
 * há um (preserva o `<a href>` no export web) e cai em `navigate` sem ele. Alvo de toque de 44px.
 */
export function TextLink({ href, children }: { href: string; children: string }) {
  const { navigate, linkComponent: LinkComponent } = useRendraNavigation()
  const conteudo = (
    <Pressable
      accessibilityRole="link"
      onPress={LinkComponent ? undefined : () => navigate(href)}
      className="min-h-touch justify-center self-start rounded-item"
    >
      <Text weight="medium" className="text-sm text-primary-text">
        {children}
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
