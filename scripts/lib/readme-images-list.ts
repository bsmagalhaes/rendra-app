export interface Captura {
  nome: string
  rota: string
  codigo: string
  modo: 'claro' | 'escuro'
}

/** Celular em pé, 390x844 CSS px em escala 3 (1170x2532), como manda o padrão dos produtos mobile. */
export const VIEWPORT_CELULAR = { width: 390, height: 844 }
export const SCALE_CELULAR = 3
/** Faixa de status da moldura (altura do inset superior de um celular com recorte de câmera). */
export const ALTURA_STATUS = 44

// Nome de arquivo é `<modelo>-<tela>-mobile` (a moldura é apresentação, não outra captura). `T1-C4`
// é o modelo Safira com a paleta Ardósia, então na matriz o nome leva os dois: `matriz-<modelo>-<paleta>-mobile`
// (sem acento no nome do arquivo).
const MODELOS = ['safira', 'equilibrio', 'aurora'] as const
const PALETAS = ['safira', 'equilibrio', 'aurora', 'ardosia'] as const

const TELAS: Captura[] = [
  { nome: 'safira-home-mobile', rota: '/', codigo: 'T1-C1', modo: 'claro' },
  { nome: 'safira-componentes-mobile', rota: '/componentes', codigo: 'T1-C1', modo: 'claro' },
  { nome: 'equilibrio-tokens-mobile', rota: '/tokens', codigo: 'T2-C2', modo: 'claro' },
  { nome: 'aurora-galeria-mobile', rota: '/galeria', codigo: 'T3-C3', modo: 'claro' },
  { nome: 'aurora-escuro-mobile', rota: '/componentes', codigo: 'T3-C3', modo: 'escuro' },
  { nome: 'safira-login-mobile', rota: '/login', codigo: 'T1-C1', modo: 'claro' },
  { nome: 'equilibrio-painel-mobile', rota: '/painel', codigo: 'T2-C2', modo: 'claro' },
  { nome: 'aurora-configuracoes-mobile', rota: '/configuracoes', codigo: 'T3-C3', modo: 'claro' },
  // Segunda parte da demo (P3.17): telas de app simulado, em repouso e sem toast visível.
  { nome: 'safira-clientes-mobile', rota: '/clientes', codigo: 'T1-C1', modo: 'claro' },
  { nome: 'safira-cliente-mobile', rota: '/clientes/1000', codigo: 'T1-C1', modo: 'claro' },
  { nome: 'equilibrio-cadastro-mobile', rota: '/cadastro', codigo: 'T2-C2', modo: 'claro' },
  { nome: 'aurora-verificacao-mobile', rota: '/verificacao', codigo: 'T3-C3', modo: 'claro' },
  { nome: 'safira-tarefas-mobile', rota: '/tarefas', codigo: 'T1-C1', modo: 'claro' },
  // Terceira parte da demo (P4): atendimento (conversa aberta), agenda, funil e o painel no escuro.
  { nome: 'safira-atendimento-mobile', rota: '/atendimento/t1', codigo: 'T1-C1', modo: 'claro' },
  { nome: 'equilibrio-agenda-mobile', rota: '/agenda', codigo: 'T2-C2', modo: 'claro' },
  { nome: 'aurora-funil-mobile', rota: '/kanban', codigo: 'T3-C3', modo: 'claro' },
  { nome: 'safira-painel-escuro-mobile', rota: '/painel', codigo: 'T1-C1', modo: 'escuro' },
]

const MATRIZ: Captura[] = MODELOS.flatMap((modelo, m) =>
  PALETAS.map((paleta, p) => ({
    nome: `matriz-${modelo}-${paleta}-mobile`,
    rota: '/galeria',
    codigo: `T${m + 1}-C${p + 1}`,
    modo: 'claro' as const,
  })),
)

export const CAPTURAS: Captura[] = [...TELAS, ...MATRIZ]
