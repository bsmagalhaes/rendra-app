import { format, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/** Formatacao de texto do Chat (F3), as mesmas funcoes do design system web. */

export const hhmm = (d: Date) => format(d, 'HH:mm')

/** Duracao em segundos como `m:ss`. */
export const secs = (n: number) => `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`

/** `HH:mm` se for hoje; senao `dd/MM/yyyy HH:mm`. */
export const stamp = (d: Date) => (isToday(d) ? hhmm(d) : format(d, 'dd/MM/yyyy HH:mm'))

export const dayLabel = (d: Date) =>
  isToday(d) ? 'Hoje' : isYesterday(d) ? 'Ontem' : format(d, "d 'de' MMMM", { locale: ptBR })

export const sizeLabel = (n?: number) =>
  n == null
    ? ''
    : n < 1024 * 1024
      ? `${Math.max(1, Math.round(n / 1024))} KB`
      : `${(n / 1024 / 1024).toFixed(1).replace('.', ',')} MB`

/** Tempo de espera: `N min` ou `H h M min`. */
export const waited = (since: Date, now = new Date()) => {
  const min = Math.max(0, Math.round((now.getTime() - since.getTime()) / 60000))
  return min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${min % 60} min`
}
