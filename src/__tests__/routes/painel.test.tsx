import { act, fireEvent } from '@testing-library/react-native'
import { screen } from 'expo-router/testing-library'
import { Text } from 'react-native'
import ShellLayout from '../../../app/(shell)/_layout'
import Painel from '../../../app/(shell)/painel'
import { toast } from '../../components/ui'
import { restaurarClientes } from '../../demo/clients-store'
import { formatCurrency } from '../../lib/masks'
import { clients, resumoPeriodo } from '../../mocks/clients'
import { notifications } from '../../mocks/notifications'
import { nodesWithCode } from '../../test-utils/rendra-code'
import { renderDemo } from '../../test-utils/render-demo'

const rotas = {
  '(shell)/_layout': ShellLayout,
  '(shell)/painel': Painel,
  '(shell)/clientes/[id]': () => <Text>Tela do cliente</Text>,
}

afterEach(async () => {
  await act(async () => {
    toast.dismiss()
  })
})

describe('painel da demonstração', () => {
  // P3.14 (correção D7, mudança de comportamento registrada): os valores deixaram de ser fixos
  // ("R$ 8.420,00", "128", "12") e passam a sair de `resumoPeriodo(6)`; a asserção de efeito
  // (texto na tela e 3 STAT-001) continua.
  it('mostra a descrição e os três indicadores com valor e variação', async () => {
    const context = await renderDemo(rotas, '/painel')
    const seis = resumoPeriodo(6)
    expect(await screen.findByText('Resumo da sua conta no período escolhido.')).toBeTruthy()
    expect(await screen.findByText('Receita do período')).toBeTruthy()
    expect(await screen.findByText(formatCurrency(seis.receita))).toBeTruthy()
    expect(await screen.findByText('Novos clientes')).toBeTruthy()
    expect(await screen.findByText(String(seis.novosClientes))).toBeTruthy()
    expect(await screen.findByText('Clientes ativos')).toBeTruthy()
    expect(await screen.findByText(String(clients.filter((c) => c.situacao === 'Ativo').length))).toBeTruthy()
    expect(nodesWithCode(context.container, 'STAT-001')).toHaveLength(3)
  })

  it('só um indicador é destaque e a rota tem um único degradê (R11)', async () => {
    const context = await renderDemo(rotas, '/painel')
    await screen.findByText('Receita do período')
    const degrades = context.container.queryAll((no) => String(no.props.testID ?? '').startsWith('gradient-'))
    expect(degrades).toHaveLength(1)
  })

  it('a lista de clientes recentes usa os três primeiros clientes e cada linha leva ao detalhe', async () => {
    const tela = await renderDemo(rotas, '/painel')
    for (const cliente of clients.slice(0, 3)) {
      expect(await screen.findByRole('link', { name: new RegExp(cliente.nome) })).toBeTruthy()
    }
    await fireEvent.press(await screen.findByRole('link', { name: new RegExp(clients[1]!.nome) }))
    expect(await screen.findByText('Tela do cliente')).toBeTruthy()
    expect(tela.getPathname()).toBe(`/clientes/${clients[1]!.id}`)
  })

  it('a atividade mostra as notificações recentes com a data', async () => {
    await renderDemo(rotas, '/painel')
    expect(await screen.findByText(notifications[0]!.titulo)).toBeTruthy()
    expect(await screen.findByText(notifications[0]!.data)).toBeTruthy()
  })

  it('troca os números do resumo ao mudar o período', async () => {
    await renderDemo(rotas, '/painel')
    expect(await screen.findByText(formatCurrency(resumoPeriodo(6).receita))).toBeTruthy()
    await fireEvent.press(screen.getByRole('radio', { name: '12 meses' }))
    expect(await screen.findByText(formatCurrency(resumoPeriodo(12).receita))).toBeTruthy()
    expect(screen.queryByText(formatCurrency(resumoPeriodo(6).receita))).toBeNull()
    expect(await screen.findByText(String(resumoPeriodo(12).novosClientes))).toBeTruthy()
  })

  it('Novo cliente abre o drawer, salva e fecha', async () => {
    await renderDemo(rotas, '/painel')
    await fireEvent.press(await screen.findByRole('button', { name: 'Novo cliente' }))
    await fireEvent.changeText(await screen.findByLabelText('Razão social'), 'Padaria Estrela Ltda')
    await fireEvent.changeText(screen.getByLabelText('E-mail'), 'contato@exemplo.com.br')
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar' }))
    expect(await screen.findByText('Cliente cadastrado (simulado)')).toBeTruthy()
    expect(screen.queryByLabelText('Razão social')).toBeNull()
  })

  it('o drawer não salva com campos vazios e mostra os erros', async () => {
    await renderDemo(rotas, '/painel')
    await fireEvent.press(await screen.findByRole('button', { name: 'Novo cliente' }))
    await fireEvent.press(await screen.findByRole('button', { name: 'Salvar' }))
    expect(await screen.findByText('Informe a razão social.')).toBeTruthy()
    expect(await screen.findByText('E-mail é obrigatório.')).toBeTruthy()
    expect(screen.queryByText('Cliente cadastrado (simulado)')).toBeNull()
  })
})

describe('cliente cadastrado pela gaveta do painel', () => {
  it('entra em clientes recentes até recarregar', async () => {
    await renderDemo(rotas, '/painel')
    await fireEvent.press(await screen.findByRole('button', { name: 'Novo cliente' }))
    await fireEvent.changeText(await screen.findByLabelText('Razão social'), 'Padaria Nova Ltda')
    await fireEvent.changeText(screen.getByLabelText('E-mail'), 'nova@exemplo.com.br')
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar' }))
    expect(await screen.findByRole('link', { name: /Padaria Nova Ltda/ })).toBeTruthy()
    await act(async () => {
      restaurarClientes()
    })
  })
})
