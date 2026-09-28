import { cn } from './cn'

describe('cn', () => {
  it('mescla classes e remove conflito, última vence', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2')
  })

  it('ignora valores falsy', () => {
    expect(cn('flex', false && 'hidden', undefined, null, 'gap-2')).toBe('flex gap-2')
  })

  it('trata as 7 classes de text- do projeto como um grupo de conflito coerente', () => {
    expect(cn('text-xs', 'text-primary-text')).toBe('text-xs text-primary-text')
    expect(cn('text-sm', 'text-lg')).toBe('text-lg')
  })

  it('h-control-md substitui h-control-sm', () => {
    expect(cn('h-control-sm', 'h-control-md')).toBe('h-control-md')
  })
})

describe('cn: grupo font-size ganha label e help (item D13 do levantamento da Sincronizacao 1)', () => {
  it('text-label e text-help entram no grupo de conflito de tamanho de fonte', () => {
    expect(cn('text-sm', 'text-label')).toBe('text-label')
    expect(cn('text-label', 'text-xs')).toBe('text-xs')
  })

  it('text-label-foreground (cor) e text-label (tamanho) nao conflitam entre si', () => {
    expect(cn('text-label-foreground', 'text-label')).toBe('text-label-foreground text-label')
  })
})

describe('cn: grupo w-control-*', () => {
  it('a última largura de controle vence', () => {
    expect(cn('w-control-sm', 'w-control-md')).toBe('w-control-md')
  })

  it('não mistura w-control-* com outras classes de largura', () => {
    expect(cn('w-full', 'w-control-lg')).toBe('w-control-lg')
  })
})
