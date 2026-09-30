/*
 * Buscas fictícias de CEP e CNPJ da demonstração (mesmo papel do `fakeUpload` do web): mapas
 * fixos e uma Promise já resolvida, sem rede. Não é um hook público: as telas chamam estas
 * funções quando a máscara completa 8 ou 14 dígitos. O `useLookup` do pacote (stub que devolve
 * `null`) continua intocado.
 */

export interface ResultadoCep {
  cidade: string
  uf: string
}

export interface ResultadoCnpj {
  razaoSocial: string
}

const ceps: Record<string, ResultadoCep> = {
  '01310100': { cidade: 'São Paulo', uf: 'SP' },
  '30140071': { cidade: 'Belo Horizonte', uf: 'MG' },
  '80010000': { cidade: 'Curitiba', uf: 'PR' },
  '40020000': { cidade: 'Salvador', uf: 'BA' },
}

const cnpjs: Record<string, ResultadoCnpj> = {
  '11222333000181': { razaoSocial: 'Comercial Aurora Ltda' },
  '45997418000153': { razaoSocial: 'Padaria Estrela Ltda' },
}

const soDigitos = (valor: string) => valor.replace(/\D/g, '')

export function lookupCep(cep: string): Promise<ResultadoCep | null> {
  return Promise.resolve(ceps[soDigitos(cep)] ?? null)
}

export function lookupCnpj(cnpj: string): Promise<ResultadoCnpj | null> {
  return Promise.resolve(cnpjs[soDigitos(cnpj)] ?? null)
}
