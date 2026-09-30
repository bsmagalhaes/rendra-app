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

// P3.13 (correção D6, mudança de preparo registrada): as seções vivem em abas; a asserção de
// efeito de cada caso da F2 não mudou, só o toque na aba antes de consultar o grupo.
async function abrirAba(context: Contexto, nome: string) {
  await fireEvent.press(await context.findByRole('tab', { name: nome }))
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
    await abrirAba(context, 'Aparência')
    await fireEvent.press(await opcao(context, 'Modelo', 'Aurora'))
    expect(await context.findByTestId('rendra-T3-C1')).toBeTruthy()
    expect(await context.findByText('Modelo ativo: Aurora')).toBeTruthy()
  })

  it('tocar em Ardósia (Paleta) troca a paleta: a raiz vira rendra-T1-C4', async () => {
    const context = await abrir('/configuracoes?codigo=T1-C1')
    await context.findByTestId('rendra-T1-C1')
    await abrirAba(context, 'Aparência')
    await fireEvent.press(await opcao(context, 'Paleta', 'Ardósia'))
    expect(await context.findByTestId('rendra-T1-C4')).toBeTruthy()
    expect(await context.findByText('Paleta ativa: Ardósia')).toBeTruthy()
  })

  it('tocar em Escuro (Modo) muda o modo ativo', async () => {
    const context = await abrir()
    await abrirAba(context, 'Aparência')
    await fireEvent.press(await opcao(context, 'Modo', 'Escuro'))
    expect(await context.findByText('Modo ativo: escuro')).toBeTruthy()
  })

  it('o layout padrão é Gaveta e barra (N1) e a barra inferior aparece', async () => {
    const context = await abrir()
    expect(await context.findByLabelText('Navegação rápida')).toBeTruthy()
    await abrirAba(context, 'Layout')
    const n1 = await opcao(context, 'Layout', 'Gaveta e barra')
    expect(n1.props.accessibilityState.checked).toBe(true)
    expect((await opcao(context, 'Layout', 'Só gaveta')).props.accessibilityState.checked).toBe(false)
  })

  it('tocar em Só gaveta (N3) tira a barra inferior e marca a opção', async () => {
    const context = await abrir()
    await context.findByLabelText('Navegação rápida')
    await abrirAba(context, 'Layout')
    await fireEvent.press(await opcao(context, 'Layout', 'Só gaveta'))
    expect(context.queryByLabelText('Navegação rápida')).toBeNull()
    expect((await opcao(context, 'Layout', 'Só gaveta')).props.accessibilityState.checked).toBe(true)
    expect(await context.findByText('Só gaveta, menu no cabeçalho.')).toBeTruthy()
  })

  it('Restaurar layout padrão devolve a barra inferior depois do N3', async () => {
    const context = await abrir()
    await abrirAba(context, 'Layout')
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

  it('tem as seis seções em abas', async () => {
    const context = await abrir()
    const abas = await context.findAllByRole('tab')
    expect(abas).toHaveLength(6)
    for (const nome of ['Perfil', 'Empresa', 'Notificações', 'Segurança', 'Aparência', 'Layout']) {
      expect(await context.findByRole('tab', { name: nome })).toBeTruthy()
    }
  })

  it('Empresa salva com aviso', async () => {
    const context = await abrir()
    await abrirAba(context, 'Empresa')
    await fireEvent.changeText(await context.findByLabelText('Razão social'), 'Padaria Estrela Ltda')
    await fireEvent.press(context.getByRole('button', { name: 'Salvar alterações' }))
    expect(await context.findByText('Configurações salvas')).toBeTruthy()
  })

  it('Empresa: razão social vazia mostra o erro e não salva', async () => {
    const context = await abrir()
    await abrirAba(context, 'Empresa')
    await fireEvent.changeText(await context.findByLabelText('Razão social'), '')
    await fireEvent.press(context.getByRole('button', { name: 'Salvar alterações' }))
    expect(await context.findByText('Informe a razão social.')).toBeTruthy()
    expect(context.queryByText('Configurações salvas')).toBeNull()
  })

  it('Notificações alterna um item pelo Switch', async () => {
    const context = await abrir()
    await abrirAba(context, 'Notificações')
    expect(await context.findByRole('switch', { name: 'Resumo semanal', checked: false })).toBeTruthy()
    await fireEvent.press(await context.findByRole('switch', { name: 'Resumo semanal' }))
    expect(await context.findByRole('switch', { name: 'Resumo semanal', checked: true })).toBeTruthy()
    expect(context.getByRole('switch', { name: 'Alertas por e-mail', checked: true })).toBeTruthy()
  })

  it('Segurança encerra sessões só depois de confirmar', async () => {
    const context = await abrir()
    await abrirAba(context, 'Segurança')
    await fireEvent.press(await context.findByRole('button', { name: 'Encerrar sessões' }))
    expect(await context.findByText('Encerrar todas as sessões?')).toBeTruthy()
    expect(context.queryByText('Sessões encerradas (simulado)')).toBeNull()
    await fireEvent.press(context.getByRole('button', { name: 'Confirmar encerramento' }))
    expect(await context.findByText('Sessões encerradas (simulado)')).toBeTruthy()
  })

  it('Segurança: cancelar o encerramento não avisa nada', async () => {
    const context = await abrir()
    await abrirAba(context, 'Segurança')
    await fireEvent.press(await context.findByRole('button', { name: 'Encerrar sessões' }))
    await fireEvent.press(await context.findByRole('button', { name: 'Cancelar' }))
    expect(context.queryByText('Sessões encerradas (simulado)')).toBeNull()
  })

  it('Segurança: a verificação em duas etapas alterna e a senha atual abre para troca', async () => {
    const context = await abrir()
    await abrirAba(context, 'Segurança')
    expect(await context.findByRole('switch', { name: 'Verificação em duas etapas', checked: false })).toBeTruthy()
    await fireEvent.press(context.getByRole('switch', { name: 'Verificação em duas etapas' }))
    expect(await context.findByRole('switch', { name: 'Verificação em duas etapas', checked: true })).toBeTruthy()
    await fireEvent.press(await context.findByRole('button', { name: 'Trocar' }))
    expect(await context.findByLabelText('Senha')).toBeTruthy()
  })
})
