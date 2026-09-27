import { buildRobotsTxt, TRAINING_BOTS } from './robots'

describe('buildRobotsTxt', () => {
  it('libera todo mundo por padrao e bloqueia so os 7 robos de treino', () => {
    const texto = buildRobotsTxt('https://bsmagalhaes.github.io/rendra-app/')
    expect(texto).toMatch(/^User-agent: \*\nAllow: \/\n/)
    expect(TRAINING_BOTS).toHaveLength(7)
    for (const bot of TRAINING_BOTS) {
      expect(texto).toContain(`User-agent: ${bot}\nDisallow: /`)
    }
  })

  it('nao bloqueia nenhum robo de busca ou resposta de IA liberado', () => {
    const texto = buildRobotsTxt('https://bsmagalhaes.github.io/rendra-app/')
    for (const liberado of [
      'OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User',
      'PerplexityBot', 'Perplexity-User',
    ]) {
      expect(texto).not.toContain(`User-agent: ${liberado}\nDisallow: /`)
    }
  })

  it('termina com a linha Sitemap apontando para o site informado', () => {
    const texto = buildRobotsTxt('https://bsmagalhaes.github.io/rendra-app/')
    expect(texto.trimEnd().endsWith('Sitemap: https://bsmagalhaes.github.io/rendra-app/sitemap.xml')).toBe(true)
  })
})
