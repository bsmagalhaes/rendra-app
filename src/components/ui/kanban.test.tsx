import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { Text } from 'react-native'
import { BrandProvider } from '../../brand/brand-provider'
import { nodesWithCode } from '../../test-utils/rendra-code'
import { Kanban, moveKanbanCard, type KanbanCard, type KanbanColumn } from './kanban'

const colunas: KanbanColumn[] = [
  { id: 'novo', title: 'Novo', tone: 'info' },
  { id: 'proposta', title: 'Proposta', tone: 'warning', limit: 3 },
  { id: 'ganho', title: 'Ganho', tone: 'success' },
]

const cartoes: KanbanCard[] = [
  {
    id: 'c1',
    columnId: 'novo',
    title: 'Padaria Estrela',
    subtitle: '12.345.678/0001-90',
    description: 'Quer trocar de fornecedor.',
    contact: { name: 'Ana Souza', phone: '(11) 99999-0000', email: 'ana@exemplo.com.br' },
    tags: [{ label: 'Quente', tone: 'error' }],
    assignee: 'Bruno Lima',
    dueDate: new Date(2026, 9, 12),
    values: { valor: 4800, mrr: 590 },
  },
  { id: 'c2', columnId: 'proposta', title: 'Clínica Aurora', values: { valor: 3000 } },
  { id: 'c3', columnId: 'proposta', title: 'Oficina Horizonte', values: { valor: 1800 } },
  { id: 'c4', columnId: 'proposta', title: 'Mercado Nova Era' },
  { id: 'c5', columnId: 'proposta', title: 'Escola Vale Verde' },
]

const campos = [
  { key: 'valor', label: 'Valor' },
  { key: 'mrr', label: 'MRR' },
]

const renderizar = (ui: React.ReactElement) => render(<BrandProvider>{ui}</BrandProvider>)

async function abrirColuna(nome: string) {
  await fireEvent.press(screen.getByRole('tab', { name: new RegExp(nome) }))
}

