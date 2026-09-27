// Lacuna 3 do veredito Fable sobre o pacote npm: CAMINHO B (docs/PROMPT_MIGRACAO.md) mandava instalar "os peers listados no CAMINHO
// A, item 1" (react-native-reanimated >=4.5.0, que exige React Native 0.83-0.86), incompatível
// com o perfil 2 do roteiro (bare React Native 0.76); e mandava copiar babel.config.js
// (babel-preset-expo), metro.config.js (expo/metro-config) e jest.config.js (jest-expo) tal
// qual, que não existem num app bare. Esta suíte lê os documentos reais (nunca uma cópia) e
// falha se o piso real e o que fazer abaixo dele não estiverem escritos por extenso.
const { readFileSync } = require('fs') as { readFileSync: (path: string, encoding: 'utf8') => string }

const promptMigracao = readFileSync('docs/PROMPT_MIGRACAO.md', 'utf8')
const agentsMd = readFileSync('AGENTS.md', 'utf8')
const comoAplicar = readFileSync('docs/COMO_APLICAR.md', 'utf8')
const readmeMd = readFileSync('README.md', 'utf8')
const designRules = readFileSync('DESIGN_RULES.md', 'utf8')

describe('CAMINHO B (docs/PROMPT_MIGRACAO.md) diz o piso real e o que fazer abaixo dele', () => {
  it('cita a versão mínima real de React Native que a Reanimated 4 exige (0.83)', () => {
    expect(promptMigracao).toMatch(/React Native 0\.83/)
  })

  it('manda instalar expo-modules-core via install-expo-modules num app bare (expo-status-bar é peer obrigatório)', () => {
    expect(promptMigracao).toMatch(/install-expo-modules/)
  })

  it('não manda mais instalar "os peers listados no CAMINHO A" sem citar o piso (causa do ERESOLVE no perfil bare)', () => {
    expect(promptMigracao).not.toMatch(/peers listados no CAMINHO A/)
  })

  it('manda adaptar babel.config.js/metro.config.js/jest.config.js ao bare, não copiar tal qual', () => {
    expect(promptMigracao).toMatch(/@react-native\/babel-preset/)
    expect(promptMigracao).toMatch(/@react-native\/metro-config/)
    expect(promptMigracao).toMatch(/preset: 'react-native'/)
  })

  it('dá a frase curta para a pessoa quando o app está abaixo do piso', () => {
    expect(promptMigracao).toMatch(/atualizar o React Native primeiro/)
  })
})

describe('AGENTS.md alinhado ao mesmo piso (fora do bloco de verificação espelhado)', () => {
  it('cita a versão mínima real de React Native no critério de escolha', () => {
    expect(agentsMd).toMatch(/React Native 0\.83/)
  })
})

describe('docs/COMO_APLICAR.md alinhado ao mesmo piso', () => {
  it('aponta para o piso real e o CAMINHO B de docs/PROMPT_MIGRACAO.md para quem está abaixo dos pré-requisitos', () => {
    expect(comoAplicar).toMatch(/PROMPT_MIGRACAO\.md.*CAMINHO B/)
  })
})

describe('README.md alinhado ao mesmo piso', () => {
  it('menciona o piso real de React Native 0.83 ao descrever o critério dos três caminhos', () => {
    expect(readmeMd).toMatch(/React Native 0\.83/)
  })
})

// Melhorias não bloqueadoras do veredito Fable v2 sobre o pacote npm: em app Expo, "npm install"
// sem versão traz a Reanimated/worklets/Tailwind mais novos do npm, que podem não bater com o
// que o SDK do app empacota (ex.: Expo 57 empacota Reanimated 4.5.1/worklets 0.10.1, mas "npm
// install" puro trazia 4.7.0/0.13.0 hoje) e quebrar o Expo Go; a Tailwind "latest" é a 4, fora da
// faixa que a NativeWind 4.2 suporta (só v3).
describe('instalação em app Expo usa npx expo install para os peers nativos e fixa tailwindcss@3', () => {
  it('PROMPT_MIGRACAO.md (CAMINHO A), COMO_APLICAR.md e README.md mandam usar npx expo install para os peers nativos', () => {
    expect(promptMigracao).toMatch(/npx expo install/)
    expect(comoAplicar).toMatch(/npx expo install/)
    expect(readmeMd).toMatch(/npx expo install/)
  })

  it('os três documentos fixam tailwindcss@3 (a "latest" do Tailwind é a 4, incompatível com a NativeWind, que só suporta v3)', () => {
    expect(promptMigracao).toMatch(/tailwindcss@3/)
    expect(comoAplicar).toMatch(/tailwindcss@3/)
    expect(readmeMd).toMatch(/tailwindcss@3/)
  })
})

// Lacuna não bloqueadora do veredito Fable v2: a faixa de peer da Reanimated muda a cada versão
// (4.5.1 e 4.6.0 aceitam React Native 0.83; a "latest" de hoje, 4.7.0, só aceita 0.86 em diante).
// Um app em React Native 0.83 a 0.85 que instale a Reanimated sem versão cai em ERESOLVE.
describe('PROMPT_MIGRACAO.md (CAMINHO B) fixa a versão compatível da Reanimated e do worklets para React Native 0.83 a 0.85', () => {
  it('cita react-native-reanimated@4.6 e o react-native-worklets compatível (0.12), em vez de instalar sem versão', () => {
    expect(promptMigracao).toMatch(/reanimated@4\.6/)
    expect(promptMigracao).toMatch(/worklets@0\.12/)
  })
})

// Lacunas não bloqueadoras do veredito Fable v2 (validação final v2 do pacote npm), tabela de
// lacunas: "DESIGN_RULES.md:3 (versão 0.2.0)" e "COMO_APLICAR.md:13 (app existe)".
describe('DESIGN_RULES.md e docs/COMO_APLICAR.md sem versão desatualizada ou erro de digitação', () => {
  it('DESIGN_RULES.md não trava a frase de abertura numa versão antiga (0.2.0); a versão corrente vive só no CHANGELOG.md', () => {
    expect(designRules).not.toMatch(/0\.2\.0/)
  })

  it('COMO_APLICAR.md diz "app existente", não "app existe"', () => {
    expect(comoAplicar).not.toMatch(/um app existe migra/)
    expect(comoAplicar).toMatch(/um app existente migra/)
  })
})
