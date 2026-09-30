import { passwordStrength } from './password-strength'

describe('passwordStrength', () => {
  it.each([
    ['', 'fraca'],
    ['abc', 'fraca'],
    ['Abcdef12', 'média'],
    ['Abcdef12!', 'forte'],
  ] as const)('%s é %s', (senha, nivel) => {
    expect(passwordStrength(senha).nivel).toBe(nivel)
  })

  it('o percentual acompanha os pontos (0, 75, 100)', () => {
    expect(passwordStrength('abc').percentual).toBe(0)
    expect(passwordStrength('Abcdef12').percentual).toBe(75)
    expect(passwordStrength('Abcdef12!').percentual).toBe(100)
  })

  it('um requisito só é fraca, dois já é média', () => {
    expect(passwordStrength('abcdefgh').nivel).toBe('fraca')
    expect(passwordStrength('abcdef12').nivel).toBe('média')
  })
})
