import React from 'react'
import { render, screen } from '@testing-library/react-native'
import { BrandProvider } from '../../brand'
import { Gradient } from './gradient'

async function withProvider(ui: React.ReactElement) {
  return await render(<BrandProvider>{ui}</BrandProvider>)
}

describe('Gradient', () => {
  it('renderiza token brand dentro do provider, sem lançar', async () => {
    await withProvider(<Gradient token="brand" />)
  })
  it('renderiza token soft, lendo a chave --rendra-primary-soft (bloqueadora C1)', async () => {
    await withProvider(<Gradient token="soft" />)
  })
  it('renderiza token accent', async () => {
    await withProvider(<Gradient token="accent" />)
  })
  it('duas instâncias simultâneas têm ids diferentes (sem colisão de Defs, sem UNSAFE_*)', async () => {
    await withProvider(
      <>
        <Gradient token="brand" />
        <Gradient token="brand" />
      </>,
    )
    const ids = new Set(screen.getAllByTestId(/^gradient-/).map((n) => n.props.testID))
    expect(ids.size).toBe(2)
  })
})
