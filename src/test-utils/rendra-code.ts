import type { TestInstance } from 'test-renderer'

/**
 * Acha os nós hospedeiros cujo `dataSet.rendra` bate com o código do catálogo (Bloco 6 da
 * Sincronizacao 1, achado B3 do veredito do Opus). Evita `testID` em componentes que não
 * aceitam essa prop (`Accordion`, `Card`, `FormSection`, `InfoHint`, `OtpInput`, `Field`), e
 * evita depender do `testID` de um ícone interno (risco R10 do levantamento).
 */
export function nodesWithCode(container: TestInstance, code: string): TestInstance[] {
  return container.queryAll((node) => node.props.dataSet?.rendra === code)
}
