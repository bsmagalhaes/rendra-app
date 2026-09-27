export interface RouteSeo {
  path: string
  title: string
  description: string
  indexable: boolean
}

export const siteSeo = {
  productName: 'Rendra App',
  tagline: 'Design system e boilerplate mobile do Rendra, em React Native (Expo) com Expo Router e NativeWind.',
  audience:
    'Quem começa um app novo em React Native (Expo) e quer um design system pronto, ou quem já tem um app e quer migrar a camada visual para o Rendra.',
  repositoryUrl: 'https://github.com/bsmagalhaes/rendra-app',
  commands: ['npm install', 'npm start', 'npm run build', 'npm test'],
}

/**
 * Espelha `showcaseGroups` de `./showcase` (slug e title de cada grupo), sem importar o módulo:
 * `showcase.tsx` importa `react-native`/`lucide-react-native`/`react-hook-form` e todos os
 * componentes, o que quebra quando este módulo é carregado por um script Node puro fora do
 * Jest, como o gerador de SEO do build. A paridade com o módulo real é conferida por teste
 * (`seo.test.ts`, que importa `showcase` só para o teste).
 */
export const SEO_GROUPS = [
  { slug: 'acoes', title: 'Ações' },
  { slug: 'formulario', title: 'Formulário' },
  { slug: 'feedback', title: 'Feedback' },
  { slug: 'exibicao', title: 'Exibição' },
  { slug: 'layout', title: 'Layout' },
] as const

const rotasFixas: RouteSeo[] = [
  {
    path: '/',
    title: `${siteSeo.productName}`,
    description: 'Design system e boilerplate mobile do Rendra, com 43 componentes de UI, tokens em três camadas e três modelos de marca, em React Native e Expo.',
    indexable: true,
  },
  {
    path: '/componentes',
    title: `Componentes · ${siteSeo.productName}`,
    description: 'Vitrine dos 43 componentes de UI do Rendra App, organizados por ações, formulário, feedback, exibição e layout.',
    indexable: true,
  },
  {
    path: '/tokens',
    title: `Tokens · ${siteSeo.productName}`,
    description: 'Escala de espaço, tipografia, raio, sombra e cor do Rendra App, com os três modelos de marca lado a lado.',
    indexable: true,
  },
  {
    path: '/galeria',
    title: `Galeria · ${siteSeo.productName}`,
    description: 'Galeria ao vivo do Rendra App, com troca de modelo, paleta e modo claro/escuro em tempo real.',
    indexable: true,
  },
]

const rotasDeGrupo: RouteSeo[] = SEO_GROUPS.map((grupo) => ({
  path: `/componentes/${grupo.slug}`,
  title: `${grupo.title} · Componentes · ${siteSeo.productName}`,
  description: `Componentes de ${grupo.title.toLowerCase()} do Rendra App, com exemplos ao vivo e os três modelos de marca.`,
  indexable: true,
}))

export const routeSeo: RouteSeo[] = [...rotasFixas, ...rotasDeGrupo]
