// Declaração versionada (não gerada, ao contrário de `expo-env.d.ts`) para que um clone limpo
// deste repositório passe em `npx tsc --noEmit` logo após `npm install`, sem precisar rodar
// `npx expo start`/`expo prebuild` antes (os únicos comandos que fariam o Expo CLI gerar
// `expo-env.d.ts`, que está no `.gitignore` herdado do template).
//
// `expo-env.d.ts` referencia `expo/types`, que é quem declara `*.css` (usado pelo import de
// efeito colateral `import '../global.css'` em `app/_layout.tsx`, Tarefa A1/A3). Sem essa
// referência presente no repositório, o `tsc` falha com TS2882 em qualquer clone que ainda não
// tenha rodado o Expo CLI. Esta declaração local resolve o mesmo caso sem depender de um arquivo
// gerado.
declare module '*.css'
