import { render } from '@testing-library/react-native'
import { BrandProvider } from '../../brand'
import { Separator } from './separator'

describe('Separator', () => {
  it('horizontal (padrao) tem role separator e as classes h-px w-full', async () => {
    const { findByRole } = await render(
      <BrandProvider>
        <Separator />
      </BrandProvider>,
    )
    const linha = await findByRole('separator')
    expect(linha.props.className.split(' ')).toEqual(expect.arrayContaining(['h-px', 'w-full']))
  })

  it('vertical usa w-px self-stretch', async () => {
    const { findByRole } = await render(
      <BrandProvider>
        <Separator orientation="vertical" />
      </BrandProvider>,
    )
    const linha = await findByRole('separator')
    expect(linha.props.className.split(' ')).toEqual(expect.arrayContaining(['w-px', 'self-stretch']))
  })

  it('com label, mostra o texto e o accessibilityLabel', async () => {
    const { findByRole, findByText } = await render(
      <BrandProvider>
        <Separator label="ou" />
      </BrandProvider>,
    )
    const linha = await findByRole('separator')
    expect(linha.props.accessibilityLabel).toBe('ou')
    expect(await findByText('ou')).toBeTruthy()
  })
})
