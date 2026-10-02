import type { BadgeTone } from '../components/ui/badge'

export type Situacao = 'Ativo' | 'Inativo' | 'Em análise'

export interface Cliente {
  id: number
  nome: string
  email: string
  telefone: string
  cnpj: string
  segmento: string
  situacao: Situacao
  cidade: string
  mrr: number
}

export interface Contrato {
  id: string
  titulo: string
  valor: number
  inicio: string
  situacao: 'Vigente' | 'Encerrado'
}

export interface Atividade {
  id: string
  titulo: string
  data: string
  tone: 'success' | 'warning' | 'neutral'
}

export interface MesReceita {
  mes: string
  receita: number
  novosClientes: number
}

export const segmentos = ['Varejo', 'Serviços', 'Saúde', 'Educação', 'Indústria'] as const

export const situacoes: Situacao[] = ['Ativo', 'Inativo', 'Em análise']

export const statusTone: Record<Situacao, BadgeTone> = {
  Ativo: 'success',
  Inativo: 'error',
  'Em análise': 'warning',
}

const tipos = [
  { nome: 'Padaria', segmento: 'Varejo' },
  { nome: 'Clínica', segmento: 'Saúde' },
  { nome: 'Oficina', segmento: 'Serviços' },
  { nome: 'Escola', segmento: 'Educação' },
  { nome: 'Mercado', segmento: 'Varejo' },
  { nome: 'Metalúrgica', segmento: 'Indústria' },
  { nome: 'Farmácia', segmento: 'Saúde' },
  { nome: 'Transportes', segmento: 'Serviços' },
] as const

const sobrenomes = ['Estrela', 'Aurora', 'Horizonte', 'Vale Verde', 'Nova Era', 'Ponte Alta'] as const

const cidades = [
  'São Paulo',
  'Campinas',
  'Belo Horizonte',
  'Curitiba',
  'Porto Alegre',
  'Salvador',
  'Recife',
  'Goiânia',
] as const

const situacaoPorPosicao: Situacao[] = [
  'Ativo',
  'Ativo',
  'Ativo',
  'Ativo',
  'Ativo',
  'Inativo',
  'Inativo',
  'Em análise',
]

const digitos = (n: number, tamanho: number) => String(n).padStart(tamanho, '0')

function digitoCnpj(base: number[]) {
  const pesos = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const soma = base.reduce((acc, d, i) => acc + d * pesos[i]!, 0)
  const resto = soma % 11
  return resto < 2 ? 0 : 11 - resto
}

/** CNPJ fictício, com dígitos verificadores válidos, derivado só do índice (sem aleatoriedade). */
function cnpjDe(indice: number) {
  const base = `${digitos(11222 + indice * 37, 8)}0001`.split('').map(Number)
  const d1 = digitoCnpj(base)
  const d2 = digitoCnpj([...base, d1])
  const s = [...base, d1, d2].join('')
  return `${s.slice(0, 2)}.${s.slice(2, 5)}.${s.slice(5, 8)}/${s.slice(8, 12)}-${s.slice(12)}`
}

