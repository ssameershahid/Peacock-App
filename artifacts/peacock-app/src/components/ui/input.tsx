import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg border-[1.5px] border-warm-100 bg-white px-4 py-3 text-[15px] font-body text-warm-900 transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-warm-300 focus-visible:outline-none focus-visible:border-forest-500 focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:bg-warm-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
