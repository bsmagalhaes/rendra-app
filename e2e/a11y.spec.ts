// e2e/a11y.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { blockingViolations } from '../src/lib/axe-false-positives'

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

for (const route of ROUTES) {
  test(`${route}: sem violação WCAG 2.1 AA serious/critical`, async ({ page }, testInfo) => {
    const codigo = (testInfo.project.metadata as { codigo?: string })?.codigo ?? 'T1-C1'
    // Sem barra inicial: baseURL termina em barra (bug confirmado na Tarefa F2: `page.goto`
    // com barra inicial é resolvido como caminho absoluto a partir da origem, RFC 3986,
    // descartando o path do baseURL inteiro); `route.slice(1)` preserva o path
    // /rendra-app do baseURL na navegação.
    await page.goto(`${route.slice(1)}?codigo=${codigo}`)
    await page.getByTestId(`rendra-${codigo}`).waitFor()
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    const blocking = blockingViolations(results.violations)
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([])
  })
}

test('axe na folha do Select com busca focada, em /componentes/formulario', async ({ page }) => {
  const codigo = 'T1-C1'
  await page.goto(`componentes/formulario?codigo=${codigo}`)
  await page.getByTestId(`rendra-${codigo}`).waitFor()
  // SelectExample (Tarefa 21) usa label="Categoria" sem valor selecionado; o gatilho
  // não repete o placeholder no nome acessível (Select, Tarefa 7): o nome é só "Categoria".
  await page.getByRole('combobox', { name: 'Categoria' }).click()
  await page.getByPlaceholder('Buscar...').click()
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  const serious = blockingViolations(results.violations)
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([])
})

test('axe no painel do DatePicker com dropdowns e time, em /componentes/formulario', async ({ page }) => {
  const codigo = 'T1-C1'
  await page.goto(`componentes/formulario?codigo=${codigo}`)
  await page.getByTestId(`rendra-${codigo}`).waitFor()
  await page.getByRole('button', { name: 'Data e hora do evento' }).click()
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  const serious = blockingViolations(results.violations)
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([])
})

test('axe com o Drawer aberto, em /componentes/feedback', async ({ page }) => {
  const codigo = 'T1-C1'
  await page.goto(`componentes/feedback?codigo=${codigo}`)
  await page.getByTestId(`rendra-${codigo}`).waitFor()
  await page.getByRole('button', { name: 'Abrir drawer' }).click()
  await page.getByRole('dialog', { name: 'Editar cliente' }).waitFor()
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  const serious = blockingViolations(results.violations)
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([])
})

test('axe com um toast de erro visível, em /componentes/feedback', async ({ page }) => {
  const codigo = 'T1-C1'
  await page.goto(`componentes/feedback?codigo=${codigo}`)
  await page.getByTestId(`rendra-${codigo}`).waitFor()
  await page.getByRole('button', { name: 'Mostrar erro' }).click()
  await page.getByText('Falha ao salvar').waitFor()
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  await expect(page.getByText('Falha ao salvar')).toBeVisible()
  const serious = blockingViolations(results.violations)
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([])
})

test('axe com o Modal de formulário aberto, em /componentes/feedback', async ({ page }) => {
  const codigo = 'T1-C1'
  await page.goto(`componentes/feedback?codigo=${codigo}`)
  await page.getByTestId(`rendra-${codigo}`).waitFor()
  await page.getByRole('button', { name: 'Abrir modal' }).click()
  await page.getByRole('dialog', { name: 'Novo contato' }).waitFor()
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  const serious = blockingViolations(results.violations)
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([])
})

test('axe com o Modal de informação (InfoHint) aberto, em /componentes/feedback', async ({ page }) => {
  const codigo = 'T1-C1'
  await page.goto(`componentes/feedback?codigo=${codigo}`)
  await page.getByTestId(`rendra-${codigo}`).waitFor()
  await page.getByRole('button', { name: 'Sobre: Sobre este campo' }).click()
  await page.getByRole('dialog', { name: 'Sobre este campo' }).waitFor()
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  const serious = blockingViolations(results.violations)
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([])
})

test('axe com o Tabs em modo Select, em /componentes/exibicao, largura 360', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  const codigo = 'T1-C1'
  await page.goto(`componentes/exibicao?codigo=${codigo}`)
  await page.getByTestId(`rendra-${codigo}`).waitFor()
  await page.getByRole('combobox').first().waitFor()
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  const serious = blockingViolations(results.violations)
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([])
})

test('axe com o menu do DropdownMenu aberto, em /componentes/acoes', async ({ page }) => {
  const codigo = 'T1-C1'
  await page.goto(`componentes/acoes?codigo=${codigo}`)
  await page.getByTestId(`rendra-${codigo}`).waitFor()
  // Desvio: /componentes/acoes tem 2 botoes com aria-label "Mais ações" na mesma pagina
  // (o overflow do ActionBarExample, showcase.tsx:102, e o gatilho do DropdownMenuExample,
  // showcase.tsx:106); a ordem das entradas do grupo acoes e fixa e coberta por teste
  // (showcase.test.tsx, "grupo acoes tem as 4 entradas finais": Button, ButtonGroup, ActionBar,
  // DropdownMenu), entao o gatilho do DropdownMenu e sempre o ultimo da pagina.
  await page.getByRole('button', { name: 'Mais ações' }).last().click()
  await page.getByRole('menuitem').first().waitFor()
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  const serious = blockingViolations(results.violations)
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([])
})
