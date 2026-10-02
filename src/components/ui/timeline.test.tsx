import { render, screen } from '@testing-library/react-native'
import { Star } from 'lucide-react-native'
import { BrandProvider } from '../../brand/brand-provider'
import { nodesWithCode } from '../../test-utils/rendra-code'
import { Timeline, type TimelineEvent } from './timeline'

const eventos: TimelineEvent[] = [
  { id: '1', title: 'Contrato assinado', description: 'Plano Profissional, 12 meses.', date: '22/09/2026 14:30', status: 'succeeded' },
  { id: '2', title: 'Proposta enviada', date: '18/09/2026 09:10', tone: 'info' },
  { id: '3', title: 'Cobrança automática', date: '15/09/2026', status: 'failed' },
  { id: '4', title: 'Lembrete de renovação', date: '13/09/2026', status: 'skipped' },
  { id: '5', title: 'Cliente cadastrado', date: '02/09/2026' },
]

const renderizar = (events: TimelineEvent[]) => render(<BrandProvider><Timeline events={events} /></BrandProvider>)

describe('Timeline', () => {
  it('a raiz carrega o codigo TLN-001 e o papel de lista', async () => {
    const { container } = await renderizar(eventos)
    expect(nodesWithCode(container, 'TLN-001')).toHaveLength(1)
    expect(screen.getByTestId('timeline').props.role).toBe('list')
    expect(screen.getAllByTestId(/^timeline-item-/)).toHaveLength(eventos.length)
    expect(screen.getByTestId('timeline-item-1').props.role).toBe('listitem')
  })

  it('o resultado aparece em texto, nunca so pela cor', async () => {
    await renderizar(eventos)
    expect(screen.getByText('Concluído')).toBeTruthy()
    expect(screen.getByText('Falhou')).toBeTruthy()
    expect(screen.getByText('Ignorado')).toBeTruthy()
  })

  it('mostra titulo, descricao e data curta de cada evento', async () => {
    await renderizar(eventos)
    expect(screen.getByText('Contrato assinado')).toBeTruthy()
    expect(screen.getByText('Plano Profissional, 12 meses.')).toBeTruthy()
    expect(screen.getByText('22/09/2026 14:30')).toBeTruthy()
  })

  it('evento sem status e sem icone desenha o ponto; com status ou icone nao', async () => {
    await renderizar([...eventos, { id: '6', title: 'Com icone', date: 'hoje', icon: Star }])
    expect(screen.getByTestId('timeline-ponto-5')).toBeTruthy()
    expect(screen.getByTestId('timeline-ponto-2')).toBeTruthy()
    expect(screen.queryByTestId('timeline-ponto-1')).toBeNull()
    expect(screen.queryByTestId('timeline-ponto-6')).toBeNull()
    expect(screen.getByTestId('timeline-icone-6', { includeHiddenElements: true })).toBeTruthy()
    expect(screen.getByTestId('timeline-icone-1', { includeHiddenElements: true })).toBeTruthy()
  })

  it('a linha vertical existe entre eventos, nunca depois do ultimo', async () => {
    await renderizar(eventos)
    expect(screen.getAllByTestId('timeline-line')).toHaveLength(eventos.length - 1)
  })

  it('o tom do evento escolhe a cor do marcador e o status tem precedencia', async () => {
    await renderizar(eventos)
    expect(screen.getByTestId('timeline-marcador-2').props.className).toContain('bg-info-soft')
    expect(screen.getByTestId('timeline-marcador-3').props.className).toContain('bg-destructive-soft')
    expect(screen.getByTestId('timeline-marcador-1').props.className).toContain('bg-success-soft')
    expect(screen.getByTestId('timeline-marcador-5').props.className).toContain('bg-muted')
  })

  it('sem eventos nao desenha nenhum item', async () => {
    await renderizar([])
    expect(screen.queryAllByTestId(/^timeline-item-/)).toHaveLength(0)
  })
})
