import {
  privateFieldError,
  forbiddenDependenciesError,
  peersOutsideDevDependenciesError,
  optionalPeerRequiredByEntryError,
  validatePackFiles,
  changelogMissingEntryError,
  pluginVersionLeakError,
  presetVarsWithoutPrefix,
  quoteWindowsArg,
  buildWindowsShellCommand,
  exportsTemEntradasEsperadas,
  requireForaDoSubcaminho,
  PACOTES_DE_SUBCAMINHO,
  bundleWebComPacoteNativo,
  SUBCAMINHOS_ESPERADOS,
} from './verify-pack-checks'
import rendraPreset from '../../src/theme/tailwind-preset'

describe('privateFieldError', () => {
  it('acusa quando private e true e a flag --publicacao pede o campo ausente', () => {
    expect(privateFieldError({ private: true })).toMatch(/private/)
  })
  it('nao acusa quando private esta ausente', () => {
    expect(privateFieldError({})).toBeNull()
  })
})

describe('forbiddenDependenciesError (lista branca, achado B12 do Opus)', () => {
  it('acusa expo-router, ferramenta de teste/build ou pacote nativo do Expo em dependencies', () => {
    const erro = forbiddenDependenciesError({
      dependencies: { 'expo-router': '1.0.0', jest: '1.0.0', 'expo-asset': '1.0.0' },
    })
    expect(erro).toMatch(/expo-router/)
    expect(erro).toMatch(/jest/)
    expect(erro).toMatch(/expo-asset/)
  })

  it('nao acusa as catorze dependencias permitidas (doze mais d3-shape e @10play/tentap-editor, F3) (sem codigo nativo, sem versao presa ao Expo)', () => {
    expect(
      forbiddenDependenciesError({
        dependencies: {
          '@10play/tentap-editor': '1',
          '@babel/runtime': '1',
          '@expo-google-fonts/dm-sans': '1',
          '@expo-google-fonts/inter': '1',
          '@expo-google-fonts/poppins': '1',
          '@hookform/resolvers': '1',
          clsx: '1',
          'd3-shape': '1',
          'date-fns': '1',
          imask: '1',
          'lucide-react-native': '1',
          'react-hook-form': '1',
          'tailwind-merge': '1',
          zod: '1',
        },
      }),
    ).toBeNull()
  })
})

describe('peersOutsideDevDependenciesError', () => {
  it('acusa peer sem devDependencies correspondente', () => {
    const erro = peersOutsideDevDependenciesError({
      peerDependencies: { react: '>=19', 'react-native': '>=0.81' },
      devDependencies: { react: '19.2.3' },
    })
    expect(erro).toMatch(/react-native/)
  })

  it('nao acusa quando todo peer tem devDependencies correspondente', () => {
    expect(
      peersOutsideDevDependenciesError({
        peerDependencies: { react: '>=19' },
        devDependencies: { react: '19.2.3' },
      }),
    ).toBeNull()
  })
})

describe('optionalPeerRequiredByEntryError (achado M2 do veredito da entrega dos Blocos 3 e 4)', () => {
  it('acusa expo-status-bar marcado como opcional (ThemedStatusBar o importa sem checagem)', () => {
    expect(
      optionalPeerRequiredByEntryError({ peerDependenciesMeta: { 'expo-status-bar': { optional: true } } }),
    ).toMatch(/expo-status-bar/)
  })

  it('nao acusa quando expo-status-bar nao esta marcado como opcional', () => {
    expect(
      optionalPeerRequiredByEntryError({
        peerDependenciesMeta: { 'expo-font': { optional: true }, 'react-native-web': { optional: true } },
      }),
    ).toBeNull()
  })
})

