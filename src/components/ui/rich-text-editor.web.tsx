import { View } from 'react-native'
import { Text } from '../internal/text'
import { Textarea } from './textarea'
import type { RichTextEditorMinHeight, RichTextEditorProps } from './rich-text-editor.types'
import { cn } from '../../lib/cn'
import { resolveCatalogCode } from '../../catalog/components'

export type { RichTextEditorProps, RichTextEditorMinHeight } from './rich-text-editor.types'

/**
 * `RichTextEditor` no navegador (export web, vitrine, Playwright): o editor visual do celular e um
 * WebView (`react-native-webview` + tentap) e nao existe no navegador, entao aqui o unico modo e o
 * de HTML, com o mesmo contrato. Este arquivo NUNCA importa `react-native-webview` nem o tentap: e o
 * que mantem os dois fora do bundle web (o `verify:pack` confere o `dist-lib` e o bundle exportado).
 */
const linhas: Record<RichTextEditorMinHeight, number> = { sm: 4, md: 10, lg: 12 }

export function RichTextEditor({
  value,
  defaultValue = '',
  onChange,
  placeholder = 'Escreva aqui...',
  minHeight = 'md',
  invalid = false,
  disabled = false,
  className,
}: RichTextEditorProps) {
  return (
    <View testID="rich-text-editor" dataSet={{ rendra: resolveCatalogCode('RichTextEditor') }} className={cn('gap-2', className)}>
      <Text weight="medium" className="text-xs text-muted-foreground">
        Editar HTML
      </Text>
      <Textarea
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        rows={linhas[minHeight]}
        invalid={invalid}
        disabled={disabled}
        placeholder={placeholder}
        accessibilityLabel="Código HTML do conteúdo"
      />
    </View>
  )
}
