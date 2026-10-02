import { useState } from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import { BrandProvider } from '../../brand/brand-provider'
import { Pagination, type PaginationProps } from './pagination'
import { nodesWithCode } from '../../test-utils/rendra-code'

function Controlado({ inicial = 1, onPageChange, ...resto }: Partial<PaginationProps> & { inicial?: number }) {
  const [page, setPage] = useState(inicial)
  return (
    <BrandProvider>
      <Pagination
        pageSize={10}
        total={95}
        {...resto}
        page={page}
        onPageChange={(p) => {
          setPage(p)
          onPageChange?.(p)
        }}
      />
    </BrandProvider>
  )
}

describe('Pagination', () => {
  it('carrega PAG-001, o rótulo "Paginação" e mostra "Página 1 de 10"', async () => {
    const { findByText, findByLabelText, container } = await render(<Controlado />)
    expect(await findByText('Página 1 de 10')).toBeTruthy()
    expect((await findByLabelText('Paginação')).props.role).toBe('navigation')
    expect(nodesWithCode(container, 'PAG-001')).toHaveLength(1)
  })

  it('"Anterior" fica desabilitado na primeira página', async () => {
    const onPageChange = jest.fn()
    const { findByRole } = await render(<Controlado onPageChange={onPageChange} />)
    const anterior = await findByRole('button', { name: 'Anterior' })
    expect(anterior.props.accessibilityState.disabled).toBe(true)
    await fireEvent.press(anterior)
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('tocar "Próxima" chama onPageChange(2) e o texto passa a "Página 2 de 10"', async () => {
    const onPageChange = jest.fn()
    const { findByRole, findByText, queryByText } = await render(<Controlado onPageChange={onPageChange} />)
    await fireEvent.press(await findByRole('button', { name: 'Próxima' }))
    expect(onPageChange).toHaveBeenCalledWith(2)
    expect(await findByText('Página 2 de 10')).toBeTruthy()
    expect(queryByText('Página 1 de 10')).toBeNull()
    await fireEvent.press(await findByRole('button', { name: 'Anterior' }))
    expect(await findByText('Página 1 de 10')).toBeTruthy()
  })

  it('"Próxima" fica desabilitada na última página', async () => {
    const { findByRole } = await render(<Controlado inicial={10} />)
    expect((await findByRole('button', { name: 'Próxima' })).props.accessibilityState.disabled).toBe(true)
    expect((await findByRole('button', { name: 'Anterior' })).props.accessibilityState.disabled).toBe(false)
  })

  it('o total de páginas arredonda para cima (95 itens, 10 por página = 10) e total 0 mostra "Página 1 de 1"', async () => {
    const { findByText, rerender } = await render(<Controlado total={100} />)
    expect(await findByText('Página 1 de 10')).toBeTruthy()
    await rerender(<Controlado total={101} />)
    expect(await findByText('Página 1 de 11')).toBeTruthy()
    await rerender(<Controlado total={0} />)
    expect(await findByText('Página 1 de 1')).toBeTruthy()
  })

  it('formata os números em pt-BR a partir de 1000', async () => {
    const { findByText } = await render(<Controlado pageSize={1} total={1234} inicial={1000} />)
    expect(await findByText('Página 1.000 de 1.234')).toBeTruthy()
  })

  it('loadMore mostra "Carregar mais" e "N de total" com o fim da página atual; tocar avança e soma', async () => {
    const onPageChange = jest.fn()
    const { findByRole, findByText } = await render(<Controlado mobileMode="loadMore" onPageChange={onPageChange} />)
    expect(await findByText('10 de 95')).toBeTruthy()
    await fireEvent.press(await findByRole('button', { name: 'Carregar mais' }))
    expect(onPageChange).toHaveBeenCalledWith(2)
    expect(await findByText('20 de 95')).toBeTruthy()
  })

  it('loadMore na última página não mostra o botão e o contador chega ao total, formatado', async () => {
    const { findByText, queryByRole } = await render(<Controlado mobileMode="loadMore" pageSize={500} total={1234} inicial={3} />)
    expect(await findByText('1.234 de 1.234')).toBeTruthy()
    expect(queryByRole('button', { name: 'Carregar mais' })).toBeNull()
  })

  it('loading marca o "Carregar mais" como ocupado e sem resposta ao toque', async () => {
    const onPageChange = jest.fn()
    const { findByRole } = await render(<Controlado mobileMode="loadMore" loading onPageChange={onPageChange} />)
    const botao = await findByRole('button', { name: 'Carregar mais' })
    expect(botao.props.accessibilityState.busy).toBe(true)
    await fireEvent.press(botao)
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('no modo de páginas não há "Carregar mais"; no loadMore não há "Anterior" nem "Próxima"', async () => {
    const { queryByRole, rerender } = await render(<Controlado />)
    expect(queryByRole('button', { name: 'Carregar mais' })).toBeNull()
    await rerender(<Controlado mobileMode="loadMore" />)
    expect(queryByRole('button', { name: 'Anterior' })).toBeNull()
    expect(queryByRole('button', { name: 'Próxima' })).toBeNull()
  })
})
