export interface ThemeCode { code: `T${number}`; brand: string; name: string; description: string }
export interface ColorCode { code: `C${number}`; palette: string; name: string; description: string }

export interface NavCode { code: `N${number}`; name: string; description: string }

export const themeCodes: ThemeCode[] = [
  { code: 'T1', brand: 'safira', name: 'Safira', description: 'Tudo quadrado, preciso.' },
  { code: 'T2', brand: 'equilibrio', name: 'Equilíbrio', description: 'Cantos levemente arredondados, o mais neutro.' },
  { code: 'T3', brand: 'aurora', name: 'Aurora', description: '100% arredondado, amigável.' },
]

export const colorCodes: ColorCode[] = [
  { code: 'C1', palette: 'safira', name: 'Safira', description: 'Azul e verde.' },
  { code: 'C2', palette: 'equilibrio', name: 'Equilíbrio', description: 'Violeta e ciano.' },
  { code: 'C3', palette: 'aurora', name: 'Aurora', description: 'Verde-petróleo e laranja.' },
  { code: 'C4', palette: 'ardosia', name: 'Ardósia', description: 'Grafite e laranja.' },
]

/** Código de navegação do `AppShell` (terceira parte do código de modelo, `T#-C#-N#`). */
export const navCodes: NavCode[] = [
  { code: 'N1', name: 'Gaveta e barra', description: 'Barra inferior com menu em gaveta.' },
  { code: 'N2', name: 'Folha e barra', description: 'Barra inferior com menu em folha.' },
  { code: 'N3', name: 'Só gaveta', description: 'Só gaveta, menu no cabeçalho.' },
]

export interface ModelChoice { theme?: ThemeCode; color?: ColorCode; nav?: NavCode }

export function parseModelCode(input: string): ModelChoice {
  const parts = input.toUpperCase().match(/[TCN]\d+/g) ?? []
  const choice: ModelChoice = {}
  for (const p of parts) {
    if (p.startsWith('T')) choice.theme = themeCodes.find((t) => t.code === p) ?? choice.theme
    if (p.startsWith('C')) choice.color = colorCodes.find((c) => c.code === p) ?? choice.color
    if (p.startsWith('N')) choice.nav = navCodes.find((n) => n.code === p) ?? choice.nav
  }
  return choice
}

export function formatModelCode(choice: ModelChoice) {
  return [choice.theme?.code, choice.color?.code, choice.nav?.code].filter(Boolean).join('-')
}

export const defaultModelCode = 'T1-C1-N1'
