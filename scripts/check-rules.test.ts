import { runCheckRules, isR3Allowed, checkClaudeMd } from './check-rules'

describe('R1 valor arbitrário', () => {
  it('acusa classe com colchetes', () => {
    const violations = runCheckRules(['scripts/__fixtures__/r1-violacao.tsx'])
    expect(violations.filter((v) => v.rule === 'R1')).toHaveLength(2) // p-[13px] e w-[220px]
  })
  it('não acusa fixture limpo', () => {
    const violations = runCheckRules(['scripts/__fixtures__/r1-limpo.tsx'])
    expect(violations.filter((v) => v.rule === 'R1')).toHaveLength(0)
  })
})

describe('R2 cor fixa', () => {
  it('acusa literal de cor em style', () => {
    const violations = runCheckRules(['scripts/__fixtures__/r2-violacao.tsx'])
    expect(violations.filter((v) => v.rule === 'R2')).toHaveLength(1)
  })
  it('não acusa fixture limpo', () => {
    const violations = runCheckRules(['scripts/__fixtures__/r2-limpo.tsx'])
    expect(violations.filter((v) => v.rule === 'R2')).toHaveLength(0)
  })
  it('não acusa src/theme/tokens.ts nem src/brand/palette(s).ts (exceção da regra)', () => {
    const violations = runCheckRules(['src/theme/tokens.ts', 'src/brand/palette.ts', 'src/brand/palettes.ts'])
    expect(violations.filter((v) => v.rule === 'R2')).toHaveLength(0)
  })
})

describe('R3 style inline (Review Focus 4)', () => {
  it('acusa style fora da lista fechada', () => {
    const violations = runCheckRules(['scripts/__fixtures__/r3-violacao.tsx'])
    expect(violations.filter((v) => v.rule === 'R3')).toHaveLength(1)
  })
  it('não acusa src/brand/brand-provider.tsx (está na lista fechada)', () => {
    const violations = runCheckRules(['src/brand/brand-provider.tsx'])
    expect(violations.filter((v) => v.rule === 'R3')).toHaveLength(0)
  })
  it('não acusa app/_layout.tsx (GestureHandlerRootView flex: 1, Tarefa A1)', () => {
    const violations = runCheckRules(['app/_layout.tsx'])
    expect(violations.filter((v) => v.rule === 'R3')).toHaveLength(0)
  })
  it('não acusa src/components/internal/text.tsx (fontFamily resolvido em runtime)', () => {
    const violations = runCheckRules(['src/components/internal/text.tsx'])
    expect(violations.filter((v) => v.rule === 'R3')).toHaveLength(0)
  })
  it('a lista fechada já reserva os arquivos de F1b (bloqueadora C9), via isR3Allowed puro', () => {
    // isR3Allowed é só checagem de string contra a lista fechada, sem tocar ts-morph/disco;
    // nenhum destes 5 arquivos de F1b existe ainda nesta entrega, então runCheckRules (que
    // chama project.addSourceFileAtPath) não pode ser exercitado com eles.
    const reservados = [
      'src/components/ui/switch.tsx', 'src/components/ui/toast.tsx', 'src/components/ui/progress.tsx',
      'src/components/ui/skeleton.tsx', 'src/components/internal/bottom-sheet.tsx',
    ]
    for (const path of reservados) expect(isR3Allowed(path)).toBe(true)
  })
})

describe('R3: button.tsx e brand-feedback-icon.tsx na lista fechada', () => {
  it('isR3Allowed aceita src/components/ui/button.tsx', () => {
    expect(isR3Allowed('src/components/ui/button.tsx')).toBe(true)
  })

  it('isR3Allowed aceita src/components/ui/brand-feedback-icon.tsx', () => {
    expect(isR3Allowed('src/components/ui/brand-feedback-icon.tsx')).toBe(true)
  })
})

describe('R3: src/components/ui/modal.tsx na lista fechada (validação final do lote 3, A1/A3: useAnimatedStyle da entrada própria)', () => {
  it('isR3Allowed aceita src/components/ui/modal.tsx', () => {
    expect(isR3Allowed('src/components/ui/modal.tsx')).toBe(true)
  })
})

