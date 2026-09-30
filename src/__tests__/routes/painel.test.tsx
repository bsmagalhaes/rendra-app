import { fireEvent } from '@testing-library/react-native'
import { renderRouter, screen } from 'expo-router/testing-library'
import AsyncStorage from '@react-native-async-storage/async-storage'
import RootLayout from '../../../app/_layout'
import Painel from '../../../app/(shell)/painel'
import { nodesWithCode } from '../../test-utils/rendra-code'

beforeEach(async () => {
  await AsyncStorage.clear()
})

function abrir(url = '/painel') {
  return renderRouter({ _layout: RootLayout, painel: Painel }, { initialUrl: url })
}

describe('/painel', () => {
  it('mostra a descrição e os três indicadores com valor e variação', async () => {
    const context = await abrir()
    expect(await screen.findByText('Resumo do mês da sua conta.')).toBeTruthy()
    expect(await screen.findByText('Receita do mês')).toBeTruthy()
    expect(await screen.findByText('R$ 8.420,00')).toBeTruthy()
    expect(await screen.findByText('Clientes ativos')).toBeTruthy()
    expect(await screen.findByText('128')).toBeTruthy()
    expect(await screen.findByText('Chamados abertos')).toBeTruthy()
    expect(await screen.findByText('12')).toBeTruthy()
    expect(nodesWithCode(context.container, 'STAT-001')).toHaveLength(3)
  })

  it('só um indicador é destaque e a rota tem um único degradê (R11)', async () => {
    const context = await abrir()
    await screen.findByText('Receita do mês')
    const degrades = context.container.queryAll((no) => String(no.props.testID ?? '').startsWith('gradient-'))
    expect(degrades).toHaveLength(1)
  })

  it('a lista de clientes recentes tem uma linha navegável por cliente', async () => {
    await abrir()
    expect(await screen.findByRole('link', { name: /Marina Costa/ })).toBeTruthy()
    expect(await screen.findByRole('link', { name: /Rafael Nunes/ })).toBeTruthy()
    expect(await screen.findByRole('link', { name: /Beatriz Lima/ })).toBeTruthy()
  })

  it('sem cliente escolhido, a atividade diz que nenhum está em foco', async () => {
    await abrir()
    expect(await screen.findByText('Nenhum cliente em foco.')).toBeTruthy()
  })

  it('tocar num cliente leva ao painel com ele em foco na atividade', async () => {
    await abrir()
    await fireEvent.press(await screen.findByRole('link', { name: /Rafael Nunes/ }))
    const foco = await screen.findAllByText('Cliente em foco: Rafael Nunes')
    expect(foco.length).toBeGreaterThanOrEqual(1)
  })

  it('abrir com ?cliente= mostra o cliente em foco na atividade', async () => {
    await abrir('/painel?cliente=beatriz-lima')
    expect(await screen.findByText('Cliente em foco: Beatriz Lima')).toBeTruthy()
  })

  it('um id de cliente desconhecido não quebra a tela', async () => {
    await abrir('/painel?cliente=ninguem')
    expect(await screen.findByText('Nenhum cliente em foco.')).toBeTruthy()
  })
})
