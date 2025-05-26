"use client"

import { Input } from "@/components/ui/input"
import { FormField } from "@/components/ui/form-field"
import { cn } from "@/lib/utils"

interface CustomerInfoFieldsProps {
  register: any // react-hook-form register function
  errors?: {
    name?: { message?: string }
    phone?: { message?: string }
  }
  className?: string
}

export function CustomerInfoFields({ register, errors, className }: CustomerInfoFieldsProps) {
  return (
    <div className={cn("space-y-3 w-full sm:space-y-4", className)}>
      <FormField label="Name" required error={errors?.name?.message}>
        <Input
          type="text"
          placeholder="Enter your full name"
          className="w-full"
          {...register("name", { required: "Name is required" })}
        />
      </FormField>

      <FormField label="Phone" required error={errors?.phone?.message}>
        <Input
          type="tel"
          placeholder="Enter your phone number"
          className="w-full"
          {...register("phone", { required: "Phone number is required" })}
        />
      </FormField>
    </div>
  )
}
