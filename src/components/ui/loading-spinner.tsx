import * as React from "react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
  label?: string
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ size = "md", label, className, ...props }, ref) => {
    const sizeClasses = {
      sm: "w-6 h-6",
      md: "w-8 h-8",
      lg: "w-12 h-12",
    }

    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-center justify-center gap-2", className)}
        role="status"
        {...props}
      >
        <div
          className={cn(
            "border-2 border-muted-foreground border-t-primary rounded-full animate-spin",
            sizeClasses[size]
          )}
          aria-hidden="true"
        />
        {label && <p className="text-sm text-muted-foreground">{label}</p>}
        <span className="sr-only">Loading...</span>
      </div>
    )
  }
)
LoadingSpinner.displayName = "LoadingSpinner"

export { LoadingSpinner }
export type { LoadingSpinnerProps }
