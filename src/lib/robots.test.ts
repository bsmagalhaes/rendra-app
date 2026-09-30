import { buildRobotsTxt, SEARCH_BOTS, TRAINING_BOTS } from './robots'

describe('buildRobotsTxt', () => {
  it('libera todo mundo por padrao e bloqueia so os 7 robos de treino', () => {
    const texto = buildRobotsTxt('https://bsmagalhaes.github.io/rendra-ui-app/')
    expect(texto).toMatch(/^User-agent: \*\nAllow: \/\n/)
    expect(TRAINING_BOTS).toHaveLength(7)
    for (const bot of TRAINING_BOTS) {
      expect(texto).toContain(`User-agent: ${bot}\nDisallow: /`)
    }
  })

  it('nao bloqueia nenhum robo de busca ou resposta de IA liberado', () => {
    const texto = buildRobotsTxt('https://bsmagalhaes.github.io/rendra-ui-app/')
    for (const liberado of [
      'OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User',
      'PerplexityBot', 'Perplexity-User',
    ]) {
      expect(texto).not.toContain(`User-agent: ${liberado}\nDisallow: /`)
    }
  })

  it('libera de forma explícita os 6 robôs de busca e resposta de IA', () => {
    const texto = buildRobotsTxt('https://bsmagalhaes.github.io/rendra-ui-app/')
    expect(SEARCH_BOTS).toEqual([
      'OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User',
    ])
    for (const bot of SEARCH_BOTS) {
      expect(texto).toContain(`User-agent: ${bot}\nAllow: /`)
    }
  })

  it('termina com a linha Sitemap apontando para o site informado', () => {
    const texto = buildRobotsTxt('https://bsmagalhaes.github.io/rendra-ui-app/')
    expect(texto.trimEnd().endsWith('Sitemap: https://bsmagalhaes.github.io/rendra-ui-app/sitemap.xml')).toBe(true)
  })
})
