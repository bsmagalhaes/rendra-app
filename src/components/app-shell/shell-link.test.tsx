import { Text } from 'react-native'
import { cloneElement } from 'react'
import type { ReactElement } from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import { RendraNavigationProvider, type RendraLinkProps } from '../../navigation/rendra-navigation'
import { ShellLink } from './shell-link'

// Link falso no molde do Link do Expo Router: entrega o href ao filho, que continua sendo o Pressable.
function LinkFalso({ href, children }: RendraLinkProps) {
  return cloneElement(children as ReactElement<{ accessibilityLabel?: string }>, { accessibilityLabel: `href:${href}` })
}

describe('ShellLink', () => {
  it('sem linkComponent, tocar navega e chama onNavigate', async () => {
    const navigate = jest.fn()
    const onNavigate = jest.fn()
    const { findByRole } = await render(
      <RendraNavigationProvider value={{ navigate }}>
        <ShellLink to="/tokens" active={false} onNavigate={onNavigate}>
          <Text>Tokens</Text>
        </ShellLink>
      </RendraNavigationProvider>,
    )
    await fireEvent.press(await findByRole('link', { name: 'Tokens' }))
    expect(navigate).toHaveBeenCalledWith('/tokens')
    expect(onNavigate).toHaveBeenCalledTimes(1)
  })

  it('com linkComponent, o href vai para o link e o toque só chama onNavigate', async () => {
    const navigate = jest.fn()
    const onNavigate = jest.fn()
    const { findByLabelText } = await render(
      <RendraNavigationProvider value={{ navigate, linkComponent: LinkFalso }}>
        <ShellLink to="/tokens" active onNavigate={onNavigate}>
          <Text>Tokens</Text>
        </ShellLink>
      </RendraNavigationProvider>,
    )
    const link = await findByLabelText('href:/tokens')
    expect(link.props.accessibilityState).toMatchObject({ selected: true })
    await fireEvent.press(link)
    expect(navigate).not.toHaveBeenCalled()
    expect(onNavigate).toHaveBeenCalledTimes(1)
  })
})
