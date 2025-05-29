import * as React from "react"
import { cn } from "@/lib/utils/common"

interface NavigationMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  href?: string
  disabled?: boolean
  icon?: React.ReactNode
  description?: string
}

const NavigationMenuItem = React.forwardRef<HTMLDivElement, NavigationMenuItemProps>(
  ({ className, href, disabled, icon, description, children, ...props }, ref) => {
    const Component = href ? "a" : "div"

    return (
      <Component
        ref={ref}
        href={href}
        className={cn(
          "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
          "hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900",
          disabled && "pointer-events-none opacity-50",
          className,
        )}
        {...props}
      >
        {icon && <span className="mr-2 h-4 w-4 flex-shrink-0">{icon}</span>}
        <div className="flex-1">
          <div>{children}</div>
          {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
        </div>
      </Component>
    )
  },
)
NavigationMenuItem.displayName = "NavigationMenuItem"

export { NavigationMenuItem }
