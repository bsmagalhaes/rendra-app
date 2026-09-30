import { expect, test } from '@playwright/test'

const PREFIXO = '/rendra-ui-app/demo/'

test.describe('demo em subcaminho', () => {
  test('abre em /demo/, mantém o prefixo ao navegar e ao voltar, sem 404 de asset', async ({ page }) => {
    const falhas: string[] = []
    page.on('response', (r) => {
      if (r.status() >= 400) falhas.push(`${r.status()} ${r.url()}`)
    })

    await page.goto('./?codigo=T1-C1')
    await expect(page).toHaveURL(new RegExp(PREFIXO))
    await expect(page.getByTestId('rendra-T1-C1')).toBeVisible()

    await page.goto('componentes?codigo=T1-C1')
    await expect(page.getByTestId('rendra-T1-C1')).toBeVisible()
    const hrefs = await page.locator('a[href^="/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href') ?? ''))
    expect(hrefs.length).toBeGreaterThan(0)
    for (const href of hrefs) expect(href.startsWith(PREFIXO), href).toBe(true)

    await page.locator('a[href*="/componentes/"]').first().click()
    await expect(page).toHaveURL(new RegExp(`${PREFIXO}componentes/[a-z-]+`))
    await page.goBack()
    await expect(page).toHaveURL(new RegExp(`${PREFIXO}componentes(\\?[^/]*)?$`))

    expect(falhas).toEqual([])
  })
})
