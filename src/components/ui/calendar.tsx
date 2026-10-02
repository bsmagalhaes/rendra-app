import { useState } from 'react'
import type { ReactNode } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react-native'
import { Text } from '../internal/text'
import { Button } from './button'
import { ButtonGroup } from './button-group'
import { Card, CardContent } from './card'
import { EmptyState } from './empty-state'
import { useControlledState } from '../../hooks/use-controlled-state'
import { eventHeight, eventTop, HOUR_HEIGHT, nowTop } from '../../lib/calendar-grid'
import { a11yPresets } from '../../lib/a11y'
import { cn } from '../../lib/cn'

export type CalendarView = 'month' | 'week' | 'day' | 'agenda'
export type CalendarTone = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end?: Date
  allDay?: boolean
  tone?: CalendarTone
  description?: string
  location?: string
}

export interface CalendarProps {
  events: CalendarEvent[]
  view?: CalendarView
  defaultView?: CalendarView
  onViewChange?: (view: CalendarView) => void
  views?: CalendarView[]
  date?: Date
  defaultDate?: Date
  onDateChange?: (date: Date) => void
  onEventClick?: (event: CalendarEvent) => void
  onDateClick?: (date: Date) => void
  /** Primeira e ultima hora da grade (inclusive); padrao 7 a 21. */
  hours?: [number, number]
  'aria-label'?: string
  className?: string
}

const ALL_VIEWS: CalendarView[] = ['month', 'week', 'day', 'agenda']
const viewLabels: Record<CalendarView, string> = { month: 'Mês', week: 'Semana', day: 'Dia', agenda: 'Agenda' }
const WEEK = { weekStartsOn: 0 as const, locale: ptBR }
const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

const toneChip: Record<CalendarTone, string> = {
  primary: 'bg-primary-soft text-primary-soft-foreground',
  success: 'bg-success-soft text-success-soft-foreground',
  warning: 'bg-warning-soft text-warning-soft-foreground',
  error: 'bg-destructive-soft text-destructive-soft-foreground',
  info: 'bg-info-soft text-info-soft-foreground',
  neutral: 'bg-muted text-foreground',
}

const toneDot: Record<CalendarTone, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-destructive',
  info: 'bg-info',
  neutral: 'bg-muted-foreground',
}

const capitalize = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1)

function eventsOn(events: CalendarEvent[], day: Date): CalendarEvent[] {
  return events.filter((e) => isSameDay(e.start, day)).sort((a, b) => a.start.getTime() - b.start.getTime())
}

function timeText(event: CalendarEvent): string {
  if (event.allDay) return 'Dia inteiro'
  const inicio = format(event.start, 'HH:mm')
  return event.end ? `${inicio} às ${format(event.end, 'HH:mm')}` : inicio
}

function titleOf(view: CalendarView, date: Date): string {
  if (view === 'day') return capitalize(format(date, "EEEE, d 'de' MMMM", { locale: ptBR }))
  if (view === 'week') {
    const ini = startOfWeek(date, WEEK)
    const fim = endOfWeek(date, WEEK)
    return `${format(ini, 'd MMM', { locale: ptBR })} a ${format(fim, "d MMM 'de' yyyy", { locale: ptBR })}`
  }
  return capitalize(format(date, "MMMM 'de' yyyy", { locale: ptBR }))
}

function step(view: CalendarView, date: Date, direction: 1 | -1): Date {
  if (view === 'day') return addDays(date, direction)
  if (view === 'week') return addDays(date, 7 * direction)
  return addMonths(date, direction)
}

