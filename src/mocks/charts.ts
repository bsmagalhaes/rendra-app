/** Dados de demonstração dos gráficos: valores fixos, determinísticos, sem dado real. */

export interface MesComMeta {
  mes: string
  receita: number
  meta: number
}

/** Receita e meta dos últimos 12 meses (o mais antigo primeiro). */
export const receitaMensal: MesComMeta[] = [
  { mes: 'Out', receita: 42100, meta: 40000 },
  { mes: 'Nov', receita: 45800, meta: 42000 },
  { mes: 'Dez', receita: 51200, meta: 45000 },
  { mes: 'Jan', receita: 39800, meta: 43000 },
  { mes: 'Fev', receita: 44300, meta: 44000 },
  { mes: 'Mar', receita: 48900, meta: 46000 },
  { mes: 'Abr', receita: 50100, meta: 47000 },
  { mes: 'Mai', receita: 53600, meta: 49000 },
  { mes: 'Jun', receita: 55200, meta: 51000 },
  { mes: 'Jul', receita: 54100, meta: 52000 },
  { mes: 'Ago', receita: 58700, meta: 54000 },
  { mes: 'Set', receita: 61300, meta: 56000 },
]

export interface SegmentoClientes {
  segmento: string
  clientes: number
}

const segmentos = ['Varejo', 'Saúde', 'Serviços', 'Educação', 'Indústria']

/** Clientes por segmento, do maior para o menor (só os segmentos da carteira). */
export const porSegmento: SegmentoClientes[] = segmentos.map((segmento, i) => ({ segmento, clientes: 18 - i * 2 }))

/** Funil comercial do mês. */
export const funilVendas = [
  { label: 'Visitas', value: 4200 },
  { label: 'Contatos', value: 1180 },
  { label: 'Propostas', value: 320 },
  { label: 'Fechados', value: 96 },
]

/** Meta do mês para o velocímetro. */
export const metaDoMes = { value: 61300, max: 80000, target: 70000, label: 'Receita do mês' }
