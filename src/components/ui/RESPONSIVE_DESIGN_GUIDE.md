# Responsive Design Guide

KRONOS platform uses mobile-first responsive design with Tailwind CSS breakpoints for optimal experience across all devices.

## Breakpoint Strategy

We follow **mobile-first** approach: Start with mobile styles, then add responsive modifiers for larger screens.

### Breakpoints (Tailwind CSS)

| Breakpoint | Size | Use Case | Modifier |
|-----------|------|----------|----------|
| Mobile (default) | < 640px | Phones in portrait | (no prefix) |
| Small (sm) | ≥ 640px | Phones in landscape, small tablets | `sm:` |
| Medium (md) | ≥ 768px | Tablets | `md:` |
| Large (lg) | ≥ 1024px | Desktop | `lg:` |
| Extra Large (xl) | ≥ 1280px | Large desktop | `xl:` |
| 2XL | ≥ 1536px | Ultra-wide | `2xl:` |

## Mobile-First Approach

### Pattern: Base → Enhanced

```tsx
// Mobile first: single column
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Starts as 1 column, becomes 2 at md, 3 at lg */}
</div>

// Text sizing
<h1 className="text-2xl md:text-3xl lg:text-4xl">Título</h1>

// Padding
<div className="p-4 md:p-6 lg:p-8">Conteúdo</div>

// Display
<div className="hidden md:block">Show on medium and up</div>
<div className="md:hidden">Show only on mobile</div>
```

## Responsive Grid Patterns

### Pattern 1: Auto-Grid (Recommended)

```tsx
// Adapts columns based on available space
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {items.map(item => (
    <Card key={item.id}>{item.name}</Card>
  ))}
</div>
```

### Pattern 2: Fluid Columns

```tsx
// Automatically calculates columns based on screen size
<div className="grid auto-cols-max grid-flow-dense gap-4">
  {items.map(item => (
    <div className="w-full sm:w-1/2 md:w-1/3">{item}</div>
  ))}
</div>
```

### Pattern 3: Stack to Horizontal

```tsx
// Vertical on mobile, horizontal on larger screens
<div className="flex flex-col md:flex-row gap-4">
  <div className="w-full md:w-1/3">Sidebar</div>
  <div className="w-full md:w-2/3">Content</div>
</div>
```

## Responsive Typography

### Heading Sizes

```tsx
// Page titles
<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
  Page Title
</h1>

// Section titles
<h2 className="text-xl sm:text-2xl md:text-3xl font-semibold">
  Section Title
</h2>

// Subsection titles
<h3 className="text-lg sm:text-xl font-medium">
  Subsection
</h3>
```

### Body Text

```tsx
// Paragraph
<p className="text-sm md:text-base leading-relaxed">
  Paragraph text
</p>

// Small text
<span className="text-xs sm:text-sm text-muted-foreground">
  Helper text
</span>
```

## Responsive Spacing

### Padding/Margin Pattern

```tsx
// Light padding on mobile, more breathing room on desktop
<div className="p-4 sm:p-6 md:p-8 lg:p-10">
  Content with responsive padding
</div>

// Gap in flex/grid
<div className="flex gap-2 sm:gap-4 md:gap-6">
  Items with responsive gap
</div>
```

### Common Spacing Values

| Mobile | SM | MD | LG | XL |
|--------|----|----|----|----|
| p-3 (12px) | p-4 (16px) | p-6 (24px) | p-8 (32px) | p-10 (40px) |
| gap-2 (8px) | gap-3 (12px) | gap-4 (16px) | gap-6 (24px) | gap-8 (32px) |

## Responsive Navigation

### Mobile Menu Pattern

```tsx
// Hide navigation items on mobile, show menu button instead
<nav className="hidden md:flex items-center gap-8">
  <NavLink href="/dashboard">Dashboard</NavLink>
  <NavLink href="/users">Usuários</NavLink>
</nav>

// Mobile menu (use Sidebar component)
<button className="md:hidden p-2">
  <Menu className="h-6 w-6" />
</button>
```

## Responsive Tables

### Pattern 1: Horizontal Scroll on Mobile

```tsx
<div className="overflow-x-auto">
  <table className="w-full text-sm md:text-base">
    {/* Table content */}
  </table>
</div>
```

### Pattern 2: Card View on Mobile, Table on Desktop

```tsx
// Show cards on mobile, table on larger screens
<div className="md:hidden">
  {/* Card grid for mobile */}
  <div className="grid grid-cols-1 gap-4">
    {data.map(item => (
      <Card key={item.id}>
        <CardContent>
          <p>{item.name}</p>
          <p>{item.email}</p>
        </CardContent>
      </Card>
    ))}
  </div>
</div>

<div className="hidden md:block">
  {/* DataTable for desktop */}
  <DataTable columns={columns} data={data} />
</div>
```

## Responsive Forms

### Pattern: Full-Width to Columns

```tsx
<form className="space-y-4">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <FormInput label="First Name" />
    <FormInput label="Last Name" />
  </div>

  <FormInput label="Email" />

  <FieldGroup variant="default">
    <FormInput label="Address" />
    <FormInput label="City" />
  </FieldGroup>
</form>
```

### Input Sizing

```tsx
// Adjust input height on mobile vs desktop
<Input
  className="h-10 md:h-12 text-base md:text-lg"
  placeholder="Enter text"
/>
```

## Responsive Modals

### Pattern: Full-Screen on Mobile, Center on Desktop

```tsx
<Dialog>
  <DialogContent className="w-full md:w-auto max-h-screen md:max-h-[90vh] rounded-none md:rounded-lg mx-0 md:mx-auto">
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

## Responsive Cards

### Pattern: Stack to Grid

```tsx
// Single column on mobile, multi-column on larger
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => (
    <Card
      key={item.id}
      className="h-full hover:shadow-lg transition-shadow"
    >
      <CardContent>{item.content}</CardContent>
    </Card>
  ))}
