import { useState } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { BrandProvider } from '../../brand/brand-provider'
import { nodesWithCode } from '../../test-utils/rendra-code'
import { RichTextEditor } from './rich-text-editor'

// Mock global do `jest.setup.js`: o mesmo `__editor` a cada chamada, e as opcoes do `useEditorBridge`.
const tentap = jest.requireMock('@10play/tentap-editor') as {
  __editor: Record<string, jest.Mock>
  __options: { current?: { onChange?: () => void; initialContent?: string; editable?: boolean } }
  __state: { current: Record<string, unknown> }
}
const editor = tentap.__editor

beforeEach(() => {
  for (const fn of Object.values(editor)) fn.mockClear()
  editor.getHTML.mockImplementation(() => Promise.resolve('<p></p>'))
  tentap.__state.current = {}
})

const renderizar = (ui: React.ReactElement) => render(<BrandProvider>{ui}</BrandProvider>)
const botao = (nome: string) => screen.getByRole('button', { name: nome })

describe('RichTextEditor (nativo, com o tentap)', () => {
  it('a raiz carrega RTE-001 e a barra de formatacao e uma toolbar', async () => {
    const { container } = await renderizar(<RichTextEditor />)
    expect(nodesWithCode(container, 'RTE-001')).toHaveLength(1)
    expect(screen.getByLabelText('Formatação').props.accessibilityRole).toBe('toolbar')
  })

  it('a barra tem os rotulos pt-BR do web e cada botao tem 44 px (control-sm)', async () => {
    await renderizar(<RichTextEditor />)
    for (const nome of [
      'Desfazer',
      'Refazer',
      'Título 1',
      'Título 2',
      'Título 3',
      'Negrito (Ctrl+B)',
      'Itálico (Ctrl+I)',
      'Sublinhado (Ctrl+U)',
      'Riscado',
      'Código',
      'Link',
      'Lista com marcadores',
      'Lista numerada',
      'Citação',
      'Editar HTML',
    ]) {
      expect(botao(nome)).toBeTruthy()
    }
    expect(String(botao('Negrito (Ctrl+B)').props.className).split(' ')).toEqual(expect.arrayContaining(['h-control-sm', 'w-control-sm']))
    expect(screen.queryByRole('button', { name: 'Inserir imagem' })).toBeNull()
  })

  it('cada botao chama a ponte do editor', async () => {
    await renderizar(<RichTextEditor />)
    const casos: [string, string, unknown[]][] = [
      ['Desfazer', 'undo', []],
      ['Refazer', 'redo', []],
      ['Título 1', 'toggleHeading', [1]],
      ['Título 2', 'toggleHeading', [2]],
      ['Título 3', 'toggleHeading', [3]],
      ['Negrito (Ctrl+B)', 'toggleBold', []],
      ['Itálico (Ctrl+I)', 'toggleItalic', []],
      ['Sublinhado (Ctrl+U)', 'toggleUnderline', []],
      ['Riscado', 'toggleStrike', []],
      ['Código', 'toggleCode', []],
      ['Lista com marcadores', 'toggleBulletList', []],
      ['Lista numerada', 'toggleOrderedList', []],
      ['Citação', 'toggleBlockquote', []],
    ]
    for (const [nome, metodo, args] of casos) {
      await fireEvent.press(botao(nome))
      expect(editor[metodo]).toHaveBeenCalledWith(...args)
    }
  })

  it('o botao do formato ativo leva accessibilityState.selected; os outros nao', async () => {
    tentap.__state.current = { isBoldActive: true, headingLevel: 2, isBulletListActive: true }
    await renderizar(<RichTextEditor />)
    expect(botao('Negrito (Ctrl+B)').props.accessibilityState.selected).toBe(true)
    expect(botao('Título 2').props.accessibilityState.selected).toBe(true)
    expect(botao('Lista com marcadores').props.accessibilityState.selected).toBe(true)
    expect(botao('Itálico (Ctrl+I)').props.accessibilityState.selected).toBe(false)
    expect(botao('Título 1').props.accessibilityState.selected).toBe(false)
  })

  it('Desfazer e Refazer ficam desabilitados quando o editor nao pode', async () => {
    tentap.__state.current = { canUndo: false, canRedo: true }
    await renderizar(<RichTextEditor />)
    expect(botao('Desfazer').props.accessibilityState.disabled).toBe(true)
    expect(botao('Refazer').props.accessibilityState.disabled).toBe(false)
  })

  it('Link abre o campo de endereco; Aplicar poe o link e Remover tira', async () => {
    await renderizar(<RichTextEditor />)
    expect(screen.queryByLabelText('Endereço do link')).toBeNull()
    await fireEvent.press(botao('Link'))
    await fireEvent.changeText(screen.getByLabelText('Endereço do link'), '  https://exemplo.com.br  ')
    await fireEvent.press(botao('Aplicar link'))
    expect(editor.setLink).toHaveBeenCalledWith('https://exemplo.com.br')
    expect(screen.queryByLabelText('Endereço do link')).toBeNull()
    await fireEvent.press(botao('Link'))
    await fireEvent.press(botao('Remover link'))
    expect(editor.setLink).toHaveBeenLastCalledWith(null)
    expect(screen.queryByLabelText('Endereço do link')).toBeNull()
  })

  it('Aplicar link sem endereco nao faz nada', async () => {
    await renderizar(<RichTextEditor />)
    await fireEvent.press(botao('Link'))
    await fireEvent.press(botao('Aplicar link'))
    expect(editor.setLink).not.toHaveBeenCalled()
  })

  it('Inserir imagem so existe com onImageUpload e poe o endereco devolvido no editor', async () => {
    const onImageUpload = jest.fn().mockResolvedValue('https://exemplo.com.br/foto.png')
    await renderizar(<RichTextEditor onImageUpload={onImageUpload} />)
    await fireEvent.press(botao('Inserir imagem'))
    await act(async () => {})
    expect(editor.setImage).toHaveBeenCalledWith('https://exemplo.com.br/foto.png')
  })

  it('se a escolha da imagem e cancelada ou falha, nada e inserido', async () => {
    const onImageUpload = jest.fn().mockResolvedValueOnce(null).mockRejectedValueOnce(new Error('sem permissão'))
    await renderizar(<RichTextEditor onImageUpload={onImageUpload} />)
    await fireEvent.press(botao('Inserir imagem'))
    await act(async () => {})
    await fireEvent.press(botao('Inserir imagem'))
    await act(async () => {})
    expect(editor.setImage).not.toHaveBeenCalled()
  })

  it('uma edicao no editor chama onChange com o HTML novo (e so quando ele mudou)', async () => {
    const onChange = jest.fn()
    editor.getHTML.mockImplementation(() => Promise.resolve('<p>Olá</p>'))
    await renderizar(<RichTextEditor defaultValue="<p></p>" onChange={onChange} />)
    await act(async () => {
      tentap.__options.current!.onChange!()
    })
    expect(onChange).toHaveBeenCalledWith('<p>Olá</p>')
    await act(async () => {
      tentap.__options.current!.onChange!()
    })
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('o conteudo inicial vem de defaultValue ou value, e value novo vai para o editor', async () => {
    const { rerender } = await renderizar(<RichTextEditor value="<p>um</p>" />)
    expect(tentap.__options.current?.initialContent).toBe('<p>um</p>')
    expect(editor.setContent).not.toHaveBeenCalled()
    await rerender(
      <BrandProvider>
        <RichTextEditor value="<p>dois</p>" />
      </BrandProvider>,
    )
    expect(editor.setContent).toHaveBeenCalledWith('<p>dois</p>')
  })

  it('disabled desliga a edicao e trava a barra', async () => {
    await renderizar(<RichTextEditor disabled />)
    expect(tentap.__options.current?.editable).toBe(false)
    expect(botao('Negrito (Ctrl+B)').props.accessibilityState.disabled).toBe(true)
  })

  it('o placeholder padrao e o recebido vao para o editor', async () => {
    const { unmount } = await renderizar(<RichTextEditor />)
    expect(editor.setPlaceholder).toHaveBeenCalledWith('Escreva aqui...')
    await unmount()
    await renderizar(<RichTextEditor placeholder="Descreva o serviço" />)
    expect(editor.setPlaceholder).toHaveBeenCalledWith('Descreva o serviço')
  })

  it('invalid pinta a borda de erro e disabled baixa a opacidade', async () => {
    const { unmount } = await renderizar(<RichTextEditor invalid />)
    expect(String(screen.getByTestId('rich-text-editor').props.className).split(' ')).toContain('border-destructive')
    await unmount()
    await renderizar(<RichTextEditor disabled />)
    expect(String(screen.getByTestId('rich-text-editor').props.className).split(' ')).toContain('opacity-60')
  })

  it('Editar HTML troca o editor visual pelo codigo; digitar chama onChange e o editor; Voltar retorna', async () => {
    const onChange = jest.fn()
    editor.getHTML.mockImplementation(() => Promise.resolve('<h2>Proposta</h2>'))
    function Tela() {
      const [html, setHtml] = useState('<h2>Proposta</h2>')
      return <RichTextEditor value={html} onChange={(h) => { setHtml(h); onChange(h) }} />
    }
    await renderizar(<Tela />)
    await fireEvent.press(botao('Editar HTML'))
    const codigo = await screen.findByLabelText('Código HTML do conteúdo')
    expect(codigo.props.value).toBe('<h2>Proposta</h2>')
    expect(screen.queryByRole('button', { name: 'Negrito (Ctrl+B)' })).toBeNull()
    await fireEvent.changeText(codigo, '<h2>Proposta comercial</h2>')
    expect(onChange).toHaveBeenCalledWith('<h2>Proposta comercial</h2>')
    expect(editor.setContent).toHaveBeenCalledWith('<h2>Proposta comercial</h2>')
    await fireEvent.press(botao('Voltar ao editor visual'))
    expect(screen.queryByLabelText('Código HTML do conteúdo')).toBeNull()
    expect(botao('Negrito (Ctrl+B)')).toBeTruthy()
  })
})
