// Mesmo desvio H3 já registrado em check-rules.ts/add-banner.ts (tsconfig.json restringe `types`
// a `["jest"]`, sem @types/node no programa): `require` com cast estrutural local.
const { chromium } = require('@playwright/test') as typeof import('@playwright/test')
const { spawn } = require('child_process') as {
  spawn: (cmd: string, args: string[], opts: { stdio: 'ignore' }) => { kill: () => void }
}
const { copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } = require('fs') as {
  copyFileSync: (de: string, para: string) => void
  mkdirSync: (path: string, options: { recursive: boolean }) => void
  readdirSync: (path: string) => string[]
  readFileSync: {
    (path: string, encoding: 'utf8'): string
    (path: string): Uint8Array
  }
  rmSync: (path: string, options: { force: boolean }) => void
  writeFileSync: (path: string, dados: Uint8Array) => void
}
const { join } = require('path') as { join: (...parts: string[]) => string }

import { imagensForaDoPadrao } from './lib/docs-images-check'
import { otimizarParaWebp, otimizarPng } from './lib/image-optimize'
import { buildOgHtml } from './lib/og-html'
import { buildPhoneFrameHtml } from './lib/phone-frame'
import { ALTURA_STATUS, CAPTURAS, SCALE_CELULAR, VIEWPORT_CELULAR } from './lib/readme-images-list'
import { resolveBaseUrl } from './lib/readme-images-base-url'
import { siteSeo } from '../src/config/seo'

// Selo da família (padrão dos produtos, seção 2.8): só a og-image do próprio Rendra o leva; um clone
// (`clean:clone` troca o `repositoryUrl`) gera a imagem sem a marca Rendra (D4).
const REPOSITORIO_RENDRA = 'https://github.com/bsmagalhaes/rendra-ui-app'
const SELO_RENDRA =
  '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44"><rect width="44" height="44" rx="10" fill="#1c1c1c" stroke="#2c2c2c"/><path d="M15 31V13h9.2a5.6 5.6 0 0 1 1.6 11L31 31" fill="none" stroke="#e8650a" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'

// Capturas cruas (sem moldura) que compõem a og-image: a home e a vitrine de componentes.
const NOMES_DA_OG_IMAGE = ['safira-home-mobile', 'safira-componentes-mobile']

// Defeito M1 do veredito Fable sobre o pacote npm: valor fixo em `/rendra-ui-app` quebrava `npm run docs:images` em qualquer clone
// (pages:stage/app.json do clean-clone usam `/${nome}`). Derivado de app.json aqui, no lugar de
// escrito à mão, para funcionar sem ajuste manual.
const appJson = JSON.parse(readFileSync(join(process.cwd(), 'app.json'), 'utf8')) as {
  expo?: { experiments?: { baseUrl?: string } }
}
const BASE_URL = resolveBaseUrl(appJson.expo?.experiments?.baseUrl, process.env.BASE_URL)

/**
 * Espera `url` responder, tentando de novo a cada segundo (até `tentativas` vezes). Mecanismo
 * próprio (achado B12 da validação do plano: `(npx serve .pages -l 4173 &) && sleep 1` não roda
 * no `npm` do Windows), em vez de um `sleep` fixo.
 */
