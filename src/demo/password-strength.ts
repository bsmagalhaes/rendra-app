export type NivelSenha = 'fraca' | 'média' | 'forte'

export interface ForcaSenha {
  nivel: NivelSenha
  pontos: number
  percentual: number
}

/**
 * Força da senha da demonstração: um ponto para cada requisito atendido (8 ou mais caracteres,
 * minúscula e maiúscula, dígito, símbolo). 0 e 1 ponto é fraca, 2 e 3 é média, 4 é forte; o
 * percentual é `pontos * 25`, para alimentar direto o `Progress`.
 */
export function passwordStrength(senha: string): ForcaSenha {
  const pontos = [
    senha.length >= 8,
    /[a-z]/.test(senha) && /[A-Z]/.test(senha),
    /\d/.test(senha),
    /[^A-Za-z0-9]/.test(senha),
  ].filter(Boolean).length
  const nivel: NivelSenha = pontos >= 4 ? 'forte' : pontos >= 2 ? 'média' : 'fraca'
  return { nivel, pontos, percentual: pontos * 25 }
}
