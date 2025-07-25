# Roo Code Documentation Directive - IMMEDIATE IMPLEMENTATION

## 🚨 **CRITICAL: STOP ALL CURRENT WORK AND READ THIS**

This directive must be given to Roo Code immediately to prevent further schema simplification and ensure proper documentation compliance.

## 📋 **COPY THIS ENTIRE PROMPT TO ROO CODE:**

```
MANDATORY DOCUMENTATION COMPLIANCE DIRECTIVE

Mode: healthcare-platform
Task: Implement strict documentation adherence for TJV Recovery Platform

CRITICAL STOP ORDER:
- STOP all schema simplification attempts immediately
- STOP creating "basic" or "minimum" versions of anything
- STOP working around documented specifications
- STOP making assumptions about requirements

MANDATORY READING REQUIREMENT:
Before writing ANY code, you MUST read and understand these documentation files:

1. docs/PROJECT_OVERVIEW.md - Mission, users, core principles
2. docs/DEVELOPMENT_RULES.md - Mandatory compliance rules
3. docs/features/ - All feature specifications with acceptance criteria
4. docs/database/ - Comprehensive schema (DO NOT MODIFY)
5. docs/wireframes/ - UI/UX specifications
6. docs/workflows/ - Clinical workflows and processes

ABSOLUTE REQUIREMENTS:

1. DATABASE SCHEMA COMPLIANCE:
   - Use the comprehensive schema EXACTLY as documented
   - DO NOT simplify table structures
   - DO NOT create "basic" versions
   - Follow multi-tenant architecture with RLS policies
   - Use existing relationships: auth.users → profiles → patients

2. UI/UX STANDARDS:
   - Professional healthcare design for adults 40+
   - Brand colors: #002238, #006DB1, #C8DBE9, #FFFFFF
   - shadcn/ui components with Tailwind CSS
   - Mobile-responsive design
   - NO childish or educational styling

3. CHAT INTERFACE REQUIREMENTS:
   - AI speaks first (conversational-form approach)
   - Direct questions: "Do you smoke? Yes or No"
   - No "Are you ready?" prompts
   - Natural conversation flow
   - Voice input integration with OpenAI Whisper

4. NURSE INTERVENTION SYSTEM:
   - All interventions within Patient Detail Page
   - Real-time monitoring and alerts
   - Exercise modification without page navigation
   - Professional clinical workflow

5. SECURITY & COMPLIANCE:
   - HIPAA compliance throughout
   - Multi-tenant isolation
   - Row Level Security (RLS) policies
   - Secure authentication and authorization

FORBIDDEN ACTIONS:
❌ Simplifying database schema
❌ Creating "basic" versions of features
❌ Ignoring documented specifications
❌ Using different UI components than specified
❌ Modifying comprehensive table structures
❌ Deviating from professional healthcare design

VERIFICATION PROCESS:
Before implementing any feature:
1. Read the relevant documentation completely
2. Understand all acceptance criteria
3. Confirm approach aligns with specifications
4. Implement exactly as documented
5. Test against all acceptance criteria

ESCALATION PROTOCOL:
If documentation seems unclear or conflicting:
1. Ask for clarification before proceeding
2. Do NOT make assumptions
3. Do NOT work around the issue
4. Do NOT simplify the requirement

COMPLIANCE CONFIRMATION:
Respond with "DOCUMENTATION COMPLIANCE CONFIRMED" and list the 5 key files you will read before proceeding with any development work.

This directive is non-negotiable and must be followed exactly.
```

## 🎯 **EXPECTED ROO CODE RESPONSE:**

Roo Code should respond with:
```
DOCUMENTATION COMPLIANCE CONFIRMED

I will read these 5 key files before any development:
1. docs/PROJECT_OVERVIEW.md
2. docs/DEVELOPMENT_RULES.md  
3. docs/features/ (all feature specifications)
4. docs/database/ (comprehensive schema)
5. docs/wireframes/ (UI/UX specifications)

I understand I must:
- Use existing comprehensive schema without modification
- Follow professional healthcare design standards
- Implement AI-first conversational chat interface
- Build nurse intervention within Patient Detail Page
- Maintain HIPAA compliance and multi-tenant security

I will not simplify, modify, or work around any documented specifications.
```

## 🔧 **FOLLOW-UP VERIFICATION PROMPT:**

After Roo Code confirms compliance, use this verification prompt:

```
DOCUMENTATION VERIFICATION TEST

Task: Demonstrate understanding of key requirements

Please confirm your understanding by answering these questions:

1. What is the correct database relationship chain for users?
   (Answer should be: auth.users → profiles → patients)

2. What are the 4 brand colors for the platform?
   (Answer should be: #002238, #006DB1, #C8DBE9, #FFFFFF)

3. How should the chat interface behave for pre-operative forms?
   (Answer should be: AI speaks first, direct questions like "Do you smoke? Yes or No")

4. Where do nurse interventions happen in the UI?
   (Answer should be: Within the Patient Detail Page)

5. What is forbidden regarding the database schema?
   (Answer should be: Simplifying, modifying, or creating basic versions)

Only proceed with development after confirming all 5 answers are correct.
```

## ✅ **SUCCESS INDICATORS:**

### **Roo Code is Back on Track When:**
- Stops trying to simplify schema
- References documentation before making decisions
- Asks for clarification instead of assuming
- Follows professional healthcare design standards
- Implements features exactly as specified

### **Red Flags to Watch For:**
- Any mention of "simplifying" or "basic versions"
- Creating new table structures
- Ignoring documented UI specifications
- Working around instead of following requirements
- Making assumptions about unclear requirements

## 🚀 **IMMEDIATE ACTION PLAN:**

1. **Copy documentation directive** to Roo Code immediately
2. **Wait for compliance confirmation** before proceeding
3. **Run verification test** to ensure understanding
4. **Continue with systematic development** following documented prompts
5. **Monitor for compliance** throughout development process

This directive will get Roo Code back on track and prevent further deviations from your comprehensive specifications!

