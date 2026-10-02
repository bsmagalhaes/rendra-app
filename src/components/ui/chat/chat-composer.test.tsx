import { useState } from 'react'
import { StyleSheet, Text } from 'react-native'
import { act, fireEvent, render, screen } from '@testing-library/react-native'
import * as SafeAreaContext from 'react-native-safe-area-context'
import { BrandProvider } from '../../../brand/brand-provider'
import { nodesWithCode } from '../../../test-utils/rendra-code'
import { navComPagina } from '../../../test-utils/shell-fixtures'
import { ShellProvider } from '../../app-shell/shell-context'
import { ChatComposer, type ChatComposerProps, type QuickReply } from './chat-composer'
import type { ChatFile } from './types'

afterEach(() => {
  jest.useRealTimers()
  jest.restoreAllMocks()
})

const renderizar = (ui: React.ReactElement) => render(<BrandProvider>{ui}</BrandProvider>)
const campo = () => screen.getByLabelText('Mensagem')

const respostas: QuickReply[] = [
  { id: 'q1', title: 'Saudação', text: 'Olá, tudo bem? Como posso ajudar?' },
  { id: 'q2', title: 'Encerramento', text: 'Obrigado pelo contato, até logo.' },
]

const arquivo: ChatFile = { name: 'contrato.pdf', uri: 'file:///contrato.pdf', type: 'application/pdf', size: 204800 }
const foto: ChatFile = { name: 'foto.png', uri: 'file:///foto.png', type: 'image/png', size: 4096 }

async function abrirMais() {
  await fireEvent.press(screen.getByLabelText('Mais ações da mensagem'))
}

describe('ChatComposer: envio', () => {
  it('a raiz carrega CHAT-003 e Enviar fica desabilitado sem texto e sem anexo', async () => {
    const { container } = await renderizar(<ChatComposer onSend={() => {}} />)
    expect(nodesWithCode(container, 'CHAT-003')).toHaveLength(1)
    expect(screen.getByLabelText('Enviar').props.accessibilityState.disabled).toBe(true)
    await fireEvent.changeText(campo(), '   ')
    expect(screen.getByLabelText('Enviar').props.accessibilityState.disabled).toBe(true)
    await fireEvent.changeText(campo(), 'Oi')
    expect(screen.getByLabelText('Enviar').props.accessibilityState.disabled).toBe(false)
  })

  it('digitar e enviar acrescenta a mensagem na lista da tela e limpa o campo', async () => {
    function Tela() {
      const [lista, setLista] = useState<string[]>([])
      return (
        <>
          {lista.map((t, i) => (
            <Text key={i}>{t}</Text>
          ))}
          <ChatComposer onSend={({ text }) => setLista((l) => [...l, text])} />
        </>
      )
    }
    await renderizar(<Tela />)
    await fireEvent.changeText(campo(), '  Bom dia  ')
    await fireEvent.press(screen.getByLabelText('Enviar'))
    expect(screen.getByText('Bom dia')).toBeTruthy()
    expect(campo().props.value).toBe('')
    expect(screen.getByLabelText('Enviar').props.accessibilityState.disabled).toBe(true)
  })

  it('o placeholder padrao e o recebido aparecem no campo', async () => {
    const { unmount } = await renderizar(<ChatComposer onSend={() => {}} />)
    expect(campo().props.placeholder).toBe('Escreva uma mensagem')
    await unmount()
    await renderizar(<ChatComposer onSend={() => {}} placeholder="Responder ao cliente" />)
    expect(campo().props.placeholder).toBe('Responder ao cliente')
  })

  it('o campo cresce com o conteudo entre 48 e 192 px', async () => {
    await renderizar(<ChatComposer onSend={() => {}} />)
    const altura = () => StyleSheet.flatten(campo().props.style).height
    expect(altura()).toBe(48)
    await fireEvent(campo(), 'contentSizeChange', { nativeEvent: { contentSize: { width: 200, height: 120 } } })
    expect(altura()).toBe(120)
    await fireEvent(campo(), 'contentSizeChange', { nativeEvent: { contentSize: { width: 200, height: 400 } } })
    expect(altura()).toBe(192)
    await fireEvent(campo(), 'contentSizeChange', { nativeEvent: { contentSize: { width: 200, height: 10 } } })
    expect(altura()).toBe(48)
  })
})

