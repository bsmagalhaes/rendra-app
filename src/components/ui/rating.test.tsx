import { useState } from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import { BrandProvider } from '../../brand/brand-provider'
import { Rating, type RatingProps } from './rating'
import { nodesWithCode } from '../../test-utils/rendra-code'

function Controlado({ inicial = null, onChange, ...resto }: Partial<RatingProps> & { inicial?: number | null }) {
  const [valor, setValor] = useState<number | null>(inicial)
  return (
    <BrandProvider>
      <Rating
        accessibilityLabel="Nota"
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

const checados = (radios: { props: { accessibilityState?: { checked?: boolean } } }[]) =>
  radios.map((r) => Boolean(r.props.accessibilityState?.checked))

describe('Rating', () => {
  it('por padrão são 5 estrelas, com o código RTG-001 e papel radiogroup', async () => {
    const { findAllByRole, findByLabelText, container } = await render(<Controlado />)
    const radios = await findAllByRole('radio')
    expect(radios).toHaveLength(5)
    expect(radios[0]!.props.accessibilityLabel).toBe('1 estrela')
    expect(radios[4]!.props.accessibilityLabel).toBe('5 estrelas')
    expect((await findByLabelText('Nota')).props.accessibilityRole).toBe('radiogroup')
    expect(nodesWithCode(container, 'RTG-001')).toHaveLength(1)
  })

  it('tocar a 3ª estrela marca 3: só ela fica checked e as três primeiras ficam preenchidas', async () => {
    const onChange = jest.fn()
    const { findAllByRole, findByTestId } = await render(<Controlado onChange={onChange} />)
    await fireEvent.press((await findAllByRole('radio'))[2]!)
    expect(checados(await findAllByRole('radio'))).toEqual([false, false, true, false, false])
    for (const n of [1, 2, 3]) expect((await findByTestId(`rating-estrela-${n}`, { includeHiddenElements: true })).props.fill).toBe('currentColor')
    for (const n of [4, 5]) expect((await findByTestId(`rating-estrela-${n}`, { includeHiddenElements: true })).props.fill).toBe('none')
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('tocar de novo a marcada devolve null e desmarca tudo', async () => {
    const onChange = jest.fn()
    const { findAllByRole, findByTestId } = await render(<Controlado inicial={3} onChange={onChange} />)
    await fireEvent.press((await findAllByRole('radio'))[2]!)
    expect(checados(await findAllByRole('radio'))).toEqual([false, false, false, false, false])
    expect((await findByTestId('rating-estrela-1', { includeHiddenElements: true })).props.fill).toBe('none')
    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it('max muda a quantidade de estrelas', async () => {
    const { findAllByRole } = await render(<Controlado max={7} />)
    expect(await findAllByRole('radio')).toHaveLength(7)
  })

  it('a escala vai de 1 a 10 com RTG-002 e rótulos "Nota n"; tocar a 7 marca só ela', async () => {
    const { findAllByRole, container } = await render(<Controlado variant="scale" />)
    const radios = await findAllByRole('radio')
    expect(radios).toHaveLength(10)
    expect(radios[0]!.props.accessibilityLabel).toBe('Nota 1')
    expect(radios[9]!.props.accessibilityLabel).toBe('Nota 10')
    expect(nodesWithCode(container, 'RTG-002')).toHaveLength(1)
    await fireEvent.press(radios[6]!)
    expect(checados(await findAllByRole('radio'))).toEqual([false, false, false, false, false, false, true, false, false, false])
  })

  it('lowLabel e highLabel aparecem nas pontas só quando existem', async () => {
    const { findByText, queryByText, rerender } = await render(<Controlado variant="scale" lowLabel="Nada provável" highLabel="Muito provável" />)
    expect(await findByText('Nada provável')).toBeTruthy()
    expect(await findByText('Muito provável')).toBeTruthy()
    await rerender(<Controlado variant="scale" />)
    expect(queryByText('Nada provável')).toBeNull()
  })

  it('min e max da escala: 0 a 10 tem 11 opções e a primeira é "Nota 0"', async () => {
    const { findAllByRole } = await render(<Controlado variant="scale" min={0} max={10} />)
    const radios = await findAllByRole('radio')
    expect(radios).toHaveLength(11)
    expect(radios[0]!.props.accessibilityLabel).toBe('Nota 0')
    await fireEvent.press(radios[0]!)
    expect(checados(await findAllByRole('radio'))[0]).toBe(true)
  })

  it('com disabled nada reage e as opções ficam desabilitadas', async () => {
    const onChange = jest.fn()
    const { findAllByRole } = await render(<Controlado disabled onChange={onChange} />)
    const radios = await findAllByRole('radio')
    expect(radios.every((r) => r.props.accessibilityState.disabled === true)).toBe(true)
    await fireEvent.press(radios[2]!)
    expect(onChange).not.toHaveBeenCalled()
    expect(checados(await findAllByRole('radio'))).toEqual([false, false, false, false, false])
  })

  it('é controlado: com value fixo, tocar chama onChange mas o valor mostrado só segue o value', async () => {
    const onChange = jest.fn()
    const { findAllByRole } = await render(
      <BrandProvider>
        <Rating value={4} onChange={onChange} />
      </BrandProvider>,
    )
    const radios = await findAllByRole('radio')
    expect(checados(radios)).toEqual([false, false, false, true, false])
    await fireEvent.press(radios[1]!)
    expect(onChange).toHaveBeenCalledWith(2)
    expect(checados(await findAllByRole('radio'))).toEqual([false, false, false, true, false])
  })

  it('invalid pinta a borda das notas da escala com a cor destrutiva (e sem invalid não)', async () => {
    const { findAllByRole, rerender } = await render(<Controlado variant="scale" invalid />)
    expect((await findAllByRole('radio')).every((r) => String(r.props.className).includes('border-destructive'))).toBe(true)
    await rerender(<Controlado variant="scale" />)
    expect((await findAllByRole('radio')).some((r) => String(r.props.className).includes('border-destructive'))).toBe(false)
  })
})
