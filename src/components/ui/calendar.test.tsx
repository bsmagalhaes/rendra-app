import { fireEvent, render, screen } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'
import { BrandProvider } from '../../brand/brand-provider'
import { nodesWithCode } from '../../test-utils/rendra-code'
import { Calendar, type CalendarEvent } from './calendar'

const eventos: CalendarEvent[] = [
  { id: 'e1', title: 'Reunião de equipe', start: new Date(2026, 9, 5, 10, 0), end: new Date(2026, 9, 5, 11, 0), tone: 'primary', location: 'Sala 2' },
  { id: 'e2', title: 'Visita: Padaria Bom Grão', start: new Date(2026, 9, 5, 14, 0), end: new Date(2026, 9, 5, 15, 30), tone: 'success' },
  { id: 'e3', title: 'Feriado municipal', start: new Date(2026, 9, 12), allDay: true, tone: 'warning' },
  { id: 'e4', title: 'Planejamento do mês', start: new Date(2026, 8, 15, 9, 0) },
  { id: 'e5', title: 'Alinhamento rápido', start: new Date(2026, 9, 6, 8, 30), end: new Date(2026, 9, 6, 9, 15) },
]

const base = new Date(2026, 8, 15)

const renderizar = (ui: React.ReactElement) => render(<BrandProvider>{ui}</BrandProvider>)

afterEach(() => {
  jest.useRealTimers()
})

describe('Calendar: mes', () => {
  it('a raiz carrega CAL-001 (sobrepondo o CARD-001) e e uma regiao chamada Calendário', async () => {
    const { container } = await renderizar(<Calendar events={eventos} defaultDate={base} />)
    expect(nodesWithCode(container, 'CAL-001')).toHaveLength(1)
    expect(nodesWithCode(container, 'CARD-001')).toHaveLength(0)
    expect(screen.getByLabelText('Calendário').props.role).toBe('region')
  })

  it('navegar troca o titulo; tocar num dia marca selecionado e lista os eventos dele', async () => {
    await renderizar(<Calendar events={eventos} defaultDate={base} />)
    expect(screen.getByText('Setembro de 2026')).toBeTruthy()
    await fireEvent.press(screen.getByRole('button', { name: 'Próximo' }))
    expect(screen.getByText('Outubro de 2026')).toBeTruthy()
    await fireEvent.press(screen.getByRole('button', { name: /^5 de outubro/ }))
    expect(screen.getByRole('button', { name: /^5 de outubro/ }).props.accessibilityState.selected).toBe(true)
    expect(screen.getByText('Reunião de equipe')).toBeTruthy()
    expect(screen.getByText('Sala 2')).toBeTruthy()
    expect(screen.getByText('10:00 às 11:00')).toBeTruthy()
    await fireEvent.press(screen.getByRole('button', { name: 'Anterior' }))
    expect(screen.getByText('Setembro de 2026')).toBeTruthy()
  })

  it('o nome do dia traz a contagem de eventos', async () => {
    await renderizar(<Calendar events={eventos} defaultDate={new Date(2026, 9, 1)} />)
    expect(screen.getByRole('button', { name: '5 de outubro, 2 eventos' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '12 de outubro, 1 evento' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '7 de outubro' })).toBeTruthy()
  })

  it('cada celula mede o toque minimo (min-h-touch) e dia sem evento mostra a mensagem', async () => {
    await renderizar(<Calendar events={eventos} defaultDate={new Date(2026, 9, 20)} />)
    expect(screen.getByRole('button', { name: '7 de outubro' }).props.className).toContain('min-h-touch')
    expect(screen.getByText('Nenhum evento neste dia.')).toBeTruthy()
  })

  it('onDateClick: o botao Novo evento neste dia chama com o dia selecionado; sem a prop ele nao existe', async () => {
    const onDateClick = jest.fn()
    const { unmount } = await renderizar(<Calendar events={[]} defaultDate={new Date(2026, 9, 20)} onDateClick={onDateClick} />)
    await fireEvent.press(screen.getByText('Novo evento neste dia'))
    expect(onDateClick).toHaveBeenCalledTimes(1)
    expect((onDateClick.mock.calls[0]![0] as Date).getDate()).toBe(20)
    await unmount()
    await renderizar(<Calendar events={[]} defaultDate={new Date(2026, 9, 20)} />)
    expect(screen.queryByText('Novo evento neste dia')).toBeNull()
  })

  it('onEventClick recebe o evento tocado na lista do dia', async () => {
    const onEventClick = jest.fn()
    await renderizar(<Calendar events={eventos} defaultDate={new Date(2026, 9, 5)} onEventClick={onEventClick} />)
    await fireEvent.press(screen.getByRole('button', { name: /Reunião de equipe/ }))
    expect(onEventClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'e1' }))
  })

  it('modo controlado: date e view vem de fora e as mudancas sobem por callback', async () => {
    const onDateChange = jest.fn()
    const onViewChange = jest.fn()
    await renderizar(<Calendar events={eventos} date={base} view="month" onDateChange={onDateChange} onViewChange={onViewChange} />)
    await fireEvent.press(screen.getByRole('button', { name: 'Próximo' }))
    expect((onDateChange.mock.calls[0]![0] as Date).getMonth()).toBe(9)
    expect(screen.getByText('Setembro de 2026')).toBeTruthy() // controlado: nao mudou sozinho
    await fireEvent.press(screen.getByRole('radio', { name: 'Dia' }))
    expect(onViewChange).toHaveBeenCalledWith('day')
  })

  it('Hoje volta para o mes corrente', async () => {
    jest.useFakeTimers({ now: new Date(2026, 9, 5, 10, 30), doNotFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'setImmediate', 'clearImmediate', 'nextTick', 'queueMicrotask'] })
    await renderizar(<Calendar events={eventos} defaultDate={new Date(2020, 0, 1)} />)
    expect(screen.getByText('Janeiro de 2020')).toBeTruthy()
    await fireEvent.press(screen.getByText('Hoje'))
    expect(screen.getByText('Outubro de 2026')).toBeTruthy()
  })
})

