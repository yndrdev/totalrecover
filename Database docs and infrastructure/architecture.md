# Technical Architecture - TJV Smart Recovery App

## Application Architecture Overview

The TJV Smart Recovery App follows a modern, multi-tenant SaaS architecture designed for scalability, security, and optimal user experience. The system is built with a mobile-first, conversational interface approach inspired by modern AI chat applications while maintaining healthcare-specific requirements.

```
┌─────────────────────────────────────────────────────────────────┐
│                    Multi-Tenant SaaS Platform                  │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Frontend      │   Backend       │   External Services         │
│   (Next.js)     │   (Supabase)    │   (AI & Integrations)      │
│                 │                 │                             │
│ ┌─────────────┐ │ ┌─────────────┐ │ ┌─────────────────────────┐ │
│ │ Web App     │ │ │ Database    │ │ │ OpenAI (GPT-4, Whisper) │ │
│ │ (React)     │◄┼►│ PostgreSQL  │◄┼►│ Anthropic (Claude)      │ │
│ │             │ │ │             │ │ │ Persona IQ Smart Knee   │ │
│ ├─────────────┤ │ ├─────────────┤ │ ├─────────────────────────┤ │
│ │ Mobile App  │ │ │ Auth        │ │ │ Video Streaming CDN     │ │
│ │ (React      │ │ │ Supabase    │ │ │ File Storage            │ │
│ │ Native)     │ │ │ Auth        │ │ │ Analytics Platform      │ │
│ └─────────────┘ │ └─────────────┘ │ └─────────────────────────┘ │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

## Design System and UI Standards

### Brand Colors and Theme
```css
/* Primary Brand Colors */
--primary-navy: #002238      /* Primary brand color - headers, CTAs */
--primary-blue: #006DB1      /* Secondary brand color - links, accents */
--light-blue: #C8DBE9        /* Background tints, subtle elements */
--white: #FFFFFF             /* Background, cards, text on dark */

/* Extended Palette for UI */
--navy-50: #f0f4f7
--navy-100: #d9e6ed
--navy-200: #b8d0de
--navy-500: #002238
--navy-600: #001d2f
--navy-700: #001826
--navy-800: #00131d
--navy-900: #000e14

--blue-50: #e6f3ff
--blue-100: #b3d9ff
--blue-200: #80bfff
--blue-500: #006DB1
--blue-600: #005a94
--blue-700: #004777
--blue-800: #00345a
--blue-900: #00213d
```

### UI Framework Integration
- **Base Framework**: shadcn/ui components with Tailwind CSS
- **Dashboard Kit**: shadcnuikit.com/dashboard for provider interfaces
- **Design Inspiration**: UI8.net healthcare and modern chat UI kits
- **Modern Aesthetic**: NeuraTalk-inspired clean, conversational design

### Typography Scale
```css
/* Healthcare-optimized typography for 40+ demographic */
--font-family-primary: 'Inter', system-ui, sans-serif
--font-family-mono: 'JetBrains Mono', monospace

/* Font Sizes - Larger for accessibility */
--text-xs: 0.75rem    /* 12px */
--text-sm: 0.875rem   /* 14px */
--text-base: 1rem     /* 16px - minimum for body text */
--text-lg: 1.125rem   /* 18px - preferred body text */
--text-xl: 1.25rem    /* 20px */
--text-2xl: 1.5rem    /* 24px */
--text-3xl: 1.875rem  /* 30px */
--text-4xl: 2.25rem   /* 36px */

