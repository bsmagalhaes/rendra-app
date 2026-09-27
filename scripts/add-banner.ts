// Mesmo desvio H3 já registrado em check-rules.ts: tsconfig.json restringe `types` a `["jest"]`,
// então @types/node não entra no programa; `require('fs')` com cast local evita depender de
// `import ... from 'fs'` (que precisaria dos tipos de node ausentes).
const { readFileSync, writeFileSync } = require('fs') as {
  readFileSync: (path: string, encoding: 'utf8') => string
  writeFileSync: (path: string, data: string) => void
}

// `NodeJS.Module`/`module` global já declarado por `scripts/check-rules.ts` (desvio H3, mesmo
// programa TypeScript); não redeclarado aqui para não duplicar o augment global.

/**
 * Cabeçalho de licença/autoria preservado em todo arquivo JS/CSS gerado pelo build web
 * (contrato de autoria do projeto): `/*! Rendra App vX.Y.Z | MIT | © 2026 Bruno Magalhaes |
 * brunomagalhaes.me *\/`. A versão vem sempre de `package.json` no momento do build, nunca
 * escrita à mão.
 */
export function buildBanner(version: string): string {
  return `/*! Rendra App v${version} | MIT | © 2026 Bruno Magalhaes | brunomagalhaes.me */\n`
}

/**
 * Aplica `banner` no início de cada arquivo de `files`, sem duplicar se ele já começar com o
 * mesmo cabeçalho (idempotente, para builds repetidos). Devolve os arquivos efetivamente
 * alterados.
 */
export function applyBanner(files: string[], banner: string): string[] {
  const updated: string[] = []
  for (const file of files) {
    const content = readFileSync(file, 'utf8')
    if (content.startsWith(banner)) continue
    writeFileSync(file, banner + content)
    updated.push(file)
  }
  return updated
}

/**
 * Globs por destino do build: `web` (o export estático de sempre) ou `lib` (`build:lib`,
 * Tarefa 3.5, `dist-lib/**\/*.js` gerado por `tsc -p tsconfig.lib.json`). Função pura, testável
 * sem tocar disco.
 */
export function bannerGlobs(destino: 'web' | 'lib'): string[] {
  if (destino === 'lib') return ['dist-lib/**/*.js']
  return ['dist/_expo/static/js/**/*.js', 'dist/_expo/static/css/**/*.css']
}

if ((require as unknown as { main?: unknown }).main === module) {
  const { globSync } = require('glob') as typeof import('glob')
  const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string }
  const alvo: 'web' | 'lib' = process.argv.includes('--lib') ? 'lib' : 'web'
  const files = bannerGlobs(alvo).flatMap((padrao) => globSync(padrao, { posix: true }))
  if (files.length === 0) {
    console.error(
      alvo === 'lib'
        ? 'add-banner: nenhum arquivo em dist-lib/**/*.js; rode "npm run build:lib" antes.'
        : 'add-banner: nenhum arquivo em dist/_expo/static/{js,css}; rode "expo export --platform web" antes.',
    )
    process.exit(1)
  }
  const banner = buildBanner(pkg.version)
  const updated = applyBanner(files, banner)
  console.log(`add-banner: cabeçalho aplicado em ${updated.length}/${files.length} arquivo(s).`)
}
