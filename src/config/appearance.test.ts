import { isColorMode, isModelId, modeLabel, modeOptions, modelOptions, paletteOptions } from './appearance'

describe('appearance (opções de aparência da galeria e das configurações)', () => {
  it('modelOptions e paletteOptions saem dos códigos de presets, com o nome em pt-BR', () => {
    expect(modelOptions).toEqual([
      { value: 'T1', label: 'Safira' },
      { value: 'T2', label: 'Equilíbrio' },
      { value: 'T3', label: 'Aurora' },
    ])
    expect(paletteOptions.map((o) => o.label)).toEqual(['Safira', 'Equilíbrio', 'Aurora', 'Ardósia'])
  })

  it('modeOptions tem claro, escuro e sistema', () => {
    expect(modeOptions).toEqual([
      { value: 'light', label: 'Claro' },
      { value: 'dark', label: 'Escuro' },
      { value: 'system', label: 'Sistema' },
    ])
  })

  it('isModelId e isColorMode aceitam só valores reais', () => {
    expect(isModelId('T3')).toBe(true)
    expect(isModelId('T4')).toBe(false)
    expect(isColorMode('dark')).toBe(true)
    expect(isColorMode('roxo')).toBe(false)
  })

  it('modeLabel devolve o texto do modo ativo', () => {
    expect(modeLabel('system')).toBe('sistema')
    expect(modeLabel('dark')).toBe('escuro')
    expect(modeLabel('light')).toBe('claro')
  })
})