function EventCard({ event, onEventClick }: { event: CalendarEvent; onEventClick?: (event: CalendarEvent) => void }) {
  const tone = event.tone ?? 'neutral'
  const conteudo = (
    <>
      <View className={cn('w-1 self-stretch rounded-full', toneDot[tone])} />
      <View className="min-w-0 flex-1 gap-1">
        <Text weight="medium" className="text-sm text-foreground">
          {event.title}
        </Text>
        <View className="flex-row items-center gap-1">
          <Clock className="size-icon-sm text-muted-foreground" />
          <Text className="text-xs text-muted-foreground">{timeText(event)}</Text>
        </View>
        {event.location ? (
          <View className="flex-row items-center gap-1">
            <MapPin className="size-icon-sm text-muted-foreground" />
            <Text className="text-xs text-muted-foreground">{event.location}</Text>
          </View>
        ) : null}
      </View>
    </>
  )
  const classe = 'min-h-touch flex-row gap-3 rounded-block border border-border bg-card p-3'
  if (onEventClick) {
    return (
      <Pressable {...a11yPresets.button} onPress={() => onEventClick(event)} className={classe}>
        {conteudo}
      </Pressable>
    )
  }
  return <View className={classe}>{conteudo}</View>
}

function DayList({
  events,
  onEventClick,
  empty,
}: {
  events: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
  empty?: ReactNode
}) {
  if (events.length === 0) return <>{empty ?? null}</>
  return (
    <View className="gap-2">
      {events.map((event) => (
        <EventCard key={event.id} event={event} onEventClick={onEventClick} />
      ))}
    </View>
  )
}

