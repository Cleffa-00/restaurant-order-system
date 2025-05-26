"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, Home, Copy, Check } from "lucide-react"

export default function OrderConfirmationPage() {
  const router = useRouter()
  const params = useParams()
  const [copied, setCopied] = useState(false)
  const [orderData, setOrderData] = useState(null)
  const [loading, setLoading] = useState(true)

  const orderNumber = params.orderNumber as string
  const estimatedTime = "25-30 minutes"

  useEffect(() => {
    // TODO: Fetch order details from API using orderNumber
    // const fetchOrderDetails = async () => {
    //   try {
    //     const response = await fetch(`/api/orders/${orderNumber}`)
    //     if (!response.ok) {
    //       throw new Error('Order not found')
    //     }
    //     const data = await response.json()
    //     setOrderData(data)
    //   } catch (error) {
    //     console.error('Failed to fetch order details:', error)
    //     // Redirect to home or show error page
    //     router.push('/')
    //   } finally {
    //     setLoading(false)
    //   }
    // }
    // fetchOrderDetails()

    // Simulate API call for now
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [orderNumber, router])

  const handleCopyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(orderNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy order number:", err)
    }
  }

  // Validate order number format (RYYMMDD-XXXX or similar)
  const isValidOrderNumber = (orderNum: string) => {
    // Allow R followed by digits, dash, and more digits
    const regex = /^R\d+-\d+$/
    return regex.test(orderNum)
  }

  // Remove the validation check entirely since we generate the order number internally
  if (!orderNumber || !isValidOrderNumber(orderNumber)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-red-600 mb-4">Invalid order number</p>
            <Button onClick={() => router.push("/")} variant="outline">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </CardContent>
        </Card>
      </div>
    )
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
