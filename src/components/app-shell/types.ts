import type { ComponentType } from 'react'
import type { FeedbackType } from '../../brand/types'

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

/** Notificação do sino do cabeçalho. */
export interface ShellNotificationItem {
  id: string
  type: FeedbackType
  title: string
  time: string
  read: boolean
}

/**
 * Sino de notificações do cabeçalho. A lista `items` é copiada uma vez, na montagem: marcar como
 * lida muda só a cópia interna, e os retornos avisam o consumidor.
 */
export interface ShellNotificationsConfig {
  items: ShellNotificationItem[]
  onMarkAllRead?: () => void
  onItemClick?: (id: string) => void
}
