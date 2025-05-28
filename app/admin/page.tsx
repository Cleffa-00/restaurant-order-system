// app/admin/page.tsx - 可选的重定向页面
import { redirect } from 'next/navigation'

export default function AdminPage() {
  // 自动重定向到orders页面
  redirect('/admin/orders')
}