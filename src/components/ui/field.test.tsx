import { render } from '@testing-library/react-native'
import { TextInput } from 'react-native'
import { BrandProvider } from '../../brand/brand-provider'
import { fieldSpanClass } from '../layout/tokens'
import { Field, Label } from './field'
import type { BrandConfig } from '../../brand/types'
import { nodesWithCode } from '../../test-utils/rendra-code'

// Tarefa 5.1 (Sincronizacao 1, achado B3 do veredito do Opus): marca minima com todos os campos
// obrigatorios de BrandConfig, para o teste de labelStyle "normal" sem depender da marca de
// demonstracao (brand.config.ts, que fica so em app/).
const brandMinimo: BrandConfig = {
  id: 't', productName: 'Teste', companyName: 'Teste', tagline: 'x', shape: 'square', sidebarLogo: 'dark',
}

describe('Label (Tarefa 5.1, itens D1 e D2 do levantamento)', () => {
  it('discreto (padrao): text-label text-label-foreground uppercase', async () => {
    const { findByText } = await render(
      <BrandProvider>
        <Label>Nome</Label>
      </BrandProvider>,
    )
    const el = await findByText('Nome')
    expect(el.props.className.split(' ')).toEqual(
      expect.arrayContaining(['text-label', 'text-label-foreground', 'uppercase']),
    )
  })

  it('normal (labelStyle normal): text-sm text-foreground, sem uppercase', async () => {
    const brands = { T1: { ...brandMinimo, labelStyle: 'normal' as const } }
    const { findByText } = await render(
      <BrandProvider brands={brands}>
        <Label>Nome</Label>
      </BrandProvider>,
    )
    const el = await findByText('Nome')
    const classes = el.props.className.split(' ')
    expect(classes).toEqual(expect.arrayContaining(['text-sm', 'text-foreground']))
    expect(classes).not.toContain('uppercase')
  })

  it('carrega dataSet.rendra = FLD-002', async () => {
    const { findByText } = await render(
      <BrandProvider>
        <Label>Nome</Label>
      </BrandProvider>,
    )
    expect((await findByText('Nome')).props.dataSet).toMatchObject({ rendra: 'FLD-002' })
  })
})

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

  it('help renderiza abaixo do campo com text-help e text-help-foreground (item D2 do levantamento)', async () => {
    const { findByText } = await render(
      <BrandProvider>
        <Field label="Nome" help="Como aparece no documento">
          <TextInput />
        </Field>
      </BrandProvider>,
    )
    const help = await findByText('Como aparece no documento')
    expect(help.props.className.split(' ')).toEqual(expect.arrayContaining(['text-help', 'text-help-foreground']))
  })

  it('Field carrega dataSet.rendra = FLD-001 na raiz (item D2 do levantamento)', async () => {
    const { container } = await render(
      <BrandProvider>
        <Field label="Nome" help="x">
          <TextInput />
        </Field>
      </BrandProvider>,
    )
    expect(nodesWithCode(container, 'FLD-001')).toHaveLength(1)
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
    // projeto), o mesmo padrão de `--rendra-primary-text` para texto de marca sobre o fundo comum.
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
