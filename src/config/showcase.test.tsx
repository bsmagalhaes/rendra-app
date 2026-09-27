import { render, act } from '@testing-library/react-native'
import { BrandProvider } from '../brand/brand-provider'
import { showcaseGroups } from './showcase'

describe('showcaseGroups', () => {
  it('tem os 5 grupos, na ordem final', () => {
    expect(showcaseGroups.map((group) => group.slug)).toEqual(['acoes', 'formulario', 'feedback', 'exibicao', 'layout'])
  })

  it('grupo acoes tem as 4 entradas finais', () => {
    const group = showcaseGroups.find((item) => item.slug === 'acoes')
    expect(group?.entries.map((entry) => entry.name)).toEqual(['Button', 'ButtonGroup', 'ActionBar', 'DropdownMenu'])
  })

  it('grupo layout tem as 6 entradas finais', () => {
    const group = showcaseGroups.find((item) => item.slug === 'layout')
    expect(group?.entries.map((entry) => entry.name)).toEqual([
      'Container',
      'Stack',
      'Inline',
      'Grid',
      'Section',
      'PageHeader',
    ])
  })

  it('grupo feedback tem as 9 entradas na ordem da spec', () => {
    const group = showcaseGroups.find((item) => item.slug === 'feedback')
    expect(group?.entries.map((entry) => entry.name)).toEqual([
      'BrandFeedbackIcon',
      'Alert',
      'Toast',
      'Progress',
      'Skeleton',
      'EmptyState',
      'InfoHint',
      'Modal',
      'Drawer',
    ])
  })

  it('formulario tem as 12 entradas na ordem da spec', () => {
    const formulario = showcaseGroups.find((g) => g.slug === 'formulario')!
    expect(formulario.entries.map((e) => e.name)).toEqual([
      'Input',
      'Textarea',
      'Select',
      'Select (lista longa)',
      'Checkbox',
      'RadioGroup',
      'Switch',
      'Slider',
      'OtpInput',
      'DatePicker',
      'Field',
      'Formulário (RHF)',
    ])
  })

  it('exibicao tem as 9 entradas na ordem da spec', () => {
    const grupo = showcaseGroups.find((g) => g.slug === 'exibicao')
    expect(grupo?.entries.map((e) => e.name)).toEqual([
      'Card', 'Badge', 'Avatar', 'List', 'StatCard', 'Accordion', 'Tabs', 'Separator', 'BrandLogo',
    ])
  })

  it('a vitrine tem 40 entradas reais, 4/12/9/9/6 por grupo (divergencia da spec registrada)', () => {
    const total = showcaseGroups.flatMap((g) => g.entries).length
    expect(total).toBe(40)
    expect(showcaseGroups.map((g) => g.entries.length)).toEqual([4, 12, 9, 9, 6])
  })

  it.each(['acoes', 'layout', 'feedback', 'formulario', 'exibicao'])(
    'toda entrada de %s renderiza sem lançar',
    async (slug) => {
      const group = showcaseGroups.find((item) => item.slug === slug)!
      for (const entry of group.entries) {
        const { unmount } = await render(<BrandProvider>{entry.render()}</BrandProvider>)
        await act(async () => {
          unmount()
        })
      }
    },
  )
})
