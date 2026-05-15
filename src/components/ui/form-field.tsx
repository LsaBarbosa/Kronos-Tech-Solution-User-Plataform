import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * InputContainer - Container for form input fields
 * Provides consistent spacing and structure for label + input + hint/error
 */
const InputContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "compact"
  }
>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "space-y-2",
      variant === "compact" && "space-y-1",
      className
    )}
    {...props}
  />
))
InputContainer.displayName = "InputContainer"

/**
 * FieldLabel - Semantic label for form inputs with optional required indicator
 * Always pair with form inputs for accessibility
 */
const FieldLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & {
    required?: boolean
  }
>(({ className, required, children, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium text-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  >
    {children}
    {required && <span className="ml-1 text-destructive" aria-label="required">*</span>}
  </label>
))
FieldLabel.displayName = "FieldLabel"

/**
 * FieldHint - Helper text below form input
 * Use for additional information or instructions
 */
const FieldHint = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs text-muted-foreground", className)}
    {...props}
  />
))
FieldHint.displayName = "FieldHint"

/**
 * FieldError - Error message below form input
 * Display when validation fails, uses alert role
 */
const FieldError = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs font-medium text-destructive", className)}
    role="alert"
    {...props}
  />
))
FieldError.displayName = "FieldError"

/**
 * FieldSuccess - Success message below form input
 * Display after successful validation or action
 */
const FieldSuccess = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs font-medium text-green-600 dark:text-green-400", className)}
    role="status"
    {...props}
  />
))
FieldSuccess.displayName = "FieldSuccess"

/**
 * FieldGroup - Group related form input fields
 * Provides consistent spacing between field groups
 */
const FieldGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "compact"
  }
>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "space-y-4",
      variant === "compact" && "space-y-3",
      className
    )}
    {...props}
  />
))
FieldGroup.displayName = "FieldGroup"

/**
 * FieldSection - Semantic section for organizing form field groups
 * Use for organizing large forms into sections with legend
 */
const FieldSection = React.forwardRef<
  HTMLFieldSetElement,
  React.FieldsetHTMLAttributes<HTMLFieldSetElement> & {
    title?: string
    description?: string
  }
>(({ className, title, description, children, ...props }, ref) => (
  <fieldset
    ref={ref}
    className={cn("space-y-4", className)}
    {...props}
  >
    {title && (
      <div className="space-y-1">
        <legend className="text-lg font-semibold text-foreground">{title}</legend>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
    )}
    {children}
  </fieldset>
))
FieldSection.displayName = "FieldSection"

/**
 * FieldStateIndicator - Visual indicator for input validation state
 * Shows icon for error, success, or loading state
 */
interface FieldStateIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  state?: "default" | "error" | "success" | "loading"
}

const FieldStateIndicator = React.forwardRef<
  HTMLDivElement,
  FieldStateIndicatorProps
>(({ className, state = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 flex items-center justify-center",
      state === "error" && "text-destructive",
      state === "success" && "text-green-600 dark:text-green-400",
      state === "loading" && "text-muted-foreground animate-spin",
      className
    )}
    aria-hidden="true"
    {...props}
  />
))
FieldStateIndicator.displayName = "FieldStateIndicator"

export {
  InputContainer,
  FieldLabel,
  FieldHint,
  FieldError,
  FieldSuccess,
  FieldGroup,
  FieldSection,
  FieldStateIndicator,
}

export type { FieldStateIndicatorProps }
