import { useState } from 'react'
import { render, fireEvent, waitFor, act } from '@testing-library/react-native'
import { registerCSS } from 'react-native-css-interop/test'
import { BrandProvider } from '../../brand/brand-provider'
import { ThemeColorProbe } from '../../test-utils/theme-color-probe'
import { Select } from './select'

const options = [
  { value: 'a', label: 'Alfa' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gama' },
]

describe('Select simples', () => {
  it('abre a folha, lista as opções e chama onChange ao tocar numa', async () => {
    const onChange = jest.fn()
    const { findByText, findByRole } = await render(
      <BrandProvider>
        <Select options={options} placeholder="Selecione" onChange={onChange} />
      </BrandProvider>,
    )
    const gatilho = await findByRole('combobox')
    await fireEvent.press(gatilho)
    const beta = await findByText('Beta')
    await fireEvent.press(beta)
    await waitFor(() => expect(onChange).toHaveBeenCalledWith('b'))
    // Efeito visível, não só a chamada: ao escolher uma opção no modo simples, a folha
    // fecha (accessibilityState.expanded volta a false).
    expect(gatilho.props.accessibilityState.expanded).toBe(false)
  })

  it('achado do Playwright (test:a11y): o gatilho tem aria-controls apontando para o nativeID da lista (aria-required-attr)', async () => {
    // axe (WCAG "aria-required-attr") reprovava esse gatilho no export web real: todo
    // role="combobox" exige aria-controls apontando para o id do que ele controla.
    // Melhoria 6 do veredito do fechamento (Fable): a asserção conferia só que
    // aria-controls existia (truthy), sem provar que aponta para o elemento certo; agora
    // confere que existe, na árvore renderizada, o View cujo nativeID é exatamente esse valor
    // (o mesmo listboxId que envolve o FlatList em select.tsx).
    const { findByRole, root } = await render(
      <BrandProvider>
        <Select options={options} placeholder="Selecione" onChange={() => {}} />
      </BrandProvider>,
    )
    const gatilho = await findByRole('combobox')
    const ariaControls = gatilho.props['aria-controls']
    expect(ariaControls).toBeTruthy()
    await fireEvent.press(gatilho)
    await waitFor(() => expect(root!.queryAll((node) => node.props.nativeID === ariaControls).length).toBeGreaterThan(0))
  })

  it('disabled não abre a folha', async () => {
    const { findByRole, queryByText } = await render(
      <BrandProvider>
        <Select options={options} disabled />
      </BrandProvider>,
    )
    const gatilho = await findByRole('combobox')
    await fireEvent.press(gatilho)
    expect(queryByText('Alfa')).toBeNull()
  })

  it('gatilho espelha o estado expandido em accessibilityState.expanded', async () => {
    // Desvio de execução: sob Jest, o Pressable/View nativo do React Native consome a prop `aria-expanded`
    // e a funde em `accessibilityState.expanded` antes de expor os props do host
    // component (comprovado: um Pressable renderizado só com `aria-expanded` não expõe
    // essa chave em `props`, só `accessibilityState.expanded`). A prop `aria-expanded`
    // continua explícita em select.tsx (necessária para o react-native-web, que lê
    // `aria-expanded` bruto, nunca de `accessibilityState`); só a asserção direta do
    // prop, impossível sob Jest, foi trocada pelo efeito visível equivalente.
    const { findByRole } = await render(
      <BrandProvider>
        <Select options={options} />
      </BrandProvider>,
    )
    const gatilho = await findByRole('combobox')
    expect(gatilho.props.accessibilityState.expanded).toBe(false)
    await fireEvent.press(gatilho)
    await waitFor(() => expect(gatilho.props.accessibilityState.expanded).toBe(true))
  })

  it('clearable chama onChange(null) e volta a mostrar o placeholder', async () => {
    // Sem `value` controlado (só `onChange` de observação): assim o clique em "Limpar
    // seleção" produz um efeito visível de verdade (o placeholder volta e o botão de
    // limpar some), não só a chamada do callback.
    const onChange = jest.fn()
    const { findByRole, findByText, findByLabelText, queryByLabelText } = await render(
      <BrandProvider>
        <Select options={options} placeholder="Selecione" onChange={onChange} clearable />
      </BrandProvider>,
    )
    await fireEvent.press(await findByRole('combobox'))
    await fireEvent.press(await findByText('Alfa'))
    const limpar = await findByLabelText('Limpar seleção')
    await fireEvent.press(limpar)
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(null))
    expect(await findByText('Selecione')).toBeTruthy()
    expect(queryByLabelText('Limpar seleção')).toBeNull()
  })

  it('chevron: abrir o Select não dispara o aviso de upgrade do react-native-css-interop (rotate-0/rotate-180 desde o primeiro render, B1 do veredito de validação final do Lote 4)', async () => {
    // B1 (Fable, validação final do Lote 4): `select.tsx:256` já entrou corrigido
    // (`open ? 'rotate-180' : 'rotate-0'`) sem teste que prove o efeito; a asserção de
    // className é inaplicável aqui porque o `ChevronDown` (SVG) já passa pelo cssInterop real
    // sob Jest (registrado incondicionalmente em jest.setup.js, registerIconInterop), que
    // resolve `className` em `style` antes de qualquer asserção poder ler a classe como string.
    // A prova correta é o próprio aviso de upgrade do react-native-css-interop (o gatilho real
    // do crash de navegação no nativo, mesmo mecanismo do M3 em button-group.test.tsx/
    // tabs.test.tsx): se o chevron nascesse sem nenhuma classe de rotação (padrão antigo,
    // `open && 'rotate-180'`), abrir a folha faria `rotate-180` aparecer fora do primeiro
    // render, disparando "CssInterop upgrade warning". Sem `cssInterop(Pressable)` nem
    // `resetComponents()`: o ChevronDown já está registrado, e o aviso só serializa as
    // props do próprio ícone (pequenas), não a árvore inteira do Select/BrandProvider.
    registerCSS(`
      .rotate-0 { --tw-rotate: 0deg; transform: rotate(var(--tw-rotate)); }
      .rotate-180 { --tw-rotate: 180deg; transform: rotate(var(--tw-rotate)); }
    `)
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    try {
      const { findByRole, findByText } = await render(
        <BrandProvider>
          <Select options={options} placeholder="Selecione" onChange={() => {}} />
        </BrandProvider>,
      )
      await fireEvent.press(await findByRole('combobox'))
      expect(await findByText('Alfa')).toBeTruthy()
      const upgradeWarnings = logSpy.mock.calls.filter(
        ([message]) => typeof message === 'string' && message.startsWith('CssInterop upgrade warning'),
      )
      expect(upgradeWarnings).toHaveLength(0)
    } finally {
      logSpy.mockRestore()
    }
  })
})

