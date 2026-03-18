import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-pill font-body font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 tracking-[0.01em]",
  {
    variants: {
      variant: {
        default: "bg-forest-500 text-white shadow-sm hover:bg-forest-400 active:bg-forest-600",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border-[1.5px] border-forest-500 bg-transparent text-forest-500 hover:bg-warm-50",
        secondary: "bg-warm-100 text-forest-600 hover:bg-warm-200",
        ghost: "bg-transparent text-forest-500 hover:bg-warm-50",
        amber: "bg-amber-300 text-white shadow-sm hover:bg-amber-200 active:bg-amber-400",
        link: "text-forest-500 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-7 py-3 text-[15px]",
        sm: "h-10 px-5 py-2 text-[13px]",
        lg: "h-14 px-9 py-4 text-[16px]",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
