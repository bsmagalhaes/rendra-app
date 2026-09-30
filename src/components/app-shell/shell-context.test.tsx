import { Pressable, Text } from 'react-native'
import { fireEvent, render, renderHook, waitFor } from '@testing-library/react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { BrandProvider } from '../../brand/brand-provider'
import { RendraNavigationProvider } from '../../navigation/rendra-navigation'
import { navComPagina } from '../../test-utils/shell-fixtures'
import { ShellProvider, useShell, type ShellProviderProps } from './shell-context'

const CHAVE = 'rendra:shell-layout'

function SondaLayout() {
  const { layout, hydrated, applyLayout, resetLayout, setLayout } = useShell()
  return (
    <>
      <Text testID="layout-atual">{`${layout.menu}|${layout.bottomNav}`}</Text>
      <Text testID="hidratado">{String(hydrated)}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="aplicar N3" onPress={() => applyLayout('N3')}>
        <Text>aplicar N3</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="sem barra" onPress={() => setLayout({ bottomNav: false })}>
        <Text>sem barra</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="restaurar" onPress={() => resetLayout()}>
        <Text>restaurar</Text>
      </Pressable>
    </>
  )
}

function SondaMenu() {
  const { mobileNavOpen, setMobileNavOpen, bottomNavItems, navigationTargets, activeTo } = useShell()
  return (
    <>
      <Text testID="menu-aberto">{String(mobileNavOpen)}</Text>
      <Text testID="itens-barra">{bottomNavItems.map((i) => i.title).join(',')}</Text>
      <Text testID="alvos">{String(navigationTargets.length)}</Text>
      <Text testID="ativo">{String(activeTo)}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="abrir" onPress={() => setMobileNavOpen(true)}>
        <Text>abrir</Text>
      </Pressable>
    </>
  )
}

function SondaMeta() {
  const { pageTitle, pageHelp, setPageMeta } = useShell()
  return (
    <>
      <Text testID="meta">{`${pageTitle ?? '-'}|${pageHelp ?? '-'}`}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="definir"
        onPress={() => setPageMeta({ title: 'Minha tela', help: 'Ajuda' })}
      >
        <Text>definir</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="limpar" onPress={() => setPageMeta(null)}>
        <Text>limpar</Text>
      </Pressable>
    </>
  )
}

function SondaMetaDeOutraRota() {
  const { pageTitle, setPageMeta } = useShell()
  return (
    <>
      <Text testID="meta-outra">{pageTitle ?? '-'}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="definir de outra rota"
        onPress={() => setPageMeta({ title: 'Tela empilhada', path: '/outra' })}
      >
        <Text>definir de outra rota</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="definir da rota atual"
        onPress={() => setPageMeta({ title: 'Tela atual', path: '/paginas' })}
      >
        <Text>definir da rota atual</Text>
      </Pressable>
    </>
  )
}

function montar(filho: React.ReactNode, props: Partial<ShellProviderProps> = {}, searchParams?: Record<string, string>) {
  return render(
    <BrandProvider>
      <RendraNavigationProvider value={{ navigate: jest.fn(), currentPath: '/paginas', searchParams }}>
        <ShellProvider navigation={navComPagina} {...props}>
          {filho}
        </ShellProvider>
      </RendraNavigationProvider>
    </BrandProvider>,
  )
}