function ControlledMultiSelect({
  onChange,
  initial = [],
  selectAll,
}: {
  onChange: (value: string[]) => void
  initial?: string[]
  selectAll?: boolean
}) {
  const [value, setValue] = useState<string[]>(initial)
  return (
    <Select
      multiple
      options={options}
      value={value}
      showCount
      selectAll={selectAll}
      onChange={(next) => {
        setValue(next)
        onChange(next)
      }}
    />
  )
}

describe('Select múltiplo', () => {
  it('mantém rascunho e só chama onChange em Aplicar (N); o gatilho passa a mostrar a contagem aplicada', async () => {
    // Achado 2 do veredito do Bloco A: o teste original usava `value={[]}` fixo e só
    // conferia a chamada de `onChange`, nunca o efeito de verdade (o valor aplicado
    // refletido no gatilho). Envolver num componente controlado por `useState` (mesmo
    // padrão `ControlledGroup` do checkbox.test.tsx) permite afirmar o efeito visível.
    const onChange = jest.fn()
    const { findByRole, findByText } = await render(
      <BrandProvider>
        <ControlledMultiSelect onChange={onChange} />
      </BrandProvider>,
    )
    const gatilho = await findByRole('combobox')
    await fireEvent.press(gatilho)
    await fireEvent.press(await findByText('Alfa'))
    await fireEvent.press(await findByText('Beta'))
    expect(onChange).not.toHaveBeenCalled()
    const aplicar = await findByText('Aplicar (2)')
    await fireEvent.press(aplicar)
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(['a', 'b']))
    // Efeito visível, não só a chamada: o valor aplicado passa a refletir no gatilho.
    expect(await findByText('2 selecionado(s)')).toBeTruthy()
  })

  it('showCount mostra "2 selecionado(s)" no gatilho', async () => {
    const { findByText } = await render(
      <BrandProvider>
        <Select multiple options={options} value={['a', 'b']} showCount onChange={() => {}} />
      </BrandProvider>,
    )
    expect(await findByText('2 selecionado(s)')).toBeTruthy()
  })

  it('maxChips mostra "+1" além do limite', async () => {
    const { findByText } = await render(
      <BrandProvider>
        <Select multiple options={options} value={['a', 'b', 'c']} maxChips={2} onChange={() => {}} />
      </BrandProvider>,
    )
    expect(await findByText('+1')).toBeTruthy()
  })

  it('selectAll alterna entre todos e nenhum, ignora a busca digitada; o gatilho reflete os 3 aplicados', async () => {
    const onChange = jest.fn()
    const { findByRole, findByText } = await render(
      <BrandProvider>
        <ControlledMultiSelect onChange={onChange} selectAll />
      </BrandProvider>,
    )
    await fireEvent.press(await findByRole('combobox'))
    await fireEvent.press(await findByText('Selecionar todos'))
    await fireEvent.press(await findByText('Aplicar (3)'))
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(['a', 'b', 'c']))
    // Efeito visível, não só a chamada.
    expect(await findByText('3 selecionado(s)')).toBeTruthy()
  })
})

