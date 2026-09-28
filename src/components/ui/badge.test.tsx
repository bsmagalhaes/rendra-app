import { render } from '@testing-library/react-native'
import { View } from 'react-native'
import { BrandProvider } from '../../brand'
import { Badge, dotClass, dotSolidClass } from './badge'
import { nodesWithCode } from '../../test-utils/rendra-code'

describe('Badge', () => {
  it('neutral (padrao) usa bg-muted na raiz e text-foreground no texto', async () => {
    const { findByTestId, findByText } = await render(
      <BrandProvider>
        <Badge testID="b">Novo</Badge>
      </BrandProvider>,
    )
    const raiz = await findByTestId('b')
    expect(raiz.props.className.split(' ')).toContain('bg-muted')
    const texto = await findByText('Novo')
    expect(texto.props.className.split(' ')).toContain('text-foreground')
    expect(texto.props.numberOfLines).toBe(1)
  })

  // C14 (veredito do Opus): o caso original era vazio (`error-soft` nunca existe, a classe real é
  // `destructive-soft`) e não conferia que o composto perde a borda transparente do tom -soft.
  it.each(['primary', 'success', 'warning', 'error', 'info'] as const)(
    'solid no tom %s troca a classe -soft pela classe cheia, mantendo border-transparent',
    async (tone) => {
      const solidBg = {
        primary: 'bg-primary',
        success: 'bg-success',
        warning: 'bg-warning',
        error: 'bg-destructive',
        info: 'bg-info',
      } as const
      const { findByTestId } = await render(
        <BrandProvider>
          <Badge testID="b" tone={tone} solid>
            Status
          </Badge>
        </BrandProvider>,
      )
      const raiz = await findByTestId('b')
      const classes = raiz.props.className.split(' ')
      expect(classes).toContain(solidBg[tone])
      expect(classes).toContain('border-transparent')
    },
  )

  it('neutral e outline ignoram solid', async () => {
    const { findByTestId } = await render(
      <BrandProvider>
        <Badge testID="b" tone="outline" solid>
          Rascunho
        </Badge>
      </BrandProvider>,
    )
    const raiz = await findByTestId('b')
    expect(raiz.props.className.split(' ')).toEqual(expect.arrayContaining(['border-border', 'bg-card']))
  })

  it('dotClass e dotSolidClass tem as cores esperadas por tom', () => {
    expect(dotClass.primary).toBe('bg-primary-soft-foreground')
    expect(dotClass.neutral).toBe('bg-foreground')
    expect(dotSolidClass.error).toBe('bg-destructive-foreground')
  })

  it('dot renderiza a bolinha com a classe do tom', async () => {
    const { findByTestId } = await render(
      <BrandProvider>
        <Badge testID="b" tone="success" dot>
          Ativo
        </Badge>
      </BrandProvider>,
    )
    const bolinha = await findByTestId('b-ponto')
    expect(bolinha.props.className.split(' ')).toContain('bg-success-soft-foreground')
  })

  it('icon e renderizado', async () => {
    const { findByTestId } = await render(
      <BrandProvider>
        <Badge testID="b" icon={<View testID="icone-badge" />}>
          Com icone
        </Badge>
      </BrandProvider>,
    )
    expect(await findByTestId('icone-badge')).toBeTruthy()
  })

  it('carrega dataSet.rendra = BDG-001 na raiz (item D12 do levantamento da Sincronizacao 1)', async () => {
    const { container } = await render(
      <BrandProvider>
        <Badge>Novo</Badge>
      </BrandProvider>,
    )
    expect(nodesWithCode(container, 'BDG-001')).toHaveLength(1)
  })
})
