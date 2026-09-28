import { render } from '@testing-library/react-native'
import { BrandProvider } from '../../brand'
import { Spinner, spinnerRotationStyle } from './spinner'

describe('Spinner', () => {
  it('sem label, e decorativo (aria-hidden)', async () => {
    const { getByTestId } = await render(
      <BrandProvider>
        <Spinner testID="s" />
      </BrandProvider>,
    )
    const raiz = getByTestId('s', { includeHiddenElements: true })
    expect(raiz.props.accessibilityElementsHidden).toBe(true)
    expect(raiz.props.importantForAccessibility).toBe('no-hide-descendants')
  })

  it('com label, role status e texto acessivel', async () => {
    const { findByRole, findByText } = await render(
      <BrandProvider>
        <Spinner label="Carregando" />
      </BrandProvider>,
    )
    expect(await findByRole('status')).toBeTruthy()
    expect(await findByText('Carregando')).toBeTruthy()
  })

  it('size mapeia size-icon-sm/md/lg (24px) no icone: cssInterop converte a classe em width/height, nao sobra string', async () => {
    // O icone (lucide-react-native) passa por cssInterop (src/lib/icon-interop.ts, nativeStyleToProp
    // width/height): className vira width/height reais, entao a asserção confere o valor
    // resolvido, nao a string da classe (mesmo padrao de src/lib/__canary__/nativewind-canary.test.tsx).
    const { getByTestId } = await render(
      <BrandProvider>
        <Spinner size="lg" testID="s" />
      </BrandProvider>,
    )
    const icone = getByTestId('s-icone', { includeHiddenElements: true })
    expect(icone.props.width).toBe(24)
    expect(icone.props.height).toBe(24)
  })

  // Achado B10/B13 do veredito do Opus: sem jest.spyOn (o hook mora em src/lib/reduced-motion.ts,
  // caminho diferente do citado no plano original), spinnerRotationStyle e funcao pura testada
  // isolada, mesmo padrao de modalCardStyle (modal.tsx:47).
  it('spinnerRotationStyle: reduce motion trava a rotacao em 0deg mesmo com progresso adiantado', () => {
    expect(spinnerRotationStyle({ progresso: 0.5, reduceMotion: true }).transform).toEqual([{ rotate: '0deg' }])
  })

  it('spinnerRotationStyle: sem reduce motion, o progresso (0 a 1) vira graus (0 a 360deg)', () => {
    expect(spinnerRotationStyle({ progresso: 0.5, reduceMotion: false }).transform).toEqual([{ rotate: '180deg' }])
  })

  it('dataSet.rendra = SPIN-001', async () => {
    const { getByTestId } = await render(
      <BrandProvider>
        <Spinner testID="s" />
      </BrandProvider>,
    )
    expect(getByTestId('s', { includeHiddenElements: true }).props.dataSet).toMatchObject({ rendra: 'SPIN-001' })
  })
})
