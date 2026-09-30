// Prova de fim a fim do pacote (padrão dos produtos Rendra, seção 5.5): renderiza componentes
// de verdade a partir do tarball REAL, instalado num projeto temporário fora deste repositório
// (scripts/verify-pack.ts, Tarefa 4.3), nunca a partir do fonte (`src/index.ts`) nem de
// `dist-lib/` deste repositório direto. `RENDRA_PACK_ENTRY` (caminho absoluto de
// `<projeto-temporário>/node_modules/@rendra-ui/app/dist-lib/index.js`) só existe quando
// `scripts/verify-pack.ts` chama esta suíte; sem ela, a suíte inteira é pulada (não quebra o
// `test:coverage`/CI comum, que não define essa variável).
import { render, fireEvent } from '@testing-library/react-native'
import { Text } from 'react-native'
import { createElement, useState, type ReactElement } from 'react'

const RENDRA_PACK_ENTRY = process.env.RENDRA_PACK_ENTRY

const descrever = RENDRA_PACK_ENTRY ? describe : describe.skip

descrever('consumidor do pacote instalado de verdade (@rendra-ui/app)', () => {
  it('renderiza BrandProvider + Checkbox (hook) + Button a partir do dist-lib instalado, com as classes NativeWind efetivas', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- caminho vem de env var em runtime (projeto temporario fora do repositorio), nao ha como usar import estatico aqui
    const pacote = require(RENDRA_PACK_ENTRY as string)
    const { BrandProvider, Checkbox, Button, RendraNavigationProvider, useRendraNavigation } = pacote as {
      BrandProvider: (props: { children?: ReactElement }) => ReactElement
      Checkbox: (props: {
        checked: boolean
        onCheckedChange: (v: boolean) => void
        accessibilityLabel: string
      }) => ReactElement
      Button: (props: { children?: string }) => ReactElement
      RendraNavigationProvider: (props: { value: unknown; children?: ReactElement }) => ReactElement
      useRendraNavigation: () => unknown
    }
    // Lacuna 4 do veredito Fable: README.md:262, docs/PROMPT_MIGRACAO.md:43 e
    // docs/COMO_APLICAR.md:33 prometem RendraNavigationProvider/useRendraNavigation "de
    // @rendra-ui/app"; a prova real é importar pelo nome do pacote, a partir do tarball
    // instalado (nunca do fonte).
    expect(typeof RendraNavigationProvider).toBe('function')
    expect(typeof useRendraNavigation).toBe('function')

    function Sonda() {
      const [marcado, setMarcado] = useState(false)
      return createElement(
        BrandProvider,
        null,
        createElement(Checkbox, { checked: marcado, onCheckedChange: setMarcado, accessibilityLabel: 'Aceito' }),
        createElement(Button, null, 'Confirmar'),
      )
    }

    const { getByRole, getByText } = await render(createElement(Sonda))
    const caixa = await getByRole('checkbox')
    expect(caixa.props.accessibilityState.checked).toBe(false)
    await fireEvent.press(caixa)
    const caixaDepois = await getByRole('checkbox')
    expect(caixaDepois.props.accessibilityState.checked).toBe(true)
    expect(getByText('Confirmar')).toBeTruthy()
    // Este teste prova o componente publicado de verdade (hook útil, efeito de toque real,
    // vindo do tarball instalado, nunca do fonte). A prova de que o JSX saiu com o runtime do
    // NativeWind (jsxImportSource: nativewind, Tarefa 3.4), não com react/jsx-runtime, é
    // estática, sobre o próprio arquivo compilado (`require("nativewind/jsx-runtime")` em
    // dist-lib/components/ui/button.js): scripts/verify-pack.ts confere isso no passo 8
    // (achado M6 do veredito da entrega dos Blocos 3 e 4), antes de chamar esta suíte.
    // Resolver `className` em `style` de verdade também exige o pipeline de CSS do
    // Metro/NativeWind (que gera e registra o stylesheet), inexistente neste Jest isolado; por
    // isso a prova aqui é funcional (o componente publicado funciona), e a prova do runtime é
    // estática, no arquivo gerado.
  }, 60000)

  it('renderiza o AppShell a partir do dist-lib instalado, com conteúdo e menu do usuário', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- caminho vem de env var em runtime (projeto temporario fora do repositorio)
    const pacote = require(RENDRA_PACK_ENTRY as string)
    const { BrandProvider, RendraNavigationProvider, AppShell } = pacote as {
      BrandProvider: (props: { children?: ReactElement }) => ReactElement
      RendraNavigationProvider: (props: { value: unknown; children?: ReactElement }) => ReactElement
      AppShell: (props: { navigation: unknown; user: unknown; children?: ReactElement }) => ReactElement
    }
    expect(typeof AppShell).toBe('function')

    const navigation = [
      { title: 'Geral', items: [{ title: 'Início', to: '/', icon: () => null, bottomNav: true }] },
    ]
    const { findByText, findByRole } = await render(
      createElement(
        BrandProvider,
        null,
        createElement(
          RendraNavigationProvider,
          { value: { navigate: () => {}, currentPath: '/' } },
          createElement(
            AppShell,
            { navigation, user: { name: 'Ana Ribeiro' } },
            createElement(Text, null, 'Conteúdo do consumidor'),
          ),
        ),
      ),
    )
    expect(await findByText('Conteúdo do consumidor')).toBeTruthy()
    expect(await findByRole('button', { name: /Ana Ribeiro/ })).toBeTruthy()
  }, 60000)
})
