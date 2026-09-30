import AsyncStorage from '@react-native-async-storage/async-storage'
import { renderRouter } from 'expo-router/testing-library'
import * as Raiz from '../../app/_layout'

type Rotas = Parameters<typeof renderRouter>[0]

/**
 * Monta a demonstração com o layout raiz de verdade (marca, roteador, Toaster e splash) e devolve
 * o resultado do RNTL com `getPathname()`, `getSegments()`, `getSearchParams()` e
 * `getPathnameWithParams()` do roteador. No RNTL 14 o `render` é assíncrono e o `renderRouter`
 * pendura esses métodos na Promise, então um `await` direto os perde (o `screen` também não os
 * tem): aqui eles são religados ao resultado já resolvido. O armazenamento é limpo antes, para
 * uma tela não herdar a anterior. O `renderRouter` liga `jest.useFakeTimers()` sozinho.
 */
export async function renderDemo(rotas: Record<string, unknown>, initialUrl: string) {
  await AsyncStorage.clear()
  const pendente = renderRouter({ _layout: Raiz, ...rotas } as Rotas, { initialUrl })
  const resultado = await pendente
  return Object.assign(resultado, {
    getPathname: pendente.getPathname,
    getPathnameWithParams: pendente.getPathnameWithParams,
    getSegments: pendente.getSegments,
    getSearchParams: pendente.getSearchParams,
    getRouterState: pendente.getRouterState,
  })
}