/* Line Heights - Optimized for readability */
--leading-relaxed: 1.625
--leading-loose: 2
```

## Frontend Architecture

### Next.js Application Structure
```
src/
├── app/                           # App Router (Next.js 14+)
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (dashboard)/              # Provider dashboard routes
│   │   ├── patients/
│   │   ├── analytics/
│   │   ├── settings/
│   │   └── team/
│   ├── (patient)/                # Patient-facing routes
│   │   ├── chat/                 # Main chat interface
│   │   ├── progress/             # Progress tracking
│   │   └── profile/
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── patients/
│   │   ├── tasks/
│   │   ├── ai/
│   │   └── voice/
│   ├── globals.css               # Global styles with CSS variables
│   ├── layout.tsx                # Root layout with theme provider
│   └── page.tsx                  # Landing page
├── components/                    # Reusable components
│   ├── ui/                       # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── chat-bubble.tsx       # Custom chat component
│   │   └── voice-recorder.tsx    # Voice input component
│   ├── chat/                     # Chat-specific components
│   │   ├── chat-interface.tsx
│   │   ├── message-list.tsx
│   │   ├── task-cards.tsx
│   │   └── progress-indicator.tsx
│   ├── forms/                    # Form components
│   │   ├── medical-questionnaire.tsx
│   │   ├── consent-form.tsx
│   │   └── task-builder.tsx
│   ├── dashboard/                # Provider dashboard components
│   │   ├── patient-list.tsx
│   │   ├── patient-detail.tsx
│   │   ├── analytics-charts.tsx
│   │   └── team-management.tsx
│   └── layout/                   # Layout components
│       ├── header.tsx
│       ├── sidebar.tsx
│       ├── mobile-nav.tsx
│       └── tenant-switcher.tsx
├── lib/                          # Utilities and configurations
│   ├── supabase/                 # Supabase client setup
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── ai/                       # AI service integrations
│   │   ├── openai.ts
│   │   ├── anthropic.ts
│   │   └── voice-processor.ts
│   ├── utils/                    # Helper functions
│   │   ├── cn.ts                 # Class name utility
│   │   ├── date.ts               # Date formatting
│   │   ├── medical.ts            # Medical calculations
│   │   └── tenant.ts             # Multi-tenant utilities
│   ├── validations/              # Zod schemas
│   │   ├── auth.ts
│   │   ├── patient.ts
│   │   ├── task.ts
│   │   └── medical-forms.ts
│   └── constants/                # Application constants
│       ├── medical-data.ts
│       ├── exercise-protocols.ts
│       └── recovery-phases.ts
├── hooks/                        # Custom React hooks
│   ├── use-chat.ts              # Chat functionality
│   ├── use-voice.ts             # Voice recording/processing
│   ├── use-tenant.ts            # Multi-tenant context
│   ├── use-patient-data.ts      # Patient data management
│   └── use-ai-response.ts       # AI response handling
├── types/                        # TypeScript type definitions
│   ├── database.ts              # Supabase generated types
│   ├── patient.ts               # Patient-related types
│   ├── medical.ts               # Medical data types
│   ├── chat.ts                  # Chat interface types
│   └── tenant.ts                # Multi-tenant types
└── styles/                       # CSS files
    ├── globals.css              # Global styles with design system
    ├── components.css           # Component-specific styles
    └── chat.css                 # Chat interface styles
```

### React Native Mobile Structure
```
mobile/
├── src/
│   ├── screens/                  # Screen components
│   │   ├── auth/
│   │   ├── chat/
│   │   ├── progress/
│   │   └── profile/
│   ├── components/               # Shared components
│   │   ├── ui/                   # Base UI components
│   │   ├── chat/                 # Chat components
│   │   └── forms/                # Form components
│   ├── navigation/               # Navigation setup
│   ├── services/                 # API and external services
│   ├── hooks/                    # Custom hooks
│   ├── utils/                    # Utility functions
│   └── types/                    # TypeScript types
├── assets/                       # Images, fonts, etc.
└── app.json                      # Expo configuration
```

## Backend Architecture (Supabase)

### Database Schema Overview
```sql
-- Multi-tenant structure with Row Level Security
CREATE SCHEMA IF NOT EXISTS public;

