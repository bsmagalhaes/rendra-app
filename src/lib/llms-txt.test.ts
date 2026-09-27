import { buildLlmsTxt } from './llms-txt'

const entrada = {
  productName: 'Rendra App',
  tagline: 'Design system e boilerplate mobile do Rendra, em React Native (Expo) com Expo Router e NativeWind.',
  audience: 'Quem começa um app novo em React Native (Expo) e quer um design system pronto, ou quem já tem um app e quer migrar a camada visual para o Rendra.',
  repositoryUrl: 'https://github.com/bsmagalhaes/rendra-app',
  siteUrl: 'https://bsmagalhaes.github.io/rendra-app/',
  commands: ['npm install', 'npm start', 'npm run build', 'npm test'],
  routes: [
    { path: '', title: 'Início' },
    { path: 'componentes', title: 'Componentes' },
    { path: 'tokens', title: 'Tokens' },
    { path: 'galeria', title: 'Galeria' },
  ],
}

describe('buildLlmsTxt', () => {
  it('comeca com o titulo do produto e traz a tagline', () => {
    const texto = buildLlmsTxt(entrada)
    expect(texto.startsWith('# Rendra App\n')).toBe(true)
    expect(texto).toContain(entrada.tagline)
  })

  it('traz o link do repositorio para instalar (clonar)', () => {
    expect(buildLlmsTxt(entrada)).toContain(entrada.repositoryUrl)
  })

  it('lista cada rota informada com o titulo e a url completa', () => {
    const texto = buildLlmsTxt(entrada)
    for (const rota of entrada.routes) {
      expect(texto).toContain(`${rota.title}: ${entrada.siteUrl}${rota.path}`)
    }
  })

  it('traz a secao "Para quem serve" com o publico informado', () => {
    const texto = buildLlmsTxt(entrada)
    expect(texto).toContain('## Para quem serve')
    expect(texto).toContain(entrada.audience)
  })

  it('traz a secao "Comandos" com cada comando numa linha propria', () => {
    const texto = buildLlmsTxt(entrada)
    expect(texto).toContain('## Comandos')
    for (const comando of entrada.commands) {
      expect(texto).toContain(`- \`${comando}\``)
    }
  })
})
