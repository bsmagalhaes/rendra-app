# Briefing Modelo, Rendra App

Modelo de briefing para quem for usar este boilerplate como base de um app novo. Preencher em português do Brasil, um bloco de cada vez. Ao conduzir o levantamento por IA: perguntas agrupadas por bloco, uma decisão de navegação, tema ou cor por mensagem (nunca as três juntas), sempre com opções numeradas para o cliente escolher por número. Briefing com mais de 24 horas ou com commits no meio do levantamento é refeito, não reaproveitado (seção "Matriz de modelos", `CLAUDE.md`).

## Como conduzir

1. Uma decisão por mensagem, sempre com opções numeradas para escolher por número e o padrão já marcado (ex.: "1. Safira (padrão) 2. Equilíbrio 3. Aurora").
2. "não sei, sugira" é aceito em toda pergunta: a IA propõe a opção mais comum e explica em uma frase por que sugere aquela.
3. Nunca peça um código de cor (hex), um SVG ou o código de um componente sem oferecer uma sugestão pronta antes (paleta `C1` a `C4`, símbolo genérico do `BrandLogo`, componente equivalente da vitrine).
4. Pergunte o código de modelo (`T#-C#`) antes do fluxo guiado, com o link da galeria publicada onde cada combinação mostra o próprio código: [`https://bsmagalhaes.github.io/rendra-app/galeria`](https://bsmagalhaes.github.io/rendra-app/galeria).
5. Nenhum passo técnico fica com a pessoa: comandos, instalação, testes e capturas de tela são sempre feitos pela IA; à pessoa cabe só decidir e aprovar.

## Tipo de trabalho

Pergunta inicial, opções numeradas:

1. Projeto novo (a partir do clone do Rendra App).
2. Migração de um sistema existente (ver bloco "Somente para migração" abaixo).
3. Contribuição para o próprio Rendra App (ver `CONTRIBUTING.md`).

## Somente para migração

Preencher só quando o "Tipo de trabalho" for 2:

- Caminho escolhido: A (pacote npm), B (cópia dos arquivos) ou C (refazer do zero). Ver `docs/PROMPT_MIGRACAO.md` para o critério de escolha.
- O que já existe no app de destino (framework de navegação, onde ficam estilos e cores hoje, versões de `expo`/`react-native`/`nativewind`).
- O que se pretende preservar (lógica de negócio, integrações, dados) sem tocar na camada visual.

## Bloco 0: propósito

- Nome do produto:
- Uma frase de propósito (o que o app faz, para quem):
- Critério de sucesso (o que precisa ser verdade para o produto ser considerado pronto):

## Bloco 1: decisões travadas

Decisões que não mudam depois de travadas nesta etapa (mudar depois custa retrabalho de spec e plano):

1. Nome do produto e do repositório.
2. Modelo de marca (`T1` Safira/Poppins, `T2` Equilíbrio/DM Sans, `T3` Aurora/Inter, ou um modelo novo a especificar).
3. Paleta (`C1` Safira, `C2` Equilíbrio, `C3` Aurora, `C4` Ardósia, ou uma paleta de cliente com as 4 cores de marca mais degradê).
4. Modo padrão (claro, escuro, ou sistema).

## Bloco 2: tokens

Confirmar ou ajustar, um valor por vez:

1. As 4 cores de marca (`primary`, `primaryHover`, `secondary`, `secondaryHover`) e o degradê (3 paradas).
2. Formato de raio (`square`, `rounded`, `pill`), já definido pelo modelo escolhido no Bloco 1, a menos que o cliente peça uma combinação diferente.
3. Necessidade de paleta personalizada (fora das 4 prontas), com as 4 cores de origem do cliente.

## Bloco 3: navegação

Diferente do Rendra web (que usa menu lateral), o app nativo escolhe entre:

1. **Abas inferiores** (`Tabs`), para 3 a 5 destinos de mesmo nível, sempre visíveis.
2. **Pilha** (`Stack`), para fluxo sequencial dentro de um destino (lista, detalhe, formulário).
3. **Gaveta** (`Drawer` de navegação, não confundir com o componente `Drawer` de UI), para apps com muitos destinos secundários ou pouco usados.
4. **Combinação**: abas inferiores como raiz, cada aba com sua própria pilha; gaveta reservada para configurações/conta quando houver destino demais para caber nas abas.

Uma decisão por mensagem: primeiro o padrão de navegação (opções acima), depois os destinos de cada nível, depois o rótulo/ícone de cada aba.

## Bloco 4: escopo

- Telas previstas, agrupadas por destino de navegação (Bloco 3):
- Componentes de UI necessários (lista os 43 da seção de escopo do design system; marcar os que o produto usa):
- Funcionalidade fora do escopo deste boilerplate (integração externa, backend, etc.), a especificar em spec própria:

## Bloco 5: regras

Confirmar que as regras de `DESIGN_RULES.md` se aplicam sem exceção (toque mínimo 44x44, cor em três camadas, nenhum valor arbitrário, `check:rules` limpo). Registrar aqui só desvio de negócio específico do produto que não é regra de design (ex.: fluxo de aprovação, papel de usuário).

## Bloco 6: fluxo de IA

Confirmar a leitura obrigatória (`AGENTS.md`, `DESIGN_RULES.md`, este briefing) e as 5 etapas do fluxo de início (levantamento, spec e plano, validação do plano, execução, validação da entrega), cada uma com o modelo de IA responsável conforme a matriz de `CLAUDE.md`.

## Bloco 7: documentação e testes

- Onde a spec e o plano deste produto específico vão morar (um diretório de histórico de processo local, fora do repositório, ou equivalente do repositório que usar este boilerplate).
- Piso de cobertura de teste esperado (padrão do boilerplate: 80% em `src/components/**`/`src/theme/**`, 90% em `src/lib/**`, quando ativado).
- Rotas que precisam de teste de layout e acessibilidade (Playwright + axe).

## Bloco 8: matriz de modelos

Confirmar a matriz de `CLAUDE.md` (Levantamento: Fable; Plano e spec: Sonnet, sem confrontar código; Validação do plano: Opus; Execução: Sonnet; Validação da entrega: Fable). Registrar aqui só ajuste de fluxo específico deste produto (ex.: fluxo curto para bug pequeno).

## Bloco 9: pendências

Lista aberta do que ainda falta decidir ou não pôde ser decidido nesta rodada de briefing, com o motivo de cada pendência.

## Bloco 10: conteúdo específico do produto

Blocos adicionais que o produto específico precisar (ex.: dados de domínio, integrações, papéis de usuário), numerados a partir daqui, sem reaproveitar os números 0-9 e 11 já reservados por este modelo.

## Bloco 11: plataforma-alvo e recursos do aparelho

1. **Plataforma-alvo**: iOS, Android, ou ambos.
2. **Recursos do aparelho necessários**: notificações push, câmera, biometria, localização, outro (especificar). Cada recurso marcado aqui precisa de um módulo Expo correspondente (`npx expo install`) e de uma linha em `app.json`/`plugins`, tratada em spec própria, nunca instalado "só para testar".
