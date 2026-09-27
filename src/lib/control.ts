import { cn } from './cn'

export type ControlSize = 'sm' | 'md' | 'lg'

export const controlFrameBase =
  'flex w-full min-w-0 flex-row items-center gap-2 rounded-control border border-input bg-field text-base text-foreground'

export const controlFrameSize: Record<ControlSize, string> = {
  sm: 'h-control-sm px-3',
  md: 'h-control-md px-3',
  lg: 'h-control-lg px-4',
}

export const controlFrameFocus = 'border-ring bg-card'
export const controlFrameInvalid = 'border-destructive'
export const controlFrameDisabled = 'opacity-60'

export const controlInput = 'h-full min-w-0 flex-1 bg-transparent text-base text-foreground'

export const controlAdornmentButton =
  'flex size-control-sm shrink-0 items-center justify-center rounded-item text-muted-foreground'

export const controlAdornmentSpace = 'size-control-sm shrink-0'

export function controlFrameClasses({
  size = 'md',
  invalid = false,
  focused = false,
  disabled = false,
}: {
  size?: ControlSize
  invalid?: boolean
  focused?: boolean
  disabled?: boolean
}): string {
  return cn(
    controlFrameBase,
    controlFrameSize[size],
    focused && controlFrameFocus,
    invalid && controlFrameInvalid,
    disabled && controlFrameDisabled,
  )
}
