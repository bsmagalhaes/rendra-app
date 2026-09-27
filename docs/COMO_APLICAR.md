# Como aplicar a marca

Trocar marca no Rendra App é sempre: 4 cores, degradê, modelo, nome e logotipo. Nunca mexer em componente para trocar marca.

Node 22 ou mais recente (`engines` do `package.json`; o CI usa o 24).

## Pré-requisitos

Expo SDK 57 ou mais recente, React Native 0.86 ou mais recente, NativeWind 4.2 ou mais recente (os mínimos de `peerDependencies` do pacote `@rendra-ui/app`). Abaixo disso, o piso real e o que fazer (atualizar primeiro ou refazer) estão em `docs/PROMPT_MIGRACAO.md`, CAMINHO B.

## Os três caminhos

Quem já tem um app existente migra por um de três caminhos, escolhido por um critério simples (detalhado em `docs/PROMPT_MIGRACAO.md`): **pacote npm**, para manter o app como está e migrar tela por tela; **cópia dos arquivos**, quando o app não recebe o pacote (Expo antigo, sem NativeWind), mas o código vale a pena; **refazer**, quando o app não vale a pena manter. Quem começa um projeto novo usa o clone direto (ver "Limpeza do clone" abaixo). O prompt completo, com os três caminhos detalhados, está em `docs/PROMPT_MIGRACAO.md`.

## Pelo pacote npm

Enquanto `npm view @rendra-ui/app version` não responder, o pacote ainda não foi publicado: use "cópia dos arquivos" em vez deste caminho. Quando responder, instalação e configuração, uma vez só, no app de destino:

```bash
npm install @rendra-ui/app nativewind tailwindcss@3
npx expo install react react-native react-native-reanimated react-native-gesture-handler react-native-safe-area-context react-native-svg @react-native-async-storage/async-storage expo-status-bar
```

O pacote e o Tailwind vêm pelo `npm install` comum (fixando `tailwindcss@3`: a `latest` do Tailwind é a 4, e a NativeWind só suporta Tailwind CSS v3); os peers nativos vêm pelo `npx expo install`, que escolhe sozinho a versão de cada um que o SDK do app empacota, em vez da versão mais nova do npm (que pode não bater com o Expo Go). `tailwind.config.js`: `presets: [require('@rendra-ui/app/tailwind-preset')]`, `content` incluindo `./node_modules/@rendra-ui/app/dist-lib/**/*.js`. `global.css` com as três diretivas do Tailwind. `babel.config.js` com `jsxImportSource: 'nativewind'` e o preset `nativewind/babel`. `metro.config.js` com `withNativeWind`. Na raiz do app: `registerIconInterop()` uma vez (de `@rendra-ui/app`), `<BrandProvider>` envolvendo a árvore, e, com Expo Router, `<RendraRouterBridge>` de `@rendra-ui/app/router-bridge`.

Componentes como `Button` usam `react-native-reanimated` (`useAnimatedStyle`), que exige o plugin `react-native-worklets/plugin` no Babel para funcionar. Em app Expo, o `babel-preset-expo` já inclui esse plugin sozinho (nenhum passo extra, `expo-status-bar` acima é peer obrigatório, não opcional). Em bare React Native sem `babel-preset-expo`, acrescente `react-native-worklets/plugin` aos `plugins` do `babel.config.js` à mão; sem ele, os componentes animados quebram no primeiro toque.

## Limpeza do clone

Quem clona este repositório para começar um projeto novo (em vez de instalar o pacote) roda `npm run clean:clone -- --nome <nome>` uma única vez, logo depois do `npm install`. O script troca o nome e os campos de publicação do `package.json`, remove o workflow de publicação, o `build:lib` e o `verify:pack`, mantendo licença, crédito e autoria.

## Ordem de migração

