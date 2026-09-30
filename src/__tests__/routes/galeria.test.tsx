import { fireEvent, within } from '@testing-library/react-native'
import { renderRouter } from 'expo-router/testing-library'
import AsyncStorage from '@react-native-async-storage/async-storage'
import RootLayout from '../../../app/_layout'
import GaleriaIndex from '../../../app/(shell)/galeria/index'

type Contexto = Awaited<ReturnType<typeof renderRouter>>

// B2 (veredito do Opus): "Aurora" existe como opção em Modelo e em Paleta; escopar a consulta ao
// grupo certo (por accessibilityLabel) evita "Found multiple elements".
async function opcao(context: Contexto, grupo: string, nome: string) {
  return within(await context.findByLabelText(grupo)).getByRole('radio', { name: nome })
}

function abrir(url: string) {
  return renderRouter({ _layout: RootLayout, galeria: GaleriaIndex }, { initialUrl: url })
}

beforeEach(async () => {
  await AsyncStorage.clear()
})

describe('/galeria', () => {
  it('troca de modelo pelo controle real muda o testID da raiz e o texto Modelo ativo', async () => {
    const context = await abrir('/galeria?codigo=T1-C1')
    await context.findByTestId('rendra-T1-C1')
    await fireEvent.press(await opcao(context, 'Modelo', 'Aurora'))
    expect(await context.findByTestId('rendra-T3-C1')).toBeTruthy()
    expect(await context.findByText('Modelo ativo: Aurora')).toBeTruthy()
  })

  it('troca de paleta muda o testID da raiz e o texto Paleta ativa', async () => {
    const context = await abrir('/galeria?codigo=T1-C1')
    await context.findByTestId('rendra-T1-C1')
    await fireEvent.press(await opcao(context, 'Paleta', 'Ardósia'))
    expect(await context.findByTestId('rendra-T1-C4')).toBeTruthy()
    expect(await context.findByText('Paleta ativa: Ardósia')).toBeTruthy()
  })

  it('troca de modo muda o texto Modo ativo', async () => {
    const context = await abrir('/galeria?codigo=T1-C1')
    await context.findByTestId('rendra-T1-C1')
    await fireEvent.press(await opcao(context, 'Modo', 'Escuro'))
    expect(await context.findByText('Modo ativo: escuro')).toBeTruthy()
  })

  it('sem ?codigo=, mostra os tres grupos de controle e o modelo padrao ativo', async () => {
    const context = await abrir('/galeria')
    await context.findByTestId('rendra-T1-C1')
    expect(await context.findByLabelText('Modelo')).toBeTruthy()
    expect(await context.findByLabelText('Paleta')).toBeTruthy()
    expect(await context.findByLabelText('Modo')).toBeTruthy()
    expect(await context.findByText('Modelo ativo: Safira')).toBeTruthy()
  })
})
