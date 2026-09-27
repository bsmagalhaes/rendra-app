import { render, fireEvent, waitFor } from '@testing-library/react-native'
import { BrandProvider } from '../../brand/brand-provider'
import { DatePicker } from './date-picker'

describe('DatePicker', () => {
  it('gatilho tem papel button e accessibilityLabel', async () => {
    const { findByRole } = await render(
      <BrandProvider>
        <DatePicker value={new Date(2026, 8, 25)} onChange={() => {}} label="Data" />
      </BrandProvider>,
    )
    const gatilho = await findByRole('button')
    expect(gatilho.props.accessibilityLabel).toBe('Data')
  })

  it('abre o painel e, imediato, toque no dia chama onChange e fecha', async () => {
    // Achado 9 do veredito do Bloco B: o teste original não conferia o fechamento.
    const onChange = jest.fn()
    const { findByRole, findByText } = await render(
      <BrandProvider>
        <DatePicker value={new Date(2026, 8, 1)} onChange={onChange} dropdowns={false} />
      </BrandProvider>,
    )
    const gatilho = await findByRole('button')
    expect(gatilho.props.accessibilityState.expanded).toBe(false)
    await fireEvent.press(gatilho)
    await waitFor(() => expect(gatilho.props.accessibilityState.expanded).toBe(true))
    const dia25 = await findByText('25')
    await fireEvent.press(dia25)
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(new Date(2026, 8, 25)))
    // Efeito visível, não só a chamada: o painel fecha de verdade.
    await waitFor(() => expect(gatilho.props.accessibilityState.expanded).toBe(false))
  })

  it('texto do campo usa dd/MM/yyyy em pt-BR', async () => {
    const { findByText } = await render(
      <BrandProvider>
        <DatePicker value={new Date(2026, 8, 25)} onChange={() => {}} />
      </BrandProvider>,
    )
    expect(await findByText('25/09/2026')).toBeTruthy()
  })

  it('time mostra o Input mask="time" rotulado Horário', async () => {
    const { findByRole, findByLabelText } = await render(
      <BrandProvider>
        <DatePicker value={new Date(2026, 8, 25, 9, 0)} onChange={() => {}} time />
      </BrandProvider>,
    )
    const gatilho = await findByRole('button')
    await fireEvent.press(gatilho)
    expect(await findByLabelText('Horário')).toBeTruthy()
  })

  it('dropdowns troca o cabeçalho por botões de mês e ano (sem Select/Modal aninhado, R9), e o mês escolhido troca a grade', async () => {
    // Correção de composição pedida pelo coordenador (achado do veredito do Bloco B, achado 9):
    // o cabeçalho usava dois `Select`, cada um abrindo seu próprio `PickerPanel`/`BottomSheet`
    // (um `RNModal`) dentro do `RNModal` já aberto do próprio `DatePicker`, o que a regra R9 de
    // `DESIGN_RULES.md` proíbe ("nenhum Modal dentro de outro Modal"). Trocado por dois botões
    // simples que alternam o conteúdo do MESMO painel (`pickerMode`), sem montar um segundo
    // Modal; por isso o mês agora pode ser escolhido de verdade sob Jest (o Select antigo não
    // chegava a montar o segundo Modal no test renderer, registrado no arquivo de desvios).
    const { findByRole, findByLabelText, findByText, findAllByText, queryByRole } = await render(
      <BrandProvider>
        <DatePicker value={new Date(2026, 8, 25)} onChange={() => {}} dropdowns />
      </BrandProvider>,
    )
    const gatilho = await findByRole('button')
    await fireEvent.press(gatilho)
    expect(await queryByRole('combobox')).toBeNull()
    const botaoMes = await findByLabelText('Mês: Setembro')
    await fireEvent.press(botaoMes)
    const outubro = await findByText('Outubro')
    await fireEvent.press(outubro)
    // Voltou sozinho para a grade de dias (pickerMode volta a 'days'); outubro tem 31 dias,
    // "31" aparece sem text-muted-foreground (dia do mês corrente) só depois da troca.
    const candidatos = await findAllByText('31')
    const diaDoMesAtual = candidatos.find((el) => !el.props.className.split(' ').includes('text-muted-foreground'))
    expect(diaDoMesAtual).toBeTruthy()
  })

  it('dropdowns: botão do ano abre a lista de anos e escolher um ano troca o rótulo', async () => {
    const { findByRole, findByLabelText, findByText } = await render(
      <BrandProvider>
        <DatePicker value={new Date(2026, 8, 25)} onChange={() => {}} dropdowns />
      </BrandProvider>,
    )
    const gatilho = await findByRole('button')
    await fireEvent.press(gatilho)
    const botaoAno = await findByLabelText('Ano: 2026')
    await fireEvent.press(botaoAno)
    const ano2027 = await findByText('2027')
    await fireEvent.press(ano2027)
    expect(await findByLabelText('Ano: 2027')).toBeTruthy()
  })

  it('range mostra "25/09/2026 a ..." sem data final', async () => {
    const { findByText } = await render(
      <BrandProvider>
        <DatePicker range value={{ from: new Date(2026, 8, 25) }} onChange={() => {}} />
      </BrandProvider>,
    )
    expect(await findByText('25/09/2026 a ...')).toBeTruthy()
  })

  it('range: Aplicar chama onChange com draftRange, não com draftSingle', async () => {
    const onChange = jest.fn()
    const { findByRole, findByText } = await render(
      <BrandProvider>
        <DatePicker
          range
          value={{ from: new Date(2026, 8, 10), to: new Date(2026, 8, 20) }}
          onChange={onChange}
          dropdowns={false}
        />
      </BrandProvider>,
    )
    const gatilho = await findByRole('button')
    await fireEvent.press(gatilho)
    const aplicar = await findByText('Aplicar')
    await fireEvent.press(aplicar)
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith({ from: new Date(2026, 8, 10), to: new Date(2026, 8, 20) }),
    )
  })

  it('range com time mostra "Hora inicial" e "Hora final"', async () => {
    const { findByRole, findByLabelText } = await render(
      <BrandProvider>
        <DatePicker
          range
          time
          value={{ from: new Date(2026, 8, 10), to: new Date(2026, 8, 20) }}
          onChange={() => {}}
        />
      </BrandProvider>,
    )
    const gatilho = await findByRole('button')
    await fireEvent.press(gatilho)
    expect(await findByLabelText('Hora inicial')).toBeTruthy()
    expect(await findByLabelText('Hora final')).toBeTruthy()
  })

  it('Limpar chama onChange(null)', async () => {
    const onChange = jest.fn()
    const { findByRole, findByText } = await render(
      <BrandProvider>
        <DatePicker value={new Date(2026, 8, 25)} onChange={onChange} time />
      </BrandProvider>,
    )
    const gatilho = await findByRole('button')
    await fireEvent.press(gatilho)
    const limpar = await findByText('Limpar')
    await fireEvent.press(limpar)
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(null))
  })

  it('bloqueador 3: modo simples com time envia a hora editada depois de escolher o dia', async () => {
    // Veredito do Bloco B (Fable): "Aplicar" enviava draftSingle sem a hora editada por
    // último (contrato §12.13); a hora ficava presa à digitada antes de escolher o dia.
    const onChange = jest.fn()
    const { findByRole, findByText, findByLabelText } = await render(
      <BrandProvider>
        <DatePicker value={new Date(2026, 8, 25, 9, 0)} onChange={onChange} time dropdowns={false} />
      </BrandProvider>,
    )
    const gatilho = await findByRole('button')
    await fireEvent.press(gatilho)
    const dia25 = await findByText('25')
    await fireEvent.press(dia25)
    const horario = await findByLabelText('Horário')
    await fireEvent.changeText(horario, '1430')
    const aplicar = await findByText('Aplicar')
    await fireEvent.press(aplicar)
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(new Date(2026, 8, 25, 14, 30)))
  })

  it('bloqueador 3: reabrir o painel ressincroniza o rascunho com o value atual', async () => {
    const onChange = jest.fn()
    const { findByRole, findByText, findAllByText, findByTestId, queryByText } = await render(
      <BrandProvider>
        <DatePicker value={new Date(2026, 8, 25)} onChange={onChange} time dropdowns={false} />
      </BrandProvider>,
    )
    const gatilho = await findByRole('button')
    await fireEvent.press(gatilho)
    // Escolhe outro dia (rascunho muda para o 10 do mês corrente), mas fecha sem aplicar (X
    // do cabeçalho do painel, rotulado "Fechar" mas sem texto visível; testID de fallback do
    // PickerPanel). A grade de 42 dias repete números de dias de meses vizinhos, então filtra
    // o "10" que não tem text-muted-foreground (dia do mês corrente).
    const candidatosDez = await findAllByText('10')
    const dezDoMesAtual = candidatosDez.find((el) => !el.props.className.split(' ').includes('text-muted-foreground'))
    await fireEvent.press(dezDoMesAtual!)
    await fireEvent.press(await findByTestId('picker-panel-fechar'))
    // Reabre: o rascunho precisa refletir o value atual (25, 00:00), não o 10 nunca aplicado.
    await fireEvent.press(gatilho)
    const aplicar = await findByText('Aplicar')
    await fireEvent.press(aplicar)
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(new Date(2026, 8, 25)))
    expect(queryByText('10')).toBeNull()
  })

  it('achado 4: setas de mês e dias têm papel button, dia tem rótulo e accessibilityState', async () => {
    const { findByRole, findAllByRole, findByLabelText } = await render(
      <BrandProvider>
        <DatePicker value={new Date(2026, 8, 25)} onChange={() => {}} dropdowns={false} />
      </BrandProvider>,
    )
    const gatilho = await findByRole('button')
    await fireEvent.press(gatilho)
    const setaAnterior = await findByLabelText('Mês anterior')
    expect(setaAnterior.props.accessibilityRole).toBe('button')
    const dia25 = await findByLabelText(/25 de setembro/)
    expect(dia25.props.accessibilityRole).toBe('button')
    expect(dia25.props.accessibilityState.selected).toBe(true)
    const botoes = await findAllByRole('button')
    // Gatilho + Mês anterior + Próximo mês + 42 dias da grade.
    expect(botoes.length).toBeGreaterThanOrEqual(45)
  })

  it('minDate desabilita dias anteriores', async () => {
    const { findByRole, findAllByText } = await render(
      <BrandProvider>
        <DatePicker
          value={new Date(2026, 8, 25)}
          onChange={() => {}}
          minDate={new Date(2026, 8, 10)}
          dropdowns={false}
        />
      </BrandProvider>,
    )
    const gatilho = await findByRole('button')
    await fireEvent.press(gatilho)
    // a grade tem 42 dias (6 semanas); "5" aparece tanto no mês atual quanto em dias
    // de fora do mês (agosto/outubro), então filtra o que não tem text-muted-foreground (fora do mês).
    const candidatos = await findAllByText('5')
    const diaDoMesAtual = candidatos.find((el) => !el.props.className.split(' ').includes('text-muted-foreground'))
    expect(diaDoMesAtual?.props.className.split(' ')).toEqual(expect.arrayContaining(['opacity-30']))
  })

  it('achado do Playwright (test:a11y): dia de fora do mês usa text-muted-foreground, não opacity-40 (contraste)', async () => {
    // axe (WCAG "color-contrast") reprovava o painel do DatePicker aberto: "opacity-40" sobre
    // "text-foreground" mistura a cor com o fundo (bg-popover), resultando em contraste real de
    // 3.37 no modo escuro, abaixo do mínimo de 4,5:1; diferente do placeholder (achado
    // anterior), aqui o axe media o efeito real (dias de fora do mês continuam clicáveis, não
    // são "componente inativo", então não há a isenção da WCAG 1.4.3 para texto desabilitado).
    // `text-muted-foreground` é o token já usado em todo o projeto para texto de segunda
    // importância, calculado para 4,5:1 (src/brand/palette.ts, reach(...)), em vez de depender
    // de opacidade sobre uma cor de texto plena.
    const { findByRole, findAllByText } = await render(
      <BrandProvider>
        <DatePicker value={new Date(2026, 8, 25)} onChange={() => {}} dropdowns={false} />
      </BrandProvider>,
    )
    const gatilho = await findByRole('button')
    await fireEvent.press(gatilho)
    const candidatos = await findAllByText('5')
    const diaDeForaDoMes = candidatos.find((el) => el.props.className.split(' ').includes('text-muted-foreground'))
    expect(diaDeForaDoMes).toBeTruthy()
    expect(diaDeForaDoMes?.props.className.split(' ')).not.toContain('opacity-40')
  })

  it('melhoria 7 do veredito do fechamento: a grade de anos respeita minDate/maxDate, em vez de sempre ir de 1900 até o ano atual mais 10', async () => {
    const { findByRole, findByLabelText, queryByText, findByText } = await render(
      <BrandProvider>
        <DatePicker
          value={new Date(2022, 8, 25)}
          onChange={() => {}}
          dropdowns
          minDate={new Date(2020, 0, 1)}
          maxDate={new Date(2025, 11, 31)}
        />
      </BrandProvider>,
    )
    const gatilho = await findByRole('button')
    await fireEvent.press(gatilho)
    const botaoAno = await findByLabelText('Ano: 2022')
    await fireEvent.press(botaoAno)
    // Dentro do intervalo: aparecem.
    expect(await findByText('2020')).toBeTruthy()
    expect(await findByText('2025')).toBeTruthy()
    // Fora do intervalo: não aparecem (nem o 1900 do padrão antigo, nem nada além de maxDate).
    expect(queryByText('1900')).toBeNull()
    expect(queryByText('2019')).toBeNull()
    expect(queryByText('2026')).toBeNull()
  })

  it('melhoria 7 do veredito do fechamento: sem minDate/maxDate, a grade de anos não abre mais em 1900 (janela padrão em torno do ano atual)', async () => {
    const { findByRole, findByLabelText, queryByText } = await render(
      <BrandProvider>
        <DatePicker value={new Date(2022, 8, 25)} onChange={() => {}} dropdowns />
      </BrandProvider>,
    )
    const gatilho = await findByRole('button')
    await fireEvent.press(gatilho)
    const botaoAno = await findByLabelText('Ano: 2022')
    await fireEvent.press(botaoAno)
    expect(queryByText('1900')).toBeNull()
  })
})
