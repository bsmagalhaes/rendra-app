export const systemColorsLight = {
  background: '#f5f6f7', foreground: '#0b1d37',
  card: '#ffffff', cardForeground: '#0b1d37',
  popover: '#ffffff', popoverForeground: '#0b1d37',
  muted: '#eaeff5', mutedForeground: '#4f5f76',
  border: '#dbe2eb', input: '#808fa4', field: '#f5f6f7',
  overlay: 'rgb(7 20 42 / 0.55)',
  // Cor do rótulo discreto do campo (item A2 do levantamento da Sincronização 1, igual ao web
  // `globals.css:70-72, 124-125`); vira --rendra-label-color em buildThemeVars pelo mesmo laço
  // que converte as demais chaves camelCase deste objeto (R2_EXCEPTIONS já cobre este arquivo).
  labelColor: '#5f6f82',
  destructive: '#b72c05', destructiveHover: '#962404', destructiveForeground: '#ffffff',
  destructiveSoft: '#fcebe6', destructiveSoftForeground: '#962404',
  success: '#157a3c', successForeground: '#ffffff',
  successSoft: '#e6f5eb', successSoftForeground: '#14632f',
  warning: '#b45309', warningForeground: '#ffffff',
  warningSoft: '#fdf2e1', warningSoftForeground: '#8a3d06',
  info: '#0e6cdb', infoForeground: '#ffffff',
  infoSoft: '#e7f0fc', infoSoftForeground: '#0b58b5',
  // Faixas do medidor do Chart gauge (igual ao web, `globals.css:731-739`); viram
  // --rendra-meter-low/mid/high em buildThemeVars pelo mesmo laço das demais chaves.
  meterLow: '#dc2626', meterMid: '#f5b400', meterHigh: '#16a34a',
} as const

export const systemColorsDark = {
  labelColor: '#94a3b8',
  destructive: '#b72c05', destructiveHover: '#cf3b0e', destructiveForeground: '#ffffff',
  destructiveSoft: '#3a1a10', destructiveSoftForeground: '#f5a48c',
  success: '#4fcb80', successForeground: '#04200f',
  successSoft: '#0f3326', successSoftForeground: '#86e0a8',
  warning: '#f2b04f', warningForeground: '#2a1702',
  warningSoft: '#362612', warningSoftForeground: '#f7c77e',
  info: '#0b6fe0', infoForeground: '#ffffff',
  infoSoft: '#11305a', infoSoftForeground: '#7fb4ef',
  meterLow: '#f05252', meterMid: '#facc15', meterHigh: '#34d399',
} as const
