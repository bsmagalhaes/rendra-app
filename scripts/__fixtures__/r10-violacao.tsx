function Modal(props: { children?: React.ReactNode }) { return <>{props.children}</> }
function Input() { return null }
export function Violacao() {
  return (
    <Modal>
      <Input />
      <Input />
      <Input />
      <Input />
    </Modal>
  )
}
