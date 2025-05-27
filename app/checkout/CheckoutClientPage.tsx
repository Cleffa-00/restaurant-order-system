"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { CartApiService } from "@/lib/api/cart"
import { CheckoutHeader } from "@/components/checkout/checkout-header"
import { CustomerInfoForm } from "@/components/checkout/customer-info-form"
import { CheckoutOrderSummary } from "@/components/checkout/checkout-order-summary"
import { CheckoutSubmitButton } from "@/components/checkout/checkout-submit-button"
import { ErrorAlert } from "@/components/ui/error-alert" // 新增错误组件

interface CustomerInfo {
  name: string
  phone: string
}

interface ValidationErrors {
  name?: string
  phone?: string
}

interface SubmissionError {
  type: "error" | "warning" | "network"
  title?: string
  message: string
}

export default function CheckoutClientPage() {
  const router = useRouter()
  const { 
    items: cartItems, 
    getCartSummary,
    createOrderData,
    clearCart,
    isSubmittingOrder,
    setIsSubmittingOrder 
  } = useCart()

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    phone: "",
  })
  const [customerNote, setCustomerNote] = useState("")
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [orderCompleted, setOrderCompleted] = useState(false)
  const [submissionError, setSubmissionError] = useState<SubmissionError | null>(null)

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

  // 清除提交错误当用户开始修改表单
  useEffect(() => {
    if (submissionError) {
      setSubmissionError(null)
    }
  }, [customerInfo, customerNote])

  // Validation functions
  const validateName = (name: string): string | undefined => {
    if (!name.trim()) return "Name is required"
    if (name.trim().length < 2) return "Name must be at least 2 characters"
    return undefined
  }

  const validatePhone = (phone: string): string | undefined => {
    if (!phone.trim()) return "Phone number is required"
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
    const cleanPhone = phone.replace(/[^\d]/g, "")
    if (cleanPhone.length !== 10) {
      return "Please enter a valid 10-digit phone number"
    }
    if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
      return "Please enter a valid phone number format"
    }
    return undefined
  }

  // 格式化手机号
  const formatPhoneNumber = (value: string): string => {
    const phoneNumber = value.replace(/[^\d]/g, "")
    const phoneNumberLength = phoneNumber.length
    
    if (phoneNumberLength < 4) return phoneNumber
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
  }

  // Handle input changes with validation
  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  // Handle phone input with formatting
  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value)
    handleInputChange("phone", formatted)
  }

  // Handle validation on blur
  const handleNameBlur = () => {
    const error = validateName(customerInfo.name)
    if (error) setErrors((prev) => ({ ...prev, name: error }))
  }

  const handlePhoneBlur = () => {
    const error = validatePhone(customerInfo.phone)
    if (error) setErrors((prev) => ({ ...prev, phone: error }))
  }

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}
    const nameError = validateName(customerInfo.name)
    const phoneError = validatePhone(customerInfo.phone)
    
    if (nameError) newErrors.name = nameError
    if (phoneError) newErrors.phone = phoneError
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Check if form is valid for submit button
  const isFormValid = () => {
    return (
      customerInfo.name.trim().length >= 2 &&
      customerInfo.phone.replace(/[^\d]/g, "").length === 10 &&
      Object.keys(errors).every(key => !errors[key as keyof ValidationErrors])
    )
  }

  // 处理不同类型的错误
  const handleSubmissionError = (error: any) => {
    console.error("Error submitting order:", error)

    let errorConfig: SubmissionError

    if (error.name === 'TypeError' || error.message?.includes('fetch')) {
      // 网络错误
      errorConfig = {
        type: "network",
        title: "Connection Problem",
        message: "Unable to connect to our servers. Please check your internet connection and try again."
      }
    } else if (error.message?.includes('validation')) {
      // 验证错误
      errorConfig = {
        type: "warning", 
        title: "Invalid Information",
        message: error.message || "Please check your order information and try again."
      }
    } else if (error.message?.includes('timeout')) {
      // 超时错误
      errorConfig = {
        type: "network",
        title: "Request Timeout", 
        message: "The request is taking longer than expected. Please try again."
      }
    } else {
      // 通用错误
      errorConfig = {
        type: "error",
        title: "Order Failed",
        message: error.message || "We couldn't process your order right now. Please try again in a moment."
      }
    }

    setSubmissionError(errorConfig)
  }

  // Handle form submission with improved error handling
  const handleSubmit = async () => {
    if (!validateForm()) {
      const firstErrorField = document.querySelector('.border-red-500')
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    // 清除之前的错误
    setSubmissionError(null)

    try {
      setIsSubmittingOrder(true)

      // 创建订单数据
      const orderData = createOrderData({
        name: customerInfo.name.trim(),
        phone: customerInfo.phone.replace(/[^\d]/g, ""), 
        customerNote: customerNote.trim() || undefined
      })

      console.log('Submitting order:', orderData)

      // 调用API创建订单
      const result = await CartApiService.createOrder(orderData)

      if (result.success && result.data) {
        console.log("Order created successfully:", result.data)
        setOrderCompleted(true)
        clearCart()
        router.push(`/order-confirmation/${result.data.orderNumber}`)
      } else {
        handleSubmissionError(new Error(result.error?.message || "Order creation failed"))
      }
    } catch (error) {
      handleSubmissionError(error)
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
      <CheckoutHeader />

      <div className="max-w-2xl mx-auto p-4 space-y-6 pb-32">
        {/* 错误提示 */}
        {submissionError && (
          <ErrorAlert
            type={submissionError.type}
            title={submissionError.title}
            message={submissionError.message}
            onDismiss={() => setSubmissionError(null)}
            onRetry={submissionError.type === "network" ? handleSubmit : undefined}
          />
        )}

        {/* 客户信息表单 */}
        <div className={isSubmittingOrder ? "pointer-events-none opacity-75" : ""}>
          <CustomerInfoForm
            customerInfo={customerInfo}
            errors={errors}
            onInputChange={handleInputChange}
            onPhoneChange={handlePhoneChange}
            onNameBlur={handleNameBlur}
            onPhoneBlur={handlePhoneBlur}
          />
        </div>

        {/* 订单备注 */}
        <div className={`bg-white rounded-lg border border-gray-200 p-4 ${isSubmittingOrder ? "pointer-events-none opacity-75" : ""}`}>
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
            disabled={isSubmittingOrder}
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
            options: (item.options || []).map(opt => ({
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