"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { CheckoutHeader } from "@/components/cart/checkout-header"
import { CustomerInfoForm } from "@/components/cart/customer-info-form"
import { CheckoutOrderSummary } from "@/components/cart/checkout-order-summary"
import { CheckoutSubmitButton } from "@/components/cart/checkout-submit-button"
import { generateOrderNumber } from "@/lib/order-utils"

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
  const { items: cartItems, getTotalPrice, clearCart } = useCart()
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    phone: "",
  })
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderCompleted, setOrderCompleted] = useState(false)

  // Auto-scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Redirect to cart if no items (but not during submission or after order completion)
  useEffect(() => {
    if (cartItems.length === 0 && !isSubmitting && !orderCompleted) {
      router.push("/cart")
    }
  }, [cartItems.length, isSubmitting, orderCompleted, router])

  // Calculate pricing breakdown from actual cart data with safety checks
  const subtotal = getTotalPrice() || 0
  const taxRate = 0.0875 // 8.75%
  const taxes = Math.round(subtotal * taxRate * 100) / 100
  const serviceFee = Math.round(Math.min(subtotal * 0.05, 0.5) * 100) / 100
  const total = subtotal + taxes + serviceFee

  // Generate order number in RYYMMDD-XXXX format
  // const generateOrderNumber = () => {
  //   const now = new Date()
  //   const year = now.getFullYear().toString().slice(-2)
  //   const month = (now.getMonth() + 1).toString().padStart(2, "0")
  //   const day = now.getDate().toString().padStart(2, "0")
  //   const randomNum = Math.floor(1000 + Math.random() * 9000)
  //   return `R${year}${month}${day}-${randomNum}`
  // }

  // Validation functions
  const validateName = (name: string): string | undefined => {
    if (!name.trim()) return "Name is required"
    if (name.trim().length < 2) return "Name must be at least 2 characters"
    return undefined
  }

  const validatePhone = (phone: string): string | undefined => {
    if (!phone.trim()) return "Phone number is required"
    const phoneRegex = /^\d{10,15}$/
    if (!phoneRegex.test(phone.replace(/\D/g, ""))) {
      return "Please enter a valid phone number (10-15 digits)"
    }
    return undefined
  }

  // Handle input changes with validation
  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  // Handle phone input (numeric only)
  const handlePhoneChange = (value: string) => {
    const cleanValue = value.replace(/[^\d\s\-$$$$]/g, "")
    handleInputChange("phone", cleanValue)
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
      customerInfo.phone.replace(/\D/g, "").length >= 10 &&
      Object.keys(errors).length === 0
    )
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      alert("Please fix the errors before submitting")
      return
    }

    setIsSubmitting(true)

    try {
      // TODO: POST the order to /api/orders with the full order structure
      // API should return: { success: true, orderNumber: string, orderId: string }

      // TODO: Replace with actual API call
      // const response = await fetch('/api/orders', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(orderPayload)
      // })
      // const { orderNumber } = await response.json()

      // Temporary mock response - remove when API is ready
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const orderNumber = generateOrderNumber()

      setOrderCompleted(true)
      clearCart()
      router.push(`/order-confirmation/${orderNumber}`)
    } catch (error) {
      console.error("Order submission failed:", error)
      alert("Failed to place order. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading if no cart items and redirecting
  if (cartItems.length === 0 && !isSubmitting && !orderCompleted) {
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

      <div className="p-4 space-y-6 pb-32">
        <CustomerInfoForm
          customerInfo={customerInfo}
          errors={errors}
          onInputChange={handleInputChange}
          onPhoneChange={handlePhoneChange}
          onNameBlur={handleNameBlur}
          onPhoneBlur={handlePhoneBlur}
        />

        <CheckoutOrderSummary
          items={cartItems}
          subtotal={subtotal}
          taxes={taxes}
          serviceFee={serviceFee}
          total={total}
        />
      </div>

      <CheckoutSubmitButton
        total={total}
        isFormValid={isFormValid()}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
