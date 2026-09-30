export interface Notificacao {
  id: number
  titulo: string
  descricao: string
  data: string
}

/** Notificações de demonstração, com datas fixas. */
export const notifications: Notificacao[] = [
  { id: 1, titulo: 'Fatura paga', descricao: 'A Padaria Estrela pagou a fatura de setembro.', data: '29/09/2026' },
  { id: 2, titulo: 'Novo cliente', descricao: 'A Clínica Aurora concluiu o cadastro.', data: '28/09/2026' },
  { id: 3, titulo: 'Contrato a vencer', descricao: 'O contrato da Oficina Horizonte vence em 15/10/2026.', data: '27/09/2026' },
  { id: 4, titulo: 'Tarefa concluída', descricao: 'O relatório mensal de setembro foi entregue.', data: '26/09/2026' },
]
