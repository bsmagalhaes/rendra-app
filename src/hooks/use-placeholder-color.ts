import { useBrand } from '../brand/use-brand'
import { themeColorString } from '../theme/vars'

/**
 * Cor de placeholder (`--muted-foreground`) resolvida do tema ativo, pronta para usar direto em
 * `placeholderTextColor` (RN/react-native-web). Achado do Playwright (`test:a11y`):
 * `placeholderTextColor` precisa ser um valor INLINE (não uma classe `placeholder:`), porque o
 * axe-core clona o elemento para medir contraste e o clone não herda a variável CSS
 * `--muted-foreground` (definida só no `BrandProvider` ancestral).
 *
 * Melhoria 2 do veredito do fechamento (Fable, "sem duplicação"): `Input`, `Select` e `Textarea`
 * repetiam a mesma resolução (`useBrand().themeVars` + `themeColorString(themeVars,
 * '--muted-foreground')`) cada um por conta própria; extraído aqui para os três consumirem.
 */
export function usePlaceholderColor(): string {
  const { themeVars } = useBrand()
  return themeColorString(themeVars, '--muted-foreground')
}
