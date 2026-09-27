// Sem @types/node no programa (tsconfig.json restringe `types` a `["jest"]`, desvio H3 já
// registrado em check-rules.ts): `require` com cast local em vez de `import ... from 'fs'/'os'/'path'`.
const { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } = require('fs') as {
  mkdtempSync: (prefix: string) => string
  mkdirSync: (path: string, options: { recursive: boolean }) => void
  writeFileSync: (path: string, data: string) => void
  readFileSync: (path: string, encoding: 'utf8') => string
  rmSync: (path: string, options: { recursive: boolean; force: boolean }) => void
}
const { tmpdir } = require('os') as { tmpdir: () => string }
const { join } = require('path') as { join: (...parts: string[]) => string }
import { buildBanner, applyBanner, bannerGlobs } from './add-banner'

describe('buildBanner', () => {
  it('usa a versão informada no formato do contrato de autoria', () => {
    expect(buildBanner('1.2.3')).toBe('/*! Rendra App v1.2.3 | MIT | © 2026 Bruno Magalhaes | brunomagalhaes.me */\n')
  })
})

describe('applyBanner', () => {
  it('aplica o cabeçalho no início de cada arquivo, preservando o conteúdo', () => {
    const dir = mkdtempSync(join(tmpdir(), 'rendra-banner-'))
    const jsFile = join(dir, 'entry.js')
    const cssFile = join(dir, 'web.css')
    writeFileSync(jsFile, 'console.log(1)')
    writeFileSync(cssFile, '.a{color:red}')
    try {
      const banner = buildBanner('1.0.0')
      const updated = applyBanner([jsFile, cssFile], banner)
      // Efeito visível, não só a chamada: o conteúdo real do arquivo passa a começar com o
      // cabeçalho, mantendo o restante intacto.
      expect(updated).toEqual([jsFile, cssFile])
      expect(readFileSync(jsFile, 'utf8')).toBe(`${banner}console.log(1)`)
      expect(readFileSync(cssFile, 'utf8')).toBe(`${banner}.a{color:red}`)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('é idempotente: rodar duas vezes não duplica o cabeçalho', () => {
    const dir = mkdtempSync(join(tmpdir(), 'rendra-banner-'))
    const jsFile = join(dir, 'entry.js')
    writeFileSync(jsFile, 'console.log(1)')
    try {
      const banner = buildBanner('1.0.0')
      applyBanner([jsFile], banner)
      const segundaRodada = applyBanner([jsFile], banner)
      expect(segundaRodada).toEqual([])
      expect(readFileSync(jsFile, 'utf8')).toBe(`${banner}console.log(1)`)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

describe('bannerGlobs', () => {
  it("retorna o glob de build:lib para destino 'lib'", () => {
    expect(bannerGlobs('lib')).toEqual(['dist-lib/**/*.js'])
  })

  it("retorna os globs de build:web para destino 'web'", () => {
    expect(bannerGlobs('web')).toEqual(['dist/_expo/static/js/**/*.js', 'dist/_expo/static/css/**/*.css'])
  })

  it('aceita um glob de destino diferente do padrao (dist-lib em vez de dist), resolvido de verdade', () => {
    const dir = mkdtempSync(join(tmpdir(), 'add-banner-lib-'))
    mkdirSync(join(dir, 'dist-lib'), { recursive: true })
    writeFileSync(join(dir, 'dist-lib', 'index.js'), 'module.exports = {}')
    try {
      const { globSync } = require('glob') as typeof import('glob')
      const banner = buildBanner('0.3.0')
      const arquivos = globSync(bannerGlobs('lib')[0], { cwd: dir, absolute: true, posix: true })
      const atualizados = applyBanner(arquivos, banner)
      expect(atualizados).toEqual(arquivos)
      expect(readFileSync(join(dir, 'dist-lib', 'index.js'), 'utf8')).toBe(`${banner}module.exports = {}`)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
