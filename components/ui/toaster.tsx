"use client"

import { useToast } from "@/hooks/use-toast"
import { ToastManager } from "@/components/ui/toast"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return <ToastManager toasts={toasts} onRemove={dismiss} />
}