describe('validatePackFiles (achado C9 do Opus)', () => {
  it('acusa src/ ou app/ no tarball', () => {
    expect(validatePackFiles(['dist-lib/index.js', 'src/index.ts'])).toMatch(/src\//)
  })

  it('acusa sobra de rodada anterior do verify:pack (dist-lib/.verify-pack/)', () => {
    expect(
      validatePackFiles(['dist-lib/index.js', 'dist-lib/.verify-pack/pack-out/x.tgz']),
    ).toMatch(/verify-pack/)
  })

  it('acusa brand.config.js alcancavel (marca de demonstracao vazando pro pacote)', () => {
    expect(validatePackFiles(['dist-lib/index.js', 'dist-lib/brand/brand.config.js'])).toMatch(
      /brand\.config\.js/,
    )
  })

  it('exige dist-lib/index.js, router-bridge.js, fonts.js e theme/tailwind-preset.js presentes', () => {
    expect(validatePackFiles(['README.md'])).toMatch(/dist-lib\/index\.js/)
  })

  it('exige dist-lib/chart.js e chart.d.ts (subcaminho ./chart, F3)', () => {
    const base = [
      'dist-lib/index.js', 'dist-lib/index.d.ts', 'dist-lib/router-bridge.js', 'dist-lib/router-bridge.d.ts',
      'dist-lib/fonts.js', 'dist-lib/fonts.d.ts', 'dist-lib/theme/tailwind-preset.js', 'dist-lib/theme/tailwind-preset.d.ts',
    ]
    expect(validatePackFiles(base)).toMatch(/dist-lib\/chart\.js/)
  })

  it('exige o subcaminho do editor e as DUAS variantes do componente: sem o .web.js o Metro web cai no nativo (B3 do parecer)', () => {
    const base = [
      'dist-lib/index.js', 'dist-lib/index.d.ts', 'dist-lib/router-bridge.js', 'dist-lib/router-bridge.d.ts',
      'dist-lib/fonts.js', 'dist-lib/fonts.d.ts', 'dist-lib/theme/tailwind-preset.js', 'dist-lib/theme/tailwind-preset.d.ts',
      'dist-lib/chart.js', 'dist-lib/chart.d.ts', 'dist-lib/rich-text-editor.js', 'dist-lib/rich-text-editor.d.ts',
      'dist-lib/components/ui/rich-text-editor.js',
    ]
    expect(validatePackFiles(base)).toMatch(/rich-text-editor\.web\.js/)
    expect(validatePackFiles(base.filter((f) => f !== 'dist-lib/rich-text-editor.js'))).toMatch(/dist-lib\/rich-text-editor\.js/)
  })

  it('exige o subcaminho do visualizador e as DUAS variantes (B3 do parecer)', () => {
    const base = [
      'dist-lib/index.js', 'dist-lib/index.d.ts', 'dist-lib/router-bridge.js', 'dist-lib/router-bridge.d.ts',
      'dist-lib/fonts.js', 'dist-lib/fonts.d.ts', 'dist-lib/theme/tailwind-preset.js', 'dist-lib/theme/tailwind-preset.d.ts',
      'dist-lib/chart.js', 'dist-lib/chart.d.ts', 'dist-lib/rich-text-editor.js', 'dist-lib/rich-text-editor.d.ts',
      'dist-lib/components/ui/rich-text-editor.js', 'dist-lib/components/ui/rich-text-editor.web.js',
      'dist-lib/document-viewer.js', 'dist-lib/document-viewer.d.ts', 'dist-lib/components/ui/document-viewer.js',
    ]
    expect(validatePackFiles(base)).toMatch(/document-viewer\.web\.js/)
    expect(validatePackFiles(base.filter((f) => f !== 'dist-lib/document-viewer.d.ts'))).toMatch(/dist-lib\/document-viewer\.d\.ts/)
  })

  it('nao acusa um tarball limpo, com todos os obrigatorios', () => {
    expect(
      validatePackFiles([
        'README.md',
        'LICENSE',
        'CHANGELOG.md',
        'package.json',
        'dist-lib/index.js',
        'dist-lib/index.d.ts',
        'dist-lib/router-bridge.js',
        'dist-lib/router-bridge.d.ts',
        'dist-lib/fonts.js',
        'dist-lib/fonts.d.ts',
        'dist-lib/theme/tailwind-preset.js',
        'dist-lib/theme/tailwind-preset.d.ts',
        'dist-lib/chart.js',
        'dist-lib/chart.d.ts',
        'dist-lib/rich-text-editor.js',
        'dist-lib/rich-text-editor.d.ts',
        'dist-lib/components/ui/rich-text-editor.js',
        'dist-lib/components/ui/rich-text-editor.web.js',
        'dist-lib/document-viewer.js',
        'dist-lib/document-viewer.d.ts',
        'dist-lib/components/ui/document-viewer.js',
        'dist-lib/components/ui/document-viewer.web.js',
        'dist-lib/components/ui/button.js',
      ]),
    ).toBeNull()
  })
})

// Melhoria não bloqueadora do veredito Fable v2 (validação final v2 do pacote npm): o
// `build-lib-worklets.ts` roda com `NODE_ENV=production`, e é isso que evita o plugin de
// worklets injetar `__pluginVersion` no `dist-lib` publicado (só fora de release o plugin
// injeta essa checagem, `react-native-worklets/plugin/index.js`); uma regressão de `NODE_ENV`
// prenderia o pacote à versão do plugin de quem publicou. Esta checagem falha se aparecer.
describe('pluginVersionLeakError (veredito Fable v2: dist-lib nunca carrega __pluginVersion)', () => {
  it('acusa arquivo do dist-lib com __pluginVersion', () => {
    const erro = pluginVersionLeakError({
      'dist-lib/components/internal/bottom-sheet.js': 'exports.__pluginVersion = "0.10.1";',
      'dist-lib/index.js': 'module.exports = {};',
    })
    expect(erro).toMatch(/bottom-sheet\.js/)
  })

  it('não acusa quando nenhum arquivo tem __pluginVersion', () => {
    expect(
      pluginVersionLeakError({
        'dist-lib/components/internal/bottom-sheet.js': 'var x = exports.x = function () {};',
        'dist-lib/index.js': 'module.exports = {};',
      }),
    ).toBeNull()
  })
})

// Achado B5 do veredito do Opus (Sincronizacao 1, item H6): nenhuma cor/raio/sombra do preset
// instalado pode resolver var(--x) sem o prefixo --rendra- (nem --tw-).
describe('presetVarsWithoutPrefix (achado B5/H6 do Opus, Sincronizacao 1)', () => {
  it('acusa var(--primary) sem o prefixo rendra-', () => {
    const theme = { colors: { a: 'rgb(var(--primary) / <alpha-value>)' } }
    expect(presetVarsWithoutPrefix(theme)).toEqual(['primary'])
  })

  it('não acusa var(--rendra-primary) nem var(--tw-shadow-color)', () => {
    const theme = { colors: { a: 'rgb(var(--rendra-primary) / <alpha-value>)', b: 'var(--tw-shadow-color)' } }
    expect(presetVarsWithoutPrefix(theme)).toEqual([])
  })

  it('o preset real (rendraPreset.theme) não acusa nada', () => {
    expect(presetVarsWithoutPrefix(rendraPreset.theme)).toEqual([])
  })
})

// Melhoria não bloqueadora do veredito Fable v2: Node 24 emite `[DEP0190] DeprecationWarning`
// quando `shell: true` recebe um array de argumentos (concatenados sem escapar). No Windows,
// `npm.cmd`/`tar.exe` só resolvem com `shell: true`; a saída é montar a linha inteira já
// escapada e passar `spawnSync(linha, [], { shell: true })`, sem array de argumentos separado.
describe('quoteWindowsArg/buildWindowsShellCommand (Node 24 DEP0190: shell:true não pode receber args[])', () => {
  it('não coloca aspas em argumento simples, sem espaço nem caractere especial', () => {
    expect(quoteWindowsArg('pack')).toBe('pack')
    expect(quoteWindowsArg('--json')).toBe('--json')
  })

  it('coloca aspas em argumento com espaço e escapa aspas internas (dobradas)', () => {
    expect(quoteWindowsArg('C:\\a b\\pkg.tgz')).toBe('"C:\\a b\\pkg.tgz"')
    expect(quoteWindowsArg('a"b')).toBe('"a""b"')
  })

  it('buildWindowsShellCommand junta comando e argumentos numa linha só', () => {
    expect(buildWindowsShellCommand('npm', ['pack', '.', '--json'])).toBe('npm pack . --json')
  })

  it('buildWindowsShellCommand escapa o argumento com espaço, mantendo os demais soltos', () => {
    expect(buildWindowsShellCommand('npm', ['install', 'C:\\a b\\pkg.tgz', '--no-audit'])).toBe(
      'npm install "C:\\a b\\pkg.tgz" --no-audit',
    )
  })
})

describe('changelogMissingEntryError (achado B13 do Opus, exigirSimulacao opcional)', () => {
  it('acusa quando falta a entrada da versao', () => {
    expect(changelogMissingEntryError('# Changelog\n', '0.3.0')).toMatch(/0\.3\.0/)
  })

  it('sem exigirSimulacao, entrada sem a frase nao acusa', () => {
    expect(changelogMissingEntryError('## [0.3.0]\nsem a frase', '0.3.0')).toBeNull()
  })

  it('com exigirSimulacao, entrada sem a frase acusa', () => {
    expect(changelogMissingEntryError('## [0.3.0]\nsem a frase', '0.3.0', true)).toMatch(/[Ss]imula/)
  })

  it('com exigirSimulacao, entrada com a frase nao acusa', () => {
    expect(
      changelogMissingEntryError(
        '## [0.3.0]\nSimulacao dos dois leigos aprovada em 27/09/2026.',
        '0.3.0',
        true,
      ),
    ).toBeNull()
  })

  it('achado N1 do veredito do Fable: com exigirSimulacao, nao aceita a frase de uma entrada mais antiga para a versao pedida', () => {
    const changelog =
      '## [1.0.0]\nsem a frase\n\n## [0.3.0]\nSimulacao dos dois leigos aprovada em 27/09/2026.\n'
    expect(changelogMissingEntryError(changelog, '1.0.0', true)).toMatch(/[Ss]imula/)
  })
})

describe('exportsTemEntradasEsperadas (F3, subcaminho generico, B2 do parecer)', () => {
  const cincoAtuais = {
    '.': {},
    './router-bridge': {},
    './fonts': {},
    './tailwind-preset': {},
    './package.json': './package.json',
  }

  it('acusa o subcaminho que falta (a lista das cinco entradas antigas nao tem ./chart)', () => {
    const erro = exportsTemEntradasEsperadas(cincoAtuais, SUBCAMINHOS_ESPERADOS)
    expect(erro).toMatch(/\.\/chart/)
  })

  it('nao acusa quando todas as entradas esperadas existem', () => {
    const completo = { ...cincoAtuais, './chart': {}, './rich-text-editor': {}, './document-viewer': {} }
    expect(exportsTemEntradasEsperadas(completo, SUBCAMINHOS_ESPERADOS)).toBeNull()
  })

  it('acusa exports ausente e usa a lista recebida por parametro', () => {
    expect(exportsTemEntradasEsperadas(undefined, ['.'])).toMatch(/exports/)
    expect(exportsTemEntradasEsperadas({ '.': {} }, ['.', './x'])).toMatch(/\.\/x/)
    expect(exportsTemEntradasEsperadas({ '.': {} }, ['.'])).toBeNull()
  })

  it('a lista esperada tem as cinco antigas mais ./chart, ./rich-text-editor e ./document-viewer', () => {
    expect(SUBCAMINHOS_ESPERADOS).toEqual([
      '.', './router-bridge', './fonts', './tailwind-preset', './package.json', './chart', './rich-text-editor', './document-viewer',
    ])
  })
})

describe('requireForaDoSubcaminho (F3, molde de acharExpoRouterForaDoBridge)', () => {
  const permitidos = ['dist-lib/components/ui/chart.js']

  it('acusa d3-shape vazando para dist-lib/index.js', () => {
    const achados = requireForaDoSubcaminho(
      { 'dist-lib/index.js': 'const d = require("d3-shape");', 'dist-lib/components/ui/chart.js': 'require("d3-shape")' },
      'd3-shape',
      permitidos,
    )
    expect(achados).toEqual(['dist-lib/index.js'])
  })

  it('reconhece aspas simples e nao acusa o arquivo permitido nem pacote de nome parecido', () => {
    expect(
      requireForaDoSubcaminho({ 'dist-lib/a.js': "require('d3-shape')", 'dist-lib/b.js': 'require("d3-shape-extra")' }, 'd3-shape', []),
    ).toEqual(['dist-lib/a.js'])
    expect(requireForaDoSubcaminho({ 'dist-lib/components/ui/chart.js': 'require("d3-shape")' }, 'd3-shape', permitidos)).toEqual([])
  })

  it('a lista permitida e exata: um .web.js vizinho do arquivo permitido tambem e acusado (B3 do parecer)', () => {
    const achados = requireForaDoSubcaminho(
      {
        'dist-lib/components/ui/rich-text-editor.js': 'require("react-native-webview")',
        'dist-lib/components/ui/rich-text-editor.web.js': 'require("react-native-webview")',
      },
      'react-native-webview',
      ['dist-lib/components/ui/rich-text-editor.js'],
    )
    expect(achados).toEqual(['dist-lib/components/ui/rich-text-editor.web.js'])
  })
})

describe('PACOTES_DE_SUBCAMINHO (F3, Tarefa 6.1): quem pode exigir d3-shape, react-native-webview e tentap', () => {
  it('cada pacote pesado tem a lista exata de arquivos do subcaminho, sem curinga e sem o .web.js', () => {
    expect(PACOTES_DE_SUBCAMINHO).toEqual({
      'd3-shape': ['dist-lib/components/ui/chart.js'],
      'react-native-webview': ['dist-lib/components/ui/rich-text-editor.js', 'dist-lib/components/ui/document-viewer.js'],
      '@10play/tentap-editor': ['dist-lib/components/ui/rich-text-editor.js'],
    })
  })

  it('require de react-native-webview em dist-lib/index.js acusa; em rich-text-editor.js nao', () => {
    const arquivos = {
      'dist-lib/index.js': 'const w = require("react-native-webview");',
      'dist-lib/components/ui/rich-text-editor.js': 'const w = require("react-native-webview");',
    }
    expect(requireForaDoSubcaminho(arquivos, 'react-native-webview', PACOTES_DE_SUBCAMINHO['react-native-webview']!)).toEqual(['dist-lib/index.js'])
  })

  it('require de @10play/tentap-editor em dist-lib/index.js acusa; no .web.js do editor tambem (so o nativo pode)', () => {
    const arquivos = {
      'dist-lib/index.js': "require('@10play/tentap-editor')",
      'dist-lib/components/ui/rich-text-editor.web.js': 'require("@10play/tentap-editor")',
      'dist-lib/components/ui/rich-text-editor.js': 'require("@10play/tentap-editor")',
    }
    expect(requireForaDoSubcaminho(arquivos, '@10play/tentap-editor', PACOTES_DE_SUBCAMINHO['@10play/tentap-editor']!)).toEqual([
      'dist-lib/index.js',
      'dist-lib/components/ui/rich-text-editor.web.js',
    ])
  })
})

describe('bundleWebComPacoteNativo (F3, Tarefa 6.2): o bundle web exportado nao carrega o WebView nem o tentap', () => {
  it('acusa o arquivo do bundle que traz RNCWebView, o tentap ou o tiptap', () => {
    const achados = bundleWebComPacoteNativo({
      '_expo/static/js/web/entry-1.js': 'var a = 1;',
      '_expo/static/js/web/entry-2.js': 'NativeModules.RNCWebView',
      '_expo/static/js/web/entry-3.js': 'require("@10play/tentap-editor")',
      '_expo/static/js/web/entry-4.js': 'import "@tiptap/core"',
    })
    expect(achados).toEqual(['_expo/static/js/web/entry-2.js', '_expo/static/js/web/entry-3.js', '_expo/static/js/web/entry-4.js'])
  })

  it('nao acusa o bundle limpo nem a mencao inocente a react-native-webview do @expo/dom-webview', () => {
    expect(
      bundleWebComPacoteNativo({ 'a.js': 'peerDependenciesMeta:{"react-native-webview":{optional:!0}}', 'b.js': 'var c = 2;' }),
    ).toEqual([])
  })
})
