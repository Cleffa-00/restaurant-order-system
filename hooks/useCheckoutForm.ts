"use client"

import { useState } from "react"

export interface CustomerInfo {
  name: string
  phone: string
}

export interface ValidationErrors {
  name?: string
  phone?: string
}

export function useCheckoutForm() {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    phone: "",
  })
  const [errors, setErrors] = useState<ValidationErrors>({})

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

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  // Handle phone input (numeric only)
  const handlePhoneChange = (value: string) => {
    // Allow only numbers, spaces, dashes, and parentheses
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

  return {
    customerInfo,
    errors,
    handleInputChange,
    handlePhoneChange,
    handleNameBlur,
    handlePhoneBlur,
    validateForm,
    isFormValid,
  }
}
