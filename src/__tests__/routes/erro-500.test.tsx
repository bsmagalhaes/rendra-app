import { screen } from 'expo-router/testing-library'
import { renderDemo } from '../../test-utils/render-demo'

describe('erro 500', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('uma rota que quebra mostra a tela de erro do Rendra', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    function Quebra(): never {
      throw new Error('falha de teste')
    }
    await renderDemo({ index: Quebra }, '/')
    expect(await screen.findByText('Erro 500')).toBeTruthy()
    expect(await screen.findByText('Algo deu errado do nosso lado')).toBeTruthy()
    expect(await screen.findByRole('button', { name: 'Ir para o início' })).toBeTruthy()
    expect(screen.queryByText('falha de teste')).toBeNull()
  })
})
