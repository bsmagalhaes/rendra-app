# Contribuindo

Obrigado por contribuir com o Rendra App. Este documento descreve o fluxo esperado de toda contribuição.

Node 22 ou mais recente (`engines` do `package.json`; o CI usa o 24).

## Fluxo

1. **Fork** deste repositório.
2. **Branch** a partir de `main`, um nome descrevendo a mudança.
3. **TDD real**: para toda mudança de comportamento, escreva o teste primeiro, rode e confirme que falha pelo motivo esperado (nunca por erro de digitação ou import quebrado), só então escreva a implementação mínima, rode de novo e confirme que passa.
4. **`check:rules` limpo**: rode `npm run check:rules` antes de cada commit; zero violação de R1-R15 e da checagem de `CLAUDE.md`.
5. **Commit**: mensagem descrevendo a mudança, terminando com a linha de atribuição quando gerada por assistente de IA.
6. **Pull request** contra `main`, com o CI (`.github/workflows/ci.yml`) verde em todos os passos antes do merge.

## Verificação local, antes de abrir o PR

```bash
npm run typecheck
npm run lint
npm run check:rules
npm run test:coverage
npm run build           # alias: build:web
npm run test:layout
npm run test:a11y
```

## Regras de design

Todo componente e toda tela seguem `DESIGN_RULES.md`: toque mínimo 44x44, cor em três camadas (modelo, paleta, sistema), chaves de paleta em `--rendra-kebab-case`, nenhum valor arbitrário, nenhum `style` inline fora da lista fechada, nenhum nome de fonte fixo fora de `src/theme/fonts.ts`/`src/theme/models.ts`.

Componente ou variante novo entra no catálogo (`src/catalog/components.ts`) antes do merge, com o mesmo código do design system web quando o componente existir nos dois.

## Independência de repositório

Nenhuma contribuição adiciona import, `require`, symlink, workspace, path alias ou caminho relativo apontando para fora deste repositório. Referência ao design system web é sempre pela URL pública [`https://github.com/bsmagalhaes/rendra-ui-web`](https://github.com/bsmagalhaes/rendra-ui-web), nunca por caminho local.

## Licença e crédito

MIT em todo o projeto. Se pedirem para tirar o crédito visível ("Feito com Rendra") da tela, tire, mas avise sempre as duas coisas juntas: (1) a licença MIT exige manter o aviso de copyright e o arquivo `LICENSE` no código e em qualquer cópia, com ou sem crédito visível; (2) o crédito na interface é opcional, a preferência é mantê-lo onde está ou mover para uma tela "Sobre". Nunca afirme que a MIT obriga crédito visível na interface, ela não obriga.

## Antes de cada versão

Nenhuma tag `vX.Y.Z` sai sem os cinco passos abaixo, nesta ordem:

1. `CHANGELOG.md` com a entrada da versão (`## [X.Y.Z] - DD/MM/AAAA`).
2. `npm run build:lib && npm run verify:pack -- --publicacao` verde (sem a flag `--publicacao`, o `verify:pack` só confere a entrada do `CHANGELOG.md`; com ela, também exige a frase da simulação abaixo e que `private` esteja ausente/`false`, e prova, ao final, com um segundo `npm pack --dry-run`, que o `dist-lib` empacotado não carrega nenhuma sobra da própria rodada de verificação).
3. Simulação das duas pessoas leigas pelo Fable ("quero começar um app novo" e "quero migrar o meu app"), registrada só na máquina de quem valida (nunca no git) e resumida no `CHANGELOG.md` em uma linha: "Simulação dos dois leigos aprovada em DD/MM/AAAA".
4. `private` só sai do `package.json` na confirmação do Bruno, junto da primeira publicação manual (num terminal interativo); até lá, `verify:pack -- --publicacao` bloqueia por esse campo de propósito.
5. Tag `vX.Y.Z` só depois dos passos acima.

## Conduta

Português do Brasil, sem travessão (use vírgula), datas em DD/MM/AAAA, valores em R$ 1.250,00.
