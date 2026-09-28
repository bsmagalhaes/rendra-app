import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      // 'label'/'help' (item D13 do levantamento da Sincronizacao 1): sem entrar aqui,
      // tailwind-merge trata text-label/text-help como classe de cor generica e as coloca em
      // conflito com text-label-foreground/text-help-foreground (mesmo prefixo "text-").
      'font-size': [{ text: ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', 'label', 'help'] }],
      // tailwind-merge não lê tailwind.config.ts: os degraus de altura control-sm/md/lg
      // (Tarefa B1, theme.spacing) não fazem parte da lista padrão de valores reconhecidos
      // pelo grupo de conflito "h" (só números, frações, palavras-chave fixas e arbitrário),
      // então sem esta extensão duas classes h-control-* ficam lado a lado em vez de a
      // última vencer.
      h: [{ h: ['control-sm', 'control-md', 'control-lg'] }],
      // Mesmo motivo do grupo h acima, para w-control-sm/md/lg (Tarefa 18, pendência j).
      w: [{ w: ['control-sm', 'control-md', 'control-lg'] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
