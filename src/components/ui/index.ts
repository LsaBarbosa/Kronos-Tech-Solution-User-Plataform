/**
 * UI Components Export Index
 * Centralized imports for all UI components
 * Follow Design System patterns for consistency
 */

// Core Components
export { Button, buttonVariants } from "./button"
export { Input } from "./input"
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./card"
export { Badge, badgeVariants } from "./badge"
export { StatusPill, statusPillVariants } from "./status-pill"
export { Label } from "./label"

// Form Layout Components (work with React Hook Form)
export { InputContainer, FieldLabel, FieldHint, FieldError, FieldSuccess, FieldGroup, FieldSection, FieldStateIndicator, type FieldStateIndicatorProps } from "./form-field"
export { FormInput, type FormInputProps } from "./form-input"
export { PasswordInput, type PasswordInputProps } from "./password-input"
export { TextareaInput, type TextareaInputProps } from "./textarea-input"

// Forms
export { Checkbox } from "./checkbox"
export { Switch } from "./switch"
export { Textarea } from "./textarea"
export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator, SelectScrollUpButton, SelectScrollDownButton } from "./select"
export { RadioGroup, RadioGroupItem } from "./radio-group"

// Layout Components
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./accordion"
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs"
export { Separator } from "./separator"
export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "./breadcrumb"

// Dialog Components
export { Dialog, DialogPortal, DialogOverlay, DialogClose, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "./dialog"
export { AlertDialog, AlertDialogPortal, AlertDialogOverlay, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "./alert-dialog"
export { Drawer, DrawerPortal, DrawerOverlay, DrawerTrigger, DrawerClose, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription } from "./drawer"

// Dropdown & Menu
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuGroup, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuRadioGroup } from "./dropdown-menu"
export { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuCheckboxItem, ContextMenuRadioItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuShortcut, ContextMenuGroup, ContextMenuPortal, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuRadioGroup } from "./context-menu"

// Popover & Tooltip
export { Popover, PopoverTrigger, PopoverContent } from "./popover"
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./tooltip"

// Display Components
export { Avatar, AvatarImage, AvatarFallback } from "./avatar"
export { Alert, AlertTitle, AlertDescription } from "./alert"
export { Skeleton } from "./skeleton"
export { Progress } from "./progress"
export { Slider } from "./slider"
export { EmptyState, type EmptyStateProps } from "./empty-state"
export { ErrorState, type ErrorStateProps } from "./error-state"

// Data Display
export { DataTable, type DataTableProps, type DataTableColumn } from "./data-table"
export { TableActions, type TableActionsProps, type TableAction } from "./table-actions"

// Pagination
export { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from "./pagination"

// Other
export { Toggle, toggleVariants } from "./toggle"
export { ToggleGroup, ToggleGroupItem } from "./toggle-group"
export { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./collapsible"
export { Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandLabel, CommandSeparator, CommandShortcut } from "./command"
export { ScrollArea, ScrollBar } from "./scroll-area"
export { HoverCard, HoverCardTrigger, HoverCardContent } from "./hover-card"
export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "./carousel"

/**
 * Component Usage Guide:
 *
 * Primary Components (Most Used):
 * - Button: Use for actions, with variants: primary, secondary, outline, ghost, destructive, link
 * - Card: Use for containers, with CardHeader, CardTitle, CardContent, CardFooter
 * - Input: Use for text inputs, supports error and success states
 * - Badge: Use for labels, with multiple color variants
 * - StatusPill: Use for status indicators (active, pending, error, warning, info, success)
 *
 * Form Components:
 * - Label: Always pair with form inputs
 * - Checkbox, Switch, RadioGroup: For selections
 * - Select: For dropdowns
 * - Textarea: For multi-line text
 *
 * Dialog Components:
 * - Dialog: For modals and popups
 * - AlertDialog: For confirmations
 * - Drawer: For mobile-friendly side panels
 *
 * Accessibility:
 * All components include proper ARIA labels and semantic HTML
 * Use focus-visible classes from component-patterns.ts
 *
 * Dark Mode:
 * All components support dark mode automatically
 * Test with theme toggle before shipping
 */
