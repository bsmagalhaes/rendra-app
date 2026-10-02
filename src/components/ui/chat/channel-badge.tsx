import type { ComponentType } from 'react'
import { Image, View, type ImageSourcePropType } from 'react-native'
import { Globe, Mail, MessageCircle, MessagesSquare, Smartphone } from 'lucide-react-native'
import { Badge, type BadgeTone } from '../badge'
import { cn } from '../../../lib/cn'
import type { ChatChannel } from './types'

type ChannelIcon = ComponentType<{ className?: string; testID?: string }>

/**
 * Canais do atendimento: nome, icone e tom. Sem logotipos: sao marcas de terceiros e ficam fora
 * do pacote; o app injeta as imagens por `channelLogos` (`ConversationList`). Sem a imagem, vale o icone.
 */
export const chatChannels: Record<ChatChannel, { label: string; icon: ChannelIcon; tone: BadgeTone }> = {
  whatsapp: { label: 'WhatsApp', icon: MessageCircle, tone: 'success' },
  'whatsapp-web': { label: 'WhatsApp Web', icon: MessageCircle, tone: 'info' },
  instagram: { label: 'Instagram', icon: MessagesSquare, tone: 'error' },
  facebook: { label: 'Facebook', icon: MessagesSquare, tone: 'info' },
  tiktok: { label: 'TikTok', icon: MessagesSquare, tone: 'neutral' },
  google: { label: 'Google Meu Negócio', icon: Globe, tone: 'info' },
  reclameaqui: { label: 'Reclame Aqui', icon: MessagesSquare, tone: 'success' },
  site: { label: 'Chat do site', icon: Globe, tone: 'primary' },
  email: { label: 'E-mail', icon: Mail, tone: 'neutral' },
  sms: { label: 'SMS', icon: Smartphone, tone: 'warning' },
}

export type ChannelLogos = Partial<Record<ChatChannel, ImageSourcePropType>>

/** Cor do nome do canal na lista. */
export const channelTextClass: Record<ChatChannel, string> = {
  whatsapp: 'text-success-soft-foreground',
  'whatsapp-web': 'text-info-soft-foreground',
  tiktok: 'text-foreground',
  google: 'text-info-soft-foreground',
  reclameaqui: 'text-success-soft-foreground',
  instagram: 'text-destructive-soft-foreground',
  facebook: 'text-info-soft-foreground',
  site: 'text-primary-text',
  email: 'text-muted-foreground',
  sms: 'text-warning-soft-foreground',
}

/** Selo redondo do canal sobre a foto do contato: a imagem injetada, ou o icone. */
export function ChannelMark({ channel, logos, id, className }: { channel: ChatChannel; logos?: ChannelLogos; id: string; className?: string }) {
  const logo = logos?.[channel]
  const Icon = chatChannels[channel].icon
  return (
    <View className={cn('size-6 items-center justify-center overflow-hidden rounded-full border-2 border-card bg-card', className)}>
      {logo ? (
        <Image testID={`channel-logo-${id}`} source={logo} resizeMode="cover" className="size-full" />
      ) : (
        <Icon testID={`channel-icone-${id}`} className="size-3 text-muted-foreground" />
      )}
    </View>
  )
}

export function ChannelBadge({ channel }: { channel: ChatChannel }) {
  const c = chatChannels[channel]
  const Icon = c.icon
  return (
    <Badge tone={c.tone} icon={<Icon className="size-icon-sm" />}>
      {c.label}
    </Badge>
  )
}
