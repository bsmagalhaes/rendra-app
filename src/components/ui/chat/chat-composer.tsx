import { useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Image, Pressable, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowLeft, EllipsisVertical, Film, FileText, ImagePlus, Mic, Paperclip, Search, Send, Smile, Trash2, X, Zap } from 'lucide-react-native'
import { Text } from '../../internal/text'
import { BottomSheet } from '../../internal/bottom-sheet'
import { ShellContext } from '../../app-shell/shell-context'
import { Button } from '../button'
import { Input } from '../input'
import type { ChatFile } from './types'
import { secs, sizeLabel } from '../../../lib/chat-format'
import { a11yPresets } from '../../../lib/a11y'
import { resolveCatalogCode } from '../../../catalog/components'
import { cn } from '../../../lib/cn'
import { usePlaceholderColor } from '../../../hooks/use-placeholder-color'

export interface QuickReply {
  id: string
  /** Nome curto na lista (ex.: "Saudação"). */
  title: string
  text: string
}

export interface ChatComposerProps {
  /** `files` inclui o audio gravado (tipo `audio/*`), com a duracao em segundos em `audioSeconds`. */
  onSend: (message: { text: string; files: ChatFile[]; audioSeconds?: number }) => void
  placeholder?: string
  disabled?: boolean
  /** Motivo de estar desativado, mostrado no lugar do campo (ex.: "Assuma a conversa"). */
  disabledHint?: string
  /** Acao mostrada junto do motivo (ex.: botao "Assumir atendimento"). */
  disabledAction?: ReactNode
  /** Mensagens rapidas cadastradas; a escolhida vai para o campo, para revisar antes de enviar. */
  quickReplies?: QuickReply[]
  /** Mensagem sendo respondida: aparece citada acima do campo. */
  quote?: { author?: string; text?: string } | null
  onCancelQuote?: () => void
  /** Mensagem sendo editada: o campo vem com o texto dela. */
  editing?: { id: string; text?: string } | null
  onCancelEdit?: () => void
  /** Escolher arquivos no aparelho (o app abre o seletor nativo). Sem ela, o item nao aparece. */
  onPickFiles?: () => Promise<ChatFile[]>
  /** Escolher imagem ou video no aparelho. Sem ela, o item nao aparece. */
  onPickMedia?: () => Promise<ChatFile[]>
  className?: string
}

const EMOJIS = ['😀', '😂', '😊', '😍', '🤔', '😅', '😉', '🙏', '👍', '👏', '🙌', '💪', '🎉', '✅', '❤️', '🔥', '👀', '🚀', '📎', '📅', '💬', '⏰', '📞', '🤝']

// Grade de 6 colunas (seis celulas de 44 px cabem na folha em 360 px).
const LINHAS_DE_EMOJI = [0, 6, 12, 18].map((i) => EMOJIS.slice(i, i + 6))

const MIN_HEIGHT = 48
const MAX_HEIGHT = 192

type Folha = 'menu' | 'emoji' | 'quick' | null

function SheetRow({ icon, label, onPress }: { icon: ReactNode; label: string; onPress: () => void }) {
  return (
    <Pressable {...a11yPresets.button} onPress={onPress} className="min-h-touch flex-row items-center gap-3 rounded-item px-3">
      {icon}
      <Text className="text-sm text-foreground">{label}</Text>
    </Pressable>
  )
}

