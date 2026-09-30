export interface ShellLayout {
  /** Barra inferior de navegação rápida. Sem ela, o botão de menu vai para o cabeçalho. */
  bottomNav: boolean
  /** Como o menu de navegação abre: gaveta lateral ou folha inferior. */
  menu: 'drawer' | 'sheet'
}

/** Código `N1`: barra inferior com menu em gaveta (espelho da forma mobile do web). */
export const defaultShellLayout: ShellLayout = { bottomNav: true, menu: 'drawer' }

export type ShellLayoutCode = 'N1' | 'N2' | 'N3'

/** Os três códigos de navegação (`presets.ts`), com o rótulo em pt-BR de `navCodes`. */
export const layoutOptions: Record<ShellLayoutCode, { label: string; layout: ShellLayout }> = {
  N1: { label: 'Barra inferior com menu em gaveta.', layout: defaultShellLayout },
  N2: { label: 'Barra inferior com menu em folha.', layout: { bottomNav: true, menu: 'sheet' } },
  N3: { label: 'Só gaveta, menu no cabeçalho.', layout: { bottomNav: false, menu: 'drawer' } },
}
