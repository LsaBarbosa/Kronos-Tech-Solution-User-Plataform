# Accessibility (A11y) Guide

KRONOS platform is built with accessibility as a core principle, following WCAG 2.1 AA standards.

## WCAG 2.1 Conformance

Target Level: **AA** (standard for web accessibility)

All components follow:
- ✅ Perceivable: Content is perceivable to all users
- ✅ Operable: Keyboard navigable, no mouse-only features
- ✅ Understandable: Clear language, predictable behavior
- ✅ Robust: Works with assistive technologies

---

## Color Contrast

### Requirements (WCAG AA)

- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text** (18px+ or 14px+ bold): Minimum 3:1
- **UI components**: Minimum 3:1 for borders/backgrounds

### Implemented Colors

All color combinations in the system meet or exceed AA standards:

| Element | Colors | Contrast | Status |
|---------|--------|----------|--------|
| Text on background | Foreground on Background | ✅ > 4.5:1 | Verified |
| Text on primary | Primary foreground on primary | ✅ > 4.5:1 | Verified |
| Success text | Green on background | ✅ > 4.5:1 | Verified |
| Error text | Red on background | ✅ > 4.5:1 | Verified |
| Disabled state | Muted on background | ✅ > 3:1 | Verified |
| Links | Blue on background | ✅ > 4.5:1 | Verified |

### Dark Mode

Dark mode maintains all contrast ratios through HSL adjustments.

---

## Semantic HTML

### Proper Element Usage

#### Headings Hierarchy

```tsx
// ✅ Good - Proper hierarchy
<h1>Page Title</h1>
<h2>Section Title</h2>
<h3>Subsection</h3>

// ❌ Bad - Skipped levels
<h1>Page Title</h1>
<h3>Subsection</h3> {/* Skipped h2 */}
```

#### Lists

```tsx
// ✅ Good - Semantic list
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>

// ❌ Bad - div used as list
<div>
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

#### Form Controls

```tsx
// ✅ Good - Associated label
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// ❌ Bad - No association
<label>Email</label>
<input type="email" />
```

---

## ARIA (Accessible Rich Internet Applications)

### Roles

Use when semantic HTML isn't enough:

```tsx
// Buttons
<button>Click me</button> {/* Native HTML is best */}

// Custom buttons
<div role="button" onClick={...} tabIndex={0}>Click me</div>

// Alert dialog
<AlertDialog role="alertdialog">
  <AlertDialogDescription>Are you sure?</AlertDialogDescription>
</AlertDialog>

// Status updates
<div role="status" aria-live="polite">
  Items loaded
</div>

// Alerts
<div role="alert" aria-live="assertive">
  Error occurred
</div>
```

### Aria-Label and Aria-LabelledBy

```tsx
// ✅ When text isn't visible
<button aria-label="Close menu">
  <X className="h-4 w-4" />
</button>

// ✅ When label exists
<div id="dialog-title">Confirm Delete</div>
<div role="alertdialog" aria-labelledby="dialog-title">
  Content...
</div>

// ❌ When label is already visible
<button aria-label="Save">Save</button> {/* Redundant */}
```

### Aria-DescribedBy

```tsx
// Provide additional context
<input
  type="password"
  aria-describedby="pwd-hint"
/>
<p id="pwd-hint">
  Password must be 8+ characters with numbers
</p>
```

### Aria-Live Regions

```tsx
// Polite: Waits for pause in speech
<div role="status" aria-live="polite">
  {notificationCount} new messages
</div>

// Assertive: Interrupts speech
<div role="alert" aria-live="assertive">
  Error: Please fix validation issues
</div>
```

---

## Keyboard Navigation

### Focusable Elements

All interactive elements must be keyboard accessible:

```tsx
// ✅ Native button (focusable by default)
<button>Click me</button>

// ✅ Input (focusable by default)
<input type="text" />

// ✅ Custom button (must be focusable)
<div role="button" tabIndex={0} onClick={...} onKeyDown={...}>
  Click me
</div>

// ❌ Div without role/tabIndex (not focusable)
<div onClick={...}>Don't do this</div>
```

### Tab Order

```tsx
// Default (document order) - usually best
<button>First</button>
<button>Second</button>
<button>Third</button>

// Custom order (rarely needed)
<button tabIndex={1}>Second</button>
<button tabIndex={0}>First</button>

