// app/admin/layout.tsx
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 简单的布局，不做权限检查（因为中间件已经处理了）
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}