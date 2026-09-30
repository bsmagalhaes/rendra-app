// Fluxo de início em qualquer IA: `AGENTS.md` conduz o briefing (passos, ramo sem terminal, matriz
// condicionada) e os cinco arquivos que resumem mandam ler o roteiro, fora do bloco espelhado.
// Os cinco resumos valem também no clone limpo; o resto da suíte só no pacote (no clone, README,
// CONTRIBUTING.md e as linhas de comando de `AGENTS.md` são do projeto novo), como `f2-docs.test.ts`.
const { readFileSync, existsSync } = require('fs') as {
  readFileSync: (caminho: string, codificacao: 'utf8') => string
  existsSync: (caminho: string) => boolean
}

const ler = (caminho: string) => readFileSync(caminho, 'utf8')

const INICIO = '<!-- rendra:verificacao:inicio -->'
const FIM = '<!-- rendra:verificacao:fim -->'
const foraDoBloco = (texto: string) => {
  const i = texto.indexOf(INICIO)
  const f = texto.indexOf(FIM)
  return texto.slice(0, i) + texto.slice(f + FIM.length)
}

const CINCO_RESUMOS = [
  'CLAUDE.md',
  'GEMINI.md',
  '.github/copilot-instructions.md',
  '.cursor/rules/rendra.mdc',
  '.windsurfrules',
]

const ARQUIVOS_DO_PASSO_5 = [
  'src/brand/brand.config.ts',
  'src/brand/palettes.ts',
  'src/theme/fonts.ts',
  'app.json',
  'src/config/navigation.tsx',
  'app/(shell)/_layout.tsx',
  'app/index.tsx',
  'app/login.tsx',
  'app/(shell)/painel.tsx',
  'app/(shell)/configuracoes.tsx',
  'app/+not-found.tsx',
]

const URL_RAW = 'https://raw.githubusercontent.com/bsmagalhaes/rendra-ui-app/main'
const PROMPT_DO_CHAT =
  'Clone https://github.com/bsmagalhaes/rendra-ui-app e use como base do meu novo app. Siga o AGENTS.md do repositório. Meu briefing já está pronto, vou colar.'
const PROMPT_DO_CHAT_MIGRACAO =
  'Aplique neste app o design system https://github.com/bsmagalhaes/rendra-ui-app. Siga o AGENTS.md do repositório. Meu briefing já está pronto, vou colar.'

describe('fluxo de início nos cinco arquivos que resumem', () => {
  it.each(CINCO_RESUMOS)('%s manda conduzir o briefing, fora do bloco espelhado', (arquivo) => {
    const texto = ler(arquivo)
    expect(texto.indexOf(INICIO)).toBeGreaterThanOrEqual(0)
    const fora = foraDoBloco(texto)
    expect(fora).toContain('docs/BRIEFING_MODELO.md')
    expect(fora).toContain('docs/BRIEFING.md')
    expect(fora).toContain('uma decisão por mensagem')
    expect(fora).toContain('Se o pedido já disser o tipo de trabalho, não pergunte de novo.')
    expect(fora).toContain('com a continuação de projeto novo ou a de migração, conforme o caso')
  })

  it.each(CINCO_RESUMOS)('%s não cita comando de pacote nem CONTRIBUTING.md na frase de início', (arquivo) => {
    const fora = foraDoBloco(ler(arquivo))
    const linha = fora.split(/\r?\n/).find((l) => l.includes('Fluxo de início')) ?? ''
    expect(linha).not.toBe('')
    expect(linha).not.toMatch(/npm run|clean:clone|CONTRIBUTING\.md/)
  })

  it('CLAUDE.md diz, acima da matriz, que ela vale só para a manutenção do próprio Rendra App', () => {
    const claude = ler('CLAUDE.md')
    const acima = claude.slice(0, claude.indexOf('# REGRA INEGOCIÁVEL: MATRIZ DE MODELOS'))
    expect(acima).toContain('vale para a manutenção do próprio Rendra App')
    expect(acima).toContain("'Fluxo de desenvolvimento' do `AGENTS.md`")
  })
})

const ehPacote = existsSync('src/__tests__/pack-consumer.test.tsx')
const descrever = ehPacote ? describe : describe.skip

