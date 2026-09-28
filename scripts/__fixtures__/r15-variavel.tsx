function Field(_props: { help?: string; span?: string; children?: React.ReactNode }) { return null }
export default function Tela() {
  // help={variavel}: nunca medido (só literal), mesmo passando do limite.
  const texto = 'Este texto vem de uma variavel e passaria do limite se fosse medido aqui'
  return <Field help={texto} />
}
