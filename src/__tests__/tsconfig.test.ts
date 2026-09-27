describe('tsconfig.json', () => {
  it('inclui nativewind-env.d.ts para o Expo não reescrever o arquivo em runtime', () => {
    const config = require('../../tsconfig.json') as { include?: string[] }
    expect(config.include).toContain('nativewind-env.d.ts')
  })

  it('exclui dist-lib, para o build:lib local nao vazar para o typecheck (Bloco 3, tsconfig.lib.json)', () => {
    const config = require('../../tsconfig.json') as { exclude?: string[] }
    expect(config.exclude).toContain('dist-lib')
  })

  it('não inclui .expo/types/**/*.ts nem expo-env.d.ts, para o typed-routes do Expo CLI não reescrever o arquivo', () => {
    // node_modules/expo/node_modules/@expo/cli/.../start/server/type-generation/tsconfig.js
    // (getTSConfigRemoveUpdates, chamada por startTypescriptTypeGenerationAsync sempre que
    // experiments.typedRoutes é falso em app.json, o caso deste projeto) filtra
    // incondicionalmente essas duas strings do array `include` sempre que uma delas está
    // presente, e regrava tsconfig.json com outra formatação (@expo/json-file), sujando
    // `git status`. Mantendo as duas fora do include versionado, o filtro não encontra nada
    // para remover (nenhuma mudança, nenhuma regravação). `expo-env.d.ts` referencia
    // `expo/types` só para declarar `*.css`; `src/types/css.d.ts` (F1a) já cobre isso sem
    // depender de um arquivo gerado e listado no .gitignore.
    const config = require('../../tsconfig.json') as { include?: string[] }
    expect(config.include).not.toContain('.expo/types/**/*.ts')
    expect(config.include).not.toContain('expo-env.d.ts')
  })
})
