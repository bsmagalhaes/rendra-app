import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { FlatList, Image, Linking, Pressable, View } from 'react-native'
import { Bot, Check, CheckCheck, Download, FileText, MoreHorizontal, Music, Pencil, Reply, Trash2, Video } from 'lucide-react-native'
import { format, isSameDay } from 'date-fns'
import { Text } from '../../internal/text'
import { Avatar } from '../avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from '../dropdown-menu'
import type { ChatAttachment, ChatMessage } from './types'
import { dayLabel, hhmm, secs, sizeLabel } from '../../../lib/chat-format'
import { a11yPresets } from '../../../lib/a11y'
import { resolveCatalogCode } from '../../../catalog/components'
import { cn } from '../../../lib/cn'

export interface ChatThreadProps {
  messages: ChatMessage[]
  /** Responder (citar) uma mensagem: a tela mostra a citacao no campo de mensagem. */
  onReply?: (message: ChatMessage) => void
  /** Reagir com emoji (tocar de novo na mesma reacao a remove). */
  onReact?: (message: ChatMessage, emoji: string) => void
  /** Editar uma mensagem do atendente. */
  onEdit?: (message: ChatMessage) => void
  /** Excluir uma mensagem do atendente (continua no chat, riscada). */
  onDelete?: (message: ChatMessage) => void
  /**
   * Reprodutor proprio para um anexo (audio e video nao tem player no pacote). Sem ela, o anexo
   * vira um chip com nome, tamanho e "Baixar". `mine` diz se a mensagem e do atendente.
   */
  renderAttachment?: (file: ChatAttachment, mine: boolean) => ReactNode
  className?: string
}

const REACTIONS = ['👍', '❤️', '😂', '😮', '🙏', '✅']

type Row = { kind: 'day'; key: string; label: string } | { kind: 'message'; key: string; message: ChatMessage }

function AttachmentChip({ file, mine, renderAttachment }: { file: ChatAttachment; mine: boolean; renderAttachment?: ChatThreadProps['renderAttachment'] }) {
  if (renderAttachment) return <>{renderAttachment(file, mine)}</>
  const tipo = file.type ?? ''
  const baixar = file.url ? (
    <Pressable
      {...a11yPresets.button}
      accessibilityLabel={`Baixar ${file.name}`}
      onPress={() => void Linking.openURL(file.url as string)}
      className="size-touch shrink-0 items-center justify-center rounded-item"
    >
      <Download className="size-icon-sm text-foreground" />
    </Pressable>
  ) : null
  if (file.url && tipo.startsWith('image/')) {
    return (
      <View className="gap-1">
        <Image source={{ uri: file.url }} resizeMode="cover" accessibilityLabel={file.name} className="h-chart-sm w-full rounded-item" />
        <Pressable
          {...a11yPresets.button}
          accessibilityLabel={`Baixar ${file.name}`}
          onPress={() => void Linking.openURL(file.url as string)}
          className="min-h-touch flex-row items-center gap-1 self-start"
        >
          <Download className={cn('size-icon-sm', mine ? 'text-primary-foreground' : 'text-foreground')} />
          <Text className={cn('text-xs', mine ? 'text-primary-foreground' : 'text-foreground')}>Baixar</Text>
        </Pressable>
      </View>
    )
  }
  const Icone = tipo.startsWith('audio/') ? Music : tipo.startsWith('video/') ? Video : FileText
  const detalhe = file.duration != null ? secs(file.duration) : sizeLabel(file.size)
  return (
    <View className={cn('min-w-0 flex-row items-center gap-2 rounded-item pl-2', mine ? 'border border-primary-foreground/60' : 'bg-muted')}>
      <Icone className={cn('size-icon-sm shrink-0', mine ? 'text-primary-foreground' : 'text-foreground')} />
      <Text numberOfLines={1} className={cn('min-w-0 flex-1 text-xs', mine ? 'text-primary-foreground' : 'text-foreground')}>
        {file.name}
      </Text>
      {detalhe ? <Text className={cn('shrink-0 text-xs', mine ? 'text-primary-foreground' : 'text-muted-foreground')}>{detalhe}</Text> : null}
      {baixar}
    </View>
  )
}

