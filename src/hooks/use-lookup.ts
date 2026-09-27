import { useCallback } from 'react'

export interface LookupResult {
  logradouro?: string
  cidade?: string
  uf?: string
  razaoSocial?: string
}

export function useLookup() {
  return useCallback(async (_mask: 'cep' | 'cnpj' | 'cpfCnpj', _value: string): Promise<LookupResult | null> => {
    return null
  }, [])
}
