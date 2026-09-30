import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * Espera o overlay do `RendraSplash` sair da árvore. Ele não captura toque (`pointer-events:
 * none`), mas fica por cima do conteúdo por cerca de 1,2 s e o axe mede contraste com a opacidade
 * dele em rampa; todo spec chama isto logo depois de esperar a raiz `rendra-<codigo>`.
 */
export async function semSplash(page: Page) {
  await expect(page.getByTestId('rendra-splash')).toHaveCount(0, { timeout: 15000 })
}
