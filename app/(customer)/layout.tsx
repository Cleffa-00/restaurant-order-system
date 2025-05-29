import { ReactNode } from "react";

export default function CustomerLayout({ children }: { children: ReactNode }) {
    // 未来可以加认证检查
    return <>{children}</>
  }