async function aguardarServidor(url: string, tentativas = 30): Promise<void> {
  for (let tentativa = 0; tentativa < tentativas; tentativa++) {
    try {
      const resposta = await fetch(url)
      if (resposta.ok) return
    } catch {
      // servidor ainda não subiu; tenta de novo até esgotar as tentativas
    }
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  throw new Error(`readme-images: servidor em ${url} não respondeu 200 após ${tentativas}s`)
}

async function main(): Promise<void> {
  const destino = join(process.cwd(), 'docs', 'images')
  const destinoPublic = join(process.cwd(), 'public')
  mkdirSync(destino, { recursive: true })
  mkdirSync(destinoPublic, { recursive: true })

  // Só o que está em CAPTURAS fica em docs/images: as imagens antigas (por exemplo as de 1920x1080)
  // somem antes de gerar.
  const nomesAtuais = new Set(CAPTURAS.map((c) => `${c.nome}.webp`))
  for (const arquivo of readdirSync(destino)) {
    if (!nomesAtuais.has(arquivo)) rmSync(join(destino, arquivo), { force: true })
  }

  // Spawna o entrypoint do `serve` direto com `process.execPath` (node), sem `shell: true`: no
  // Windows, `spawn('npx', [...], { shell: true })` cria um `cmd.exe` intermediário, e matar esse
  // processo não encerra o `serve` que ele gerou por baixo, deixando a porta 4173 ocupada depois
  // do script terminar (achado de execução, Tarefa 15).
  const resolveModule = (require as unknown as { resolve: (id: string) => string }).resolve
  const servidor = spawn(process.execPath, [resolveModule('serve/build/main.js'), '.pages', '-l', '4173'], {
    stdio: 'ignore',
  })
  try {
    await aguardarServidor(BASE_URL)
    const browser = await chromium.launch()
    // A moldura é montada numa página em branco maior que o aparelho (a PNG com moldura mede 414x868
    // CSS px; um viewport de 390 cortaria a imagem, achado C7 do Opus), em contexto próprio.
    const contextoMoldura = await browser.newContext({ viewport: { width: 480, height: 900 }, deviceScaleFactor: SCALE_CELULAR })
    const paginaMoldura = await contextoMoldura.newPage()
    const crusParaOg = new Map<string, Uint8Array>()
    for (const captura of CAPTURAS) {
      const contexto = await browser.newContext({
        viewport: { ...VIEWPORT_CELULAR, height: VIEWPORT_CELULAR.height - ALTURA_STATUS },
        deviceScaleFactor: SCALE_CELULAR,
        isMobile: true,
        hasTouch: true,
        locale: 'pt-BR',
        timezoneId: 'America/Sao_Paulo',
        colorScheme: captura.modo === 'escuro' ? 'dark' : 'light',
      })
      const page = await contexto.newPage()
      await page.clock.setFixedTime(new Date('2026-09-29T12:00:00-03:00'))
      await page.goto(`${BASE_URL}${captura.rota}?codigo=${captura.codigo}&modo=${captura.modo}`)
      await page.waitForSelector(`[data-testid="rendra-${captura.codigo}"]`)
      await page.waitForSelector('[data-testid="rendra-splash"]', { state: 'detached' })
      await page.evaluate(async () => {
        await document.fonts.ready
      })
      // Nenhuma captura com toast visível (o `Toaster` fica sobre a barra inferior, CHANGELOG "Conhecido").
      // R4: a cor do cabeçalho da tela pinta a faixa de status da moldura (o recorte da câmera fica sobre ela).
      const corStatus = await page.evaluate(() => {
        for (const id of ['shell-cabecalho', 'safe-area-tela', 'raiz-rotas']) {
          const cor = document.querySelector('[data-testid="' + id + '"]')
          const fundo = cor ? getComputedStyle(cor).backgroundColor : ''
          if (fundo && fundo !== 'rgba(0, 0, 0, 0)') return fundo
        }
        return 'rgb(255, 255, 255)'
      })
      const tela = await page.screenshot()
      if (NOMES_DA_OG_IMAGE.includes(captura.nome)) crusParaOg.set(captura.nome, tela)
      await contexto.close()

      await paginaMoldura.setContent(buildPhoneFrameHtml(tela, corStatus))
      await paginaMoldura.locator('.phone img').evaluate((img) => (img as HTMLImageElement).decode())
      // Padrão 6.2 e regra 9 do guarda-chuva: imagem de página e README em WebP otimizado (o menor entre sem perda e com perda).
      const comMoldura = await paginaMoldura.locator('.phone').screenshot({ omitBackground: true })
      writeFileSync(join(destino, `${captura.nome}.webp`), await otimizarParaWebp(comMoldura))
    }
    await contextoMoldura.close()

    // Imagem de compartilhamento (padrão 6.2), 1200x630, composta por HTML com dois aparelhos e
    // renderizada pelo mesmo mecanismo das capturas, nunca montada à mão. Gravada em docs/ (página)
    // e copiada para public/ (`og:image` das páginas da demo).
    const contextoOg = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
    const paginaOg = await contextoOg.newPage()
    await paginaOg.setContent(
      buildOgHtml({
        produto: siteSeo.productName,
        tagline: siteSeo.tagline,
        imagens: NOMES_DA_OG_IMAGE.map((nome) => crusParaOg.get(nome) as Uint8Array),
        selo: siteSeo.repositoryUrl === REPOSITORIO_RENDRA ? SELO_RENDRA : undefined,
      }),
    )
    const ogDocs = join(process.cwd(), 'docs', 'og-image.png')
    // A og-image continua PNG (rastreadores sociais), só recomprimida sem perda.
    writeFileSync(ogDocs, await otimizarPng(await paginaOg.screenshot()))
    await contextoOg.close()
    copyFileSync(ogDocs, join(destinoPublic, 'og-image.png'))

    await browser.close()

    // Falha se sobrar imagem larga (a mesma checagem de `npm run docs:images:check`).
    const gravadas = readdirSync(destino)
      .filter((arquivo) => arquivo.endsWith('.webp'))
      .map((arquivo) => ({ nome: arquivo, bytes: readFileSync(join(destino, arquivo)) }))
    const fora = imagensForaDoPadrao(gravadas)
    if (fora.length > 0) throw new Error(`readme-images: imagem larga fora do padrão de celular: ${fora.join(', ')}`)
    console.log(`readme-images: ${CAPTURAS.length} capturas gravadas em ${destino}, og-image.png em ${destinoPublic}`)
  } finally {
    servidor.kill()
  }
}

if ((require as unknown as { main?: unknown }).main === module) {
  main().catch((erro: unknown) => {
    console.error(erro)
    process.exit(1)
  })
}
