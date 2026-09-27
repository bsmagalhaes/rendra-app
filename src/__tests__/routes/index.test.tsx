import { renderRouter, screen } from 'expo-router/testing-library'
import { Text } from 'react-native'
import Index from '../../../app/index'

describe('Index', () => {
  it('redireciona para /componentes', async () => {
    await renderRouter(
      {
        index: Index,
        componentes: () => <Text>Tela de componentes</Text>,
      },
      { initialUrl: '/' },
    )
    expect(await screen.findByText('Tela de componentes')).toBeTruthy()
  })
})
