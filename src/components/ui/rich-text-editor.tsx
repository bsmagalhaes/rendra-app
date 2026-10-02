import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ScrollView, View } from 'react-native'
import {
  Bold,
  Code,
  FileCode,
  Heading1,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
  Eye,
} from 'lucide-react-native'
import { RichText, TenTapStartKit, useBridgeState, useEditorBridge, type EditorBridge } from '@10play/tentap-editor'
import { Button } from './button'
import { Input } from './input'
import { Textarea } from './textarea'
import type { RichTextEditorMinHeight, RichTextEditorProps } from './rich-text-editor.types'
import { a11yPresets } from '../../lib/a11y'
import { cn } from '../../lib/cn'
import { resolveCatalogCode } from '../../catalog/components'

export type { RichTextEditorProps, RichTextEditorMinHeight } from './rich-text-editor.types'

/**
 * `RichTextEditor` do celular: um editor visual de verdade (Tiptap dentro de um WebView, pelo
 * `@10play/tentap-editor`) com a barra de formatacao do Rendra por cima e o modo "Editar HTML".
 * Vive no subcaminho `@rendra-ui/app/rich-text-editor`, nunca na entrada principal. No navegador o
 * Metro troca este arquivo por `rich-text-editor.web.tsx` (so o modo HTML).
 *
 * Lacunas frente ao web, declaradas: alinhamento de texto, tabela, linha divisoria e "limpar
 * formatacao" (o Tiptap do tentap nao os traz por padrao); imagem colada ou redimensionada.
 */
const alturas: Record<RichTextEditorMinHeight, string> = { sm: 'h-24', md: 'h-chart-sm', lg: 'h-chart-md' }

type Estado = {
  isBoldActive?: boolean
  isItalicActive?: boolean
  isUnderlineActive?: boolean
  isStrikeActive?: boolean
  isCodeActive?: boolean
  isBulletListActive?: boolean
  isOrderedListActive?: boolean
  isBlockquoteActive?: boolean
  isLinkActive?: boolean
  headingLevel?: number
  canUndo?: boolean
  canRedo?: boolean
}

type Item = { label: string; icon: ReactNode; run: () => void; active?: boolean; disabled?: boolean }

const icone = 'size-icon-sm text-foreground'

