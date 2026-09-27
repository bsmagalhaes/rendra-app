import { useState } from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import { BrandProvider } from '../../brand/brand-provider'
import { RadioGroup } from './radio-group'

const options = [
  { value: 'mensal', label: 'Mensal' },
  { value: 'anual', label: 'Anual', description: 'Economize 20%' },
  { value: 'vitalicio', label: 'Vitalício', disabled: true },
]

describe('RadioGroup', () => {
  it('variant list: onChange ao tocar numa opção, accessibilityState.checked reflete o valor', async () => {
    const onChange = jest.fn()
    const { findAllByRole } = await render(
      <BrandProvider>
        <RadioGroup options={options} value="mensal" onChange={onChange} />
      </BrandProvider>,
    )
    const radios = await findAllByRole('radio')
    expect(radios[0].props.accessibilityState.checked).toBe(true)
    expect(radios[1].props.accessibilityState.checked).toBe(false)
    await fireEvent.press(radios[1])
    expect(onChange).toHaveBeenCalledWith('anual')
  })

  function ControlledCardsGroup({ onChange }: { onChange: (value: string) => void }) {
    const [value, setValue] = useState('mensal')
    return (
      <RadioGroup
        options={options}
        value={value}
        variant="cards"
        onChange={(next) => {
          setValue(next)
          onChange(next)
        }}
      />
    )
  }

  it('variant cards renderiza a mesma lógica de seleção, com efeito visível de verdade no papel', async () => {
    // Achado 2 do veredito do Bloco A: o teste original usava `value="mensal"` fixo e só
    // conferia a chamada de `onChange`. Envolvido num componente controlado por
    // `useState`, o teste passa a afirmar o efeito visível (accessibilityState.checked)
    // depois do toque, não só a chamada.
    const onChange = jest.fn()
    const { findAllByRole } = await render(
      <BrandProvider>
        <ControlledCardsGroup onChange={onChange} />
      </BrandProvider>,
    )
    const radios = await findAllByRole('radio')
    expect(radios[0].props.accessibilityState.checked).toBe(true)
    await fireEvent.press(radios[1])
    expect(onChange).toHaveBeenCalledWith('anual')
    expect(radios[1].props.accessibilityState.checked).toBe(true)
    expect(radios[0].props.accessibilityState.checked).toBe(false)
  })

  it('opção disabled não chama onChange e reflete accessibilityState.disabled', async () => {
    const onChange = jest.fn()
    const { findAllByRole } = await render(
      <BrandProvider>
        <RadioGroup options={options} value="mensal" onChange={onChange} />
      </BrandProvider>,
    )
    const radios = await findAllByRole('radio')
    expect(radios[2].props.accessibilityState.disabled).toBe(true)
    await fireEvent.press(radios[2])
    expect(onChange).not.toHaveBeenCalled()
  })

  it('defaultValue inicia a seleção sem value controlado, e o toque muda a seleção de verdade', async () => {
    const onChange = jest.fn()
    const { findAllByRole } = await render(
      <BrandProvider>
        <RadioGroup options={options} defaultValue="anual" onChange={onChange} />
      </BrandProvider>,
    )
    const radios = await findAllByRole('radio')
    expect(radios[1].props.accessibilityState.checked).toBe(true)
    await fireEvent.press(radios[0])
    expect(onChange).toHaveBeenCalledWith('mensal')
    // Efeito visível, não só a chamada: sem `value` controlado de fora, o próprio
    // RadioGroup atualiza a seleção interna.
    expect(radios[0].props.accessibilityState.checked).toBe(true)
    expect(radios[1].props.accessibilityState.checked).toBe(false)
  })
})
