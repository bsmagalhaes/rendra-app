import React from 'react'
import { render, screen, waitFor } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'
import { BrandProvider, useBrand } from '../../brand'
import { Text } from './text'

async function withProvider(ui: React.ReactElement) {
  return await render(<BrandProvider>{ui}</BrandProvider>)
}

describe('Text', () => {
  it('resolve fontFamily normal pelo modelo ativo (T1 Safira -> Poppins)', async () => {
    await withProvider(<Text weight="normal">Olá</Text>)
    const node = await screen.findByText('Olá')
    expect(StyleSheet.flatten(node.props.style)).toMatchObject({ fontFamily: 'Poppins_400Regular' })
  })

  it('peso medium usa o arquivo de peso 500, nunca fontWeight numérico', async () => {
    await withProvider(<Text weight="medium">Olá</Text>)
    const node = await screen.findByText('Olá')
    const flat = StyleSheet.flatten(node.props.style)
    expect(flat).toMatchObject({ fontFamily: 'Poppins_500Medium' })
    expect(flat.fontWeight).toBeUndefined()
  })

  it('troca de modelo em runtime muda a fonte resolvida, depois de hydrated (T1 Poppins -> T3 Inter)', async () => {
    function Probe() {
      const { setModelCode, hydrated } = useBrand()
      React.useEffect(() => {
        if (hydrated) setModelCode('T3')
      }, [hydrated, setModelCode])
      return <Text weight="normal">Olá</Text>
    }
    await withProvider(<Probe />)
    await waitFor(async () => {
      const node = await screen.findByText('Olá')
      expect(StyleSheet.flatten(node.props.style)).toMatchObject({ fontFamily: 'Inter_400Regular' })
    })
  })
})