beforeEach(async () => {
  await AsyncStorage.clear()
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('ShellProvider: layout e persistência', () => {
  it('sem nada salvo, hidrata no padrão N1 (drawer|true)', async () => {
    const tela = await montar(<SondaLayout />)
    await waitFor(async () => expect((await tela.findByTestId('hidratado')).props.children).toBe('true'))
    expect((await tela.findByTestId('layout-atual')).props.children).toBe('drawer|true')
  })

  it('se a leitura do armazenamento rejeitar, hidrata mesmo assim no padrão N1', async () => {
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('storage indisponível'))
    const tela = await montar(<SondaLayout />)
    await waitFor(async () => expect((await tela.findByTestId('hidratado')).props.children).toBe('true'))
    expect((await tela.findByTestId('layout-atual')).props.children).toBe('drawer|true')
  })

  it('aplica o layout salvo depois de hidratar', async () => {
    await AsyncStorage.setItem(CHAVE, JSON.stringify({ version: 1, layout: { bottomNav: false, menu: 'sheet' } }))
    const tela = await montar(<SondaLayout />)
    expect(await tela.findByText('sheet|false')).toBeTruthy()
  })

  it('ignora conteúdo salvo corrompido e mantém o padrão', async () => {
    await AsyncStorage.setItem(CHAVE, '{lixo')
    const tela = await montar(<SondaLayout />)
    await waitFor(async () => expect((await tela.findByTestId('hidratado')).props.children).toBe('true'))
    expect(await tela.findByText('drawer|true')).toBeTruthy()
  })

  it('valida campo a campo: aproveita o campo válido e descarta o inválido', async () => {
    await AsyncStorage.setItem(CHAVE, JSON.stringify({ version: 1, layout: { bottomNav: 'sim', menu: 'sheet' } }))
    const tela = await montar(<SondaLayout />)
    expect(await tela.findByText('sheet|true')).toBeTruthy()
  })

  it.each(['null', '"texto"', JSON.stringify({ version: 1 }), JSON.stringify({ version: 1, layout: 'x' })])(
    'descarta conteúdo salvo sem layout utilizável (%s)',
    async (bruto) => {
      await AsyncStorage.setItem(CHAVE, bruto)
      const tela = await montar(<SondaLayout />)
      await waitFor(async () => expect((await tela.findByTestId('hidratado')).props.children).toBe('true'))
      expect(await tela.findByText('drawer|true')).toBeTruthy()
    },
  )

  it('descarta versão desconhecida do formato salvo', async () => {
    await AsyncStorage.setItem(CHAVE, JSON.stringify({ version: 2, layout: { bottomNav: false, menu: 'sheet' } }))
    const tela = await montar(<SondaLayout />)
    await waitFor(async () => expect((await tela.findByTestId('hidratado')).props.children).toBe('true'))
    expect(await tela.findByText('drawer|true')).toBeTruthy()
  })

  it('applyLayout("N3") muda o layout e grava o formato versionado', async () => {
    const tela = await montar(<SondaLayout />)
    await fireEvent.press(await tela.findByRole('button', { name: 'aplicar N3' }))
    expect(await tela.findByText('drawer|false')).toBeTruthy()
    await waitFor(async () => {
      const salvo = JSON.parse((await AsyncStorage.getItem(CHAVE)) ?? 'null')
      expect(salvo).toEqual({ version: 1, layout: { bottomNav: false, menu: 'drawer' } })
    })
  })

  it('setLayout parcial mescla com o layout atual', async () => {
    const tela = await montar(<SondaLayout />, { layout: { menu: 'sheet' } })
    expect(await tela.findByText('sheet|true')).toBeTruthy()
    await fireEvent.press(await tela.findByRole('button', { name: 'sem barra' }))
    expect(await tela.findByText('sheet|false')).toBeTruthy()
  })

  it('resetLayout apaga o salvo e volta ao layout da prop', async () => {
    await AsyncStorage.setItem(CHAVE, JSON.stringify({ version: 1, layout: { bottomNav: false, menu: 'sheet' } }))
    const tela = await montar(<SondaLayout />, { layout: { menu: 'drawer' } })
    expect(await tela.findByText('sheet|false')).toBeTruthy()
    await fireEvent.press(await tela.findByRole('button', { name: 'restaurar' }))
    expect(await tela.findByText('drawer|true')).toBeTruthy()
    await waitFor(async () => expect(await AsyncStorage.getItem(CHAVE)).toBeNull())
  })

  it('userConfigurable={false} ignora o salvo e não grava', async () => {
    await AsyncStorage.setItem(CHAVE, JSON.stringify({ version: 1, layout: { bottomNav: false, menu: 'sheet' } }))
    const setItem = jest.spyOn(AsyncStorage, 'setItem')
    setItem.mockClear() // o mock do módulo acumula chamadas de outros casos
    const tela = await montar(<SondaLayout />, { userConfigurable: false })
    expect(await tela.findByText('drawer|true')).toBeTruthy()
    expect((await tela.findByTestId('hidratado')).props.children).toBe('true')
    await fireEvent.press(await tela.findByRole('button', { name: 'aplicar N3' }))
    expect(await tela.findByText('drawer|false')).toBeTruthy()
    // O BrandProvider também grava (chave própria); só a chave do shell não pode aparecer.
    expect(setItem.mock.calls.filter(([chave]) => chave === CHAVE)).toEqual([])
    expect(await AsyncStorage.getItem(CHAVE)).toContain('sheet')
  })

  it('?codigo=T1-C1-N3 na URL aplica o layout N3 depois de hidratar', async () => {
    const tela = await montar(<SondaLayout />, {}, { codigo: 'T1-C1-N3' })
    expect(await tela.findByText('drawer|false')).toBeTruthy()
  })

  it('?codigo= sem parte N não muda o layout', async () => {
    await AsyncStorage.setItem(CHAVE, JSON.stringify({ version: 1, layout: { bottomNav: false, menu: 'sheet' } }))
    const tela = await montar(<SondaLayout />, {}, { codigo: 'T2-C3' })
    expect(await tela.findByText('sheet|false')).toBeTruthy()
  })

  it('o valor de ?codigo= é aplicado uma vez: restaurar à mão depois não é revertido', async () => {
    const tela = await montar(<SondaLayout />, {}, { codigo: 'T1-C1-N3' })
    expect(await tela.findByText('drawer|false')).toBeTruthy()
    await fireEvent.press(await tela.findByRole('button', { name: 'restaurar' }))
    expect(await tela.findByText('drawer|true')).toBeTruthy()
    await waitFor(async () => expect(await AsyncStorage.getItem(CHAVE)).toBeNull())
  })
})

describe('ShellProvider: navegação derivada e menu', () => {
  it('deriva itens da barra, destinos e item ativo, e alterna o menu', async () => {
    const tela = await montar(<SondaMenu />)
    expect((await tela.findByTestId('itens-barra')).props.children).toBe('Início,Páginas')
    expect((await tela.findByTestId('alvos')).props.children).toBe('4')
    expect((await tela.findByTestId('ativo')).props.children).toBe('/paginas')
    expect((await tela.findByTestId('menu-aberto')).props.children).toBe('false')
    await fireEvent.press(await tela.findByRole('button', { name: 'abrir' }))
    expect((await tela.findByTestId('menu-aberto')).props.children).toBe('true')
  })

  it('setPageMeta publica título e ajuda e null limpa', async () => {
    const tela = await montar(<SondaMeta />)
    expect(await tela.findByText('-|-')).toBeTruthy()
    await fireEvent.press(await tela.findByRole('button', { name: 'definir' }))
    expect(await tela.findByText('Minha tela|Ajuda')).toBeTruthy()
    await fireEvent.press(await tela.findByRole('button', { name: 'limpar' }))
    expect(await tela.findByText('-|-')).toBeTruthy()
  })
})

describe('ShellProvider: título enviado por uma tela que já não é a atual', () => {
  it('ignora o título de outra rota (tela que segue montada por baixo na pilha) e aceita o da rota atual', async () => {
    const tela = await montar(<SondaMetaDeOutraRota />)
    await fireEvent.press(await tela.findByRole('button', { name: 'definir de outra rota' }))
    expect((await tela.findByTestId('meta-outra')).props.children).toBe('-')
    await fireEvent.press(await tela.findByRole('button', { name: 'definir da rota atual' }))
    expect((await tela.findByTestId('meta-outra')).props.children).toBe('Tela atual')
  })
})

describe('useShell', () => {
  it('fora do provider lança com o nome do ShellProvider', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    await expect(renderHook(() => useShell())).rejects.toThrow(/ShellProvider/)
  })
})