describe('Select com busca e criação', () => {
  it('busca filtra a lista', async () => {
    const { findByRole, findByPlaceholderText, findByText, queryByText } = await render(
      <BrandProvider>
        <Select options={options} searchable />
      </BrandProvider>,
    )
    await fireEvent.press(await findByRole('combobox'))
    const busca = await findByPlaceholderText('Buscar...')
    await fireEvent.changeText(busca, 'be')
    expect(await findByText('Beta')).toBeTruthy()
    expect(queryByText('Alfa')).toBeNull()
  })

  it('achado do Playwright (test:a11y): o campo de busca usa placeholderTextColor com --muted-foreground (contraste)', async () => {
    // Mesma causa raiz e correção do Input/Textarea: `placeholder:text-muted-foreground` via
    // className não sobrevive ao clone que o axe-core usa para medir a cor do placeholder.
    const capturado = { cor: '' }
    const { findByRole, findByPlaceholderText } = await render(
      <BrandProvider>
        <ThemeColorProbe token="--muted-foreground" onCapture={(cor) => { capturado.cor = cor }} />
        <Select options={options} searchable />
      </BrandProvider>,
    )
    await fireEvent.press(await findByRole('combobox'))
    const busca = await findByPlaceholderText('Buscar...')
    await waitFor(() => expect(capturado.cor).not.toBe(''))
    expect(busca.props.placeholderTextColor).toBe(capturado.cor)
  })

  it('creatable chama onCreate e comita a opção criada, fechando a folha', async () => {
    const onCreate = jest.fn().mockResolvedValue({ value: 'novo', label: 'Novo' })
    const { findByRole, findByPlaceholderText, findByText } = await render(
      <BrandProvider>
        <Select options={options} creatable onCreate={onCreate} onChange={() => {}} />
      </BrandProvider>,
    )
    const gatilho = await findByRole('combobox')
    await fireEvent.press(gatilho)
    const busca = await findByPlaceholderText('Buscar ou criar...')
    await fireEvent.changeText(busca, 'Novo')
    const criar = await findByText('Criar "Novo"')
    await fireEvent.press(criar)
    await waitFor(() => expect(onCreate).toHaveBeenCalledWith('Novo'))
    // Efeito visível, não só a chamada: a opção criada é comitada (modo simples fecha a
    // folha) e o gatilho passa a mostrar o rótulo criado.
    await waitFor(() => expect(gatilho.props.accessibilityState.expanded).toBe(false))
    expect(await findByText('Novo')).toBeTruthy()
  })
})

describe('Select com grupos', () => {
  it('mostra um cabeçalho de texto antes do primeiro item de cada grupo', async () => {
    const grouped = [
      { value: 'sp', label: 'São Paulo', group: 'Sudeste' },
      { value: 'rj', label: 'Rio de Janeiro', group: 'Sudeste' },
      { value: 'ba', label: 'Bahia', group: 'Nordeste' },
    ]
    const { findByRole, findByText } = await render(
      <BrandProvider>
        <Select options={grouped} />
      </BrandProvider>,
    )
    await fireEvent.press(await findByRole('combobox'))
    expect(await findByText('Sudeste')).toBeTruthy()
    expect(await findByText('Nordeste')).toBeTruthy()
    expect(await findByText('Bahia')).toBeTruthy()
  })
})

