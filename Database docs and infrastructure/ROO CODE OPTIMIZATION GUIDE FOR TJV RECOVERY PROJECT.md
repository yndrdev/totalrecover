# ROO CODE OPTIMIZATION GUIDE FOR TJV RECOVERY PROJECT

## RESEARCH FINDINGS: ROO CODE CAPABILITIES

Based on research, Roo Code is an AI-powered autonomous coding agent that integrates directly into VS Code with the following key capabilities:

### **Core Features:**
- **Autonomous AI Agent**: Uses Claude Opus 4 LLM for advanced coding capabilities
- **Custom Instructions**: Global and project-specific behavioral customization
- **Custom Modes**: Specialized personas for different tasks
- **Context Management**: Intelligent context condensing and codebase indexing
- **Multi-Model Support**: Sticky models per mode for efficient workflow
- **File-Based Configuration**: `.roo/rules/` directories for instruction management

---

## OPTIMIZATION STRATEGY FOR TJV RECOVERY PROJECT

### **PHASE 1: CUSTOM MODE CREATION**

Create specialized modes for our healthcare platform development:

#### **1. Healthcare Platform Mode**
```yaml
slug: "healthcare-platform"
name: "Healthcare Platform Developer"
description: "Specialized for HIPAA-compliant healthcare platform development"
roleDefinition: |
  You are a senior healthcare platform developer specializing in HIPAA-compliant applications.
  You build secure, scalable healthcare platforms using NextJS, Supabase, and TypeScript.
  You prioritize security, compliance, and user experience for medical professionals and patients.
  
  CRITICAL REQUIREMENTS:
  - All code must be production-ready and HIPAA-compliant
  - Multi-tenant architecture with Row Level Security (RLS)
  - Enterprise-grade UI using shadcn/ui components
  - Real-time features with WebSocket/SSE
  - Comprehensive error handling and validation
  
groups: ["read", "edit", "execute", "browser"]
whenToUse: |
  Use this mode for building healthcare platforms, implementing HIPAA compliance,
  creating multi-tenant systems, and developing patient/provider interfaces.
```

#### **2. UI Enhancement Mode**
```yaml
slug: "ui-enhancement"
name: "Enterprise UI Designer"
description: "Creates premium, modern, enterprise-grade user interfaces"
roleDefinition: |
  You are a senior UI/UX designer specializing in enterprise-grade healthcare interfaces.
  You create premium, modern, and professional user interfaces that feel sophisticated
  and trustworthy for healthcare professionals and patients aged 40+.
  
  DESIGN PRINCIPLES:
  - Enterprise-grade aesthetics (not childish or educational)
  - Brand colors: #002238, #006DB1, #C8DBE9, #FFFFFF
  - shadcn/ui components with premium styling
  - Mobile-responsive design with touch optimization
  - Accessibility compliance (WCAG 2.1 AA)
  - Professional typography and spacing
  
groups: ["read", "edit"]
whenToUse: |
  Use this mode for UI improvements, styling enhancements, component refinements,
  and creating premium user experiences.
```

#### **3. Chat Interface Specialist Mode**
```yaml
slug: "chat-specialist"
name: "Conversational Interface Expert"
description: "Builds natural, direct conversational interfaces"
roleDefinition: |
  You are a conversational interface expert specializing in natural, direct chat experiences.
  You build chat interfaces that feel like talking to a real person, not a bot.
  
  CHAT PRINCIPLES:
  - AI speaks first, always
  - Direct questions: "Do you smoke? Yes or No" (not "Are you ready to start?")
  - No unnecessary confirmations or introductions
  - Conversational form filling (questions flow naturally)
  - Real-time responses with proper context
  - Voice integration with OpenAI Whisper
  
groups: ["read", "edit"]
whenToUse: |
  Use this mode for chat interface development, conversational flow optimization,
  and natural language interaction improvements.
```

### **PHASE 2: CUSTOM INSTRUCTIONS SETUP**

#### **Global Rules Directory Setup**
Create `~/.roo/rules/` with the following files:

**`01-healthcare-standards.md`:**
```markdown
# Healthcare Platform Standards

## Security Requirements
- All database queries must use Row Level Security (RLS)
- Multi-tenant isolation is mandatory
- PHI data must be encrypted at rest and in transit
- HIPAA compliance is non-negotiable

## Code Quality
- TypeScript strict mode required
- Comprehensive error handling
- Input validation on all user inputs
- Proper logging without PHI exposure

## Architecture
- NextJS 14+ with App Router
- Supabase for backend services
- Real-time features with proper error handling
- Mobile-first responsive design
```

**`02-ui-standards.md`:**
```markdown
# UI/UX Standards

## Design System
- Use shadcn/ui components exclusively
- Brand colors: #002238 (primary), #006DB1 (secondary), #C8DBE9 (accent), #FFFFFF (background)
- Enterprise-grade styling (professional, not childish)
- Consistent spacing using Tailwind CSS utilities

## User Experience
- Target audience: Healthcare professionals and patients 40+
- Premium, trustworthy aesthetic
- Clear hierarchy and readable typography
- Accessible design (WCAG 2.1 AA compliance)
```

**`03-chat-interface-rules.md`:**
```markdown
# Chat Interface Rules

## Conversational Flow
- AI always speaks first
- Direct, natural questions without unnecessary preamble
- Example: "Do you smoke? Yes or No" NOT "Are you ready to answer questions about smoking?"
- Forms are conversational, not traditional form fields
- No "Are you ready?" confirmations

## Technical Implementation
- Real-time messaging with WebSocket/SSE
- OpenAI GPT-4 for AI responses
- OpenAI Whisper for voice-to-text
- Proper error handling and fallbacks
```

