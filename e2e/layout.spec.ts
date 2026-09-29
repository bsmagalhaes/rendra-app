// e2e/layout.spec.ts
import { test, expect } from '@playwright/test'

const ROUTES = [
  '/componentes',
  '/componentes/acoes',
  '/componentes/layout',
  '/componentes/feedback',
  '/componentes/formulario',
  '/componentes/exibicao',
  '/tokens',
  '/galeria',
]

// `route` mantém a barra inicial só para nomear o teste (`/tokens: ...`); a navegação usa
// `route.slice(1)` (sem a barra inicial), porque `baseURL` termina em barra (bug confirmado na
// Tarefa F2): um `page.goto` com barra inicial é resolvido como caminho absoluto a partir da
// origem (RFC 3986), descartando o path `/rendra-ui-app` do baseURL inteiro.
for (const route of ROUTES) {
  test(`${route}: sem rolagem horizontal`, async ({ page }, testInfo) => {
    const codigo = (testInfo.project.metadata as { codigo?: string })?.codigo ?? 'T1-C1'
    await page.goto(`${route.slice(1)}?codigo=${codigo}`)
    await page.getByTestId(`rendra-${codigo}`).waitFor() // espera hidratação (testID posto pelo BrandProvider, Tarefa B16)
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const viewportWidth = page.viewportSize()!.width
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth)
  })

  test(`${route}: todo elemento interativo mede pelo menos 44x44 CSS px`, async ({ page }, testInfo) => {
    const codigo = (testInfo.project.metadata as { codigo?: string })?.codigo ?? 'T1-C1'
    await page.goto(`${route.slice(1)}?codigo=${codigo}`)
    await page.getByTestId(`rendra-${codigo}`).waitFor()
    const roles = ['button', 'link', 'checkbox', 'radio', 'switch', 'tab', 'combobox', 'slider', 'menuitem', 'textbox']
    for (const role of roles) {
      const elements = page.getByRole(role as 'button' | 'link')
      const count = await elements.count()
      for (let i = 0; i < count; i++) {
        const box = await elements.nth(i).boundingBox()
        if (!box) continue
        expect(box.width, `${route} role=${role} índice ${i}, largura`).toBeGreaterThanOrEqual(44)
        expect(box.height, `${route} role=${role} índice ${i}, altura`).toBeGreaterThanOrEqual(44)
      }
    }
  })

  // Tarefa 6.4 (achado C5 do veredito do Opus, secao 3.2 item 4 do levantamento): a raiz do
  // BrandProvider carrega data-rendra-root e data-label no export web em toda rota.
  test(`${route}: [data-rendra-root] com data-label="discreto" presente na raiz`, async ({ page }, testInfo) => {
    const codigo = (testInfo.project.metadata as { codigo?: string })?.codigo ?? 'T1-C1'
    await page.goto(`${route.slice(1)}?codigo=${codigo}`)
    await page.getByTestId(`rendra-${codigo}`).waitFor()
    const raiz = page.locator('[data-rendra-root]')
    await expect(raiz).toHaveAttribute('data-label', 'discreto')
  })
}

test('criterio 7: trocar modelo pelo controle real da /galeria muda o testID da raiz', async ({ page }) => {
  // B3 (veredito do Opus): esta tarefa substitui o caso antigo, que clicava no Link de texto
  // T3-C4 (12 Links removidos pela Tarefa 10 do lote 4, /galeria agora usa ButtonGroup real).
  await page.goto('galeria?codigo=T1-C1')
  await page.getByTestId('rendra-T1-C1').waitFor()
  await page.getByRole('radiogroup', { name: 'Modelo' }).getByRole('radio', { name: 'Aurora' }).click()
  await page.getByTestId('rendra-T3-C1').waitFor()
  await expect(page.getByTestId('rendra-T1-C1')).toHaveCount(0)
})

