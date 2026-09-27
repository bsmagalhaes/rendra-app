describe('registerIconInterop', () => {
  afterEach(() => {
    jest.resetModules()
    jest.dontMock('lucide-react-native')
    jest.dontMock('nativewind')
  })

  function carregar(icones: Record<string, unknown>) {
    // `jest.setup.js` ja chama `registerIconInterop()` no modulo real (sem mock) ao subir o
    // arquivo de teste (setupFilesAfterEnv), deixando './icon-interop' em cache com
    // `registered = true`; sem este reset antes do primeiro `require`, o teste receberia o
    // modulo real e cacheado, e o `cssInterop` mockado nunca seria chamado.
    jest.resetModules()
    const cssInterop = jest.fn()
    jest.doMock('lucide-react-native', () => ({ __esModule: true, ...icones }))
    jest.doMock('nativewind', () => ({ cssInterop }))
    // M6 (veredito do Fable): `import()` dinamico dentro de `jest.isolateModulesAsync` foi
    // tentado no lugar deste `require`, mas o preset deste projeto (jest-expo, Babel/CommonJS,
    // sem `--experimental-vm-modules`) lanca "A dynamic import callback was invoked without
    // --experimental-vm-modules" (evidencia coletada nesta rodada); mudar o transform do Jest
    // so para isto sairia do escopo desta correcao pontual. `require()` continua a unica forma
    // de trocar o modulo mockado (`lucide-react-native`/`nativewind`) a cada chamada de
    // `carregar` neste ambiente; desativado com justificativa, mesmo precedente de
    // `src/__tests__/tsconfig.test.ts` (require de configuracao dentro de teste).
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { registerIconInterop } = require('./icon-interop')
    return { cssInterop, registerIconInterop }
  }

  it('registra cada icone uma vez, ignorando utilitarios, valores que nao sao componente e apelidos da mesma referencia', () => {
    const Zap = () => null
    const { cssInterop, registerIconInterop } = carregar({
      Zap,
      ZapIcon: Zap,
      LucideZap: Zap,
      Star: () => null,
      LucideProvider: () => null,
      useLucideContext: () => null,
      createLucideIcon: () => null,
      Icon: () => null,
      versao: '1.48.0',
    })
    registerIconInterop()
    expect(cssInterop).toHaveBeenCalledTimes(2)
    expect(cssInterop).toHaveBeenCalledWith(Zap, expect.objectContaining({ className: expect.any(Object) }))
  })

  it('segunda chamada nao registra de novo', () => {
    const { cssInterop, registerIconInterop } = carregar({ Zap: () => null })
    registerIconInterop()
    registerIconInterop()
    expect(cssInterop).toHaveBeenCalledTimes(1)
  })
})
