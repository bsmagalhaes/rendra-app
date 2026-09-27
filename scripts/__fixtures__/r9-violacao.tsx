function Modal(props: { children?: React.ReactNode }) { return <>{props.children}</> }
export function Violacao() {
  return (
    <Modal>
      <Modal />
    </Modal>
  )
}
