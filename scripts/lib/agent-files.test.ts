// Sem @types/node no programa (tsconfig.json restringe `types` a `["jest"]`, desvio ja
// registrado em scripts/check-rules.ts e scripts/verify-build.test.ts): `require` com cast local
// em vez de `import ... from 'fs'/'path'`.
const { readFileSync } = require('fs') as {
  readFileSync: (path: string, encoding: 'utf8') => string
}
const { join } = require('path') as { join: (...parts: string[]) => string }

// Compara o texto inteiro entre marcadores fixos, nunca extrai "comandos" por regex: uma regex
// como /npm run [a-z:]+/g corta `test:a11y` em `test:a`, porque `1` nao casa com `[a-z:]`.
const MARCADOR_INICIO = '<!-- rendra:verificacao:inicio -->'
const MARCADOR_FIM = '<!-- rendra:verificacao:fim -->'

const ARQUIVOS_QUE_RESUMEM = [
  'CLAUDE.md',
  'GEMINI.md',
  '.github/copilot-instructions.md',
  '.cursor/rules/rendra.mdc',
  '.windsurfrules',
]

function extrairBlocoDeVerificacao(texto: string): string {
  const inicio = texto.indexOf(MARCADOR_INICIO)
  const fim = texto.indexOf(MARCADOR_FIM)
  if (inicio === -1 || fim === -1) {
    throw new Error('marcadores rendra:verificacao:inicio/fim nao encontrados no arquivo')
  }
  return texto.slice(inicio + MARCADOR_INICIO.length, fim).trim()
}

describe('arquivos de agente resumem AGENTS.md com o mesmo bloco de verificacao (Regra um, item 1)', () => {
  const agents = readFileSync(join(process.cwd(), 'AGENTS.md'), 'utf8')
  const blocoDeAgents = extrairBlocoDeVerificacao(agents)
  // Achado B1 da validacao da entrega (Blocos 5 e 6, Fable): `npm run clean:clone -- --nome
  // <nome>` (scripts/clean-clone.ts) remove as linhas `npm run build:lib`/`npm run verify:pack`
  // do bloco (stripPackageCommands), porque o clone nao publica pacote nenhum, mas mantem este
  // teste rodando dentro do clone (nao esta em ARQUIVOS_SO_DO_PACOTE). A asserção hardcoded
  // ficava vermelha ali por um motivo que nao e bug: o `package.json` do clone de verdade nao tem
  // mais esses dois scripts. A asserção passa a conferir o que o `package.json` realmente
  // declara, verdadeira nos dois estados (aqui e no clone).
  const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
    scripts?: Record<string, string>
  }
  const scripts = pkg.scripts ?? {}

  it('o bloco de AGENTS.md manda ler o AGENTS.md e cita exatamente os scripts que o package.json declara', () => {
    expect(blocoDeAgents).toContain('Leia e siga o `AGENTS.md`')
    expect(blocoDeAgents).toContain('npm run test:a11y')
    if (scripts['build:lib']) {
      expect(blocoDeAgents).toContain('npm run build:lib')
    } else {
      expect(blocoDeAgents).not.toContain('npm run build:lib')
    }
    if (scripts['verify:pack']) {
      expect(blocoDeAgents).toContain('npm run verify:pack')
    } else {
      expect(blocoDeAgents).not.toContain('npm run verify:pack')
    }
  })

  it.each(ARQUIVOS_QUE_RESUMEM)(
    '%s repete o mesmo bloco de verificacao de AGENTS.md, caractere a caractere',
    (caminho) => {
      const texto = readFileSync(join(process.cwd(), caminho), 'utf8')
      expect(extrairBlocoDeVerificacao(texto)).toBe(blocoDeAgents)
    },
  )

  it.each(ARQUIVOS_QUE_RESUMEM)('%s manda ler o AGENTS.md na raiz antes de qualquer coisa', (caminho) => {
    const texto = readFileSync(join(process.cwd(), caminho), 'utf8')
    expect(texto).toMatch(/Leia e siga o `AGENTS\.md`/)
  })
})
