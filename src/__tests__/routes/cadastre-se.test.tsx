import { fireEvent } from '@testing-library/react-native'
import { screen } from 'expo-router/testing-library'
import { Text } from 'react-native'
import Cadastro from '../../../app/cadastre-se'
import { renderDemo } from '../../test-utils/render-demo'

const rotas = {
  'cadastre-se': Cadastro,
  verificacao: () => <Text>Tela de verificação</Text>,
  login: () => <Text>Tela de login</Text>,
}

async function preencher() {
  await fireEvent.changeText(await screen.findByLabelText('Nome completo'), 'Ana Ribeiro')
  await fireEvent.changeText(screen.getByLabelText('E-mail'), 'ana@exemplo.com.br')
  await fireEvent.changeText(screen.getByLabelText('Empresa'), 'Padaria Estrela')
  await fireEvent.changeText(screen.getByLabelText('Senha'), 'Abcdef12!')
  await fireEvent.changeText(screen.getByLabelText('Confirmar senha'), 'Abcdef12!')
}

describe('criar conta', () => {
  it('aplica a máscara de telefone', async () => {
    await renderDemo(rotas, '/cadastre-se')
    const telefone = await screen.findByLabelText('Telefone')
    await fireEvent.changeText(telefone, '11912345678')
    expect(screen.getByLabelText('Telefone').props.value).toBe('(11) 91234-5678')
  })

  it('exige aceitar os termos', async () => {
    const tela = await renderDemo(rotas, '/cadastre-se')
    await preencher()
    await fireEvent.changeText(screen.getByLabelText('Telefone'), '11912345678')
    await fireEvent.press(screen.getByRole('button', { name: 'Criar conta' }))
    expect(await screen.findByText('É preciso aceitar os termos.')).toBeTruthy()
    expect(tela.getPathname()).toBe('/cadastre-se')
  })

  it('enviar vazio mostra os erros dos campos obrigatórios', async () => {
    await renderDemo(rotas, '/cadastre-se')
    await fireEvent.press(await screen.findByRole('button', { name: 'Criar conta' }))
    expect(await screen.findByText('Nome completo é obrigatório.')).toBeTruthy()
    expect(await screen.findByText('E-mail é obrigatório.')).toBeTruthy()
    expect(await screen.findByText('Telefone incompleto.')).toBeTruthy()
    expect(await screen.findByText('Informe o nome da empresa.')).toBeTruthy()
  })

  it('recusa confirmação de senha diferente', async () => {
    await renderDemo(rotas, '/cadastre-se')
    await preencher()
    await fireEvent.changeText(screen.getByLabelText('Confirmar senha'), 'Outra123!')
    await fireEvent.press(screen.getByRole('button', { name: 'Criar conta' }))
    expect(await screen.findByText('As senhas não conferem.')).toBeTruthy()
  })

  it('com tudo certo segue para a verificação', async () => {
    const tela = await renderDemo(rotas, '/cadastre-se')
    await preencher()
    await fireEvent.changeText(screen.getByLabelText('Telefone'), '11912345678')
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Aceito os termos de uso' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Criar conta' }))
    expect(await screen.findByText('Tela de verificação')).toBeTruthy()
    expect(tela.getPathname()).toBe('/verificacao')
  })

  it('o link Voltar ao login leva ao login', async () => {
    await renderDemo(rotas, '/cadastre-se')
    await fireEvent.press(await screen.findByRole('link', { name: 'Voltar ao login' }))
    expect(await screen.findByText('Tela de login')).toBeTruthy()
  })
})