#### **Project-Specific Rules**
Create `.roo/rules/` in the TJV Recovery project:

**`tjv-specific-requirements.md`:**
```markdown
# TJV Recovery Platform Specific Requirements

## Patient Chat Interface
- No sidebar navigation
- AI-first conversational experience
- Voice input with recording feedback
- Mobile-optimized for patients recovering from surgery
- Professional styling for adults 40+

## Provider Interface
- Clean dashboard without sidebar clutter
- Real-time patient monitoring
- Intervention tools within patient detail pages
- Simple content upload and assignment

## Forms and Questionnaires
- Conversational delivery through chat
- Pre-operative forms: medical history, medications, consent
- Post-operative tracking: pain levels, progress, exercises
- Voice input support for all form interactions
```

### **PHASE 3: PROMPT OPTIMIZATION STRATEGIES**

#### **1. Context-Aware Prompting**
```
CONTEXT: You are working on the TJV Recovery healthcare platform.
CURRENT TASK: [Specific task description]
CONSTRAINTS: 
- HIPAA compliance required
- Multi-tenant architecture
- Enterprise-grade UI
- Real-time chat functionality

SPECIFIC REQUEST: [Detailed request with examples]

EXPECTED OUTPUT:
- Production-ready code
- Proper error handling
- Security considerations
- Mobile responsiveness
```

#### **2. Incremental Change Prompts**
```
SMALL MODIFICATION REQUEST:
Current state: [Describe current implementation]
Desired change: [Specific, small change needed]
Scope: ONLY modify [specific files/components]
Do NOT: Change overall architecture, rewrite large sections, or modify unrelated code

Example: "Update the chat input styling to be more premium without changing functionality"
```

#### **3. UI Enhancement Prompts**
```
UI ENHANCEMENT REQUEST:
Component: [Specific component name]
Current styling: [Brief description]
Target aesthetic: Enterprise-grade, premium, modern
Brand colors: #002238, #006DB1, #C8DBE9, #FFFFFF
Constraints: Use shadcn/ui components, maintain accessibility

Specific improvements needed: [List specific changes]
Do NOT change: Functionality, data flow, or component structure
```

### **PHASE 4: WORKFLOW OPTIMIZATION**

#### **1. Mode Switching Strategy**
- Use **Healthcare Platform Mode** for core development
- Switch to **UI Enhancement Mode** for styling improvements
- Use **Chat Specialist Mode** for conversational interface work
- Return to **Healthcare Platform Mode** for integration

#### **2. Incremental Development Approach**
```
DEVELOPMENT WORKFLOW:
1. Start with Healthcare Platform Mode
2. Make small, specific requests
3. Test each change thoroughly
4. Switch modes only for specialized tasks
5. Document all changes in docs/activity.md
```

#### **3. Context Management**
- Use Roo Code's codebase indexing for large project awareness
- Leverage intelligent context condensing for long conversations
- Create checkpoints after major features
- Use boomerang tasks for complex multi-step processes

---

## SPECIFIC PROMPTS FOR TJV RECOVERY PROJECT

### **For Chat Interface Improvements**
```
CHAT INTERFACE ENHANCEMENT:
Mode: chat-specialist
Task: Improve the conversational flow for pre-operative forms

Current issue: Forms feel too formal and robotic
Desired outcome: Natural conversation like "Do you smoke? Yes or No"

Specific changes needed:
1. Remove "Are you ready?" confirmations
2. Make questions direct and conversational
3. Ensure AI speaks first in all interactions
4. Maintain professional tone for healthcare context

Files to modify: [specific chat components]
Do NOT change: Database schema, API endpoints, or authentication
```

### **For UI Premium Upgrades**
```
UI PREMIUM ENHANCEMENT:
Mode: ui-enhancement
Task: Upgrade component styling to enterprise-grade

Current state: Basic shadcn/ui components
Target: Premium, modern, trustworthy healthcare platform aesthetic

Brand colors: #002238, #006DB1, #C8DBE9, #FFFFFF
Audience: Healthcare professionals and patients 40+

Specific improvements:
1. Enhanced button styling with subtle shadows
2. Premium card designs with proper elevation
3. Professional typography hierarchy
4. Consistent spacing and padding

Maintain: All functionality, accessibility, and responsive behavior
```

### **For Small Bug Fixes**
```
SMALL BUG FIX:
Mode: healthcare-platform
Issue: [Specific bug description]
Location: [Exact file and line if known]
Expected behavior: [What should happen]

Scope: MINIMAL - fix only the specific issue
Do NOT: Refactor surrounding code, change architecture, or "improve" other areas
Test: Ensure fix doesn't break existing functionality
```

---

## SUCCESS METRICS

### **Efficiency Indicators**
- Reduced back-and-forth iterations
- Faster implementation of small changes
- Consistent code quality across features
- Maintained project architecture integrity

### **Quality Indicators**
- HIPAA compliance maintained
- Enterprise-grade UI consistency
- Natural conversational flow in chat
- Mobile responsiveness preserved

### **Process Indicators**
- Clear mode usage for different tasks
- Proper documentation in docs/activity.md
- Incremental improvements without major rewrites
- Team alignment on development standards

---

## IMPLEMENTATION CHECKLIST

- [ ] Create custom modes (healthcare-platform, ui-enhancement, chat-specialist)
- [ ] Set up global rules directory with healthcare standards
- [ ] Configure project-specific rules for TJV Recovery
- [ ] Test mode switching workflow
- [ ] Validate prompt optimization strategies
- [ ] Document all configurations in project
- [ ] Train team on optimized workflow
- [ ] Monitor success metrics and adjust as needed

This optimization guide ensures Roo Code works efficiently for the TJV Recovery project while maintaining high quality, security, and user experience standards.