describe('Kanban: coluna e card', () => {
  it('a raiz carrega KANB-001 e o card mostra titulo, tags, contato, valores, data e responsavel', async () => {
    const { container } = await renderizar(<Kanban columns={colunas} cards={cartoes} valueFields={campos} aria-label="Funil" />)
    expect(nodesWithCode(container, 'KANB-001')).toHaveLength(1)
    expect(screen.getByText('Padaria Estrela')).toBeTruthy()
    expect(screen.getByText('12.345.678/0001-90')).toBeTruthy()
    expect(screen.getByText('Quer trocar de fornecedor.')).toBeTruthy()
    expect(screen.getByText('Quente')).toBeTruthy()
    expect(screen.getByText('Ana Souza')).toBeTruthy()
    expect(screen.getByText('(11) 99999-0000')).toBeTruthy()
    expect(screen.getByText('ana@exemplo.com.br')).toBeTruthy()
    expect(screen.getByText('R$ 4.800,00')).toBeTruthy()
    expect(screen.getByText('R$ 590,00')).toBeTruthy()
    expect(screen.getByText('12/10/2026')).toBeTruthy()
    expect(screen.getByLabelText('Bruno Lima')).toBeTruthy()
  })

  it('o cabecalho da coluna soma os valores de cada campo', async () => {
    await renderizar(<Kanban columns={colunas} cards={cartoes} valueFields={campos} aria-label="Funil" />)
    await abrirColuna('Proposta')
    expect(screen.getByText('Total Valor: R$ 4.800,00')).toBeTruthy()
    expect(screen.getByText('Total MRR: R$ 0,00')).toBeTruthy()
  })

  it('coluna acima do limite mostra count/limit em alerta (warning); dentro do limite, so a contagem', async () => {
    await renderizar(<Kanban columns={colunas} cards={cartoes} aria-label="Funil" />)
    expect(screen.getByTestId('kanban-count-novo').props.className).not.toContain('bg-warning-soft')
    await abrirColuna('Proposta')
    expect(screen.getByText('4/3')).toBeTruthy()
    expect(screen.getByTestId('kanban-count-proposta').props.className).toContain('bg-warning-soft')
  })

  it('o contador de cada aba acompanha a quantidade de cards da coluna', async () => {
    await renderizar(<Kanban columns={colunas} cards={cartoes} aria-label="Funil" />)
    expect(screen.getByRole('tab', { name: 'Proposta 4' })).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'Ganho 0' })).toBeTruthy()
  })

  it('coluna vazia mostra Nenhum card', async () => {
    await renderizar(<Kanban columns={colunas} cards={cartoes} aria-label="Funil" />)
    await abrirColuna('Ganho')
    expect(screen.getByText('Nenhum card')).toBeTruthy()
  })

  it('+ chama onAddCard e o card novo aparece na coluna', async () => {
    function Controlado() {
      const [lista, setLista] = useState(cartoes)
      return (
        <Kanban
          columns={colunas}
          cards={lista}
          onAddCard={(coluna) => setLista((l) => [...l, { id: 'novo-card', columnId: coluna, title: 'Card novo' }])}
          aria-label="Funil"
        />
      )
    }
    await renderizar(<Controlado />)
    await abrirColuna('Proposta')
    await fireEvent.press(screen.getByRole('button', { name: 'Adicionar card em Proposta' }))
    expect(screen.getByText('Card novo')).toBeTruthy()
    expect(screen.getByText('5/3')).toBeTruthy()
  })

  it('sem onAddCard nao ha botao de adicionar', async () => {
    await renderizar(<Kanban columns={colunas} cards={cartoes} aria-label="Funil" />)
    expect(screen.queryByRole('button', { name: /Adicionar card/ })).toBeNull()
  })

  it('onCardClick recebe o card tocado', async () => {
    const onCardClick = jest.fn()
    await renderizar(<Kanban columns={colunas} cards={cartoes} onCardClick={onCardClick} aria-label="Funil" />)
    await fireEvent.press(screen.getByText('Padaria Estrela'))
    expect(onCardClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'c1' }))
  })

  it('renderCard troca o conteudo padrao do card', async () => {
    const renderCard = (card: KanbanCard) => <Text>{`Meu card: ${card.title}`}</Text>
    await renderizar(<Kanban columns={colunas} cards={cartoes} renderCard={renderCard} aria-label="Funil" />)
    expect(screen.getByText('Meu card: Padaria Estrela')).toBeTruthy()
    expect(screen.queryByText('Padaria Estrela')).toBeNull()
  })

  it('o papel (group) fica na View que envolve o FlatList, nunca no FlatList; list quebraria o axe', async () => {
    await renderizar(<Kanban columns={colunas} cards={cartoes} aria-label="Funil" />)
    const envolvente = screen.getByLabelText('Cards em Novo')
    expect(envolvente.props.role).toBe('group')
    expect(screen.getByTestId('kanban-list-novo').props.role).toBeUndefined()
  })

  it('scrollEnabled e repassado ao FlatList (padrao true)', async () => {
    const { unmount } = await renderizar(<Kanban columns={colunas} cards={cartoes} aria-label="Funil" />)
    expect(screen.getByTestId('kanban-list-novo').props.scrollEnabled).toBe(true)
    await unmount()
    await renderizar(<Kanban columns={colunas} cards={cartoes} scrollEnabled={false} aria-label="Funil" />)
    expect(screen.getByTestId('kanban-list-novo').props.scrollEnabled).toBe(false)
  })
})

