# Complete Claude Code Prompts - TJV Recovery App

## Table of Contents
1. [Executive Directive (Use This First)](#executive-directive)
2. [Initial Project Setup](#initial-project-setup)
3. [Environment and Security Setup](#environment-and-security-setup)
4. [UI Foundation and Design System](#ui-foundation-and-design-system)
5. [Database Schema Implementation](#database-schema-implementation)
6. [Authentication and Multi-Tenant Setup](#authentication-and-multi-tenant-setup)
7. [Patient Chat Interface](#patient-chat-interface)
8. [Task/Form Builder System](#taskform-builder-system)
9. [Pre-Surgery Forms and Questionnaires](#pre-surgery-forms-and-questionnaires)
10. [Post-Surgery Recovery System](#post-surgery-recovery-system)
11. [Exercise System with Video Integration](#exercise-system-with-video-integration)
12. [Education System](#education-system)
13. [Daily Tasks and Check-ins](#daily-tasks-and-check-ins)
14. [Practice Dashboard and Provider Tools](#practice-dashboard-and-provider-tools)
15. [Advanced Analytics and Reporting](#advanced-analytics-and-reporting)
16. [Notification and Communication System](#notification-and-communication-system)
17. [Final Integration and Testing](#final-integration-and-testing)
18. [Deployment and Production Setup](#deployment-and-production-setup)
19. [Corrective Prompts](#corrective-prompts)

---

## Executive Directive

**USE THIS FIRST - SETS THE TONE AND EXPECTATIONS**

```
# EXECUTIVE DIRECTIVE - TJV Recovery Platform Implementation

## THIS IS NOT A REQUEST - THESE ARE ORDERS

You are building a production healthcare platform. Deviation from these specifications is **UNACCEPTABLE** and will result in immediate project termination.

---

## MANDATORY DOCUMENTATION COMPLIANCE

**YOU WILL:**
- Read EVERY file in `/Claude_Docs/` folder completely before writing ANY code
- Follow EVERY specification exactly as documented
- Implement EVERY user story with ALL acceptance criteria
- Use ONLY the components and patterns specified in the documentation

**YOU WILL NOT:**
- Research alternative solutions
- Use different UI kits or components
- Make assumptions about requirements
- Implement features not explicitly documented
- Deviate from the specified architecture

---

## PATIENT INTERFACE - NON-NEGOTIABLE REQUIREMENTS

### CHAT INTERFACE SPECIFICATION
**YOU MUST implement the chat interface EXACTLY like:** https://space10-community.github.io/conversational-form/landingpage/

**CRITICAL REQUIREMENTS:**
1. **AI SPEAKS FIRST** - The chat initiates conversation, NOT the patient
2. **NO SIDEBAR** - Completely remove any left sidebar navigation
3. **CONVERSATIONAL FLOW** - Questions flow naturally like the reference site
4. **CLEAN INTERFACE** - After daily tasks complete, show simple chat like Manus.im
5. **TWO SUBTLE BUTTONS** - Only "Progress" and "Exercises" below input (tertiary styling)

### PATIENT FLOW - MANDATORY SEQUENCE
1. Patient logs in → Chat interface loads
2. AI immediately starts conversation with daily tasks
3. Patient completes all assigned tasks through chat
4. Interface returns to clean chat state with subtle buttons below
5. NO separate pages, NO tabs, NO complex navigation

---

## PROVIDER INTERFACE - EXACT SPECIFICATIONS

### FORM BUILDER REQUIREMENTS
**YOU WILL BUILD:**
- Simple upload system for medical forms (PDF)
- Simple upload system for exercise videos
- Easy assignment to patients or protocols
- Start day, end day, and frequency controls (NOT phases)

**YOU WILL NOT BUILD:**
- Complex visual form builders
- Drag-and-drop interfaces
- Phase-based systems
- Complicated workflows

### SCHEDULING SYSTEM
**REPLACE "phases" with:**
- Start Day: (number, can be negative for pre-surgery)
- End Day: (number, can be positive infinity)
- Frequency: (once, daily, weekly, etc.)

---

## TECHNICAL ARCHITECTURE - MANDATORY STACK

**YOU MUST USE:**
- NextJS 14+ with App Router
- TypeScript (strict mode, NO 'any' types)
- Tailwind CSS + shadcn/ui components ONLY
- Supabase (PostgreSQL + Auth + Storage)
- OpenAI GPT-4 for chat responses
- OpenAI Whisper for voice-to-text
- Twilio for SMS notifications
- Resend for email notifications

**BRAND COLORS (USE THESE EXACTLY):**
- Primary: #002238
- Secondary: #006DB1
- Accent: #C8DBE9
- Background: #FFFFFF

---

## SECURITY - HIPAA COMPLIANCE MANDATORY

**YOU WILL:**
- Implement Row Level Security on ALL tables
- Use environment variables for ALL secrets
- Encrypt all PHI data
- Implement proper audit logging
- Follow multi-tenant isolation patterns

**FAILURE TO IMPLEMENT SECURITY = PROJECT TERMINATION**

---

## IMPLEMENTATION ORDERS

### STEP 1: READ DOCUMENTATION
- Read `/Claude_Docs/README.md`
- Read `/Claude_Docs/docs/architecture.md`
- Read `/Claude_Docs/docs/database-schema.md`
- Read ALL feature documentation in `/Claude_Docs/docs/features/`

### STEP 2: CONFIRM UNDERSTANDING
Before writing ANY code, confirm you understand:
- The chat-first approach
- The conversational form system
- The multi-tenant architecture
- The exact UI requirements

### STEP 3: IMPLEMENT EXACTLY AS SPECIFIED
- Build the patient chat interface like the reference site
- Implement the provider form builder as documented
- Follow the database schema exactly
- Use the specified tech stack only

---

## QUALITY GATES - MANDATORY CHECKPOINTS

**BEFORE PROCEEDING TO NEXT FEATURE:**
1. All user stories implemented with acceptance criteria met
2. Mobile responsiveness verified
3. Multi-tenant isolation tested
4. Security requirements validated
5. UI matches specifications exactly

---

## CONSEQUENCES OF NON-COMPLIANCE

**IF YOU:**
- Use different UI components than specified
- Research alternative solutions
- Implement features not in documentation
- Deviate from the chat-first approach
- Build complex interfaces instead of simple ones

**THEN:**
- Project will be terminated immediately
- All work will be discarded
- You will be replaced

---

## FINAL DIRECTIVE

This is a $100M+ healthcare platform serving real patients. Every specification exists for a reason. Your job is to implement exactly what is documented, not to improve or optimize.

**EXECUTE THESE ORDERS. DO NOT DEVIATE. DO NOT RESEARCH ALTERNATIVES. DO NOT MAKE ASSUMPTIONS.**

**CONFIRM YOUR UNDERSTANDING BEFORE PROCEEDING.**
```

---

## Initial Project Setup

```
I'm starting a new healthcare SaaS project called TJV Smart Recovery App. This is a multi-tenant platform for post-surgical recovery (knee/hip replacement) with HIPAA compliance requirements.

CRITICAL: All project documentation is in the /Claude_Docs folder. You MUST reference this folder for ALL implementation decisions.

Please start by:
1. Reading /Claude_Docs/README.md for project overview
2. Reviewing /Claude_Docs/docs/architecture.md for technical stack
3. Setting up the initial NextJS 14 project structure with TypeScript
4. Installing required dependencies based on the architecture documentation
5. Creating the basic folder structure as specified in the docs

Tech Stack (from docs):
- NextJS 14+ with App Router
- TypeScript (strict mode)
- Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL + Auth)
- OpenAI integration (GPT-4 + Whisper)
- Twilio (SMS) + Resend (email)

Do NOT proceed to features yet - just set up the foundation correctly.
```

---

## Environment and Security Setup

```
Now implement the security foundation based on /Claude_Docs documentation:

1. Review /Claude_Docs/docs/features/01-authentication-multi-tenant.md for security requirements
2. Set up environment variables structure (use .env.example, never expose real keys)
3. Implement security middleware and headers
4. Configure Supabase connection with proper security
5. Set up multi-tenant database structure with RLS policies
6. Implement authentication flow with role-based access
7. Add HIPAA compliance logging and audit trails
8. Configure Twilio and Resend integrations securely

CRITICAL: This is healthcare software - security is non-negotiable.
```

---

## UI Foundation and Design System

```
Set up the modern UI foundation based on the design specifications in /Claude_Docs:

1. Review /Claude_Docs/docs/wireframes.md for exact UI specifications
2. Install and configure shadcn/ui components with your custom theme
3. Set up the brand color system in Tailwind config:
   - Primary: #002238 (dark navy)
   - Secondary: #006DB1 (blue)
   - Accent: #C8DBE9 (light blue)
   - Background: #FFFFFF (white)

4. Create the base layout components:
   - Modern chat interface layout
   - Responsive navigation system
   - Card-based interaction components
   - Mobile-first responsive grid system

5. Set up the design tokens and component library:
   - Typography scale (matching NeuraTalk modern aesthetic)
   - Spacing system
   - Border radius and shadows
   - Animation and transition presets

6. Create reusable UI components:
   - Chat message bubbles
   - Interactive selection cards
   - Progress indicators and timelines
   - Form components with conversational styling
   - Video player interface components

7. Implement the modern chat UI patterns:
   - Typing indicators
   - Message reactions
   - Voice input button styling
   - File upload interfaces

CRITICAL: Follow the exact wireframes in /Claude_Docs/docs/wireframes.md and ensure the UI matches the modern, clean aesthetic shown in your reference designs.

Test the UI components on both desktop and mobile to ensure they look polished and professional.
```

---

## Database Schema Implementation

```
Implement the complete database schema based on /Claude_Docs/docs/database-schema.md:

1. Create all tables with exact field specifications
2. Implement Row Level Security policies for multi-tenant isolation
3. Set up proper indexes for performance
4. Create database functions for common operations
5. Implement audit logging tables
6. Set up proper foreign key relationships
7. Create views for complex queries
8. Test multi-tenant data isolation thoroughly

CRITICAL: Follow the exact schema in the documentation - do not modify table structures.
```

---

## Authentication and Multi-Tenant Setup

```
Implement authentication and multi-tenant system following /Claude_Docs/docs/features/01-authentication-multi-tenant.md exactly:

IMPLEMENT THESE SPECIFIC USER STORIES:
- User Story 1.1 (Multi-tenant registration) - implement all 12 acceptance criteria
- User Story 1.2 (Role-based authentication) - implement all 8 acceptance criteria
- User Story 1.3 (License verification) - implement all 6 acceptance criteria
- User Story 1.4 (Security compliance) - implement all 10 acceptance criteria

BUILD THESE EXACT COMPONENTS:
- TenantRegistrationForm with license verification
- LoginForm with MFA support
- RoleBasedRedirect component
- SecurityAuditLogger
- TenantIsolationMiddleware

IMPLEMENT THESE API ENDPOINTS:
- POST /api/auth/register-tenant
- POST /api/auth/login
- POST /api/auth/verify-license
- GET /api/auth/user-profile

INTEGRATION REQUIREMENTS:
- Twilio for SMS verification
- Resend for email notifications
- License verification API integration
- Supabase Auth with custom claims

Do not proceed until all acceptance criteria are met and tested.
```

---

## Patient Chat Interface

```
Build the complete chat interface system following /Claude_Docs/docs/features/02-patient-chat-interface.md exactly:

IMPLEMENT THESE SPECIFIC USER STORIES:
- User Story 2.1 (Real-time messaging) - implement all 8 acceptance criteria
- User Story 2.2 (Voice input) - implement all 6 acceptance criteria  
- User Story 2.3 (Conversational forms) - implement all 7 acceptance criteria
- User Story 2.4 (Provider communication) - implement all 5 acceptance criteria

BUILD THESE EXACT COMPONENTS:
- ChatContainer with real-time messaging
- MessageBubble with user/AI styling
- VoiceInputButton with Whisper integration
- ConversationalForm renderer
- TypingIndicator with WebSocket connection

IMPLEMENT THESE API ENDPOINTS:
- POST /api/chat/send-message
- GET /api/chat/messages/:conversationId
- POST /api/chat/voice-transcribe
- POST /api/chat/ai-response

CRITICAL REQUIREMENTS:
- Chat interface must look like https://space10-community.github.io/conversational-form/landingpage/
- AI speaks first, not the patient
- No sidebar navigation
- After daily tasks complete, return to clean Manus.im-style chat
- Two subtle buttons below: "Progress" and "Exercises"

Do not proceed until all acceptance criteria are met and tested.
```

---

## Task/Form Builder System

```
Build the task and form builder system following /Claude_Docs/docs/features/03-task-form-builder-system.md exactly:

IMPLEMENT THESE SPECIFIC USER STORIES:
- User Story 3.1 (Form creation) - implement all 9 acceptance criteria
- User Story 3.2 (Task scheduling) - implement all 7 acceptance criteria
- User Story 3.3 (Content assignment) - implement all 6 acceptance criteria
- User Story 3.4 (Template management) - implement all 8 acceptance criteria

BUILD THESE EXACT COMPONENTS:
- FormBuilder with drag-and-drop interface
- TaskScheduler with day-based timing
- ContentLibrary management
- TemplateManager for reusable forms

CRITICAL CHANGES FROM CHARLIE'S FEEDBACK:
- Replace "phases" with start day, end day, and frequency
- Simple upload system for PDFs and videos
- Easy assignment to patients or protocols
- No complex visual form builders

IMPLEMENT THESE API ENDPOINTS:
- POST /api/forms/create
- PUT /api/forms/:id/schedule
- POST /api/tasks/assign
- GET /api/templates/library

Do not proceed until all acceptance criteria are met and tested.
```

---

## Pre-Surgery Forms and Questionnaires

```
Build the pre-surgery forms system following /Claude_Docs/docs/features/04-pre-surgery-forms-questionnaires.md exactly:

IMPLEMENT THESE SPECIFIC USER STORIES:
- User Story 4.1 (Medical intake) - implement all 11 acceptance criteria
- User Story 4.2 (Consent management) - implement all 8 acceptance criteria
- User Story 4.3 (Risk assessment) - implement all 9 acceptance criteria
- User Story 4.4 (Clearance tracking) - implement all 7 acceptance criteria

BUILD THESE EXACT COMPONENTS:
- MedicalIntakeForm with validation
- ConsentManager with digital signatures
- RiskAssessmentCalculator
- ClearanceTracker with status updates

IMPLEMENT THESE API ENDPOINTS:
- POST /api/intake/medical-history
- POST /api/consent/digital-signature
- GET /api/assessment/risk-score
- PUT /api/clearance/update-status

Do not proceed until all acceptance criteria are met and tested.
```

---

## Post-Surgery Recovery System

```
Build the post-surgery recovery system following /Claude_Docs/docs/features/05-post-surgery-recovery-phases.md exactly:

IMPLEMENT THESE SPECIFIC USER STORIES:
- User Story 5.1 (Recovery tracking) - implement all 10 acceptance criteria
- User Story 5.2 (Milestone management) - implement all 8 acceptance criteria
- User Story 5.3 (Adaptive protocols) - implement all 9 acceptance criteria
- User Story 5.4 (Progress visualization) - implement all 7 acceptance criteria

BUILD THESE EXACT COMPONENTS:
- RecoveryTracker with timeline view
- MilestoneManager with celebrations
- AdaptiveProtocol engine
- ProgressVisualization charts

IMPLEMENT THESE API ENDPOINTS:
- GET /api/recovery/timeline/:patientId
- POST /api/milestones/complete
- PUT /api/protocols/adapt
- GET /api/progress/visualization

Do not proceed until all acceptance criteria are met and tested.
```

---

## Exercise System with Video Integration

```
Build the exercise system following /Claude_Docs/docs/features/06-exercise-system-video-integration.md exactly:

IMPLEMENT THESE SPECIFIC USER STORIES:
- User Story 6.1 (Video library) - implement all 9 acceptance criteria
- User Story 6.2 (Exercise assignment) - implement all 8 acceptance criteria
- User Story 6.3 (Progress tracking) - implement all 10 acceptance criteria
- User Story 6.4 (Performance analytics) - implement all 7 acceptance criteria

BUILD THESE EXACT COMPONENTS:
- VideoLibrary with search and filtering
- ExerciseAssignment with scheduling
- ProgressTracker with completion metrics
- PerformanceAnalytics dashboard

IMPLEMENT THESE API ENDPOINTS:
- GET /api/exercises/library
- POST /api/exercises/assign
- PUT /api/exercises/complete
- GET /api/analytics/performance

Do not proceed until all acceptance criteria are met and tested.
```

---

## Education System

```
Build the education system based on /Claude_Docs documentation:

1. Create the educational content library and management system
2. Build interactive learning modules with multimedia support
3. Implement progress tracking for educational content
4. Create content delivery through the chat interface
5. Add video, image, and PDF content support
6. Build personalized learning paths based on surgery type and recovery phase
7. Implement knowledge assessments and quizzes
8. Create content scheduling and automated delivery

This should integrate seamlessly with the recovery phases to deliver timely, relevant education.
```

---

## Daily Tasks and Check-ins

```
Implement the daily task and check-in system:

1. Create the daily check-in interface with conversational flow
2. Build comprehensive symptom and pain tracking
3. Implement the task completion workflow with voice input
4. Add smart reminder and notification system
5. Create visual progress tracking and analytics
6. Build mood and wellness tracking features
7. Implement daily summary generation and reporting
8. Add streak tracking and motivation features

This is core to patient engagement and recovery monitoring.
```

---

## Practice Dashboard and Provider Tools

```
Build the comprehensive provider dashboard and management tools:

1. Create the practice overview dashboard with key metrics
2. Build patient management and monitoring interfaces
3. Implement analytics and reporting for outcomes
4. Create alert and notification systems for providers
5. Build the protocol management and customization interface
6. Add patient communication and messaging tools
7. Implement compliance and audit reporting features
8. Create team collaboration and handoff tools

This is essential for healthcare providers to effectively manage their patient population.
```

---

## Advanced Analytics and Reporting

```
Implement comprehensive analytics and reporting system:

1. Build patient outcome tracking and analytics
2. Create provider performance dashboards
3. Implement population health analytics
4. Add predictive analytics for recovery outcomes
5. Create compliance and audit reporting
6. Build custom report generation tools
7. Add data export and integration capabilities
8. Implement real-time monitoring and alerts

Focus on actionable insights for both patients and providers.
```

---

## Notification and Communication System

```
Build the comprehensive notification and communication system:

1. Implement smart notification scheduling and delivery
2. Create multi-channel communication (SMS, email, in-app)
3. Build emergency alert and escalation systems
4. Add family/caregiver communication features
5. Implement provider-to-provider communication
6. Create automated workflow notifications
7. Build notification preferences and management
8. Add communication audit trails for compliance

Ensure all communications are HIPAA compliant and properly logged.
```

---

## Final Integration and Testing

```
Complete the final integration and comprehensive testing:

1. **Integration Testing:**
   - Test all features working together seamlessly
   - Verify chat interface integrates with all systems
   - Test multi-tenant isolation across all features
   - Validate real-time updates and notifications

2. **User Experience Testing:**
   - Test complete patient journey from registration to recovery
   - Verify provider workflows are intuitive and efficient
   - Test mobile responsiveness across all features
   - Validate accessibility compliance (WCAG standards)

3. **Performance Optimization:**
   - Optimize database queries and API responses
   - Implement caching strategies
   - Test with realistic data volumes
   - Optimize for mobile performance

4. **Security Validation:**
   - Penetration testing for vulnerabilities
   - HIPAA compliance audit
   - Multi-tenant security verification
   - API security testing

5. **Final Polish:**
   - Add smooth animations and micro-interactions
   - Implement proper loading states everywhere
   - Add helpful empty states and error messages
   - Ensure consistent styling across all features

The final product should feel like a premium, modern healthcare application that patients and providers love to use.
```

---

## Deployment and Production Setup

```
Prepare for production deployment:

1. Set up Vercel deployment configuration
2. Configure Supabase production environment
3. Implement proper environment variable management
4. Set up monitoring and alerting
5. Create backup and disaster recovery procedures
6. Implement security scanning and compliance checks
7. Create deployment documentation
8. Set up CI/CD pipeline
9. Configure domain and SSL certificates
10. Test production deployment thoroughly

Ensure all security requirements are met for healthcare compliance.
```

---

## Corrective Prompts

### Major Course Correction

```
STOP - MAJOR IMPLEMENTATION ERROR DETECTED

You are NOT following the comprehensive documentation in /Claude_Docs/. You're building your own interpretation instead of following the detailed specifications provided.

IMMEDIATE ACTIONS REQUIRED:

1. STOP all current development
2. READ EVERY FILE in /Claude_Docs/ folder completely
3. COMPARE your current implementation to the documentation
4. REBUILD according to the exact specifications

CRITICAL ERRORS TO FIX:

❌ PATIENT INTERFACE ERRORS:
- You built separate pages (Check-In, Progress, etc.) - WRONG
- CORRECT: Everything must be in the chat interface (see /Claude_Docs/docs/features/02-patient-chat-interface.md)
- Check-ins, exercises, videos ALL delivered through chat messages
- No tabs, no separate pages - ONLY chat

❌ ADMIN/CLINIC INTERFACE ERRORS:
- Form builder is too complex - WRONG
- CORRECT: Simple upload system for medical forms and videos with assignment capability
- Patient details scattered in sidebars - WRONG  
- CORRECT: Centralized patient detail view with all information in one place
- Disconnected interfaces - WRONG
- CORRECT: Integrated workflow as specified in documentation

DO NOT continue building until you've read and understood ALL the documentation. Your current implementation does not match the specifications at all.
```

### Chat Interface Correction

```
URGENT CORRECTION NEEDED - WRONG IMPLEMENTATION APPROACH

The current implementation has check-ins, exercises, and videos on separate pages with tabs. This is INCORRECT.

REQUIRED ARCHITECTURE (from /Claude_Docs):
- ALL patient interactions must happen within the CHAT INTERFACE
- NO separate pages for check-ins, exercises, or videos
- The chat is the ONLY interface patients see
- Everything is delivered conversationally through chat messages

CORRECT IMPLEMENTATION:
When a patient logs in, they should see:
- A chat interface (like the questions you built correctly)
- Daily check-in delivered as chat messages with interactive cards
- Mood/energy questions presented as chat bubbles with emoji selection
- Exercise videos sent as chat messages with embedded video players
- Progress tracking shown as chat messages with visual progress bars
- All interactions happen through chat responses

FIX THIS IMMEDIATELY - the separate pages approach is completely wrong for this project.
```

### Design System Correction

```
COMPLETE REBUILD REQUIRED - CRITICAL DESIGN FAILURES

The current implementation is completely wrong and doesn't follow any of the specifications in /Claude_Docs/.

CRITICAL FAILURES IDENTIFIED:

❌ PATIENT INTERFACE FAILURES:
- Looks like a children's education app, NOT a premium healthcare platform for adults 40+
- Emoji styling is childish and unprofessional
- Layout doesn't match shadcn/ui dashboard standards
- Missing Manus.im-style chat interface after daily tasks
- No profile in top right corner
- Missing tertiary buttons below input
- Sizing and spacing completely wrong
- Not following https://shadcnuikit.com/dashboard/apps/ai-chat design

❌ PROVIDER INTERFACE FAILURES:
- Doesn't follow https://shadcnuikit.com/dashboard/default at all
- Scattered information instead of centralized patient details
- Complex interfaces instead of simple upload systems
- Not using proper shadcn/ui components
- Layout is disconnected and unprofessional

REQUIRED IMMEDIATE FIXES:

1. PATIENT INTERFACE REBUILD:
   - Use EXACT design from https://shadcnuikit.com/dashboard/apps/ai-chat
   - Professional, clean styling for adults 40+ (not children)
   - After daily tasks complete → return to Manus.im style chat
   - Profile avatar in top right corner
   - Two tertiary buttons below input (subtle, not prominent)
   - Premium healthcare aesthetic using brand colors
   - Proper spacing and typography from shadcn/ui

2. PROVIDER INTERFACE REBUILD:
   - Follow EXACT layout from https://shadcnuikit.com/dashboard/default
   - Centralized patient detail view (not scattered sidebars)
   - Simple upload system for forms and videos
   - Clean, professional dashboard design
   - Proper shadcn/ui component usage

START OVER with the correct design foundations. The current implementation is completely unusable and doesn't meet any of the requirements.
```

---

## Key Success Reminders

- **Always reference /Claude_Docs** - Never implement without checking documentation first
- **Follow exact specifications** - Don't deviate from documented requirements  
- **Security first** - This is healthcare software, security is paramount
- **Test thoroughly** - Multi-tenant isolation and HIPAA compliance are critical
- **Mobile-first design** - Patients will primarily use mobile devices
- **Chat-centric approach** - Everything should integrate with the chat interface
- **Professional UI** - This is for adults 40+, not children
- **Simple provider tools** - Upload and assign, not complex builders

