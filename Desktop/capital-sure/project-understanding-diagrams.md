# CapitalSure - Project Understanding & System Design

**Universal Construction Operating System - Visual Architecture & User Experience Design**

---

## 1. System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web App<br/>Next.js 14 + App Router]
        MOBILE[Mobile App<br/>React Native + Expo]
        PWA[Progressive Web App<br/>Offline Capable]
    end

    subgraph "API Gateway"
        NEXTAPI[Next.js API Routes]
        SERVERACTIONS[Server Actions]
    end

    subgraph "Backend Infrastructure - Supabase"
        AUTH[Authentication<br/>Multi-factor + SSO]
        DB[(PostgreSQL<br/>with RLS)]
        REALTIME[Real-time Engine<br/>WebSocket]
        STORAGE[File Storage<br/>Documents + Photos]
        FUNCTIONS[Edge Functions<br/>Business Logic]
    end

    subgraph "External Integrations"
        ACCOUNTING[Accounting Systems<br/>QuickBooks, Sage]
        PAYMENT[Payment Processing<br/>Stripe, ACH]
        WEATHER[Weather Services<br/>Schedule Impact]
        COMMS[Communication<br/>Teams, Slack]
    end

    subgraph "Deployment & Monitoring"
        VERCEL[Vercel<br/>Web Deployment]
        EAS[Expo Application Services<br/>Mobile Deployment]
        CDN[Global CDN<br/>Asset Delivery]
        MONITORING[Performance Monitoring<br/>Real User Metrics]
    end

    WEB --> NEXTAPI
    MOBILE --> NEXTAPI
    PWA --> SERVERACTIONS

    NEXTAPI --> AUTH
    NEXTAPI --> DB
    NEXTAPI --> REALTIME
    NEXTAPI --> STORAGE
    NEXTAPI --> FUNCTIONS

    FUNCTIONS --> ACCOUNTING
    FUNCTIONS --> PAYMENT
    FUNCTIONS --> WEATHER
    FUNCTIONS --> COMMS

    WEB --> VERCEL
    MOBILE --> EAS
    STORAGE --> CDN

    classDef frontend fill:#e1f5fe
    classDef backend fill:#f3e5f5
    classDef external fill:#fff3e0
    classDef deploy fill:#e8f5e8

    class WEB,MOBILE,PWA frontend
    class AUTH,DB,REALTIME,STORAGE,FUNCTIONS backend
    class ACCOUNTING,PAYMENT,WEATHER,COMMS external
    class VERCEL,EAS,CDN,MONITORING deploy
```

## 2. User Personas & Primary Workflows

```mermaid
graph TD
    subgraph "Construction Stakeholders"
        OWNER[👨‍💼 Owner/Developer/Lender<br/>Financial Oversight<br/>Risk Mitigation]
        GC[👷‍♂️ General Contractor<br/>Project Management<br/>Coordination]
        SUPER[🏗️ Site Superintendent<br/>Daily Operations<br/>Field Management]
        SUB[🔧 Subcontractor<br/>Specialized Work<br/>Payment Tracking]
        LENDER[🏦 Lender/Surety<br/>Compliance<br/>Verification]
    end

    subgraph "Core Workflows"
        OWNER --> DASHBOARD1[Executive Dashboard<br/>Project Health<br/>Financial Reports]
        OWNER --> MILESTONE[Milestone Approval<br/>Payment Release<br/>Risk Assessment]

        GC --> SCHEDULE[Schedule Management<br/>Resource Planning<br/>Coordination]
        GC --> BUDGET[Budget Control<br/>Change Orders<br/>Cost Tracking]

        SUPER --> DAILY[Daily Reporting<br/>Progress Photos<br/>Issue Tracking]
        SUPER --> QUALITY[Quality Control<br/>Safety Inspections<br/>Compliance]

        SUB --> BOOKING[Job Booking<br/>Schedule Coordination<br/>Resource Planning]
        SUB --> INVOICE[Progress Billing<br/>Payment Status<br/>Documentation]

        LENDER --> VERIFY[Progress Verification<br/>Compliance Check<br/>Risk Monitoring]
        LENDER --> AUDIT[Audit Reports<br/>Financial Review<br/>Milestone Validation]
    end

    classDef persona fill:#e3f2fd
    classDef workflow fill:#fff3e0

    class OWNER,GC,SUPER,SUB,LENDER persona
    class DASHBOARD1,MILESTONE,SCHEDULE,BUDGET,DAILY,QUALITY,BOOKING,INVOICE,VERIFY,AUDIT workflow
