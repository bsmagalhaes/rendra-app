import { act, fireEvent, within } from '@testing-library/react-native'
import { screen } from 'expo-router/testing-library'
import { Text } from 'react-native'
import ShellLayout from '../../../app/(shell)/_layout'
import Atendimento from '../../../app/(shell)/atendimento/index'
import { restaurarTickets } from '../../demo/tickets-store'
import { renderDemo } from '../../test-utils/render-demo'

const rotas = {
  '(shell)/_layout': ShellLayout,
  '(shell)/atendimento/index': Atendimento,
  '(shell)/atendimento/[id]': () => <Text>Conversa aberta</Text>,
}

afterEach(async () => {
  await act(async () => {
    restaurarTickets()
  })
})

describe('atendimento: lista por etapa', () => {
  it('mostra o título e as quatro etapas com a contagem de cada uma', async () => {
    await renderDemo(rotas, '/atendimento')
    expect((await screen.findAllByText('Atendimento')).length).toBeGreaterThan(0)
    expect(await screen.findByRole('tab', { name: 'URA/IA 0' })).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'Fila 1' })).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'Atendimento 2' })).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'Encerrado 0' })).toBeTruthy()
  })

  it('abre na Fila: Diana Melo com o tempo de espera, sem as conversas em atendimento', async () => {
    await renderDemo(rotas, '/atendimento')
    expect(await screen.findByText('Diana Melo')).toBeTruthy()
    expect(screen.getByText(/Esperando há/)).toBeTruthy()
    expect(screen.queryByText('Ana Souza')).toBeNull()
    expect(screen.queryByText('Carlos Dias')).toBeNull()
  })

  it('a aba Atendimento lista Ana e Carlos, e a pílula de não lidas do Carlos mostra 2', async () => {
    await renderDemo(rotas, '/atendimento')
    await fireEvent.press(await screen.findByRole('tab', { name: 'Atendimento 2' }))
    expect(await screen.findByText('Ana Souza')).toBeTruthy()
    expect(screen.getByText('Carlos Dias')).toBeTruthy()
    expect(within(screen.getByTestId('conversation-item-t2')).getByText('2')).toBeTruthy()
    expect(within(screen.getByTestId('conversation-item-t1')).queryByText('2')).toBeNull()
  })

  it('as etapas sem conversa mostram o aviso de vazio', async () => {
    await renderDemo(rotas, '/atendimento')
    await fireEvent.press(await screen.findByRole('tab', { name: 'URA/IA 0' }))
    expect(await screen.findByText('Nenhuma conversa aqui.')).toBeTruthy()
    await fireEvent.press(screen.getByRole('tab', { name: 'Encerrado 0' }))
    expect(await screen.findByText('Nenhuma conversa aqui.')).toBeTruthy()
  })

  it('a busca casa com o nome ou com a última mensagem e reduz a lista', async () => {
    await renderDemo(rotas, '/atendimento')
    await fireEvent.press(await screen.findByRole('tab', { name: 'Atendimento 2' }))
    await fireEvent.changeText(await screen.findByLabelText('Buscar conversa'), 'carlos')
    expect(await screen.findByText('Carlos Dias')).toBeTruthy()
    expect(screen.queryByText('Ana Souza')).toBeNull()
    await fireEvent.changeText(screen.getByLabelText('Buscar conversa'), 'obrigada')
    expect(await screen.findByText('Ana Souza')).toBeTruthy()
    expect(screen.queryByText('Carlos Dias')).toBeNull()
    await fireEvent.changeText(screen.getByLabelText('Buscar conversa'), 'zzz')
    expect(await screen.findByText('Nenhuma conversa com essa busca ou filtros.')).toBeTruthy()
  })

  it('o filtro por canal mostra só o canal escolhido', async () => {
    await renderDemo(rotas, '/atendimento')
    await fireEvent.press(await screen.findByRole('tab', { name: 'Atendimento 2' }))
    await fireEvent.press(await screen.findByRole('combobox', { name: /Canal/ }))
    await fireEvent.press(await screen.findByText('WhatsApp'))
    await fireEvent.press(await screen.findByText('Aplicar (1)'))
    expect(await screen.findByText('Ana Souza')).toBeTruthy()
    expect(screen.queryByText('Carlos Dias')).toBeNull()
    expect(screen.getByRole('tab', { name: 'Atendimento 1' })).toBeTruthy()
  })

  it('tocar numa conversa abre a conversa dela', async () => {
    const tela = await renderDemo(rotas, '/atendimento')
    await fireEvent.press(await screen.findByRole('tab', { name: 'Atendimento 2' }))
    await fireEvent.press(within(await screen.findByTestId('conversation-item-t2')).getByRole('button'))
    expect(await screen.findByText('Conversa aberta')).toBeTruthy()
    expect(tela.getPathname()).toBe('/atendimento/t2')
  })
})
