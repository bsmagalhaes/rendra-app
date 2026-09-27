import { models } from './models'

// Preset do Tailwind/NativeWind do Rendra App: mesma fonte que `tailwind.config.ts` da raiz
// consome (para o app deste repositório) e que o pacote publica em `./tailwind-preset`, para
// quem instala ler exatamente o mesmo objeto (padrão dos produtos Rendra, seção 1.4).
//
// `tsconfig.lib.json` (Tarefa 3.4) não inclui `scripts/check-rules.ts`, que é quem declara
// `module` globalmente no programa principal (`tsconfig.json`); esta declaração local garante
// que `module.exports = ...` no fim do arquivo tipe nos dois programas, sem redeclarar o global.
declare const module: { exports: unknown }

// Tupla de fontSize (tamanho + configuração), explícita: sem isso, o literal de array infere
// `(string | { lineHeight; letterSpacing })[]` em vez da tupla de 2 posições que o Tailwind espera.
type FontSizeEntry = [string, { lineHeight: string; letterSpacing: string }]

const color = (name: string) => `rgb(var(--${name}) / <alpha-value>)`
const colorNoAlpha = (name: string) => `var(--${name})`

const colorNames = [
  'background', 'foreground', 'card', 'card-foreground', 'popover', 'popover-foreground',
  'muted', 'muted-foreground', 'border', 'input', 'field', 'ring',
  'primary', 'primary-hover', 'primary-foreground', 'primary-hover-foreground',
  'primary-soft', 'primary-soft-foreground', 'primary-text',
  'secondary', 'secondary-hover', 'secondary-foreground', 'secondary-hover-foreground',
  'accent', 'accent-foreground',
  'destructive', 'destructive-hover', 'destructive-foreground', 'destructive-soft', 'destructive-soft-foreground',
  'success', 'success-foreground', 'success-soft', 'success-soft-foreground',
  'warning', 'warning-foreground', 'warning-soft', 'warning-soft-foreground',
  'info', 'info-foreground', 'info-soft', 'info-soft-foreground',
  'sidebar', 'sidebar-foreground', 'sidebar-muted-foreground', 'sidebar-active-foreground', 'sidebar-indicator',
  'gradient-brand-foreground',
  'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5',
]
// sidebar-border, sidebar-accent, sidebar-active e overlay já vêm em rgb(r g b / a) completo;
// sidebar em si é uma cor sólida normal (com <alpha-value>), por isso fica em colorNames acima.
const colorNoAlphaNames = ['sidebar-border', 'sidebar-accent', 'sidebar-active', 'overlay']

const colors: Record<string, string> = { transparent: 'transparent', current: 'currentColor' }
for (const name of colorNames) colors[name] = color(name)
for (const name of colorNoAlphaNames) colors[name] = colorNoAlpha(name)

const theme = {
  colors,
  // Padrão de build antes de o BrandProvider montar: pesos da Safira (T1, modelo padrão),
  // lido de theme/models.ts (R5: nome de fonte fixo só em fonts.ts/models.ts).
  // src/components/internal/text.tsx sobrescreve em runtime pelo modelo ativo.
  fontFamily: {
    sans: [models.T1.fontFamily.normal],
  },
  spacing: {
    '0': '0px', px: '1px', '1': '4px', '2': '8px', '3': '12px', '4': '16px',
    '6': '24px', '8': '32px', '12': '48px', '16': '64px', '24': '96px',
    section: '32px', fields: '16px',
    'control-sm': '44px', 'control-md': '48px', 'control-lg': '52px', touch: '44px',
    'icon-sm': '16px', 'icon-md': '20px', 'icon-lg': '24px', header: '56px',
    'chart-sm': '192px', 'chart-md': '256px',
  },
  fontSize: {
    xs: ['12px', { lineHeight: '16px', letterSpacing: '0.12px' }] as FontSizeEntry,
    sm: ['14px', { lineHeight: '20px', letterSpacing: '0px' }] as FontSizeEntry,
    base: ['16px', { lineHeight: '24px', letterSpacing: '0px' }] as FontSizeEntry,
    lg: ['17px', { lineHeight: '26px', letterSpacing: '-0.085px' }] as FontSizeEntry,
    xl: ['18px', { lineHeight: '26px', letterSpacing: '-0.18px' }] as FontSizeEntry,
    '2xl': ['21px', { lineHeight: '28px', letterSpacing: '-0.315px' }] as FontSizeEntry,
    '3xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.48px' }] as FontSizeEntry,
  },
  fontWeight: { normal: '400', medium: '500', semibold: '600' },
  // NativeWind converte rem com inlineRem = 14 (não 16); declarado em px direto, fora de
  // extend, mesma convenção de spacing/fontSize acima.
  maxWidth: {
    none: 'none',
    full: '100%',
    '3xl': '768px',
  },
  borderRadius: {
    control: 'var(--radius-control)', item: 'var(--radius-item)', surface: 'var(--radius-surface)',
    block: 'var(--radius-block)', avatar: 'var(--radius-avatar)', full: '9999px', none: '0px',
  },
  boxShadow: {
    sm: '0px 1px 2px rgb(var(--shadow-color) / var(--shadow-opacity-sm))',
    md: '0px 2px 8px rgb(var(--shadow-color) / var(--shadow-opacity-md))',
    lg: '0px 12px 32px rgb(var(--shadow-color) / var(--shadow-opacity-lg))',
    none: 'none',
  },
  flex: {
    1: '1 1 0%', auto: '1 1 auto', initial: '0 1 auto', none: 'none',
    3: '3 3 0%', 7: '7 7 0%',
  },
}

const rendraPreset = {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- node_modules/nativewind/preset/package.json aponta para um .d.ts vazio (nao e um modulo ES); import default nao tipa (TS2306), confirmado neste projeto
  presets: [require('nativewind/preset')],
  theme,
}

export default rendraPreset

// CommonJS puro: o `tailwind.config.js` de quem instala o pacote é carregado pelo Node do Metro
// via `require('@rendra-ui/app/tailwind-preset')`. `export default` sozinho compilaria para
// `exports.default = rendraPreset`, e o `require()` do consumidor devolveria `{ default: ... }`,
// sem tema. A reatribuição abaixo troca `module.exports` inteiro pelo objeto, então tanto
// `import rendraPreset from '...'` (interop de `default`) quanto `require('...')` direto
// devolvem o mesmo preset.
module.exports = rendraPreset
