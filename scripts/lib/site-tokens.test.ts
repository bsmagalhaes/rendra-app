// Mesmo desvio H3 dos demais scripts (achado B2 do Opus): `require` com cast estrutural local.
const { readFileSync } = require('fs') as { readFileSync: (caminho: string, codificacao: 'utf8') => string }
const { join } = require('path') as { join: (...partes: string[]) => string }

// Identidade da família Rendra, a mesma do site da IDE (https://bsmagalhaes.github.io/rendra-ui-ide/) e da
// página raiz (https://bsmagalhaes.github.io/). Declarada aqui, no próprio teste: nenhum teste lê arquivo de
// outro repositório. A demo em /demo/ NÃO usa estas cores: ela mostra os modelos e paletas do design system.
const IDENTIDADE_RENDRA: Record<string, string> = {
  bg: '#111111',
  'bg-2': '#171717',
  card: '#1c1c1c',
  line: '#2c2c2c',
  fg: '#f2f2f2',
  'fg-2': '#c4c4c4',
  muted: '#9a9a9a',
  primary: '#e8650a',
  'primary-text': '#ff8a3d',
  'on-primary': '#111111',
}

const html = readFileSync(join(process.cwd(), 'docs', 'index.html'), 'utf8')

function lerVars(bloco: string | undefined): Record<string, string> {
  const pares = [...(bloco ?? '').matchAll(/--site-([a-z0-9-]+):\s*(#[0-9a-fA-F]{3,8})/g)]
  return Object.fromEntries(pares.map((m) => [m[1] as string, (m[2] as string).toLowerCase()]))
}

const declaradas = lerVars(html.match(/:root\s*\{([^}]*)\}/)?.[1])

describe('identidade da página = a da família Rendra', () => {
  it.each(Object.entries(IDENTIDADE_RENDRA))('--site-%s = %s', (nome, valor) => {
    expect(declaradas[nome]).toBe(valor)
  })

  it('declara exatamente os 10 tokens da identidade, nem mais nem menos', () => {
    expect(Object.keys(declaradas).sort()).toEqual(Object.keys(IDENTIDADE_RENDRA).sort())
  })

  it('só modo escuro: color-scheme dark e nenhum bloco prefers-color-scheme', () => {
    expect(html).toMatch(/color-scheme:\s*dark/)
    expect(html).not.toContain('prefers-color-scheme')
  })

  it('sem fonte externa (Google Fonts)', () => {
    expect(html).not.toMatch(/fonts\.(googleapis|gstatic)\.com/)
  })
})

// Selo da família (padrão dos produtos, seção 2.8): montado sempre igual, sem recuo nem redesenho.
const RECT_OFICIAL = '<rect width="44" height="44" rx="10" fill="#1c1c1c" stroke="#2c2c2c"/>'
const PATH_OFICIAL =
  '<path d="M15 31V13h9.2a5.6 5.6 0 0 1 1.6 11L31 31" fill="none" stroke="#e8650a" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>'

describe('selo da família Rendra', () => {
  const fontes: Array<[string, string]> = [
    ['docs/index.html', html],
    ['scripts/readme-images.ts (selo da og-image)', readFileSync(join(process.cwd(), 'scripts', 'readme-images.ts'), 'utf8')],
  ]

  it.each(fontes)('%s monta o rect e o path oficiais, byte a byte', (_nome, texto) => {
    expect(texto).toContain(RECT_OFICIAL)
    expect(texto).toContain(PATH_OFICIAL)
  })

  it.each(fontes)('%s não usa o rect recuado (x=1 y=1 width=42)', (_nome, texto) => {
    expect(texto).not.toContain('<rect x="1" y="1" width="42" height="42"')
  })
})
