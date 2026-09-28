# AGENTS.md

Autor: Bruno Magalhaes, brunomagalhaes.me, instagram.com/brunomagalhaes.me.

## Em um minuto

O Rendra App é o design system e boilerplate mobile do Rendra, em React Native (Expo) com Expo Router e NativeWind. Mesma finalidade do Rendra web (`https://github.com/bsmagalhaes/rendra-design-system`): base para todo app novo, publicado sob licença MIT. Quem conhece o Rendra web reconhece aqui a mesma arquitetura de tokens em três camadas (modelo, paleta, sistema), os mesmos nomes de classe Tailwind, os mesmos nomes de componente e prop, e o mesmo fluxo de briefing para IA, sem tradução.

O design system completo prevê 44 componentes de UI (`src/components/ui`, `src/components/layout`) organizados em 41 entradas de vitrine (`/componentes`), disponíveis desde a F1b (o `Spinner` entrou na Sincronização 1), sobre a fundação da F1a: scaffold, tokens, os 3 modelos (Safira/Poppins, Equilíbrio/DM Sans, Aurora/Inter), `BrandProvider`/`useBrand`, `Gradient`, fontes, `check:rules`, e a vitrine completa (`/componentes`, `/tokens` e `/galeria`). A versão corrente está em `CHANGELOG.md`.

## Fluxo de início: descubra em qual ramo você está

**(a) Já está dentro do repositório.** Confira `docs/BRIEFING.md` no disco (fora do git, `.gitignore`). Se existir e estiver marcado "confirmado", siga direto para o plano; se for "rascunho", retome a partir dele; se não existir, comece o briefing (`docs/BRIEFING_MODELO.md`). Depois, siga o "Fluxo de desenvolvimento" abaixo.

**(b) Recebeu o link para começar um projeto novo.** Tudo abaixo é feito pela IA, nunca pedido à pessoa:

1. `git clone https://github.com/bsmagalhaes/rendra-app.git <nome-da-pasta>`.
2. Apagar `.git` e `git init` (perguntar se a pessoa quer ligar a um repositório próprio no GitHub dela).
3. Conferir a versão do Node instalada: Node 22 ou mais recente (`engines` do `package.json`; o CI usa o 24).
4. `npm install`.
5. `npm run clean:clone -- --nome <nome>` (troca a identidade de pacote do Rendra pela do projeto novo, mantendo licença e crédito).
6. `npx expo start --web` e informar o endereço impresso no terminal (normalmente `http://localhost:8081`, ou a porta que o Metro escolher se a 8081 estiver ocupada, ver `--port` abaixo).
7. Ver no celular: abrir o Expo Go e escanear o QR code impresso no terminal; se não conectar (rede corporativa, VPN), usar `npx expo start --tunnel`.
8. `npx playwright install chromium`, só quando for rodar `test:layout`/`test:a11y`.

Se o projeto for publicar em domínio próprio (GitHub Pages ou outro), defina `homepage` no
`package.json` (ou a variável `SITE_URL` no comando de build) com o endereço público real: sem
isso, `npm run build` gera `sitemap.xml`, `robots.txt` e `og:url` apontando para o domínio do
Rendra, não para o do projeto novo.

Depois, siga para o "Passo 2" e o briefing (`docs/BRIEFING_MODELO.md`).

**(c) Recebeu o link dentro de um sistema que já existe.** Leia pela URL, nesta ordem: `AGENTS.md`, `DESIGN_RULES.md`, `docs/PROMPT_MIGRACAO.md`, `docs/COMO_APLICAR.md`. Analise o sistema antes de perguntar: versões de `react-native`/`expo`/`react`/`nativewind` no `package.json`; se é Expo ou bare React Native; qual navegação (Expo Router, React Navigation, outro); onde ficam estilos e cores hoje; se o código vale a pena manter.

