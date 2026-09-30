import { act, fireEvent } from '@testing-library/react-native'
import { screen } from 'expo-router/testing-library'
import ShellLayout from '../../../app/(shell)/_layout'
import Tarefas from '../../../app/(shell)/tarefas'
import { toast } from '../../components/ui'
import { tasks } from '../../mocks/tasks'
import { renderDemo } from '../../test-utils/render-demo'

const rotas = { '(shell)/_layout': ShellLayout, '(shell)/tarefas': Tarefas }

afterEach(async () => {
  await act(async () => {
    toast.dismiss()
  })
})

// O FlatList do Jest renderiza só o lote inicial (10 linhas): os casos usam tarefas entre as 10
// primeiras (risco registrado na reconferência, D19).
describe('tarefas', () => {
  it('lista as tarefas com prioridade e prazo', async () => {
    await renderDemo(rotas, '/tarefas')
    expect((await screen.findAllByText(tasks[0]!.titulo)).length).toBeGreaterThan(0)
    expect(screen.getAllByText(tasks[0]!.prazo).length).toBeGreaterThan(0)
    expect(screen.getAllByText(tasks[0]!.prioridade).length).toBeGreaterThan(0)
  })

  it('selecionar mostra o contador e Concluir selecionadas conclui', async () => {
    await renderDemo(rotas, '/tarefas')
    const alvo = tasks.find((t) => !t.concluida)!
    const antes = (await screen.findAllByText('Concluída')).length
    await fireEvent.press(await screen.findByRole('checkbox', { name: `Selecionar ${alvo.titulo}` }))
    expect(await screen.findByText('Selecionadas: 1')).toBeTruthy()
    await fireEvent.press(screen.getByRole('button', { name: 'Concluir selecionadas' }))
    expect(await screen.findByText('Selecionadas: 0')).toBeTruthy()
    expect(await screen.findByRole('checkbox', { name: `Selecionar ${alvo.titulo}`, checked: false })).toBeTruthy()
    expect((await screen.findAllByText('Concluída')).length).toBe(antes + 1)
    expect(await screen.findByText('Tarefa concluída')).toBeTruthy()
  })

  it('sem seleção o botão de concluir fica desabilitado', async () => {
    await renderDemo(rotas, '/tarefas')
    const botao = await screen.findByRole('button', { name: 'Concluir selecionadas' })
    expect(botao.props.accessibilityState?.disabled ?? botao.props['aria-disabled']).toBe(true)
  })

  it('o menu da tarefa conclui e reabre', async () => {
    await renderDemo(rotas, '/tarefas')
    const alvo = tasks.find((t) => !t.concluida)!
    const antes = (await screen.findAllByText('Concluída')).length
    await fireEvent.press(await screen.findByRole('button', { name: `Ações de ${alvo.titulo}` }))
    await fireEvent.press(await screen.findByRole('menuitem', { name: 'Concluir tarefa' }))
    expect((await screen.findAllByText('Concluída')).length).toBe(antes + 1)
    await fireEvent.press(await screen.findByRole('button', { name: `Ações de ${alvo.titulo}` }))
    await fireEvent.press(await screen.findByRole('menuitem', { name: 'Reabrir tarefa' }))
    expect((await screen.findAllByText('Concluída')).length).toBe(antes)
  })

  it('busca filtra a lista', async () => {
    await renderDemo(rotas, '/tarefas')
    await fireEvent.changeText(await screen.findByLabelText('Buscar tarefa'), tasks[2]!.titulo)
    expect(screen.queryByText(tasks[0]!.titulo)).toBeNull()
    expect((await screen.findAllByText(tasks[2]!.titulo)).length).toBeGreaterThan(0)
  })

  it('busca sem resultado mostra o estado vazio', async () => {
    await renderDemo(rotas, '/tarefas')
    await fireEvent.changeText(await screen.findByLabelText('Buscar tarefa'), 'zzzz')
    expect(await screen.findByText('Nenhuma tarefa encontrada')).toBeTruthy()
  })
})
