import { StyleSheet, View } from 'react-native'
import { render, fireEvent } from '@testing-library/react-native'
import { BrandProvider } from '../../brand/brand-provider'
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
