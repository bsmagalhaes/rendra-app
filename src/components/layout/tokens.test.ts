import { alignClass, fieldSpanClass, gapClass, justifyClass } from './tokens'

describe('layout/tokens', () => {
  it('gapClass cobre os 10 degraus numéricos mais section e fields', () => {
    expect(gapClass['0']).toBe('gap-0')
    expect(gapClass['4']).toBe('gap-4')
    expect(gapClass['24']).toBe('gap-24')
    expect(gapClass.section).toBe('gap-8')
    expect(gapClass.fields).toBe('gap-4')
  })

  it('alignClass e justifyClass têm as chaves do contrato', () => {
    expect(alignClass.start).toBe('items-start')
    expect(alignClass.stretch).toBe('items-stretch')
    expect(alignClass.baseline).toBe('items-baseline')
    expect(justifyClass.between).toBe('justify-between')
  })

  it('fieldSpanClass sempre resolve para w-full na F1 (sem grade responsiva)', () => {
    expect(fieldSpanClass.xs).toBe('w-full')
    expect(fieldSpanClass.full).toBe('w-full')
  })
})
