import type { Config } from 'tailwindcss'
import rendraPreset from './src/theme/tailwind-preset'

// `theme` e `presets` vêm de `src/theme/tailwind-preset.ts`, a mesma fonte que o pacote publica
// em `./tailwind-preset` (padrão dos produtos Rendra, seção 1.4): o app deste repositório e quem
// instala o pacote leem exatamente o mesmo objeto. `theme` fica espalhado aqui (em vez de
// `presets: [rendraPreset]`) para `tailwind.config.test.ts` continuar lendo `config.theme` direto.
export default {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: rendraPreset.presets,
  theme: rendraPreset.theme,
} satisfies Config
