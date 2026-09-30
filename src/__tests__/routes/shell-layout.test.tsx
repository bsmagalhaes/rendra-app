import { StyleSheet } from 'react-native'
import { renderRouter, screen } from 'expo-router/testing-library'
import * as SafeAreaContext from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import RootLayout from '../../../app/_layout'
import ShellLayout from '../../../app/(shell)/_layout'
import TokensIndex from '../../../app/(shell)/tokens/index'

beforeEach(async () => {
  await AsyncStorage.clear()
})

afterEach(() => {
  jest.restoreAllMocks()
})

function abrirTokens() {
  return renderRouter(
    { _layout: RootLayout, '(shell)/_layout': ShellLayout, '(shell)/tokens/index': TokensIndex },
    { initialUrl: '/tokens' },
  )
}

describe('grupo (shell)', () => {
  it('a rota /tokens abre dentro do AppShell: barra inferior, botão de menu e usuário de exemplo', async () => {
    await abrirTokens()
    expect(await screen.findByLabelText('Navegação rápida')).toBeTruthy()
    expect(await screen.findByRole('button', { name: 'Abrir menu' })).toBeTruthy()
    expect(await screen.findByRole('button', { name: 'Menu de Ana Ribeiro' })).toBeTruthy()
    expect(await screen.findByText('Paleta')).toBeTruthy()
  })

  it('o cabeçalho do shell é o dono do inset superior (paddingTop 24) e a raiz não tem SafeAreaView', async () => {
    jest.spyOn(SafeAreaContext, 'useSafeAreaInsets').mockReturnValue({ top: 24, bottom: 0, left: 0, right: 0 })
    await abrirTokens()
    const cabecalho = await screen.findByTestId('shell-cabecalho')
    expect(StyleSheet.flatten(cabecalho.props.style)).toMatchObject({ paddingTop: 24 })
    expect(screen.queryByTestId('safe-area-raiz')).toBeNull()
  })

  it('o título do cabeçalho é o do destino ativo (Tokens)', async () => {
    await abrirTokens()
    const titulos = await screen.findAllByText('Tokens')
    expect(titulos.some((t) => String(t.props.className).includes('text-base'))).toBe(true)
  })
})
