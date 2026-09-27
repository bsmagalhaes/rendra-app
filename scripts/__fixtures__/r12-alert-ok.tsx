function Alert(_props: { type: string; title: string; action?: React.ReactNode }) { return null }
function Button(_props: { children?: React.ReactNode }) { return null }
export default function Rota() {
  return <Alert type="warning" title="Item removido" action={<Button>Desfazer</Button>} />
}
