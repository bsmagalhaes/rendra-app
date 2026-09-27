import { controlFrameClasses } from './control'

describe('controlFrameClasses', () => {
  it('usa h-control-md por padrão', () => {
    expect(controlFrameClasses({}).split(' ')).toContain('h-control-md')
  })

  it('troca a altura pelo size', () => {
    expect(controlFrameClasses({ size: 'sm' }).split(' ')).toContain('h-control-sm')
    expect(controlFrameClasses({ size: 'lg' }).split(' ')).toContain('h-control-lg')
  })

  it('acrescenta border-destructive so com invalid', () => {
    expect(controlFrameClasses({ invalid: true }).split(' ')).toContain('border-destructive')
    expect(controlFrameClasses({ invalid: false }).split(' ')).not.toContain('border-destructive')
  })

  it('acrescenta border-ring e bg-card com focused', () => {
    const classes = controlFrameClasses({ focused: true }).split(' ')
    expect(classes).toEqual(expect.arrayContaining(['border-ring', 'bg-card']))
  })

  it('acrescenta opacity-60 com disabled', () => {
    expect(controlFrameClasses({ disabled: true }).split(' ')).toContain('opacity-60')
  })
})
