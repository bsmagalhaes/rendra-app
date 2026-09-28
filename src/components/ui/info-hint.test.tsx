import { render, fireEvent } from '@testing-library/react-native'
import { Text as RNText } from 'react-native'
import { BrandProvider } from '../../brand/brand-provider'
import { InfoHint } from './info-hint'
import { nodesWithCode } from '../../test-utils/rendra-code'

describe('InfoHint', () => {
  it('botão fechado por padrão: accessibilityLabel "Sobre: <título>"', async () => {
    const { findByLabelText } = await render(
      <BrandProvider>
        <InfoHint title="Sobre este campo">
          <RNText>Texto de ajuda.</RNText>
        </InfoHint>
      </BrandProvider>,
    )
    expect(await findByLabelText('Sobre: Sobre este campo')).toBeTruthy()
  })

  it('toque abre o modal com o título e o conteúdo', async () => {
    const { findByLabelText, findByText } = await render(
      <BrandProvider>
        <InfoHint title="Sobre este campo">
          <RNText>Texto de ajuda.</RNText>
        </InfoHint>
      </BrandProvider>,
    )
    const trigger = await findByLabelText('Sobre: Sobre este campo')
    await fireEvent.press(trigger)
    expect(await findByText('Sobre este campo')).toBeTruthy()
    expect(await findByText('Texto de ajuda.')).toBeTruthy()
  })

  it('botão "Entendi" (default do Modal type=info) fecha', async () => {
    const { findByLabelText, findByText, queryByText } = await render(
      <BrandProvider>
        <InfoHint title="Sobre este campo">
          <RNText>Texto de ajuda.</RNText>
        </InfoHint>
      </BrandProvider>,
    )
    const trigger = await findByLabelText('Sobre: Sobre este campo')
    await fireEvent.press(trigger)
    const entendi = await findByText('Entendi')
    await fireEvent.press(entendi)
    expect(queryByText('Texto de ajuda.')).toBeNull()
  })

  it('aceita children como string aberto, embrulhado em Text internamente', async () => {
    const { findByLabelText, findByText } = await render(
      <BrandProvider>
        <InfoHint title="Sobre este campo">Texto de ajuda simples.</InfoHint>
      </BrandProvider>,
    )
    const trigger = await findByLabelText('Sobre: Sobre este campo')
    await fireEvent.press(trigger)
    expect(await findByText('Texto de ajuda simples.')).toBeTruthy()
  })

  it('tem raiz View propria com dataSet.rendra = INFO-001 (item D11 do levantamento, traducao para RN)', async () => {
    const { container } = await render(
      <BrandProvider>
        <InfoHint title="Sobre este campo">
          <RNText>Texto de ajuda.</RNText>
        </InfoHint>
      </BrandProvider>,
    )
    expect(nodesWithCode(container, 'INFO-001')).toHaveLength(1)
  })
})
