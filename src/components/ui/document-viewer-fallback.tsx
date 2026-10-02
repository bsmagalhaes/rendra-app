import { useState } from 'react'
import { Linking, View } from 'react-native'
import { ExternalLink, FileText } from 'lucide-react-native'
import { Text } from '../internal/text'
import { Button } from './button'
import { EmptyState } from './empty-state'
import type { DocumentViewerProps } from './document-viewer.types'

export const DEFAULT_OPEN_LABEL = 'Abrir no aplicativo de PDF'
export const DEFAULT_ERROR_TITLE = 'Não foi possível abrir o documento'
export const DEFAULT_ERROR_DESCRIPTION = 'O arquivo pode estar indisponível ou corrompido.'

type Props = Pick<DocumentViewerProps, 'url' | 'title' | 'openLabel' | 'errorTitle' | 'errorDescription'> & {
  /** Mostra direto o erro (o WebView do iOS falhou ao carregar). */
  failed?: boolean
}

/**
 * Painel de "abrir fora" do `DocumentViewer`: no Android e no navegador nao ha como desenhar o PDF
 * dentro do app (o WebView do Android nao renderiza PDF), entao o documento abre no aplicativo de
 * PDF do aparelho. Tambem e o painel de erro do iOS. Nao importa `react-native-webview`: e o que o
 * arquivo `.web` reaproveita para o bundle web nao carregar o WebView.
 */
export function DocumentOpenPanel({
  url,
  title,
  openLabel = DEFAULT_OPEN_LABEL,
  errorTitle = DEFAULT_ERROR_TITLE,
  errorDescription = DEFAULT_ERROR_DESCRIPTION,
  failed = false,
}: Props) {
  const [openFailed, setOpenFailed] = useState(false)
  const abrir = () => {
    if (!url) return
    Linking.openURL(url).then(
      () => setOpenFailed(false),
      () => setOpenFailed(true),
    )
  }
  const botao = (
    <Button variant="outline" icon={<ExternalLink className="size-icon-sm text-foreground" />} onPress={abrir}>
      {openLabel}
    </Button>
  )
  if (failed || openFailed) {
    return <EmptyState type="error" title={errorTitle} description={errorDescription} actions={botao} />
  }
  return (
    <View className="flex-1 items-center justify-center gap-4 p-6">
      <View className="size-16 items-center justify-center rounded-full bg-primary-soft">
        <FileText className="size-icon-lg text-primary-soft-foreground" />
      </View>
      <Text weight="semibold" className="text-center text-base text-foreground">
        {title}
      </Text>
      {botao}
    </View>
  )
}
