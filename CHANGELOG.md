# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

## [0.3.0] - 27/09/2026

### Alterado

- `@rendra-ui/app` vira um pacote npm de verdade (padrão dos produtos Rendra, seção 5): `exports` com `.`, `./router-bridge`, `./fonts` e `./tailwind-preset`; `peerDependencies` reais (`react`, `react-native`, `expo`, `nativewind`, `react-native-reanimated`, `react-native-gesture-handler`, `react-native-safe-area-context`, `react-native-svg`, `@react-native-async-storage/async-storage`, `tailwindcss`, `expo-status-bar`, mais `expo-font`/`react-native-web` opcionais; `expo-status-bar` é peer obrigatório, não opcional, porque `ThemedStatusBar` o importa sem checagem na entrada principal); `sideEffects` com os três arquivos que chamam `cssInterop` no topo; `expo-router` sai de `dependencies` (fica só em `devDependencies`, nunca publicado como dependência do pacote).
- `expo-router` isolado do núcleo em `src/router-bridge.tsx` (subcaminho `./router-bridge`): nenhum outro arquivo de `src/` importa o roteador direto; `List` usa `linkComponent`/`navigate` do novo contexto de navegação (`src/navigation/rendra-navigation.tsx`).
- `ModelCodeFromUrl` sai do barrel `src/brand/index.ts` e passa a ser exportado só por `./router-bridge` (única assinatura pública alterada neste lote; continua documentado em `docs/COMO_APLICAR.md`).
- `BrandProvider` aceita `brands`/`brand` opcional, com um padrão interno mínimo derivado dos 3 modelos, sem a marca de demonstração da vitrine (`children` continua obrigatório).
- `src/index.ts` (entrada principal do pacote) e `src/theme/tailwind-preset.ts` (preset do Tailwind/NativeWind, também consumido por `tailwind.config.ts` da raiz).
- `build:lib` (`npm run build:lib`) gera `dist-lib/` com o cabeçalho de autoria em cada arquivo, com `jsxImportSource: nativewind` (o `className` dos componentes chega ao runtime do NativeWind em quem instala).
- `verify:pack` (`npm run verify:pack`) empacota o `package.json` real (`npm pack`, tarball de verdade, nunca `--dry-run`), instala o tarball num projeto temporário e renderiza um componente de verdade (com hook) a partir do `dist-lib/` instalado, nunca do fonte.
- CI roda `build:lib` e `verify:pack` em todo push/PR; workflow `publish.yml` publica por tag (`v*`), com procedência (`--provenance`), só no repositório oficial.
- Regra um ("o link basta", padrão dos produtos Rendra, seção 1): `AGENTS.md` ganha o fluxo de início com os três ramos (dentro do repositório, projeto novo, migração) e o "Passo 2" (tipo de trabalho); os demais arquivos de agente (`CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`, `.cursor/rules/rendra.mdc`, `.windsurfrules`) passam a só resumir e apontar para o `AGENTS.md`, com o mesmo bloco de verificação provado igual por teste; `npm run clean:clone -- --nome <nome>` troca a identidade de pacote do Rendra pela do projeto clonado, mantendo licença e crédito; `docs/PROMPT_MIGRACAO.md`, `docs/COMO_APLICAR.md` e `README.md` passam a apresentar os três caminhos (pacote npm, cópia dos arquivos, refazer), com o mesmo critério de escolha e a mesma versão mínima de Node nos quatro documentos.
- Simulação dos dois leigos aprovada em 27/09/2026 (Regra um, item 7): os dois perfis (começar um projeto novo e migrar um sistema existente) percorridos de ponta a ponta, sem lacuna bloqueadora no repositório (detalhe na validação da entrega). `private` sai de `true`: a trava contra publicação acidental fica no `publish.yml` (só dispara por tag `v*`, com guarda de repositório) e em `npm run verify:pack -- --publicacao`.

