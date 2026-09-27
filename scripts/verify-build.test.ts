// Sem @types/node no programa (tsconfig.json restringe `types` a `["jest"]`, desvio H3 já
// registrado em check-rules.ts): `require` com cast local em vez de `import ... from 'fs'/'os'/'path'`.
const { mkdtempSync, writeFileSync, mkdirSync, rmSync } = require('fs') as {
  mkdtempSync: (prefix: string) => string
  writeFileSync: (path: string, data: string) => void
  mkdirSync: (path: string, options: { recursive: boolean }) => void
  rmSync: (path: string, options: { recursive: boolean; force: boolean }) => void
}
const { tmpdir } = require('os') as { tmpdir: () => string }
const { join } = require('path') as { join: (...parts: string[]) => string }
import { collectBuildFiles, checkBannerOnFiles } from './verify-build'
import { buildBanner } from './add-banner'

describe('collectBuildFiles (achado B1, validacao da entrega)', () => {
  it('devolve lista vazia quando nao existe dist/, em vez de aprovar em silencio', () => {
    const baseDir = mkdtempSync(join(tmpdir(), 'verify-build-semdist-'))
    const arquivos = collectBuildFiles(baseDir)
    rmSync(baseDir, { recursive: true, force: true })
    expect(arquivos).toEqual([])
  })

  it('acha arquivo js sem cabecalho mesmo dentro de subpasta (glob recursivo)', () => {
    const baseDir = mkdtempSync(join(tmpdir(), 'verify-build-subpasta-'))
    const subpasta = join(baseDir, 'dist', '_expo', 'static', 'js', 'web', 'chunks')
    mkdirSync(subpasta, { recursive: true })
    writeFileSync(join(subpasta, 'x.js'), 'console.log(1)')
    const arquivos = collectBuildFiles(baseDir)
    rmSync(baseDir, { recursive: true, force: true })
    expect(arquivos).toHaveLength(1)
    expect(arquivos[0]).toMatch(/x\.js$/)
  })
})

describe('checkBannerOnFiles (achado B1, validacao da entrega)', () => {
  it('lista vazia de arquivos nunca e sucesso (ok: false), nunca aprova em silencio', () => {
    expect(checkBannerOnFiles([], buildBanner('0.2.0'))).toEqual({ ok: false, semCabecalho: [] })
  })

  it('confere o cabecalho exato de buildBanner, nao um literal repetido', () => {
    const dir = mkdtempSync(join(tmpdir(), 'verify-build-banner-'))
    const arquivo = join(dir, 'a.js')
    writeFileSync(arquivo, buildBanner('0.2.0') + 'console.log(1)')
    const resultado = checkBannerOnFiles([arquivo], buildBanner('0.2.0'))
    rmSync(dir, { recursive: true, force: true })
    expect(resultado).toEqual({ ok: true, semCabecalho: [] })
  })

  it('lista o arquivo sem cabecalho, sem parar no primeiro', () => {
    const dir = mkdtempSync(join(tmpdir(), 'verify-build-semcabecalho-'))
    const cabecalho = buildBanner('0.2.0')
    const comCabecalho = join(dir, 'a.js')
    const semCabecalho = join(dir, 'b.js')
    writeFileSync(comCabecalho, cabecalho + 'console.log(1)')
    writeFileSync(semCabecalho, 'console.log(2)')
    const resultado = checkBannerOnFiles([comCabecalho, semCabecalho], cabecalho)
    rmSync(dir, { recursive: true, force: true })
    expect(resultado).toEqual({ ok: false, semCabecalho: [semCabecalho] })
  })
})
