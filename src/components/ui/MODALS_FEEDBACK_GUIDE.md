# Modals & Feedback Components Guide

Standardized patterns for modals, dialogs, confirmations, toasts, and loading states.

## Components Overview

### Dialog Components (from Radix UI)
- **Dialog**: Custom modal dialogs for complex interactions
- **AlertDialog**: Simple confirmation dialogs (already in system)

### Feedback Components
- **ToastMessage**: Non-blocking notification messages (success, error, warning, info)
- **LoadingSpinner**: Visual feedback for async operations

## Modal Patterns

### Pattern 1: Simple Confirmation Dialog

```tsx
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui"
import { Button } from "@/components/ui"

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete Item</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
      <AlertDialogDescription>
        Esta ação não pode ser desfeita. O item será permanentemente deletado.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
        Deletar
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Pattern 2: Confirmation with Details

```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button>Desativar Colaborador</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Desativar usuário</AlertDialogTitle>
      <AlertDialogDescription>
        <div className="space-y-2">
          <p>Você está prestes a desativar <strong>{employee.name}</strong>.</p>
          <p className="text-sm text-muted-foreground">
            O usuário perderá acesso ao sistema, mas os dados históricos serão preservados.
          </p>
        </div>
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction className="bg-yellow-600 hover:bg-yellow-700">
        Desativar
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Pattern 3: Custom Dialog for Complex Content

```tsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui"

<Dialog>
  <DialogTrigger asChild>
    <Button>Configurações Avançadas</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Configurações Avançadas</DialogTitle>
      <DialogDescription>
        Personalize as configurações do seu sistema
      </DialogDescription>
    </DialogHeader>
    
    <div className="space-y-4">
      {/* Complex form content */}
    </div>
    
    <DialogFooter>
      <Button variant="outline">Cancelar</Button>
      <Button>Salvar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Toast/Notification Patterns

### Pattern 1: Simple Toast Message

```tsx
import { ToastMessage } from "@/components/ui"
import { useState } from "react"

const [showToast, setShowToast] = useState(false)

<>
  <Button onClick={() => setShowToast(true)}>
    Criar Item
  </Button>

  {showToast && (
    <div className="fixed bottom-4 right-4 z-50">
      <ToastMessage
        variant="success"
        title="Sucesso"
        message="Item criado com sucesso!"
        onDismiss={() => setShowToast(false)}
      />
    </div>
  )}
</>
```

### Pattern 2: Toast with Action

```tsx
<ToastMessage
  variant="error"
  title="Erro ao salvar"
  message="Não foi possível salvar as alterações"
  action={
    <Button
      size="sm"
      variant="ghost"
      onClick={() => handleRetry()}
    >
      Tentar Novamente
    </Button>
  }
  onDismiss={() => setShowToast(false)}
/>
```

### Pattern 3: Auto-Closing Toast

```tsx
<ToastMessage
  variant="info"
  message="Operação iniciada"
  autoClose={true}
  duration={3000}
  onDismiss={() => setShowToast(false)}
/>
```

### Pattern 4: Manual Toast Management

```tsx
const [toasts, setToasts] = useState<ToastItem[]>([])

const addToast = (variant: "success" | "error" | "warning" | "info", message: string, title?: string) => {
  const id = Math.random()
  setToasts(prev => [...prev, { id, variant, title, message }])
  
  setTimeout(() => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, 5000)
}

