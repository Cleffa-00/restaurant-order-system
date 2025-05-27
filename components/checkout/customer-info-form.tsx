"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CustomerInfo {
  name: string
  phone: string
}

interface ValidationErrors {
  name?: string
  phone?: string
}

interface CustomerInfoFormProps {
  customerInfo: CustomerInfo
  errors: ValidationErrors
  onInputChange: (field: keyof CustomerInfo, value: string) => void
  onPhoneChange: (value: string) => void
  onNameBlur: () => void
  onPhoneBlur: () => void
}

export function CustomerInfoForm({
  customerInfo,
  errors,
  onInputChange,
  onPhoneChange,
  onNameBlur,
  onPhoneBlur,
}: CustomerInfoFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Customer Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={customerInfo.name}
            onChange={(e) => onInputChange("name", e.target.value)}
            onBlur={onNameBlur}
            className={errors.name ? "border-red-500 focus:border-red-500" : ""}
          />
          {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
        </div>

        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Enter your phone number"
            value={customerInfo.phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            onBlur={onPhoneBlur}
            className={errors.phone ? "border-red-500 focus:border-red-500" : ""}
          />
          {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
