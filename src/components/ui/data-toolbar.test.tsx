import { useState } from 'react'
import { Text } from 'react-native'
import { fireEvent, render, waitFor } from '@testing-library/react-native'
import { BrandProvider } from '../../brand/brand-provider'
import { DataToolbar, type DataToolbarProps, type FilterChip, type ToolbarColumn } from './data-toolbar'
import { nodesWithCode } from '../../test-utils/rendra-code'

function Busca({ onChange, ...resto }: Omit<DataToolbarProps, 'search'> & { onChange?: (v: string) => void }) {
  const [valor, setValor] = useState('')
  return (
    <BrandProvider>
      <DataToolbar
        {...resto}
        search={{
          value: valor,
          onChange: (v) => {
            setValor(v)
            onChange?.(v)
          },
          placeholder: 'Buscar cliente',
        }}
      />
    </BrandProvider>
  )
}

const comPainel = (extra: Partial<DataToolbarProps> = {}): DataToolbarProps => ({
  filters: <Text>Conteúdo dos filtros</Text>,
  ...extra,
})

describe('DataToolbar', () => {
  it('carrega DTB-001', async () => {
    const { container } = await render(<Busca />)
    expect(nodesWithCode(container, 'DTB-001')).toHaveLength(1)
  })

  it('digitar na busca mostra o texto e chama search.onChange; o campo tem o rótulo do placeholder', async () => {
    const onChange = jest.fn()
    const { findByLabelText } = await render(<Busca onChange={onChange} />)
    const campo = await findByLabelText('Buscar cliente')
    await fireEvent.changeText(campo, 'Padaria')
    expect((await findByLabelText('Buscar cliente')).props.value).toBe('Padaria')
    expect(onChange).toHaveBeenCalledWith('Padaria')
  })

  it('sem placeholder o rótulo da busca é "Buscar"', async () => {
    const { findByLabelText } = await render(
      <BrandProvider>
        <DataToolbar search={{ value: '', onChange: () => {} }} />
      </BrandProvider>,
    )
    expect(await findByLabelText('Buscar')).toBeTruthy()
  })

  it('o botão de limpar da busca esvazia o campo', async () => {
    const { findByLabelText, findByRole } = await render(<Busca />)
    await fireEvent.changeText(await findByLabelText('Buscar cliente'), 'Padaria')
    await fireEvent.press(await findByRole('button', { name: 'Limpar campo' }))
    expect((await findByLabelText('Buscar cliente')).props.value).toBe('')
  })

  it('sem filters, sort e columns o botão "Filtros" não existe', async () => {
    const { queryByRole } = await render(<Busca primaryAction={<Text>Novo</Text>} />)
    expect(queryByRole('button', { name: /Filtros/ })).toBeNull()
  })

  it('"Filtros" abre a gaveta com os filtros e "Ver resultados" fecha', async () => {
    const { findByRole, findByText, queryByText } = await render(<Busca {...comPainel()} />)
    expect(queryByText('Conteúdo dos filtros')).toBeNull()
    await fireEvent.press(await findByRole('button', { name: /Filtros/ }))
    expect(await findByText('Conteúdo dos filtros')).toBeTruthy()
    await fireEvent.press(await findByRole('button', { name: 'Ver resultados' }))
    await waitFor(() => expect(queryByText('Conteúdo dos filtros')).toBeNull())
  })

  it('o rodapé da gaveta segue junto do conteúdo (ActionBar sem sticky, sem borda superior)', async () => {
    const { container, findByRole } = await render(<Busca {...comPainel()} />)
    await fireEvent.press(await findByRole('button', { name: /Filtros/ }))
    await findByRole('button', { name: 'Ver resultados' })
    const barras = nodesWithCode(container, 'ACB-001')
    expect(barras).toHaveLength(1)
    expect(String(barras[0].props.className ?? '')).not.toContain('border-t')
  })

  it('filterCount positivo mostra a pílula com o número; zero não mostra', async () => {
    const { findByText, queryByText, rerender } = await render(<Busca {...comPainel({ filterCount: 3 })} />)
    expect(await findByText('3')).toBeTruthy()
    await rerender(<Busca {...comPainel({ filterCount: 0 })} />)
    expect(queryByText('3')).toBeNull()
    expect(queryByText('0')).toBeNull()
  })

  it('"Limpar" no rodapé da gaveta chama onClearFilters; sem a prop o "Limpar" e o "Limpar filtros" dos chips não existem', async () => {
    const onClearFilters = jest.fn()
    const chips: FilterChip[] = [{ id: 'a', label: 'Ativos', onRemove: () => {} }]
    const { findByRole, queryByRole, rerender } = await render(<Busca {...comPainel({ onClearFilters, chips })} />)
    expect(await findByRole('button', { name: 'Limpar filtros' })).toBeTruthy()
    await fireEvent.press(await findByRole('button', { name: /Filtros/ }))
    await fireEvent.press(await findByRole('button', { name: 'Limpar' }))
    expect(onClearFilters).toHaveBeenCalledTimes(1)
    await rerender(<Busca {...comPainel({ chips })} />)
    expect(queryByRole('button', { name: 'Limpar' })).toBeNull()
    expect(queryByRole('button', { name: 'Limpar filtros' })).toBeNull()
  })

  it('o chip some ao acionar "Remover filtro"', async () => {
    function ComChips() {
      const [ids, setIds] = useState(['a', 'b'])
      const rotulos: Record<string, string> = { a: 'Ativos', b: 'São Paulo' }
      const chips: FilterChip[] = ids.map((id) => ({ id, label: rotulos[id]!, onRemove: () => setIds((atual) => atual.filter((x) => x !== id)) }))
      return (
        <BrandProvider>
          <DataToolbar chips={chips} />
        </BrandProvider>
      )
    }
    const { findByText, findByRole, queryByText } = await render(<ComChips />)
    expect(await findByText('Ativos')).toBeTruthy()
    await fireEvent.press(await findByRole('button', { name: 'Remover filtro Ativos' }))
    expect(queryByText('Ativos')).toBeNull()
    expect(await findByText('São Paulo')).toBeTruthy()
  })

  it('a gaveta traz "Ordenar por" com o conteúdo de sort e "Campos no card" com um interruptor por coluna', async () => {
    const onToggle = jest.fn()
    function ComColunas() {
      const [visivel, setVisivel] = useState(true)
      const colunas: ToolbarColumn[] = [
        { id: 'email', label: 'E-mail', visible: visivel, onToggle: (v) => { onToggle(v); setVisivel(v) } },
      ]
      return (
        <BrandProvider>
          <DataToolbar sort={<Text>Conteúdo da ordenação</Text>} columns={colunas} />
        </BrandProvider>
      )
    }
    const { findByRole, findByText } = await render(<ComColunas />)
    await fireEvent.press(await findByRole('button', { name: /Filtros/ }))
    expect(await findByText('Ordenar por')).toBeTruthy()
    expect(await findByText('Conteúdo da ordenação')).toBeTruthy()
    expect(await findByText('Campos no card')).toBeTruthy()
    const interruptor = await findByRole('switch', { name: 'E-mail' })
    expect(interruptor.props.accessibilityState.checked).toBe(true)
    await fireEvent.press(interruptor)
    expect(onToggle).toHaveBeenCalledWith(false)
    expect((await findByRole('switch', { name: 'E-mail' })).props.accessibilityState.checked).toBe(false)
  })

  it('primaryAction e actions aparecem na barra', async () => {
    const { findByText } = await render(<Busca {...comPainel({ primaryAction: <Text>Novo cliente</Text>, actions: <Text>Exportar</Text> })} />)
    expect(await findByText('Novo cliente')).toBeTruthy()
    expect(await findByText('Exportar')).toBeTruthy()
  })
})
