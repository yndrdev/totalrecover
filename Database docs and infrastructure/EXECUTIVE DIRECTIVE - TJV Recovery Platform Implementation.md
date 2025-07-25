# EXECUTIVE DIRECTIVE - TJV Recover Implementation

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

**YOU MUST implement the chat interface EXACTLY like:** [https://space10-community.github.io/conversational-form/landingpage/](https://space10-community.github.io/conversational-form/landingpage/)

**CRITICAL REQUIREMENTS:**

1. **AI SPEAKS FIRST** - The chat initiates conversation, NOT the patient

1. **NO SIDEBAR** - Completely remove any left sidebar navigation

1. **CONVERSATIONAL FLOW** - Questions flow naturally like the reference site

1. **CLEAN INTERFACE** - After daily tasks complete, show simple chat like Manus.im

1. **TWO SUBTLE BUTTONS** - Only "Progress" and "Exercises" below input (tertiary styling)

### PATIENT FLOW - MANDATORY SEQUENCE

1. Patient logs in → Chat interface loads

1. AI immediately starts conversation with daily tasks

1. Patient completes all assigned tasks through chat

1. Interface returns to clean chat state with subtle buttons below

1. NO separate pages, NO tabs, NO complex navigation

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

1. Mobile responsiveness verified

1. Multi-tenant isolation tested

1. Security requirements validated

1. UI matches specifications exactly

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

