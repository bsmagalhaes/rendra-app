import { resolveBaseUrl } from './readme-images-base-url'

describe('resolveBaseUrl (defeito M1 do veredito Fable)', () => {
  it('deriva o caminho de experiments.baseUrl do app.json, não um valor fixo de /rendra-ui-app', () => {
    expect(resolveBaseUrl('/teste-leigo')).toBe('http://localhost:4173/teste-leigo')
  })

  it('sem experiments.baseUrl, cai na raiz (sem caminho)', () => {
    expect(resolveBaseUrl(undefined)).toBe('http://localhost:4173')
  })

  it('BASE_URL do ambiente sempre vence, igual ao comportamento anterior', () => {
    expect(resolveBaseUrl('/rendra-ui-app', 'http://localhost:9999/outra-coisa')).toBe('http://localhost:9999/outra-coisa')
  })
})
