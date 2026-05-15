import * as React from "react"
import { cn } from "@/lib/utils"
import { InputContainer, FieldLabel, FieldHint, FieldError, FieldSuccess } from "./form-field"
import { Textarea } from "./textarea"

interface TextareaInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
  success?: string
  required?: boolean
  compact?: boolean
  helperText?: React.ReactNode
}

const TextareaInput = React.forwardRef<HTMLTextAreaElement, TextareaInputProps>(
  ({
    className,
    label,
    hint,
    error,
    success,
    required,
    compact = false,
    helperText,
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
        <Textarea
          ref={ref}
          id={inputId}
          className={cn(
            error && "border-destructive focus-visible:ring-destructive/30",
            success && "border-green-500 focus-visible:ring-green-500/30",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={hint || error || success || helperText ? `${inputId}-description` : undefined}
          {...props}
        />
        {(hint || error || success || helperText) && (
          <div id={`${inputId}-description`}>
            {helperText && (
              <div className="text-xs text-muted-foreground">{helperText}</div>
            )}
            {hint && !helperText && <FieldHint>{hint}</FieldHint>}
            {error && <FieldError>{error}</FieldError>}
            {success && <FieldSuccess>{success}</FieldSuccess>}
          </div>
        )}
      </InputContainer>
    )
  }
)
TextareaInput.displayName = "TextareaInput"

export { TextareaInput }
export type { TextareaInputProps }