describe('ChatComposer: desativado, citacao e edicao', () => {
  it('disabledHint substitui o campo e mostra a acao', async () => {
    await renderizar(
      <ChatComposer onSend={() => {}} disabled disabledHint="Assuma a conversa para responder." disabledAction={<Text>Assumir atendimento</Text>} />,
    )
    expect(screen.getByText('Assuma a conversa para responder.')).toBeTruthy()
    expect(screen.getByText('Assumir atendimento')).toBeTruthy()
    expect(screen.queryByLabelText('Mensagem')).toBeNull()
    expect(screen.queryByLabelText('Enviar')).toBeNull()
  })

  it('desativado sem dica mantem o campo, sem edicao e com os botoes desabilitados', async () => {
    await renderizar(<ChatComposer onSend={() => {}} disabled />)
    expect(campo().props.editable).toBe(false)
    expect(screen.getByLabelText('Enviar').props.accessibilityState.disabled).toBe(true)
    expect(screen.getByLabelText('Mais ações da mensagem').props.accessibilityState.disabled).toBe(true)
  })

  it('quote mostra Respondendo a <autor> com o texto, e Cancelar resposta chama onCancelQuote', async () => {
    const onCancelQuote = jest.fn()
    await renderizar(<ChatComposer onSend={() => {}} quote={{ author: 'Ana Souza', text: 'Preciso de ajuda.' }} onCancelQuote={onCancelQuote} />)
    expect(screen.getByText('Respondendo a Ana Souza')).toBeTruthy()
    expect(screen.getByText('Preciso de ajuda.')).toBeTruthy()
    await fireEvent.press(screen.getByLabelText('Cancelar resposta'))
    expect(onCancelQuote).toHaveBeenCalledTimes(1)
  })

  it('quote sem autor diz Respondendo a mensagem', async () => {
    await renderizar(<ChatComposer onSend={() => {}} quote={{ text: 'Sem autor' }} />)
    expect(screen.getByText('Respondendo a mensagem')).toBeTruthy()
  })

  it('editing preenche o campo, mostra Editando mensagem, e Cancelar edicao limpa e avisa', async () => {
    const onCancelEdit = jest.fn()
    await renderizar(<ChatComposer onSend={() => {}} editing={{ id: 'm2', text: 'Texto para corrigir' }} onCancelEdit={onCancelEdit} />)
    expect(campo().props.value).toBe('Texto para corrigir')
    expect(screen.getByText('Editando mensagem')).toBeTruthy()
    await fireEvent.press(screen.getByLabelText('Cancelar edição'))
    expect(onCancelEdit).toHaveBeenCalledTimes(1)
    expect(campo().props.value).toBe('')
  })
})