-- Core tenant management
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles with tenant association
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('saas_owner', 'practice_admin', 'surgeon', 'nurse', 'physical_therapist', 'patient')),
  avatar_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patient-specific data
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  surgery_type TEXT NOT NULL CHECK (surgery_type IN ('TKA', 'THA')),
  surgery_date DATE,
  activity_level TEXT CHECK (activity_level IN ('active', 'sedentary')),
  assigned_surgeon UUID REFERENCES profiles(id),
  assigned_nurse UUID REFERENCES profiles(id),
  assigned_pt UUID REFERENCES profiles(id),
  recovery_phase INTEGER DEFAULT 0,
  current_day INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Real-time Features
- **Chat Messages**: Real-time message delivery using Supabase Realtime
- **Task Updates**: Live task completion status updates
- **Provider Notifications**: Instant alerts for patient issues
- **Progress Tracking**: Real-time progress indicator updates

### Authentication and Authorization
```typescript
// Multi-tenant authentication flow
interface AuthContext {
  user: User | null;
  tenant: Tenant | null;
  role: UserRole;
  permissions: Permission[];
}

// Role-based permissions
enum UserRole {
  SAAS_OWNER = 'saas_owner',
  PRACTICE_ADMIN = 'practice_admin',
  SURGEON = 'surgeon',
  NURSE = 'nurse',
  PHYSICAL_THERAPIST = 'physical_therapist',
  PATIENT = 'patient'
}
```

## AI Integration Architecture

### Multi-Model AI Strategy
```typescript
interface AIService {
  provider: 'openai' | 'anthropic';
  model: string;
  useCase: 'conversation' | 'analysis' | 'voice' | 'training';
}

// AI service routing based on task type
const aiServiceMap = {
  patientConversation: { provider: 'openai', model: 'gpt-4' },
  medicalAnalysis: { provider: 'anthropic', model: 'claude-3' },
  voiceTranscription: { provider: 'openai', model: 'whisper-1' },
  contentGeneration: { provider: 'openai', model: 'gpt-4' }
};
```

### Voice Integration with OpenAI Whisper
```typescript
interface VoiceProcessor {
  recordAudio(): Promise<AudioBlob>;
  transcribeAudio(audio: AudioBlob): Promise<string>;
  processResponse(text: string): Promise<AIResponse>;
  handleError(error: Error): void;
}

// Voice processing pipeline
const voiceFlow = {
  1: 'Audio Recording (Web Audio API)',
  2: 'Audio Processing (Format conversion)',
  3: 'Whisper API Transcription',
  4: 'Text Processing (GPT-4)',
  5: 'Response Generation',
  6: 'UI Update with Results'
};
```

## Chat Interface Architecture

### Conversational UI Design Pattern
```typescript
interface ChatMessage {
  id: string;
  type: 'system' | 'user' | 'ai' | 'task';
  content: string;
  metadata?: {
    taskId?: string;
    options?: ChatOption[];
    progress?: number;
    attachments?: Attachment[];
  };
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
}

interface ChatOption {
  id: string;
  text: string;
  value: any;
  icon?: string;
  selected?: boolean;
}
```

### Task-Based Chat Flow
```
Patient Chat Flow:
┌─────────────────────────────────────────────────────────────┐
│ 1. Daily Task Presentation                                  │
│    ├── Pre-loaded conversation thread                       │
│    ├── Task cards with visual indicators                    │
│    └── Progress tracking                                     │
├─────────────────────────────────────────────────────────────┤
│ 2. Interactive Task Completion                              │
│    ├── Multiple choice selections                           │
│    ├── Voice input options                                  │
│    ├── Photo/video uploads                                  │
│    └── Text input for details                               │
├─────────────────────────────────────────────────────────────┤
│ 3. AI Response and Guidance                                 │
│    ├── Contextual feedback                                  │
│    ├── Encouragement and motivation                         │
│    ├── Next steps guidance                                  │
│    └── Provider escalation if needed                        │
├─────────────────────────────────────────────────────────────┤
│ 4. Progress Celebration                                     │
│    ├── Visual progress indicators                           │
│    ├── Milestone achievements                               │
│    ├── Motivational messages                                │
│    └── Next day preview                                     │
└─────────────────────────────────────────────────────────────┘
```