Critério de escolha, em uma frase, recomendado e nunca perguntado à pessoa: Expo SDK 57 ou mais recente com React Native 0.86 ou mais recente (os mínimos de `peerDependencies` do `package.json`) e quer se manter atualizado, **pacote npm**; Expo mais antigo, bare React Native sem NativeWind, ou estrutura que não recebe o pacote, mas dentro do piso real dos componentes animados (**React Native 0.83 ou mais recente**, pela Reanimated 4; `expo`/`expo-modules-core` via `npx install-expo-modules` num bare, detalhado em `docs/PROMPT_MIGRACAO.md`, CAMINHO B) e o código vale a pena, **cópia dos arquivos**; abaixo desse piso, atualize o React Native primeiro (passos no CAMINHO B) quando o código valer a pena, senão **refazer**; sistema que não vale manter de forma nenhuma, **refazer** direto. Enquanto `npm view @rendra-ui/app version` não responder, o pacote ainda não foi publicado: recomende o caminho B (cópia), ou a decisão acima se o app estiver abaixo do piso. Recomende o caminho e peça confirmação, nunca pergunte qual dos três. Depois, briefing com o bloco "Somente para migração" preenchido (`docs/BRIEFING_MODELO.md`).

Em qualquer ramo: comandos, instalação, testes e capturas de tela são sempre feitos pela IA; à pessoa cabe só decidir e aprovar. Quando alguma etapa exigir uma ação dela (login, confirmação no navegador, código de verificação), a IA explica exatamente o que fazer em uma linha. Só anuncie conclusão com tudo passando.

### Passo 2: perguntar o tipo de trabalho

Antes do briefing, pergunte em uma mensagem, com opções numeradas:

1. Projeto novo (ramo b).
2. Migração de um sistema existente (ramo c).
3. Contribuição para o próprio Rendra App (ramo a, ver `CONTRIBUTING.md`).

## Fluxo de desenvolvimento (matriz de modelos), 5 etapas

1. **Levantamento**: entender o pedido, o estado atual do repositório e o que já existe em `CHANGELOG.md`.
2. **Spec e plano**: escrever a partir do briefing, sem confrontar código de repositório nenhum.
3. **Validação do plano**: confrontar o plano contra a spec e o contrato de origem, arquivo por arquivo do escopo declarado.
4. **Execução**: implementar tarefa a tarefa, teste primeiro, sempre TDD real (vermelho comprovado, depois verde).
5. **Validação da entrega**: revisar o diff e a saída dos testes, nunca confiar só na leitura do código.

A tabela completa de qual modelo de IA cumpre cada etapa está em `CLAUDE.md`, seção "Matriz de modelos (inegociável)", verificada automaticamente por `npm run check:rules`.

## Leitura obrigatória antes de qualquer tarefa

1. `DESIGN_RULES.md`: regras mestras de design, tokens, composição e a lista fechada de exceções de `style` inline.
2. A spec ativa da fase em execução (quando houver uma, registrada localmente, fora deste repositório).
3. O briefing do produto ou da mudança em questão (`docs/BRIEFING_MODELO.md` é o modelo a preencher quando não existir um briefing específico).

## Regras que não podem ser quebradas

- **Independência de repositório**: nenhum arquivo deste repositório contém import, `require`, symlink, workspace, path alias ou caminho relativo apontando para o repositório do design system web ou qualquer pasta fora deste projeto. Todo valor de origem no design system web é copiado para dentro deste repositório, nunca referenciado em build ou runtime. Documentação cita o web só pela URL pública `https://github.com/bsmagalhaes/rendra-design-system`.
- **Cor em três camadas**: modelo (fonte e formato de raio), paleta (4 cores de marca mais degradê, geram todo o resto por contraste), sistema (cores fixas de estado, iguais em toda paleta). Nenhuma cor fixa em componente, fora de `src/theme/tokens.ts`, `src/brand/palette.ts`, `src/brand/palettes.ts` e `src/components/gradient/gradient.tsx`.
- **Chaves de paleta sempre `--kebab-case`**: todo acesso a `palette.light`/`palette.dark` usa `palette.light['--rendra-primary-foreground']`, nunca `palette.light.primaryForeground`.
- **Toque mínimo 44x44** em todo elemento interativo, mesmo quando o conteúdo visual é menor.
- **Nenhum valor arbitrário** fora da escala do `tailwind.config.ts`, nenhum `style` inline fora da lista fechada de `DESIGN_RULES.md`, nenhum nome de fonte fixo fora de `src/theme/fonts.ts`/`src/theme/models.ts`.
- **TDD real**: teste escrito primeiro, rodado e confirmado vermelho pelo motivo esperado, só então a implementação mínima, rodada de novo até verde.
- **`check:rules` limpo** (R1-R15, mais a checagem de `CLAUDE.md`) antes de qualquer commit.
- **Licença e crédito**: MIT em todo o projeto. Se pedirem para tirar o crédito visível ("Feito com Rendra") da tela, tire, mas avise sempre as duas coisas juntas: (1) a licença MIT exige manter o aviso de copyright e o arquivo `LICENSE` no código e em qualquer cópia, com ou sem crédito visível; (2) o crédito na interface é opcional, a preferência é mantê-lo onde está ou mover para uma tela "Sobre". Nunca afirme que a MIT obriga crédito visível na interface, ela não obriga.