function QuickReplyList({ items, onPick }: { items: QuickReply[]; onPick: (text: string) => void }) {
  const [q, setQ] = useState('')
  const term = q.trim().toLowerCase()
  const lista = term ? items.filter((i) => `${i.title} ${i.text}`.toLowerCase().includes(term)) : items
  return (
    <View className="gap-2">
      <Text weight="semibold" className="px-2 pt-1 text-xs text-foreground">
        Mensagens rápidas
      </Text>
      <Input icon={<Search className="text-muted-foreground" />} value={q} onChange={setQ} placeholder="Buscar mensagem" accessibilityLabel="Buscar mensagem rápida" />
      <View className="gap-1">
        {lista.map((i) => (
          <Pressable key={i.id} {...a11yPresets.button} onPress={() => onPick(i.text)} className="min-h-touch justify-center gap-1 rounded-item px-2 py-2">
            <Text weight="semibold" className="text-sm text-foreground">
              {i.title}
            </Text>
            <Text numberOfLines={2} className="text-xs text-muted-foreground">
              {i.text}
            </Text>
          </Pressable>
        ))}
        {!lista.length ? <Text className="px-2 py-4 text-center text-xs text-muted-foreground">Nenhuma mensagem com essa busca.</Text> : null}
      </View>
    </View>
  )
}

/**
 * Campo de mensagem do celular: campo que cresce com o texto, `Enviar` e `Mais ações da mensagem`,
 * que abre a folha com anexar arquivo, imagem ou video, emoji, mensagens rapidas e gravar audio.
 * Quem escolhe arquivo e midia e o app (`onPickFiles`, `onPickMedia`). A gravacao e simulada
 * (contador e aviso), como no design system web.
 */
