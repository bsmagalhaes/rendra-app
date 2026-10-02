import { Text } from 'react-native'
import { fireEvent, render, waitFor, within } from '@testing-library/react-native'
import { BrandProvider } from '../../brand/brand-provider'
import { RendraNavigationProvider } from '../../navigation/rendra-navigation'
import { formatCurrency } from '../../lib/masks'
import { nodesWithCode } from '../../test-utils/rendra-code'
import { Table, type TableColumn, type TableProps } from './table'

interface Cliente {
  id: string
  nome: string
  email: string | null
  plano: string
  mensalidade: number
  usuarios: number
  desde: Date
  status: string
}

const clientes: Cliente[] = [
  { id: '1', nome: 'Padaria Estrela', email: 'contato@estrela.com', plano: 'Pro', mensalidade: 1250, usuarios: 1234, desde: new Date(2026, 0, 15), status: 'Ativo' },
  { id: '2', nome: 'Clínica Aurora', email: null, plano: 'Basic', mensalidade: 300.5, usuarios: 8, desde: new Date(2025, 5, 2), status: 'Inativo' },
  { id: '3', nome: 'Oficina Horizonte', email: 'oficina@horizonte.com', plano: 'Pro', mensalidade: 980, usuarios: 45, desde: new Date(2026, 7, 30), status: 'Ativo' },
]

const colunas: TableColumn<Cliente>[] = [
  { id: 'nome', header: 'Nome', accessor: (c) => c.nome, mobile: 'primary' },
  { id: 'plano', header: 'Plano', accessor: (c) => c.plano, mobile: 'primary' },
  { id: 'email', header: 'E-mail', accessor: (c) => c.email, mobile: 'secondary' },
  { id: 'mensalidade', header: 'Mensalidade', accessor: (c) => c.mensalidade, kind: 'currency' },
  { id: 'usuarios', header: 'Usuários', accessor: (c) => c.usuarios, kind: 'number' },
  { id: 'desde', header: 'Cliente desde', accessor: (c) => c.desde, kind: 'date' },
  { id: 'status', header: 'Situação', accessor: (c) => c.status, kind: 'badge', badgeTone: (c) => (c.status === 'Ativo' ? 'success' : 'neutral'), mobile: 'primary' },
]

function arvore(props: Partial<TableProps<Cliente>> = {}, navigate = jest.fn()) {
  return (
    <BrandProvider>
      <RendraNavigationProvider value={{ navigate }}>
        <Table<Cliente> data={clientes} columns={colunas} getRowId={(c) => c.id} accessibilityLabel="Clientes" {...props} />
      </RendraNavigationProvider>
    </BrandProvider>
  )
}

const ids = (tela: { getAllByTestId: (m: RegExp) => { props: { testID?: string } }[] }) =>
  tela.getAllByTestId(/^table-linha-[^-]+$/).map((n) => n.props.testID!.replace('table-linha-', ''))