```

## 3. Database Schema & Core Relationships

```mermaid
erDiagram
    Companies ||--o{ Projects : owns
    Companies ||--o{ Users : employs
    Projects ||--o{ Tasks : contains
    Projects ||--o{ Budgets : has
    Projects ||--o{ Documents : stores
    Projects ||--o{ Communications : tracks
    Projects }o--o{ Users : assigned_to
    Tasks ||--o{ TaskDependencies : has
    Tasks ||--o{ ProgressUpdates : receives
    Tasks ||--o{ Photos : documented_by
    Users ||--o{ TimeEntries : logs
    Users ||--o{ Messages : sends
    Budgets ||--o{ Expenses : tracks
    Budgets ||--o{ ChangeOrders : modified_by

    Companies {
        uuid id PK
        string name
        string type
        jsonb settings
        timestamp created_at
        timestamp updated_at
    }

    Projects {
        uuid id PK
        uuid company_id FK
        string name
        enum type "residential|commercial"
        decimal budget
        date start_date
        date estimated_end_date
        jsonb address
        enum status "planning|active|on_hold|completed"
        timestamp created_at
        timestamp updated_at
    }

    Users {
        uuid id PK
        uuid company_id FK
        string email
        string full_name
        enum role "owner|project_manager|superintendent|subcontractor|admin"
        jsonb permissions
        timestamp created_at
        timestamp updated_at
    }

    Tasks {
        uuid id PK
        uuid project_id FK
        uuid assigned_to FK
        string name
        text description
        enum status "pending|in_progress|review|completed|blocked"
        enum priority "low|medium|high|critical"
        date start_date
        date due_date
        decimal estimated_hours
        decimal actual_hours
        jsonb metadata
        timestamp created_at
        timestamp updated_at
    }

    Budgets {
        uuid id PK
        uuid project_id FK
        string category
        decimal allocated_amount
        decimal spent_amount
        decimal committed_amount
        timestamp created_at
        timestamp updated_at
    }

    Communications {
        uuid id PK
        uuid project_id FK
        uuid sender_id FK
        enum type "message|announcement|alert|update"
        string subject
        text content
        jsonb attachments
        timestamp created_at
    }
```

## 4. Feature Hierarchy & Navigation Structure

```mermaid
graph TD
    ROOT[CapitalSure Dashboard]

    subgraph "Project Management"
        PROJECTS[Projects Overview]
        PROJECTS --> PDETAIL[Project Details]
        PROJECTS --> PCREATE[Create Project]
        PDETAIL --> PTASKS[Task Management]
        PDETAIL --> PSCHEDULE[Schedule Board]
        PDETAIL --> PBUDGET[Budget Tracking]
        PDETAIL --> PTEAM[Team Management]
    end

    subgraph "Field Operations"
        FIELD[Field Dashboard]
        FIELD --> DAILY[Daily Reports]
        FIELD --> PHOTOS[Progress Photos]
        FIELD --> QUALITY[Quality Control]
        FIELD --> SAFETY[Safety Logs]
        FIELD --> TIME[Time Tracking]
    end

    subgraph "Financial Management"
        FINANCE[Financial Dashboard]
        FINANCE --> BUDGETS[Budget Overview]
        FINANCE --> EXPENSES[Expense Tracking]
        FINANCE --> BILLING[Progress Billing]
        FINANCE --> PAYMENTS[Payment Status]
        FINANCE --> REPORTS[Financial Reports]
    end

    subgraph "Communication Hub"
        COMM[Communication Center]
        COMM --> MESSAGES[Project Messages]
        COMM --> ANNOUNCEMENTS[Announcements]
        COMM --> NOTIFICATIONS[Notifications]
        COMM --> DOCUMENTS[Document Sharing]
    end

    subgraph "Analytics & Reporting"
        ANALYTICS[Analytics Dashboard]
        ANALYTICS --> PERFORMANCE[Project Performance]
        ANALYTICS --> SCHEDULEHEALTH[Schedule Health]
        ANALYTICS --> COSTANALYSIS[Cost Analysis]
        ANALYTICS --> PRODUCTIVITY[Productivity Metrics]
    end

    ROOT --> PROJECTS
    ROOT --> FIELD
    ROOT --> FINANCE
    ROOT --> COMM
    ROOT --> ANALYTICS

    classDef primary fill:#1976d2,color:#fff
    classDef secondary fill:#42a5f5,color:#fff
    classDef tertiary fill:#90caf9,color:#000

    class ROOT primary
    class PROJECTS,FIELD,FINANCE,COMM,ANALYTICS secondary
    class PDETAIL,PCREATE,PTASKS,PSCHEDULE,PBUDGET,PTEAM,DAILY,PHOTOS,QUALITY,SAFETY,TIME,BUDGETS,EXPENSES,BILLING,PAYMENTS,REPORTS,MESSAGES,ANNOUNCEMENTS,NOTIFICATIONS,DOCUMENTS,PERFORMANCE,SCHEDULEHEALTH,COSTANALYSIS,PRODUCTIVITY tertiary
```

## 5. Technology Stack & Implementation Layers

```mermaid
graph TB
    subgraph "Presentation Layer"
        UI[shadcn/ui Components<br/>Radix UI Primitives<br/>Tailwind CSS]
        RESPONSIVE[Responsive Design<br/>Mobile-First<br/>Touch Optimized]
    end

    subgraph "Application Layer"
        NEXTJS[Next.js 14<br/>App Router<br/>Server Components]
        REACTNATIVE[React Native<br/>Expo Router<br/>Native Features]
        TYPESCRIPT[TypeScript<br/>Strict Mode<br/>Type Safety]
    end

    subgraph "State Management"
        ZUSTAND[Zustand<br/>Client State]
        REACTQUERY[React Query<br/>Server State<br/>Caching]
        REALTIME[Real-time Sync<br/>WebSocket<br/>Optimistic Updates]
    end

    subgraph "Business Logic"
        SERVERACTIONS[Server Actions<br/>Form Handling<br/>Mutations]
        VALIDATION[Zod Schemas<br/>Data Validation<br/>Type Inference]
        HOOKS[Custom Hooks<br/>Reusable Logic<br/>Side Effects]
    end

    subgraph "Data Layer"
        SUPABASE[Supabase<br/>PostgreSQL<br/>Row Level Security]
        STORAGE[File Storage<br/>Image Optimization<br/>CDN Delivery]
        AUTH[Authentication<br/>Authorization<br/>Session Management]
    end

    subgraph "Infrastructure"
        VERCEL[Vercel<br/>Edge Functions<br/>Global Deployment]
        PWA[Progressive Web App<br/>Service Worker<br/>Offline Support]
        MONITORING[Performance Monitoring<br/>Error Tracking<br/>Analytics]
    end

    UI --> NEXTJS
    RESPONSIVE --> REACTNATIVE
    NEXTJS --> ZUSTAND
    REACTNATIVE --> REACTQUERY
    ZUSTAND --> SERVERACTIONS
    REACTQUERY --> VALIDATION
    REALTIME --> HOOKS
    SERVERACTIONS --> SUPABASE
    VALIDATION --> STORAGE
    HOOKS --> AUTH
    SUPABASE --> VERCEL
    STORAGE --> PWA
    AUTH --> MONITORING

    classDef frontend fill:#e8f5e8
    classDef logic fill:#fff3e0
    classDef data fill:#f3e5f5
    classDef infra fill:#e1f5fe

    class UI,RESPONSIVE,NEXTJS,REACTNATIVE,TYPESCRIPT frontend
    class ZUSTAND,REACTQUERY,REALTIME,SERVERACTIONS,VALIDATION,HOOKS logic
    class SUPABASE,STORAGE,AUTH data
    class VERCEL,PWA,MONITORING infra
```

## 6. Mobile-First Responsive Design Flow

```mermaid
graph TD
    subgraph "Device Breakpoints"
        MOBILE[📱 Mobile<br/>320px - 767px<br/>Primary Interface]
        TABLET[📱 Tablet<br/>768px - 1023px<br/>Enhanced Features]
        DESKTOP[💻 Desktop<br/>1024px - 1439px<br/>Full Dashboard]
        LARGE[🖥️ Large Screen<br/>1440px+<br/>Multi-panel View]
    end

    subgraph "Mobile Optimizations"
        TOUCH[Large Touch Targets<br/>44px minimum<br/>Glove-friendly]
        OFFLINE[Offline Capability<br/>Local Storage<br/>Sync on Connect]
        GESTURES[Gesture Support<br/>Swipe Navigation<br/>Voice Input]
        BATTERY[Battery Optimization<br/>Efficient Caching<br/>Background Sync]
    end

    subgraph "Progressive Enhancement"
        CORE[Core Functionality<br/>Task Management<br/>Communication]
        ENHANCED[Enhanced Features<br/>Advanced Analytics<br/>Detailed Reports]
        DESKTOP_ONLY[Desktop Features<br/>Multi-window<br/>Keyboard Shortcuts]
    end

    subgraph "Content Strategy"
        PRIORITY[Content Prioritization<br/>Essential First<br/>Progressive Disclosure]
        LAYOUT[Adaptive Layout<br/>Single Column → Grid<br/>Contextual Navigation]
        MEDIA[Responsive Media<br/>Optimized Images<br/>Conditional Loading]
    end

    MOBILE --> TOUCH
    MOBILE --> OFFLINE
    MOBILE --> GESTURES
    MOBILE --> BATTERY

    MOBILE --> CORE
    TABLET --> ENHANCED
    DESKTOP --> DESKTOP_ONLY
    LARGE --> DESKTOP_ONLY

    CORE --> PRIORITY
    ENHANCED --> LAYOUT
    DESKTOP_ONLY --> MEDIA

    classDef device fill:#e3f2fd
    classDef optimization fill:#e8f5e8
    classDef enhancement fill:#fff3e0
    classDef strategy fill:#f3e5f5

    class MOBILE,TABLET,DESKTOP,LARGE device
    class TOUCH,OFFLINE,GESTURES,BATTERY optimization
    class CORE,ENHANCED,DESKTOP_ONLY enhancement
    class PRIORITY,LAYOUT,MEDIA strategy
```

## 7. Real-time Collaboration & Synchronization

```mermaid
sequenceDiagram
    participant Mobile as 📱 Field Worker
    participant Web as 💻 Project Manager
    participant Server as 🏢 Supabase
    participant Push as 🔔 Push Notifications

    Note over Mobile,Push: Real-time Project Updates

    Mobile->>Server: Update task progress
    Server->>Server: Validate & store update
    Server->>Web: Real-time sync via WebSocket
    Server->>Push: Trigger notifications
    Push->>Web: Show progress notification

    Note over Mobile,Push: Offline Scenario

    Mobile->>Mobile: Store update locally (offline)
    Mobile-->>Server: Connection lost
    Mobile->>Mobile: Queue pending actions

    Note over Mobile,Push: Reconnection & Sync

    Mobile->>Server: Reconnect & sync queued actions
    Server->>Server: Process queued updates
    Server->>Web: Sync latest changes
    Web->>Web: Update UI with latest data

    Note over Mobile,Push: Conflict Resolution

    Mobile->>Server: Update task status
    Web->>Server: Simultaneous update (conflict)
    Server->>Server: Detect conflict
    Server->>Mobile: Request conflict resolution
    Server->>Web: Request conflict resolution
    Mobile->>Server: Resolve with user input
    Server->>Web: Apply resolved changes
```

## 8. Security & Permission Model

```mermaid
graph TD
    subgraph "Authentication"
        LOGIN[Multi-factor Authentication<br/>Email + SMS/Authenticator]
        SSO[Single Sign-On<br/>Enterprise Integration]
        SESSION[Session Management<br/>Secure Tokens<br/>Auto-timeout]
    end

    subgraph "Authorization (Row Level Security)"
        COMPANY[Company Isolation<br/>Data Segregation]
        PROJECT[Project-based Access<br/>Team Membership]
        ROLE[Role-based Permissions<br/>Granular Controls]
    end

    subgraph "Data Protection"
        ENCRYPT[End-to-end Encryption<br/>Data at Rest + Transit]
        AUDIT[Comprehensive Audit Logs<br/>Action Tracking]
        BACKUP[Secure Backups<br/>Point-in-time Recovery]
    end

    subgraph "Compliance"
        GDPR[GDPR Compliance<br/>Data Rights]
        SOC[SOC 2 Type II<br/>Security Controls]
        CONSTRUCTION[Construction Standards<br/>Industry Compliance]
    end

    LOGIN --> COMPANY
    SSO --> PROJECT
    SESSION --> ROLE

    COMPANY --> ENCRYPT
    PROJECT --> AUDIT
    ROLE --> BACKUP

    ENCRYPT --> GDPR
    AUDIT --> SOC
    BACKUP --> CONSTRUCTION

    classDef auth fill:#e8f5e8
    classDef authz fill:#fff3e0
    classDef protection fill:#f3e5f5
    classDef compliance fill:#e1f5fe

    class LOGIN,SSO,SESSION auth
    class COMPANY,PROJECT,ROLE authz
    class ENCRYPT,AUDIT,BACKUP protection
    class GDPR,SOC,CONSTRUCTION compliance
```

---

## Key Design Principles

### 🎯 User-Centered Design

- **Mobile-first**: Field workers are the primary users
- **Touch-friendly**: Large targets for gloved hands
- **Offline-capable**: Work continues without connectivity
- **Voice-enabled**: Hands-free operation when needed

### 🏗️ Construction-Specific

- **Hierarchical data**: Projects → Tasks → Subtasks
- **Real-time collaboration**: Multiple stakeholders, instant updates
- **Document-heavy**: Plans, photos, contracts, reports
- **Compliance-focused**: Audit trails, permissions, security

### ⚡ Performance-First

- **Progressive loading**: Critical content first
- **Efficient caching**: Reduce data usage and improve speed
- **Image optimization**: Automatic compression and formats
- **Background sync**: Non-blocking updates

### 🔒 Security-First

- **Row-level security**: Company and project isolation
- **Comprehensive auditing**: Track all actions and changes
- **Encrypted storage**: Protect sensitive project data
- **Role-based access**: Granular permission control

This design ensures CapitalSure delivers a world-class construction management experience that works seamlessly across all devices and environments while maintaining the security and reliability required for professional construction projects.
