import { StyleSheet, View } from 'react-native'
import { render, fireEvent, within } from '@testing-library/react-native'
import * as SafeAreaContext from 'react-native-safe-area-context'
import { BrandProvider } from '../../brand/brand-provider'
import { RendraNavigationProvider } from '../../navigation/rendra-navigation'
import { AppShell } from '../app-shell/app-shell'
import { navComPagina } from '../../test-utils/shell-fixtures'
import { PageHeader } from './page-header'

describe('PageHeader', () => {
  it('showTitle: título visível em text-2xl, com accessibilityRole header', async () => {
    const { findByText } = await render(
      <BrandProvider>
        <PageHeader title="Minha tela" showTitle />
      </BrandProvider>,
    )
    const title = await findByText('Minha tela')
    expect(title.props.className.split(' ')).toContain('text-2xl')
    expect(title.props.accessibilityRole).toBe('header')
  })

  it('sem showTitle nem help: título oculto visualmente, mas ainda accessibilityRole header', async () => {
    const { findByText } = await render(
      <BrandProvider>
        <PageHeader title="Minha tela" description="Descrição" />
      </BrandProvider>,
    )
    const title = await findByText('Minha tela')
    const classes = title.props.className.split(' ')
    expect(classes).toEqual(expect.arrayContaining(['absolute', 'h-px', 'w-px', 'overflow-hidden']))
    expect(classes).not.toContain('opacity-0')
    expect(title.props.accessibilityRole).toBe('header')
  })

  it('sem título visível, descrição, ações, help nem children: contêiner inteiro oculto visualmente', async () => {
    const { findByTestId } = await render(
      <BrandProvider>
        <PageHeader title="Minha tela" testID="cabecalho-vazio" />
      </BrandProvider>,
    )
    const classes = (await findByTestId('cabecalho-vazio')).props.className.split(' ')
    expect(classes).toEqual(expect.arrayContaining(['absolute', 'h-px', 'w-px', 'overflow-hidden']))
    expect(classes).not.toContain('opacity-0')
  })

  it('description e actions aparecem', async () => {
    const { findByText } = await render(
      <BrandProvider>
        <PageHeader title="Minha tela" description="Descrição curta" actions={<></>} />
      </BrandProvider>,
    )
    expect(await findByText('Descrição curta')).toBeTruthy()
  })

  it('actions: cada elemento recebe flex-1 (linha dividida igualmente)', async () => {
    const { findByTestId } = await render(
      <BrandProvider>
        <PageHeader
          title="Minha tela"
          actions={
            <>
              <View testID="acao-1" />
              <View testID="acao-2" />
            </>
          }
        />
      </BrandProvider>,
    )
    expect((await findByTestId('acao-1')).props.className.split(' ')).toContain('flex-1')
    expect((await findByTestId('acao-2')).props.className.split(' ')).toContain('flex-1')
  })

  it('help: renderiza InfoHint ao lado do título e abre o modal com o título da tela', async () => {
    const { findByLabelText, findAllByText } = await render(
      <BrandProvider>
        <PageHeader title="Minha tela" help={<></>} />
      </BrandProvider>,
    )
    const trigger = await findByLabelText('Sobre: Minha tela')
    await fireEvent.press(trigger)
    // findAllByText, não findByText: com help presente, titleVisible (showTitle || help) fica
    // verdadeiro (o próprio contrato do componente), então o título do PageHeader já aparece
    // visível; abrir o InfoHint soma um segundo "Minha tela" dentro do Modal (o próprio título
    // passado ao InfoHint), ficando 2 nós de texto iguais na árvore, não 1.
    const matches = await findAllByText('Minha tela')
    expect(matches.length).toBe(2)
  })

  it('paddingTop = max(0, insets.top)', async () => {
    const { findByTestId } = await render(
      <BrandProvider>
        <PageHeader title="Minha tela" testID="cabecalho" />
      </BrandProvider>,
    )
    const header = await findByTestId('cabecalho')
    expect(StyleSheet.flatten(header.props.style)).toMatchObject({ paddingTop: 0 })
  })
})

describe('PageHeader dentro do AppShell', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  function dentroDoShell(filho: React.ReactNode) {
    return render(
      <BrandProvider>
        <RendraNavigationProvider value={{ navigate: jest.fn(), currentPath: '/paginas' }}>
          <AppShell navigation={navComPagina}>{filho}</AppShell>
        </RendraNavigationProvider>
      </BrandProvider>,
    )
  }

  it('não soma o inset superior (o cabeçalho do shell é o dono) e mostra o título uma vez, no cabeçalho', async () => {
    jest.spyOn(SafeAreaContext, 'useSafeAreaInsets').mockReturnValue({ top: 24, bottom: 0, left: 0, right: 0 })
    const { findAllByText, findByTestId } = await dentroDoShell(
      <PageHeader title="Minha tela" showTitle testID="cabecalho" />,
    )
    const titulos = await findAllByText('Minha tela')
    expect(titulos).toHaveLength(2)
    const classes = titulos.map((t) => String(t.props.className))
    // um é o título oculto do PageHeader (só leitor de tela), o outro o visível do cabeçalho
    expect(classes.filter((c) => c.includes('absolute'))).toHaveLength(1)
    expect(classes.filter((c) => c.includes('text-base'))).toHaveLength(1)
    const oculto = titulos.find((t) => String(t.props.className).includes('absolute'))!
    expect(oculto.props.accessibilityRole).toBe('header')
    expect(StyleSheet.flatten((await findByTestId('cabecalho')).props.style)).toMatchObject({ paddingTop: 0 })
  })

  it('envia a ajuda em texto ao cabeçalho, sem InfoHint duplicado na tela', async () => {
    const { findAllByRole, findByTestId } = await dentroDoShell(
      <PageHeader title="Minha tela" help="Como usar esta tela" />,
    )
    const dicas = await findAllByRole('button', { name: 'Sobre: Minha tela' })
    expect(dicas).toHaveLength(1)
    // a única dica mora no cabeçalho do shell, não na tela
    expect(await within(await findByTestId('shell-cabecalho')).findByRole('button', { name: 'Sobre: Minha tela' })).toBeTruthy()
  })

  it('ajuda que não é texto continua como InfoHint da própria tela', async () => {
    const { findAllByRole } = await dentroDoShell(<PageHeader title="Minha tela" help={<View />} />)
    expect(await findAllByRole('button', { name: 'Sobre: Minha tela' })).toHaveLength(1)
  })

  it('a tela que segue montada depois de a rota mudar não sobrescreve o título do cabeçalho', async () => {
    const arvore = (caminho: string) => (
      <BrandProvider>
        <RendraNavigationProvider value={{ navigate: jest.fn(), currentPath: caminho }}>
          <AppShell navigation={navComPagina}>
            <PageHeader title="Minha tela" />
          </AppShell>
        </RendraNavigationProvider>
      </BrandProvider>
    )
    const tela = await render(arvore('/paginas'))
    const noCabecalho = async (texto: string) =>
      within(await tela.findByTestId('shell-cabecalho')).findByText(texto)
    expect(await noCabecalho('Minha tela')).toBeTruthy()
    // a rota muda para um destino sem PageHeader próprio; a tela antiga segue montada (pilha)
    await tela.rerender(arvore('/tokens'))
    expect(await noCabecalho('Tokens')).toBeTruthy()
  })

  it('descrição e ações continuam na tela', async () => {
    const { findByText } = await dentroDoShell(<PageHeader title="Minha tela" description="Descrição da tela" />)
    expect(await findByText('Descrição da tela')).toBeTruthy()
  })
})
