import { fireEvent } from '@testing-library/react-native'
import { renderRouter, screen } from 'expo-router/testing-library'
import { Text } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import RootLayout from '../../../app/_layout'
import NotFound from '../../../app/+not-found'
import { nodesWithCode } from '../../test-utils/rendra-code'

beforeEach(async () => {
  await AsyncStorage.clear()
})

function abrir(url: string) {
  return renderRouter(
    { _layout: RootLayout, index: () => <Text>Tela inicial</Text>, '+not-found': NotFound },
    { initialUrl: url },
  )
}

describe('+not-found', () => {
  it('uma rota inexistente mostra a tela 404 com ERRO-001 e as duas ações', async () => {
    const context = await abrir('/rota-inexistente')
    expect(await screen.findByText('Erro 404')).toBeTruthy()
    expect(await screen.findByText('Página não encontrada')).toBeTruthy()
    expect(nodesWithCode(context.container, 'ERRO-001')).toHaveLength(1)
    expect(await screen.findByRole('button', { name: 'Voltar' })).toBeTruthy()
    expect(await screen.findByRole('button', { name: 'Ir para o início' })).toBeTruthy()
  })

  it('Ir para o início leva à tela inicial', async () => {
    await abrir('/rota-inexistente')
    await fireEvent.press(await screen.findByRole('button', { name: 'Ir para o início' }))
    expect(await screen.findByText('Tela inicial')).toBeTruthy()
  })

  it('a tela tem o próprio SafeAreaView (safe-area-tela) com só o inset superior', async () => {
    await abrir('/rota-inexistente')
    const area = await screen.findByTestId('safe-area-tela')
    expect(area.props.edges.top).toBe('additive')
    expect(area.props.edges.bottom).toBe('off')
    expect(area.props.edges.left).toBe('off')
    expect(area.props.edges.right).toBe('off')
  })
})
