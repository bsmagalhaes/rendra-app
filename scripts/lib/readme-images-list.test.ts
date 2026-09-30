import { ALTURA_STATUS, CAPTURAS, SCALE_CELULAR, VIEWPORT_CELULAR } from './readme-images-list'

describe('CAPTURAS', () => {
  it('só tem capturas de celular, com nome no padrão e únicas', () => {
    const nomes = CAPTURAS.map((c) => c.nome)
    for (const nome of nomes) expect(nome).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*-mobile$/)
    expect(new Set(nomes).size).toBe(nomes.length)
  })

  it('tem 8 telas, 5 da segunda parte da demo e 12 células da matriz modelo por paleta', () => {
    expect(CAPTURAS).toHaveLength(25)
    expect(CAPTURAS.filter((c) => c.nome.startsWith('matriz-'))).toHaveLength(12)
    for (const nome of [
      'safira-clientes-mobile',
      'safira-cliente-mobile',
      'equilibrio-cadastro-mobile',
      'aurora-verificacao-mobile',
      'safira-tarefas-mobile',
    ]) {
      expect(CAPTURAS.map((c) => c.nome)).toContain(nome)
    }
  })

  it('cada captura usa código T x C válido e modo conhecido', () => {
    for (const c of CAPTURAS) {
      expect(c.codigo).toMatch(/^T[1-3]-C[1-4]$/)
      expect(['claro', 'escuro']).toContain(c.modo)
    }
  })

  it('a matriz cobre os 12 códigos T x C, cada um no nome do modelo e da paleta certos', () => {
    const matriz = CAPTURAS.filter((c) => c.nome.startsWith('matriz-'))
    expect(new Set(matriz.map((c) => c.codigo)).size).toBe(12)
    const t2c4 = matriz.find((c) => c.codigo === 'T2-C4')
    expect(t2c4?.nome).toBe('matriz-equilibrio-ardosia-mobile')
    expect(t2c4?.rota).toBe('/galeria')
  })

  it('celular 390x844 em escala 3', () => {
    expect(VIEWPORT_CELULAR).toEqual({ width: 390, height: 844 })
    expect(SCALE_CELULAR).toBe(3)
    expect(ALTURA_STATUS).toBe(44)
  })
})
