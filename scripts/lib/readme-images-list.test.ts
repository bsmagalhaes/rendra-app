import { ALTURA_STATUS, CAPTURAS, SCALE_CELULAR, VIEWPORT_CELULAR } from './readme-images-list'

describe('CAPTURAS', () => {
  it('só tem capturas de celular, com nome no padrão e únicas', () => {
    const nomes = CAPTURAS.map((c) => c.nome)
    for (const nome of nomes) expect(nome).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*-mobile$/)
    expect(new Set(nomes).size).toBe(nomes.length)
  })

  it('tem 8 telas, 5 da segunda parte da demo, 4 do atendimento, agenda, funil e painel escuro e 12 células da matriz modelo por paleta', () => {
    expect(CAPTURAS).toHaveLength(29)
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

  it('as quatro capturas do P4 apontam para a rota e o modo certos, e nenhuma outra foi acrescentada', () => {
    const porNome = (nome: string) => CAPTURAS.find((c) => c.nome === nome)
    expect(porNome('safira-atendimento-mobile')).toMatchObject({ rota: '/atendimento/t1', codigo: 'T1-C1', modo: 'claro' })
    expect(porNome('equilibrio-agenda-mobile')).toMatchObject({ rota: '/agenda', codigo: 'T2-C2', modo: 'claro' })
    expect(porNome('aurora-funil-mobile')).toMatchObject({ rota: '/kanban', codigo: 'T3-C3', modo: 'claro' })
    expect(porNome('safira-painel-escuro-mobile')).toMatchObject({ rota: '/painel', codigo: 'T1-C1', modo: 'escuro' })
    expect(CAPTURAS.filter((c) => !c.nome.startsWith('matriz-'))).toHaveLength(17)
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
