import { sourceFilesWithWorkletDirective, distJsPathFor } from './build-lib-worklets'

describe('sourceFilesWithWorkletDirective (lacuna 2 do veredito Fable)', () => {
  it('acha só os arquivos com a diretiva worklet', () => {
    const arquivos = [
      { path: 'src/components/internal/bottom-sheet.tsx', content: "export function f() {\n  'worklet'\n  return 1\n}\n" },
      { path: 'src/components/ui/button.tsx', content: 'export function Button() { return null }\n' },
    ]
    expect(sourceFilesWithWorkletDirective(arquivos)).toEqual(['src/components/internal/bottom-sheet.tsx'])
  })

  it('não confunde a palavra "worklet" em comentário com a diretiva', () => {
    const arquivos = [{ path: 'src/x.tsx', content: '// fala sobre worklet aqui, sem a diretiva\nexport function f() { return 1 }\n' }]
    expect(sourceFilesWithWorkletDirective(arquivos)).toEqual([])
  })
})

describe('distJsPathFor (mapeamento rootDir/outDir do tsconfig.lib.json)', () => {
  it('espelha src -> dist-lib trocando a extensão para .js', () => {
    expect(distJsPathFor('src/components/internal/bottom-sheet.tsx')).toBe('dist-lib/components/internal/bottom-sheet.js')
    expect(distJsPathFor('src/index.ts')).toBe('dist-lib/index.js')
  })
})