// Remove from tab order
<button tabIndex={-1}>Skip this</button>
```

### Focus Visible

```tsx
// ✅ Show focus ring on keyboard nav, not on click
<button className="focus-visible:ring-2 focus-visible:ring-primary">
  Button
</button>

// ❌ Remove focus ring (accessibility violation)
<button className="outline-none">Don't do this</button>
```

### Keyboard Shortcuts

```tsx
// Document shortcuts
<button title="Save (Ctrl+S)">Save</button>

// Handle shortcuts
function handleKeyDown(e: KeyboardEvent) {
  if (e.ctrlKey && e.key === 's') {
    handleSave()
  }
}
```

---

## Forms Accessibility

### Label Association

```tsx
// ✅ Proper label association
<label htmlFor="email">Email Address</label>
<input
  id="email"
  type="email"
  required
/>

// ✅ With FormInput (does this automatically)
<FormInput
  id="email"
  label="Email Address"
  required
/>
```

### Field Hints and Errors

```tsx
// ✅ With aria-describedby
<input
  type="password"
  id="pwd"
  aria-describedby="pwd-hint pwd-error"
/>
<p id="pwd-hint" className="text-xs">
  At least 8 characters
</p>
<p id="pwd-error" role="alert" className="text-red-600">
  Password too weak
</p>

// ✅ Using FormInput
<FormInput
  label="Password"
  hint="At least 8 characters"
  error={errors.password}
/>
```

### Required Fields

```tsx
// ✅ Both HTML and visual indicator
<label htmlFor="email">
  Email <span aria-label="required">*</span>
</label>
<input id="email" required />

// ✅ Using FormInput
<FormInput label="Email" required />
```

### Disabled State

```tsx
// ✅ Disabled but visible
<input disabled />

// ✅ Explain why disabled
<input
  disabled
  title="Field disabled until form is valid"
/>

// ✅ Use aria-disabled for custom elements
<div role="button" aria-disabled="true" className="opacity-50">
  Disabled button
</div>
```

---

## Images & Media

### Alt Text

```tsx
// ✅ Descriptive alt text
<img src="/logo.png" alt="KRONOS logo" />

// ✅ Functional alt text
<img src="/download-icon.png" alt="Download file" />

// ✅ Decorative image (empty alt)
<img src="/divider.png" alt="" />

// ❌ Missing alt text
<img src="/logo.png" />

// ❌ Redundant alt text
<img src="/download.png" alt="Download" />
<a href="...">Download</a>
```

### Icon-Only Buttons

```tsx
// ✅ Icon with aria-label
<button aria-label="Close menu">
  <X className="h-4 w-4" />
</button>

// ✅ Icon with title
<button title="Save">
  <Save className="h-4 w-4" />
</button>

// ❌ Icon without label
<button>
  <X className="h-4 w-4" />
</button>
```

---

## Lists and Navigation

### Menu Structure

```tsx
// ✅ Semantic nav with list
<nav>
  <ul>
    <li><a href="/dashboard">Dashboard</a></li>
    <li><a href="/users">Users</a></li>
  </ul>
</nav>

// ✅ With aria-current for active
<a href="/dashboard" aria-current="page">
  Dashboard
</a>
```

### Breadcrumbs

```tsx
// ✅ Semantic breadcrumb
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/users">Users</a></li>
    <li aria-current="page">User Profile</li>
  </ol>
</nav>
```

---

## Tables

### Table Structure

```tsx
// ✅ Proper semantic table
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>John</td>
      <td>john@example.com</td>
    </tr>
  </tbody>
</table>

// ✅ With caption
<table>
  <caption>Employee Directory</caption>
  {/* content */}
</table>
```

### Row Headers

```tsx
// ✅ Using th for row headers
<table>
  <tr>
    <th scope="row">John Doe</th>
    <td>john@example.com</td>
  </tr>
</table>
```

---

## Modals & Dialogs

### Alert Dialog

```tsx
// ✅ Proper alert dialog
<AlertDialog>
  <AlertDialogContent role="alertdialog">
    <AlertDialogHeader>
      <AlertDialogTitle id="dialog-title">
        Confirm Delete
      </AlertDialogTitle>
    </AlertDialogHeader>
    <AlertDialogDescription id="dialog-desc">
      This action cannot be undone
    </AlertDialogDescription>
  </AlertDialogContent>
</AlertDialog>
```

### Focus Management

```tsx
// ✅ Focus trap in dialog
// ✅ Return focus to trigger on close
// ✅ Escape key closes dialog
```

---

## Color Usage

### Don't Rely Solely on Color

```tsx
// ✅ Use color + other indicators
<span className="text-green-600 font-bold">✓ Success</span>

