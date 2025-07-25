# ROO CODE DOCUMENTATION DIRECTIVE
## Create Project Documentation & Strict Following Rules

---

## 🎯 PROBLEM IDENTIFIED: LACK OF PROJECT DOCUMENTATION

You're absolutely right - Roo Code keeps going off the rails because it doesn't have comprehensive project documentation to reference within the project itself.

---

## 📋 IMMEDIATE SOLUTION: CREATE PROJECT DOCUMENTATION

### **STEP 1: Create Comprehensive Project Documentation**

```
CREATE PROJECT DOCUMENTATION SYSTEM

Mode: healthcare-platform
Task: Create comprehensive project documentation that must be followed strictly

CRITICAL REQUIREMENT:
Create a complete documentation system within the project that defines every aspect of the TJV Recovery healthcare platform. This documentation will serve as the single source of truth that must be followed without deviation.

CREATE THESE DOCUMENTATION FILES:

1. **docs/PROJECT_OVERVIEW.md**
   ```markdown
   # TJV Recovery Healthcare Platform
   
   ## Project Mission
   HIPAA-compliant healthcare platform for post-surgical recovery with real-time provider interventions.
   
   ## Target Users
   - Patients: Adults 40+ recovering from orthopedic surgery
   - Providers: Orthopedic surgeons, nurses, physical therapists
   - Admins: Clinic administrators and super admins
   
   ## Core Principles
   - Professional healthcare interface (NOT childish or playful)
   - AI speaks first in all conversations
   - Multi-tenant architecture with strict isolation
   - Real-time chat with conversation tracking
   - Voice input integration (OpenAI Whisper)
   - Mobile-optimized for patients 40+
   ```

2. **docs/DATABASE_SCHEMA.md**
   ```markdown
   # Database Schema - COMPREHENSIVE & FINAL
   
   ## CRITICAL: DO NOT SIMPLIFY OR MODIFY
   The database schema is comprehensive and production-ready. 
   DO NOT create simplified versions or modify existing structure.
   
   ## Tables (Use As-Is)
   - tenants (multi-tenant hierarchy)
   - profiles (user management with accessible_tenants)
   - patients (surgery and recovery data)
   - conversations (chat tracking with analytics)
   - messages (real-time messaging with completion tracking)
   - conversation_activities (forms, videos, exercises in chat context)
   
   ## Patient ID Pattern
   patients.id = auth.users.id (direct UUID linking)
   Application code uses user.id directly as patient_id
   ```

3. **docs/UI_DESIGN_STANDARDS.md**
   ```markdown
   # UI Design Standards - STRICT REQUIREMENTS
   
   ## Brand Colors (MANDATORY)
   - Primary: #002238 (dark navy)
   - Secondary: #006DB1 (blue)
   - Accent: #C8DBE9 (light blue)
   - Background: #FFFFFF (white)
   
   ## UI Framework Requirements
   - shadcn/ui components ONLY
   - Tailwind CSS for styling
   - Professional healthcare appearance
   - Target audience: Adults 40+ (NOT childish)
   - Mobile-first responsive design
   
   ## Chat Interface Requirements
   - NO sidebar navigation
   - AI speaks first, always
   - Direct questions: "Rate your pain 0-10" (not "Please rate...")
   - Voice input button prominent but not intrusive
   - Conversational-form approach
   ```

4. **docs/DEVELOPMENT_RULES.md**
   ```markdown
   # Development Rules - MUST FOLLOW
   
   ## CRITICAL CONSTRAINTS
   1. DO NOT simplify database schema
   2. DO NOT create "minimum field" versions
   3. DO NOT modify existing comprehensive structure
   4. USE existing Supabase schema as-is
   5. FOLLOW UI design standards exactly
   6. MAINTAIN professional healthcare appearance
   
   ## When Encountering Issues
   1. Check documentation first
   2. Use existing schema structure
   3. Generate correct TypeScript types
   4. Do NOT create workarounds
   5. Ask for clarification if needed
   
   ## Forbidden Actions
   - Simplifying database schema
   - Creating basic/minimal versions
   - Ignoring brand colors
   - Using childish UI elements
   - Creating sidebar navigation in chat
   ```

5. **docs/DEMO_USERS.md**
   ```markdown
   # Demo Users - EXACT SPECIFICATIONS
   
   ## Authentication Users (Supabase Auth)
   1. sarah.johnson@demo.com (Patient - TKA Day 5 post-op)
   2. dr.chen@demo.com (Provider - Orthopedic Surgeon)
   3. admin@demo.com (Admin - Clinic Administrator)
   
   ## Patient Records
   Use auth.users.id as patients.id (direct linking)
   Create patient records that match auth users exactly
   ```

VALIDATION:
✅ All documentation files created
✅ Comprehensive project specifications documented
✅ Database schema rules clearly defined
✅ UI standards explicitly stated
✅ Development constraints documented
✅ Demo user specifications provided

Every time you perform actions related to the project, append your actions to docs/activity.md and read that file whenever you find it necessary to assist you.
```