describe('Table (lista de cards)', () => {
  it('N linhas viram N cards; o título é a primeira coluna primary e as outras primary vêm abaixo com o rótulo acessível', async () => {
    const tela = await render(arvore())
    expect(ids(tela)).toEqual(['1', '2', '3'])
    const card = within(tela.getByTestId('table-linha-1'))
    expect(card.getByText('Padaria Estrela')).toBeTruthy()
    expect(card.getByText('Pro')).toBeTruthy()
    expect(card.getByLabelText('Plano: Pro')).toBeTruthy()
    expect(card.getByText('Ativo')).toBeTruthy()
  })

  it('os detalhes (colunas secondary) só aparecem depois de "Ver detalhes", com os rótulos, e "Ocultar detalhes" recolhe', async () => {
    const tela = await render(arvore())
    const card = within(tela.getByTestId('table-linha-1'))
    expect(card.queryByText('E-mail')).toBeNull()
    expect(card.queryByText('contato@estrela.com')).toBeNull()
    const botao = card.getByRole('button', { name: 'Ver detalhes' })
    expect(botao.props.accessibilityState.expanded).toBe(false)
    await fireEvent.press(botao)
    expect(card.getByText('E-mail')).toBeTruthy()
    expect(card.getByText('contato@estrela.com')).toBeTruthy()
    expect(card.getByText('Mensalidade')).toBeTruthy()
    expect(card.getByText('Usuários')).toBeTruthy()
    expect(card.getByText('Cliente desde')).toBeTruthy()
    expect(card.getByRole('button', { name: 'Ocultar detalhes' }).props.accessibilityState.expanded).toBe(true)
    await fireEvent.press(card.getByRole('button', { name: 'Ocultar detalhes' }))
    expect(card.queryByText('contato@estrela.com')).toBeNull()
  })

  it('kind formata número, moeda, data e selo; vazio vira "-"', async () => {
    const tela = await render(arvore())
    const um = within(tela.getByTestId('table-linha-1'))
    await fireEvent.press(um.getByRole('button', { name: 'Ver detalhes' }))
    expect(um.getByText('1.234')).toBeTruthy()
    expect(um.getByText(formatCurrency(1250))).toBeTruthy()
    expect(um.getByText('15/01/2026')).toBeTruthy()
    const dois = within(tela.getByTestId('table-linha-2'))
    await fireEvent.press(dois.getByRole('button', { name: 'Ver detalhes' }))
    expect(dois.getByText('-')).toBeTruthy()
    expect(dois.getByText(formatCurrency(300.5))).toBeTruthy()
  })

  it('cell tem prioridade e renderiza conteúdo próprio', async () => {
    const tela = await render(
      arvore({ columns: [{ id: 'nome', header: 'Nome', accessor: (c) => c.nome, mobile: 'primary', cell: (c) => <Text>{`Cliente ${c.nome.toUpperCase()}`}</Text> }] }),
    )
    expect(tela.getByText('Cliente PADARIA ESTRELA')).toBeTruthy()
    expect(tela.queryByText('Padaria Estrela')).toBeNull()
  })

  it('mobile "hidden" fica fora do card, mesmo depois de "Ver detalhes"', async () => {
    const tela = await render(
      arvore({
        columns: [
          colunas[0]!,
          { id: 'email', header: 'E-mail', accessor: (c) => c.email, mobile: 'secondary' },
          { id: 'plano', header: 'Plano', accessor: (c) => c.plano, mobile: 'hidden' },
        ],
      }),
    )
    const card = within(tela.getByTestId('table-linha-1'))
    await fireEvent.press(card.getByRole('button', { name: 'Ver detalhes' }))
    expect(card.getByText('contato@estrela.com')).toBeTruthy()
    expect(card.queryByText('Plano')).toBeNull()
    expect(card.queryByText('Pro')).toBeNull()
  })

  it('details põe linhas extras abaixo do valor e ignora vazios', async () => {
    const tela = await render(
      arvore({ columns: [{ id: 'nome', header: 'Nome', accessor: (c) => c.nome, mobile: 'primary', details: (c) => [c.email, '', null, `Plano ${c.plano}`] }] }),
    )
    const card = within(tela.getByTestId('table-linha-1'))
    expect(card.getByText('contato@estrela.com')).toBeTruthy()
    expect(card.getByText('Plano Pro')).toBeTruthy()
    const dois = within(tela.getByTestId('table-linha-2'))
    expect(dois.getByText('Plano Basic')).toBeTruthy()
  })

  it('statusLast manda as colunas selo para o fim (a primeira primary vira o título); statusLast={false} mantém a ordem', async () => {
    const statusPrimeiro: TableColumn<Cliente>[] = [colunas[6]!, colunas[0]!]
    const tela = await render(arvore({ columns: statusPrimeiro }))
    expect(within(tela.getByTestId('table-titulo-1')).getByText('Padaria Estrela')).toBeTruthy()
    expect(within(tela.getByTestId('table-titulo-1')).queryByText('Ativo')).toBeNull()
    await tela.rerender(arvore({ columns: statusPrimeiro, statusLast: false }))
    expect(within(tela.getByTestId('table-titulo-1')).getByText('Ativo')).toBeTruthy()
    expect(within(tela.getByTestId('table-titulo-1')).queryByText('Padaria Estrela')).toBeNull()
  })

  it('href navega pelo roteador e vira link', async () => {
    const navigate = jest.fn()
    const tela = await render(
      arvore({ columns: [{ id: 'nome', header: 'Nome', accessor: (c) => c.nome, mobile: 'primary', href: (c) => `/clientes/${c.id}` }] }, navigate),
    )
    const link = within(tela.getByTestId('table-linha-3')).getByRole('link')
    await fireEvent.press(link)
    expect(navigate).toHaveBeenCalledWith('/clientes/3')
  })

  it('sem linhas mostra o estado vazio com título, descrição e ação; com globalFilter mostra "Nenhum resultado"', async () => {
    const vazio = { title: 'Nenhum cliente', description: 'Cadastre o primeiro.', action: <Text>Novo cliente</Text> }
    const tela = await render(arvore({ data: [], empty: vazio }))
    expect(tela.getByText('Nenhum cliente')).toBeTruthy()
    expect(tela.getByText('Cadastre o primeiro.')).toBeTruthy()
    expect(tela.getByText('Novo cliente')).toBeTruthy()
    await tela.rerender(arvore({ globalFilter: 'zzz', empty: vazio }))
    expect(tela.getByText('Nenhum resultado')).toBeTruthy()
    expect(tela.getByText('Tente outros termos ou limpe os filtros.')).toBeTruthy()
    expect(tela.queryByText('Novo cliente')).toBeNull()
    await tela.rerender(arvore({ data: [] }))
    expect(tela.getByText('Nada por aqui ainda')).toBeTruthy()
  })

  it('loading mostra 4 esqueletos no lugar dos cards e sem paginação', async () => {
    const tela = await render(arvore({ loading: true }))
    expect(tela.getAllByTestId(/^table-esqueleto-/)).toHaveLength(4)
    expect(tela.queryAllByTestId(/^table-linha-[^-]+$/)).toHaveLength(0)
    expect(tela.queryByLabelText('Paginação')).toBeNull()
  })

  it('error mostra a mensagem e "Tentar de novo" chama onRetry; sem onRetry o botão não existe', async () => {
    const onRetry = jest.fn()
    const tela = await render(arvore({ error: 'Falha de rede', onRetry }))
    expect(tela.getByText('Não foi possível carregar')).toBeTruthy()
    expect(tela.getByText('Falha de rede')).toBeTruthy()
    expect(tela.queryAllByTestId(/^table-linha-[^-]+$/)).toHaveLength(0)
    await fireEvent.press(tela.getByRole('button', { name: 'Tentar de novo' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
    await tela.rerender(arvore({ error: 'Falha de rede' }))
    expect(tela.queryByRole('button', { name: 'Tentar de novo' })).toBeNull()
  })

  it('pageSize pagina: "Próxima" mostra as linhas seguintes; "Anterior" volta', async () => {
    const tela = await render(arvore({ pageSize: 2 }))
    expect(ids(tela)).toEqual(['1', '2'])
    expect(tela.getByText('Página 1 de 2')).toBeTruthy()
    await fireEvent.press(tela.getByRole('button', { name: 'Próxima' }))
    expect(ids(tela)).toEqual(['3'])
    expect(tela.getByText('Página 2 de 2')).toBeTruthy()
    await fireEvent.press(tela.getByRole('button', { name: 'Anterior' }))
    expect(ids(tela)).toEqual(['1', '2'])
  })

  it('pageSize 0 mostra tudo, sem paginação; o padrão é 15 por página', async () => {
    const tela = await render(arvore({ pageSize: 0 }))
    expect(ids(tela)).toHaveLength(3)
    expect(tela.queryByLabelText('Paginação')).toBeNull()
    const muitos = Array.from({ length: 20 }, (_, i) => ({ ...clientes[0]!, id: `m${i}`, nome: `Cliente ${i}` }))
    await tela.rerender(arvore({ data: muitos }))
    expect(ids(tela)).toHaveLength(15)
    expect(tela.getByText('Página 1 de 2')).toBeTruthy()
  })

  it('mobilePagination loadMore soma as linhas', async () => {
    const tela = await render(arvore({ pageSize: 2, mobilePagination: 'loadMore' }))
    expect(ids(tela)).toEqual(['1', '2'])
    expect(tela.getByText('2 de 3')).toBeTruthy()
    await fireEvent.press(tela.getByRole('button', { name: 'Carregar mais' }))
    expect(ids(tela)).toEqual(['1', '2', '3'])
    expect(tela.queryByRole('button', { name: 'Carregar mais' })).toBeNull()
  })

  it('seleção: marcar mostra "N selecionados", bulkActions recebe as linhas e "Limpar seleção" zera', async () => {
    const recebidas: Cliente[][] = []
    const tela = await render(
      arvore({
        selectable: true,
        bulkActions: (selecionados, limpar) => {
          recebidas.push(selecionados)
          return (
            <Text onPress={limpar} accessibilityRole="button">
              Arquivar
            </Text>
          )
        },
      }),
    )
    expect(tela.queryByText(/selecionado/)).toBeNull()
    const caixas = tela.getAllByRole('checkbox', { name: 'Selecionar linha' })
    expect(caixas).toHaveLength(3)
    await fireEvent.press(caixas[0]!)
    expect(tela.getByText('1 selecionado')).toBeTruthy()
    await fireEvent.press(tela.getAllByRole('checkbox', { name: 'Selecionar linha' })[2]!)
    expect(tela.getByText('2 selecionados')).toBeTruthy()
    expect(recebidas[recebidas.length - 1]!.map((c) => c.id)).toEqual(['1', '3'])
    await fireEvent.press(tela.getByRole('button', { name: 'Limpar seleção' }))
    expect(tela.queryByText(/selecionado/)).toBeNull()
    expect(tela.getAllByRole('checkbox', { name: 'Selecionar linha' }).every((c) => c.props.accessibilityState.checked === false)).toBe(true)
  })

  it('bulkMenu abre "Mais ações para os selecionados" e a opção recebe as linhas e o limpar', async () => {
    const onPress = jest.fn()
    const tela = await render(arvore({ selectable: true, bulkMenu: [{ label: 'Excluir', destructive: true, onPress }] }))
    await fireEvent.press(tela.getAllByRole('checkbox', { name: 'Selecionar linha' })[1]!)
    await fireEvent.press(tela.getByRole('button', { name: 'Mais ações para os selecionados' }))
    await fireEvent.press(await tela.findByText('Excluir'))
    expect(onPress).toHaveBeenCalledTimes(1)
    expect((onPress.mock.calls[0][0] as Cliente[]).map((c) => c.id)).toEqual(['2'])
    expect(typeof onPress.mock.calls[0][1]).toBe('function')
  })

  it('expandable entra no bloco de detalhes', async () => {
    const tela = await render(arvore({ expandable: (c) => <Text>{`Histórico de ${c.nome}`}</Text> }))
    const card = within(tela.getByTestId('table-linha-1'))
    expect(card.queryByText('Histórico de Padaria Estrela')).toBeNull()
    await fireEvent.press(card.getByRole('button', { name: 'Ver detalhes' }))
    expect(card.getByText('Histórico de Padaria Estrela')).toBeTruthy()
  })

  it('só colunas primary e sem expandable: não há "Ver detalhes"', async () => {
    const tela = await render(arvore({ columns: [colunas[0]!] }))
    expect(tela.queryByRole('button', { name: 'Ver detalhes' })).toBeNull()
  })

  it('globalFilter casa com o valor do accessor sem diferenciar maiúsculas; moeda é achada pelo número cru, não pelo texto formatado', async () => {
    const tela = await render(arvore({ globalFilter: 'ESTRELA' }))
    expect(ids(tela)).toEqual(['1'])
    await tela.rerender(arvore({ globalFilter: '300.5' }))
    expect(ids(tela)).toEqual(['2'])
    await tela.rerender(arvore({ globalFilter: 'R$' }))
    expect(tela.queryAllByTestId(/^table-linha-[^-]+$/)).toHaveLength(0)
    await tela.rerender(arvore({ globalFilter: 'pro' }))
    expect(ids(tela)).toEqual(['1', '3'])
  })

  it('mudar o globalFilter volta à página 1', async () => {
    const tela = await render(arvore({ pageSize: 1 }))
    await fireEvent.press(tela.getByRole('button', { name: 'Próxima' }))
    expect(tela.getByText('Página 2 de 3')).toBeTruthy()
    await tela.rerender(arvore({ pageSize: 1, globalFilter: 'pro' }))
    expect(tela.getByText('Página 1 de 2')).toBeTruthy()
    expect(ids(tela)).toEqual(['1'])
  })

  it('ordenar por coluna reordena os cards (decrescente, crescente e volta à ordem original ao limpar)', async () => {
    const tela = await render(arvore())
    expect(ids(tela)).toEqual(['1', '2', '3'])
    await fireEvent.press(tela.getByRole('button', { name: /Filtros/ }))
    await fireEvent.press(await tela.findByRole('combobox', { name: /^Ordenar por/ }))
    await fireEvent.press(await tela.findByText('Nome (decrescente)'))
    await fireEvent.press(tela.getByRole('button', { name: 'Ver resultados' }))
    await waitFor(() => expect(ids(tela)).toEqual(['1', '3', '2']))
    await fireEvent.press(tela.getByRole('button', { name: /Filtros/ }))
    await fireEvent.press(await tela.findByRole('combobox', { name: /^Ordenar por/ }))
    await fireEvent.press(await tela.findByText('Mensalidade (crescente)'))
    await fireEvent.press(tela.getByRole('button', { name: 'Ver resultados' }))
    await waitFor(() => expect(ids(tela)).toEqual(['2', '3', '1']))
    await fireEvent.press(tela.getByRole('button', { name: /Filtros/ }))
    await fireEvent.press(await tela.findByLabelText('Limpar seleção'))
    await fireEvent.press(tela.getByRole('button', { name: 'Ver resultados' }))
    await waitFor(() => expect(ids(tela)).toEqual(['1', '2', '3']))
  })

  it('colunas com sortable false não aparecem na ordenação; sortable={false} na tabela tira a ordenação', async () => {
    const semOrdem = [{ ...colunas[0]!, sortable: false }, colunas[1]!]
    const tela = await render(arvore({ columns: semOrdem }))
    await fireEvent.press(tela.getByRole('button', { name: /Filtros/ }))
    await fireEvent.press(await tela.findByRole('combobox', { name: /^Ordenar por/ }))
    expect(await tela.findByText('Plano (crescente)')).toBeTruthy()
    expect(tela.queryByText('Nome (crescente)')).toBeNull()
    await tela.unmount()
    const outra = await render(arvore({ sortable: false }))
    expect(outra.queryByRole('button', { name: /Filtros/ })).toBeNull()
  })

  it('columnVisibility lista as colunas ocultáveis em "Campos no card" e desligar uma tira o valor do card; hidden começa oculta', async () => {
    const cols = [colunas[0]!, colunas[1]!, { ...colunas[2]!, hidden: true }, { ...colunas[3]!, hideable: false }]
    const tela = await render(arvore({ columns: cols, columnVisibility: true }))
    const card = within(tela.getByTestId('table-linha-1'))
    expect(card.getByText('Pro')).toBeTruthy()
    await fireEvent.press(card.getByRole('button', { name: 'Ver detalhes' }))
    expect(card.queryByText('contato@estrela.com')).toBeNull()
    expect(card.getByText('Mensalidade')).toBeTruthy()
    await fireEvent.press(tela.getByRole('button', { name: /Filtros/ }))
    expect(await tela.findByText('Campos no card')).toBeTruthy()
    expect(tela.queryByRole('switch', { name: 'Mensalidade' })).toBeNull()
    expect(tela.getByRole('switch', { name: 'E-mail' }).props.accessibilityState.checked).toBe(false)
    await fireEvent.press(tela.getByRole('switch', { name: 'E-mail' }))
    await fireEvent.press(tela.getByRole('switch', { name: 'Plano' }))
    await fireEvent.press(tela.getByRole('button', { name: 'Ver resultados' }))
    await waitFor(() => expect(within(tela.getByTestId('table-linha-1')).queryByText('Pro')).toBeNull())
    expect(within(tela.getByTestId('table-linha-1')).getByText('contato@estrela.com')).toBeTruthy()
  })

  it('rowActions: até 2 aparecem como botões com rótulo; acima disso a primeira aparece e o resto vai para "Mais ações"', async () => {
    const editar = jest.fn()
    const excluir = jest.fn()
    const arquivar = jest.fn()
    const tela = await render(
      arvore({
        rowActions: [
          { label: 'Editar', onPress: editar },
          { label: 'Excluir', onPress: excluir, destructive: true },
        ],
      }),
    )
    const card = within(tela.getByTestId('table-linha-2'))
    await fireEvent.press(card.getByRole('button', { name: 'Editar' }))
    expect(editar).toHaveBeenCalledWith(clientes[1])
    expect(card.getByRole('button', { name: 'Excluir' })).toBeTruthy()
    expect(card.queryByRole('button', { name: 'Mais ações' })).toBeNull()
    await tela.rerender(
      arvore({
        rowActions: [
          { label: 'Editar', onPress: editar },
          { label: 'Excluir', onPress: excluir, destructive: true },
          { label: 'Arquivar', onPress: arquivar, hidden: (c) => c.id === '1' },
        ],
      }),
    )
    const dois = within(tela.getByTestId('table-linha-2'))
    expect(dois.getByRole('button', { name: 'Editar' })).toBeTruthy()
    expect(dois.queryByRole('button', { name: 'Excluir' })).toBeNull()
    await fireEvent.press(dois.getByRole('button', { name: 'Mais ações' }))
    await fireEvent.press(await tela.findByText('Arquivar'))
    expect(arquivar).toHaveBeenCalledWith(clientes[1])
    // A ação escondida na linha 1 deixa só duas: ficam as duas visíveis, sem menu.
    const um = within(tela.getByTestId('table-linha-1'))
    expect(um.getByRole('button', { name: 'Excluir' })).toBeTruthy()
    expect(um.queryByRole('button', { name: 'Mais ações' })).toBeNull()
  })

  it('o rótulo acessível vai para a lista e o código TAB-001 aparece uma vez, com DTB-001 e PAG-001 por dentro, sem LIST-001', async () => {
    const tela = await render(arvore({ pageSize: 2 }))
    // Papel `group`, não `list`: os separadores entre os cards quebrariam `aria-required-children` (axe).
    expect(tela.getByLabelText('Clientes').props.role).toBe('group')
    expect(nodesWithCode(tela.container, 'TAB-001')).toHaveLength(1)
    expect(nodesWithCode(tela.container, 'DTB-001')).toHaveLength(1)
    expect(nodesWithCode(tela.container, 'PAG-001')).toHaveLength(1)
    expect(nodesWithCode(tela.container, 'LIST-001')).toHaveLength(0)
  })

  it('toolbar com busca e ação principal aparece acima dos cards', async () => {
    const tela = await render(
      arvore({ toolbar: { search: { value: '', onChange: () => {}, placeholder: 'Buscar cliente' }, primaryAction: <Text>Novo cliente</Text> } }),
    )
    expect(tela.getByLabelText('Buscar cliente')).toBeTruthy()
    expect(tela.getByText('Novo cliente')).toBeTruthy()
  })
})
