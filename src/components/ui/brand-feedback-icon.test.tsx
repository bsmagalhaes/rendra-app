import { render } from '@testing-library/react-native'
import { BrandProvider } from '../../brand/brand-provider'
import { BrandFeedbackIcon, colorClass, feedbackLabels } from './brand-feedback-icon'
import { nodesWithCode } from '../../test-utils/rendra-code'

describe('BrandFeedbackIcon', () => {
  it('feedbackLabels tem as 4 chaves em pt-BR', () => {
    expect(feedbackLabels).toEqual({ success: 'Sucesso', error: 'Erro', warning: 'Atenção', info: 'Informação' })
  })

  it('com label: role img e accessibilityLabel', async () => {
    const { findByRole } = await render(
      <BrandProvider>
        <BrandFeedbackIcon type="success" label="Sucesso" />
      </BrandProvider>,
    )
    const node = await findByRole('img')
    expect(node.props.accessibilityLabel).toBe('Sucesso')
  })

  it('sem label: decorativo (accessibilityElementsHidden)', async () => {
    const { findByTestId } = await render(
      <BrandProvider>
        <BrandFeedbackIcon type="info" testID="icone" />
      </BrandProvider>,
    )
    // includeHiddenElements: true porque o próprio elemento sob teste é decorativo
    // (accessibilityElementsHidden), e @testing-library/react-native exclui elementos
    // ocultos da árvore de acessibilidade das consultas por padrão (defaultIncludeHiddenElements: false).
    const node = await findByTestId('icone', { includeHiddenElements: true })
    expect(node.props.accessibilityElementsHidden).toBe(true)
  })

  it('cor por tipo: error usa text-destructive (mapa colorClass; className não é observável no Svg depois do cssInterop)', async () => {
    // O cssInterop(Svg, { className: 'style' }) (nota do próprio componente) consome a prop
    // className do Svg e a substitui por um style computado; o nó renderizado não tem mais
    // `className` para inspecionar (confirmado: symbol.props.className é undefined em runtime de
    // teste). A resolução de cor via variável CSS (`rgb(var(--rendra-destructive) / <alpha-value>)`,
    // tailwind.config.ts) também não aparece no style resolvido sob Jest (mesma classe de risco já
    // registrada em tailwind.config.ts para --rendra-shadow-color/--rendra-shadow-opacity-*): o style resolvido é
    // idêntico entre type="error" e type="success", só a largura/altura de size-full aparece.
    // A parte observável e estável é o mapa `colorClass` que o componente usa para montar essa
    // className, exportado só para este teste; o render confirma que o tipo não quebra a montagem.
    expect(colorClass.error).toBe('text-destructive')
    const { findByTestId } = await render(
      <BrandProvider>
        <BrandFeedbackIcon type="error" testID="icone" />
      </BrandProvider>,
    )
    expect(await findByTestId('icone-symbol', { includeHiddenElements: true })).toBeTruthy()
  })

  it('tamanho xl usa size-12', async () => {
    const { findByTestId } = await render(
      <BrandProvider>
        <BrandFeedbackIcon type="warning" size="xl" testID="icone" />
      </BrandProvider>,
    )
    const node = await findByTestId('icone', { includeHiddenElements: true })
    expect(node.props.className.split(' ')).toContain('size-12')
  })

  it('animated não lança e renderiza o glifo', async () => {
    const { findByTestId } = await render(
      <BrandProvider>
        <BrandFeedbackIcon type="success" animated testID="icone" />
      </BrandProvider>,
    )
    expect(await findByTestId('icone-glyph', { includeHiddenElements: true })).toBeTruthy()
  })

  it('carrega dataSet.rendra = BFI-001 na raiz (item D12 do levantamento da Sincronizacao 1)', async () => {
    const { container } = await render(
      <BrandProvider>
        <BrandFeedbackIcon type="success" />
      </BrandProvider>,
    )
    expect(nodesWithCode(container, 'BFI-001')).toHaveLength(1)
  })
})
