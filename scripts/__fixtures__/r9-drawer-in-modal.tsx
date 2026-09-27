import type { ReactNode } from 'react'

function Modal({ children }: { children?: ReactNode }) {
  return null
}
function Drawer({ children }: { children?: ReactNode }) {
  return null
}

export function R9DrawerInModal() {
  return (
    <Modal>
      <Drawer>{null}</Drawer>
    </Modal>
  )
}