### Pendente

- Publicação em si: `npm publish` continua manual, num terminal interativo, feito pelo Bruno (padrão dos produtos Rendra, seção 1, item 5); nenhuma tarefa deste lote cria tag nem publica. Enquanto a tag não sai, `npm install @rendra-ui/app` não funciona; use "cópia dos arquivos".
- CLI (`rendra-app`), registry de componentes e skill de IA (padrão dos produtos Rendra, seção 5.7 e seção 1 item 3): fora do escopo deste lote, sem desenho ainda; o app não tem `bin`.
- Sincronização 1 com o web (prefixo `--rendra-*`/`data-rendra`, catálogo de códigos de componente): fora do escopo deste lote, aguarda levantamento próprio sobre o repositório web.

## [0.2.0] - 26/09/2026

### Adicionado

- Os 43 componentes de UI da F1b, em 4 lotes: Ações (Button, ButtonGroup, ActionBar, DropdownMenu); Formulário (Input, Textarea, Select, Checkbox, CheckboxGroup, RadioGroup, Switch, Slider, OtpInput, DatePicker, Field, Form); Feedback e overlays (BrandFeedbackIcon, Alert, Toast, Progress, Skeleton, EmptyState, InfoHint, Modal, Drawer); Exibição composta e Layout (Card, Badge, Avatar, AvatarGroup, List, StatCard, Accordion, Tabs, Separator, BrandLogo, Container, Stack, Inline, Grid, Section, PageHeader).
- Rota `/componentes` (vitrine completa, 40 entradas reais em 5 grupos: Ações 4, Formulário 12, Feedback 9, Exibição 9, Layout 6); raiz do app redireciona para ela.
- `/galeria` completa: troca ao vivo de modelo, paleta e modo pelo controle real (`ButtonGroup`), sem recarregar e sem reverter a troca manual.
- Piso de cobertura (`coverageThreshold`, `jest.config.js`): 90% em `src/lib`, 80% em `src/components` e `src/theme`.
- `a11yPresets` completo (`tabpanel`, `link`, mais os papéis já existentes).
- Correção da armadilha do `ModelCodeFromUrl` (troca ao vivo revertida pela reaplicação de `?codigo=`/`?modo=`).

## [0.1.0] - 24/09/2026

### Adicionado

- Scaffold Expo Router + TypeScript estrito + NativeWind 4.2.7.
- Tokens de cor, tipografia, espaço, raio e sombra (`tailwind.config.ts`), zerados e sem `theme.extend`.
- `src/brand/palette.ts` portado do web, 4 paletas prontas (Safira, Equilíbrio, Aurora, Ardósia).
- 3 modelos (Safira/Poppins, Equilíbrio/DM Sans, Aurora/Inter), `BrandProvider`/`useBrand`, persistência em `AsyncStorage`.
- `Gradient` em SVG (brand, soft, accent).
- `check:rules` (R1-R13) com `ts-morph`, já reservando exceções de `style` para os componentes da próxima entrega.
- Rotas `/tokens` (paleta com AA ao vivo, tipografia, espaço, raio, sombra) e `/galeria` (leitura de `?codigo=`, links de combinação T#-C#).
- Export web (`experiments.baseUrl`), Playwright + axe sobre `/tokens` e `/galeria` (2 larguras, claro/escuro, 4 paletas).
- CI (GitHub Actions): typecheck, lint, check:rules, testes, export, Playwright; publicação no GitHub Pages em push para `main`.
- Documentação e fluxo de IA completos (`AGENTS.md`, `CLAUDE.md` com matriz de modelos verbatim, `GEMINI.md`, instruções de Copilot/Cursor/Windsurf, `DESIGN_RULES.md`, `README.md`, `docs/BRIEFING_MODELO.md`, `docs/COMO_APLICAR.md`, `docs/PROMPT_MIGRACAO.md`, `CONTRIBUTING.md`).
