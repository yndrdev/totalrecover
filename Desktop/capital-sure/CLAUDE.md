# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `npm run dev` - Start development server with Turbopack (usually runs on port 3000, or 3006 if 3000 is occupied)
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality

### Key Files to Reference
- `cline.rules` - Comprehensive construction industry development standards
- `src/app/globals.css` - Complete design system with construction-specific variables
- `tailwind.config.js` - Extended Tailwind configuration with construction utilities

## Architecture Overview

**CapitalSure** is a construction management platform built as a "Universal Construction Operating System" using modern Next.js 15 with App Router architecture.

### Core Technology Stack
- **Next.js 15.3.3** with App Router and Turbopack
- **Supabase** for authentication and database (PostgreSQL)
- **Tailwind CSS v4** with construction-optimized design system
- **TypeScript** in strict mode with comprehensive type coverage
- **Radix UI + shadcn/ui** for accessible component primitives
- **Framer Motion** for smooth animations
- **React Hook Form + Zod** for form handling and validation

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Grouped auth routes (login, register, onboarding)
│   ├── dashboard/         # Main application area (projects, team, financials, schedule)
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Marketing landing page
├── components/
│   ├── ui/                # Base shadcn/ui components with construction variants
│   ├── construction/      # Industry-specific components
│   ├── forms/             # Business logic forms
│   ├── layouts/           # Layout components
│   └── navigation/        # Navigation components
├── lib/
│   ├── supabase/          # Database client configuration
│   ├── auth/              # Authentication context and utilities
│   └── utils.ts           # Utility functions with construction focus
└── types/
    └── database.ts        # Supabase-generated type definitions
```

### Design System Architecture

**Construction-Focused Design System:**
- **Mobile-First**: Touch targets minimum 44px (construction glove compatible)
- **16-Column Grid**: Desktop (1537px max) → 12-column tablet → 4-column mobile
- **Industry Colors**: Safety orange, construction green, warning yellow, trust blue
- **High Contrast**: Outdoor-readable with 4.5:1+ contrast ratios
- **Typography**: Inter font with construction-optimized scale

**Key CSS Classes:**
- `.container-construction` - Responsive container with 16-column grid
- `.grid-construction` - Construction-optimized grid layout
- `.construction-card` - Elevated cards with hover effects
- `.touch-target` / `.touch-target-large` - Construction glove-friendly touch areas
- `.text-display`, `.text-headline`, `.text-title` - Construction typography scale

### Authentication Architecture

**Multi-Layer Security:**
- **Supabase Auth** with JWT tokens and Row Level Security (RLS)
- **Next.js Middleware** for server-side route protection (`middleware.ts`)
- **Auth Context** (`lib/auth/context.tsx`) for client-side state management
- **Role-Based Access**: Admin, project manager, contractor, client roles

### State Management Strategy
- **Server State**: React Query (`@tanstack/react-query`) for API data
- **Client State**: Zustand for UI state and user preferences
- **Auth State**: Supabase context with real-time auth changes
- **Form State**: React Hook Form with Zod schema validation

### Database Schema (Supabase)
Core entities with TypeScript interfaces:
- **Profiles**: User management with construction roles
- **Projects**: Central project entity with status tracking
- **Tasks**: Granular work items with dependencies and scheduling
- **Milestones**: Payment triggers and progress checkpoints
- **Progress Reports**: Photo documentation with approval workflows
- **Team Members**: Project-specific role assignments

## Key Development Patterns

### Component Development
1. **Start Mobile-First**: Design for construction workers in the field
2. **Construction Variants**: Use Class Variance Authority for button/component variants
3. **Touch Optimization**: All interactive elements minimum 44px (prefer 56px)
4. **Loading States**: Implement skeleton loading for poor network conditions
5. **Error Boundaries**: Robust error handling for construction site connectivity
6. **Equal Height Cards**: All cards in grid layouts should have equal heights using `h-full` on card components and proper flex/grid container setup for visual consistency

### Styling Approach
- **Tailwind Utilities**: Primary styling method with construction-specific utilities
- **CSS Custom Properties**: Defined in `globals.css` for theme consistency
- **Component Classes**: `.construction-card`, `.btn-construction` for reusable patterns
- **Responsive Design**: Mobile-first with construction worker ergonomics

### Type Safety
- **Database Types**: Auto-generated from Supabase schema
- **Form Validation**: Zod schemas for all user inputs
- **Component Props**: Strict TypeScript with variant typing
- **API Responses**: Typed Supabase queries and mutations

## Construction Industry Optimizations

### Mobile & Field Work
- **PWA Ready**: Service worker foundation for offline capability
- **Photo Documentation**: Optimized camera integration for progress reports
- **Weather Integration**: Scheduling adjustments based on weather data
- **GPS Location**: Time tracking and location-based documentation

### User Experience
- **Offline-First**: Critical features work without connectivity
- **Voice Input**: Hands-free operation for safety compliance
- **High Contrast**: Outdoor visibility in bright sunlight
- **Safety Focus**: Prominent safety features and emergency controls

### Performance
- **Turbopack**: Fast development builds
- **Image Optimization**: Next.js Image component for construction photos
- **Code Splitting**: App Router automatic optimization
- **Real-Time**: Supabase subscriptions for live project updates

## Important Implementation Notes

### Supabase Configuration
- **Auth Helpers**: `@supabase/auth-helpers-nextjs` for SSR support
- **Client/Server**: Separate client configurations for CSR/SSR
- **Real-Time**: Configured for live collaboration features
- **RLS Policies**: Database-level security for multi-tenant data

### Form Handling Pattern
```typescript
// Standard pattern: React Hook Form + Zod + Supabase
const form = useForm<FormSchema>({
  resolver: zodResolver(formSchema),
  defaultValues: {...}
})
```

### Component Composition
- **Radix Primitives**: Accessible foundation components
- **Slot Pattern**: Flexible composition with `@radix-ui/react-slot`
- **Variant System**: CVA for consistent styling variants
- **Construction Themes**: Industry-specific color and sizing variants

### Error Handling
- **Toast Notifications**: Sonner for user feedback
- **Form Validation**: Real-time validation with Zod
- **Network Errors**: Retry logic for construction site connectivity
- **Fallback States**: Skeleton loading and error boundaries

This architecture provides a solid foundation for construction management software that scales from small residential projects to large commercial developments while maintaining excellent user experience for field workers and project managers.