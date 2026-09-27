import { isPlaceholderContrastFalsePositive, blockingViolations, type AxeViolationLike } from './axe-false-positives'

function placeholderViolation(fgColor: string): AxeViolationLike {
  return {
    id: 'color-contrast',
    impact: 'serious',
    nodes: [
      {
        html: '<input placeholder="Buscar...">',
        any: [{ data: { fgColor } }],
      },
    ],
  }
}

describe('isPlaceholderContrastFalsePositive (melhoria 4 do veredito do fechamento)', () => {
  it('filtra quando o nó é input/textarea com placeholder E a cor relatada é exatamente o cinza do preflight (#9ca3af)', () => {
    expect(isPlaceholderContrastFalsePositive(placeholderViolation('#9ca3af'))).toBe(true)
    expect(isPlaceholderContrastFalsePositive(placeholderViolation('#9CA3AF'))).toBe(true)
  })

  it('NÃO filtra quando o nó é input/textarea com placeholder mas a cor relatada é outra (achado real, não o falso positivo documentado)', () => {
    expect(isPlaceholderContrastFalsePositive(placeholderViolation('#ff0000'))).toBe(false)
  })

  it('NÃO filtra quando a regra não é color-contrast, mesmo com a cor do preflight', () => {
    const violation = { ...placeholderViolation('#9ca3af'), id: 'aria-allowed-attr' }
    expect(isPlaceholderContrastFalsePositive(violation)).toBe(false)
  })

  it('NÃO filtra quando algum nó da violação não é um input/textarea com placeholder (texto visível comum)', () => {
    const violation: AxeViolationLike = {
      id: 'color-contrast',
      impact: 'serious',
      nodes: [
        { html: '<input placeholder="Buscar...">', any: [{ data: { fgColor: '#9ca3af' } }] },
        { html: '<span>Texto visível</span>', any: [{ data: { fgColor: '#9ca3af' } }] },
      ],
    }
    expect(isPlaceholderContrastFalsePositive(violation)).toBe(false)
  })
})

describe('blockingViolations', () => {
  it('remove o falso positivo do placeholder mas mantém violações serious/critical de verdade', () => {
    const real: AxeViolationLike = { id: 'color-contrast', impact: 'serious', nodes: [{ html: '<span>Texto</span>', any: [{ data: { fgColor: '#ff0000' } }] }] }
    const falsePositive = placeholderViolation('#9ca3af')
    const minor: AxeViolationLike = { id: 'landmark-one-main', impact: 'minor', nodes: [] }
    expect(blockingViolations([real, falsePositive, minor])).toEqual([real])
  })
})