describe('Select com loadOptions (fake timers, debounce 250ms)', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('espera 250ms antes de chamar loadOptions', async () => {
    const loadOptions = jest.fn().mockResolvedValue(options)
    const { findByRole, findByText } = await render(
      <BrandProvider>
        <Select loadOptions={loadOptions} />
      </BrandProvider>,
    )
    // `fireEvent` do RNTL 14 é assíncrono (envolve o handler num `act()` interno); sem o
    // `await`, o teste segue antes de o estado `open` (e o efeito de debounce que ele
    // dispara) terminar de ser processado, e o `setTimeout` do debounce só chega a ser
    // agendado depois do `advanceTimersByTime` seguinte já ter avançado o relógio, nunca
    // disparando dentro do avanço esperado (desvio de execução).
    await fireEvent.press(await findByRole('combobox'))
    expect(loadOptions).not.toHaveBeenCalled()
    await act(async () => {
      jest.advanceTimersByTime(250)
    })
    expect(loadOptions).toHaveBeenCalledWith('')
    expect(await findByText('Alfa')).toBeTruthy()
  })

  it('descarta resposta fora de ordem (a primeira requisição resolve depois da segunda)', async () => {
    let resolveFirst!: (value: typeof options) => void
    let resolveSecond!: (value: typeof options) => void
    const loadOptions = jest
      .fn()
      .mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve }))
      .mockImplementationOnce(() => new Promise((resolve) => { resolveSecond = resolve }))
    const { findByRole, findByPlaceholderText, findByText, queryByText } = await render(
      <BrandProvider>
        <Select loadOptions={loadOptions} searchable />
      </BrandProvider>,
    )
    await fireEvent.press(await findByRole('combobox'))
    await act(async () => { jest.advanceTimersByTime(250) })
    const busca = await findByPlaceholderText('Buscar...')
    await fireEvent.changeText(busca, 'x')
    await act(async () => { jest.advanceTimersByTime(250) })
    resolveSecond([{ value: 'b', label: 'Beta' }])
    await act(async () => { await Promise.resolve() })
    resolveFirst([{ value: 'a', label: 'Alfa' }])
    await act(async () => { await Promise.resolve() })
    expect(await findByText('Beta')).toBeTruthy()
    expect(queryByText('Alfa')).toBeNull()
  })

  it('loadOptions rejeitada mostra o texto vazio, em vez de "Carregando opções..." para sempre', async () => {
    // Achado 1 do veredito do Bloco A: `loadOptions(query).then(...)` sem `.catch` deixava
    // "Carregando opções..." para sempre quando a promessa era rejeitada.
    const loadOptions = jest.fn().mockRejectedValue(new Error('falha de rede'))
    const { findByRole, findByText, queryByText } = await render(
      <BrandProvider>
        <Select loadOptions={loadOptions} emptyText="Nada encontrado" />
      </BrandProvider>,
    )
    await fireEvent.press(await findByRole('combobox'))
    await act(async () => {
      jest.advanceTimersByTime(250)
    })
    await act(async () => {
      await Promise.resolve().then(() => Promise.resolve())
    })
    expect(await findByText('Nada encontrado')).toBeTruthy()
    expect(queryByText('Carregando opções...')).toBeNull()
  })
})

describe('Select múltiplo, adorno de limpar e rodapé', () => {
  it('o "X" de limpar e o botão "Limpar" do rodapé não compartilham o mesmo rótulo acessível', async () => {
    // Achado 4 do veredito do Bloco A: os dois elementos usavam
    // accessibilityLabel="Limpar seleção", ambíguo para leitor de tela quando os dois
    // estão visíveis ao mesmo tempo (folha aberta, com valor aplicado).
    const { findByRole, findAllByLabelText } = await render(
      <BrandProvider>
        <Select multiple options={options} value={['a']} clearable onChange={() => {}} />
      </BrandProvider>,
    )
    await fireEvent.press(await findByRole('combobox'))
    const rotulados = await findAllByLabelText('Limpar seleção')
    expect(rotulados).toHaveLength(1)
  })

  it('achado do Playwright (test:a11y): o adorno de limpar tem accessibilityRole="button"', async () => {
    // axe (WCAG "aria-prohibited-attr") reprovava esse adorno no export web real: sem
    // accessibilityRole, o react-native-web renderiza um <div> sem role, e aria-label num
    // elemento sem role válido é proibido pela especificação ARIA.
    const { findAllByLabelText } = await render(
      <BrandProvider>
        <Select options={options} value="a" clearable onChange={() => {}} />
      </BrandProvider>,
    )
    const limpar = (await findAllByLabelText('Limpar seleção'))[0]
    expect(limpar.props.accessibilityRole).toBe('button')
  })
})
