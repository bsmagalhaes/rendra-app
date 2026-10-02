import { act, renderHook } from '@testing-library/react-native'
import { demoCards, demoEvents } from '../mocks/planning'
import { adicionarCard, adicionarEvento, moverCard, restaurarPlanejamento, useCards, useEventos } from './planning-store'

afterEach(() => {
  restaurarPlanejamento()
})

const naColuna = <T extends { columnId: string }>(cards: readonly T[], id: string) => cards.filter((c) => c.columnId === id)

describe('funil da demonstração', () => {
  it('começa com os 8 cards e restaurar devolve o estado original', async () => {
    const { result } = await renderHook(() => useCards())
    expect(result.current).toHaveLength(8)
    expect(result.current).toEqual(demoCards)
    await act(async () => {
      moverCard('k1', 'fechamento', 0)
    })
    await act(async () => {
      restaurarPlanejamento()
    })
    expect(result.current).toEqual(demoCards)
  })

  it('mover o card muda a coluna e a ordem de destino', async () => {
    const { result } = await renderHook(() => useCards())
    expect(naColuna(result.current, 'novo').map((c) => c.id)).toEqual(['k1', 'k2'])
    await act(async () => {
      moverCard('k1', 'fechamento', 0)
    })
    expect(naColuna(result.current, 'novo').map((c) => c.id)).toEqual(['k2'])
    expect(naColuna(result.current, 'fechamento').map((c) => c.id)).toEqual(['k1', 'k8'])
  })

  it('adicionar na primeira coluna aumenta a contagem, entra no topo e não duplica o mesmo id', async () => {
    const { result } = await renderHook(() => useCards())
    await act(async () => {
      adicionarCard({ id: 'tarefa-1', columnId: 'novo', title: 'Padaria Estrela', clienteId: 1000 })
    })
    expect(naColuna(result.current, 'novo')).toHaveLength(3)
    expect(naColuna(result.current, 'novo')[0]!.id).toBe('tarefa-1')
    await act(async () => {
      adicionarCard({ id: 'tarefa-1', columnId: 'novo', title: 'Padaria Estrela', clienteId: 1000 })
    })
    expect(naColuna(result.current, 'novo')).toHaveLength(3)
  })

  it('dois leitores veem o mesmo estado', async () => {
    const a = await renderHook(() => useCards())
    const b = await renderHook(() => useCards())
    await act(async () => {
      moverCard('k2', 'qualificado', 0)
    })
    expect(b.result.current).toBe(a.result.current)
    expect(naColuna(b.result.current, 'qualificado')[0]!.id).toBe('k2')
  })
})

describe('agenda da demonstração', () => {
  it('começa com os 7 eventos, o evento novo entra na lista e restaurar o tira', async () => {
    const { result } = await renderHook(() => useEventos())
    expect(result.current).toHaveLength(7)
    expect(result.current).toEqual(demoEvents)
    await act(async () => {
      adicionarEvento({ title: 'Visita ao cliente', start: new Date(2026, 9, 6, 10, 30), location: 'Av. Central, 10' })
    })
    expect(result.current).toHaveLength(8)
    expect(result.current.at(-1)).toMatchObject({ title: 'Visita ao cliente', location: 'Av. Central, 10' })
    expect(new Set(result.current.map((e) => e.id)).size).toBe(8)
    await act(async () => {
      restaurarPlanejamento()
    })
    expect(result.current).toHaveLength(7)
  })
})
