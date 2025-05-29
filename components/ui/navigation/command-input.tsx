"use client"

import type * as React from "react"
import { CommandPrimitive } from "cmdk"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils/common"

export interface CommandInputProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input> {
  placeholder?: string
  showSearchIcon?: boolean
}

export function CommandInput({
  className,
  placeholder = "Search...",
  showSearchIcon = true,
  ...props
}: CommandInputProps) {
  return (
    <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
      {showSearchIcon && <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />}
      <CommandPrimitive.Input
        className={cn(
          "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        placeholder={placeholder}
        {...props}
      />
    </div>
  )
}
