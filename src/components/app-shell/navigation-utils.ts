import type { NavGroup, NavIcon, NavItem } from './types'

/*
 * Derivações de exibição do menu: barra inferior, lista plana de destinos, destino ativo e
 * alvo do botão de voltar. Funções puras, portadas do AppShell do web (mesma regra de item
 * ativo); calculadas dentro do AppShell a partir de `navigation`.
 */

/** Destino plano usado no cálculo do item ativo. */
export interface NavigationTarget {
  title: string
  to: string
  group: string
  icon: NavIcon
}

/** Itens marcados `bottomNav`, na ordem do menu. Limite de 4. */
export function getBottomNavItems(navigation: NavGroup[]): NavItem[] {
  return navigation
    .flatMap((g) => g.items)
    .filter((i) => i.bottomNav)
    .slice(0, 4)
}

/** Lista plana de destinos (itens de primeiro nível com rota e filhos de itens com submenu). */
export function getNavigationTargets(navigation: NavGroup[]): NavigationTarget[] {
  return navigation.flatMap((g) =>
    g.items.flatMap((i) => [
      ...(i.to ? [{ title: i.title, to: i.to, group: g.title, icon: i.icon }] : []),
      ...(i.children ?? []).map((c) => ({ title: c.title, to: c.to, group: i.title, icon: i.icon })),
    ]),
  )
}

/**
 * Destino ativo: o mais específico que combina com o endereço.
 * Ex.: em `/paginas/acoes` fica ativo "Ações", não "Páginas".
 */
export function resolveActiveTo(targets: NavigationTarget[], pathname: string): string | null {
  const matches = targets
    .map((t) => t.to)
    .filter((to) => (to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`)))
  return matches.sort((a, b) => b.length - a.length)[0] ?? null
}

/**
 * Para onde a seta de voltar leva. Se o destino ativo é filho de um item, o item pai (com rota);
 * se é um item de primeiro nível e o endereço é mais fundo que ele, o próprio item; senão `null`
 * (já está na raiz de uma seção, não há seta).
 */
export function getBackTarget(navigation: NavGroup[], pathname: string): { title: string; to: string } | null {
  const active = resolveActiveTo(getNavigationTargets(navigation), pathname)
  if (!active) return null
  const items = navigation.flatMap((g) => g.items)
  const parent = items.find((item) => item.children?.some((child) => child.to === active))
  if (parent) return parent.to ? { title: parent.title, to: parent.to } : null
  if (pathname !== active) {
    const top = items.find((item) => item.to === active)
    return top?.to ? { title: top.title, to: top.to } : null
  }
  return null
}
