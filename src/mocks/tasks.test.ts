import { clients } from './clients'
import { tasks } from './tasks'

describe('mocks das tarefas', () => {
  it('as tarefas que citam um cliente da carteira trazem o clienteId dele', () => {
    const esperado: Record<number, number> = { 1: 1000, 2: 1009, 3: 1018, 4: 1027, 5: 1036, 6: 1045, 7: 1006, 9: 1015, 10: 1016, 12: 1017 }
    for (const t of tasks) {
      expect(t.clienteId).toBe(esperado[t.id])
      if (t.clienteId !== undefined) {
        const cliente = clients.find((c) => c.id === t.clienteId)!
        expect(t.titulo).toContain(cliente.nome)
      }
    }
  })

  it('as tarefas 8 e 11 nao citam cliente e ficam sem clienteId', () => {
    expect(tasks.find((t) => t.id === 8)!.clienteId).toBeUndefined()
    expect(tasks.find((t) => t.id === 11)!.clienteId).toBeUndefined()
    expect(tasks.filter((t) => t.clienteId === undefined)).toHaveLength(2)
  })
})
