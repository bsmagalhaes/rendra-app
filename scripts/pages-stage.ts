// Mesmo desvio H3 dos demais scripts (achado B2 do Opus): `require` com cast estrutural local.
const { readFileSync } = require('fs') as { readFileSync: (caminho: string, codificacao: 'utf8') => string }
const { join } = require('path') as { join: (...partes: string[]) => string }

import { rootUrlFrom, stageDirFrom, stagePages } from './lib/pages-stage'
import { siteUrlFrom } from './lib/seo-paths'
import { siteSeo } from '../src/config/seo'

/**
 * Monta em `.pages/<repositório>/` a árvore que o GitHub Pages publica: a página de apresentação
 * (`docs/`) na raiz e o export da demo (`dist/`) em `demo/`. É a mesma árvore que o Playwright e o
 * `docs:images` servem, então o que se testa é o que vai ao ar.
 */
function main(): void {
  const appJson = JSON.parse(readFileSync(join(process.cwd(), 'app.json'), 'utf8')) as {
    expo: { experiments?: { baseUrl?: string } }
  }
  const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as { homepage?: string }
  const baseUrl = appJson.expo.experiments?.baseUrl ?? ''
  const siteUrl = rootUrlFrom(siteUrlFrom(baseUrl, process.env.SITE_URL, pkg.homepage))
  stagePages({
    distDir: join(process.cwd(), 'dist'),
    docsDir: join(process.cwd(), 'docs'),
    outDir: join(process.cwd(), stageDirFrom(baseUrl)),
    siteUrl,
    commands: [...siteSeo.commands, 'npm install @rendra-ui/app'],
  })
  console.log(`pages-stage: OK (${siteUrl})`)
}

if ((require as unknown as { main?: unknown }).main === module) main()