<div className="fixed bottom-4 right-4 z-50 space-y-2">
  {toasts.map(toast => (
    <ToastMessage
      key={toast.id}
      variant={toast.variant}
      title={toast.title}
      message={toast.message}
      onDismiss={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
    />
  ))}
</div>
```

## Loading State Patterns

### Pattern 1: Simple Loading Spinner

```tsx
import { LoadingSpinner } from "@/components/ui"

{isLoading ? (
  <LoadingSpinner size="md" label="Carregando..." />
) : (
  <div>{content}</div>
)}
```

### Pattern 2: Loading State in Button

```tsx
<Button disabled={isSubmitting} className="gap-2">
  {isSubmitting && <LoadingSpinner size="sm" />}
  {isSubmitting ? "Salvando..." : "Salvar"}
</Button>
```

### Pattern 3: Full-Page Loading

```tsx
{isLoading && (
  <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
    <LoadingSpinner size="lg" label="Carregando dados..." />
  </div>
)}
```

### Pattern 4: Skeleton Loading (already have Skeleton component)

```tsx
import { Skeleton } from "@/components/ui"

{isLoading ? (
  <div className="space-y-4">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
  </div>
) : (
  <div>{content}</div>
)}
```

## Complete Examples

### Example 1: Delete with Confirmation + Toast

```tsx
const handleDelete = async (itemId: string) => {
  try {
    setIsDeleting(true)
    await deleteItem(itemId)
    setShowDeleteDialog(false)
    addToast("success", "Item deletado com sucesso")
  } catch (error) {
    addToast("error", "Erro ao deletar item")
  } finally {
    setIsDeleting(false)
  }
}

<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Deletar</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
      <AlertDialogDescription>
        Esta ação não pode ser desfeita.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
      <AlertDialogAction
        disabled={isDeleting}
        className="bg-destructive hover:bg-destructive/90"
        onClick={handleDelete}
      >
        {isDeleting ? "Deletando..." : "Deletar"}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Example 2: Form Submission with Loading + Success

```tsx
const handleSubmit = async (data: FormData) => {
  try {
    setIsSubmitting(true)
    await submitForm(data)
    addToast("success", "Formulário salvo com sucesso!")
    navigate("/success")
  } catch (error) {
    addToast("error", "Erro ao salvar formulário")
  } finally {
    setIsSubmitting(false)
  }
}

<form onSubmit={handleSubmit} className="space-y-4">
  {/* Form fields */}
  
  <Button type="submit" disabled={isSubmitting} className="gap-2">
    {isSubmitting && <LoadingSpinner size="sm" />}
    {isSubmitting ? "Salvando..." : "Salvar"}
  </Button>
</form>
```

### Example 3: Multi-Step Confirmation

```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Ação Crítica</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    {step === 1 && (
      <>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar ação</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação resultará em perda permanente de dados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={() => setStep(2)}>
            Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </>
    )}
    
    {step === 2 && (
      <>
        <AlertDialogHeader>
          <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Digite "CONFIRMAR" para prosseguir
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Input
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          placeholder="CONFIRMAR"
        />
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setStep(1)}>
            Voltar
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={confirmation !== "CONFIRMAR"}
            className="bg-destructive"
            onClick={handleConfirm}
          >
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </>
    )}
  </AlertDialogContent>
</AlertDialog>
```

## Best Practices

### 1. Confirmation Dialogs
- Always show what will happen (specific item, action details)
- Use clear, action-oriented button labels
- Use color coding (red for destructive, yellow for warnings)
- Include undo/recovery information if possible

### 2. Toast Notifications
- Keep messages short and actionable
- Use appropriate variant (success, error, warning, info)
- Set auto-close duration based on importance
- Place consistently (bottom-right recommended)

### 3. Loading States
- Show loading spinner for > 200ms operations
- Disable interaction while loading
- Provide estimated time if available
- Use skeleton loading for large content

### 4. Modal Dialogs
- Keep content focused and concise
- Use for complex interactions only
- Ensure form validation before close
- Provide clear next steps

## Accessibility

- **AlertDialog**: Keyboard navigable, focus management
- **Dialog**: Trap focus, escape to close
- **ToastMessage**: role="alert" for announcements
- **LoadingSpinner**: role="status", sr-only label
- All components: Clear labels and descriptions

## Variants

### ToastMessage Variants
- `default` — Gray background
- `success` — Green background
- `error` — Red background
- `warning` — Yellow background
- `info` — Blue background

### LoadingSpinner Sizes
- `sm` — 24px (for inline usage)
- `md` — 32px (standard)
- `lg` — 48px (full-page)

## Dark Mode

All components fully support dark mode with automatic color adjustment.

## Integration with Existing Toast Hook

The app already has `use-toast` hook. These patterns complement it:
- Use hook-based toasts for top-level notifications
- Use ToastMessage for embedded toast UI
- Combine for flexible toast placement