## Multi-Tenant Data Architecture

### Tenant Isolation Strategy
```sql
-- Row Level Security policies for tenant isolation
CREATE POLICY "Tenant isolation for patients" ON patients
  FOR ALL USING (tenant_id = current_setting('app.current_tenant')::UUID);

CREATE POLICY "Tenant isolation for tasks" ON tasks
  FOR ALL USING (tenant_id = current_setting('app.current_tenant')::UUID);

-- Tenant context middleware
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_uuid UUID)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_tenant', tenant_uuid::text, true);
END;
$$ LANGUAGE plpgsql;
```

### Subdomain Routing
```typescript
// Tenant resolution from subdomain
interface TenantResolver {
  extractTenantFromDomain(domain: string): string;
  validateTenant(subdomain: string): Promise<Tenant>;
  setTenantContext(tenant: Tenant): void;
}

// Example: practice1.tjvrecovery.com -> practice1
const tenantMiddleware = async (req: Request) => {
  const subdomain = extractSubdomain(req.headers.host);
  const tenant = await validateTenant(subdomain);
  setTenantContext(tenant);
};
```

## Performance and Scalability

### Caching Strategy
- **Static Content**: CDN caching for videos and educational materials
- **API Responses**: Redis caching for frequently accessed data
- **AI Responses**: Intelligent caching of common AI responses
- **Database Queries**: Query result caching with invalidation

### Mobile Optimization
- **Offline Support**: Critical functionality available offline
- **Progressive Loading**: Lazy loading of non-critical content
- **Image Optimization**: WebP format with fallbacks
- **Bundle Splitting**: Code splitting for faster initial loads

### Monitoring and Analytics
```typescript
interface AnalyticsEvent {
  event: string;
  userId?: string;
  tenantId: string;
  properties: Record<string, any>;
  timestamp: Date;
}

// Key metrics tracking
const trackingEvents = {
  taskCompletion: 'task_completed',
  voiceUsage: 'voice_feature_used',
  aiInteraction: 'ai_response_generated',
  progressMilestone: 'milestone_achieved',
  providerAlert: 'provider_alert_triggered'
};
```

## Security Architecture

### HIPAA Compliance Framework
- **Data Encryption**: AES-256 encryption at rest and in transit
- **Access Logging**: Comprehensive audit trails for all data access
- **User Authentication**: Multi-factor authentication with biometric options
- **Data Minimization**: Collect only necessary medical information
- **Anonymization**: AI training data anonymized and de-identified

### API Security
```typescript
// API security middleware stack
const securityMiddleware = [
  rateLimiting,           // Prevent abuse
  tenantValidation,       // Ensure tenant context
  authentication,        // Verify user identity
  authorization,         // Check permissions
  inputValidation,       // Sanitize inputs
  auditLogging          // Log all actions
];
```

## Integration Architecture

### Smart Device Integration (Persona IQ)
```typescript
interface SmartDeviceConnector {
  connectDevice(deviceId: string): Promise<Connection>;
  syncData(): Promise<DeviceData>;
  processMetrics(data: DeviceData): Promise<HealthMetrics>;
  alertOnAnomalies(metrics: HealthMetrics): void;
}
```

### External API Integrations
- **Electronic Health Records**: HL7 FHIR compatibility
- **Video Streaming**: Optimized delivery for exercise content
- **Communication Services**: SMS and email notifications
- **Analytics Platforms**: Healthcare outcome tracking

This architecture provides a solid foundation for building a modern, scalable, and secure healthcare application that meets both technical requirements and regulatory compliance needs while delivering an exceptional user experience across all platforms.

