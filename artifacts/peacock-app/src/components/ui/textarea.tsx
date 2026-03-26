import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded-lg border-[1.5px] border-warm-100 bg-white px-4 py-3 text-[15px] font-body text-warm-900 resize-y transition-all duration-200 placeholder:text-warm-300 focus-visible:outline-none focus-visible:border-forest-500 focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:bg-warm-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
