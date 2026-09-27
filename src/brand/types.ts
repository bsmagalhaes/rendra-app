import type { ComponentType } from 'react'
import type { SvgProps } from 'react-native-svg'
import type { Shape } from '../lib/shape'

export type SvgComponent = ComponentType<SvgProps>
export type FeedbackType = 'success' | 'error' | 'warning' | 'info'

export interface PaletteConfig {
  id: string
  name: string
  sidebarLogo: 'light' | 'dark' | 'auto'
}

export interface BrandConfig {
  id: string
  productName: string
  companyName: string
  tagline: string
  /** Selo/símbolo da marca (BrandLogo, BrandFeedbackIcon); sem arte própria (campo opcional). */
  symbol?: SvgComponent
  /** Logotipo completo claro/escuro (BrandLogo); sem arte própria (campo opcional). */
  logo?: { light: SvgComponent; dark: SvgComponent }
  feedbackIcons?: Partial<Record<FeedbackType, SvgComponent>>
  shape: Shape
  logoMode?: 'themed' | 'image'
  sidebarLogo: 'light' | 'dark' | 'auto'
}
