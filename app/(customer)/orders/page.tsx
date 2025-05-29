"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/forms/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/layout/card"
import { CheckCircle, Clock, Home, Copy, Check } from "lucide-react"

export default function OrderConfirmationPage() {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  // Generate order number in RYYMMDD-XXXX format
  const generateOrderNumber = () => {
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2) // Last 2 digits of year
    const month = (now.getMonth() + 1).toString().padStart(2, "0") // Month with leading zero
    const day = now.getDate().toString().padStart(2, "0") // Day with leading zero
    const randomNum = Math.floor(1000 + Math.random() * 9000) // 4-digit random number

    return `R${year}${month}${day}-${randomNum}`
  }

  const orderNumber = generateOrderNumber()
  const estimatedTime = "25-30 minutes"

  const handleCopyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(orderNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy order number:", err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-600">Order Confirmed!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div>
            <p className="text-gray-600 mb-2">Your order number is:</p>
            <div className="flex items-center justify-center gap-2">
              <p className="text-xl font-mono font-bold text-gray-900">{orderNumber}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyOrderNumber}
                className="h-8 w-8 p-0 hover:bg-gray-100"
                aria-label="Copy order number"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
              </Button>
            </div>
            {copied && <p className="text-sm text-green-600 mt-1">Order number copied!</p>}
          </div>

          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Clock className="w-5 h-5" />
            <span>Estimated preparation time: {estimatedTime}</span>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              We'll send you updates about your order status. Thank you for choosing our restaurant!
            </p>
          </div>

          <div className="space-y-3">
            <Button onClick={() => router.push("/menu")} className="w-full">
              Order More Items
            </Button>
            <Button onClick={() => router.push("/")} variant="outline" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
