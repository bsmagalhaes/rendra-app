import { View } from 'react-native'
import { EmptyState } from './empty-state'
import { DocumentOpenPanel } from './document-viewer-fallback'
import type { DocumentViewerProps } from './document-viewer.types'
import { a11yPresets } from '../../lib/a11y'
import { cn } from '../../lib/cn'
import { resolveCatalogCode } from '../../catalog/components'

export type { DocumentViewerProps } from './document-viewer.types'

/**
 * `DocumentViewer` no navegador (export web, vitrine, Playwright): so o painel de abrir fora. O
 * WebView do celular nao existe no navegador. Este arquivo NUNCA importa `react-native-webview`
 * (o `verify:pack` confere o `dist-lib` e o bundle exportado).
 */
export function DocumentViewer({
  url,
  title,
  className,
  emptyTitle = 'Nenhum documento selecionado',
  emptyDescription = 'Escolha um arquivo PDF para visualizar aqui.',
  openLabel,
  errorTitle,
  errorDescription,
}: DocumentViewerProps) {
  return (
    <View
      {...a11yPresets.group}
      accessibilityLabel={title}
      dataSet={{ rendra: resolveCatalogCode('DocumentViewer') }}
      className={cn('min-h-chart-md rounded-surface border border-border bg-card', className)}
    >
      {url ? (
        <DocumentOpenPanel url={url} title={title} openLabel={openLabel} errorTitle={errorTitle} errorDescription={errorDescription} />
      ) : (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      )}
    </View>
  )
}
