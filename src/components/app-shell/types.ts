import type { ComponentType } from 'react'

/** Ícone de item de navegação: qualquer componente que aceite `className` (ícones do `lucide-react-native`). */
export type NavIcon = ComponentType<{ className?: string }>

export interface NavChild {
  title: string
  to: string
  description?: string
}

export interface NavItem {
  title: string
  to?: string
  icon: NavIcon
  badge?: string
  /** Aparece na barra inferior (no máximo 4 itens marcados). */
  bottomNav?: boolean
  /** Rótulo curto da barra inferior; sem ele usa `title`. */
  shortTitle?: string
  description?: string
  children?: NavChild[]
}

export interface NavGroup {
  title: string
  description?: string
  items: NavItem[]
}

export interface ShellUser {
  name: string
  email?: string
  avatarUrl?: string
}

export interface ShellMenuItem {
  label: string
  to?: string
  onSelect?: () => void
  icon?: NavIcon
}
