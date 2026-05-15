# Form Layout Components Guide

Forms in KRONOS use a two-layer approach: **React Hook Form for logic**, **Form Layout Components for presentation**.

## Components Overview

### Level 1: Individual Field Components
These build up a form field with label, hint, error, and state indicator:

- **InputContainer** — Wrapper providing consistent spacing (space-y-2 or space-y-1 compact)
- **FieldLabel** — Label with optional required indicator (red asterisk)
- **FieldHint** — Helper text in muted color (text-xs text-muted-foreground)
- **FieldError** — Error message with role="alert" (text-destructive)
- **FieldSuccess** — Success message with role="status" (text-green)
- **FieldStateIndicator** — Visual icon for validation state

### Level 2: Convenience Component
For simple cases, **FormInput** combines all pieces:

```tsx
<FormInput
  label="Email"
  placeholder="you@example.com"
  type="email"
  hint="We'll never share your email"
  error={error?.message}
  success={isValid ? "Email is valid" : undefined}
  required
  compact={false}
/>
```

### Level 3: Group Components
For organizing related fields:

- **FieldGroup** — Container with space-y-4 (or space-y-3 compact)
- **FieldSection** — Semantic fieldset with legend and description

## Usage Patterns

### Pattern 1: Simple Form Field with FormInput
```tsx
import { FormInput } from "@/components/ui"

<FormInput
  label="Username"
  placeholder="user.name"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  required
/>
```

### Pattern 2: Complex Form with React Hook Form
```tsx
import { Form, FormField, FormControl, FormLabel, FormMessage, FormItem } from "@/components/ui/form"
import { InputContainer, FieldHint, FieldError } from "@/components/ui"
import { useForm } from "react-hook-form"

const { form } = useForm()

<Form {...form}>
  <FormField
    control={form.control}
    name="email"
    render={({ field, fieldState }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <InputContainer>
          <FormControl>
            <Input placeholder="you@example.com" {...field} />
          </FormControl>
          {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
          {!fieldState.error && <FieldHint>We'll never share your email</FieldHint>}
        </InputContainer>
      </FormItem>
    )}
  />
</Form>
```

### Pattern 3: Grouped Fields
```tsx
<FieldGroup variant="default">
  <FormInput label="First Name" placeholder="John" required />
  <FormInput label="Last Name" placeholder="Doe" required />
</FieldGroup>
```

### Pattern 4: Sectioned Form
```tsx
<FieldSection title="Personal Information" description="Your basic details">
  <FieldGroup>
    <FormInput label="First Name" placeholder="John" required />
    <FormInput label="Last Name" placeholder="Doe" required />
  </FieldGroup>
</FieldSection>

<FieldSection title="Contact Information">
  <FieldGroup>
    <FormInput label="Email" type="email" placeholder="you@example.com" required />
    <FormInput label="Phone" type="tel" placeholder="(11) 98765-4321" />
  </FieldGroup>
</FieldSection>
```

## When to Use Each Component

| Use Case | Component |
|----------|-----------|
| Simple, standalone form field | **FormInput** |
| Field with custom components | **InputContainer + individual components** |
| React Hook Form integration | **Form + FormField + FormControl + FieldLabel** |
| Group related fields | **FieldGroup** |
| Organize large form into sections | **FieldSection** |
| Show validation state visually | **FieldStateIndicator** |

## Accessibility Features

All components include proper accessibility:

- **FieldLabel**: Connects to input via `htmlFor`, required indicator has aria-label
- **FieldError**: Uses `role="alert"` for immediate announcement
- **FieldSuccess**: Uses `role="status"` for success messages
- **FieldStateIndicator**: Marked with `aria-hidden="true"` (visual only)
- **FormInput**: Connects input and description with `aria-describedby`

## Dark Mode

All components automatically support dark mode via CSS variables and Tailwind's `dark:` prefix.

## Spacing Variants

Fields support `variant` prop:
- `"default"` — space-y-2 (8px) between elements
- `"compact"` — space-y-1 (4px) between elements

Use compact for dense forms, default for breathing room.

## State Indicators

Visual indicators for form field validation:
- `"default"` — No indicator shown
- `"error"` — Red X icon
- `"success"` — Green checkmark
- `"loading"` — Animated spinner

```tsx
<FormInput
  label="Username"
  placeholder="user.name"
  stateIndicator="loading"
/>
```

## Form Payload Preservation

These components are **presentation-only** and do not affect form logic or payload:

- Form submission payloads remain unchanged
- Validation logic controlled by React Hook Form or form onSubmit handlers
- Field names and types unchanged
- All backend contracts preserved
