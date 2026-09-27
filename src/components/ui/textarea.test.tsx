import { render, fireEvent, waitFor } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'
import { BrandProvider } from '../../brand/brand-provider'
import { ThemeColorProbe } from '../../test-utils/theme-color-probe'
import { Textarea } from './textarea'

describe('Textarea', () => {
  it('cresce com onContentSizeChange até 256px e não passa disso', async () => {
    const { findByTestId } = await render(
      <BrandProvider>
        <Textarea testID="campo" />
      </BrandProvider>,
    )
    const campo = await findByTestId('campo')
    await fireEvent(campo, 'contentSizeChange', { nativeEvent: { contentSize: { width: 300, height: 40 } } })
    expect(StyleSheet.flatten(campo.props.style).height).toBe(96)
    await fireEvent(campo, 'contentSizeChange', { nativeEvent: { contentSize: { width: 300, height: 500 } } })
    expect(StyleSheet.flatten(campo.props.style).height).toBe(256)
  })

  it('achado do Playwright (test:a11y): o placeholder usa placeholderTextColor com --muted-foreground (contraste)', async () => {
    // Mesma causa raiz e correção do Input: `placeholder:text-muted-foreground` via className
    // não sobrevive ao clone que o axe-core
    // usa para medir a cor do placeholder (a variável CSS `--muted-foreground`, herdada só do
    // `BrandProvider` ancestral, fica inválida no clone). `placeholderTextColor` vira um valor
    // inline no próprio elemento, que sobrevive ao clone.
    const capturado = { cor: '' }
    const { findByTestId } = await render(
      <BrandProvider>
        <ThemeColorProbe token="--muted-foreground" onCapture={(cor) => { capturado.cor = cor }} />
        <Textarea testID="campo" placeholder="Escreva uma mensagem" />
      </BrandProvider>,
    )
    const campo = await findByTestId('campo')
    await waitFor(() => expect(capturado.cor).not.toBe(''))
    expect(campo.props.placeholderTextColor).toBe(capturado.cor)
  })

  it('contador mostra "12/12" e fica destructive ao atingir maxLength', async () => {
    const { findByText } = await render(
      <BrandProvider>
        <Textarea maxLength={12} counter defaultValue="123456789012" />
      </BrandProvider>,
    )
    const contador = await findByText('12/12')
    expect(contador.props.className.split(' ')).toContain('text-destructive')
  })

  it('contador mostra "3/12" sem text-destructive antes do limite', async () => {
    const { findByText } = await render(
      <BrandProvider>
        <Textarea maxLength={12} counter defaultValue="abc" />
      </BrandProvider>,
    )
    const contador = await findByText('3/12')
    expect(contador.props.className.split(' ')).not.toContain('text-destructive')
  })

  it('rows define a altura inicial e disabled desabilita a edição', async () => {
    const { findByTestId } = await render(
      <BrandProvider>
        <Textarea testID="campo" rows={8} disabled />
      </BrandProvider>,
    )
    const campo = await findByTestId('campo')
    expect(StyleSheet.flatten(campo.props.style).height).toBe(160)
    expect(campo.props.editable).toBe(false)
    expect(campo.props.className.split(' ')).toContain('opacity-60')
  })

  it('achado 7: o contador anuncia a mudança (accessibilityLiveRegion polite)', async () => {
    // Contrato §12.6 pede aria-live="polite" no contador; sob react-native-web isso é
    // espelhado a partir de accessibilityLiveRegion="polite" (mesma convenção "aria-*
    // espelhado" já usada no projeto, RETOMADA.md §2).
    const { findByText } = await render(
      <BrandProvider>
        <Textarea maxLength={12} counter defaultValue="abc" />
      </BrandProvider>,
    )
    const contador = await findByText('3/12')
    expect(contador.props.accessibilityLiveRegion).toBe('polite')
  })

  it('foco aplica border-ring', async () => {
    // Render sem disabled: RNTL bloqueia o evento de focus num TextInput não editável.
    const { findByTestId } = await render(
      <BrandProvider>
        <Textarea testID="campo" rows={8} />
      </BrandProvider>,
    )
    const campo = await findByTestId('campo')
    await fireEvent(campo, 'focus')
    const campoFocado = await findByTestId('campo')
    expect(campoFocado.props.className.split(' ')).toContain('border-ring')
  })
})
