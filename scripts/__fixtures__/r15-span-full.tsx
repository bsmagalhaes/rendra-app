function Field(_props: { help?: string; span?: string; children?: React.ReactNode }) { return null }
export default function Tela() {
  // 150 caracteres, span="full" (limite 150): nao acusa.
  return (
    <Field
      span="full"
      help="Texto de ajuda longo para o campo cobrir o limite maximo permitido pelo span de largura total do formulario, usado apenas neste teste de etc etc etc e"
    />
  )
}
