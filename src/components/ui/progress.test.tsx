import { render } from '@testing-library/react-native'
import { BrandProvider } from '../../brand'
import { Progress, progressWidth } from './progress'

describe('progressWidth', () => {
  it('limita a 100% acima do maximo', () => {
    expect(progressWidth(150)).toBe('100%')
  })
  it('limita a 0% abaixo do minimo', () => {
    expect(progressWidth(-10)).toBe('0%')
  })
  it('0 explicito fica em 0%', () => {
    expect(progressWidth(0)).toBe('0%')
  })
})

describe('Progress', () => {
  // B1 (veredito do Opus): a prop crua aria-valuenow/min/max não chega ao host sob Jest
  // (node_modules/react-native/Libraries/Components/View/View.js desestrutura e funde em
  // accessibilityValue antes de expor o nó); o espelho aria-* continua no código de produção
  // (react-native-web) e só é observável no Playwright (Tarefa 15).
  it('primeiro render com value 0 tem accessibilityValue {min 0, max 100, now 0}', async () => {
    const { findByRole } = await render(
      <BrandProvider>
        <Progress value={0} accessibilityLabel="Envio do arquivo" />
      </BrandProvider>,
    )
    const barra = await findByRole('progressbar')
    expect(barra.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 0 })
  })

  it('sem value, now fica undefined (indeterminado)', async () => {
    const { findByRole } = await render(
      <BrandProvider>
        <Progress accessibilityLabel="Carregando" />
      </BrandProvider>,
    )
    const barra = await findByRole('progressbar')
    expect(barra.props.accessibilityValue.now).toBeUndefined()
  })

  it('showValue mostra o percentual arredondado', async () => {
    const { findByText } = await render(
      <BrandProvider>
        <Progress value={39.6} showValue accessibilityLabel="Envio" />
      </BrandProvider>,
    )
    expect(await findByText('40%')).toBeTruthy()
  })

  it('tone brand renderiza o degrade accent; success nao renderiza gradiente', async () => {
    const { getAllByTestId, queryAllByTestId, rerender } = await render(
      <BrandProvider>
        <Progress value={50} tone="brand" accessibilityLabel="Envio" />
      </BrandProvider>,
    )
    expect(getAllByTestId(/^gradient-/).length).toBeGreaterThan(0)
    await rerender(
      <BrandProvider>
        <Progress value={50} tone="success" accessibilityLabel="Envio" />
      </BrandProvider>,
    )
    expect(queryAllByTestId(/^gradient-/).length).toBe(0)
  })

  it('size sm usa h-1; size md (padrao) usa h-2', async () => {
    const { findByRole, rerender } = await render(
      <BrandProvider>
        <Progress value={20} size="sm" accessibilityLabel="Envio" />
      </BrandProvider>,
    )
    let barra = await findByRole('progressbar')
    expect(barra.props.className.split(' ')).toContain('h-1')
    await rerender(
      <BrandProvider>
        <Progress value={20} accessibilityLabel="Envio" />
      </BrandProvider>,
    )
    barra = await findByRole('progressbar')
    expect(barra.props.className.split(' ')).toContain('h-2')
  })
})
