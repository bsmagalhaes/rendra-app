/**
 * Tipos do `RichTextEditor` (F3), compartilhados pelo arquivo nativo (`rich-text-editor.tsx`,
 * com o tentap) e pelo do navegador (`rich-text-editor.web.tsx`, so `Textarea`). Ficam num terceiro
 * arquivo para o `.d.ts` publicado valer para os dois e para o fallback web nunca importar o nativo.
 */

export type RichTextEditorMinHeight = 'sm' | 'md' | 'lg'

export interface RichTextEditorProps {
  /** Conteudo em HTML (controlado). */
  value?: string
  defaultValue?: string
  onChange?: (html: string) => void
  placeholder?: string
  /**
   * Escolhe e envia a imagem, devolvendo o endereco publico (o app abre o seletor nativo). Sem ela,
   * o botao "Inserir imagem" nao aparece. Mudanca de contrato frente ao web: la a funcao recebe um
   * `File` do DOM; no celular quem escolhe e o app.
   */
  onImageUpload?: () => Promise<string | null | undefined>
  /** Altura da area de texto: `sm` 96 px, `md` 192 px, `lg` 256 px. */
  minHeight?: RichTextEditorMinHeight
  invalid?: boolean
  disabled?: boolean
  accessibilityLabel?: string
  className?: string
}
