"use client"

import type * as React from "react"
import { CommandPrimitive } from "cmdk"
import { cn } from "@/lib/utils"

export interface CommandListProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.List> {
  emptyMessage?: string
}

export function CommandList({ className, children, emptyMessage, ...props }: CommandListProps) {
  return (
    <CommandPrimitive.List className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)} {...props}>
      {children}
      {emptyMessage && (
        <CommandPrimitive.Empty className="py-6 text-center text-sm">{emptyMessage}</CommandPrimitive.Empty>
      )}
    </CommandPrimitive.List>
  )
}