describe('Calendar: visoes', () => {
  it('views sem week no seletor, mesmo passado; view week mostra a faixa de dias e a grade de horas', async () => {
    await renderizar(<Calendar events={[]} defaultDate={base} defaultView="week" views={['month', 'week', 'day', 'agenda']} />)
    expect(screen.queryByText('Semana')).toBeNull()
    expect(screen.getByText('Hoje')).toBeTruthy()
    expect(screen.getByTestId('calendar-hours')).toBeTruthy()
    expect(screen.getAllByTestId(/^calendar-semana-/)).toHaveLength(7)
  })

  it('o seletor lista so as visoes pedidas', async () => {
    await renderizar(<Calendar events={[]} defaultDate={base} views={['month', 'agenda']} />)
    expect(screen.getByRole('radio', { name: 'Mês' })).toBeTruthy()
    expect(screen.getByRole('radio', { name: 'Agenda' })).toBeTruthy()
    expect(screen.queryByRole('radio', { name: 'Dia' })).toBeNull()
  })

  it('dia: o evento fica no topo e com a altura exatos do minuto, na grade de 48px por hora', async () => {
    await renderizar(<Calendar events={eventos} defaultDate={new Date(2026, 9, 5)} defaultView="day" />)
    const manha = StyleSheet.flatten(screen.getByTestId('calendar-evento-e1').props.style)
    expect(manha).toMatchObject({ top: 144, height: 48 })
    // so ha degrau de espacamento 0,1,2,3,4,6,8,12,16,24 no preset: left-14 nao existiria
    expect(screen.getByTestId('calendar-evento-e1').props.className).toContain('left-12')
    const tarde = StyleSheet.flatten(screen.getByTestId('calendar-evento-e2').props.style)
    expect(tarde).toMatchObject({ top: 336, height: 72 })
  })

  it('dia: evento as 8:30 fica no meio da hora, nao arredondado para a hora cheia', async () => {
    await renderizar(<Calendar events={eventos} defaultDate={new Date(2026, 9, 6)} defaultView="day" />)
    // (8,5 - 7) * 48 = 72 e 45 min = 36px; arredondar para 8:00 daria 48
    expect(StyleSheet.flatten(screen.getByTestId('calendar-evento-e5').props.style)).toMatchObject({ top: 72, height: 36 })
  })

  it('dia inteiro fica fora da grade de horas, numa faixa propria', async () => {
    await renderizar(<Calendar events={eventos} defaultDate={new Date(2026, 9, 12)} defaultView="day" />)
    expect(screen.getByText('Feriado municipal')).toBeTruthy()
    expect(screen.queryByTestId('calendar-evento-e3')).toBeNull()
    expect(screen.getByText('Dia inteiro')).toBeTruthy()
  })

  it('a linha de agora aparece so no dia de hoje, na posicao do horario', async () => {
    jest.useFakeTimers({ now: new Date(2026, 9, 5, 10, 30), doNotFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'setImmediate', 'clearImmediate', 'nextTick', 'queueMicrotask'] })
    const { unmount } = await renderizar(<Calendar events={[]} defaultDate={new Date(2026, 9, 5)} defaultView="day" />)
    expect(StyleSheet.flatten(screen.getByTestId('calendar-agora').props.style)).toMatchObject({ top: 168 })
    await unmount()
    await renderizar(<Calendar events={[]} defaultDate={new Date(2026, 9, 6)} defaultView="day" />)
    expect(screen.queryByTestId('calendar-agora')).toBeNull()
  })

  it('o intervalo de horas e configuravel', async () => {
    await renderizar(<Calendar events={eventos} defaultDate={new Date(2026, 9, 5)} defaultView="day" hours={[9, 12]} />)
    expect(screen.getByText('09:00')).toBeTruthy()
    expect(screen.getByText('12:00')).toBeTruthy()
    expect(screen.queryByText('13:00')).toBeNull()
    expect(StyleSheet.flatten(screen.getByTestId('calendar-evento-e1').props.style)).toMatchObject({ top: 48 })
  })

  it('agenda: lista o mes com os eventos de cada dia; sem eventos mostra o estado vazio', async () => {
    const { unmount } = await renderizar(<Calendar events={eventos} defaultDate={new Date(2026, 9, 1)} defaultView="agenda" />)
    expect(screen.getByText('Reunião de equipe')).toBeTruthy()
    expect(screen.getByText('Feriado municipal')).toBeTruthy()
    expect(screen.queryByText('Planejamento do mês')).toBeNull()
    await unmount()
    await renderizar(<Calendar events={[]} defaultDate={new Date(2020, 0, 1)} defaultView="agenda" />)
    expect(screen.getByText('Nenhum evento neste mês')).toBeTruthy()
    expect(screen.getByText('Use as setas para ver outros meses.')).toBeTruthy()
  })

  it('semana e dia navegam de 7 em 7 e de 1 em 1 dia, e o titulo acompanha', async () => {
    const { unmount } = await renderizar(<Calendar events={[]} defaultDate={new Date(2026, 9, 5)} defaultView="day" />)
    expect(screen.getByText('Segunda-feira, 5 de outubro')).toBeTruthy()
    await fireEvent.press(screen.getByRole('button', { name: 'Próximo' }))
    expect(screen.getByText('Terça-feira, 6 de outubro')).toBeTruthy()
    await unmount()
    await renderizar(<Calendar events={[]} defaultDate={new Date(2026, 9, 5)} defaultView="week" />)
    expect(screen.getByText('4 out a 10 out de 2026')).toBeTruthy()
    await fireEvent.press(screen.getByRole('button', { name: 'Próximo' }))
    expect(screen.getByText('11 out a 17 out de 2026')).toBeTruthy()
  })

  it('trocar de visao pelo seletor mostra a grade de horas', async () => {
    await renderizar(<Calendar events={eventos} defaultDate={new Date(2026, 9, 5)} />)
    expect(screen.queryByTestId('calendar-hours')).toBeNull()
    await fireEvent.press(screen.getByRole('radio', { name: 'Dia' }))
    expect(screen.getByTestId('calendar-hours')).toBeTruthy()
  })
})
