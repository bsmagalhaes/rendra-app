import { fireEvent } from '@testing-library/react-native'
import { screen } from 'expo-router/testing-library'
import { Text } from 'react-native'
import ShellLayout from '../../../app/(shell)/_layout'
import { exampleUser } from '../../config/navigation'
import { renderDemo } from '../../test-utils/render-demo'

const rotas = {
  '(shell)/_layout': ShellLayout,
  '(shell)/painel': () => <Text>Conteúdo do painel</Text>,
  login: () => <Text>Tela de login</Text>,
}

describe('saída do usuário', () => {
  it('Sair no menu do usuário volta ao login', async () => {
    const tela = await renderDemo(rotas, '/painel')
    await fireEvent.press(await screen.findByRole('button', { name: `Menu de ${exampleUser.name}` }))
    await fireEvent.press(await screen.findByRole('menuitem', { name: 'Sair' }))
    expect(await screen.findByText('Tela de login')).toBeTruthy()
    expect(tela.getPathname()).toBe('/login')
  })

  it('o menu do usuário só sai quando o item Sair é escolhido', async () => {
    const tela = await renderDemo(rotas, '/painel')
    await fireEvent.press(await screen.findByRole('button', { name: `Menu de ${exampleUser.name}` }))
    expect(await screen.findByRole('menuitem', { name: 'Sair' })).toBeTruthy()
    expect(tela.getPathname()).toBe('/painel')
    expect(screen.queryByText('Tela de login')).toBeNull()
  })
})
