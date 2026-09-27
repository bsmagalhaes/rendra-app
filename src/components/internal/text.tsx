import { Text as RNText, type TextProps as RNTextProps } from 'react-native'
import { useBrand } from '../../brand/use-brand'

export interface TextProps extends RNTextProps {
  weight?: 'normal' | 'medium' | 'semibold'
}

export function Text({ weight = 'normal', style, className, ...props }: TextProps) {
  const { model } = useBrand()
  return (
    <RNText
      className={className}
      style={[{ fontFamily: model.fontFamily[weight] }, style]}
      {...props}
    />
  )
}
