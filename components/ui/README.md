# UI Components

This directory contains reusable UI components built with Radix UI primitives and styled with the DMS custom color palette.

## Color Palette

All components use the following color scheme:

- **Primary Blue** (#0B2F4A) - Focus rings, primary actions
- **Secondary Blue** (#1F4E6D) - Secondary elements
- **Accent Gold** (#F2B705) - Primary buttons, CTAs
- **Background Light** (#F5F7FA) - Cards, backgrounds
- **Text Primary** (#1A1A1A) - Headings
- **Text Secondary** (#6B7280) - Body text

## Components

### Button (`button.tsx`)
Button component with multiple variants using class-variance-authority:
- `primary` - Accent gold background (default)
- `secondary` - Secondary blue background
- `outline` - Outlined with primary blue
- `ghost` - Transparent with hover effect
- `link` - Text link style

Sizes: `default`, `sm`, `lg`, `icon`

```tsx
import { Button } from '@/components/ui/button';

<Button variant="primary">Click me</Button>
<Button variant="secondary" size="lg">Secondary</Button>
```

### Input (`input.tsx`)
Text input with primary blue focus ring.

```tsx
import { Input } from '@/components/ui/input';

<Input type="email" placeholder="Enter email" />
```

### Label (`label.tsx`)
Form label component using Radix Label.

```tsx
import { Label } from '@/components/ui/label';

<Label htmlFor="email">Email</Label>
```

### Card (`card.tsx`)
Card component with background-light styling. Includes sub-components:
- `CardHeader` - Header section
- `CardTitle` - Title text
- `CardDescription` - Description text
- `CardContent` - Main content area
- `CardFooter` - Footer section

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>Content goes here</CardContent>
</Card>
```

### Dialog (`dialog.tsx`)
Modal dialog using Radix Dialog. Includes:
- `Dialog` - Root component
- `DialogTrigger` - Trigger button
- `DialogContent` - Dialog content
- `DialogHeader` - Header section
- `DialogTitle` - Title text
- `DialogDescription` - Description text
- `DialogFooter` - Footer section

```tsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

### DropdownMenu (`dropdown-menu.tsx`)
Dropdown menu using Radix Dropdown Menu. Includes many sub-components for building complex menus.

```tsx
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Item 1</DropdownMenuItem>
    <DropdownMenuItem>Item 2</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Select (`select.tsx`)
Select dropdown using Radix Select.

```tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
    <SelectItem value="2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### Separator (`separator.tsx`)
Visual separator using Radix Separator.

```tsx
import { Separator } from '@/components/ui/separator';

<Separator />
<Separator orientation="vertical" />
```

### Toast (`toast.tsx`)
Toast notifications using Sonner.

```tsx
import { Toaster, toast } from '@/components/ui/toast';

// Add to your app layout
<Toaster />

// Use in components
toast.success('Success message');
toast.error('Error message');
```

## Usage

All components can be imported individually or from the index file:

```tsx
// Individual imports
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Or from index
import { Button, Input, Card } from '@/components/ui';
```

## TypeScript

All components are fully typed with TypeScript and include proper prop types.
