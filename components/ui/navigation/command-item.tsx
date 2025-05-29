"use client"

import type * as React from "react"
import { CommandPrimitive } from "cmdk"
import { cn } from "@/lib/utils/common"

export interface CommandItemProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item> {
  icon?: React.ReactNode
  shortcut?: string
}

export function CommandItem({ className, children, icon, shortcut, ...props }: CommandItemProps) {
  return (
    <CommandPrimitive.Item
      className={cn(
        "relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      {icon && <span className="mr-2 flex h-4 w-4 items-center justify-center">{icon}</span>}
      <span className="flex-1">{children}</span>
      {shortcut && <span className="ml-auto text-xs tracking-widest text-muted-foreground">{shortcut}</span>}
    </CommandPrimitive.Item>
  )
}
