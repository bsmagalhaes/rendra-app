import { a11yPresets } from './a11y'

describe('a11yPresets', () => {
  it('define accessibilityRole para papéis suportados pelo RN', () => {
    expect(a11yPresets.button.accessibilityRole).toBe('button')
    expect(a11yPresets.radiogroup.accessibilityRole).toBe('radiogroup')
    expect(a11yPresets.radio.accessibilityRole).toBe('radio')
    expect(a11yPresets.toolbar.accessibilityRole).toBe('toolbar')
    expect(a11yPresets.menu.accessibilityRole).toBe('menu')
    expect(a11yPresets.menuitem.accessibilityRole).toBe('menuitem')
    expect(a11yPresets.combobox.accessibilityRole).toBe('combobox')
    expect(a11yPresets.header.accessibilityRole).toBe('header')
  })

  it('define role (não accessibilityRole) para status, group, separator, dialog e img', () => {
    expect(a11yPresets.status.role).toBe('status')
    expect(a11yPresets.status.accessibilityRole).toBeUndefined()
    expect(a11yPresets.group.role).toBe('group')
    expect(a11yPresets.separator.role).toBe('separator')
    expect(a11yPresets.dialog.role).toBe('dialog')
    expect(a11yPresets.img.role).toBe('img')
  })

  it('define o preset switch com accessibilityRole switch', () => {
    expect(a11yPresets.switch.accessibilityRole).toBe('switch')
  })

  it('tabpanel usa role, para o conteudo ativo do Tabs', () => {
    expect(a11yPresets.tabpanel).toEqual({ role: 'tabpanel' })
  })

  it('link usa accessibilityRole, para o item de List com href', () => {
    expect(a11yPresets.link).toEqual({ accessibilityRole: 'link' })
  })
})
