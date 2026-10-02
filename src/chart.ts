/**
 * ENTRADA SEPARADA (`@rendra-ui/app/chart`): o `Chart` e seus tipos ficam fora da entrada
 * principal de proposito, porque carregam `d3-shape` (JS puro, ~60 KB); so entram no bundle de
 * quem realmente usa. Nunca reexporte daqui para `src/index.ts` nem para
 * `src/components/ui/index.ts` (o `verify:pack` barra `d3-shape` fora de `components/ui/chart.js`).
 */
export * from './components/ui/chart'
