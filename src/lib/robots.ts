export const TRAINING_BOTS = [
  'GPTBot',
  'ClaudeBot',
  'anthropic-ai',
  'CCBot',
  'Google-Extended',
  'Bytespider',
  'Applebot-Extended',
] as const

// Robôs de busca e de resposta de IA: liberados de forma explícita (quem pergunta a um assistente
// e quem busca na web chega à página; só a coleta para treino é bloqueada).
export const SEARCH_BOTS = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
] as const

export function buildRobotsTxt(siteUrl: string): string {
  const liberados = SEARCH_BOTS.map((bot) => `User-agent: ${bot}\nAllow: /`).join('\n\n')
  const bloqueios = TRAINING_BOTS.map((bot) => `User-agent: ${bot}\nDisallow: /`).join('\n\n')
  return `User-agent: *\nAllow: /\n\n${liberados}\n\n${bloqueios}\n\nSitemap: ${siteUrl}sitemap.xml\n`
}
