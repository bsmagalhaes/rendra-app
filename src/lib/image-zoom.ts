/**
 * Funcoes puras do zoom do `ImageViewer` (F3). Todas levam `'worklet'`: sao chamadas de dentro
 * de gesto e de `useAnimatedStyle`, e uma funcao sem a diretiva roda no export web e sob Jest mas
 * quebra no Android real (licao 3 do levantamento).
 */

export const IMAGE_MIN_ZOOM = 1
export const IMAGE_MAX_ZOOM = 3

/** Limita a escala entre `min` (1) e `max` (3). */
export function imageZoomClamp(scale: number, min: number = IMAGE_MIN_ZOOM, max: number = IMAGE_MAX_ZOOM): number {
  'worklet'
  return Math.min(max, Math.max(min, scale))
}

/** Limita o deslocamento ao que a imagem ampliada ainda cobre: `(tamanho * escala - tamanho) / 2`. */
export function imagePanClamp(translate: number, scale: number, size: number): number {
  'worklet'
  const limit = Math.max(0, (size * scale - size) / 2)
  return Math.min(limit, Math.max(-limit, translate))
}

/** Toque duplo: sem zoom vai para 2x; ampliado, volta para 1x. */
export function imageZoomToggle(scale: number): number {
  'worklet'
  return scale > IMAGE_MIN_ZOOM ? IMAGE_MIN_ZOOM : 2
}
