import { fireEvent, render } from '@testing-library/react-native'
import { BrandProvider } from '../../brand'
import { Avatar, AvatarGroup, initials } from './avatar'
import { nodesWithCode } from '../../test-utils/rendra-code'

describe('initials', () => {
  it('Ana Souza vira AS', () => {
    expect(initials('Ana Souza')).toBe('AS')
  })
  it('Ana (uma palavra) vira A', () => {
    expect(initials('Ana')).toBe('A')
  })
  it('ana de souza (minusculo) vira AS', () => {
    expect(initials('ana de souza')).toBe('AS')
  })
})

describe('Avatar', () => {
  it('sem src, mostra as iniciais com text-primary-soft-foreground', async () => {
    const { findByText } = await render(
      <BrandProvider>
        <Avatar name="Ana Souza" />
      </BrandProvider>,
    )
    const texto = await findByText('AS')
    expect(texto.props.className.split(' ')).toContain('text-primary-soft-foreground')
  })

  it('com src, mostra a Image com size-full e accessibilityLabel igual ao nome', async () => {
    const { findByLabelText, queryByText } = await render(
      <BrandProvider>
        <Avatar name="Ana Souza" src="https://exemplo.test/a.png" />
      </BrandProvider>,
    )
    const imagem = await findByLabelText('Ana Souza')
    expect(imagem.props.className).toContain('size-full')
    expect(queryByText('AS')).toBeNull()
  })

  it('erro ao carregar a imagem volta para as iniciais', async () => {
    const { findByLabelText, findByText } = await render(
      <BrandProvider>
        <Avatar name="Ana Souza" src="https://exemplo.test/quebrada.png" />
      </BrandProvider>,
    )
    const imagem = await findByLabelText('Ana Souza')
    fireEvent(imagem, 'error', { nativeEvent: { error: 'falhou' } })
    expect(await findByText('AS')).toBeTruthy()
  })

  it('tamanhos sm e lg trocam o size-* da raiz', async () => {
    const { findByTestId, rerender } = await render(
      <BrandProvider>
        <Avatar testID="av" name="Ana Souza" size="sm" />
      </BrandProvider>,
    )
    let raiz = await findByTestId('av')
    expect(raiz.props.className.split(' ')).toContain('size-6')
    await rerender(
      <BrandProvider>
        <Avatar testID="av" name="Ana Souza" size="lg" />
      </BrandProvider>,
    )
    raiz = await findByTestId('av')
    expect(raiz.props.className.split(' ')).toContain('size-12')
  })
})

describe('AvatarGroup', () => {
  const pessoas = [
    { name: 'Ana Souza' },
    { name: 'Bruno Lima' },
    { name: 'Carla Dias' },
    { name: 'Diego Nunes' },
    { name: 'Elis Prado' },
    { name: 'Fabio Reis' },
  ]

  it('com 6 pessoas e max 4, mostra 4 avatares e +2, com o rotulo dos nomes', async () => {
    const { findByText, findByRole } = await render(
      <BrandProvider>
        <AvatarGroup people={pessoas} max={4} />
      </BrandProvider>,
    )
    expect(await findByText('+2')).toBeTruthy()
    const grupo = await findByRole('group')
    expect(grupo.props.accessibilityLabel).toBe(
      'Ana Souza, Bruno Lima, Carla Dias, Diego Nunes, Elis Prado, Fabio Reis',
    )
  })

  it('com exatamente 4 pessoas e max 4, nao mostra +0', async () => {
    const { queryByText } = await render(
      <BrandProvider>
        <AvatarGroup people={pessoas.slice(0, 4)} max={4} />
      </BrandProvider>,
    )
    expect(queryByText('+0')).toBeNull()
  })

  // C15 (veredito do Opus): sem testID, todo AvatarGroup da tela gera avatar-item-N repetido
  // (colisão de testID entre instâncias); o grupo agora precisa do próprio testID para nomear
  // os itens.
  it('avatares do segundo em diante tem -ml-2 e border-2 border-card', async () => {
    const { findByTestId } = await render(
      <BrandProvider>
        <AvatarGroup testID="grupo" people={pessoas.slice(0, 2)} max={4} />
      </BrandProvider>,
    )
    const segundo = await findByTestId('grupo-item-1')
    expect(segundo.props.className.split(' ')).toEqual(
      expect.arrayContaining(['-ml-2', 'border-2', 'border-card']),
    )
  })
})

describe('Avatar/AvatarGroup: data-rendra (item D12 do levantamento da Sincronizacao 1)', () => {
  it('Avatar carrega dataSet.rendra = AVT-001', async () => {
    const { container } = await render(
      <BrandProvider>
        <Avatar name="Ana Souza" />
      </BrandProvider>,
    )
    expect(nodesWithCode(container, 'AVT-001')).toHaveLength(1)
  })

  it('AvatarGroup carrega dataSet.rendra = AVT-002', async () => {
    const { container } = await render(
      <BrandProvider>
        <AvatarGroup people={[{ name: 'Ana Souza' }]} />
      </BrandProvider>,
    )
    expect(nodesWithCode(container, 'AVT-002')).toHaveLength(1)
  })
})
