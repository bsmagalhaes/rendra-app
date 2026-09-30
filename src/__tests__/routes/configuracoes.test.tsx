import { fireEvent, within } from '@testing-library/react-native'
import { renderRouter } from 'expo-router/testing-library'
import AsyncStorage from '@react-native-async-storage/async-storage'
import RootLayout from '../../../app/_layout'
import ShellLayout from '../../../app/(shell)/_layout'
import Configuracoes from '../../../app/(shell)/configuracoes'

type Contexto = Awaited<ReturnType<typeof renderRouter>>

// Consultas escopadas por grupo (accessibilityLabel): "Aurora" existe em Modelo e em Paleta.
async function opcao(context: Contexto, grupo: string, nome: string) {
  return within(await context.findByLabelText(grupo)).getByRole('radio', { name: nome })
}

function abrir(url = '/configuracoes') {
  return renderRouter(
    { _layout: RootLayout, '(shell)/_layout': ShellLayout, '(shell)/configuracoes': Configuracoes },
    { initialUrl: url },
  )
}

beforeEach(async () => {
  await AsyncStorage.clear()
})

describe('/configuracoes', () => {
  it('tocar em Aurora (Modelo) troca o modelo: a raiz vira rendra-T3-C1 e o texto acompanha', async () => {
    const context = await abrir('/configuracoes?codigo=T1-C1')
    await context.findByTestId('rendra-T1-C1')
    await fireEvent.press(await opcao(context, 'Modelo', 'Aurora'))
    expect(await context.findByTestId('rendra-T3-C1')).toBeTruthy()
    expect(await context.findByText('Modelo ativo: Aurora')).toBeTruthy()
  })

  it('tocar em Ardósia (Paleta) troca a paleta: a raiz vira rendra-T1-C4', async () => {
    const context = await abrir('/configuracoes?codigo=T1-C1')
    await context.findByTestId('rendra-T1-C1')
    await fireEvent.press(await opcao(context, 'Paleta', 'Ardósia'))
    expect(await context.findByTestId('rendra-T1-C4')).toBeTruthy()
    expect(await context.findByText('Paleta ativa: Ardósia')).toBeTruthy()
  })

  it('tocar em Escuro (Modo) muda o modo ativo', async () => {
    const context = await abrir()
    await fireEvent.press(await opcao(context, 'Modo', 'Escuro'))
    expect(await context.findByText('Modo ativo: escuro')).toBeTruthy()
  })

  it('o layout padrão é Gaveta e barra (N1) e a barra inferior aparece', async () => {
    const context = await abrir()
    expect(await context.findByLabelText('Navegação rápida')).toBeTruthy()
    const n1 = await opcao(context, 'Layout', 'Gaveta e barra')
    expect(n1.props.accessibilityState.checked).toBe(true)
    expect((await opcao(context, 'Layout', 'Só gaveta')).props.accessibilityState.checked).toBe(false)
  })

  it('tocar em Só gaveta (N3) tira a barra inferior e marca a opção', async () => {
    const context = await abrir()
    await context.findByLabelText('Navegação rápida')
    await fireEvent.press(await opcao(context, 'Layout', 'Só gaveta'))
    expect(context.queryByLabelText('Navegação rápida')).toBeNull()
    expect((await opcao(context, 'Layout', 'Só gaveta')).props.accessibilityState.checked).toBe(true)
    expect(await context.findByText('Só gaveta, menu no cabeçalho.')).toBeTruthy()
  })

  it('Restaurar layout padrão devolve a barra inferior depois do N3', async () => {
    const context = await abrir()
    await fireEvent.press(await opcao(context, 'Layout', 'Só gaveta'))
    expect(context.queryByLabelText('Navegação rápida')).toBeNull()
    await fireEvent.press(await context.findByRole('button', { name: /Restaurar layout padrão/ }))
    expect(await context.findByLabelText('Navegação rápida')).toBeTruthy()
    expect((await opcao(context, 'Layout', 'Gaveta e barra')).props.accessibilityState.checked).toBe(true)
  })

  it('Perfil: salvar com os dados de exemplo mostra o aviso de sucesso', async () => {
    const context = await abrir()
    expect((await context.findByLabelText('Nome')).props.value).toBe('Ana Ribeiro')
    expect((await context.findByLabelText('E-mail')).props.value).toBe('ana@exemplo.com')
    await fireEvent.press(await context.findByRole('button', { name: 'Salvar perfil' }))
    expect(await context.findByText('Perfil salvo')).toBeTruthy()
  })

  it('Perfil: nome vazio mostra o erro e não salva', async () => {
    const context = await abrir()
    await fireEvent.changeText(await context.findByLabelText('Nome'), '')
    await fireEvent.press(await context.findByRole('button', { name: 'Salvar perfil' }))
    expect(await context.findByText('Nome é obrigatório.')).toBeTruthy()
    expect(context.queryByText('Perfil salvo')).toBeNull()
  })
})
