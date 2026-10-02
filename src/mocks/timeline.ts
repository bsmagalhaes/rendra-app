import type { TimelineEvent } from '../components/ui/timeline'

/** Historico de um contrato, para a vitrine da Timeline (datas fixas). */
export const historicoContrato: TimelineEvent[] = [
  { id: '1', title: 'Contrato assinado', description: 'Plano Profissional, 12 meses.', date: '22/09/2026 14:30', status: 'succeeded' },
  { id: '2', title: 'Proposta enviada', date: '18/09/2026 09:10', tone: 'info' },
  { id: '3', title: 'Cobrança automática', description: 'Cartão recusado pelo banco.', date: '15/09/2026', status: 'failed' },
  { id: '4', title: 'Lembrete de renovação', description: 'Cliente já tinha renovado antes.', date: '13/09/2026', status: 'skipped' },
  { id: '5', title: 'Cliente cadastrado', date: '02/09/2026' },
]