describe('Kanban: paginacao da coluna', () => {
  it('pageSize 2 com 5 cards mostra 2 e o aviso; chegar ao fim da lista mostra mais 2', async () => {
    const cinco = Array.from({ length: 5 }, (_, i) => ({ id: `p${i}`, columnId: 'novo', title: `Card ${i + 1}` }))
    await renderizar(<Kanban columns={colunas} cards={cinco} pageSize={2} aria-label="Funil" />)
    expect(screen.getAllByText(/^Card \d$/)).toHaveLength(2)
    expect(screen.getByText('Carregando mais cards...')).toBeTruthy()
    await fireEvent(screen.getByTestId('kanban-list-novo'), 'endReached')
    expect(screen.getAllByText(/^Card \d$/)).toHaveLength(4)
    await fireEvent(screen.getByTestId('kanban-list-novo'), 'endReached')
    expect(screen.getAllByText(/^Card \d$/)).toHaveLength(5)
    expect(screen.queryByText('Carregando mais cards...')).toBeNull()
  })

  it('no fim do que foi recebido, onLoadMore busca mais quando hasMore diz que ha', async () => {
    const onLoadMore = jest.fn()
    const dois = [
      { id: 'a', columnId: 'novo', title: 'A' },
      { id: 'b', columnId: 'novo', title: 'B' },
    ]
    await renderizar(
      <Kanban columns={colunas} cards={dois} pageSize={5} onLoadMore={onLoadMore} hasMore={(id) => id === 'novo'} aria-label="Funil" />,
    )
    expect(screen.getByText('Carregando mais cards...')).toBeTruthy()
    await fireEvent(screen.getByTestId('kanban-list-novo'), 'endReached')
    expect(onLoadMore).toHaveBeenCalledWith('novo')
  })

  it('sem hasMore, chegar ao fim nao chama onLoadMore', async () => {
    const onLoadMore = jest.fn()
    await renderizar(<Kanban columns={colunas} cards={cartoes} onLoadMore={onLoadMore} aria-label="Funil" />)
    await fireEvent(screen.getByTestId('kanban-list-novo'), 'endReached')
    expect(onLoadMore).not.toHaveBeenCalled()
  })
})

