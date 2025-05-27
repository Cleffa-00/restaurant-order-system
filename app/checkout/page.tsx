"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { CheckoutHeader } from "@/components/checkout/checkout-header"
import { CustomerInfoForm } from "@/components/checkout/customer-info-form"
import { CheckoutOrderSummary } from "@/components/checkout/checkout-order-summary"
import { CheckoutSubmitButton } from "@/components/checkout/checkout-submit-button"
import { useCheckoutForm } from "@/hooks/useCheckoutForm"
import { CartApiService } from "@/lib/api/cart"

interface CustomerInfo {
  name: string
  phone: string
}

interface ValidationErrors {
  name?: string
  phone?: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { 
    items: cartItems, 
    getCartSummary,
    createOrderData,
    clearCart,
    isSubmittingOrder,
    setIsSubmittingOrder 
  } = useCart()

  const {
    customerInfo,
    errors,
    handleInputChange,
    handlePhoneChange,
    handleNameBlur,
    handlePhoneBlur,
    validateForm,
    isFormValid,
  } = useCheckoutForm()

  const [customerNote, setCustomerNote] = useState("")
  const [orderCompleted, setOrderCompleted] = useState(false)

  // 获取购物车摘要
  const cartSummary = getCartSummary()

  // Auto-scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Redirect to cart if no items (but not during submission or after order completion)
  useEffect(() => {
    if (cartItems.length === 0 && !isSubmittingOrder && !orderCompleted) {
      router.push("/cart")
    }
  }, [cartItems.length, isSubmittingOrder, orderCompleted, router])

  // Validation functions - 更宽松的验证
  const validateName = (name: string): string | undefined => {
    if (!name || !name.trim()) return "Name is required"
    const trimmedName = name.trim()
    if (trimmedName.length < 1) return "Name is required"
    if (trimmedName.length > 50) return "Name is too long"
    return undefined
  }

  const validatePhone = (phone: string): string | undefined => {
    if (!phone || !phone.trim()) return "Phone number is required"
    
    // 清理手机号：移除所有非数字字符
    const cleanPhone = phone.replace(/\D/g, "")
    
    // 检查长度：支持 10-15 位数字（国际格式）
    if (cleanPhone.length < 10) {
      return "Phone number must be at least 10 digits"
    }
    if (cleanPhone.length > 15) {
      return "Phone number is too long"
    }
    
    // 简单验证：确保至少有 10 位数字
    if (!/^\d{10,15}$/.test(cleanPhone)) {
      return "Please enter a valid phone number"
    }
    
    return undefined
  }

  // 更宽松的格式化手机号
  const formatPhoneNumber = (value: string): string => {
    // 只保留数字
    const phoneNumber = value.replace(/\D/g, "")
    
    // 限制最大长度
    if (phoneNumber.length > 15) {
      return formatPhoneNumber(phoneNumber.slice(0, 15))
    }
    
    const phoneNumberLength = phoneNumber.length
    
    // 美国格式化（10位数字）
    if (phoneNumberLength <= 10) {
      if (phoneNumberLength < 4) return phoneNumber
      if (phoneNumberLength < 7) {
        return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
      }
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
    }
    
    // 国际格式（超过10位）
    return `+${phoneNumber.slice(0, -10)} (${phoneNumber.slice(-10, -7)}) ${phoneNumber.slice(-7, -4)}-${phoneNumber.slice(-4)}`
  }



  // Handle form submission with API integration
  const handleSubmit = async () => {
    if (!validateForm()) {
      // 滚动到第一个错误字段
      const firstErrorField = document.querySelector('.border-red-500')
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    try {
      setIsSubmittingOrder(true)

      // 创建订单数据 - 确保数据清理
      const orderData = createOrderData({
        name: customerInfo.name.trim(),
        phone: customerInfo.phone.replace(/\D/g, ""), // 移除所有非数字字符
        customerNote: customerNote.trim() || undefined
      })

      console.log('Submitting order with cleaned data:', {
        originalName: customerInfo.name,
        cleanedName: customerInfo.name.trim(),
        originalPhone: customerInfo.phone,
        cleanedPhone: customerInfo.phone.replace(/\D/g, ""),
        orderData
      })

      // 调用API创建订单
      const result = await CartApiService.createOrder(orderData)

      if (result.success && result.data) {
        console.log("Order created successfully:", result.data)
        
        // 标记订单完成
        setOrderCompleted(true)
        
        // 清空购物车
        clearCart()
        
        // 跳转到订单确认页面
        router.push(`/order-confirmation/${result.data.orderNumber}`)
      } else {
        // 处理API错误
        console.error("Order creation failed:", result.error)
        alert(`Order creation failed: ${result.error?.message || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error submitting order:", error)
      alert(`Error submitting order: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  // Show loading if no cart items and redirecting
  if (cartItems.length === 0 && !isSubmittingOrder && !orderCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to cart...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CheckoutHeader/>

      <div className="max-w-2xl mx-auto p-4 space-y-6 pb-32">
        {/* 客户信息表单 */}
        <CustomerInfoForm
          customerInfo={customerInfo}
          errors={errors}
          onInputChange={handleInputChange}
          onPhoneChange={handlePhoneChange}
          onNameBlur={handleNameBlur}
          onPhoneBlur={handlePhoneBlur}
        />

        {/* 订单备注 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <label htmlFor="customer-note" className="block text-sm font-medium text-gray-900 mb-2">
            Order Notes (Optional)
          </label>
          <textarea
            id="customer-note"
            placeholder="Any special instructions for your order..."
            value={customerNote}
            onChange={(e) => setCustomerNote(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 resize-none"
            rows={3}
            maxLength={500}
          />
          <div className="text-xs text-gray-500 mt-1">
            {customerNote.length}/500 characters
          </div>
        </div>

        {/* 订单摘要 */}
        <CheckoutOrderSummary
          items={cartItems.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            options: item.options.map(opt => ({
              optionId: opt.optionId,
              optionName: opt.optionName,
              groupName: opt.groupName,
              priceDelta: opt.priceDelta,
              quantity: opt.quantity
            })),
            specialInstructions: item.specialInstructions
          }))}
          subtotal={cartSummary.subtotal}
          taxes={cartSummary.taxAmount}
          serviceFee={cartSummary.serviceFee}
          total={cartSummary.total}
        />
      </div>

      {/* 提交按钮 */}
      <CheckoutSubmitButton
        total={cartSummary.total}
        isFormValid={isFormValid()}
        isSubmitting={isSubmittingOrder}
        onSubmit={handleSubmit}
      />
    </div>
  )
}