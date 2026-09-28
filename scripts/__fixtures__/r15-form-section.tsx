function Field(_props: { help?: string; span?: string; children?: React.ReactNode }) { return null }
function FormSection(_props: { title?: string; children?: React.ReactNode }) { return null }
export default function Tela() {
  // 2 de 3 Field com help (mais da metade): acusa.
  return (
    <FormSection title="Dados pessoais">
      <Field help="Ajuda um" />
      <Field help="Ajuda dois" />
      <Field />
    </FormSection>
  )
}
