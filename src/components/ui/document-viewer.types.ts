/**
 * Tipos do `DocumentViewer` (F3), compartilhados pelo arquivo nativo (`document-viewer.tsx`, com o
 * WebView no iOS) e pelo do navegador (`document-viewer.web.tsx`, so o link para abrir fora).
 */
export interface DocumentViewerProps {
  /** Endereco do PDF. `null` mostra o estado vazio. */
  url: string | null
  /** Nome do documento: rotulo do grupo e texto do painel de abrir fora. */
  title: string
  className?: string
  emptyTitle?: string
  emptyDescription?: string
  loadingLabel?: string
  errorTitle?: string
  errorDescription?: string
  /** Texto do botao que abre o PDF fora do app. Padrao: "Abrir no aplicativo de PDF". */
  openLabel?: string
}