describe('ChatComposer: mais acoes', () => {
  it('abre a folha com Emoji e Gravar audio; Anexar, Imagem e Mensagens rapidas so com as props', async () => {
    await renderizar(<ChatComposer onSend={() => {}} />)
    expect(screen.queryByText('Emoji')).toBeNull()
    await abrirMais()
    expect(screen.getByText('Emoji')).toBeTruthy()
    expect(screen.getByText('Gravar áudio')).toBeTruthy()
    expect(screen.queryByText('Anexar arquivo')).toBeNull()
    expect(screen.queryByText('Imagem ou vídeo')).toBeNull()
    expect(screen.queryByText('Mensagens rápidas')).toBeNull()
  })

  it('com onPickFiles, onPickMedia e quickReplies os tres itens aparecem', async () => {
    await renderizar(<ChatComposer onSend={() => {}} onPickFiles={async () => []} onPickMedia={async () => []} quickReplies={respostas} />)
    await abrirMais()
    expect(screen.getByText('Anexar arquivo')).toBeTruthy()
    expect(screen.getByText('Imagem ou vídeo')).toBeTruthy()
    expect(screen.getByText('Mensagens rápidas')).toBeTruthy()
  })

  it('Anexar arquivo fecha a folha, mostra os anexos com nome e tamanho, e Enviar passa a valer', async () => {
    const onPickFiles = jest.fn().mockResolvedValue([arquivo])
    const onSend = jest.fn()
    await renderizar(<ChatComposer onSend={onSend} onPickFiles={onPickFiles} />)
    await abrirMais()
    await fireEvent.press(screen.getByText('Anexar arquivo'))
    expect(await screen.findByText('contrato.pdf')).toBeTruthy()
    expect(screen.getByText('200 KB')).toBeTruthy()
    expect(screen.queryByText('Gravar áudio')).toBeNull()
    expect(screen.getByLabelText('Enviar').props.accessibilityState.disabled).toBe(false)
    await fireEvent.press(screen.getByLabelText('Enviar'))
    expect(onSend).toHaveBeenCalledWith({ text: '', files: [arquivo] })
    expect(screen.queryByText('contrato.pdf')).toBeNull()
  })

  it('Imagem ou video usa onPickMedia, e Remover tira o anexo da lista', async () => {
    await renderizar(<ChatComposer onSend={() => {}} onPickMedia={async () => [foto, arquivo]} />)
    await abrirMais()
    await fireEvent.press(screen.getByText('Imagem ou vídeo'))
    expect(await screen.findByText('foto.png')).toBeTruthy()
    expect(screen.getByText('contrato.pdf')).toBeTruthy()
    await fireEvent.press(screen.getByLabelText('Remover foto.png'))
    expect(screen.queryByText('foto.png')).toBeNull()
    expect(screen.getByText('contrato.pdf')).toBeTruthy()
  })

  it('se o seletor falha ou e cancelado, nada e anexado e o campo segue funcionando', async () => {
    await renderizar(<ChatComposer onSend={() => {}} onPickFiles={() => Promise.reject(new Error('cancelado'))} />)
    await abrirMais()
    await fireEvent.press(screen.getByText('Anexar arquivo'))
    await act(async () => {})
    expect(screen.queryByLabelText(/^Remover /)).toBeNull()
    await fireEvent.changeText(campo(), 'ainda digito')
    expect(campo().props.value).toBe('ainda digito')
  })

  it('Emoji mostra a grade, escolher insere no campo e fecha a folha; Voltar retorna ao menu', async () => {
    await renderizar(<ChatComposer onSend={() => {}} />)
    await abrirMais()
    await fireEvent.press(screen.getByText('Emoji'))
    expect(screen.getAllByLabelText(/^Inserir /)).toHaveLength(24)
    // Seis colunas: quatro linhas de seis emojis.
    const linhas = screen.getByLabelText('Emojis').children
    expect(linhas).toHaveLength(4)
    for (const linha of linhas) expect(typeof linha === 'string' ? 0 : linha.children).toHaveLength(6)
    await fireEvent.press(screen.getByText('Voltar'))
    expect(screen.getByText('Gravar áudio')).toBeTruthy()
    await fireEvent.press(screen.getByText('Emoji'))
    await fireEvent.changeText(campo(), 'Obrigado')
    await fireEvent.press(screen.getByLabelText('Inserir 🙏'))
    expect(campo().props.value).toBe('Obrigado🙏')
    expect(screen.queryByLabelText('Inserir 🙏')).toBeNull()
  })

  it('o emoji entra na posicao do cursor', async () => {
    await renderizar(<ChatComposer onSend={() => {}} />)
    await fireEvent.changeText(campo(), 'Oi Ana')
    await fireEvent(campo(), 'selectionChange', { nativeEvent: { selection: { start: 2, end: 2 } } })
    await abrirMais()
    await fireEvent.press(screen.getByText('Emoji'))
    await fireEvent.press(screen.getByLabelText('Inserir 👍'))
    expect(campo().props.value).toBe('Oi👍 Ana')
  })

  it('Mensagens rapidas: busca filtra por titulo e texto, escolher poe o texto no campo', async () => {
    await renderizar(<ChatComposer onSend={() => {}} quickReplies={respostas} />)
    await abrirMais()
    await fireEvent.press(screen.getByText('Mensagens rápidas'))
    expect(screen.getByText('Saudação')).toBeTruthy()
    expect(screen.getByText('Encerramento')).toBeTruthy()
    await fireEvent.changeText(screen.getByLabelText('Buscar mensagem rápida'), 'obrigado')
    expect(screen.queryByText('Saudação')).toBeNull()
    await fireEvent.changeText(screen.getByLabelText('Buscar mensagem rápida'), 'zzz')
    expect(screen.getByText('Nenhuma mensagem com essa busca.')).toBeTruthy()
    await fireEvent.changeText(screen.getByLabelText('Buscar mensagem rápida'), 'obrigado')
    await fireEvent.press(screen.getByText('Encerramento'))
    expect(campo().props.value).toBe('Obrigado pelo contato, até logo.')
    expect(screen.queryByLabelText('Buscar mensagem rápida')).toBeNull()
  })

  it('a mensagem rapida entra depois do texto que ja estava no campo', async () => {
    await renderizar(<ChatComposer onSend={() => {}} quickReplies={respostas} />)
    await fireEvent.changeText(campo(), 'Bom dia!  ')
    await abrirMais()
    await fireEvent.press(screen.getByText('Mensagens rápidas'))
    await fireEvent.press(screen.getByText('Saudação'))
    expect(campo().props.value).toBe('Bom dia! Olá, tudo bem? Como posso ajudar?')
  })
})

