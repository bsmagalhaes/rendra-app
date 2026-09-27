import { render } from '@testing-library/react-native'
import { View } from 'react-native'
import { BrandProvider } from '../../brand/brand-provider'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card'

describe('Card', () => {
  it('CardContent logo após CardHeader não tem padding superior', async () => {
    const { findByTestId } = await render(
      <BrandProvider>
        <Card>
          <CardHeader>
            <CardTitle>Título</CardTitle>
          </CardHeader>
          <CardContent testID="conteudo">
            <View />
          </CardContent>
        </Card>
      </BrandProvider>,
    )
    const content = await findByTestId('conteudo')
    expect(content.props.className.split(' ')).toContain('pb-4')
    expect(content.props.className.split(' ')).not.toContain('p-4')
  })

  it('CardContent sem CardHeader antes mantém padding em todos os lados', async () => {
    const { findByTestId } = await render(
      <BrandProvider>
        <Card>
          <CardContent testID="conteudo">
            <View />
          </CardContent>
        </Card>
      </BrandProvider>,
    )
    const content = await findByTestId('conteudo')
    expect(content.props.className.split(' ')).toContain('p-4')
  })

  it('CardTitle help renderiza InfoHint com accessibilityLabel "Sobre: Título"', async () => {
    const { findByLabelText } = await render(
      <BrandProvider>
        <Card>
          <CardHeader>
            <CardTitle help="Texto de ajuda">Título</CardTitle>
          </CardHeader>
        </Card>
      </BrandProvider>,
    )
    expect(await findByLabelText('Sobre: Título')).toBeTruthy()
  })

  it('CardHeader actions renderiza as ações ao lado do título', async () => {
    const { findByText } = await render(
      <BrandProvider>
        <Card>
          <CardHeader actions={<View />}>
            <CardTitle>Título</CardTitle>
            <CardDescription>Descrição</CardDescription>
          </CardHeader>
        </Card>
      </BrandProvider>,
    )
    expect(await findByText('Descrição')).toBeTruthy()
  })

  it('CardFooter renderiza com border-t', async () => {
    const { findByTestId } = await render(
      <BrandProvider>
        <Card>
          <CardFooter testID="rodape">
            <View />
          </CardFooter>
        </Card>
      </BrandProvider>,
    )
    const footer = await findByTestId('rodape')
    expect(footer.props.className.split(' ')).toContain('border-t')
  })
})
