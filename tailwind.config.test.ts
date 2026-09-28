import config from './tailwind.config'

// `config` é tipado por `satisfies Config` (tailwindcss), cujo `theme` não expõe as chaves
// concretas deste projeto ao TypeScript; o teste lê o `theme` real via um cast único e
// explícito para um dicionário solto, em vez de encadear `config.theme?.<chave>` (que não
// tipa) ou usar `any` disperso pelo arquivo.
const theme = (config as unknown as { theme: Record<string, any> }).theme

describe('tailwind.config.ts, escala zerada', () => {
  it('theme.spacing tem só os degraus do contrato, em theme e não em theme.extend', () => {
    expect(theme.extend?.spacing).toBeUndefined()
    expect(theme.spacing).toEqual({
      '0': '0px', px: '1px', '1': '4px', '2': '8px', '3': '12px', '4': '16px',
      '6': '24px', '8': '32px', '12': '48px', '16': '64px', '24': '96px',
      section: '32px', fields: '16px',
      'control-sm': '44px', 'control-md': '48px', 'control-lg': '52px', touch: '44px',
      'icon-sm': '16px', 'icon-md': '20px', 'icon-lg': '24px', header: '56px',
      'chart-sm': '192px', 'chart-md': '256px',
    })
  })

  it('theme.fontSize tem os 7 tamanhos do contrato mais label/help (item A2 do levantamento), com lineHeight e letterSpacing', () => {
    expect(theme.extend?.fontSize).toBeUndefined()
    expect(theme.fontSize).toEqual({
      xs: ['12px', { lineHeight: '16px', letterSpacing: '0.12px' }],
      sm: ['14px', { lineHeight: '20px', letterSpacing: '0px' }],
      base: ['16px', { lineHeight: '24px', letterSpacing: '0px' }],
      lg: ['17px', { lineHeight: '26px', letterSpacing: '-0.085px' }],
      xl: ['18px', { lineHeight: '26px', letterSpacing: '-0.18px' }],
      '2xl': ['21px', { lineHeight: '28px', letterSpacing: '-0.315px' }],
      '3xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.48px' }],
      label: ['11px', { lineHeight: '16px', letterSpacing: '0.88px' }],
      help: ['12px', { lineHeight: '16px', letterSpacing: '0.12px' }],
    })
  })

  it('theme.fontWeight tem só normal, medium e semibold', () => {
    expect(theme.fontWeight).toEqual({ normal: '400', medium: '500', semibold: '600' })
  })

  it('theme.fontFamily padrão usa os pesos da Safira (T1, modelo padrão)', () => {
    expect(theme.fontFamily?.sans).toEqual(['Poppins_400Regular'])
  })

  it('theme.colors tem os 58 nomes do contrato (menos transparent/current, fixos do Tailwind)', () => {
    const names = Object.keys(theme.colors ?? {})
    expect(names).toContain('primary')
    expect(names).toContain('primary-soft-foreground')
    expect(names).toContain('destructive-hover')
    expect(names).not.toContain('success-hover') // success não tem -hover, contrato §1.1
    expect(names).not.toContain('danger') // nome proibido, spec 5.1
    expect(names).not.toContain('surface') // não é cor, é papel de raio
    expect(names.length).toBeGreaterThanOrEqual(58)
  })

  it('theme.colors tem label-foreground e help-foreground, resolvidos por --rendra-label-color/--rendra-help-color (item A2 do levantamento)', () => {
    expect(theme.colors['label-foreground']).toBe('rgb(var(--rendra-label-color) / <alpha-value>)')
    expect(theme.colors['help-foreground']).toBe('rgb(var(--rendra-help-color) / <alpha-value>)')
  })

  it('sidebar é cor sólida com <alpha-value>, não a variante sem alfa (sidebar-border/-accent/-active são as sem alfa)', () => {
    expect(theme.colors.sidebar).toBe('rgb(var(--rendra-sidebar) / <alpha-value>)')
  })

  it('theme.borderRadius tem os papeis control|item|surface|block|avatar mais full', () => {
    expect(theme.extend?.borderRadius).toBeUndefined()
    expect(Object.keys(theme.borderRadius ?? {})).toEqual(
      expect.arrayContaining(['control', 'item', 'surface', 'block', 'avatar', 'full']),
    )
  })

  it('theme.boxShadow tem sm, md e lg resolvidos por --rendra-shadow-color e --rendra-shadow-opacity-*', () => {
    expect(theme.boxShadow?.sm).toContain('--rendra-shadow-color')
    expect(theme.boxShadow?.sm).toContain('--rendra-shadow-opacity-sm')
    expect(theme.boxShadow?.md).toContain('--rendra-shadow-opacity-md')
    expect(theme.boxShadow?.lg).toContain('--rendra-shadow-opacity-lg')
  })

  it('theme.flex tem 3 e 7, para o grid do futuro ActionBar (F1b)', () => {
    expect(theme.flex?.['3']).toBe('3 3 0%')
    expect(theme.flex?.['7']).toBe('7 7 0%')
  })
})

describe('tailwind.config.ts: maxWidth', () => {
  it('declara 3xl como 768px, não o rem padrão do Tailwind', () => {
    const theme = config.theme as { maxWidth?: Record<string, string> }
    expect(theme.maxWidth?.['3xl']).toBe('768px')
  })

  it('mantem none e full disponíveis', () => {
    const theme = config.theme as { maxWidth?: Record<string, string> }
    expect(theme.maxWidth?.none).toBe('none')
    expect(theme.maxWidth?.full).toBe('100%')
  })
})