describe('ChatComposer: gravacao de audio simulada', () => {
  async function gravar(onSend = jest.fn()) {
    jest.useFakeTimers()
    await renderizar(<ChatComposer onSend={onSend} />)
    await abrirMais()
    await fireEvent.press(screen.getByText('Gravar áudio'))
    return onSend
  }

  it('mostra o contador, o aviso Gravando audio, e troca o campo pelos botoes de cancelar e enviar', async () => {
    await gravar()
    expect(screen.getByText('Gravando áudio')).toBeTruthy()
    expect(screen.getByText('0:00')).toBeTruthy()
    expect(screen.queryByLabelText('Mensagem')).toBeNull()
    await act(async () => {
      jest.advanceTimersByTime(3000)
    })
    expect(screen.getByText('0:03')).toBeTruthy()
    expect(screen.getByLabelText('Cancelar gravação')).toBeTruthy()
    expect(screen.getByLabelText('Enviar áudio')).toBeTruthy()
  })

  it('Enviar audio chama onSend com o arquivo de audio e a duracao, e volta ao campo', async () => {
    const onSend = await gravar()
    await act(async () => {
      jest.advanceTimersByTime(5000)
    })
    await fireEvent.press(screen.getByLabelText('Enviar áudio'))
    expect(onSend).toHaveBeenCalledTimes(1)
    const msg = onSend.mock.calls[0][0]
    expect(msg.text).toBe('')
    expect(msg.audioSeconds).toBe(5)
    expect(msg.files).toHaveLength(1)
    expect(msg.files[0].type).toBe('audio/webm')
    expect(msg.files[0].name).toBe('Áudio 0:05.webm')
    expect(screen.getByLabelText('Mensagem')).toBeTruthy()
    expect(screen.queryByText('Gravando áudio')).toBeNull()
  })

  it('Cancelar gravacao nao envia nada', async () => {
    const onSend = await gravar()
    await act(async () => {
      jest.advanceTimersByTime(4000)
    })
    await fireEvent.press(screen.getByLabelText('Cancelar gravação'))
    expect(onSend).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Mensagem')).toBeTruthy()
  })

  it('enviar sem ter passado um segundo nao manda audio vazio', async () => {
    const onSend = await gravar()
    await fireEvent.press(screen.getByLabelText('Enviar áudio'))
    expect(onSend).not.toHaveBeenCalled()
  })
})

describe('ChatComposer: safe area', () => {
  it('paddingBottom acompanha o inset inferior, com minimo de 12', async () => {
    jest.spyOn(SafeAreaContext, 'useSafeAreaInsets').mockReturnValue({ top: 0, bottom: 34, left: 0, right: 0 })
    const { unmount } = await renderizar(<ChatComposer onSend={() => {}} />)
    expect(StyleSheet.flatten(screen.getByTestId('chat-composer').props.style)).toMatchObject({ paddingBottom: 34 })
    await unmount()
    jest.spyOn(SafeAreaContext, 'useSafeAreaInsets').mockReturnValue({ top: 0, bottom: 0, left: 0, right: 0 })
    await renderizar(<ChatComposer onSend={() => {}} />)
    expect(StyleSheet.flatten(screen.getByTestId('chat-composer').props.style)).toMatchObject({ paddingBottom: 12 })
  })

  it('dentro do shell com barra inferior nao soma o inset (a barra ja e dona do respiro)', async () => {
    jest.spyOn(SafeAreaContext, 'useSafeAreaInsets').mockReturnValue({ top: 0, bottom: 34, left: 0, right: 0 })
    const props: ChatComposerProps = { onSend: () => {} }
    await render(
      <BrandProvider>
        <ShellProvider navigation={navComPagina} layout={{ bottomNav: true }} userConfigurable={false}>
          <ChatComposer {...props} />
        </ShellProvider>
      </BrandProvider>,
    )
    expect(StyleSheet.flatten(screen.getByTestId('chat-composer').props.style)).toMatchObject({ paddingBottom: 12 })
  })
})