Ao trazer o Rendra App para um app existente (caminho A ou B de `docs/PROMPT_MIGRACAO.md`), a ordem que menos quebra o app no meio do caminho: (1) tokens e tema (cores, tipografia, espaço); (2) `BrandProvider` e a ponte de navegação (`RendraRouterBridge` ou `RendraNavigationProvider` próprio); (3) formulários e ações (`Input`, `Select`, `Button`); (4) listagens (`List`, `Card`, `Table`); (5) feedback (`Toast`, `Alert`, `Modal`); (6) as demais telas; (7) limpeza dos estilos antigos que sobraram.

## 1. As 4 cores e o degradê

Toda paleta nasce de 4 cores mais um degradê de 3 paradas:

Quem instalou o pacote importa de `@rendra-ui/app`; quem clonou este repositório usa o caminho relativo `@/brand` (alias deste projeto). Os exemplos abaixo mostram o caminho relativo (clone); trocar por `@rendra-ui/app` é só a origem do import.

```ts
import type { PaletteSeeds } from '@/brand/palette'

const minhaMarca: PaletteSeeds = {
  id: 'minha-marca',
  name: 'Minha Marca',
  primary: '#ffcc00',
  primaryHover: '#e6b800',
  secondary: '#ff6699',
  secondaryHover: '#e0507f',
  gradient: ['#ffe680', '#ffcc00', '#b38f00'],
}
```

`createPalette` (`src/brand/palette.ts`) deriva o resto (estados hover, texto sobre cor, sidebar) por contraste, sempre garantindo AA (>= 4.5:1) nos pares texto/fundo. Se uma cor de origem não passar AA com texto branco ou preto, `createPalette` ajusta automaticamente e registra o ajuste em `palette.adjustments`.

## 2. Modelo (fonte e formato de raio)

3 modelos prontos: `T1` Safira (Poppins, raio arredondado), `T2` Equilíbrio (DM Sans), `T3` Aurora (Inter). Um modelo personalizado segue a mesma forma, em `src/theme/models.ts`.

## 3. Aplicar em runtime, sem mexer em componente

```tsx
import { useBrand } from '@/brand'

function TrocarMarca() {
  const { applyPalette, setPaletteId, setModelCode, setMode } = useBrand()

  function aplicarMinhaMarca() {
    applyPalette(minhaMarca)   // registra a paleta (createPalette por baixo)
    setPaletteId('minha-marca') // ativa a paleta registrada
    setModelCode('T1')          // troca o modelo (fonte + raio)
    setMode('system')           // claro, escuro ou 'system' (segue o SO)
  }

  return null
}
```

`useBrand().setModelAndPalette(codigo, paletteId)` troca os dois numa escrita só, quando as duas mudanças acontecem juntas (evita duas re-renderizações). Toda troca persiste localmente (`AsyncStorage`) e reflete imediatamente em `themeVars` (a mesma saída que alimenta `vars()` na `View` raiz do `BrandProvider`), sem recarregar o app.

## 4. Nome do produto

`BrandConfig.productName` (`src/brand/types.ts`), junto de `companyName` e `tagline`. Cada marca configurada em `src/brand/brand.config.ts` tem seu próprio `BrandConfig`.

## 5. Logotipo

`BrandConfig.symbol` (selo/símbolo) e `BrandConfig.logo` (`{ light, dark }`, logotipo completo) são campos opcionais: nenhuma arte própria é obrigatória, e o `BrandLogo` (`src/components/ui/brand-logo.tsx`) já usa um símbolo genérico interno quando `symbol` não existe. Quem for aplicar a marca pode deixar os dois campos vazios; o `BrandProvider` funciona normalmente sem eles (cor, fonte e raio já trocam de ponta a ponta pelas etapas 1-3 acima).

## Verificação via seletor real ou por URL

Na `/galeria`, os três `ButtonGroup` (Modelo, Paleta, Modo) trocam ao vivo pelo controle real, sem recarregar. Como alternativa (ou em qualquer outra rota), a troca de modelo/paleta/modo é verificável por parâmetro de URL: `?codigo=T#-C#` (modelo e paleta) e `?modo=claro|escuro|sistema` (modo), lidos por `ModelCodeFromUrl` dentro do `BrandProvider`. Exemplo: `/galeria?codigo=T3-C4`.
