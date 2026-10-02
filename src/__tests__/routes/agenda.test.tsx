import { act, fireEvent, within } from '@testing-library/react-native'
import { screen } from 'expo-router/testing-library'
import ShellLayout from '../../../app/(shell)/_layout'
import Agenda from '../../../app/(shell)/agenda'
import { restaurarPlanejamento } from '../../demo/planning-store'
import { demoEvents } from '../../mocks/planning'
import { nodesWithCode } from '../../test-utils/rendra-code'
import { renderDemo } from '../../test-utils/render-demo'

const rotas = { '(shell)/_layout': ShellLayout, '(shell)/agenda': Agenda }

afterEach(async () => {
  await act(async () => {
    restaurarPlanejamento()
  })
})

describe('agenda: calendário e detalhe do evento', () => {
  it('mostra o título, um único calendário (sem Card em volta) e os compromissos do dia de referência', async () => {
    const contexto = await renderDemo(rotas, '/agenda')
    expect((await screen.findAllByText('Agenda')).length).toBeGreaterThan(0)
    await screen.findByText('Reunião de equipe')
    expect(nodesWithCode(contexto.container, 'CAL-001')).toHaveLength(1)
    expect(nodesWithCode(contexto.container, 'CARD-001')).toHaveLength(0)
    expect(screen.getByText('Outubro de 2026')).toBeTruthy()
    expect(screen.getByText('Reunião de equipe')).toBeTruthy()
    expect(screen.getByText('Visita: Padaria Bom Grão')).toBeTruthy()
    expect(screen.queryByText('Treinamento da equipe')).toBeNull()
  })

  it('a visão do calendário tem Mês, Dia e Agenda, e Agenda lista os 7 eventos do mês', async () => {
    await renderDemo(rotas, '/agenda')
    const visao = await screen.findByLabelText('Visão do calendário')
    for (const nome of ['Mês', 'Dia', 'Agenda']) expect(within(visao).getByText(nome)).toBeTruthy()
    await fireEvent.press(within(visao).getByText('Agenda'))
    for (const evento of demoEvents) expect(await screen.findByText(evento.title)).toBeTruthy()
  })

  it('tocar num evento abre o detalhe com título, horário, local e descrição', async () => {
    await renderDemo(rotas, '/agenda')
    await fireEvent.press(await screen.findByRole('button', { name: /Visita: Padaria Bom Grão/ }))
    const detalhe = await screen.findByTestId('evento-detalhe')
    expect(within(detalhe).getByText('Visita: Padaria Bom Grão')).toBeTruthy()
    expect(within(detalhe).getByText('Segunda-feira, 5 de outubro de 2026')).toBeTruthy()
    expect(within(detalhe).getByText('14:00 às 15:30')).toBeTruthy()
    expect(within(detalhe).getByText('Rua das Acácias, 120')).toBeTruthy()
    expect(within(detalhe).getByText('Conversa sobre a renovação do contrato.')).toBeTruthy()
  })
})

describe('agenda: novo evento', () => {
  async function abrirNovoEvento() {
    await fireEvent.press(await screen.findByRole('button', { name: 'Novo evento neste dia' }))
    return screen.findByTestId('evento-novo')
  }

  it('o formulário tem título, data e hora, e local', async () => {
    await renderDemo(rotas, '/agenda')
    const formulario = await abrirNovoEvento()
    expect(within(formulario).getByLabelText('Título do evento')).toBeTruthy()
    expect(within(formulario).getByText('Data e hora')).toBeTruthy()
    expect(within(formulario).getByLabelText('Local do evento')).toBeTruthy()
    expect(within(formulario).getByText('Salvar')).toBeTruthy()
  })

  it('salvar cria o evento no dia escolhido, com a hora padrão, e fecha o painel', async () => {
    await renderDemo(rotas, '/agenda')
    const formulario = await abrirNovoEvento()
    await fireEvent.changeText(within(formulario).getByLabelText('Título do evento'), 'Visita ao cliente')
    await fireEvent.changeText(within(formulario).getByLabelText('Local do evento'), 'Av. Central, 10')
    await fireEvent.press(within(formulario).getByText('Salvar'))
    expect(await screen.findByText('Visita ao cliente')).toBeTruthy()
    expect(screen.getByText('09:00')).toBeTruthy()
    expect(screen.getByText('Av. Central, 10')).toBeTruthy()
    expect(screen.queryByTestId('evento-novo')).toBeNull()
  })

  it('o evento novo sobrevive a sair da rota e voltar', async () => {
    const primeira = await renderDemo(rotas, '/agenda')
    const formulario = await abrirNovoEvento()
    await fireEvent.changeText(within(formulario).getByLabelText('Título do evento'), 'Visita ao cliente')
    await fireEvent.press(within(formulario).getByText('Salvar'))
    await screen.findByText('Visita ao cliente')
    await primeira.unmount()
    await renderDemo(rotas, '/agenda')
    expect(await screen.findByText('Visita ao cliente')).toBeTruthy()
  })

  it('salvar sem título mostra o erro, não cria evento e mantém o painel aberto', async () => {
    await renderDemo(rotas, '/agenda')
    const formulario = await abrirNovoEvento()
    await fireEvent.press(within(formulario).getByText('Salvar'))
    expect(await within(formulario).findByText('Informe o título do evento.')).toBeTruthy()
    expect(screen.getByTestId('evento-novo')).toBeTruthy()
    await fireEvent.press(within(formulario).getByText('Cancelar'))
    expect(screen.queryByText('Informe o título do evento.')).toBeNull()
    expect(screen.getAllByText(/Reunião de equipe/)).toHaveLength(1)
  })
})
