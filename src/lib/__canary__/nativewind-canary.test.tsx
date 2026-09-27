import { render, screen } from '@testing-library/react-native'
import { StyleSheet, Text, View } from 'react-native'

describe('canário do NativeWind sob Jest', () => {
  it('renderiza com className sem lançar, e o testID é encontrado', async () => {
    await render(<View testID="alvo" className="flex-1 bg-background" />)
    expect(screen.getByTestId('alvo')).toBeTruthy()
  })

  it('props.style pode ser um array; StyleSheet.flatten lê um campo específico', async () => {
    await render(
      <Text testID="texto" style={[{ color: 'red' }, { fontSize: 12 }]}>
        Olá
      </Text>,
    )
    const node = screen.getByTestId('texto')
    const flat = StyleSheet.flatten(node.props.style)
    expect(flat.fontSize).toBe(12)
  })
})
