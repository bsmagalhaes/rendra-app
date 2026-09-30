// e2e/helpers.ts
import type { Page } from '@playwright/test'

/**
 * Toast (`toast.tsx`, `FadeInUp`) e Modal (`modal.tsx`, `withTiming` de opacidade) têm entrada
 * própria de 200 ms com fade: a `View` com o papel/testID já existe no DOM assim que o
 * `waitFor`/`toBeVisible` resolve (o nó nasce de imediato, só a opacidade do ancestral animado
 * sobe de 0 a 1), então rodar o axe nesse instante pode acontecer em qualquer ponto da rampa,
 * não só no fim dela. Cor de primeiro plano e de fundo passando pelo mesmo `opacity` < 1 se
 * misturam com o que está atrás e o contraste medido some varia (comprovado localmente: rodando
 * o axe de verdade logo após o `waitFor`, sem qualquer CPU throttling, o toast e o Modal de
 * formulário reproduzem `color-contrast` em 100% das tentativas, com `contrastRatio` e cores
 * diferentes a cada rodada, a assinatura exata do achado de CI). Esta função espera a opacidade
 * combinada (o próprio nó vezes cada ancestral, até `body`) chegar a 1 de verdade antes do axe
 * rodar, em vez de confiar só na presença do nó no DOM.
 *
 * O seletor precisa apontar o nó que realmente anima (ou um descendente dele, porque a conta
 * sobe pelos ancestrais). Dois seletores genéricos davam falso "pronto": `[role="dialog"]` casa
 * primeiro o invólucro do `RNModal` (react-native-web, `animationType="none"`, opacidade 1 desde
 * o início) e `[data-testid^="toast-"]` casa primeiro o `toast-host`, que também não anima. Por
 * isso os testes usam `MODAL_CARD` (o cartão dentro de `Animated.View`, `modal.tsx`) e
 * `TOAST_ITEM` (o toast dentro do `Animated.View` de `FadeInUp`, `toast.tsx`), e a função falha
 * alto se o seletor não achar exatamente um nó.
 */
export const MODAL_CARD = '[role="dialog"][data-rendra]'
export const TOAST_ITEM = '[data-testid^="toast-"]:not([data-testid="toast-host"])'

export async function waitForFullOpacity(page: Page, selector: string) {
  await page.waitForFunction((sel) => {
    const found = document.querySelectorAll(sel)
    if (found.length !== 1) return false
    const el = found[0]
    let node: Element | null = el
    let combined = 1
    while (node && node !== document.body) {
      const value = Number.parseFloat(getComputedStyle(node).opacity)
      if (!Number.isNaN(value)) combined *= value
      node = node.parentElement
    }
    return combined >= 0.999
  }, selector)
}