describe('R3: src/brand/themed-status-bar.tsx na lista fechada (correção pós lote 1)', () => {
  it('não acusa src/brand/themed-status-bar.tsx (style é o enum de expo-status-bar, não um objeto de estilo RN)', () => {
    const violations = runCheckRules(['src/brand/themed-status-bar.tsx'])
    expect(violations.filter((v) => v.rule === 'R3')).toHaveLength(0)
  })
})

describe('R3: arquivos do AppShell na lista fechada (F2)', () => {
  it('isR3Allowed aceita header.tsx (paddingTop: insets.top, dono do inset superior)', () => {
    expect(isR3Allowed('src/components/app-shell/header.tsx')).toBe(true)
  })
  it('isR3Allowed aceita bottom-nav.tsx (paddingBottom: insets.bottom, dono do inset inferior)', () => {
    expect(isR3Allowed('src/components/app-shell/bottom-nav.tsx')).toBe(true)
  })
  it('isR3Allowed aceita nav-drawer.tsx (useAnimatedStyle, flex 1 do GestureHandlerRootView e insets)', () => {
    expect(isR3Allowed('src/components/app-shell/nav-drawer.tsx')).toBe(true)
  })
})

describe('R3: app/(shell)/tokens/index.tsx (rota movida para o grupo)', () => {
  it('não acusa R3 nos pares de contraste AA da rota no novo caminho', () => {
    const violations = runCheckRules(['app/(shell)/tokens/index.tsx'])
    expect(violations.filter((v) => v.rule === 'R3')).toHaveLength(0)
  })
})

describe('R4 degrau fora da escala', () => {
  it('acusa número que não está na escala, em arquivo autorizado a style', () => {
    const violations = runCheckRules(['scripts/__fixtures__/r4-violacao.tsx'], { r4AllowFile: true })
    expect(violations.filter((v) => v.rule === 'R4')).toHaveLength(1)
  })
})

describe('R5 nome de fonte fixo', () => {
  it('acusa nome de fonte fora de theme/fonts.ts e theme/models.ts', () => {
    const violations = runCheckRules(['scripts/__fixtures__/r5-violacao.tsx'])
    expect(violations.filter((v) => v.rule === 'R5')).toHaveLength(1)
  })
  it('não acusa src/theme/fonts.ts nem src/theme/models.ts', () => {
    const violations = runCheckRules(['src/theme/fonts.ts', 'src/theme/models.ts'])
    expect(violations.filter((v) => v.rule === 'R5')).toHaveLength(0)
  })
})

describe('R6 arquivo paralelo', () => {
  it('acusa sufixo Mobile/Simples/Grande/ComBusca em src/components', () => {
    const violations = runCheckRules([], { r6FileNames: ['src/components/ui/select-mobile.tsx', 'src/components/ui/cardSimples.tsx'] })
    expect(violations.filter((v) => v.rule === 'R6')).toHaveLength(2)
  })
  it('não acusa nome normal', () => {
    const violations = runCheckRules([], { r6FileNames: ['src/components/ui/select.tsx'] })
    expect(violations.filter((v) => v.rule === 'R6')).toHaveLength(0)
  })
})

describe('R7 peso via fontWeight', () => {
  it('acusa fontWeight numérico e font-bold', () => {
    const violations = runCheckRules(['scripts/__fixtures__/r7-violacao.tsx'])
    expect(violations.filter((v) => v.rule === 'R7')).toHaveLength(2)
  })
})

describe('R8 componente paralelo', () => {
  it('acusa dois arquivos com o mesmo prefixo semântico em src/components/ui', () => {
    const violations = runCheckRules([], { r8FileNames: ['src/components/ui/select.tsx', 'src/components/ui/select-v2.tsx'] })
    expect(violations.filter((v) => v.rule === 'R8')).toHaveLength(1)
  })
  it('não acusa nomes sem prefixo repetido', () => {
    const violations = runCheckRules([], { r8FileNames: ['src/components/ui/select.tsx', 'src/components/ui/switch.tsx'] })
    expect(violations.filter((v) => v.rule === 'R8')).toHaveLength(0)
  })
})