## Resumo e verificação

Mesmo bloco em `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`, `.cursor/rules/rendra.mdc` e `.windsurfrules` (provado igual por `scripts/lib/agent-files.test.ts`).

<!-- rendra:verificacao:inicio -->
Leia e siga o `AGENTS.md` na raiz, inteiro, antes de qualquer coisa.

Regras que não podem ser quebradas, resumidas (texto completo em `AGENTS.md`):

1. Independência de repositório: nenhum import, `require`, symlink, workspace, path alias ou caminho relativo aponta para o design system web ou qualquer pasta fora deste projeto; citação só pela URL pública `https://github.com/bsmagalhaes/rendra-design-system`.
2. Cor em três camadas (modelo, paleta, sistema), chaves de paleta sempre `--rendra-kebab-case`, nenhuma cor fixa fora de `src/theme/tokens.ts`, `src/brand/palette.ts`, `src/brand/palettes.ts` e `src/components/gradient/gradient.tsx`.
3. Toque mínimo 44x44 em todo elemento interativo, mesmo quando o conteúdo visual é menor.
4. Nenhum valor arbitrário fora da escala do `tailwind.config.ts`, nenhum `style` inline fora da lista fechada de `DESIGN_RULES.md`, nenhum nome de fonte fixo fora de `src/theme/fonts.ts`/`src/theme/models.ts`.
5. TDD real: teste escrito primeiro, rodado e confirmado vermelho pelo motivo esperado, só então a implementação mínima, rodada de novo até verde.
6. `check:rules` limpo (R1-R15, mais a checagem de `CLAUDE.md`) antes de qualquer commit; licença MIT em todo o projeto, crédito "Feito com Rendra" opcional (ver `AGENTS.md`).

Comandos:

```bash
npm run typecheck
npm run lint
npm run check:rules
npm run test:coverage
npm run build
npm run build:lib
npm run verify:pack
npm run test:layout
npm run test:a11y
```
<!-- rendra:verificacao:fim -->

## Comandos

```bash
npm run typecheck      # tsc --noEmit
npm run lint           # expo lint
npm run check:rules    # R1-R15 + diff de CLAUDE.md
npm run test:coverage  # Jest + jest-expo + RNTL
npm run build           # expo export --platform web (alias: build:web)
npm run build:lib      # tsc -p tsconfig.lib.json + cabeçalho de autoria (dist-lib/)
npm run verify:pack    # npm pack real, instala num projeto temporário, renderiza um componente
npm run test:layout    # Playwright, layout e toque
npm run test:a11y      # Playwright + axe, WCAG 2.1 AA
npm run docs:images    # capturas do README e og-image.png (rode npm run build antes)
```

## Rodar o app em desenvolvimento

```bash
npx expo start                  # dev server (Metro); porta padrão 8081
npx expo start --port <porta>   # se a 8081 estiver ocupada (ex.: Docker)
npx expo start --tunnel         # se o Expo Go não conseguir conectar por rede local
npx expo start --android        # abre num emulador Android (exige ANDROID_HOME configurado)
npx expo start --web            # abre no navegador
```

As rotas ficam na raiz do dev server, sem prefixo (`http://localhost:<porta>/tokens`,
`http://localhost:<porta>/galeria`). O prefixo `/rendra-app/` (`app.json`,
`experiments.baseUrl`) só existe no export estático (`npm run build:web`), consumido pela vitrine
publicada no GitHub Pages e pelos testes Playwright (`npm run test:layout`/`test:a11y`), nunca pelo
`expo start`.

## Conduta

Português do Brasil, sem travessão (use vírgula), datas em DD/MM/AAAA, valores em R$ 1.250,00. Toda tarefa termina com commit próprio; toda mudança de comportamento tem teste que comprova.