</div>
```

## Touch-Friendly Design

### Interactive Elements

```tsx
// Ensure click targets are at least 44x44px (accessibility standard)
<Button className="h-12 px-6 md:h-10 md:px-4">
  Click me
</Button>

// Spacing for touch interaction
<div className="space-y-3 md:space-y-2">
  {/* Items have more spacing on mobile for finger taps */}
</div>
```

### Long Press & Hover

```tsx
// Hover effects only show on medium+ (non-touch)
<div className="cursor-pointer md:hover:bg-muted transition-colors">
  Item (hover on desktop, tap on mobile)
</div>

// Adjust interactive area
<button className="p-3 md:p-2 rounded-lg hover:bg-muted">
  Action
</button>
```

## Responsive Images

### Pattern: Responsive Image Sizing

```tsx
<img
  src="/image.jpg"
  alt="Description"
  className="w-full h-auto object-cover rounded-lg"
/>

// With responsive aspect ratio
<div className="aspect-video w-full bg-muted rounded-lg overflow-hidden">
  <img
    src="/image.jpg"
    alt="Description"
    className="w-full h-full object-cover"
  />
</div>
```

## Responsive Visibility

### Show/Hide Pattern

```tsx
// Hide on mobile, show on desktop
<div className="hidden md:block">
  Desktop only content
</div>

// Show on mobile, hide on desktop
<div className="md:hidden">
  Mobile only content
</div>

// Visible on specific ranges
<div className="hidden sm:block md:hidden">
  Only on small screens
</div>
```

## Container Queries (Modern Alternative)

```tsx
// For component-based responsive design
<div className="@container">
  <div className="@md:grid @md:grid-cols-2">
    {/* Responsive to container width, not viewport */}
  </div>
</div>
```

## Responsive Component Examples

### Responsive Card

```tsx
<Card className="overflow-hidden hover:shadow-lg transition-shadow">
  <CardHeader className="p-4 md:p-6">
    <CardTitle className="text-lg md:text-xl">{title}</CardTitle>
  </CardHeader>
  <CardContent className="p-4 md:p-6">
    {content}
  </CardContent>
</Card>
```

### Responsive Sidebar + Content

```tsx
<div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-4 md:gap-6">
  {/* Sidebar: full-width on mobile, fixed on desktop */}
  <aside className="bg-card rounded-lg p-4">
    {/* Sidebar content */}
  </aside>

  {/* Main content */}
  <main className="space-y-4">
    {/* Content */}
  </main>
</div>
```

### Responsive Toolbar

```tsx
<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
  {/* Stack on mobile, row on desktop */}
  <Button className="flex-1 sm:flex-none">Button 1</Button>
  <Button className="flex-1 sm:flex-none">Button 2</Button>
</div>
```

## Testing Responsive Design

### Viewport Sizes to Test

| Device | Viewport | Breakpoint |
|--------|----------|-----------|
| Mobile (small) | 375x667 | mobile |
| Mobile (large) | 414x896 | mobile |
| Tablet | 768x1024 | md |
| Desktop | 1024x768 | lg |
| Desktop (large) | 1440x900 | xl |

### Testing Approach

1. **Mobile First** — Design and test mobile first
2. **Progressive Enhancement** — Test tablet, then desktop
3. **Touch Testing** — Test with actual touch devices
4. **Orientation** — Test portrait and landscape
5. **Browser DevTools** — Use Chrome/Firefox responsive mode

## Common Mistakes to Avoid

❌ **Too specific breakpoints** — Use standard Tailwind breakpoints
```tsx
// Bad
className="sm:w-[450px] md:w-[650px] lg:w-[900px]"

// Good
className="w-full md:w-1/2 lg:w-2/3"
```

❌ **Overflow issues** — Always plan for max-width containers
```tsx
// Bad
<div className="grid grid-cols-4">

// Good
<div className="max-w-7xl mx-auto px-4">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
```

❌ **Unresponsive images** — Set width constraints
```tsx
// Bad
<img src="/image.jpg" />

// Good
<img src="/image.jpg" className="w-full h-auto" />
```

❌ **Text not scaling** — Use responsive text sizes
```tsx
// Bad
<h1 className="text-4xl">Title</h1>

// Good
<h1 className="text-2xl md:text-3xl lg:text-4xl">Title</h1>
```

## Best Practices

✅ **Start Mobile First** — Build for mobile, enhance for larger screens
✅ **Use Tailwind Breakpoints** — Stick to sm, md, lg, xl
✅ **Test on Real Devices** — DevTools are helpful but limited
✅ **Maintain Min-Width** — Ensure readability on small screens
✅ **Touch-Friendly** — 44x44px minimum for interactive elements
✅ **Consistent Spacing** — Use responsive scale for padding/margin
✅ **Progressive Enhancement** — Don't hide essential content

## Framework Integration

### With Existing Layout

The existing `PageShell`, `Header`, and `Sidebar` components are responsive:

```tsx
<PageShell
  sidebarOpen={sidebarOpen}
  toggleSidebar={handleToggleSidebar}
  mainClassName="pt-16 p-4 md:p-6 lg:p-8"
>
  {/* Content automatically adjusts for sidebar */}
</PageShell>
```

### With Dashboard Layout

Dashboard uses responsive grid for sections:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Auto-responsive card layout */}
</div>
```

## Accessibility + Responsiveness

- ✅ Touch targets ≥ 44x44px on all screen sizes
- ✅ Text remains readable on all sizes
- ✅ Interactive elements remain accessible
- ✅ Focus indicators visible on all sizes
- ✅ Keyboard navigation works on all sizes
