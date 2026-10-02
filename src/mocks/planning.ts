import type { CalendarEvent } from '../components/ui/calendar'
import type { KanbanCard, KanbanColumn } from '../components/ui/kanban'
import { clients } from './clients'

/** Card do funil: o card do componente mais o cliente da carteira a que ele se refere. */
export type CardFunil = KanbanCard & { clienteId?: number }

/** CNPJ do cliente na carteira (o card mostra o mesmo valor do detalhe). */
export const cnpjDoCliente = (clienteId: number) => clients.find((c) => c.id === clienteId)?.cnpj

/** Data de referencia dos exemplos de planejamento (fixa, nada de Date.now): segunda, 05/10/2026. */
export const referencia = new Date(2026, 9, 5)

/** Eventos de demonstracao em torno da data de referencia, com datas fixas. */
export const demoEvents: CalendarEvent[] = [
  { id: 'ev-1', title: 'Reunião de equipe', start: new Date(2026, 9, 5, 9, 0), end: new Date(2026, 9, 5, 10, 0), tone: 'primary', location: 'Sala de reuniões' },
  { id: 'ev-2', title: 'Visita: Padaria Bom Grão', start: new Date(2026, 9, 5, 14, 0), end: new Date(2026, 9, 5, 15, 30), tone: 'success', location: 'Rua das Acácias, 120', description: 'Conversa sobre a renovação do contrato.' },
  { id: 'ev-3', title: 'Feriado municipal', start: new Date(2026, 9, 12), allDay: true, tone: 'warning' },
  { id: 'ev-4', title: 'Renovação: Clínica Aurora', start: new Date(2026, 9, 7, 11, 0), end: new Date(2026, 9, 7, 12, 0), tone: 'info' },
  { id: 'ev-5', title: 'Treinamento da equipe', start: new Date(2026, 9, 8, 15, 0), end: new Date(2026, 9, 8, 17, 0), tone: 'neutral' },
  { id: 'ev-6', title: 'Cobrança: fatura em atraso', start: new Date(2026, 9, 9, 10, 0), tone: 'error' },
  { id: 'ev-7', title: 'Fechamento do mês', start: new Date(2026, 9, 30, 17, 0), end: new Date(2026, 9, 30, 18, 0), tone: 'primary' },
]

/** Colunas do funil comercial de demonstracao; a de proposta tem limite de 3 cards. */
export const pipelineColumns: KanbanColumn[] = [
  { id: 'novo', title: 'Novo contato', tone: 'info' },
  { id: 'qualificado', title: 'Qualificado', tone: 'primary' },
  { id: 'proposta', title: 'Proposta', tone: 'warning', limit: 3 },
  { id: 'fechamento', title: 'Fechamento', tone: 'success' },
]

/** Cards do funil, com valores em reais (datas fixas). */
export const demoCards: CardFunil[] = [
  {
    id: 'k1',
    columnId: 'novo',
    title: 'Padaria Estrela',
    clienteId: 1000,
    subtitle: cnpjDoCliente(1000),
    contact: { name: 'Ana Souza', phone: '(11) 99999-0001' },
    tags: [{ label: 'Indicação', tone: 'info' }],
    assignee: 'Bruno Lima',
    dueDate: new Date(2026, 9, 12),
    values: { ps: 4800, mrr: 590 },
  },
  { id: 'k2', columnId: 'novo', title: 'Oficina Horizonte', clienteId: 1018,
    subtitle: cnpjDoCliente(1018), assignee: 'Carla Dias', dueDate: new Date(2026, 9, 14), values: { ps: 2500, mrr: 290 } },
  {
    id: 'k3',
    columnId: 'qualificado',
    title: 'Clínica Aurora',
    clienteId: 1009,
    subtitle: cnpjDoCliente(1009),
    description: 'Quer integrar a agenda com o financeiro.',
    tags: [{ label: 'Quente', tone: 'error' }],
    assignee: 'Bruno Lima',
    dueDate: new Date(2026, 9, 9),
    values: { ps: 9800, mrr: 1290 },
  },
  { id: 'k4', columnId: 'proposta', title: 'Mercado Nova Era', clienteId: 1036,
    subtitle: cnpjDoCliente(1036), assignee: 'Carla Dias', dueDate: new Date(2026, 9, 6), values: { ps: 7200, mrr: 790 } },
  { id: 'k5', columnId: 'proposta', title: 'Escola Vale Verde', clienteId: 1027,
    subtitle: cnpjDoCliente(1027), assignee: 'Diego Melo', dueDate: new Date(2026, 9, 8), values: { ps: 12500, mrr: 1490 } },
  { id: 'k6', columnId: 'proposta', title: 'Metalúrgica Ponte Alta', clienteId: 1045,
    subtitle: cnpjDoCliente(1045), assignee: 'Bruno Lima', dueDate: new Date(2026, 9, 15), values: { ps: 18000, mrr: 2190 } },
  { id: 'k7', columnId: 'proposta', title: 'Farmácia Estrela', clienteId: 1006,
    subtitle: cnpjDoCliente(1006), assignee: 'Diego Melo', dueDate: new Date(2026, 9, 16), values: { ps: 3900, mrr: 450 } },
  { id: 'k8', columnId: 'fechamento', title: 'Transportes Aurora', clienteId: 1015,
    subtitle: cnpjDoCliente(1015), assignee: 'Carla Dias', dueDate: new Date(2026, 9, 2), values: { ps: 15400, mrr: 1790 } },
]
