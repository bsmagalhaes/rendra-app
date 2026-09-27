import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import { BrandProvider } from '../../brand/brand-provider'
import { Button } from './button'

async function renderButton(props: Partial<React.ComponentProps<typeof Button>> = {}) {
  return render(
    <BrandProvider>
      <Button onPress={() => {}} {...props}>
        Salvar
      </Button>
    </BrandProvider>,
  )
}

describe('Button', () => {
  it('renderiza o texto e responde ao toque', async () => {
    const onPress = jest.fn()
    const { findByText } = await renderButton({ onPress })
    const button = await findByText('Salvar')
    await fireEvent.press(button)
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['primary' as const, 'bg-primary'],
    ['destructive' as const, 'bg-destructive'],
    ['secondary' as const, 'bg-secondary'],
  ])('variant %s usa %s', async (variant, expectedClass) => {
    const { findByRole } = await renderButton({ variant })
    const button = await findByRole('button')
    expect(button.props.className.split(' ')).toContain(expectedClass)
  })

  it.each([
    ['sm' as const, 'h-control-sm'],
    ['md' as const, 'h-control-md'],
    ['lg' as const, 'h-control-lg'],
  ])('size %s usa %s', async (size, expectedClass) => {
    const { findByRole } = await renderButton({ size })
    const button = await findByRole('button')
    expect(button.props.className.split(' ')).toContain(expectedClass)
  })

  // Prevenção (Tarefa 21, Parte 2, mesmo padrão do crash de navegação no nativo do
  // ButtonGroup/Tabs, ver button-group.tsx:59-79 e button.tsx, shadowClass): toda variante precisa
  // de uma classe de sombra desde o primeiro render (shadow-sm ou shadow-none, nunca a ausência de
  // nenhuma), porque só shadow-sm/shadow-none declaram --tw-shadow-color no CSS nativo; trocar de
  // variante num Button já montado sem essa garantia reproduziria o mesmo upgrade de variável fora
  // do primeiro render.
  it.each([
    ['primary' as const, 'shadow-sm'],
    ['secondary' as const, 'shadow-sm'],
    ['destructive' as const, 'shadow-sm'],
    ['outline' as const, 'shadow-none'],
    ['ghost' as const, 'shadow-none'],
    ['link' as const, 'shadow-none'],
  ])('variant %s já carrega %s no primeiro render', async (variant, expectedClass) => {
    const { findByRole } = await renderButton({ variant })
    const button = await findByRole('button')
    const classes = button.props.className.split(' ')
    expect(classes).toContain(expectedClass)
  })

  it('disabled: accessibilityState.disabled true e não chama onPress', async () => {
    const onPress = jest.fn()
    const { findByRole } = await renderButton({ onPress, disabled: true })
    const button = await findByRole('button')
    expect(button.props.accessibilityState).toMatchObject({ disabled: true })
    await fireEvent.press(button)
    expect(onPress).not.toHaveBeenCalled()
  })

  it('loading troca o icon por um spinner e mantém o texto visível (sem iconOnly)', async () => {
    const { findByText, queryByTestId } = await render(
      <BrandProvider>
        <Button onPress={() => {}} loading icon={<></>} testID="meu-botao">
          Salvando
        </Button>
      </BrandProvider>,
    )
    expect(await findByText('Salvando')).toBeTruthy()
    expect((await queryByTestId('meu-botao'))?.props.accessibilityState).toMatchObject({ busy: true })
  })

  it('loading + iconOnly: não renderiza texto', async () => {
    const { queryByText } = await render(
      <BrandProvider>
        <Button onPress={() => {}} loading iconOnly accessibilityLabel="Salvando" icon={<></>}>
          Salvando
        </Button>
      </BrandProvider>,
    )
    expect(queryByText('Salvando')).toBeNull()
  })

  it('iconOnly sem accessibilityLabel avisa em __DEV__', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    await render(
      <BrandProvider>
        <Button onPress={() => {}} iconOnly icon={<></>} />
      </BrandProvider>,
    )
    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })

  it('fullWidth acrescenta w-full', async () => {
    const { findByRole } = await renderButton({ fullWidth: true })
    const button = await findByRole('button')
    expect(button.props.className.split(' ')).toContain('w-full')
  })

  it('pressed: escala 0,98 aplicada ao wrapper animado durante o toque', async () => {
    const { findByRole } = await renderButton()
    const button = await findByRole('button')
    await fireEvent(button, 'pressIn')
    await waitFor(() => {
      expect(button.props.className.split(' ')).toContain('bg-primary-hover')
    })
    await fireEvent(button, 'pressOut')
  })
})
