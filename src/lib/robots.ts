export const TRAINING_BOTS = [
  'GPTBot',
  'ClaudeBot',
  'anthropic-ai',
  'CCBot',
  'Google-Extended',
  'Bytespider',
  'Applebot-Extended',
] as const

export function buildRobotsTxt(siteUrl: string): string {
  const bloqueios = TRAINING_BOTS.map((bot) => `User-agent: ${bot}\nDisallow: /`).join('\n\n')
  return `User-agent: *\nAllow: /\n\n${bloqueios}\n\nSitemap: ${siteUrl}sitemap.xml\n`
}
