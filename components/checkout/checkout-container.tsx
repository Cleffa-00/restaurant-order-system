"use client"

import { useEffect } from "react"
import { mockOrder } from "@/lib/mock-data"
import { calculateOrderPricing } from "@/lib/order-utils"
import { useCheckoutForm } from "@/hooks/useCheckoutForm"
import { useOrderSubmission } from "@/hooks/useOrderSubmission"
import { CheckoutHeader } from "@/components/cart/checkout-header"
import { CustomerInfoForm } from "@/components/cart/customer-info-form"
import { CheckoutOrderSummary } from "@/components/cart/checkout-order-summary"
import { CheckoutSubmitButton } from "@/components/cart/checkout-submit-button"

export function CheckoutContainer() {
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

  const { isSubmitting, submitOrder } = useOrderSubmission()

  // Auto-scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Calculate pricing breakdown
  const subtotal = mockOrder.totalPrice
  const { taxes, serviceFee, total } = calculateOrderPricing(subtotal)

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      alert("Please fix the errors before submitting")
      return
    }

    await submitOrder({
      customerInfo,
      orderItems: mockOrder.items,
      subtotal,
      taxes,
      serviceFee,
      total,
      customerNote: mockOrder.customerNote,
    })
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
          items={mockOrder.items}
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
