"use client"

import type React from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 暂时禁用身份��证检查，用于前端调试
  // const { isAuthenticated, isLoading } = useAdminAuth()
  // const router = useRouter()

  // useEffect(() => {
  //   if (!isLoading && !isAuthenticated) {
  //     router.push("/auth/login")
  //   }
  // }, [isAuthenticated, isLoading, router])

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-lg">Loading...</div>
  //     </div>
  //   )
  // }

  // if (!isAuthenticated) {
  //   return null
  // }

  return <div className="min-h-screen bg-gray-50">{children}</div>
}
