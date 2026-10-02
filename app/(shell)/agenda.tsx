import { useState } from 'react'
import { ScrollView, View } from 'react-native'
import { format, setHours, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Text } from '../../src/components/internal/text'
import { useBrand } from '../../src/brand'
import { PageHeader } from '../../src/components/layout'
import { ActionBar, Calendar, DatePicker, Drawer, Field, Input, toast, type CalendarEvent } from '../../src/components/ui'
import { adicionarEvento, useEventos } from '../../src/demo/planning-store'
import { useDocumentTitle } from '../../src/lib/use-document-title'
import { referencia } from '../../src/mocks/planning'

const maiuscula = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1)

function horario(evento: CalendarEvent) {
  if (evento.allDay) return 'Dia inteiro'
  const inicio = format(evento.start, 'HH:mm')
  return evento.end ? `${inicio} às ${format(evento.end, 'HH:mm')}` : inicio
}

/**
 * Agenda da demonstração: o `Calendar` (mês, dia e agenda) com os eventos do `planning-store`.
 * Tocar num evento abre o detalhe num `Drawer`, irmão da rolagem; "Novo evento neste dia" abre outro
 * `Drawer` com título, data e hora, e local. A data inicial é fixa
 * (outubro de 2026), como na vitrine, para a demo não depender do "hoje" do navegador.
 */
export default function Agenda() {
  const { brand } = useBrand()
  useDocumentTitle(`Agenda · ${brand.productName}`)
  const eventos = useEventos()
  const [aberto, setAberto] = useState<CalendarEvent | null>(null)
  const [criando, setCriando] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [quando, setQuando] = useState<Date | null>(null)
  const [local, setLocal] = useState('')
  const [erro, setErro] = useState<string | undefined>()

  function abrirNovo(dia: Date) {
    setTitulo('')
    setLocal('')
    setErro(undefined)
    setQuando(setHours(startOfDay(dia), 9))
    setCriando(true)
  }

  function salvar() {
    if (!titulo.trim() || !quando) {
      setErro('Informe o título do evento.')
      return
    }
    adicionarEvento({ title: titulo.trim(), start: quando, location: local.trim() || undefined, tone: 'primary' })
    setCriando(false)
    toast.success('Evento criado')
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView tabIndex={0} className="flex-1" contentContainerClassName="gap-6 p-4" keyboardShouldPersistTaps="handled">
        <PageHeader title="Agenda" description="Veja os compromissos do mês, do dia ou em lista." />
        <Calendar events={[...eventos]} defaultDate={referencia} onEventClick={setAberto} onDateClick={abrirNovo} />
      </ScrollView>

      <Drawer
        open={aberto !== null}
        onOpenChange={(open) => {
          if (!open) setAberto(null)
        }}
        title={aberto?.title ?? ''}
        description={aberto ? maiuscula(format(aberto.start, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })) : undefined}
        testID="evento-detalhe"
      >
        {aberto ? (
          <View className="gap-4 p-4">
            <Text className="text-sm text-foreground">{horario(aberto)}</Text>
            {aberto.location ? <Text className="text-sm text-foreground">{aberto.location}</Text> : null}
            {aberto.description ? <Text className="text-sm text-muted-foreground">{aberto.description}</Text> : null}
          </View>
        ) : null}
      </Drawer>

      <Drawer
        open={criando}
        onOpenChange={setCriando}
        title="Novo evento"
        description="Informe o título, a data e a hora, e o local."
        testID="evento-novo"
        footer={
          <ActionBar
            sticky={false}
            primary={{ label: 'Salvar', onPress: salvar }}
            cancel={{ label: 'Cancelar', onPress: () => setCriando(false) }}
          />
        }
      >
        <View className="gap-4 p-4">
          <Field label="Título" required error={erro}>
            <Input value={titulo} onChange={setTitulo} accessibilityLabel="Título do evento" />
          </Field>
          <Field label="Data e hora">
            <DatePicker time value={quando} onChange={setQuando} />
          </Field>
          <Field label="Local">
            <Input value={local} onChange={setLocal} accessibilityLabel="Local do evento" />
          </Field>
        </View>
      </Drawer>
    </View>
  )
}
