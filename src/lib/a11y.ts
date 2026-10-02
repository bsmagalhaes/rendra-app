import type { AccessibilityRole, Role } from 'react-native'

export interface AccessibilityPreset {
  accessibilityRole?: AccessibilityRole
  role?: Role
  accessibilityHint?: string
}

// Tipado explicitamente como Record<string, AccessibilityPreset> (não `as const satisfies`):
// `satisfies` sozinho preserva o tipo literal estreito de cada entrada (ex.: `{ role: 'status' }`,
// sem o campo `accessibilityRole`), o que faz `a11yPresets.status.accessibilityRole` não tipar,
// mesmo sendo `undefined` em runtime (é exatamente o que o teste confere). A anotação explícita
// larga cada entrada para o tipo completo de `AccessibilityPreset` (os 2 campos opcionais).
export const a11yPresets: Record<string, AccessibilityPreset> = {
  button: { accessibilityRole: 'button' },
  radiogroup: { accessibilityRole: 'radiogroup' },
  radio: { accessibilityRole: 'radio' },
  checkbox: { accessibilityRole: 'checkbox' },
  toolbar: { accessibilityRole: 'toolbar' },
  menu: { accessibilityRole: 'menu' },
  menuitem: { accessibilityRole: 'menuitem' },
  menubar: { accessibilityRole: 'menubar' },
  combobox: { accessibilityRole: 'combobox' },
  tab: { accessibilityRole: 'tab' },
  tablist: { accessibilityRole: 'tablist' },
  header: { accessibilityRole: 'header' },
  alert: { accessibilityRole: 'alert' },
  progressbar: { accessibilityRole: 'progressbar' },
  adjustable: { accessibilityRole: 'adjustable' },
  switch: { accessibilityRole: 'switch' },
  status: { role: 'status' },
  group: { role: 'group' },
  separator: { role: 'separator' },
  dialog: { role: 'dialog' },
  img: { role: 'img' },
  tabpanel: { role: 'tabpanel' },
  link: { accessibilityRole: 'link' },
  // F3: papeis que so existem em `role` no RN 0.86 (ViewAccessibility.d.ts).
  meter: { role: 'meter' },
  log: { role: 'log' },
  region: { role: 'region' },
  figure: { role: 'figure' },
  list: { role: 'list' },
  listitem: { role: 'listitem' },
}