// ❌ Color only
<span className="text-green-600">Success</span>
```

### Color Blind Friendly

```tsx
// ✅ Sufficient contrast
.success { color: #065f46; } /* Dark green on white */

// ❌ Low contrast
.success { color: #86efac; } /* Light green on white */
```

---

## Text and Language

### Clear Language

```tsx
// ✅ Clear
Save file to your computer

// ❌ Unclear
Execute persist operation on binary data object
```

### Abbreviations

```tsx
// ✅ First use: expand
<abbr title="HyperText Markup Language">HTML</abbr>

// ✅ Provide pronunciation
<abbr title="Accessibility: a-cess-uh-BIL-uh-tee">a11y</abbr>
```

### Lists

```tsx
// ✅ Use semantic lists
<ul>
  <li>First item</li>
  <li>Second item</li>
</ul>

// ❌ Use div with role
<div role="list">
  <div role="listitem">First</div>
</div>
```

---

## Components Accessibility Checklist

### Button
- ✅ Focusable (tab key)
- ✅ Clickable (enter/space)
- ✅ Focus visible indicator
- ✅ aria-label if icon-only
- ✅ aria-pressed if toggle
- ✅ aria-disabled if disabled

### Input
- ✅ Associated label
- ✅ aria-describedby for hints
- ✅ Proper type attribute
- ✅ Placeholder not used as label
- ✅ Error messaging with role="alert"
- ✅ Success messaging with role="status"

### Form
- ✅ All fields labeled
- ✅ Required fields marked
- ✅ Error messages linked
- ✅ Submit button accessible
- ✅ Form can be submitted with Enter

### Dialog
- ✅ Close button visible
- ✅ Escape key closes
- ✅ Focus trapped
- ✅ Initial focus management
- ✅ Return focus to trigger
- ✅ aria-labelledby/describedby

### Table
- ✅ Proper thead/tbody
- ✅ th for headers
- ✅ scope attribute on th
- ✅ Caption if needed
- ✅ Sortable headers have button role

### Navigation
- ✅ Semantic nav element
- ✅ List structure
- ✅ aria-current for active
- ✅ Keyboard accessible
- ✅ Skip links available

---

## Testing Tools

### Automated Testing

```bash
# WAVE browser extension
# axe DevTools
# Lighthouse (Chrome DevTools)
# WebAIM contrast checker
```

### Manual Testing

1. **Keyboard Only** — Navigate entire site with Tab/Enter only
2. **Screen Reader** — Test with NVDA or JAWS
3. **Color Blind Mode** — Use browser extension
4. **Text Zoom** — Zoom to 200%
5. **High Contrast** — Enable Windows high contrast mode

### Screen Readers

- **NVDA** (Windows, free)
- **JAWS** (Windows, paid)
- **VoiceOver** (macOS/iOS, built-in)
- **TalkBack** (Android, built-in)

---

## Accessibility Testing Checklist

- [ ] All form fields have labels
- [ ] All buttons/links have descriptive text
- [ ] Color contrast meets AA standards
- [ ] All images have alt text
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Heading hierarchy correct
- [ ] ARIA roles used correctly
- [ ] Error messages accessible
- [ ] Dynamic content announced
- [ ] Tables have headers
- [ ] Modals trap focus
- [ ] Escape key closes modals
- [ ] Touch targets 44x44px minimum
- [ ] Form validation accessible

---

## Resources

### WCAG Guidelines
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM](https://webaim.org/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### Tools
- [WAVE](https://wave.webaim.org/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [NVDA Screen Reader](https://www.nvaccess.org/)

### Training
- [A11y Cast by Google Chrome](https://www.youtube.com/playlist?list=PLNYkxOF6rcICWx0C9Xc-RgEu2y6dJeVnV)
- [WebAIM Tutorials](https://webaim.org/articles/)

---

## Best Practices Summary

1. ✅ Use semantic HTML (button, input, nav, etc.)
2. ✅ Every interactive element keyboard accessible
3. ✅ Clear focus indicators
4. ✅ Proper label associations
5. ✅ Sufficient color contrast
6. ✅ Meaningful alt text
7. ✅ Proper heading hierarchy
8. ✅ Error messages accessible
9. ✅ ARIA only when needed
10. ✅ Test with real assistive tech