test('tokens: ?modo=escuro/claro aplica o modo sem recarregar (critério 7, via URL nesta entrega)', async ({ page }) => {
  // C12 (veredito do Opus): a /galeria já tem controle real de modelo/paleta/modo (Tarefa 10),
  // provado pelo caso do critério 7 acima; ?modo= continua coberto por URL nesta rota (/tokens),
  // que não tem controle de UI proprio para o modo.
  // Correção da rodada 4 de validação, bloqueadora 1: mede a variável CSS --background do nó
  // com data-testid^="rendra-" (o único que o app controla de fato), nunca o fundo do body
  // (que o app não controla) nem corre contra o efeito assíncrono do ModelCodeFromUrl.
  const bg = () => page.evaluate(() =>
    getComputedStyle(document.querySelector('[data-testid^="rendra-"]')!).getPropertyValue('--rendra-background').trim())
  await page.goto('tokens?modo=claro')
  await page.getByTestId('rendra-T1-C1').waitFor()
  await expect.poll(bg).not.toBe('')
  const light = await bg()
  await page.goto('tokens?modo=escuro')
  await page.getByTestId('rendra-T1-C1').waitFor()
  await expect.poll(bg).not.toBe(light)
})

test('galeria: escolha de modelo via ?codigo= persiste depois de recarregar a página (H3 Passo 6, automatizado)', async ({ page }) => {
  await page.goto('galeria?codigo=T2-C3')
  await page.getByTestId('rendra-T2-C3').waitFor()
  // Melhoria da rodada 4 de validação: removido o page.reload() redundante daqui; o
  // page.goto('galeria') logo abaixo já é, sozinho, uma navegação completa sem ?codigo= na
  // URL, suficiente para provar a persistência via AsyncStorage.
  await page.goto('galeria')
  await page.getByTestId('rendra-T2-C3').waitFor()
})

test('componentes/acoes: selo BTN-001 do catalogo visivel ao lado do Button (Tarefa 1.3, achado C5 do Opus)', async ({ page }) => {
  await page.goto('componentes/acoes?codigo=T1-C1')
  await page.getByTestId('rendra-T1-C1').waitFor()
  await expect(page.getByText('BTN-001')).toBeVisible()
})

test('componentes/exibicao: selo ABA-001 do catalogo visivel ao lado do Tabs (Tarefa 1.3, achado C5 do Opus)', async ({ page }) => {
  await page.goto('componentes/exibicao?codigo=T1-C1')
  await page.getByTestId('rendra-T1-C1').waitFor()
  await expect(page.getByText('ABA-001')).toBeVisible()
})

// Tarefa 6.4 (achado C5 do veredito do Opus, secao 3.2 do levantamento): o data-rendra chega ao
// DOM do export web via dataSet, distinto do selo textual (Tarefa 1.3) na vitrine.
test('componentes/acoes: [data-rendra="BTN-001"] visivel (achado C5 do Opus)', async ({ page }) => {
  await page.goto('componentes/acoes?codigo=T1-C1')
  await page.getByTestId('rendra-T1-C1').waitFor()
  await expect(page.locator('[data-rendra="BTN-001"]').first()).toBeVisible()
})

test('componentes/exibicao: [data-rendra="ABA-001"] visivel (achado C5 do Opus)', async ({ page }) => {
  await page.goto('componentes/exibicao?codigo=T1-C1')
  await page.getByTestId('rendra-T1-C1').waitFor()
  await expect(page.locator('[data-rendra="ABA-001"]').first()).toBeVisible()
})

test('componentes/formulario: [data-rendra="FLD-001"] visivel (achado C5 do Opus)', async ({ page }) => {
  await page.goto('componentes/formulario?codigo=T1-C1')
  await page.getByTestId('rendra-T1-C1').waitFor()
  await expect(page.locator('[data-rendra="FLD-001"]').first()).toBeVisible()
})

test('formulario: Select com lista maior que a folha rola até o último item, no web (bloqueador do veredito do fechamento)', async ({ page }) => {
  await page.goto('componentes/formulario')
  await page.getByTestId('rendra-T1-C1').waitFor()
  const trigger = page.getByRole('combobox', { name: 'Estado' })
  await trigger.click()
  const listboxId = await trigger.getAttribute('aria-controls')
  const listbox = page.locator(`#${listboxId}`)
  const lastOption = listbox.getByText('Tocantins', { exact: true })
  // Antes de rolar, a lista tem 27 estados e a folha não cabe todos: o último item ainda não
  // está visível (sem isso a asserção seguinte não provaria rolagem nenhuma).
  await expect(lastOption).not.toBeInViewport()
  await listbox.hover()
  await page.mouse.wheel(0, 4000)
  await expect(lastOption).toBeInViewport()
})
