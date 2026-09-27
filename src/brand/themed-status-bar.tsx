import { StatusBar } from 'expo-status-bar'
import { useBrand } from './use-brand'

/** Barra de status legível em qualquer modo: ícones claros sobre fundo escuro e vice-versa,
 *  seguindo resolvedMode do BrandProvider (não o tema do sistema, que app.json deixa automático). */
export function ThemedStatusBar() {
  const { resolvedMode } = useBrand()
  return <StatusBar style={resolvedMode === 'dark' ? 'light' : 'dark'} />
}
