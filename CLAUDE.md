# CLAUDE.md

Autor: Bruno Magalhaes, brunomagalhaes.me, instagram.com/brunomagalhaes.me.

Início de leitura: `@AGENTS.md` (em um minuto, comandos, regras que não podem ser quebradas).

## Leitura obrigatória

`DESIGN_RULES.md`, antes de qualquer alteração de tela, componente ou token.

## Resumo do projeto

Design system e boilerplate mobile do Rendra, completo, com 44 componentes de UI (spec de fundação e componentes), publicado como pacote npm (`@rendra-ui/app`, primeira publicação em 0.3.0; a versão corrente está em `CHANGELOG.md`). Sobre a fundação: scaffold Expo Router + NativeWind, tokens, os 3 modelos, `BrandProvider`/`useBrand`, `Gradient`, fontes, `check:rules`, vitrine completa (`/componentes`, `/tokens` e `/galeria`).

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

## Como trabalhar aqui

- Teste primeiro, sempre: vermelho comprovado pelo motivo esperado, depois a implementação mínima, depois verde.
- Nenhuma tarefa toca arquivo fora do escopo que ela mesma declara.
- `check:rules` limpo antes de qualquer commit (R1-R15, mais a checagem desta seção contra `docs/reference/claude-md-matriz-modelos.txt`).
- Português do Brasil, sem travessão (use vírgula), datas em DD/MM/AAAA, valores em R$ 1.250,00.
- Nenhum arquivo deste repositório referencia o repositório do design system web por caminho local; só pela URL pública `https://github.com/bsmagalhaes/rendra-design-system`.
- Licença e crédito: MIT em todo o projeto. Se pedirem para tirar o crédito visível ("Feito com Rendra") da tela, tire, mas avise sempre as duas coisas juntas: (1) a licença MIT exige manter o aviso de copyright e o arquivo `LICENSE` no código e em qualquer cópia, com ou sem crédito visível; (2) o crédito na interface é opcional, a preferência é mantê-lo onde está ou mover para uma tela "Sobre". Nunca afirme que a MIT obriga crédito visível na interface, ela não obriga.

## Matriz de modelos (inegociável)

| Etapa | Modelo | Confronta código |
|---|---|---|
| Levantamento | Fable | Sim, no código atual, obrigatório antes de todo plano |
| Plano e spec | Sonnet | Não lê código; parte obrigatoriamente do levantamento do Fable |
| Validação do plano | Opus | Sim |
| Execução | Sonnet | Não |
| Validação da entrega | Fable | Sim |

Nenhum modelo valida o que ele mesmo escreveu.

Escopo obrigatório: Fable e Opus recebem apenas os arquivos do escopo mais o contrato do módulo, nunca o repositório inteiro. A validação da entrega olha o diff e a saída dos testes.

Briefing com mais de 24 horas ou com commits no meio é refeito, não reaproveitado.

Fluxo curto, para bug pequeno e correção óbvia: Sonnet escreve o teste que reproduz, corrige, e o Fable valida apenas os bloqueadores. Duas etapas.

### Regras de execução (inegociáveis, junto com a matriz)

1. Levantamento obrigatório: nenhum plano começa sem levantamento do Fable feito no código atual, com arquivos, assinaturas e testes existentes citados por caminho e linha. O plano se baseia nesse levantamento. Plano sem levantamento, ou com levantamento anterior a commits no escopo, é recusado.
2. Uma rodada de validação por plano: o Opus valida uma vez. O que sobrar vira correção na execução, e o Fable confere na validação da entrega.
3. Um lote por vez: sem execução em paralelo em branches ou worktrees.
4. Teste afirma o resultado, não a chamada. No servidor, a mensagem entra pelo webhook ou pela recepção, e o teste afirma o que ficou gravado no banco. Na tela, o teste afirma o efeito que o usuário vê (classe no `<html>`, texto na tela, item na lista, estado acessível), e não só que o `onChange` foi chamado.
5. Pré-validação do executor, obrigatória antes de relatar cada tarefa, colada no relatório: (a) teste visto vermelho pelo motivo esperado, com a mensagem; (b) verde, com a saída do teste; (c) typecheck, lint e `check:rules` limpos; (d) `git diff --stat` só com arquivos do escopo declarado; (e) cada asserção nova confere efeito, não só chamada; (f) sem TODO, código morto ou `console.log`. A validação da entrega recusa tarefa sem essa lista.

### Checklist bloqueador (100 por cento, sem exceção)

Cada linha exige arquivo ou teste que comprove.

1. Contrato do módulo intacto, nenhuma assinatura pública alterada sem versionamento
2. Isolamento de dados entre clientes preservado, nenhuma consulta sem o filtro que o separa
3. Existe teste que falha sem a mudança e passa com ela
4. Migração reversível, nenhuma operação destrutiva sem rollback
5. Nenhum arquivo fora do escopo declarado foi tocado

### Checklist de qualidade (mínimo 80 por cento)

1. Caminho de erro coberto por teste
2. Sem duplicação de lógica já existente no módulo
3. Nomes e padrões seguindo o projeto
4. Sem TODO e sem código morto
5. Teste de navegador cobrindo o fluxo principal, quando houver interface

### Formato do veredito

Item, aprovado ou reprovado, arquivo ou teste que comprova, uma linha de justificativa. Percentual apenas ao final e apenas como sinal de alerta. O portão é o binário. Item que não pode ser respondido com sim ou não está grande demais e deve ser quebrado.
