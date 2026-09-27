// Mesmo desvio H3 já registrado em check-rules.ts (tsconfig.json restringe `types` a `["jest"]`,
// sem @types/node no programa): `require` com cast estrutural local em vez de `import ... from
// 'fs'/'path'` (que exigiriam os tipos de node ausentes). `typeof import('fs')`/`typeof import('path')`
// também falham (`TS2591: Cannot find name 'fs'`), então o cast lista só as funções usadas, igual a
// `scripts/add-banner.ts`.
const { readFileSync } = require('fs') as {
  readFileSync: (path: string, encoding: 'utf8') => string
}
const { join } = require('path') as { join: (...parts: string[]) => string }
import { buildBanner } from './add-banner'

// `NodeJS.Module`/`module` global já declarado por `scripts/check-rules.ts` (desvio H3, mesmo
// programa TypeScript); não redeclarado aqui para não duplicar o augment global.

/**
 * Varre `baseDir/dist/_expo/static/{js,css}` de forma recursiva (mesmo glob de
 * `scripts/add-banner.ts:41-44`), devolvendo todo `.js`/`.css` gerado, em qualquer subpasta.
 * Lista vazia (por exemplo, `dist/` ausente) é devolvida como está: quem chama decide o que
 * fazer com ela, nunca aprova em silêncio (achado B1 da validação da entrega, Tarefa 8).
 */
export function collectBuildFiles(baseDir: string): string[] {
  const { globSync } = require('glob') as typeof import('glob')
  return [
    ...globSync('dist/_expo/static/js/**/*.js', { cwd: baseDir, absolute: true, posix: true }),
    ...globSync('dist/_expo/static/css/**/*.css', { cwd: baseDir, absolute: true, posix: true }),
  ]
}

/**
 * Confere o cabeçalho de autoria em cada arquivo de `files`. Lista vazia devolve `ok: false`
 * (nenhum arquivo encontrado nunca é sucesso, achado B1 da validação da entrega).
 */
export function checkBannerOnFiles(files: string[], cabecalho: string): { ok: boolean; semCabecalho: string[] } {
  if (files.length === 0) return { ok: false, semCabecalho: [] }
  const semCabecalho: string[] = []
  for (const arquivo of files) {
    const conteudo = readFileSync(arquivo, 'utf8')
    if (!conteudo.startsWith(cabecalho)) semCabecalho.push(arquivo)
  }
  return { ok: semCabecalho.length === 0, semCabecalho }
}

if ((require as unknown as { main?: unknown }).main === module) {
  const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as { version: string }
  const cabecalho = buildBanner(pkg.version)
  const arquivos = collectBuildFiles(process.cwd())
  if (arquivos.length === 0) {
    console.error(
      'verify-build: nenhum arquivo .js/.css em dist/_expo/static; rode "expo export --platform web" antes.',
    )
    process.exit(1)
  }
  const resultado = checkBannerOnFiles(arquivos, cabecalho)
  if (!resultado.ok) {
    console.error(`verify-build: arquivos sem cabecalho de autoria:\n${resultado.semCabecalho.join('\n')}`)
    process.exit(1)
  }
  console.log('verify-build: OK')
}