function MonthGrid({
  date,
  events,
  onSelect,
}: {
  date: Date
  events: CalendarEvent[]
  onSelect: (day: Date) => void
}) {
  const hoje = new Date()
  const dias = eachDayOfInterval({ start: startOfWeek(startOfMonth(date), WEEK), end: endOfWeek(endOfMonth(date), WEEK) })
  const semanas: Date[][] = []
  for (let i = 0; i < dias.length; i += 7) semanas.push(dias.slice(i, i + 7))
  return (
    <View>
      <View className="flex-row">
        {WEEKDAYS.map((nome) => (
          <View key={nome} className="flex-1 items-center py-2">
            <Text className="text-xs text-muted-foreground">{nome}</Text>
          </View>
        ))}
      </View>
      {semanas.map((semana, i) => (
        <View key={i} className="flex-row">
          {semana.map((dia) => {
            const doDia = eventsOn(events, dia)
            const selecionado = isSameDay(dia, date)
            const ehHoje = isSameDay(dia, hoje)
            const nome =
              format(dia, "d 'de' MMMM", { locale: ptBR }) +
              (doDia.length > 0 ? `, ${doDia.length} ${doDia.length === 1 ? 'evento' : 'eventos'}` : '')
            return (
              <Pressable
                key={dia.toISOString()}
                {...a11yPresets.button}
                accessibilityLabel={nome}
                accessibilityState={{ selected: selecionado }}
                aria-pressed={selecionado}
                onPress={() => onSelect(dia)}
                className={cn('min-h-touch flex-1 items-center justify-center gap-1 py-1', selecionado ? 'rounded-item bg-primary' : '')}
              >
                <Text
                  weight={ehHoje ? 'semibold' : 'normal'}
                  className={cn(
                    'text-sm',
                    selecionado ? 'text-primary-foreground' : ehHoje ? 'text-primary-text' : isSameMonth(dia, date) ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {format(dia, 'd')}
                </Text>
                <View className="h-1 flex-row gap-1">
                  {doDia.slice(0, 3).map((e) => (
                    <View key={e.id} className={cn('size-1 rounded-full', selecionado ? 'bg-primary-foreground' : toneDot[e.tone ?? 'neutral'])} />
                  ))}
                </View>
              </Pressable>
            )
          })}
        </View>
      ))}
    </View>
  )
}

function WeekStrip({ date, onSelect }: { date: Date; onSelect: (day: Date) => void }) {
  const dias = eachDayOfInterval({ start: startOfWeek(date, WEEK), end: endOfWeek(date, WEEK) })
  return (
    <View className="flex-row">
      {dias.map((dia) => {
        const selecionado = isSameDay(dia, date)
        return (
          <Pressable
            key={dia.toISOString()}
            testID={`calendar-semana-${format(dia, 'yyyy-MM-dd')}`}
            {...a11yPresets.button}
            accessibilityLabel={format(dia, "EEEE, d 'de' MMMM", { locale: ptBR })}
            accessibilityState={{ selected: selecionado }}
            aria-pressed={selecionado}
            onPress={() => onSelect(dia)}
            className={cn('min-h-touch flex-1 items-center justify-center', selecionado ? 'rounded-item bg-primary' : '')}
          >
            <Text className={cn('text-xs', selecionado ? 'text-primary-foreground' : 'text-muted-foreground')}>
              {format(dia, 'EEEEE', { locale: ptBR }).toUpperCase()}
            </Text>
            <Text weight="medium" className={cn('text-sm', selecionado ? 'text-primary-foreground' : 'text-foreground')}>
              {format(dia, 'd')}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

function HoursGrid({
  date,
  events,
  hours,
  onEventClick,
  onDateClick,
}: {
  date: Date
  events: CalendarEvent[]
  hours: [number, number]
  onEventClick?: (event: CalendarEvent) => void
  onDateClick?: (date: Date) => void
}) {
  const [h0, h1] = hours
  const horas = Array.from({ length: h1 - h0 + 1 }, (_, i) => h0 + i)
  const doDia = eventsOn(events, date)
  const diaInteiro = doDia.filter((e) => e.allDay)
  const comHora = doDia.filter((e) => !e.allDay)
  const agora = new Date()
  const mostrarAgora = isSameDay(date, agora) && agora.getHours() >= h0 && agora.getHours() <= h1

  return (
    <View className="gap-2">
      {diaInteiro.length > 0 ? (
        <View className="gap-2">
          {diaInteiro.map((e) => (
            <EventCard key={e.id} event={e} onEventClick={onEventClick} />
          ))}
        </View>
      ) : null}
      <ScrollView testID="calendar-hours" nestedScrollEnabled className="h-chart-md">
        <View className="relative" style={{ height: horas.length * HOUR_HEIGHT }}>
          {horas.map((hora) => {
            const rotulo = `${String(hora).padStart(2, '0')}:00`
            const linha = (
              <>
                <Text className="w-12 px-1 pt-1 text-xs text-muted-foreground">{rotulo}</Text>
                <View className="flex-1 border-t border-border" />
              </>
            )
            return onDateClick ? (
              <Pressable
                key={hora}
                {...a11yPresets.button}
                accessibilityLabel={`Novo evento em ${format(date, "d 'de' MMMM", { locale: ptBR })} às ${rotulo}`}
                onPress={() => onDateClick(new Date(date.getFullYear(), date.getMonth(), date.getDate(), hora))}
                className="h-12 flex-row"
              >
                {linha}
              </Pressable>
            ) : (
              <View key={hora} className="h-12 flex-row">
                {linha}
              </View>
            )
          })}
          {comHora.map((event) => {
            const tone = event.tone ?? 'neutral'
            const estilo = { top: eventTop(event, h0), height: eventHeight(event) }
            const conteudo = (
              <>
                <Text weight="medium" numberOfLines={1} className={cn('text-xs', toneChip[tone].split(' ')[1])}>
                  {event.title}
                </Text>
                <Text numberOfLines={1} className={cn('text-xs', toneChip[tone].split(' ')[1])}>
                  {timeText(event)}
                </Text>
              </>
            )
            const classe = cn('absolute left-12 right-2 overflow-hidden rounded-item px-2 py-1', toneChip[tone].split(' ')[0])
            return onEventClick ? (
              <Pressable
                key={event.id}
                testID={`calendar-evento-${event.id}`}
                {...a11yPresets.button}
                accessibilityLabel={`${event.title}, ${timeText(event)}`}
                onPress={() => onEventClick(event)}
                className={classe}
                style={estilo}
              >
                {conteudo}
              </Pressable>
            ) : (
              <View key={event.id} testID={`calendar-evento-${event.id}`} className={classe} style={estilo}>
                {conteudo}
              </View>
            )
          })}
          {mostrarAgora ? (
            <View
              testID="calendar-agora"
              pointerEvents="none"
              className="absolute left-12 right-0 border-t-2 border-destructive"
              style={{ top: nowTop(agora, h0) }}
            />
          ) : null}
        </View>
      </ScrollView>
    </View>
  )
}

function Agenda({
  date,
  events,
  onEventClick,
}: {
  date: Date
  events: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
}) {
  const dias = eachDayOfInterval({ start: startOfMonth(date), end: endOfMonth(date) }).filter((dia) => eventsOn(events, dia).length > 0)
  if (dias.length === 0) {
    return <EmptyState size="compact" title="Nenhum evento neste mês" description="Use as setas para ver outros meses." />
  }
  return (
    <View className="gap-4">
      {dias.map((dia) => (
        <View key={dia.toISOString()} className="flex-row gap-3">
          <View className="w-12 items-center">
            <Text weight="semibold" className="text-2xl text-foreground">
              {format(dia, 'd')}
            </Text>
            <Text className="text-xs text-muted-foreground">{format(dia, 'EEE', { locale: ptBR })}</Text>
          </View>
          <View className="min-w-0 flex-1">
            <DayList events={eventsOn(events, dia)} onEventClick={onEventClick} />
          </View>
        </View>
      ))}
    </View>
  )
}

export function Calendar({
  events,
  view,
  defaultView = 'month',
  onViewChange,
  views = ALL_VIEWS,
  date,
  defaultDate,
  onDateChange,
  onEventClick,
  onDateClick,
  hours = [7, 21],
  'aria-label': ariaLabel = 'Calendário',
  className,
}: CalendarProps) {
  const [inicial] = useState(() => defaultDate ?? new Date())
  const [current, setDate] = useControlledState<Date>(date, inicial, onDateChange)
  const [chosenView, setView] = useControlledState<CalendarView>(view, defaultView, onViewChange)
  // Semana e mostrada como a faixa dos 7 dias mais a grade de horas, mas sai do seletor (app mobile).
  const selectable = views.filter((v) => v !== 'week')
  const options = selectable.map((v) => ({ value: v, label: viewLabels[v] }))

  return (
    <Card code="CAL-001" className={className}>
      <CardContent className="gap-4">
        <View {...a11yPresets.region} accessibilityLabel={ariaLabel} className="gap-4">
          <View className="flex-row items-center justify-between gap-2">
            <Text
              weight="semibold"
              accessibilityLiveRegion="polite"
              className="min-w-0 flex-1 text-base text-foreground"
            >
              {titleOf(chosenView, current)}
            </Text>
            <View className="flex-row items-center gap-1">
              <Button variant="outline" size="sm" onPress={() => setDate(new Date())}>
                Hoje
              </Button>
              <Button
                variant="outline"
                size="sm"
                iconOnly
                accessibilityLabel="Anterior"
                icon={<ChevronLeft className="size-icon-sm text-foreground" />}
                onPress={() => setDate(step(chosenView, current, -1))}
              />
              <Button
                variant="outline"
                size="sm"
                iconOnly
                accessibilityLabel="Próximo"
                icon={<ChevronRight className="size-icon-sm text-foreground" />}
                onPress={() => setDate(step(chosenView, current, 1))}
              />
            </View>
          </View>
          {options.length > 1 ? (
            <ButtonGroup
              size="sm"
              fullWidth
              accessibilityLabel="Visão do calendário"
              options={options}
              value={chosenView === 'week' ? 'day' : chosenView}
              onChange={(v) => setView(v as CalendarView)}
            />
          ) : null}
          {chosenView === 'month' ? (
            <>
              <View className="-mx-4">
                <MonthGrid date={current} events={events} onSelect={setDate} />
              </View>
              <DayList
                events={eventsOn(events, current)}
                onEventClick={onEventClick}
                empty={<Text className="text-sm text-muted-foreground">Nenhum evento neste dia.</Text>}
              />
              {onDateClick ? (
                <Button variant="outline" size="sm" onPress={() => onDateClick(current)}>
                  Novo evento neste dia
                </Button>
              ) : null}
            </>
          ) : null}
          {chosenView === 'week' || chosenView === 'day' ? (
            <>
              {chosenView === 'week' ? <WeekStrip date={current} onSelect={setDate} /> : null}
              <HoursGrid date={current} events={events} hours={hours} onEventClick={onEventClick} onDateClick={onDateClick} />
            </>
          ) : null}
          {chosenView === 'agenda' ? <Agenda date={current} events={events} onEventClick={onEventClick} /> : null}
        </View>
      </CardContent>
    </Card>
  )
}
