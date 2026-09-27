import { cssInterop } from 'nativewind'
import * as LucideIcons from 'lucide-react-native'

let registered = false

// `lucide-react-native@1.48.0` não exporta mais um dicionário `icons` (usado por versões
// anteriores do pacote, que o plano original tinha em mente); cada ícone é exportado 3 vezes
// (ex.: `LucideZap`, `Zap`, `ZapIcon`), todas apontando para o MESMO componente
// (`React.forwardRef`, conferido em node_modules/lucide-react-native/dist/cjs/createLucideIcon.js).
// Estes 4 nomes não são ícone, são utilitários do próprio pacote.
const NON_ICON_EXPORTS = new Set(['LucideProvider', 'useLucideContext', 'createLucideIcon', 'Icon'])

/**
 * Registra cssInterop em todos os ícones lucide-react-native de uma vez, para className
 * do NativeWind controlar color/width/height. Idempotente: chamar mais de uma vez não
 * registra duas vezes (cssInterop não é seguro para dupla chamada no mesmo componente).
 * Também deduplica por referência: como cada ícone é exportado sob 3 nomes apontando para o
 * mesmo objeto, sem essa deduplicação o mesmo componente receberia cssInterop 3 vezes.
 */
export function registerIconInterop() {
  if (registered) return
  const seen = new Set<unknown>()
  for (const [name, value] of Object.entries(LucideIcons)) {
    if (NON_ICON_EXPORTS.has(name)) continue
    if (typeof value !== 'object' && typeof value !== 'function') continue
    if (seen.has(value)) continue
    seen.add(value)
    cssInterop(value as never, { className: { target: 'style', nativeStyleToProp: { color: true, width: true, height: true } } })
  }
  registered = true
}
