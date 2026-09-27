import type { Model } from './models'
import type { Palette, PaletteVars } from '../brand/palette'
import { systemColorsLight, systemColorsDark } from './tokens'
import { radiusByRole } from '../lib/shape'

const kebab = (s: string) => `--${s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`

// chaves de palette.light/dark que não são cor de tema Tailwind (degradê/imagem cru,
// consumidas só pelo Gradient via useBrand().palette); nunca entram em vars()
const SKIP_PALETTE_KEYS = new Set([
  '--sidebar-image', '--gradient-brand', '--gradient-accent', '--gradient-soft', '--background-image',
])

function toRgbTriplet(hex: string): string {
  const h = hex.replace('#', '')
  const n = parseInt(h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(' ')
}

const isHex = (value: string) => /^#/.test(value)

const shadowOpacity = {
  light: { sm: '0.06', md: '0.1', lg: '0.18' },
  dark: { sm: '0.3', md: '0.35', lg: '0.5' },
}

export function buildThemeVars(model: Model, palette: Palette, mode: 'light' | 'dark'): Record<string, string> {
  const paletteVars: PaletteVars = mode === 'light' ? palette.light : palette.dark
  const system = mode === 'light' ? systemColorsLight : systemColorsDark
  const vars: Record<string, string> = {}

  // 1. Cores de sistema fixas do modo (chaves camelCase, convertidas para --kebab-case). No modo
  // claro, `system` é systemColorsLight, que já inclui `background`/`foreground`; este laço já
  // grava --background/--foreground, sem precisar regravar depois (duplicação removida na
  // correção pós-validação, item recomendado 5).
  for (const [key, value] of Object.entries(system)) {
    vars[kebab(key)] = isHex(value) ? toRgbTriplet(value) : value
  }
  // No modo escuro, os 9 pares de neutro (--background, --foreground, --card, --popover,
  // --muted, --border, --input, --field, --overlay e seus -foreground) vêm de palette.dark,
  // não de systemColorsDark (que só tem destructive/success/warning/info): o laço abaixo,
  // que copia palette.dark por cima, já resolve isso, porque essas chaves existem em
  // palette.dark e são processadas depois deste bloco.

  // 2. Chaves de palette.light/palette.dark: já são '--kebab-case', copiadas direto.
  for (const [key, value] of Object.entries(paletteVars)) {
    if (SKIP_PALETTE_KEYS.has(key)) continue
    if (key === '--shadow-color') { vars[key] = value; continue } // já é trio, nunca hex
    vars[key] = isHex(value) ? toRgbTriplet(value) : value // hex -> trio; rgb(...)/a passa direto
  }

  // 3. Raio por papel, com unidade px.
  const radius = radiusByRole(model.shape, model.radius)
  vars['--radius-control'] = `${radius.control}px`
  vars['--radius-item'] = `${radius.item}px`
  vars['--radius-surface'] = `${radius.surface}px`
  vars['--radius-block'] = `${radius.block}px`
  vars['--radius-avatar'] = `${radius.avatar}px`

  // 4. Opacidade de sombra por modo (o NativeWind não lê box-shadow multi-camada; a cor vem
  //    de --shadow-color acima, a opacidade destas 3 variáveis, lidas pelo tailwind.config.ts).
  vars['--shadow-opacity-sm'] = shadowOpacity[mode].sm
  vars['--shadow-opacity-md'] = shadowOpacity[mode].md
  vars['--shadow-opacity-lg'] = shadowOpacity[mode].lg

  return vars
}

/**
 * Formata uma chave de `buildThemeVars()` (trio "R G B", ex. "79 95 118") como uma cor CSS
 * usável em props que exigem string de cor fora de `className` (ex.: `placeholderTextColor`
 * do `TextInput`). Achado do Playwright (Tarefa 22/24): `placeholder:text-muted-foreground`
 * via `className` não sobrevive ao clone que o axe-core usa para medir contraste (a variável
 * CSS, herdada só do `BrandProvider` ancestral, fica inválida nesse clone); `placeholderTextColor`
 * vira um valor inline no próprio elemento, que sobrevive ao clone.
 */
export function themeColorString(vars: Record<string, string>, key: string): string {
  const value = vars[key] ?? ''
  return /^[\d.]+ [\d.]+ [\d.]+$/.test(value) ? `rgb(${value})` : value
}
