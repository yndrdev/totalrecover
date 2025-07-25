# ROO CODE SETUP INSTRUCTIONS

## TWO APPROACHES: FILES vs INPUT BOX

You have two options for using Roo Code, but **creating files is MUCH more effective** for our healthcare platform project.

---

## OPTION 1: FILE-BASED SETUP (RECOMMENDED)

### **Why Files Are Better:**
- **Persistent Configuration**: Settings stay active across all sessions
- **Custom Modes**: Create specialized personas that remember their behavior
- **Automatic Loading**: Rules apply automatically without re-typing
- **Team Sharing**: Easy to share configurations with team members
- **Version Control**: Can be tracked in Git for consistency

### **Step-by-Step File Setup:**

#### **1. Create Custom Modes**
**Location**: Use Roo Code's Prompts tab interface

1. **Open Roo Code**: Click the Roo Code icon in VS Code
2. **Go to Prompts Tab**: Click the prompts icon in the top menu
3. **Create New Mode**: Click the "+" button next to "Modes"
4. **Configure Healthcare Platform Mode**:
   ```
   Name: Healthcare Platform Developer
   Slug: healthcare-platform
   Description: Specialized for HIPAA-compliant healthcare platform development
   
   Role Definition:
   You are a senior healthcare platform developer specializing in HIPAA-compliant applications.
   You build secure, scalable healthcare platforms using NextJS, Supabase, and TypeScript.
   You prioritize security, compliance, and user experience for medical professionals and patients.
   
   CRITICAL REQUIREMENTS:
   - All code must be production-ready and HIPAA-compliant
   - Multi-tenant architecture with Row Level Security (RLS)
   - Enterprise-grade UI using shadcn/ui components
   - Real-time features with WebSocket/SSE
   - Comprehensive error handling and validation
   
   Available Tools: Read, Edit, Execute, Browser
   ```

5. **Create UI Enhancement Mode**:
   ```
   Name: Enterprise UI Designer
   Slug: ui-enhancement
   Description: Creates premium, modern, enterprise-grade user interfaces
   
   Role Definition:
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
   
   Available Tools: Read, Edit
   ```

#### **2. Create Global Rules Directory**
**Location**: `~/.roo/rules/` (Linux/macOS) or `%USERPROFILE%\.roo\rules\` (Windows)

**Create these files:**

**`~/.roo/rules/01-healthcare-standards.md`:**
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

**`~/.roo/rules/02-ui-standards.md`:**
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

#### **3. Create Project-Specific Rules**
**Location**: In your TJV Recovery project root: `.roo/rules/`

**Create these files:**

**`.roo/rules/tjv-specific-requirements.md`:**
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

**`.roo/rules/chat-interface-rules.md`:**
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

#### **4. How to Use After Setup**
Once files are created:

1. **Select Mode**: Choose "Healthcare Platform Developer" or "UI Enhancement" mode
2. **Simple Prompts**: Your prompts can be much shorter because context is already loaded
3. **Example Usage**:
   ```
   Improve the patient chat interface styling to be more premium and enterprise-grade.
   Focus on the message bubbles and input field.
   ```

---

## OPTION 2: INPUT BOX APPROACH (LESS EFFECTIVE)

### **How It Works:**
- Paste the entire prompt with context into Roo Code's input box
- Need to re-type context every time
- No persistent configuration

### **Example Input Box Prompt:**
```
CONTEXT: You are working on the TJV Recovery healthcare platform.
You are a senior healthcare platform developer specializing in HIPAA-compliant applications.
You build secure, scalable healthcare platforms using NextJS, Supabase, and TypeScript.

REQUIREMENTS:
- All code must be production-ready and HIPAA-compliant
- Multi-tenant architecture with Row Level Security (RLS)
- Enterprise-grade UI using shadcn/ui components
- Brand colors: #002238, #006DB1, #C8DBE9, #FFFFFF
- Target audience: Healthcare professionals and patients 40+

SPECIFIC TASK:
Improve the patient chat interface styling to be more premium and enterprise-grade.
Focus on the message bubbles and input field.

CONSTRAINTS:
- Do not change functionality
- Maintain accessibility
- Keep mobile responsiveness
```

### **Disadvantages:**
- Must re-type context every time
- No persistent memory between sessions
- Longer prompts required
- Easy to forget important context
- Harder to maintain consistency

---

## RECOMMENDED WORKFLOW

### **Initial Setup (One Time):**
1. Create custom modes in Roo Code interface
2. Set up global rules directory
3. Create project-specific rules
4. Test with simple prompt

### **Daily Usage:**
1. **Select appropriate mode** (Healthcare Platform or UI Enhancement)
2. **Use short, specific prompts** like:
   - "Modernize the chat input field styling"
   - "Fix the mobile responsiveness on the provider dashboard"
   - "Add enterprise-grade styling to the patient cards"

### **Benefits:**
- **Consistent Quality**: Rules ensure all code meets standards
- **Faster Development**: No need to re-explain context
- **Team Alignment**: Everyone uses same standards
- **Better Results**: AI has full context automatically

---

## QUICK START COMMANDS

### **Create Global Rules Directory:**
```bash
# Linux/macOS
mkdir -p ~/.roo/rules

# Windows
mkdir %USERPROFILE%\.roo\rules
```

### **Create Project Rules Directory:**
```bash
# In your TJV Recovery project root
mkdir -p .roo/rules
```

### **Test Setup:**
After creating files, test with this simple prompt:
```
Mode: healthcare-platform
Task: Show me the current chat interface component and suggest one small improvement.
```

If setup is correct, Roo Code should understand the healthcare context, brand colors, and requirements without you having to explain them again.

---

## SUMMARY

**✅ RECOMMENDED**: Create files for persistent, powerful configuration
**❌ NOT RECOMMENDED**: Input box approach for complex projects

The file-based approach will give you much better results with less effort once it's set up!