function slug(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export const clients: Cliente[] = Array.from({ length: 48 }, (_, i) => {
  const tipo = tipos[i % tipos.length]!
  const nome = `${tipo.nome} ${sobrenomes[Math.floor(i / tipos.length)]!}`
  return {
    id: 1000 + i,
    nome,
    email: `${slug(nome)}@exemplo.com.br`,
    telefone: `(11) 9${digitos(4000 + i * 13, 4)}-${digitos(1000 + i * 29, 4)}`,
    cnpj: cnpjDe(i),
    segmento: tipo.segmento,
    situacao: situacaoPorPosicao[i % situacaoPorPosicao.length]!,
    cidade: cidades[(i * 3) % cidades.length]!,
    mrr: 490 + (i % 9) * 260,
  }
})

export interface FiltroClientes {
  busca?: string
  situacao?: Situacao
  segmento?: string
  pagina?: number
  porPagina?: number
  /** Carteira a filtrar; padrão: os 48 clientes de exemplo. */
  base?: readonly Cliente[]
}

export function filterClients({ busca, situacao, segmento, pagina = 1, porPagina = 10, base = clients }: FiltroClientes = {}) {
  const termo = busca?.trim().toLowerCase() ?? ''
  const todos = base.filter(
    (c) =>
      (!termo || c.nome.toLowerCase().includes(termo)) &&
      (!situacao || c.situacao === situacao) &&
      (!segmento || c.segmento === segmento),
  )
  const inicio = (pagina - 1) * porPagina
  return { itens: todos.slice(inicio, inicio + porPagina), total: todos.length }
}

export function findClient(id: number) {
  return clients.find((c) => c.id === id)
}

export function contractsOf(id: number): Contrato[] {
  const cliente = findClient(id)
  if (!cliente) return []
  const base = cliente.mrr
  const dia = digitos(1 + (id % 27), 2)
  return [
    { id: `${id}-1`, titulo: 'Plano mensal', valor: base, inicio: `${dia}/03/2026`, situacao: 'Vigente' },
    { id: `${id}-2`, titulo: 'Implantação', valor: base * 2, inicio: `${dia}/01/2026`, situacao: 'Encerrado' },
    {
      id: `${id}-3`,
      titulo: 'Suporte estendido',
      valor: Math.round(base * 0.4),
      inicio: `${dia}/06/2026`,
      situacao: cliente.situacao === 'Inativo' ? 'Encerrado' : 'Vigente',
    },
  ]
}

/** Atividade recente do cliente (datas fixas, a mais nova primeiro). */
export function activityOf(id: number): Atividade[] {
  const cliente = findClient(id)
  if (!cliente) return []
  const emAnalise = cliente.situacao === 'Em análise'
  return [
    { id: `${id}-a1`, titulo: 'Fatura de setembro paga', data: '29/09/2026', tone: 'success' },
    { id: `${id}-a2`, titulo: 'Contrato renovado', data: '15/09/2026', tone: 'neutral' },
    {
      id: `${id}-a3`,
      titulo: emAnalise ? 'Documentos em análise' : 'Chamado de suporte resolvido',
      data: '02/09/2026',
      tone: emAnalise ? 'warning' : 'success',
    },
    { id: `${id}-a4`, titulo: 'Cadastro concluído', data: '10/03/2026', tone: 'neutral' },
  ]
}

/** Receita e novos clientes dos últimos 12 meses (o mais antigo primeiro), valores fixos. */
export const monthly: MesReceita[] = [
  { mes: 'Out/2025', receita: 41200, novosClientes: 3 },
  { mes: 'Nov/2025', receita: 43850, novosClientes: 4 },
  { mes: 'Dez/2025', receita: 47100, novosClientes: 2 },
  { mes: 'Jan/2026', receita: 44300, novosClientes: 5 },
  { mes: 'Fev/2026', receita: 46900, novosClientes: 4 },
  { mes: 'Mar/2026', receita: 49750, novosClientes: 6 },
  { mes: 'Abr/2026', receita: 51200, novosClientes: 5 },
  { mes: 'Mai/2026', receita: 53480, novosClientes: 7 },
  { mes: 'Jun/2026', receita: 52100, novosClientes: 4 },
  { mes: 'Jul/2026', receita: 55900, novosClientes: 6 },
  { mes: 'Ago/2026', receita: 58300, novosClientes: 8 },
  { mes: 'Set/2026', receita: 61300, novosClientes: 7 },
]

const somaReceita = (meses: MesReceita[]) => meses.reduce((soma, m) => soma + m.receita, 0)

/**
 * Soma de receita e de novos clientes nos últimos `meses` meses. `variacaoReceita` (em %) compara
 * com o período anterior do mesmo tamanho e só existe quando os 12 meses de `monthly` o cobrem.
 */
export function resumoPeriodo(meses: number) {
  const recorte = monthly.slice(-meses)
  const anterior = monthly.slice(-2 * meses, -meses)
  const receita = somaReceita(recorte)
  return {
    receita,
    novosClientes: recorte.reduce((soma, m) => soma + m.novosClientes, 0),
    variacaoReceita:
      anterior.length === meses ? Math.round((receita / somaReceita(anterior) - 1) * 1000) / 10 : undefined,
  }
}