descrever('AGENTS.md e documentos de uso conduzem o briefing', () => {
  const agents = ehPacote ? ler('AGENTS.md') : ''

  it('diz para quais IAs é', () => {
    expect(agents).toContain('Codex, Claude Code, Cursor, GitHub Copilot, Gemini, Windsurf, Jules')
  })

  it('manda a IA de chat sem terminal ao ramo (d) antes de qualquer outro ramo', () => {
    const vaAoRamoD = agents.indexOf('vá direto ao ramo (d)')
    expect(vaAoRamoD).toBeGreaterThan(-1)
    expect(vaAoRamoD).toBeLessThan(agents.indexOf('**(a)'))
    expect(agents).toContain('nunca passe comandos para a pessoa rodar')
  })

  it('o ramo (d) lê as duas URLs raw, conduz em texto e entrega o briefing com as três linhas', () => {
    expect(agents).toContain('**(d) Chat sem terminal.**')
    expect(agents).toContain(`${URL_RAW}/AGENTS.md`)
    expect(agents).toContain(`${URL_RAW}/docs/BRIEFING_MODELO.md`)
    expect(agents).toContain(PROMPT_DO_CHAT)
    expect(agents).toContain('Instale uma IA de código com terminal')
    expect(agents).toContain('as linhas de `expo` e `react-native` do `package.json`')
  })

  it('o ramo (d) entrega linhas de continuação diferentes para projeto novo e para migração', () => {
    const ramoD = agents.slice(agents.indexOf('**(d) Chat sem terminal.**'), agents.indexOf('Em qualquer ramo:'))
    const novo = ramoD.indexOf(PROMPT_DO_CHAT)
    const migracao = ramoD.indexOf(PROMPT_DO_CHAT_MIGRACAO)
    expect(novo).toBeGreaterThan(-1)
    expect(migracao).toBeGreaterThan(novo)
    const trechoMigracao = ramoD.slice(migracao - 400)
    expect(trechoMigracao).toContain('dentro da pasta do seu app')
    expect(trechoMigracao).toContain('segue o ramo (c)')
    expect(ramoD.slice(0, migracao)).toContain('conforme o tipo de trabalho do briefing')
  })

  it('o ramo (c) aceita o briefing colado vindo do chat, sem refazer, contado do dia em que é colado', () => {
    const ramoC = agents.slice(agents.indexOf('**(c)'), agents.indexOf('**(d) Chat sem terminal.**'))
    expect(ramoC).toContain('se a pessoa avisou que já tem o briefing pronto (ramo d)')
    expect(ramoC).toContain('grave em `docs/BRIEFING.md`')
    expect(ramoC).toContain('conta a partir do dia em que é colado')
    expect(ramoC).toContain('sem refazer as perguntas')
  })

  it('o ramo (a) aceita briefing colado, sem refazer o que veio de um chat sem terminal', () => {
    expect(agents).toContain('se a pessoa colar um briefing pronto')
    expect(agents).toContain('conta a partir do dia em que é colado')
    expect(agents).toContain('siga do Passo 3 (rascunho ou sem briefing) ou do Passo 5 (confirmado)')
  })

  it('o ramo (b) não refaz o briefing de quem avisou que já tem um pronto', () => {
    expect(agents).toContain('se a pessoa avisou que já tem o briefing pronto (ramo d)')
    expect(agents).toContain('grave em `docs/BRIEFING.md` e siga do Passo 5')
  })

  it('contribuição pula o briefing', () => {
    expect(agents).toContain('pule o briefing')
  })

  it.each(['### Passo 3: conduzir o briefing', '### Passo 4: registrar e confirmar', '### Passo 5: planejar em etapas'])(
    'tem o passo "%s"',
    (titulo) => {
      expect(agents).toContain(titulo)
    },
  )

  it.each(ARQUIVOS_DO_PASSO_5)('cita %s, que existe no repositório', (arquivo) => {
    expect(existsSync(arquivo)).toBe(true)
    expect(agents).toContain(arquivo)
  })

  it('o Passo 5 aponta a seção de telas e navegação, o fluxo de desenvolvimento e a migração', () => {
    expect(agents).toContain('seção "Telas e navegação do boilerplate"')
    expect(agents).toContain('cada etapa passa pelas cinco etapas do "Fluxo de desenvolvimento"')
    expect(agents).toContain('Na migração, o plano segue o caminho escolhido em `docs/PROMPT_MIGRACAO.md`')
  })

  it('a leitura obrigatória cita o briefing gravado e o roteiro', () => {
    const leitura = agents.slice(agents.indexOf('## Leitura obrigatória'), agents.indexOf('## Regras que não podem'))
    expect(leitura).toContain('`docs/BRIEFING.md`')
    expect(leitura).toContain('`docs/BRIEFING_MODELO.md`')
  })

  it('condiciona a matriz de modelos à ferramenta com subagentes e dá o caminho sem eles', () => {
    expect(agents).toContain('Se a sua ferramenta tem subagentes')
    expect(agents).toContain('sem subagentes')
    expect(agents).toContain('nunca finja chamar outro modelo')
  })

  it('não cita modelo de IA específico nem caminho interno do autor', () => {
    expect(agents).not.toMatch(/Fable|Sonnet|Opus|docs\/superpowers/)
  })

  it('AGENTS.md descreve o briefing como guiado e adaptado ao celular, sem "sem tradução"', () => {
    expect(agents).toContain('briefing guiado para IA, adaptado ao celular')
    expect(agents).not.toContain('sem tradução')
  })

  it('README cita o ramo sem terminal, o briefing gravado e o fluxo guiado', () => {
    const readme = ler('README.md')
    expect(readme).toContain('sem terminal')
    expect(readme).toContain('docs/BRIEFING.md')
    expect(readme).toContain('briefing guiado para IA, adaptado ao celular')
    expect(readme).not.toContain('sem tradução')
    expect(readme).not.toMatch(/mostra o próprio código/i)
  })

  it('PROMPT_MIGRACAO manda conduzir o briefing completo com o bloco de migração', () => {
    const prompt = ler('docs/PROMPT_MIGRACAO.md')
    expect(prompt).toContain('docs/BRIEFING_MODELO.md')
    expect(prompt).toContain('docs/BRIEFING.md')
    expect(prompt).toContain('bloco 12')
  })

  it('COMO_APLICAR cita o briefing onde fala dos códigos', () => {
    expect(ler('docs/COMO_APLICAR.md')).toContain('BRIEFING_MODELO')
  })

  it('CHANGELOG registra o briefing guiado e a simulação aprovada na entrada da 1.1.0', () => {
    const changelog = ler('CHANGELOG.md')
    const versao = changelog.slice(changelog.indexOf('## [1.1.0]'), changelog.indexOf('## [1.0.0]'))
    expect(versao).toContain('Briefing guiado para qualquer IA')
    expect(versao).toContain('Simulação dos dois leigos aprovada em 30/09/2026')
  })
})
