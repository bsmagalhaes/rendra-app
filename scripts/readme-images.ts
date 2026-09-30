// Mesmo desvio H3 já registrado em check-rules.ts/add-banner.ts (tsconfig.json restringe `types`
// a `["jest"]`, sem @types/node no programa): `require` com cast estrutural local.
const { chromium } = require('@playwright/test') as typeof import('@playwright/test')
const { spawn } = require('child_process') as {
  spawn: (cmd: string, args: string[], opts: { stdio: 'ignore' }) => { kill: () => void }
}
const { mkdirSync, readFileSync } = require('fs') as {
  mkdirSync: (path: string, options: { recursive: boolean }) => void
  readFileSync: (path: string, encoding: 'utf8') => string
}
const { join } = require('path') as { join: (...parts: string[]) => string }

import { resolveBaseUrl } from './lib/readme-images-base-url'

interface Captura {
  nome: string
  rota: string
  codigo: string
  modo: 'claro' | 'escuro'
  largura: number
  altura: number
  escala: number
}

// Defeito M1 do veredito Fable sobre o pacote npm: valor fixo em `/rendra-ui-app` quebrava `npm run docs:images` em qualquer clone
// (pages:stage/app.json do clean-clone usam `/${nome}`). Derivado de app.json aqui, no lugar de
// escrito à mão, para funcionar sem ajuste manual.
const appJson = JSON.parse(readFileSync(join(process.cwd(), 'app.json'), 'utf8')) as {
  expo?: { experiments?: { baseUrl?: string } }
}
const BASE_URL = resolveBaseUrl(appJson.expo?.experiments?.baseUrl, process.env.BASE_URL)

// Nome de arquivo é `<modelo>-<tela>[-mobile][-escuro]` (padrão 6.2). `T1-C4` é o modelo Safira
// (`src/theme/models.ts`) com a paleta Ardósia, não um modelo "ardósia" à parte (achado C12 da
// validação do plano): o nome do arquivo é `safira-galeria`, não `ardosia-galeria`.
const CAPTURAS: Captura[] = [
  { nome: 'safira-componentes', rota: '/componentes', codigo: 'T1-C1', modo: 'claro', largura: 1920, altura: 1080, escala: 1 },
  { nome: 'equilibrio-componentes', rota: '/componentes', codigo: 'T2-C2', modo: 'claro', largura: 1920, altura: 1080, escala: 1 },
  { nome: 'aurora-componentes', rota: '/componentes', codigo: 'T3-C3', modo: 'claro', largura: 1920, altura: 1080, escala: 1 },
  { nome: 'safira-componentes-mobile', rota: '/componentes', codigo: 'T1-C1', modo: 'claro', largura: 390, altura: 844, escala: 2 },
  { nome: 'aurora-galeria-mobile', rota: '/galeria', codigo: 'T3-C3', modo: 'claro', largura: 390, altura: 844, escala: 2 },
  { nome: 'equilibrio-tokens-mobile', rota: '/tokens', codigo: 'T2-C2', modo: 'claro', largura: 390, altura: 844, escala: 2 },
  { nome: 'safira-escuro', rota: '/componentes', codigo: 'T1-C1', modo: 'escuro', largura: 1920, altura: 1080, escala: 1 },
  { nome: 'aurora-escuro-mobile', rota: '/componentes', codigo: 'T3-C3', modo: 'escuro', largura: 390, altura: 844, escala: 2 },
  { nome: 'safira-galeria', rota: '/galeria', codigo: 'T1-C4', modo: 'claro', largura: 1920, altura: 1080, escala: 1 },
]

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
    for (const captura of CAPTURAS) {
      const page = await browser.newPage({
        viewport: { width: captura.largura, height: captura.altura },
        deviceScaleFactor: captura.escala,
      })
      await page.goto(`${BASE_URL}${captura.rota}?codigo=${captura.codigo}&modo=${captura.modo}`)
      await page.waitForSelector(`[data-testid="rendra-${captura.codigo}"]`)
      await page.waitForSelector('[data-testid="rendra-splash"]', { state: 'detached' })
      await page.evaluate(async () => {
        await document.fonts.ready
      })
      await page.screenshot({ path: join(destino, `${captura.nome}.png`) })
      await page.close()
    }

    // Imagem de compartilhamento (padrão 6.2), 1200x630, gerada pelo mesmo mecanismo das
    // capturas, nunca montada à mão.
    const paginaOgImage = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
    await paginaOgImage.goto(`${BASE_URL}/galeria?codigo=T1-C1&modo=claro`)
    await paginaOgImage.waitForSelector('[data-testid="rendra-T1-C1"]')
    await paginaOgImage.waitForSelector('[data-testid="rendra-splash"]', { state: 'detached' })
    await paginaOgImage.evaluate(async () => {
      await document.fonts.ready
    })
    await paginaOgImage.screenshot({ path: join(destinoPublic, 'og-image.png') })
    await paginaOgImage.close()

    await browser.close()
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
