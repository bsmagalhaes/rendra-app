import { Linking } from 'react-native'
import { fireEvent, render } from '@testing-library/react-native'
import { BrandProvider } from '../../brand/brand-provider'
import { nodesWithCode } from '../../test-utils/rendra-code'
import { RendraCredit, RENDRA_CREDIT_HREF, RENDRA_CREDIT_TEXT } from './rendra-credit'

afterEach(() => {
  jest.restoreAllMocks()
})

describe('RendraCredit', () => {
  it('mostra o texto padrão com papel de link e abre o href ao tocar', async () => {
    const spy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true as never)
    const { findByRole } = await render(
      <BrandProvider>
        <RendraCredit />
      </BrandProvider>,
    )
    const link = await findByRole('link', { name: RENDRA_CREDIT_TEXT })
    await fireEvent.press(link)
    expect(spy).toHaveBeenCalledWith(RENDRA_CREDIT_HREF)
  })

  it('credit={false} não renderiza nada', async () => {
    const { queryByRole, queryByText } = await render(
      <BrandProvider>
        <RendraCredit credit={false} />
      </BrandProvider>,
    )
    expect(queryByRole('link')).toBeNull()
    expect(queryByText(RENDRA_CREDIT_TEXT)).toBeNull()
  })

  it('aceita texto e link próprios', async () => {
    const spy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true as never)
    const { findByRole, queryByText } = await render(
      <BrandProvider>
        <RendraCredit text="Feito com Zuper" href="https://zuper.com.br" />
      </BrandProvider>,
    )
    const link = await findByRole('link', { name: 'Feito com Zuper' })
    expect(queryByText(RENDRA_CREDIT_TEXT)).toBeNull()
    await fireEvent.press(link)
    expect(spy).toHaveBeenCalledWith('https://zuper.com.br')
  })

  it('grava o código CRED-001 na raiz e repassa o testID ao link', async () => {
    const { container, findByTestId } = await render(
      <BrandProvider>
        <RendraCredit testID="credito" />
      </BrandProvider>,
    )
    const link = await findByTestId('credito')
    expect(link.props.accessibilityRole).toBe('link')
    expect(nodesWithCode(container, 'CRED-001')).toHaveLength(1)
  })

  it('o texto usa a cor de apoio e o tamanho pequeno do sistema', async () => {
    const { findByText } = await render(
      <BrandProvider>
        <RendraCredit />
      </BrandProvider>,
    )
    const texto = await findByText(RENDRA_CREDIT_TEXT)
    expect(String(texto.props.className).split(' ')).toEqual(
      expect.arrayContaining(['text-xs', 'text-muted-foreground']),
    )
  })
})
