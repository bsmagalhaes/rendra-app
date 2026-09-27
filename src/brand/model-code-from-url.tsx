import { useEffect, useRef } from 'react'
import { useRendraNavigation } from '../navigation/rendra-navigation'
import { useBrand } from './use-brand'
import { parseModelCode } from '../config/presets'

const MODO_MAP: Record<string, 'light' | 'dark' | 'system'> = {
  claro: 'light', escuro: 'dark', sistema: 'system',
}

/**
 * Lê ?codigo=T#-C# e ?modo=claro|escuro|sistema da URL atual e aplica no BrandProvider,
 * depois de hydrated. Montado uma única vez em app/_layout.tsx, dentro do BrandProvider,
 * acima de <Stack>: funciona em qualquer rota (/tokens, /galeria, e as que a F1b acrescentar),
 * no lugar do useEffect que uma versão anterior deste plano duplicava em cada rota.
 */
export function ModelCodeFromUrl() {
  const { searchParams } = useRendraNavigation()
  const codigo = searchParams?.codigo
  const modo = searchParams?.modo
  const { hydrated, setModelAndPalette, setMode } = useBrand()
  // Achado B1/decisão 8 do plano (veredito do Opus): `persist` do BrandProvider muda de
  // identidade a cada troca de modelo/paleta/modo (brand-provider.tsx:100-105), então
  // `setModelAndPalette`/`setMode` (fechados sobre esse `persist`) também mudam de identidade a
  // cada troca. Como os dois setters continuam nas dependências do efeito abaixo (lint limpo,
  // sem desabilitar exhaustive-deps), o efeito rodava de novo a cada troca e reaplicava
  // `?codigo=`/`?modo=` da URL, revertendo qualquer troca manual feita depois da primeira
  // aplicação. A guarda por valor aplicado (não por identidade de função) corta essa
  // reaplicação: só chama o setter quando o valor de `codigo`/`modo` na URL muda de fato.
  const aplicadoRef = useRef<{ codigo?: string; modo?: string }>({})

  useEffect(() => {
    if (!hydrated) return
    if (codigo !== undefined && aplicadoRef.current.codigo !== codigo) {
      aplicadoRef.current.codigo = codigo
      const choice = parseModelCode(codigo)
      // Melhoria da rodada 4 de validação: uma escrita só, com atualização funcional
      // (setModelAndPalette), em vez de setModelCode + setPaletteId em sequência; a segunda
      // chamada, fechando sobre o `persist` do mesmo render, reverteria o campo já gravado
      // pela primeira, persistindo um StoredBrand desatualizado.
      if (choice.theme || choice.color) {
        setModelAndPalette(choice.theme?.code as 'T1' | 'T2' | 'T3' | undefined, choice.color?.palette)
      }
    }
    if (modo !== undefined && aplicadoRef.current.modo !== modo && MODO_MAP[modo]) {
      aplicadoRef.current.modo = modo
      setMode(MODO_MAP[modo])
    }
  }, [codigo, modo, hydrated, setModelAndPalette, setMode])

  return null
}
