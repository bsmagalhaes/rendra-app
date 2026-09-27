function EmptyState(_props: { title: string; actions?: React.ReactNode }) { return null }
function Button(_props: { children?: React.ReactNode }) { return null }
export default function Rota() {
  return <EmptyState title="Nada por aqui" actions={<Button>Adicionar</Button>} />
}
