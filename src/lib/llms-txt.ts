export interface LlmsTxtRoute {
  path: string
  title: string
}

export interface LlmsTxtInput {
  productName: string
  tagline: string
  audience: string
  repositoryUrl: string
  siteUrl: string
  commands: string[]
  routes: LlmsTxtRoute[]
}

export function buildLlmsTxt(input: LlmsTxtInput): string {
  const linhas = [
    `# ${input.productName}`,
    '',
    input.tagline,
    '',
    '## Para quem serve',
    '',
    input.audience,
    '',
    '## Como instalar',
    '',
    `Clone o repositório: ${input.repositoryUrl}`,
    '',
    '## Comandos',
    '',
    ...input.commands.map((comando) => `- \`${comando}\``),
    '',
    '## Telas',
    '',
    ...input.routes.map((rota) => `- ${rota.title}: ${input.siteUrl}${rota.path}`),
    '',
  ]
  return linhas.join('\n')
}
