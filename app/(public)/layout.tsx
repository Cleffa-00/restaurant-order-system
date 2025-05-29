import { ReactNode } from "react"

export default function PublicLayout({ children }: { children: ReactNode }) {
    return (
      <>
        {/* 如果你有公共组件如 Header */}
        {children}
      </>
    )
  }