export type Space = '0' | '1' | '2' | '3' | '4' | '6' | '8' | '12' | '16' | '24' | 'section' | 'fields'

export const gapClass: Record<Space, string> = {
  '0': 'gap-0',
  '1': 'gap-1',
  '2': 'gap-2',
  '3': 'gap-3',
  '4': 'gap-4',
  '6': 'gap-6',
  '8': 'gap-8',
  '12': 'gap-12',
  '16': 'gap-16',
  '24': 'gap-24',
  section: 'gap-8',
  fields: 'gap-4',
}

export const alignClass = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
} as const

export const justifyClass = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
} as const

export type Align = keyof typeof alignClass
export type Justify = keyof typeof justifyClass

export type FieldSpan = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'

// Diferença RN (spec:362): sem container queries, todo campo ocupa a linha inteira na F1;
// o valor de span fica reservado para a F2 (AppShell com telas largas).
export const fieldSpanClass: Record<FieldSpan, string> = {
  xs: 'w-full',
  sm: 'w-full',
  md: 'w-full',
  lg: 'w-full',
  xl: 'w-full',
  full: 'w-full',
}
