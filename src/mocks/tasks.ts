export type Prioridade = 'Alta' | 'Média' | 'Baixa'

export interface Tarefa {
  id: number
  titulo: string
  prioridade: Prioridade
  prazo: string
  concluida: boolean
}

/** Tarefas de demonstração, com datas fixas (nada de Date.now). */
export const tasks: Tarefa[] = [
  { id: 1, titulo: 'Enviar proposta para a Padaria Estrela', prioridade: 'Alta', prazo: '02/10/2026', concluida: false },
  { id: 2, titulo: 'Renovar contrato da Clínica Aurora', prioridade: 'Alta', prazo: '05/10/2026', concluida: false },
  { id: 3, titulo: 'Ligar para a Oficina Horizonte', prioridade: 'Média', prazo: '06/10/2026', concluida: false },
  { id: 4, titulo: 'Conferir a fatura da Escola Vale Verde', prioridade: 'Média', prazo: '08/10/2026', concluida: false },
  { id: 5, titulo: 'Atualizar o cadastro do Mercado Nova Era', prioridade: 'Baixa', prazo: '09/10/2026', concluida: false },
  { id: 6, titulo: 'Agendar reunião com a Metalúrgica Ponte Alta', prioridade: 'Média', prazo: '12/10/2026', concluida: false },
  { id: 7, titulo: 'Revisar o plano da Farmácia Estrela', prioridade: 'Baixa', prazo: '14/10/2026', concluida: false },
  { id: 8, titulo: 'Preparar o relatório mensal de setembro', prioridade: 'Alta', prazo: '30/09/2026', concluida: true },
  { id: 9, titulo: 'Responder o chamado da Transportes Aurora', prioridade: 'Média', prazo: '28/09/2026', concluida: true },
  { id: 10, titulo: 'Cobrar a fatura em atraso da Padaria Horizonte', prioridade: 'Alta', prazo: '20/10/2026', concluida: false },
  { id: 11, titulo: 'Organizar os documentos do último trimestre', prioridade: 'Baixa', prazo: '25/10/2026', concluida: false },
  { id: 12, titulo: 'Treinar a equipe da Clínica Horizonte', prioridade: 'Média', prazo: '29/10/2026', concluida: false },
]