describe('R9 modal dentro de modal', () => {
  it('acusa', () => {
    const violations = runCheckRules(['scripts/__fixtures__/r9-violacao.tsx'])
    expect(violations.filter((v) => v.rule === 'R9')).toHaveLength(1)
  })
})

describe('R10 modal com mais de 3 campos', () => {
  it('acusa 4 Input diretos', () => {
    const violations = runCheckRules(['scripts/__fixtures__/r10-violacao.tsx'])
    expect(violations.filter((v) => v.rule === 'R10')).toHaveLength(1)
  })
})

describe('R11 degradê fora das regras', () => {
  it('acusa mais de um Gradient numa rota de app/', () => {
    const violations = runCheckRules(['scripts/__fixtures__/r11-violacao-dois.tsx'], { r11IsRoute: true })
    expect(violations.filter((v) => v.rule === 'R11')).toHaveLength(1)
  })
  it('acusa Gradient como filho direto de Button', () => {
    const violations = runCheckRules(['scripts/__fixtures__/r11-violacao-filho.tsx'])
    expect(violations.filter((v) => v.rule === 'R11')).toHaveLength(1)
  })
})

describe('R12 botão solto', () => {
  it('acusa Button fora de um container autorizado, em app/', () => {
    const violations = runCheckRules(['scripts/__fixtures__/r12-violacao.tsx'], { r12IsAppFile: true })
    expect(violations.filter((v) => v.rule === 'R12')).toHaveLength(1)
  })
  it('R12 ignora arquivos de src/components/** mesmo com Button solto', () => {
    const violations = runCheckRules(['scripts/__fixtures__/r12-violacao.tsx'], { r12PathOverride: 'src/components/ui/action-bar.tsx' })
    expect(violations.filter((v) => v.rule === 'R12')).toHaveLength(0)
  })
  it('aceita Button dentro da action de um Alert, em app/', () => {
    const violations = runCheckRules(['scripts/__fixtures__/r12-alert-ok.tsx'], { r12IsAppFile: true })
    expect(violations.filter((v) => v.rule === 'R12')).toHaveLength(0)
  })
  it('aceita Button dentro das actions de um EmptyState, em app/', () => {
    const violations = runCheckRules(['scripts/__fixtures__/r12-empty-state-ok.tsx'], { r12IsAppFile: true })
    expect(violations.filter((v) => v.rule === 'R12')).toHaveLength(0)
  })
})

describe('R13 nenhum arquivo de teste dentro de app/ (bug de execução E1-E3/F2)', () => {
  it('acusa arquivo de teste sob app/ (o Expo Router trata todo arquivo em app/ como rota)', () => {
    const violations = runCheckRules([], { r13AppTestFileNames: ['app/tokens/index.test.tsx'] })
    expect(violations.filter((v) => v.rule === 'R13')).toHaveLength(1)
  })
  it('não acusa quando não há nenhum arquivo de teste sob app/ (estado real do repositório)', () => {
    const { globSync } = require('glob') as typeof import('glob')
    const appTestFiles: string[] = globSync('app/**/*.test.{ts,tsx}', { posix: true })
    const violations = runCheckRules([], { r13AppTestFileNames: appTestFiles })
    expect(violations.filter((v) => v.rule === 'R13')).toHaveLength(0)
  })
})

describe('globs de produção (bloqueadora C10)', () => {
  it('a lista de arquivos de app/ e src/ para o CLI exclui *.test.ts(x) e scripts/__fixtures__/**', () => {
    const { globSync } = require('glob') as typeof import('glob')
    const appFiles: string[] = globSync('app/**/*.tsx', { ignore: ['app/**/*.test.tsx'], posix: true })
    const srcFiles: string[] = globSync('src/**/*.{ts,tsx}', { ignore: ['src/**/*.test.{ts,tsx}'], posix: true })
    expect(appFiles.some((f) => f.endsWith('.test.tsx'))).toBe(false)
    expect(srcFiles.some((f) => f.endsWith('.test.ts') || f.endsWith('.test.tsx'))).toBe(false)
    expect([...appFiles, ...srcFiles].some((f) => f.includes('scripts/__fixtures__'))).toBe(false)
  })
})

