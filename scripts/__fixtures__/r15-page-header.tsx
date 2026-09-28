function PageHeader(_props: { title?: string; description?: string }) { return null }
export default function Tela() {
  // 151 caracteres (limite 150): acusa.
  return (
    <PageHeader
      title="Tela"
      description="Texto de ajuda longo para o campo cobrir o limite maximo permitido pelo span de largura total do formulario, usado apenas neste teste de etc etc etc et"
    />
  )
}
