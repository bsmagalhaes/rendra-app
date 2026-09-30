import type { ColorMode } from '../brand'
import type { ModelId } from '../theme/models'
import { colorCodes, themeCodes } from './presets'

/*
 * Opções dos controles de aparência (modelo, paleta e modo) usadas pela galeria e pelas
 * configurações. Campos reais de `presets.ts`: `ThemeCode { code, brand, name }` e
 * `ColorCode { code, palette, name }`; o `value` das opções usa o campo de código, e os guardas
 * de tipo decidem se o valor devolvido pelo controle é aplicável.
 */

export const isModelId = (value: string): value is ModelId => value === 'T1' || value === 'T2' || value === 'T3'
export const isColorMode = (value: string): value is ColorMode =>
  value === 'light' || value === 'dark' || value === 'system'

export const modelOptions = themeCodes.map((t) => ({ value: t.code, label: t.name }))
export const paletteOptions = colorCodes.map((c) => ({ value: c.palette, label: c.name }))
export const modeOptions = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
  { value: 'system', label: 'Sistema' },
]

export function modeLabel(mode: ColorMode): string {
  if (mode === 'system') return 'sistema'
  return mode === 'dark' ? 'escuro' : 'claro'
}