export function ChatComposer({
  onSend,
  placeholder = 'Escreva uma mensagem',
  disabled,
  disabledHint,
  disabledAction,
  quickReplies,
  quote,
  onCancelQuote,
  editing,
  onCancelEdit,
  onPickFiles,
  onPickMedia,
  className,
}: ChatComposerProps) {
  const insets = useSafeAreaInsets()
  // Dentro do shell com barra inferior, ela ja e dona do inset inferior: somar de novo dobraria o respiro.
  const shell = useContext(ShellContext)
  const placeholderColor = usePlaceholderColor()
  const [text, setText] = useState(editing?.text ?? '')
  const [files, setFiles] = useState<ChatFile[]>([])
  const [height, setHeight] = useState(MIN_HEIGHT)
  const [focused, setFocused] = useState(false)
  // Cursor do campo; sem ele (nada tocado ainda) o emoji entra no fim do texto.
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null)
  const [folha, setFolha] = useState<Folha>(null)
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)

  // Editar: o campo recebe o texto da mensagem escolhida (ajuste durante a renderizacao, como no Drawer).
  const [editingAnterior, setEditingAnterior] = useState(editing)
  if (editing !== editingAnterior) {
    setEditingAnterior(editing)
    if (editing) setText(editing.text ?? '')
  }

  useEffect(() => {
    if (!recording) return
    const id = setInterval(() => setSeconds((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [recording])

  const vazio = !text.trim() && files.length === 0
  const send = () => {
    if (disabled || vazio) return
    onSend({ text: text.trim(), files })
    setText('')
    setFiles([])
    setHeight(MIN_HEIGHT)
    setSelection(null)
  }

  const pick = async (picker: () => Promise<ChatFile[]>) => {
    setFolha(null)
    try {
      const escolhidos = await picker()
      if (escolhidos.length) setFiles((f) => [...f, ...escolhidos])
    } catch {
      // Seletor cancelado ou sem permissao: nada a anexar.
    }
  }

  const insertEmoji = (emoji: string) => {
    const start = Math.min(selection?.start ?? text.length, text.length)
    const end = Math.min(selection?.end ?? text.length, text.length)
    setText(text.slice(0, start) + emoji + text.slice(end))
    const cursor = start + emoji.length
    setSelection({ start: cursor, end: cursor })
    setFolha(null)
  }
  const insertQuickReply = (t: string) => {
    setText((cur) => (cur.trim() ? `${cur.trimEnd()} ${t}` : t))
    setFolha(null)
  }

  const startRecording = () => {
    setFolha(null)
    setSeconds(0)
    setRecording(true)
  }
  const stopRecording = (keep: boolean) => {
    setRecording(false)
    if (keep && seconds > 0) {
      // Gravacao simulada: o arquivo nao tem conteudo; o app que grava de verdade troca esta parte.
      const audio: ChatFile = { name: `Áudio ${secs(seconds)}.webm`, uri: '', type: 'audio/webm', size: 0 }
      onSend({ text: '', files: [audio], audioSeconds: seconds })
    }
    setSeconds(0)
  }

  if (disabled && disabledHint) {
    return (
      <View
        testID="chat-composer"
        dataSet={{ rendra: resolveCatalogCode('ChatComposer') }}
        className={cn('items-center gap-3 border-t border-border bg-card p-4', className)}
      >
        <Text className="text-center text-sm text-muted-foreground">{disabledHint}</Text>
        {disabledAction}
      </View>
    )
  }

  const itens: { label: string; icon: ReactNode; run: () => void }[] = [
    ...(onPickFiles ? [{ label: 'Anexar arquivo', icon: <Paperclip className="size-icon-sm text-muted-foreground" />, run: () => void pick(onPickFiles) }] : []),
    ...(onPickMedia ? [{ label: 'Imagem ou vídeo', icon: <ImagePlus className="size-icon-sm text-muted-foreground" />, run: () => void pick(onPickMedia) }] : []),
    { label: 'Emoji', icon: <Smile className="size-icon-sm text-muted-foreground" />, run: () => setFolha('emoji') },
    ...(quickReplies?.length ? [{ label: 'Mensagens rápidas', icon: <Zap className="size-icon-sm text-muted-foreground" />, run: () => setFolha('quick') }] : []),
    { label: 'Gravar áudio', icon: <Mic className="size-icon-sm text-muted-foreground" />, run: startRecording },
  ]

  return (
    <View
      testID="chat-composer"
      dataSet={{ rendra: resolveCatalogCode('ChatComposer') }}
      className={cn('gap-2 border-t border-border bg-card px-3 pt-3', className)}
      style={{ paddingBottom: shell?.layout.bottomNav ? 12 : Math.max(12, insets.bottom) }}
    >
      {quote || editing ? (
        <View className="flex-row items-start gap-2 rounded-block border-l-4 border-primary bg-muted pl-3">
          <View className="min-w-0 flex-1 py-2">
            <Text weight="semibold" className="text-xs text-foreground">
              {editing ? 'Editando mensagem' : `Respondendo a ${quote?.author ?? 'mensagem'}`}
            </Text>
            {!editing && quote?.text ? (
              <Text numberOfLines={2} className="text-xs text-muted-foreground">
                {quote.text}
              </Text>
            ) : null}
          </View>
          <Pressable
            {...a11yPresets.button}
            accessibilityLabel={editing ? 'Cancelar edição' : 'Cancelar resposta'}
            onPress={() => {
              if (editing) {
                setText('')
                onCancelEdit?.()
              } else onCancelQuote?.()
            }}
            className="size-touch shrink-0 items-center justify-center rounded-item"
          >
            <X className="size-icon-sm text-muted-foreground" />
          </Pressable>
        </View>
      ) : null}
      {files.length > 0 ? (
        <View {...a11yPresets.list} accessibilityLabel="Anexos" className="flex-row flex-wrap gap-2">
          {files.map((f, i) => (
            <View
              key={`${f.name}-${i}`}
              {...a11yPresets.listitem}
              className="max-w-full flex-row items-center gap-2 rounded-item border border-border bg-muted pl-1"
            >
              {f.type?.startsWith('image/') ? (
                <Image source={{ uri: f.uri }} accessibilityIgnoresInvertColors className="size-8 rounded-item" />
              ) : f.type?.startsWith('video/') ? (
                <Film className="size-icon-sm shrink-0 text-muted-foreground" />
              ) : (
                <FileText className="size-icon-sm shrink-0 text-muted-foreground" />
              )}
              <Text numberOfLines={1} className="shrink text-xs text-foreground">
                {f.name}
              </Text>
              {f.size != null ? <Text className="text-xs text-muted-foreground">{sizeLabel(f.size)}</Text> : null}
              <Pressable
                {...a11yPresets.button}
                accessibilityLabel={`Remover ${f.name}`}
                onPress={() => setFiles((l) => l.filter((_, j) => j !== i))}
                className="size-touch shrink-0 items-center justify-center rounded-item"
              >
                <X className="size-3 text-muted-foreground" />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
      <View className="flex-row items-end gap-1">
        {recording ? (
          <View
            {...a11yPresets.status}
            accessibilityLiveRegion="polite"
            className="h-control-md min-w-0 flex-1 flex-row items-center gap-3 rounded-control border border-destructive bg-destructive-soft px-3"
          >
            <View className="size-3 shrink-0 rounded-full bg-destructive" />
            <Text weight="semibold" className="shrink-0 text-sm text-destructive-soft-foreground">
              {secs(seconds)}
            </Text>
            <Text className="text-xs text-destructive-soft-foreground">Gravando áudio</Text>
          </View>
        ) : (
          <TextInput
            testID="chat-composer-input"
            multiline
            value={text}
            onChangeText={setText}
            editable={!disabled}
            placeholder={placeholder}
            placeholderTextColor={placeholderColor}
            accessibilityLabel="Mensagem"
            onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onContentSizeChange={(e) => setHeight(Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, e.nativeEvent.contentSize.height)))}
            style={{ height }}
            className={cn(
              'min-w-0 flex-1 rounded-control border border-input bg-field px-3 py-2 text-base text-foreground',
              focused && 'border-ring bg-card',
              disabled && 'opacity-60',
            )}
          />
        )}
        {recording ? (
          <>
            <Button variant="ghost" iconOnly accessibilityLabel="Cancelar gravação" icon={<Trash2 className="text-foreground" />} onPress={() => stopRecording(false)} />
            <Button iconOnly accessibilityLabel="Enviar áudio" icon={<Send className="text-primary-foreground" />} onPress={() => stopRecording(true)} />
          </>
        ) : (
          <>
            <Button iconOnly accessibilityLabel="Enviar" icon={<Send className="text-primary-foreground" />} disabled={disabled || vazio} onPress={send} />
            <Button
              variant="ghost"
              iconOnly
              accessibilityLabel="Mais ações da mensagem"
              icon={<EllipsisVertical className="text-foreground" />}
              disabled={disabled}
              onPress={() => setFolha('menu')}
            />
          </>
        )}
      </View>
      <BottomSheet open={folha !== null} onOpenChange={(aberto) => !aberto && setFolha(null)} accessibilityLabel="Ações da mensagem">
        <View className="gap-1 p-1">
          {folha === 'menu' ? itens.map((a) => <SheetRow key={a.label} icon={a.icon} label={a.label} onPress={a.run} />) : null}
          {folha && folha !== 'menu' ? <SheetRow icon={<ArrowLeft className="size-icon-sm text-foreground" />} label="Voltar" onPress={() => setFolha('menu')} /> : null}
          {folha === 'emoji' ? (
            <View {...a11yPresets.group} accessibilityLabel="Emojis">
              {LINHAS_DE_EMOJI.map((linha) => (
                <View key={linha[0]} className="flex-row justify-between">
                  {linha.map((em) => (
                    <Pressable
                      key={em}
                      {...a11yPresets.button}
                      accessibilityLabel={`Inserir ${em}`}
                      onPress={() => insertEmoji(em)}
                      className="size-touch items-center justify-center rounded-item"
                    >
                      <Text className="text-xl">{em}</Text>
                    </Pressable>
                  ))}
                </View>
              ))}
            </View>
          ) : null}
          {folha === 'quick' && quickReplies ? <QuickReplyList items={quickReplies} onPick={insertQuickReply} /> : null}
        </View>
      </BottomSheet>
    </View>
  )
}
