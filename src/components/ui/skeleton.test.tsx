import { render, waitFor } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'
import { BrandProvider } from '../../brand'
import { Skeleton } from './skeleton'
import { nodesWithCode } from '../../test-utils/rendra-code'

jest.mock('../../lib/reduced-motion', () => ({ useReducedMotion: jest.fn(() => false) }))

describe('Skeleton', () => {
  afterEach(() => {
    ;(jest.requireMock('../../lib/reduced-motion') as { useReducedMotion: jest.Mock }).useReducedMotion.mockReturnValue(
      false,
    )
  })

  it('fica oculto de leitor de tela e mostra as classes de forma', async () => {
    const { queryByTestId, getByTestId } = await render(
      <BrandProvider>
        <Skeleton testID="sk" className="h-4 w-40" />
      </BrandProvider>,
    )
    expect(queryByTestId('sk')).toBeNull()
    const no = getByTestId('sk', { includeHiddenElements: true })
    expect(no.props.accessibilityElementsHidden).toBe(true)
    expect(no.props.importantForAccessibility).toBe('no-hide-descendants')
    expect(no.props.className.split(' ')).toEqual(
      expect.arrayContaining(['rounded-block', 'h-4', 'w-40']),
    )
  })

  it('com useReducedMotion true, o primeiro render fica com opacidade 1 (guarda; prova real no emulador)', async () => {
    const reducedMotion = jest.requireMock('../../lib/reduced-motion') as {
      useReducedMotion: jest.Mock
    }
    reducedMotion.useReducedMotion.mockReturnValue(true)
    const { findByTestId } = await render(
      <BrandProvider>
        <Skeleton testID="sk" />
      </BrandProvider>,
    )
    const pulso = await findByTestId('sk-pulso', { includeHiddenElements: true })
    await waitFor(() => {
      expect(StyleSheet.flatten(pulso.props.style).opacity).toBe(1)
    })
  })

  it('carrega dataSet.rendra = SKEL-001 na raiz (item D12 do levantamento da Sincronizacao 1)', async () => {
    const { container } = await render(
      <BrandProvider>
        <Skeleton />
      </BrandProvider>,
    )
    expect(nodesWithCode(container, 'SKEL-001')).toHaveLength(1)
  })
})
