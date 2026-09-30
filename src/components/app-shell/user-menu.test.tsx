import { fireEvent, render } from '@testing-library/react-native'
import { BrandProvider } from '../../brand/brand-provider'
import { RendraNavigationProvider } from '../../navigation/rendra-navigation'
import { IconStub } from '../../test-utils/shell-fixtures'
import { UserMenu } from './user-menu'
import type { ShellMenuItem, ShellUser } from './types'

function montar(props: { user?: ShellUser; userMenuItems?: ShellMenuItem[]; onLogout?: () => void }, navigate = jest.fn()) {
  return render(
    <BrandProvider>
      <RendraNavigationProvider value={{ navigate, currentPath: '/' }}>
        <UserMenu user={props.user ?? { name: 'Ana Ribeiro', email: 'ana@exemplo.com' }} {...props} />
      </RendraNavigationProvider>
    </BrandProvider>,
  )
}

describe('UserMenu', () => {
  it('o gatilho é o avatar, nomeado com o usuário, e abre nome e e-mail', async () => {
    const tela = await montar({})
    await fireEvent.press(await tela.findByRole('button', { name: 'Menu de Ana Ribeiro' }))
    expect(await tela.findByText('Ana Ribeiro')).toBeTruthy()
    expect(await tela.findByText('ana@exemplo.com')).toBeTruthy()
  })

  it('sem e-mail mostra só o nome', async () => {
    const tela = await montar({ user: { name: 'Ana Ribeiro' } })
    await fireEvent.press(await tela.findByRole('button', { name: 'Menu de Ana Ribeiro' }))
    expect(await tela.findByRole('menuitem', { name: 'Aparência' })).toBeTruthy()
    expect(tela.queryByText('ana@exemplo.com')).toBeNull()
  })

  it('Aparência navega para /configuracoes', async () => {
    const navigate = jest.fn()
    const tela = await montar({}, navigate)
    await fireEvent.press(await tela.findByRole('button', { name: 'Menu de Ana Ribeiro' }))
    await fireEvent.press(await tela.findByRole('menuitem', { name: 'Aparência' }))
    expect(navigate).toHaveBeenCalledWith('/configuracoes')
  })

  it('item com `to` navega e item com `onSelect` chama a função', async () => {
    const navigate = jest.fn()
    const onSelect = jest.fn()
    const tela = await montar(
      {
        userMenuItems: [
          { label: 'Meu perfil', to: '/perfil', icon: IconStub },
          { label: 'Ajuda', onSelect },
        ],
      },
      navigate,
    )
    await fireEvent.press(await tela.findByRole('button', { name: 'Menu de Ana Ribeiro' }))
    await fireEvent.press(await tela.findByRole('menuitem', { name: 'Meu perfil' }))
    expect(navigate).toHaveBeenCalledWith('/perfil')
    await fireEvent.press(await tela.findByRole('button', { name: 'Menu de Ana Ribeiro' }))
    await fireEvent.press(await tela.findByRole('menuitem', { name: 'Ajuda' }))
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(navigate).toHaveBeenCalledTimes(1)
  })

  it('Sair chama onLogout', async () => {
    const onLogout = jest.fn()
    const tela = await montar({ user: { name: 'Ana' }, onLogout })
    await fireEvent.press(await tela.findByRole('button', { name: 'Menu de Ana' }))
    await fireEvent.press(await tela.findByRole('menuitem', { name: 'Sair' }))
    expect(onLogout).toHaveBeenCalledTimes(1)
  })

  it('sem onLogout não há item Sair', async () => {
    const tela = await montar({})
    await fireEvent.press(await tela.findByRole('button', { name: 'Menu de Ana Ribeiro' }))
    await tela.findByRole('menuitem', { name: 'Aparência' })
    expect(tela.queryByRole('menuitem', { name: 'Sair' })).toBeNull()
  })
})
