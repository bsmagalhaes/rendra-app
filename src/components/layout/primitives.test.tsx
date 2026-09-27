import { StyleSheet } from 'react-native'
import { render } from '@testing-library/react-native'
import type { TestInstance } from 'test-renderer'
import { Container, Grid, Inline, Section, Stack } from './primitives'
import { Text } from '../internal/text'
import { BrandProvider } from '../../brand/brand-provider'

// `Text` interno (src/components/internal/text.tsx) chama useBrand() e lança fora de
// <BrandProvider>; todo teste deste arquivo que renderiza <Text> precisa do provider por fora
// (desvio registrado na Tarefa 13).
function withBrand(children: React.ReactNode) {
  return <BrandProvider>{children}</BrandProvider>
}

describe('Container', () => {
  it('renderiza os filhos', async () => {
    const { findByText } = await render(
      withBrand(
        <Container>
          <Text>Conteúdo</Text>
        </Container>,
      ),
    )
    expect(await findByText('Conteúdo')).toBeTruthy()
  })

  it.each([
    ['default' as const, 'max-w-none'],
    ['narrow' as const, 'max-w-3xl'],
  ])('size %s usa %s', async (size, expectedClass) => {
    const { getByTestId } = await render(
      withBrand(<Container testID="container" size={size}><Text>x</Text></Container>),
    )
    expect(getByTestId('container').props.className.split(' ')).toContain(expectedClass)
  })

  it('padded acrescenta py-4; sem padded não tem py-4', async () => {
    const { getByTestId, rerender } = await render(
      withBrand(<Container testID="container" padded><Text>x</Text></Container>),
    )
    expect(getByTestId('container').props.className.split(' ')).toContain('py-4')
    await rerender(withBrand(<Container testID="container"><Text>x</Text></Container>))
    expect(getByTestId('container').props.className.split(' ')).not.toContain('py-4')
  })
})

describe('Stack', () => {
  it('renderiza os filhos em coluna com o gap padrão (4)', async () => {
    const { getByTestId } = await render(
      withBrand(
        <Stack testID="stack">
          <Text>Um</Text>
          <Text>Dois</Text>
        </Stack>,
      ),
    )
    const classes = getByTestId('stack').props.className.split(' ')
    expect(classes).toContain('flex-col')
    expect(classes).toContain('gap-4')
    expect(classes).toContain('items-stretch')
  })

  it('aceita gap e align customizados', async () => {
    const { getByTestId } = await render(
      withBrand(
        <Stack testID="stack" gap="2" align="center">
          <Text>x</Text>
        </Stack>,
      ),
    )
    const classes = getByTestId('stack').props.className.split(' ')
    expect(classes).toContain('gap-2')
    expect(classes).toContain('items-center')
  })
})

describe('Inline', () => {
  it('renderiza em linha com os padrões do contrato (gap 2, align center, justify start, wrap)', async () => {
    const { getByTestId } = await render(
      withBrand(
        <Inline testID="inline">
          <Text>Um</Text>
          <Text>Dois</Text>
        </Inline>,
      ),
    )
    const classes = getByTestId('inline').props.className.split(' ')
    expect(classes).toContain('flex-row')
    expect(classes).toContain('gap-2')
    expect(classes).toContain('items-center')
    expect(classes).toContain('justify-start')
    expect(classes).toContain('flex-wrap')
  })

  it('wrap={false} não acrescenta flex-wrap', async () => {
    const { getByTestId } = await render(
      withBrand(
        <Inline testID="inline" wrap={false}>
          <Text>x</Text>
        </Inline>,
      ),
    )
    const classes = getByTestId('inline').props.className.split(' ')
    expect(classes).not.toContain('flex-wrap')
  })
})

describe('Grid', () => {
  it('cols=2 (padrão gap 4): contêiner com -mx-2 e cada filho com px-2 e 50% de largura', async () => {
    const { getByTestId } = await render(
      withBrand(
        <Grid testID="grid" cols={2}>
          <Text>1</Text>
          <Text>2</Text>
        </Grid>,
      ),
    )
    const container = getByTestId('grid')
    expect(container.props.className.split(' ')).toContain('-mx-2')
    const cells = container.children as TestInstance[]
    expect(cells).toHaveLength(2)
    for (const cell of cells) {
      expect(cell.props.className.split(' ')).toContain('px-2')
      expect(StyleSheet.flatten(cell.props.style)).toMatchObject({ width: '50%' })
    }
  })

  it('cols=1 é o padrão', async () => {
    const { getByTestId } = await render(
      withBrand(
        <Grid testID="grid">
          <Text>1</Text>
        </Grid>,
      ),
    )
    const cell = getByTestId('grid').children[0] as TestInstance
    expect(StyleSheet.flatten(cell.props.style)).toMatchObject({ width: '100%' })
  })

  it('3 filhos com cols=2: o terceiro ocupa sozinho 50% de largura, sem quebrar o layout', async () => {
    const { getByTestId } = await render(
      withBrand(
        <Grid testID="grid" cols={2}>
          <Text>1</Text>
          <Text>2</Text>
          <Text>3</Text>
        </Grid>,
      ),
    )
    const cells = getByTestId('grid').children as TestInstance[]
    expect(cells).toHaveLength(3)
    for (const cell of cells) {
      expect(StyleSheet.flatten(cell.props.style)).toMatchObject({ width: '50%' })
    }
  })

  it('gap=8 usa -mx-4 no contêiner e px-4 no filho (metade de 32px = 16px = escala 4)', async () => {
    const { getByTestId } = await render(
      withBrand(
        <Grid testID="grid" cols={2} gap="8">
          <Text>1</Text>
          <Text>2</Text>
        </Grid>,
      ),
    )
    const container = getByTestId('grid')
    expect(container.props.className.split(' ')).toContain('-mx-4')
    expect((container.children[0] as TestInstance).props.className.split(' ')).toContain('px-4')
  })

  it('contêiner recebe gap-y correspondente ao degrau cheio, para o espaço vertical entre linhas', async () => {
    const { getByTestId } = await render(
      withBrand(
        <Grid testID="grid" cols={2} gap="8">
          <Text>1</Text>
          <Text>2</Text>
        </Grid>,
      ),
    )
    expect(getByTestId('grid').props.className.split(' ')).toContain('gap-y-8')
  })
})

describe('Section', () => {
  it('renderiza título com accessibilityRole header e descrição', async () => {
    const { findByText, findByRole } = await render(
      withBrand(
        <Section title="Seção" description="Descrição breve">
          <Text>Conteúdo</Text>
        </Section>,
      ),
    )
    const title = await findByRole('header')
    expect(title).toHaveTextContent('Seção')
    expect(await findByText('Descrição breve')).toBeTruthy()
    expect(await findByText('Conteúdo')).toBeTruthy()
  })

  it('sem title nem actions, não renderiza o bloco de cabeçalho', async () => {
    const { queryByRole } = await render(
      withBrand(
        <Section>
          <Text>Conteúdo</Text>
        </Section>,
      ),
    )
    expect(queryByRole('header')).toBeNull()
  })

  it('renderiza actions quando fornecidas', async () => {
    const { findByText } = await render(
      withBrand(
        <Section title="Seção" actions={<Text>Ação</Text>}>
          <Text>Conteúdo</Text>
        </Section>,
      ),
    )
    expect(await findByText('Ação')).toBeTruthy()
  })
})
