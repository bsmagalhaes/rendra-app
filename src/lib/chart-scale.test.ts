import {
  categoryAt,
  clamp01,
  funnelWidth,
  gaugeArcPath,
  gaugePoint,
  linearScale,
  niceTicks,
  pieAngles,
  stackSeries,
  zoneFor,
  type GaugeZone,
} from './chart-scale'

describe('niceTicks', () => {
  it('gera ticks bonitos', () => {
    expect(niceTicks(0, 80000, 3)).toEqual([0, 40000, 80000])
  })

  it('estende o dominio ate o proximo degrau bonito quando o maximo nao cai num degrau', () => {
    expect(niceTicks(0, 61300, 3)).toEqual([0, 40000, 80000])
    expect(niceTicks(0, 7, 3)).toEqual([0, 4, 8])
  })

  it('nao gera decimais nos degraus quando integer (padrao), mesmo com intervalo pequeno', () => {
    expect(niceTicks(0, 1, 3)).toEqual([0, 1, 2])
  })

  it('aceita decimais com integer false', () => {
    expect(niceTicks(0, 1, 3, false)).toEqual([0, 0.5, 1])
  })

  it('devolve um tick so quando o intervalo e nulo, e protege contagem invalida', () => {
    expect(niceTicks(5, 5, 3)).toEqual([5])
    expect(niceTicks(0, 10, 1)).toEqual([0, 10])
  })
})

describe('linearScale', () => {
  it('mapeia o dominio para o intervalo e devolve o ponto medio quando o dominio e nulo', () => {
    const escala = linearScale([0, 100], [0, 200])
    expect(escala(0)).toBe(0)
    expect(escala(50)).toBe(100)
    expect(escala(100)).toBe(200)
    expect(linearScale([3, 3], [0, 10])(3)).toBe(5)
  })
})

describe('gauge', () => {
  it('calcula o ponto do ponteiro do gauge (meio circulo, centro 120,120, raio 100)', () => {
    const p = gaugePoint(0.5) // 50% do arco
    expect(p.x).toBeCloseTo(120, 0)
    expect(p.y).toBeCloseTo(20, 0)
    expect(gaugePoint(0).x).toBeCloseTo(20, 0)
    expect(gaugePoint(0).y).toBeCloseTo(120, 0)
    expect(gaugePoint(1).x).toBeCloseTo(220, 0)
  })

  it('limita a fracao a 0..1 e aceita um raio proprio', () => {
    expect(gaugePoint(2).x).toBeCloseTo(220, 0)
    expect(gaugePoint(-1).x).toBeCloseTo(20, 0)
    expect(gaugePoint(0.5, 50).y).toBeCloseTo(70, 0)
  })

  it('monta o caminho do arco entre duas fracoes', () => {
    expect(gaugeArcPath(0, 1)).toBe('M 20.00 120.00 A 100 100 0 0 1 220.00 120.00')
    expect(gaugeArcPath(0, 0.25)).toMatch(/^M 20\.00 120\.00 A 100 100 0 0 1 /)
  })

  it('identifica a zona pela fracao', () => {
    const zonas: GaugeZone[] = [
      { to: 0.6, tone: 'error' },
      { to: 0.9, tone: 'warning' },
      { to: 1, tone: 'success' },
    ]
    expect(zoneFor(0.5, zonas).tone).toBe('error')
    expect(zoneFor(0.88, zonas).tone).toBe('warning')
    expect(zoneFor(0.95, zonas).tone).toBe('success')
    expect(zoneFor(1.4, zonas).tone).toBe('success')
    // o limite superior pertence a propria zona
    expect(zoneFor(0.6, zonas).tone).toBe('error')
    expect(zoneFor(0.9, zonas).tone).toBe('warning')
  })
})

describe('funil', () => {
  it('calcula a largura de cada etapa do funil (1 - (i/n) * 0.54)', () => {
    expect(funnelWidth(0, 4)).toBe(1)
    expect(funnelWidth(3, 4)).toBeCloseTo(1 - 0.75 * 0.54)
  })
})

describe('stackSeries', () => {
  it('empilha series para barras empilhadas', () => {
    expect(stackSeries([{ a: 10, b: 5 }], ['a', 'b'])).toEqual([{ a: [0, 10], b: [10, 15] }])
  })

  it('trata chave ausente ou nao numerica como zero', () => {
    expect(stackSeries([{ a: 10 }, { a: 'x', b: 3 }], ['a', 'b'])).toEqual([
      { a: [0, 10], b: [10, 10] },
      { a: [0, 0], b: [0, 3] },
    ])
  })
})

describe('categoryAt', () => {
  it('converte a posicao do toque na categoria e nunca sai do intervalo', () => {
    expect(categoryAt(10, 320, 12)).toBe(0)
    expect(categoryAt(160, 320, 12)).toBe(6)
    expect(categoryAt(9999, 320, 12)).toBe(11)
    expect(categoryAt(-5, 320, 12)).toBe(0)
  })

  it('devolve 0 sem categorias ou sem largura', () => {
    expect(categoryAt(10, 0, 12)).toBe(0)
    expect(categoryAt(10, 320, 0)).toBe(0)
  })
})

describe('pieAngles', () => {
  it('reparte a volta inteira na proporcao dos valores, em sequencia', () => {
    const fatias = pieAngles([1, 1, 2])
    expect(fatias[0]).toEqual({ start: 0, end: Math.PI / 2 })
    expect(fatias[1]!.start).toBeCloseTo(Math.PI / 2)
    expect(fatias[2]!.end).toBeCloseTo(Math.PI * 2)
  })

  it('total zero gera fatias sem abertura', () => {
    expect(pieAngles([0, 0])).toEqual([{ start: 0, end: 0 }, { start: 0, end: 0 }])
  })
})

describe('clamp01', () => {
  it('limita a fracao entre 0 e 1', () => {
    expect(clamp01(-0.4)).toBe(0)
    expect(clamp01(0.37)).toBe(0.37)
    expect(clamp01(3)).toBe(1)
  })
})