function Bubble({
  m,
  flash,
  actionsOn,
  onOpenMenu,
  onGoTo,
  onReact,
  renderAttachment,
}: {
  m: ChatMessage
  flash: boolean
  actionsOn: boolean
  onOpenMenu: (m: ChatMessage) => void
  onGoTo: (id: string) => void
  onReact?: ChatThreadProps['onReact']
  renderAttachment?: ChatThreadProps['renderAttachment']
}) {
  const mine = m.from === 'agent'
  const bot = m.from === 'bot'
  const who = m.author ?? (bot ? 'Assistente virtual' : undefined)
  const sobrePrimaria = mine && !m.deleted
  const cor = sobrePrimaria ? 'text-primary-foreground' : m.deleted ? 'text-destructive-soft-foreground' : 'text-muted-foreground'
  const reacoes = m.reactions ?? []
  const unicas = [...new Set(reacoes)]
  const citacao = m.replyTo
  const classeCitacao = cn(
    'min-h-0 justify-center rounded-block border-l-4 px-2 py-1',
    sobrePrimaria ? 'border-primary-foreground' : 'border-primary bg-muted',
  )
  const corpoCitacao = citacao ? (
    <>
      {citacao.author ? (
        <Text weight="semibold" className={cn('text-xs', sobrePrimaria ? 'text-primary-foreground' : 'text-foreground')}>
          {citacao.author}
        </Text>
      ) : null}
      <Text numberOfLines={2} className={cn('text-xs', sobrePrimaria ? 'text-primary-foreground' : 'text-muted-foreground')}>
        {citacao.text}
      </Text>
    </>
  ) : null

  return (
    <View testID={`message-row-${m.id}`} className={cn('max-w-full gap-1', mine ? 'items-end self-end' : 'items-start self-start')}>
      <Pressable accessible={false} onLongPress={actionsOn ? () => onOpenMenu(m) : undefined} className="max-w-full">
        <View
          testID={`message-bubble-${m.id}`}
          className={cn(
            'min-w-0 gap-2 rounded-surface border px-3 py-2',
            // Destaque da citacao por borda e sombra da mesma familia (licao 1: nunca `ring` condicional).
            flash ? 'border-ring shadow-md' : cn('shadow-sm', sobrePrimaria || m.deleted ? 'border-transparent' : 'border-border'),
            sobrePrimaria && 'bg-primary',
            bot && !m.deleted && 'border-dashed bg-card',
            m.from === 'contact' && !m.deleted && 'bg-card',
            m.deleted && 'bg-destructive-soft',
          )}
        >
          <View className={cn('flex-row items-center gap-2', sobrePrimaria ? 'flex-row-reverse' : 'flex-row')}>
            {bot ? <Bot className={cn('size-icon-sm', cor)} /> : <Avatar name={who ?? '?'} src={m.avatar} size="sm" />}
            {who ? (
              <Text weight="semibold" numberOfLines={1} className={cn('shrink text-xs', cor)}>
                {who}
              </Text>
            ) : null}
            <Text numberOfLines={1} className={cn('flex-auto text-xs', cor, sobrePrimaria ? 'text-left' : 'text-right')}>
              {format(m.time, 'dd/MM/yyyy HH:mm')}
            </Text>
            {actionsOn ? (
              <Pressable
                {...a11yPresets.button}
                accessibilityLabel="Ações da mensagem"
                onPress={() => onOpenMenu(m)}
                className="-my-2 size-touch shrink-0 items-center justify-center rounded-item"
              >
                <MoreHorizontal className={cn('size-icon-sm', cor)} />
              </Pressable>
            ) : null}
          </View>
          {citacao ? (
            citacao.id ? (
              <Pressable
                {...a11yPresets.button}
                accessibilityLabel={`Ir para a mensagem citada de ${citacao.author ?? 'contato'}`}
                onPress={() => onGoTo(citacao.id as string)}
                className={cn(classeCitacao, 'min-h-touch')}
              >
                {corpoCitacao}
              </Pressable>
            ) : (
              <View className={classeCitacao}>{corpoCitacao}</View>
            )
          ) : null}
          {m.attachments?.length && !m.deleted ? (
            <View className="gap-2">
              {m.attachments.map((f, i) => (
                <AttachmentChip key={`${f.name}-${i}`} file={f} mine={mine} renderAttachment={renderAttachment} />
              ))}
            </View>
          ) : null}
          {m.deleted ? (
            <Text className={cn('text-sm line-through', cor)}>{m.text || 'Anexo'}</Text>
          ) : m.text ? (
            <Text className={cn('text-sm', mine ? 'text-primary-foreground' : 'text-foreground')}>{m.text}</Text>
          ) : null}
          {m.editedFrom && !m.deleted ? (
            <Text className={cn('border-t pt-1 text-xs', mine ? 'border-primary-foreground/30 text-primary-foreground' : 'border-border text-muted-foreground')}>
              {'Editada. Antes: '}
              <Text className="text-xs line-through">{m.editedFrom}</Text>
            </Text>
          ) : null}
          {m.deleted || (mine && m.status) ? (
            <View className="flex-row items-center justify-end gap-1">
              {m.deleted ? (
                <Text weight="semibold" className={cn('text-xs', cor)}>
                  Mensagem excluída
                </Text>
              ) : null}
              {mine && !m.deleted && m.status === 'sent' ? (
                <View accessible accessibilityLabel="Enviada" {...a11yPresets.img}>
                  <Check className="size-3 text-primary-foreground" />
                </View>
              ) : null}
              {mine && !m.deleted && m.status && m.status !== 'sent' ? (
                <View accessible accessibilityLabel={m.status === 'read' ? 'Lida' : 'Entregue'} {...a11yPresets.img}>
                  <CheckCheck className="size-3 text-primary-foreground" />
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      </Pressable>
      {unicas.length > 0 ? (
        <View className="flex-row flex-wrap gap-1 px-2" accessibilityLabel="Reações">
          {unicas.map((e) => {
            const n = reacoes.filter((x) => x === e).length
            return (
              <Pressable
                key={e}
                {...a11yPresets.button}
                accessibilityLabel={`Reação ${e}. Remover`}
                onPress={() => onReact?.(m, e)}
                className="min-h-touch min-w-touch flex-row items-center justify-center gap-1 rounded-full border border-border bg-card px-3 shadow-sm"
              >
                <Text className="text-xs">{e}</Text>
                {n > 1 ? <Text className="text-xs text-foreground">{String(n)}</Text> : null}
              </Pressable>
            )
          })}
        </View>
      ) : null}
    </View>
  )
}

export function ChatThread({ messages, onReply, onReact, onEdit, onDelete, renderAttachment, className }: ChatThreadProps) {
  const listRef = useRef<FlatList<Row>>(null)
  const colado = useRef(true)
  const [menu, setMenu] = useState<ChatMessage | null>(null)
  const [menuAberto, setMenuAberto] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)
  const actionsOn = Boolean(onReply || onReact || onEdit || onDelete)

  const rows = useMemo<Row[]>(() => {
    const out: Row[] = []
    let anterior: Date | null = null
    for (const m of messages) {
      if (!anterior || !isSameDay(anterior, m.time)) {
        out.push({ kind: 'day', key: `day-${m.id}`, label: dayLabel(m.time) })
        anterior = m.time
      }
      out.push({ kind: 'message', key: m.id, message: m })
    }
    return out
  }, [messages])

  // Mensagem nova: volta a acompanhar o fim. Tocar e arrastar para cima para de acompanhar.
  useEffect(() => {
    colado.current = true
  }, [messages.length])

  useEffect(() => {
    if (!flash) return
    const id = setTimeout(() => setFlash(null), 1600)
    return () => clearTimeout(id)
  }, [flash])

  const goTo = (id: string) => {
    const index = rows.findIndex((r) => r.kind === 'message' && r.message.id === id)
    if (index < 0) return
    colado.current = false
    listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 })
    setFlash(id)
  }

  const abrirMenu = (m: ChatMessage) => {
    setMenu(m)
    setMenuAberto(true)
  }
  const fecharMenu = () => setMenuAberto(false)
  const dela = menu ? menu.from === 'agent' && !menu.deleted : false

  return (
    <View
      testID="chat-thread"
      {...a11yPresets.log}
      accessibilityLiveRegion="polite"
      accessibilityLabel="Mensagens da conversa"
      dataSet={{ rendra: resolveCatalogCode('ChatThread') }}
      className={cn('min-h-0 flex-1 bg-muted', className)}
    >
      <FlatList
        ref={listRef}
        testID="chat-thread-list"
        data={rows}
        keyExtractor={(r) => r.key}
        initialNumToRender={20}
        contentContainerClassName="gap-3 p-4"
        onContentSizeChange={() => {
          if (colado.current) listRef.current?.scrollToEnd({ animated: false })
        }}
        onScrollBeginDrag={() => {
          colado.current = false
        }}
        onScrollToIndexFailed={({ averageItemLength, index }) => {
          listRef.current?.scrollToOffset({ offset: averageItemLength * index, animated: false })
          setTimeout(() => listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 }), 50)
        }}
        renderItem={({ item }) => {
          if (item.kind === 'day') {
            return (
              <View className="flex-row items-center gap-3">
                <View className="h-px flex-1 bg-border" />
                <Text className="text-xs text-muted-foreground">{item.label}</Text>
                <View className="h-px flex-1 bg-border" />
              </View>
            )
          }
          const m = item.message
          if (m.from === 'system') {
            return <Text className="self-center text-center text-xs text-muted-foreground">{`${m.text ?? ''} · ${hhmm(m.time)}`}</Text>
          }
          return (
            <Bubble
              m={m}
              flash={flash === m.id}
              actionsOn={actionsOn}
              onOpenMenu={abrirMenu}
              onGoTo={goTo}
              onReact={onReact}
              renderAttachment={renderAttachment}
            />
          )
        }}
      />
      {actionsOn ? (
        <DropdownMenu open={menuAberto} onOpenChange={(aberto) => !aberto && fecharMenu()}>
          <DropdownMenuContent accessibilityLabel="Ações da mensagem">
            {menu && onReact ? (
              <>
                <DropdownMenuLabel>Reagir</DropdownMenuLabel>
                <View className="flex-row justify-between px-1">
                  {REACTIONS.map((e) => (
                    <Pressable
                      key={e}
                      {...a11yPresets.menuitem}
                      accessibilityLabel={`Reagir com ${e}`}
                      onPress={() => {
                        onReact(menu, e)
                        fecharMenu()
                      }}
                      className="size-touch items-center justify-center rounded-item"
                    >
                      <Text className="text-lg">{e}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : null}
            {menu && onReply ? (
              <DropdownMenuItem icon={<Reply className="size-icon-sm text-muted-foreground" />} onSelect={() => onReply(menu)}>
                Responder
              </DropdownMenuItem>
            ) : null}
            {menu && dela && onEdit ? (
              <DropdownMenuItem icon={<Pencil className="size-icon-sm text-muted-foreground" />} onSelect={() => onEdit(menu)}>
                Editar
              </DropdownMenuItem>
            ) : null}
            {menu && dela && onDelete ? (
              <DropdownMenuItem destructive icon={<Trash2 className="size-icon-sm text-destructive-soft-foreground" />} onSelect={() => onDelete(menu)}>
                Excluir
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </View>
  )
}