describe('CLAUDE.md, diff contra o arquivo de referência', () => {
  it('a seção "Matriz de modelos" é idêntica ao arquivo de referência', () => {
    const violations = checkClaudeMd('CLAUDE.md', 'docs/reference/claude-md-matriz-modelos.txt')
    expect(violations).toHaveLength(0)
  })

  it('CRLF no CLAUDE.md (checkout do Windows com autocrlf) não conta como diferença', () => {
    // Sem @types/node no programa (tsconfig `types: ["jest"]`): cast estrutural, como nos scripts.
    const fs = require('fs') as {
      mkdtempSync: (prefix: string) => string
      writeFileSync: (path: string, data: string) => void
      rmSync: (path: string, options: { recursive: boolean; force: boolean }) => void
    }
    const os = require('os') as { tmpdir: () => string }
    const path = require('path') as { join: (...parts: string[]) => string }
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-md-'))
    try {
      const marker = '## Matriz de modelos (inegociável)'
      const reference = `${marker}\n\nlinha um\nlinha dois\n`
      const claude = `# Titulo\n\nintro\n\n${reference}`.replace(/\n/g, '\r\n')
      const claudePath = path.join(dir, 'CLAUDE.md')
      const referencePath = path.join(dir, 'ref.txt')
      fs.writeFileSync(claudePath, claude)
      fs.writeFileSync(referencePath, reference)
      expect(checkClaudeMd(claudePath, referencePath)).toHaveLength(0)
      fs.writeFileSync(claudePath, claude.replace('linha dois', 'linha DOIS'))
      expect(checkClaudeMd(claudePath, referencePath)).toHaveLength(1)
    } finally {
      fs.rmSync(dir, { recursive: true, force: true })
    }
  })
})

describe('R2: cor fixa também em className', () => {
  it('reprova um literal de cor dentro da string de className', () => {
    const violations = runCheckRules(['scripts/__fixtures__/r2-classname-color.tsx'])
    expect(violations.filter((v) => v.rule === 'R2').length).toBe(1)
  })

  it('não reprova uma className sem literal de cor', () => {
    const violations = runCheckRules(['scripts/__fixtures__/r2-classname-color-ok.tsx'])
    expect(violations.filter((v) => v.rule === 'R2').length).toBe(0)
  })
})

describe('R9: Drawer dentro de Modal', () => {
  it('reprova <Drawer> como descendente de <Modal>', () => {
    const violations = runCheckRules(['scripts/__fixtures__/r9-drawer-in-modal.tsx'])
    expect(violations.filter((v) => v.rule === 'R9').length).toBe(1)
  })
})

describe('R11: Gradient na forma JsxElement', () => {
  it('reprova mais de um <Gradient>...</Gradient> no mesmo arquivo', () => {
    const violations = runCheckRules(['scripts/__fixtures__/r11-gradient-jsx-element.tsx'], { r11IsRoute: true })
    expect(violations.filter((v) => v.rule === 'R11').length).toBe(1)
  })
})

