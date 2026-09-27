function Gradient(_props: { token: string }) { return null }
function Button(props: { children?: React.ReactNode }) { return <>{props.children}</> }
export default function Rota() {
  return (
    <Button>
      <Gradient token="accent" />
    </Button>
  )
}
