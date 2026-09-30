import { Linking, Pressable } from 'react-native'
import { Text } from '../internal/text'
import { a11yPresets } from '../../lib/a11y'
import { cn } from '../../lib/cn'

/*
 * Crédito discreto "Feito com Rendra", para o rodapé da tela de login e da home (nunca na
 * barra de navegação). Ligado por padrão; some com credit={false}. Texto e link são
 * substituíveis por prop. Abre no navegador, com alvo de toque de 44px e texto de apoio em cor
 * muted.
 *
 * Remover o crédito da interface é permitido: a licença MIT pede que o aviso de copyright
 * e o arquivo LICENSE fiquem no código e nas cópias, não que haja crédito visível na tela.
 */

export const RENDRA_CREDIT_TEXT = 'Feito com Rendra'
export const RENDRA_CREDIT_HREF = 'https://github.com/bsmagalhaes/rendra-ui-web'

export interface RendraCreditProps {
  /** Padrão true; false remove o crédito. */
  credit?: boolean
  /** Padrão "Feito com Rendra". */
  text?: string
  /** Padrão: o repositório do Rendra Design System. */
  href?: string
  className?: string
  testID?: string
}

export function RendraCredit({
  credit = true,
  text = RENDRA_CREDIT_TEXT,
  href = RENDRA_CREDIT_HREF,
  className,
  testID,
}: RendraCreditProps) {
  if (!credit) return null
  return (
    <Pressable
      testID={testID}
      dataSet={{ rendra: 'CRED-001' }}
      accessibilityRole={a11yPresets.link.accessibilityRole}
      accessibilityHint="Abre no navegador"
      onPress={() => Linking.openURL(href)}
      className={cn('min-h-touch items-center justify-center self-center rounded-item px-2', className)}
    >
      <Text className="text-xs text-muted-foreground">{text}</Text>
    </Pressable>
  )
}
