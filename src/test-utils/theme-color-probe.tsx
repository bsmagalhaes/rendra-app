import { useEffect } from 'react'
import { useBrand } from '../brand'
import { themeColorString } from '../theme/vars'

/**
 * Sonda de teste (não é parte da API pública): resolve, pelo mesmo caminho (`useBrand` +
 * `themeColorString`) que os componentes de produção usam para colorir `placeholderTextColor`, a
 * cor CSS de um token do tema (ex.: `--rendra-muted-foreground`), e entrega o valor a `onCapture`.
 * Usada pelos testes de `Input`/`Select`/`Textarea` que comprovam o achado de contraste do
 * placeholder: antes desta extração, os três arquivos de teste declaravam a mesma sonda
 * (`function Sonda() {...}`) de forma idêntica (melhoria 2 do veredito do fechamento, Fable:
 * "sem duplicação"). `onCapture` (em vez de receber um objeto mutável por prop) porque
 * `react-hooks/immutability` proíbe mutar props/argumentos de hook direto dentro do componente;
 * quem chama grava o valor numa variável própria dentro do callback.
 */
export function ThemeColorProbe({ token, onCapture }: { token: string; onCapture: (cor: string) => void }) {
  const { themeVars } = useBrand()
  useEffect(() => {
    onCapture(themeColorString(themeVars, token))
  }, [themeVars, token, onCapture])
  return null
}
