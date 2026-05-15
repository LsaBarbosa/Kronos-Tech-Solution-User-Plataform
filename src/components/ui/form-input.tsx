import * as React from "react"
import { cn } from "@/lib/utils"
import { InputContainer, FieldLabel, FieldHint, FieldError, FieldSuccess, FieldStateIndicator } from "./form-field"
import { Input } from "./input"

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  success?: string
  required?: boolean
  stateIndicator?: "default" | "error" | "success" | "loading"
  compact?: boolean
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({
    className,
    label,
    hint,
    error,
    success,
    required,
    stateIndicator = "default",
    compact = false,
    id,
    ...props
  }, ref) => {
    const generatedId = React.useId()
    const inputId = id || generatedId

    return (
      <InputContainer variant={compact ? "compact" : "default"}>
        {label && (
          <FieldLabel htmlFor={inputId} required={required}>
            {label}
          </FieldLabel>
        )}
        <div className="relative">
          <Input
            ref={ref}
            id={inputId}
            className={cn(
              error && "border-destructive focus-visible:ring-destructive/30",
              success && "border-green-500 focus-visible:ring-green-500/30",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={hint || error || success ? `${inputId}-description` : undefined}
            {...props}
          />
          {stateIndicator !== "default" && (
            <FieldStateIndicator state={stateIndicator} />
          )}
        </div>
        {(hint || error || success) && (
          <div id={`${inputId}-description`}>
            {hint && <FieldHint>{hint}</FieldHint>}
            {error && <FieldError>{error}</FieldError>}
            {success && <FieldSuccess>{success}</FieldSuccess>}
          </div>
        )}
      </InputContainer>
    )
  }
)
FormInput.displayName = "FormInput"

export { FormInput }
export type { FormInputProps }
