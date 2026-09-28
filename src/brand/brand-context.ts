import { createContext } from 'react'
import type { BrandConfig, LabelStyle, PaletteConfig } from './types'
import type { Model, ModelId } from '../theme/models'
import type { Palette, PaletteSeeds } from './palette'
import type { Shape } from '../lib/shape'

export type ColorMode = 'light' | 'dark' | 'system'

export interface BrandContextValue {
  brand: BrandConfig
  brands: BrandConfig[]
  model: Model
  modelCode: ModelId
  setModelCode: (code: ModelId) => void
  /** Troca modelo e paleta juntos numa escrita só (Tarefa B16, melhoria da rodada 4 de
   *  validação); qualquer parâmetro `undefined` mantém o valor atual daquele campo. */
  setModelAndPalette: (code: ModelId | undefined, paletteId: string | undefined) => void
  mode: ColorMode
  resolvedMode: 'light' | 'dark'
  setMode: (mode: ColorMode) => void
  shape: Shape
  palette: Palette
  paletteId: string
  palettes: PaletteConfig[]
  setPaletteId: (id: string | null) => void
  applyPalette: (seeds: PaletteSeeds) => void
  sidebarLogoVariant: 'light' | 'dark'
  /** Estilo do rótulo do campo ativo (item C1 do levantamento da Sincronização 1), resolvido de
   *  `brand.labelStyle` com padrão `'discreto'`. */
  labelStyle: LabelStyle
  hydrated: boolean
  /** Saída de buildThemeVars(model, palette, resolvedMode), a mesma passada a vars() na View raiz;
   *  exposta no contexto para o teste da Tarefa B12 confirmar que muda de valor em runtime
   *  (Review Focus 3), sem depender de inspecionar o style resolvido da View. */
  themeVars: Record<string, string>
}

export const BrandContext = createContext<BrandContextValue | null>(null)
