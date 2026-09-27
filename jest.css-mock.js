// Mock de import de efeito colateral de CSS (`import '../global.css'`) sob Jest. O `tsc` já resolve
// esse import por `src/types/css.d.ts` (`declare module '*.css'`), mas o Jest, sem transform nem
// moduleNameMapper para `.css`, tenta interpretar o arquivo como JavaScript e falha em `@tailwind`
// (achado da correção pós-validação, Correção 1: `app/_layout.tsx` nunca tinha sido importado por
// nenhum teste até agora). Módulo vazio: o app real resolve o CSS via Metro/PostCSS, não via Jest.
module.exports = {}
