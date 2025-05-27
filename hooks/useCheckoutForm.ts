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

  // 更宽松的验证函数
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

  // Handle input changes with validation
  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
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
    const nameValid = customerInfo.name.trim().length >= 1
    const phoneValid = customerInfo.phone.replace(/\D/g, "").length >= 10
    const noErrors = Object.keys(errors).every(key => !errors[key as keyof ValidationErrors])
    
    return nameValid && phoneValid && noErrors
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