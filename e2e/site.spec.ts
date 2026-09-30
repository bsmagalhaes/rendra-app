import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

// Mesmo desvio H3 dos demais scripts: tsconfig.json restringe `types` a `["jest"]`.
const { existsSync } = require('fs') as { existsSync: (caminho: string) => boolean }
const { join } = require('path') as { join: (...partes: string[]) => string }

const DESKTOP_MIN = 900

test.describe('página de apresentação', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./')
  })

  test('não tem rolagem horizontal', async ({ page }) => {
    const largo = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
    expect(largo).toBe(false)
  })

  test('metadados de SEO e AEO', async ({ page }) => {
    await expect(page).toHaveTitle(/Rendra App/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://bsmagalhaes.github.io/rendra-ui-app/',
    )
    const robots = await page.locator('meta[name="robots"]').evaluateAll((ms) => ms.map((m) => m.getAttribute('content')))
    expect(robots).toEqual(expect.arrayContaining(['index, follow', 'noai, noimageai']))
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /og-image\.png$/)
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents()
    const tipos = ld.flatMap((t) => {
      const j = JSON.parse(t) as { '@type': string } | Array<{ '@type': string }>
      return (Array.isArray(j) ? j : [j]).map((x) => x['@type'])
    })
    expect(tipos).toContain('SoftwareSourceCode')
  })

  test('iframe da demo só a partir de 900 px; abaixo, imagem com link', async ({ page }) => {
    const largura = page.viewportSize()!.width
    const frame = page.locator('iframe[name="demo"]')
    if (largura >= DESKTOP_MIN) {
      await expect(frame).toHaveAttribute('title', /Demonstração do Rendra App/)
      await expect(frame).toHaveAttribute('src', /demo\/\?codigo=T1-C1/)
      await expect(page.frameLocator('iframe[name="demo"]').getByTestId('rendra-T1-C1')).toBeVisible()
    } else {
      await expect(frame).toHaveCount(0)
      await expect(page.locator('a.phone-link[href="demo/"] img')).toBeVisible()
    }
  })

  test('controles de modelo trocam o endereço do iframe (desktop)', async ({ page }) => {
    test.skip(page.viewportSize()!.width < DESKTOP_MIN, 'sem iframe no celular')
    const botao = page.getByRole('button', { name: 'Modelo Aurora' })
    await botao.click()
    await expect(botao).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('iframe[name="demo"]')).toHaveAttribute('src', /codigo=T3-C1/)
  })

  test('sem violação séria ou crítica de acessibilidade', async ({ page }) => {
    await page.waitForLoadState('load')
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .exclude('.phone iframe')
      .analyze()
    expect(violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')).toEqual([])
  })

  test('toda seção tem "Ver demo" e todo link interno responde 200 e existe como o Pages resolve', async ({ page, request }) => {
    const secoes = page.locator('main > section')
    const total = await secoes.count()
    expect(total).toBeGreaterThanOrEqual(8)
    for (let i = 0; i < total; i += 1) {
      await expect(secoes.nth(i).locator('a.ver-demo').first()).toBeAttached()
    }
    const origem = new URL(page.url()).origin
    const hrefs = await page.locator('a[href]').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href))
    const internos = [...new Set(hrefs.filter((h) => h.startsWith(origem)).map((h) => h.split('#')[0]!))]
    for (const href of internos) {
      const resposta = await request.get(href)
      expect(resposta.status(), href).toBe(200)
      // O `serve` responde `x/` com `x.html`; o GitHub Pages não. Confere a semântica do Pages no disco (achado B11).
      const caminho = decodeURIComponent(new URL(href).pathname).replace(/^\//, '')
      const noDisco = join(process.cwd(), '.pages', caminho)
      const existe =
        caminho.endsWith('/') || caminho === ''
          ? existsSync(join(noDisco, 'index.html'))
          : existsSync(`${noDisco}.html`) || existsSync(join(noDisco, 'index.html')) || existsSync(noDisco)
      expect(existe, `${href} não existe como o GitHub Pages resolve`).toBe(true)
    }
  })

  test('links que saem da página abrem em nova aba; os da própria demo ficam na mesma aba', async ({ page }) => {
    const origem = new URL(page.url()).origin
    const links = await page
      .locator('a[href]')
      .evaluateAll((as) => as.map((a) => ({ href: (a as HTMLAnchorElement).href, alvo: a.getAttribute('target'), rel: a.getAttribute('rel') })))
    for (const l of links.filter((x) => x.href.startsWith('http') && !x.href.startsWith(origem))) {
      expect(l.alvo, l.href).toBe('_blank')
      expect(l.rel ?? '', l.href).toContain('noopener')
    }
    for (const l of links.filter((x) => x.href.startsWith(origem))) {
      expect(l.alvo, l.href).toBeNull()
    }
  })

  test('nenhum texto público promete preço ou gratuidade futura', async ({ page }) => {
    const texto = (await page.locator('body').innerText()).toLowerCase()
    for (const proibido of ['sem versão paga', 'sempre gratuito', 'sem assinatura', 'grátis', 'para sempre']) {
      expect(texto, proibido).not.toContain(proibido)
    }
  })

  test('lightbox abre pela galeria e fecha com Esc', async ({ page }) => {
    await page.locator('#galeria button.thumb').first().click()
    const dialogo = page.getByRole('dialog')
    await expect(dialogo).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialogo).toBeHidden()
  })

  test('deep link ?imagem= abre o lightbox', async ({ page }) => {
    await page.goto('./?imagem=safira-home-mobile')
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('FAQ espelhada no JSON-LD', async ({ page }) => {
    const perguntas = await page.locator('#faq details summary').allTextContents()
    expect(perguntas.length).toBeGreaterThanOrEqual(4)
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents()
    const faq = ld
      .map((t) => JSON.parse(t) as { '@type'?: string; mainEntity?: Array<{ name: string }> })
      .find((j) => j['@type'] === 'FAQPage')
    expect(faq?.mainEntity?.map((q) => q.name)).toEqual(perguntas.map((p) => p.trim()))
  })
})
