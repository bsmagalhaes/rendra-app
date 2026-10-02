import { StyleSheet } from 'react-native'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { useState } from 'react'
import { BrandProvider } from '../../brand/brand-provider'
import { nodesWithCode } from '../../test-utils/rendra-code'
// O Jest deste projeto resolve a plataforma `ios`; o arquivo do navegador entra pelo nome.
import { RichTextEditor } from './rich-text-editor.web'

// `require` com cast estrutural local: tsconfig.json restringe `types` a `jest` (sem @types/node).
// eslint-disable-next-line @typescript-eslint/no-require-imports -- sem @types/node no tsconfig
const { readFileSync } = require('fs') as { readFileSync: (caminho: string, codificacao: 'utf8') => string }
// eslint-disable-next-line @typescript-eslint/no-require-imports -- sem @types/node no tsconfig
const { join } = require('path') as { join: (...partes: string[]) => string }

const renderizar = (ui: React.ReactElement) => render(<BrandProvider>{ui}</BrandProvider>)
const campo = () => screen.getByLabelText('Código HTML do conteúdo')

describe('RichTextEditor (navegador: so o modo HTML)', () => {
  it('a raiz carrega RTE-001 e mostra o aviso de que o modo HTML e o unico', async () => {
    const { container } = await renderizar(<RichTextEditor />)
    expect(nodesWithCode(container, 'RTE-001')).toHaveLength(1)
    expect(screen.getByText('Editar HTML')).toBeTruthy()
  })

  it('defaultValue aparece no campo e digitar chama onChange com o HTML, refletido na tela', async () => {
    const onChange = jest.fn()
    await renderizar(<RichTextEditor defaultValue="<h2>Proposta</h2>" onChange={onChange} />)
    expect(campo().props.value).toBe('<h2>Proposta</h2>')
    await fireEvent.changeText(campo(), '<h2>Proposta comercial</h2><p>R$ 1.250,00</p>')
    expect(onChange).toHaveBeenCalledWith('<h2>Proposta comercial</h2><p>R$ 1.250,00</p>')
    expect(campo().props.value).toBe('<h2>Proposta comercial</h2><p>R$ 1.250,00</p>')
  })

  it('value controlado manda no campo', async () => {
    function Tela() {
      const [html, setHtml] = useState('<p>um</p>')
      return <RichTextEditor value={html} onChange={setHtml} />
    }
    await renderizar(<Tela />)
    await fireEvent.changeText(campo(), '<p>dois</p>')
    expect(campo().props.value).toBe('<p>dois</p>')
  })

  it('placeholder padrao e o recebido', async () => {
    const { unmount } = await renderizar(<RichTextEditor />)
    expect(campo().props.placeholder).toBe('Escreva aqui...')
    await unmount()
    await renderizar(<RichTextEditor placeholder="Descreva o serviço" />)
    expect(campo().props.placeholder).toBe('Descreva o serviço')
  })

  it('disabled trava o campo e invalid pinta a borda de erro', async () => {
    const { unmount } = await renderizar(<RichTextEditor disabled />)
    expect(campo().props.editable).toBe(false)
    await unmount()
    await renderizar(<RichTextEditor invalid />)
    expect(String(campo().props.className).split(' ')).toContain('border-destructive')
  })

  it('minHeight escolhe a altura do campo: 96, 200 e 240 px', async () => {
    const alturas: number[] = []
    for (const m of ['sm', 'md', 'lg'] as const) {
      const { unmount } = await renderizar(<RichTextEditor minHeight={m} />)
      alturas.push(StyleSheet.flatten(campo().props.style).height as number)
      await unmount()
    }
    expect(alturas).toEqual([96, 200, 240])
  })

  it('o arquivo do navegador nunca importa react-native-webview nem o tentap', () => {
    const fonte = readFileSync(join(process.cwd(), 'src', 'components', 'ui', 'rich-text-editor.web.tsx'), 'utf8')
    expect(fonte).not.toMatch(/(from|require\()\s*['"](react-native-webview|@10play\/tentap-editor)/)
  })
})