export function RichTextEditor({
  value,
  defaultValue = '',
  onChange,
  placeholder = 'Escreva aqui...',
  onImageUpload,
  minHeight = 'md',
  invalid = false,
  disabled = false,
  accessibilityLabel,
  className,
}: RichTextEditorProps) {
  const ultimo = useRef(value ?? defaultValue)
  const onChangeRef = useRef(onChange)
  const editorRef = useRef<EditorBridge | null>(null)
  const [modoHtml, setModoHtml] = useState(false)
  const [html, setHtml] = useState('')
  const [linkAberto, setLinkAberto] = useState(false)
  const [endereco, setEndereco] = useState('')

  const editor = useEditorBridge({
    initialContent: value ?? defaultValue,
    bridgeExtensions: TenTapStartKit,
    editable: !disabled,
    avoidIosKeyboard: true,
    onChange: () => {
      void editorRef.current?.getHTML().then((atual: string) => {
        if (atual === ultimo.current) return
        ultimo.current = atual
        onChangeRef.current?.(atual)
      })
    },
  })
  const estado = useBridgeState(editor) as Estado

  useEffect(() => {
    onChangeRef.current = onChange
    editorRef.current = editor
  })

  // Valor controlado: o que o pai manda e que nao veio do proprio editor vai para o editor.
  useEffect(() => {
    if (value === undefined || value === ultimo.current) return
    ultimo.current = value
    editor.setContent(value)
  }, [value, editor])

  useEffect(() => {
    editor.setPlaceholder(placeholder)
  }, [placeholder, editor])

  const abrirHtml = () => {
    void editor.getHTML().then((atual: string) => {
      setHtml(atual)
      setModoHtml(true)
    })
  }

  const escolherImagem = async () => {
    if (!onImageUpload) return
    try {
      const endereco = await onImageUpload()
      if (endereco) editor.setImage(endereco)
    } catch {
      // Escolha cancelada ou sem permissao: nada a inserir.
    }
  }

  const aplicarLink = () => {
    const limpo = endereco.trim()
    if (!limpo) return
    editor.setLink(limpo)
    setLinkAberto(false)
    setEndereco('')
  }

  const itens: Item[] = [
    { label: 'Desfazer', icon: <Undo2 className={icone} />, run: () => editor.undo(), disabled: estado.canUndo === false },
    { label: 'Refazer', icon: <Redo2 className={icone} />, run: () => editor.redo(), disabled: estado.canRedo === false },
    { label: 'Título 1', icon: <Heading1 className={icone} />, run: () => editor.toggleHeading(1), active: estado.headingLevel === 1 },
    { label: 'Título 2', icon: <Heading2 className={icone} />, run: () => editor.toggleHeading(2), active: estado.headingLevel === 2 },
    { label: 'Título 3', icon: <Heading3 className={icone} />, run: () => editor.toggleHeading(3), active: estado.headingLevel === 3 },
    { label: 'Negrito (Ctrl+B)', icon: <Bold className={icone} />, run: () => editor.toggleBold(), active: estado.isBoldActive },
    { label: 'Itálico (Ctrl+I)', icon: <Italic className={icone} />, run: () => editor.toggleItalic(), active: estado.isItalicActive },
    { label: 'Sublinhado (Ctrl+U)', icon: <Underline className={icone} />, run: () => editor.toggleUnderline(), active: estado.isUnderlineActive },
    { label: 'Riscado', icon: <Strikethrough className={icone} />, run: () => editor.toggleStrike(), active: estado.isStrikeActive },
    { label: 'Código', icon: <Code className={icone} />, run: () => editor.toggleCode(), active: estado.isCodeActive },
    { label: 'Link', icon: <Link className={icone} />, run: () => setLinkAberto((a) => !a), active: estado.isLinkActive || linkAberto },
    { label: 'Lista com marcadores', icon: <List className={icone} />, run: () => editor.toggleBulletList(), active: estado.isBulletListActive },
    { label: 'Lista numerada', icon: <ListOrdered className={icone} />, run: () => editor.toggleOrderedList(), active: estado.isOrderedListActive },
    { label: 'Citação', icon: <Quote className={icone} />, run: () => editor.toggleBlockquote(), active: estado.isBlockquoteActive },
    ...(onImageUpload ? [{ label: 'Inserir imagem', icon: <ImagePlus className={icone} />, run: () => void escolherImagem() }] : []),
    { label: 'Editar HTML', icon: <FileCode className={icone} />, run: abrirHtml },
  ]

  return (
    <View
      testID="rich-text-editor"
      dataSet={{ rendra: resolveCatalogCode('RichTextEditor') }}
      className={cn(
        'overflow-hidden rounded-control border bg-field',
        invalid ? 'border-destructive' : 'border-input',
        disabled && 'opacity-60',
        className,
      )}
    >
      {modoHtml ? (
        <View className="gap-2 p-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Eye className={icone} />}
            accessibilityLabel="Voltar ao editor visual"
            onPress={() => setModoHtml(false)}
          >
            Voltar ao editor visual
          </Button>
          <Textarea
            value={html}
            onChange={(texto) => {
              setHtml(texto)
              ultimo.current = texto
              editor.setContent(texto)
              onChangeRef.current?.(texto)
            }}
            rows={12}
            disabled={disabled}
            invalid={invalid}
            accessibilityLabel="Código HTML do conteúdo"
          />
        </View>
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} {...a11yPresets.toolbar} accessibilityLabel="Formatação" className="border-b border-border">
            <View className="flex-row gap-1 p-1">
              {itens.map((item) => (
                <Button
                  key={item.label}
                  variant={item.active ? 'secondary' : 'ghost'}
                  size="sm"
                  iconOnly
                  icon={item.icon}
                  accessibilityLabel={item.label}
                  disabled={disabled || item.disabled}
                  accessibilityState={{ selected: Boolean(item.active), disabled: disabled || Boolean(item.disabled) }}
                  onPress={item.run}
                />
              ))}
            </View>
          </ScrollView>
          {linkAberto ? (
            <View className="gap-2 border-b border-border p-2">
              <Input value={endereco} onChange={setEndereco} placeholder="https://" accessibilityLabel="Endereço do link" />
              <View className="flex-row gap-2">
                <Button size="sm" className="flex-1" accessibilityLabel="Aplicar link" onPress={aplicarLink}>
                  Aplicar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  accessibilityLabel="Remover link"
                  onPress={() => {
                    editor.setLink(null)
                    setLinkAberto(false)
                    setEndereco('')
                  }}
                >
                  Remover
                </Button>
              </View>
            </View>
          ) : null}
          <View accessibilityLabel={accessibilityLabel ?? placeholder} className={alturas[minHeight]}>
            <RichText editor={editor} />
          </View>
        </>
      )}
    </View>
  )
}
