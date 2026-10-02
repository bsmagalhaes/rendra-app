import { act, fireEvent } from '@testing-library/react-native'
import { screen } from 'expo-router/testing-library'
import { Text } from 'react-native'
import ShellLayout from '../../../app/(shell)/_layout'
import Funil from '../../../app/(shell)/kanban'
import { restaurarPlanejamento } from '../../demo/planning-store'
import { formatCurrency } from '../../lib/masks'
import { renderDemo } from '../../test-utils/render-demo'

const rotas = {
  '(shell)/_layout': ShellLayout,
  '(shell)/kanban': Funil,
  '(shell)/clientes/[id]': () => <Text>Tela do cliente</Text>,
}

afterEach(async () => {
  await act(async () => {
    restaurarPlanejamento()
  })
})

async function moverPadaria(destino: string) {
  await fireEvent.press(await screen.findByRole('button', { name: 'Ações do card Padaria Estrela' }))
  await fireEvent.press(await screen.findByRole('menuitem', { name: destino }))
}

describe('funil comercial', () => {
  it('mostra o título e as quatro colunas com a contagem de cards', async () => {
    await renderDemo(rotas, '/kanban')
    expect((await screen.findAllByText('Funil comercial')).length).toBeGreaterThan(0)
    expect(screen.getByRole('tab', { name: 'Novo contato 2' })).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'Qualificado 1' })).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'Proposta 4' })).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'Fechamento 1' })).toBeTruthy()
  })

  it('a coluna aberta lista os cards com P&S e MRR no cabeçalho', async () => {
    await renderDemo(rotas, '/kanban')
    expect(await screen.findByText('Padaria Estrela')).toBeTruthy()
    expect(screen.getByText('Oficina Horizonte')).toBeTruthy()
    expect(screen.getByText(`Total P&S: ${formatCurrency(4800 + 2500)}`)).toBeTruthy()
    expect(screen.getByText(`Total MRR: ${formatCurrency(590 + 290)}`)).toBeTruthy()
    expect(screen.getByTestId('kanban-count-novo')).toBeTruthy()
  })

  it('Proposta nasce acima do limite, em alerta, e mover para lá não é bloqueado', async () => {
    await renderDemo(rotas, '/kanban')
    await fireEvent.press(await screen.findByRole('tab', { name: 'Proposta 4' }))
    expect(await screen.findByText('4/3')).toBeTruthy()
    expect(screen.getByTestId('kanban-count-proposta').props.className).toContain('bg-warning-soft')
    await fireEvent.press(screen.getByRole('tab', { name: 'Novo contato 2' }))
    await moverPadaria('Proposta')
    expect(await screen.findByRole('tab', { name: 'Proposta 5' })).toBeTruthy()
  })

  it('mover o card pelo menu muda o contador das duas colunas', async () => {
    await renderDemo(rotas, '/kanban')
    await moverPadaria('Qualificado')
    expect(await screen.findByRole('tab', { name: 'Novo contato 1' })).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'Qualificado 2' })).toBeTruthy()
    expect(screen.queryByText('Padaria Estrela')).toBeNull()
  })

  it('o card movido sobrevive a sair da rota e voltar', async () => {
    const primeira = await renderDemo(rotas, '/kanban')
    await moverPadaria('Qualificado')
    await screen.findByRole('tab', { name: 'Qualificado 2' })
    await primeira.unmount()
    await renderDemo(rotas, '/kanban')
    expect(await screen.findByRole('tab', { name: 'Qualificado 2' })).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'Novo contato 1' })).toBeTruthy()
  })

  it('tocar num card leva ao detalhe do cliente dele', async () => {
    const tela = await renderDemo(rotas, '/kanban')
    await fireEvent.press(await screen.findByText('Padaria Estrela'))
    expect(await screen.findByText('Tela do cliente')).toBeTruthy()
    expect(tela.getPathname()).toBe('/clientes/1000')
  })
})
