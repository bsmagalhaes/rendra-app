import { useState } from 'react'
import { Platform, View } from 'react-native'
import { WebView } from 'react-native-webview'
import { Text } from '../internal/text'
import { EmptyState } from './empty-state'
import { Spinner } from './spinner'
import { DocumentOpenPanel } from './document-viewer-fallback'
import type { DocumentViewerProps } from './document-viewer.types'
import { a11yPresets } from '../../lib/a11y'
import { cn } from '../../lib/cn'
import { resolveCatalogCode } from '../../catalog/components'

export type { DocumentViewerProps } from './document-viewer.types'

/**
 * `DocumentViewer` do celular. No iOS o WebView (WKWebView) desenha o PDF dentro do app, sem zoom
 * nem paginacao proprios (o WKWebView ja resolve). No Android o WebView nao renderiza PDF, entao o
 * painel abre o arquivo no aplicativo de PDF do aparelho. No navegador o Metro troca este arquivo
 * por `document-viewer.web.tsx`. Vive no subcaminho `@rendra-ui/app/document-viewer`.
 */
export function DocumentViewer({
  url,
  title,
  className,
  emptyTitle = 'Nenhum documento selecionado',
  emptyDescription = 'Escolha um arquivo PDF para visualizar aqui.',
  loadingLabel = 'Carregando documento...',
  openLabel,
  errorTitle,
  errorDescription,
}: DocumentViewerProps) {
  const [estado, setEstado] = useState<'carregando' | 'pronto' | 'erro'>('carregando')
  // Outro documento volta ao carregamento (ajuste durante a renderizacao, como no Drawer).
  const [urlAnterior, setUrlAnterior] = useState(url)
  if (url !== urlAnterior) {
    setUrlAnterior(url)
    setEstado('carregando')
  }

  let corpo
  if (!url) {
    corpo = <EmptyState title={emptyTitle} description={emptyDescription} />
  } else if (Platform.OS !== 'ios') {
    corpo = <DocumentOpenPanel url={url} title={title} openLabel={openLabel} errorTitle={errorTitle} errorDescription={errorDescription} />
  } else if (estado === 'erro') {
    corpo = <DocumentOpenPanel failed url={url} title={title} openLabel={openLabel} errorTitle={errorTitle} errorDescription={errorDescription} />
  } else {
    corpo = (
      <>
        <WebView
          source={{ uri: url }}
          onLoadEnd={() => setEstado((atual) => (atual === 'erro' ? atual : 'pronto'))}
          onError={() => setEstado('erro')}
          onHttpError={() => setEstado('erro')}
        />
        {estado === 'carregando' ? (
          <View {...a11yPresets.status} className="absolute inset-0 items-center justify-center gap-3 bg-card">
            <Spinner size="lg" className="text-primary" />
            <Text className="text-sm text-muted-foreground">{loadingLabel}</Text>
          </View>
        ) : null}
      </>
    )
  }

  return (
    <View
      {...a11yPresets.group}
      accessibilityLabel={title}
      dataSet={{ rendra: resolveCatalogCode('DocumentViewer') }}
      className={cn('min-h-chart-md overflow-hidden rounded-surface border border-border bg-card', className)}
    >
      {corpo}
    </View>
  )
}
