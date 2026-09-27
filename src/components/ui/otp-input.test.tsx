import { render, fireEvent } from '@testing-library/react-native'
import { BrandProvider } from '../../brand/brand-provider'
import { OtpInput } from './otp-input'

describe('OtpInput', () => {
  it('digitar avança o foco e rotula cada caixa "Dígito N de 6"', async () => {
    const onChange = jest.fn()
    const { findAllByLabelText } = await render(
      <BrandProvider>
        <OtpInput value="" onChange={onChange} />
      </BrandProvider>,
    )
    const caixas = await findAllByLabelText(/Dígito \d de 6/)
    expect(caixas).toHaveLength(6)
    await fireEvent.changeText(caixas[0], '1')
    expect(onChange).toHaveBeenCalledWith('1')
  })

  it('colar 123456 na primeira caixa preenche tudo e chama onComplete', async () => {
    const onChange = jest.fn()
    const onComplete = jest.fn()
    const { findAllByLabelText } = await render(
      <BrandProvider>
        <OtpInput value="" onChange={onChange} onComplete={onComplete} />
      </BrandProvider>,
    )
    const caixas = await findAllByLabelText(/Dígito \d de 6/)
    await fireEvent.changeText(caixas[0], '123456')
    expect(onChange).toHaveBeenCalledWith('123456')
    expect(onComplete).toHaveBeenCalledWith('123456')
  })

  it('Backspace em caixa vazia devolve o foco à anterior, sem apagar seu dígito (contrato §12.12)', async () => {
    // Bloqueador 2 do veredito do Bloco B (Fable): o desvio 16.1 (Backspace apagando o
    // dígito anterior) foi rejeitado ("testabilidade não autoriza mudar comportamento de
    // produto"). Restaurado o contrato: Backspace numa caixa vazia só devolve o foco à
    // caixa anterior, sem tocar no valor; a chamada de `.focus()` na instância real do ref
    // não é verificável sob RNTL 14 (TestInstance de findAllByLabelText não expõe `.focus`,
    // já registrado na Tarefa 16), então o efeito verificável aqui é o valor intocado.
    const onChange = jest.fn()
    const { findAllByLabelText } = await render(
      <BrandProvider>
        <OtpInput value="12" onChange={onChange} />
      </BrandProvider>,
    )
    const caixas = await findAllByLabelText(/Dígito \d de 6/)
    await fireEvent(caixas[2], 'keyPress', { nativeEvent: { key: 'Backspace' } })
    expect(onChange).not.toHaveBeenCalled()
    expect(caixas[1].props.value).toBe('2')
  })

  it('achado 2: cada caixa seleciona o conteúdo ao focar (selectTextOnFocus, contrato §12.12)', async () => {
    const { findAllByLabelText } = await render(
      <BrandProvider>
        <OtpInput value="" onChange={() => {}} />
      </BrandProvider>,
    )
    const caixas = await findAllByLabelText(/Dígito \d de 6/)
    expect(caixas[0].props.selectTextOnFocus).toBe(true)
  })

  it('invalid aplica border-destructive nas caixas', async () => {
    const { findAllByLabelText } = await render(
      <BrandProvider>
        <OtpInput value="" onChange={() => {}} invalid />
      </BrandProvider>,
    )
    const caixas = await findAllByLabelText(/Dígito \d de 6/)
    expect(caixas[0].props.className.split(' ')).toContain('border-destructive')
  })

  it('contêiner tem role group e accessibilityLabel Código de verificação', async () => {
    const { findByLabelText } = await render(
      <BrandProvider>
        <OtpInput value="" onChange={() => {}} />
      </BrandProvider>,
    )
    const grupo = await findByLabelText('Código de verificação')
    expect(grupo.props.role).toBe('group')
    expect(grupo.props.accessible).toBeUndefined()
  })
})