describe('Kanban: menu Mover para, destinos e reordenacao', () => {
  const tres = [
    { id: 'm1', columnId: 'novo', title: 'Primeiro' },
    { id: 'm2', columnId: 'novo', title: 'Segundo' },
    { id: 'm3', columnId: 'novo', title: 'Terceiro' },
  ]
  const destinos = [
    { id: 'ganho', label: 'Marcar como ganho', tone: 'success' as const },
    { id: 'perdido', label: 'Marcar como perdido', hint: 'Encerra o negócio' },
    { id: 'arquivar', label: 'Arquivar', disabled: true, disabledReason: 'Só depois de ganho ou perdido' },
  ]

  function Controlado(props: { dropTargets?: typeof destinos; onDropTarget?: (c: string, t: string) => void }) {
    const [lista, setLista] = useState<KanbanCard[]>(tres)
    return (
      <Kanban
        columns={colunas}
        cards={lista}
        onCardMove={(id, para, indice) => setLista((l) => moveKanbanCard(l, id, para, indice))}
        dropTargets={props.dropTargets}
        onDropTarget={props.onDropTarget}
        aria-label="Funil"
      />
    )
  }

  const ordem = () => screen.getAllByText(/^(Primeiro|Segundo|Terceiro)$/).map((n) => n.props.children)

  it('sem onCardMove nem dropTargets nao existe o menu de acoes', async () => {
    await renderizar(<Kanban columns={colunas} cards={tres} aria-label="Funil" />)
    expect(screen.queryByRole('button', { name: /Ações do card/ })).toBeNull()
  })

  it('abrir Ações do card mostra Mover para com as outras colunas e move o card de verdade', async () => {
    await renderizar(<Controlado />)
    await fireEvent.press(screen.getByRole('button', { name: 'Ações do card Primeiro' }))
    expect(screen.getByText('Mover para')).toBeTruthy()
    expect(screen.queryByRole('menuitem', { name: 'Novo' })).toBeNull()
    await fireEvent.press(screen.getByRole('menuitem', { name: 'Ganho' }))
    // o efeito esta na arvore: a aba de destino ganhou o card e a de origem perdeu
    expect(screen.getByRole('tab', { name: 'Ganho 1' })).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'Novo 2' })).toBeTruthy()
    expect(screen.queryByText('Primeiro')).toBeNull()
    await abrirColuna('Ganho')
    expect(screen.getByText('Primeiro')).toBeTruthy()
  })

  it('Mover para baixo troca a ordem dentro da coluna; Mover para cima volta', async () => {
    await renderizar(<Controlado />)
    expect(ordem()).toEqual(['Primeiro', 'Segundo', 'Terceiro'])
    await fireEvent.press(screen.getByRole('button', { name: 'Ações do card Primeiro' }))
    await fireEvent.press(screen.getByRole('menuitem', { name: 'Mover para baixo' }))
    expect(ordem()).toEqual(['Segundo', 'Primeiro', 'Terceiro'])
    await fireEvent.press(screen.getByRole('button', { name: 'Ações do card Primeiro' }))
    await fireEvent.press(screen.getByRole('menuitem', { name: 'Mover para cima' }))
    expect(ordem()).toEqual(['Primeiro', 'Segundo', 'Terceiro'])
  })

  it('o primeiro card nao sobe e o ultimo nao desce: os itens ficam desabilitados', async () => {
    await renderizar(<Controlado />)
    await fireEvent.press(screen.getByRole('button', { name: 'Ações do card Primeiro' }))
    expect(screen.getByRole('menuitem', { name: 'Mover para cima' }).props.accessibilityState.disabled).toBe(true)
    expect(screen.getByRole('menuitem', { name: 'Mover para baixo' }).props.accessibilityState.disabled).toBe(false)
  })

  it('com dropTargets a raiz vira KANB-002 e o menu lista os destinos', async () => {
    const onDropTarget = jest.fn()
    const { container } = await renderizar(<Controlado dropTargets={destinos} onDropTarget={onDropTarget} />)
    expect(nodesWithCode(container, 'KANB-002')).toHaveLength(1)
    expect(nodesWithCode(container, 'KANB-001')).toHaveLength(0)
    await fireEvent.press(screen.getByRole('button', { name: 'Ações do card Segundo' }))
    expect(screen.getByText(/Marcar como perdido.*Encerra o negócio/s)).toBeTruthy()
    await fireEvent.press(screen.getByRole('menuitem', { name: /Marcar como ganho/ }))
    expect(onDropTarget).toHaveBeenCalledWith('m2', 'ganho')
  })

  it('destino desabilitado mostra o motivo e nao dispara nada; o card continua na coluna de origem', async () => {
    const onDropTarget = jest.fn()
    await renderizar(<Controlado dropTargets={destinos} onDropTarget={onDropTarget} />)
    await fireEvent.press(screen.getByRole('button', { name: 'Ações do card Segundo' }))
    expect(screen.getByText(/Arquivar.*Só depois de ganho ou perdido/s)).toBeTruthy()
    await fireEvent.press(screen.getByRole('menuitem', { name: /Arquivar/ }))
    expect(onDropTarget).not.toHaveBeenCalled()
    expect(screen.getByRole('tab', { name: 'Novo 3' })).toBeTruthy()
  })

  it('so dropTargets, sem onCardMove: o menu tem os destinos e nao tem mover nem reordenar', async () => {
    await renderizar(<Kanban columns={colunas} cards={tres} dropTargets={destinos} onDropTarget={() => {}} aria-label="Funil" />)
    await fireEvent.press(screen.getByRole('button', { name: 'Ações do card Primeiro' }))
    expect(screen.getByText(/Marcar como ganho/)).toBeTruthy()
    expect(screen.queryByText('Mover para baixo')).toBeNull()
    expect(screen.queryByRole('menuitem', { name: 'Ganho' })).toBeNull()
  })
})
