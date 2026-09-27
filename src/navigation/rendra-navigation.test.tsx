import { render, fireEvent, renderHook } from '@testing-library/react-native'
import { Text, Pressable } from 'react-native'
import { RendraNavigationProvider, useRendraNavigation } from './rendra-navigation'

function Sonda() {
  const nav = useRendraNavigation()
  return (
    <Pressable accessibilityRole="button" onPress={() => nav.navigate('/destino')}>
      <Text>{nav.currentPath ?? 'sem-rota'}</Text>
    </Pressable>
  )
}

describe('RendraNavigationProvider', () => {
  it('repassa currentPath e chama navigate com o href pedido', async () => {
    const navigate = jest.fn()
    const { getByText } = await render(
      <RendraNavigationProvider value={{ navigate, currentPath: '/atual' }}>
        <Sonda />
      </RendraNavigationProvider>,
    )
    expect(getByText('/atual')).toBeTruthy()
    await fireEvent.press(getByText('/atual'))
    expect(navigate).toHaveBeenCalledWith('/destino')
  })

  // B1 (veredito do Opus): a RNTL 14 instalada torna `render`/`fireEvent.press` assíncronos; o
  // caso "sem provider" usa `renderHook` para pegar o valor devolvido pelo hook fora de provider
  // e afirma o erro lançado ao chamar `navigate` diretamente, sem depender de `fireEvent.press`.
  it('sem provider, navigate lanca erro em portugues explicando o RendraRouterBridge', async () => {
    const { result } = await renderHook(() => useRendraNavigation())
    expect(() => result.current.navigate('/x')).toThrow(/RendraRouterBridge/)
  })
})
