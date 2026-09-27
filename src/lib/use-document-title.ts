import { useEffect } from 'react'

/**
 * Define `document.title` no export web. Correção de execução da Tarefa F3: o título automático do
 * `NavigationContainer` do Expo Router (`options.title` de `<Stack.Screen>`) não chega a
 * atualizar `document.title` no modo de saída estática (`expo export --platform web`) usado por
 * este projeto; esta função corrige diretamente o estado real do DOM (axe: document-title).
 * No-op fora do web, onde `document` não existe.
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    if (typeof document !== 'undefined') document.title = title
  }, [title])
}
