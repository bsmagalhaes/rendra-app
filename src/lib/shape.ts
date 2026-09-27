export type Shape = 'square' | 'rounded' | 'pill'

export interface RoleRadius {
  control: number; item: number; surface: number; block: number; avatar: number
}

export function radiusByRole(shape: Shape, radius: number): RoleRadius {
  if (shape === 'square') return { control: 0, item: 0, surface: 0, block: 0, avatar: 0 }
  if (shape === 'pill')
    return { control: 28, item: 28, surface: radius + 12, block: radius, avatar: 9999 }
  return { control: radius - 2, item: radius - 4, surface: radius, block: radius - 4, avatar: 9999 }
}

export const shapeLabels: Record<Shape, string> = {
  square: 'Quadrado',
  rounded: 'Meio-termo',
  pill: '100% arredondado',
}
