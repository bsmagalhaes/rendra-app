// Fechamento da F2 (Lote F): a documentação conta o que a F2 entregou (49 componentes, AppShell,
// telas base, home e splash) e o CHANGELOG da 1.1.0 está fechado. Lê os documentos reais. No clone
// (`clean:clone` troca README e CHANGELOG) a suíte não se aplica, como as do pacote.
const { readFileSync, existsSync } = require('fs') as {
  readFileSync: (path: string, encoding: 'utf8') => string
  existsSync: (path: string) => boolean
}

const ehPacote = existsSync('src/__tests__/pack-consumer.test.tsx')
const suite = ehPacote ? describe : describe.skip

const ler = (caminho: string) => (ehPacote ? readFileSync(caminho, 'utf8') : '')

const readme = ler('README.md')
const agents = ler('AGENTS.md')
const claude = ler('CLAUDE.md')
const pagina = ler('docs/index.html')
const designRules = ler('DESIGN_RULES.md')
const comoAplicar = ler('docs/COMO_APLICAR.md')
const promptMigracao = ler('docs/PROMPT_MIGRACAO.md')
const changelog = ler('CHANGELOG.md')

function entrada(versao: string, proxima: string): string {
  const inicio = changelog.indexOf(`## [${versao}]`)
  const fim = changelog.indexOf(`## [${proxima}]`)
  return changelog.slice(inicio, fim)
}

suite('contagem de componentes da F3 (49 da F2 mais Chart, Timeline, Calendar, Kanban, ImageViewer, Chat, RichTextEditor e DocumentViewer)', () => {
  it.each([
    ['README.md', readme],
    ['AGENTS.md', agents],
    ['CLAUDE.md', claude],
    ['DESIGN_RULES.md', designRules],
  ])('%s conta 64 componentes e nenhum "49 componentes"', (_nome, texto) => {
    expect(texto).toMatch(/64 componentes/)
    expect(texto).not.toMatch(/\b49 componentes/)
  })

  it('a página de apresentação conta 64 componentes e nenhum "49 componentes" (P4)', () => {
    expect(pagina).toMatch(/64 componentes/)
    expect(pagina).not.toMatch(/49 componentes/)
  })

  it('o README lista os cinco componentes novos', () => {
    for (const nome of ['RendraCredit', 'ErrorPage', 'AuthLayout', 'AppShell', 'RendraSplash']) {
      expect(readme).toContain(nome)
    }
  })
})

suite('README descreve as telas, o shell e a estrutura de app/', () => {
  it('lista as telas base e a home entre as rotas publicadas', () => {
    for (const rota of ['/login', '/painel', '/configuracoes']) {
      expect(readme).toContain(`rendra-ui-app/demo/${rota.slice(1)}`)
    }
    expect(readme).toMatch(/home/i)
  })

  it('a árvore de app/ tem o grupo (shell) e a home própria, não mais o redirecionamento', () => {
    expect(readme).toContain('(shell)/')
    expect(readme).toContain('app-shell/')
    expect(readme).toContain('splash/')
    expect(readme).not.toMatch(/index\.tsx\s+# redireciona para \/componentes/)
  })
})

suite('AGENTS.md orienta a IA sobre as telas e o shell do boilerplate', () => {
  it('cita o grupo (shell), o menu de exemplo, os códigos N e o SafeAreaView das telas fora do shell', () => {
    expect(agents).toContain('app/(shell)')
    expect(agents).toContain('src/config/navigation.tsx')
    expect(agents).toMatch(/N1.*N3/)
    expect(agents).toContain('SafeAreaView')
  })
})

suite('COMO_APLICAR.md e PROMPT_MIGRACAO.md cobrem o AppShell e o crédito', () => {
  it('COMO_APLICAR explica AppShell, código N na URL e credit={false}', () => {
    expect(comoAplicar).toContain('AppShell')
    expect(comoAplicar).toContain('?codigo=T#-C#-N#')
    expect(comoAplicar).toContain('credit={false}')
  })

  it('COMO_APLICAR não diz mais que o pacote ainda não foi publicado', () => {
    expect(comoAplicar).not.toMatch(/ainda não foi publicado/)
  })

  it('PROMPT_MIGRACAO cita o AppShell na migração das telas', () => {
    expect(promptMigracao).toContain('AppShell')
  })
})

suite('CHANGELOG 1.1.0 fechado', () => {
  const versao = entrada('1.1.0', '1.0.0')

  it('lista tudo o que a F2 entregou', () => {
    for (const item of [
      'RendraCredit',
      'AppShell',
      'AuthLayout',
      'ErrorPage',
      'RendraSplash',
      '`/login`',
      '`/painel`',
      '`/configuracoes`',
      'goBack',
      'N1',
      '`defaultModelCode`',
    ]) {
      expect(versao).toContain(item)
    }
  })

  it('registra o endereço novo, sem texto de entrada em construção', () => {
    expect(versao).toContain('rendra-ui-app')
    expect(versao).not.toMatch(/em construção/)
    expect(versao).not.toContain('Telas base, home e splash animado desta versão')
  })

  it('registra a simulação dos leigos aprovada para esta versão', () => {
    expect(versao).toContain('Simulação dos dois leigos aprovada em 30/09/2026')
    expect(versao).not.toMatch(/Simulação dos dois leigos: pendente/)
  })
})

suite('CHANGELOG 1.3.0 fechado (Sincronização 2)', () => {
  const versao = entrada('1.3.0', '1.2.0')
  it('a versão gravada é a 1.3.0 (Sincronização 2) nos dois manifestos', () => {
    const pacote = JSON.parse(ler('package.json')) as { version: string }
    const app = JSON.parse(ler('app.json')) as { expo: { version: string } }
    expect(pacote.version).toBe('1.3.0')
    expect(app.expo.version).toBe('1.3.0')
  })

  it('registra a simulação dos leigos aprovada para esta versão', () => {
    expect(versao).toContain('Simulação dos dois leigos aprovada em 02/10/2026')
  })
})

suite('CHANGELOG 1.2.0 fechado (F3)', () => {
  const versao = entrada('1.2.0', '1.1.0')
  it('lista os oito componentes e os três subcaminhos da F3', () => {
    for (const item of ['Chart', 'Timeline', 'Calendar', 'Kanban', 'ImageViewer', 'Chat', 'RichTextEditor', 'DocumentViewer', '@rendra-ui/app/chart', '@rendra-ui/app/rich-text-editor', '@rendra-ui/app/document-viewer']) {
      expect(versao).toContain(item)
    }
  })

  it('leva o P3 e o P4 (demo com atendimento, agenda, funil, painel com gráficos e Timeline) e não tem mais "Não publicado"', () => {
    expect(changelog).not.toContain('## [Não publicado]')
    for (const item of ['Atendimento', 'Agenda', 'Funil', 'Timeline', 'gráficos', 'Enviar ao funil', 'Conversar']) {
      expect(versao).toContain(item)
    }
  })

  it('registra a simulação dos leigos aprovada para esta versão', () => {
    expect(versao).toContain('Simulação dos dois leigos aprovada em 02/10/2026')
    expect(versao).not.toMatch(/Simulação dos dois leigos: pendente/)
  })
})