---

## 🔒 STEP 2: STRICT FOLLOWING DIRECTIVE

### **After Documentation is Created:**

```
STRICT DOCUMENTATION FOLLOWING DIRECTIVE

Mode: healthcare-platform
Task: Implement strict adherence to project documentation

CRITICAL DIRECTIVE:
From this point forward, you MUST follow the project documentation exactly without deviation.

MANDATORY RULES:
1. **Read Documentation First**: Before any action, reference relevant docs/ files
2. **No Deviations**: Do not simplify, modify, or work around documented specifications
3. **Ask Before Changing**: If documentation seems unclear, ask for clarification
4. **Follow Constraints**: Respect all documented constraints and requirements
5. **Use Existing Schema**: Never modify or simplify the comprehensive database schema

DOCUMENTATION HIERARCHY:
1. docs/PROJECT_OVERVIEW.md - Overall project direction
2. docs/DATABASE_SCHEMA.md - Database structure (DO NOT MODIFY)
3. docs/UI_DESIGN_STANDARDS.md - Visual and interaction requirements
4. docs/DEVELOPMENT_RULES.md - What you can and cannot do
5. docs/DEMO_USERS.md - Exact user specifications

WHEN IN DOUBT:
- Reference documentation
- Follow existing patterns
- Do not simplify or create workarounds
- Maintain professional healthcare standards

FORBIDDEN ACTIONS:
- Simplifying database schema
- Creating "minimum field" versions
- Ignoring UI design standards
- Deviating from documented patterns

This directive ensures consistent, professional development that meets healthcare platform requirements.

Every time you perform actions related to the project, append your actions to docs/activity.md and read that file whenever you find it necessary to assist you.
```

---

## 🎯 WHY THIS SOLVES THE PROBLEM

### **Current Issue:**
- Roo Code makes decisions without context
- No project documentation to reference
- Keeps simplifying instead of following plan
- Goes "off the rails" frequently

### **Solution Benefits:**
- **Clear Documentation**: Comprehensive project specs within project
- **Strict Rules**: Explicit constraints and requirements
- **Reference Material**: Always available for Roo Code to check
- **Consistency**: Single source of truth for all decisions
- **Professional Standards**: Healthcare-appropriate requirements documented

---

## 🚀 IMPLEMENTATION ORDER

### **1. Create Documentation (30 minutes)**
Use the first prompt to create all docs/ files

### **2. Implement Strict Directive (5 minutes)**
Use the second prompt to enforce documentation following

### **3. Continue Development**
All future prompts will reference existing documentation

---

## ✅ EXPECTED OUTCOME

After implementing this:
- ✅ Roo Code has comprehensive project documentation
- ✅ Strict rules prevent deviation from plan
- ✅ Database schema protected from simplification
- ✅ UI standards consistently applied
- ✅ Professional healthcare platform maintained
- ✅ Development stays on track

**This creates the foundation for consistent, professional development that follows our healthcare platform requirements!**