describe('R14: variavel do tema sem prefixo --rendra- (itens H2/H3 do levantamento da Sincronizacao 1)', () => {
  it('acusa variavel do tema sem o prefixo --rendra-', () => {
    const violations = runCheckRules(['scripts/__fixtures__/r14-violacao.tsx'])
    expect(violations.filter((v) => v.rule === 'R14')).toHaveLength(1)
  })

  it('nao acusa chave ja prefixada', () => {
    const violations = runCheckRules(['scripts/__fixtures__/r14-limpo.tsx'])
    expect(violations.filter((v) => v.rule === 'R14')).toHaveLength(0)
  })

  it('nao acusa variavel interna do Tailwind (--tw-*)', () => {
    const violations = runCheckRules(['scripts/__fixtures__/r14-tailwind-ok.tsx'])
    expect(violations.filter((v) => v.rule === 'R14')).toHaveLength(0)
  })

  it('o repositorio inteiro (ja limpo pelo Bloco 3) nao acusa nenhuma variavel sem prefixo', () => {
    const { globSync } = require('glob') as typeof import('glob')
    const srcFiles: string[] = globSync('src/**/*.{ts,tsx}', { ignore: ['src/**/*.test.{ts,tsx}'], posix: true })
    const violations = runCheckRules(srcFiles)
    expect(violations.filter((v) => v.rule === 'R14')).toHaveLength(0)
  })
})

describe('R15: texto orientativo fora do limite ou com verbo de instrucao (item H2 do levantamento)', () => {
  it('acusa help acima do limite do span (sem span, md = 40)', () => {
    const violations = runCheckRules(['scripts/__fixtures__/r15-help-longo.tsx'], { r15IsScreen: true })
    expect(violations.filter((v) => v.rule === 'R15')).toHaveLength(1)
  })

  it('nao acusa help dentro do limite', () => {
    const violations = runCheckRules(['scripts/__fixtures__/r15-help-curto.tsx'], { r15IsScreen: true })
    expect(violations.filter((v) => v.rule === 'R15')).toHaveLength(0)
  })

  it('span="full" aceita ate 150 caracteres', () => {
    const violations = runCheckRules(['scripts/__fixtures__/r15-span-full.tsx'], { r15IsScreen: true })
    expect(violations.filter((v) => v.rule === 'R15')).toHaveLength(0)
  })

  it('acusa mais da metade dos Field de uma FormSection com help', () => {
    const violations = runCheckRules(['scripts/__fixtures__/r15-form-section.tsx'], { r15IsScreen: true })
    expect(violations.filter((v) => v.rule === 'R15')).toHaveLength(1)
  })

  it('acusa description do PageHeader acima de 150 caracteres', () => {
    const violations = runCheckRules(['scripts/__fixtures__/r15-page-header.tsx'], { r15IsScreen: true })
    expect(violations.filter((v) => v.rule === 'R15')).toHaveLength(1)
  })

  it('acusa CardDescription comecando com verbo de instrucao', () => {
    const violations = runCheckRules(['scripts/__fixtures__/r15-verbo.tsx'], { r15IsScreen: true })
    expect(violations.filter((v) => v.rule === 'R15')).toHaveLength(1)
  })

  it('help={variavel} nunca e medido', () => {
    const violations = runCheckRules(['scripts/__fixtures__/r15-variavel.tsx'], { r15IsScreen: true })
    expect(violations.filter((v) => v.rule === 'R15')).toHaveLength(0)
  })

  it('sem r15IsScreen (fora de app/), a mesma violacao nao e acusada (prova o escopo)', () => {
    const violations = runCheckRules(['scripts/__fixtures__/r15-help-longo.tsx'])
    expect(violations.filter((v) => v.rule === 'R15')).toHaveLength(0)
  })
})

describe('R3: app/index.tsx na lista fechada (F2, amostras de paleta da home)', () => {
  it('isR3Allowed aceita app/index.tsx e continua recusando outras telas fora da lista', () => {
    expect(isR3Allowed('app/index.tsx')).toBe(true)
    expect(isR3Allowed('app/login.tsx')).toBe(false)
  })
})

describe('R3: src/components/splash/rendra-splash.tsx na lista fechada (F2, achado B14 do Opus)', () => {
  it('isR3Allowed aceita o splash e o check:rules não acusa R3 nele', () => {
    expect(isR3Allowed('src/components/splash/rendra-splash.tsx')).toBe(true)
    const violations = runCheckRules(['src/components/splash/rendra-splash.tsx'])
    expect(violations.filter((v) => v.rule === 'R3')).toHaveLength(0)
  })
})
