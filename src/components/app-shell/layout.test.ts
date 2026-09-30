import { defaultShellLayout, layoutOptions } from './layout'
import { navCodes } from '../../config/presets'

describe('layout do AppShell', () => {
  it('defaultShellLayout usa gaveta e barra inferior (N1)', () => {
    expect(defaultShellLayout).toEqual({ bottomNav: true, menu: 'drawer' })
  })

  it('layoutOptions cobre N1 a N3 com rótulo em pt-BR igual à descrição do código', () => {
    expect(layoutOptions.N1.label).toMatch(/gaveta/i)
    expect(layoutOptions.N1.layout).toEqual(defaultShellLayout)
    expect(layoutOptions.N2.layout).toEqual({ bottomNav: true, menu: 'sheet' })
    expect(layoutOptions.N3.layout).toEqual({ bottomNav: false, menu: 'drawer' })
    for (const nav of navCodes) {
      expect(layoutOptions[nav.code as 'N1' | 'N2' | 'N3'].label).toBe(nav.description)
    }
  })
})
