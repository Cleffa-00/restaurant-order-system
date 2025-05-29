import { ReactNode } from "react";

// app/(auth)/layout.tsx - 
export default function AuthLayout({ children }: { children: ReactNode }) {
    return <>{children}</>
    // 未来可以加：
    // - 特殊的背景
    // - 不同的页面宽度
    // - 隐藏导航栏
  }