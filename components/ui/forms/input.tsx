import * as React from "react"
import { cn } from "@/lib/utils/common"

export interface InputProps extends React.ComponentProps<"input"> {
  hasError?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, hasError, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:text-base",
        hasError && "border-destructive focus-visible:ring-destructive",
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
