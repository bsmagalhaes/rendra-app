import appJson from '../../app.json'
import pkgJson from '../../package.json'
import { showcaseGroups } from './showcase'
import { routeSeo, siteSeo, SEO_GROUPS } from './seo'

describe('SEO_GROUPS', () => {
  it('tem o mesmo slug e o mesmo title de cada showcaseGroups, sem importar o módulo real', () => {
    expect(SEO_GROUPS.map(({ slug, title }) => ({ slug, title }))).toEqual(
      showcaseGroups.map(({ slug, title }) => ({ slug, title })),
    )
  })
})

describe('routeSeo', () => {
  it('cada grupo da vitrine (showcaseGroups) tem uma entrada com o path correspondente', () => {
    const caminhos = routeSeo.map((r) => r.path)
    for (const grupo of showcaseGroups) {
      expect(caminhos).toContain(`/componentes/${grupo.slug}`)
    }
  })

  it('as rotas fixas (raiz, componentes, tokens, galeria) estao cobertas e indexaveis', () => {
    const fixas = ['/', '/componentes', '/tokens', '/galeria']
    for (const path of fixas) {
      const entrada = routeSeo.find((r) => r.path === path)
      expect(entrada?.indexable).toBe(true)
    }
  })

  it('toda entrada indexavel tem titulo e description no formato esperado, em pt-BR', () => {
    for (const rota of routeSeo.filter((r) => r.indexable)) {
      expect(rota.title.length).toBeGreaterThan(0)
      expect(rota.description.length).toBeGreaterThanOrEqual(50)
      expect(rota.description).not.toMatch(/[–—]/)
    }
  })
})

describe('siteSeo', () => {
  // Achado B2 da validacao da entrega (Blocos 5 e 6, Fable): `cleanSeoConfig`
  // (scripts/lib/clean-clone.ts) troca `productName`/`repositoryUrl` pelos do projeto clonado, e
  // este teste segue com o clone (nao esta em ARQUIVOS_SO_DO_PACOTE); a asserção hardcoded
  // ficava vermelha no clone por um motivo que nao e bug: o nome e o repositorio la sao outros de
  // proposito. A asserção passa a comparar com `app.json`/`package.json` (a mesma fonte que
  // `cleanAppJson`/`cleanSeoConfig` escrevem), verdadeira nos dois estados.
  it('traz nome e repositorio coerentes com app.json e package.json, sem inventar um valor novo', () => {
    expect(siteSeo.productName).toBe(appJson.expo.name)
    const pkg = pkgJson as { homepage?: string }
    expect(siteSeo.repositoryUrl).toBe(pkg.homepage ? pkg.homepage.replace(/#readme$/, '') : '')
  })

  it('traz publico e comandos, para o llms.txt (padrao 7.4, achado B2 da validacao da entrega)', () => {
    expect(siteSeo.audience.length).toBeGreaterThanOrEqual(50)
    expect(siteSeo.commands).toEqual(
      expect.arrayContaining(['npm install', 'npm start', 'npm run build', 'npm test']),
    )
  })
})
