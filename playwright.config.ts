import { defineConfig, devices } from '@playwright/test'

const WIDTHS = [360, 390]
const MODEL_CODES = ['T1-C1', 'T2-C2', 'T3-C3', 'T1-C4']

export default defineConfig({
  testDir: './e2e',
  // A5 (matriz 21 rotas x 16 projetos): os casos são independentes, então rodam em paralelo.
  // `workers` fica no padrão do Playwright; se o `verify` do CI passar de 25 min, decidir aí.
  fullyParallel: true,
  webServer: {
    command: 'npm run pages:stage && npx serve .pages -l 4173',
    port: 4173,
    reuseExistingServer: !process.env.CI,
  },
  // Barra final obrigatória: com `baseURL` sem barra final, `page.goto('/rota')` (com barra
  // inicial) é resolvido pela regra padrão de URL (RFC 3986) como caminho absoluto a partir da
  // origem, descartando o path do baseURL inteiro (bug confirmado
  // na execução da Tarefa F2).
  // Os testes (F2/F3) navegam com caminho relativo sem barra inicial (`page.goto('tokens?...')`),
  // que soma corretamente ao baseURL só quando ele termina em barra.
  use: { baseURL: 'http://localhost:4173/rendra-ui-app/demo/' },
  projects: [
    ...WIDTHS.flatMap((width) =>
      MODEL_CODES.map((codigo) => ({
        name: `w${width}-${codigo}-light`,
        use: { ...devices['Desktop Chrome'], viewport: { width, height: 800 }, colorScheme: 'light' as const },
        metadata: { codigo, mode: 'light' },
        testIgnore: /site\.spec\.ts/,
      })),
    ),
    ...WIDTHS.flatMap((width) =>
      MODEL_CODES.map((codigo) => ({
        name: `w${width}-${codigo}-dark`,
        use: { ...devices['Desktop Chrome'], viewport: { width, height: 800 }, colorScheme: 'dark' as const },
        metadata: { codigo, mode: 'dark' },
        testIgnore: /site\.spec\.ts/,
      })),
    ),
    // site:inicio (página de apresentação na raiz do Pages, docs/index.html, fora da matriz modelo x paleta)
    {
      name: 'site-desktop',
      testMatch: /site\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 }, baseURL: 'http://localhost:4173/rendra-ui-app/' },
    },
    {
      name: 'site-mobile',
      testMatch: /site\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        baseURL: 'http://localhost:4173/rendra-ui-app/',
      },
    },
    // site:fim
  ],
})
