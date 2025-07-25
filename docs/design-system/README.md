# TJV Recovery Platform Design System

## Overview
This design system ensures consistency, accessibility, and professional healthcare UX across the entire platform.

## Core Principles

### 1. Healthcare-First Design
- Clean, professional appearance that builds trust
- Clear information hierarchy for medical data
- Calm color palette to reduce anxiety
- Accessibility compliance (WCAG 2.1 AA minimum)

### 2. User-Centric Approach
- Mobile-first responsive design
- Large touch targets (44px minimum)
- Clear visual feedback for all interactions
- Consistent patterns across the platform

### 3. Performance & Scalability
- Optimized component architecture
- Efficient rendering patterns
- Lazy loading for heavy components
- Virtual scrolling for large lists

## Component Library

### Foundation Components
- **Button** - Primary actions with multiple variants
- **Card** - Content containers with status variants
- **Input/Textarea** - Form inputs with validation states
- **StatusIndicator** - Recovery progress and task status

### Layout Components
- **DashboardLayout** - Provider/patient dashboard structure
- **ChatLayout** - Manus-style 280px sidebar chat interface
- **FormLayout** - Consistent form structures

### Healthcare Components
- **RecoveryTimeline** - Visual recovery journey
- **TaskCard** - Exercise, form, and education tasks
- **PatientCard** - Patient information display
- **MetricsDisplay** - Health metrics visualization

## Color System

### Primary Colors
- **Primary Blue** (#2563eb) - Main brand, CTAs
- **Primary Blue Light** (#3b82f6) - Hover states
- **Primary Blue Dark** (#1d4ed8) - Active states

### Secondary Colors
- **Success Green** (#059669) - Positive actions, completed tasks
- **Warning Orange** (#ea580c) - Alerts, attention needed
- **Error Red** (#dc2626) - Critical alerts, failures
- **Info Blue** (#2563eb) - Informational messages

### Recovery Phase Colors
- **Pre-Op** - Orange (#ea580c)
- **Acute** - Red (#dc2626)
- **Early** - Blue (#2563eb)
- **Intermediate** - Purple (#7c3aed)
- **Advanced** - Green (#059669)
- **Long-term** - Dark Green (#047857)

## Typography

### Font Stack
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

### Type Scale
- **xs**: 0.75rem (12px) - Metadata, labels
- **sm**: 0.875rem (14px) - Body small, captions
- **base**: 1rem (16px) - Body text
- **lg**: 1.125rem (18px) - Subheadings
- **xl**: 1.25rem (20px) - Section headers
- **2xl**: 1.5rem (24px) - Page titles
- **3xl**: 1.875rem (30px) - Hero text
- **4xl**: 2.25rem (36px) - Landing headers

### Font Weights
- **Normal** (400) - Body text
- **Medium** (500) - Emphasis
- **Semibold** (600) - Subheadings
- **Bold** (700) - Headers

## Spacing System

Consistent 4px base unit:
- **space-1**: 0.25rem (4px)
- **space-2**: 0.5rem (8px)
- **space-3**: 0.75rem (12px)
- **space-4**: 1rem (16px)
- **space-5**: 1.25rem (20px)
- **space-6**: 1.5rem (24px)
- **space-8**: 2rem (32px)
- **space-10**: 2.5rem (40px)
- **space-12**: 3rem (48px)
- **space-16**: 4rem (64px)

## Responsive Breakpoints

Mobile-first approach:
- **xs**: 320px - Small phones
- **sm**: 480px - Large phones
- **md**: 768px - Tablets
- **lg**: 1024px - Small desktops
- **xl**: 1280px - Large desktops
- **2xl**: 1536px - Extra large screens

## Accessibility Guidelines

### Color Contrast
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: Clear focus states

### Keyboard Navigation
- All interactive elements keyboard accessible
- Logical tab order
- Skip links for main content

### Screen Reader Support
- Semantic HTML structure
- ARIA labels where needed
- Descriptive link text
- Alt text for images

### Touch Targets
- Minimum 44x44px for all clickable elements
- Adequate spacing between targets
- Clear visual boundaries

## Implementation Examples

### Button Usage
```tsx
import { Button } from '@/components/ui/design-system/Button'

// Primary action
<Button variant="primary" size="md">
  Save Protocol
</Button>

// Secondary action
<Button variant="secondary" size="md">
  Cancel
</Button>

// Loading state
<Button variant="primary" loading>
  Saving...
</Button>
```

### Card Usage
```tsx
import { Card, CardHeader, CardContent } from '@/components/ui/design-system/Card'

<Card variant="default">
  <CardHeader 
    title="Patient Information"
    subtitle="Last updated 2 hours ago"
  />
  <CardContent>
    {/* Content here */}
  </CardContent>
</Card>
```

### Status Indicators
```tsx
import { StatusBadge, RecoveryDayBadge } from '@/components/ui/design-system/StatusIndicator'

// Task status
<StatusBadge status="completed" size="md" />

// Recovery phase
<RecoveryDayBadge day={15} size="md" />
```

## Best Practices

### Do's
- ✅ Use semantic color names (primary, success, error)
- ✅ Maintain consistent spacing with the scale
- ✅ Test all interactions on mobile devices
- ✅ Include loading and error states
- ✅ Use the provided animation utilities

### Don'ts
- ❌ Create custom colors outside the palette
- ❌ Use pixel values for spacing
- ❌ Skip focus states on interactive elements
- ❌ Ignore accessibility guidelines
- ❌ Mix different component libraries

## Migration Guide

When updating existing components:

1. Replace hardcoded colors with design system tokens
2. Update spacing to use the consistent scale
3. Ensure all buttons use the Button component
4. Add proper TypeScript types
5. Test accessibility with screen readers
6. Verify mobile responsiveness

## Resources

- [Figma Design Files](#) (Coming soon)
- [Component Storybook](#) (Coming soon)
- [Accessibility Checklist](./accessibility-checklist.md)
- [Brand Guidelines](./brand-guidelines.md)