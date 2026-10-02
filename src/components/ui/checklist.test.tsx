import { useState } from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import { BrandProvider } from '../../brand/brand-provider'
import { Checklist, type ChecklistItem, type ChecklistProps } from './checklist'
import { nodesWithCode } from '../../test-utils/rendra-code'

const itens = (): ChecklistItem[] => [
  { id: 'a', label: 'Leite', checked: false },
  { id: 'b', label: 'Pão', checked: false },
]

function Controlado({
  inicial = [],
  onChange,
  ...resto
}: Partial<ChecklistProps> & { inicial?: ChecklistItem[] }) {
  const [valor, setValor] = useState<ChecklistItem[]>(inicial)
  return (
    <BrandProvider>
      <Checklist
        accessibilityLabel="Compras"
        {...resto}
        value={valor}
        onChange={(v) => {
          setValor(v)
          onChange?.(v)
        }}
      />
    </BrandProvider>
  )
}

describe('Checklist', () => {
  it('vazio mostra só o botão de adicionar e carrega CKLT-001', async () => {
    const { findByRole, queryAllByRole, queryByLabelText, container } = await render(<Controlado />)
    expect(await findByRole('button', { name: 'Adicionar item' })).toBeTruthy()
    expect(queryAllByRole('checkbox')).toHaveLength(0)
    expect(queryByLabelText('Nome do item 1')).toBeNull()
    expect(nodesWithCode(container, 'CKLT-001')).toHaveLength(1)
  })

  it('addLabel troca o texto do botão', async () => {
    const { findByRole } = await render(<Controlado addLabel="Novo passo" />)
    expect(await findByRole('button', { name: 'Novo passo' })).toBeTruthy()
  })

  it('adicionar mostra um item vazio, desmarcado, sem crypto.randomUUID e com ids diferentes', async () => {
    const original = Object.getOwnPropertyDescriptor(globalThis, 'crypto')
    const randomUUID = jest.fn(() => 'uuid')
    Object.defineProperty(globalThis, 'crypto', { value: { randomUUID }, configurable: true })
    try {
      const onChange = jest.fn()
      const { findByRole, findByLabelText } = await render(<Controlado onChange={onChange} />)
      await fireEvent.press(await findByRole('button', { name: 'Adicionar item' }))
      const campo = await findByLabelText('Nome do item 1')
      expect(campo.props.value).toBe('')
      expect((await findByRole('checkbox', { name: 'Marcar item 1' })).props.accessibilityState.checked).toBe(false)
      await fireEvent.press(await findByRole('button', { name: 'Adicionar item' }))
      expect(await findByLabelText('Nome do item 2')).toBeTruthy()
      const lista = onChange.mock.calls[1][0] as ChecklistItem[]
      expect(new Set(lista.map((i) => i.id)).size).toBe(2)
      expect(randomUUID).not.toHaveBeenCalled()
    } finally {
      if (original) Object.defineProperty(globalThis, 'crypto', original)
      else delete (globalThis as { crypto?: unknown }).crypto
    }
  })

  it('digitar no item desmarcado renomeia', async () => {
    const onChange = jest.fn()
    const { findByLabelText, findByRole } = await render(<Controlado inicial={itens()} onChange={onChange} />)
    await fireEvent.changeText(await findByLabelText('Nome do item 1'), 'Leite integral')
    expect((await findByLabelText('Nome do item 1')).props.value).toBe('Leite integral')
    expect(await findByRole('checkbox', { name: 'Marcar Leite integral' })).toBeTruthy()
    expect(onChange).toHaveBeenLastCalledWith([
      { id: 'a', label: 'Leite integral', checked: false },
      { id: 'b', label: 'Pão', checked: false },
    ])
  })

  it('marcar troca o campo por texto riscado e o campo editável some; desmarcar volta ao campo', async () => {
    const { findByRole, findByText, queryByLabelText, findByLabelText } = await render(<Controlado inicial={itens()} />)
    await fireEvent.press(await findByRole('checkbox', { name: 'Marcar Leite' }))
    expect(queryByLabelText('Nome do item 1')).toBeNull()
    const riscado = await findByText('Leite')
    expect(String(riscado.props.className)).toContain('line-through')
    expect((await findByLabelText('Nome do item 2')).props.value).toBe('Pão')
    await fireEvent.press(await findByRole('checkbox', { name: 'Marcar Leite' }))
    expect((await findByLabelText('Nome do item 1')).props.value).toBe('Leite')
  })

  it('remover tira a linha certa', async () => {
    const onChange = jest.fn()
    const { findByRole, queryByDisplayValue, findByDisplayValue } = await render(<Controlado inicial={itens()} onChange={onChange} />)
    await fireEvent.press(await findByRole('button', { name: 'Remover item 1' }))
    expect(queryByDisplayValue('Leite')).toBeNull()
    expect(await findByDisplayValue('Pão')).toBeTruthy()
    expect(onChange).toHaveBeenLastCalledWith([{ id: 'b', label: 'Pão', checked: false }])
  })

  it('disabled bloqueia marcar, remover, adicionar e a edição', async () => {
    const onChange = jest.fn()
    const { findByRole, findByLabelText } = await render(<Controlado inicial={itens()} onChange={onChange} disabled />)
    const caixa = await findByRole('checkbox', { name: 'Marcar Leite' })
    expect(caixa.props.accessibilityState.disabled).toBe(true)
    await fireEvent.press(caixa)
    await fireEvent.press(await findByRole('button', { name: 'Remover item 1' }))
    await fireEvent.press(await findByRole('button', { name: 'Adicionar item' }))
    expect(onChange).not.toHaveBeenCalled()
    expect((await findByLabelText('Nome do item 1')).props.editable).toBe(false)
  })
})
