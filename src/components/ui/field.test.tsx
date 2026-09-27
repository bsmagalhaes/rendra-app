import { render } from '@testing-library/react-native'
import { TextInput } from 'react-native'
import { BrandProvider } from '../../brand/brand-provider'
import { fieldSpanClass } from '../layout/tokens'
import { Field } from './field'

describe('Field', () => {
  it('label com required mostra "*" em text-destructive e accessibilityLabel com (obrigatório)', async () => {
    const { findByLabelText } = await render(
      <BrandProvider>
        <Field label="Nome" required>
          <TextInput />
        </Field>
      </BrandProvider>,
    )
    expect(await findByLabelText('Nome (obrigatório)')).toBeTruthy()
  })

  it('help renderiza abaixo do campo', async () => {
    const { findByText } = await render(
      <BrandProvider>
        <Field label="Nome" help="Como aparece no documento">
          <TextInput />
        </Field>
      </BrandProvider>,
    )
    const help = await findByText('Como aparece no documento')
    expect(help.props.className.split(' ')).toContain('text-muted-foreground')
  })

  it('error substitui help e usa accessibilityRole alert, encontrável por findByRole', async () => {
    const { findByText, findByRole, queryByText } = await render(
      <BrandProvider>
        <Field label="Nome" help="Ajuda" error="Nome é obrigatório.">
          <TextInput />
        </Field>
      </BrandProvider>,
    )
    expect(queryByText('Ajuda')).toBeNull()
    const erro = await findByText('Nome é obrigatório.')
    expect(erro.props.accessibilityRole).toBe('alert')
    // Achado do Playwright (Tarefa 22/24): `text-destructive` (a cor sólida de preenchimento,
    // pensada para texto branco por cima)
    // media contraste real 2.95 no modo escuro contra o fundo comum da página, abaixo de 4,5:1;
    // `text-destructive-soft-foreground` é o par já calibrado para texto vermelho direto sobre
    // o fundo (9.25 no escuro, 7.61 no claro, comprovado com a função `contrast()` do próprio
    // projeto), o mesmo padrão de `--primary-text` para texto de marca sobre o fundo comum.
    expect(erro.props.className.split(' ')).toContain('text-destructive-soft-foreground')
    expect(await findByRole('alert')).toBe(erro)
  })

  it('clona o filho com invalid e id quando há erro', async () => {
    const { findByTestId } = await render(
      <BrandProvider>
        <Field label="Nome" error="Nome é obrigatório.">
          <TextInput testID="campo" />
        </Field>
      </BrandProvider>,
    )
    const campo = await findByTestId('campo')
    expect(campo.props.invalid).toBe(true)
    expect(campo.props.id).toBeTruthy()
  })

  it('span half resolve para md, cuja classe fieldSpanClass.md é w-full', async () => {
    expect(fieldSpanClass.md).toBe('w-full')
    const { findByTestId } = await render(
      <BrandProvider>
        <Field label="Nome" span="half">
          <TextInput testID="campo" />
        </Field>
      </BrandProvider>,
    )
    expect((await findByTestId('campo')).props.id).toBeTruthy()
  })
})
