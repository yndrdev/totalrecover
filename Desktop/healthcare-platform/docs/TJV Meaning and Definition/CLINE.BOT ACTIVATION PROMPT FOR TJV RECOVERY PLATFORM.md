# CLINE.BOT ACTIVATION PROMPT FOR TJV RECOVERY PLATFORM

## 🎯 MASTER ACTIVATION PROMPT

Copy and paste this prompt to Cline.bot to activate all rules and context:

---

**DO NOT BE LAZY. DO NOT OMIT CODE. Follow all project rules in .clinerules, .clineworkflows, and .clineignore.**

You are working on the **TJV Recovery Platform**, a professional healthcare application for Total Joint Replacement recovery. This is enterprise medical software that must maintain the highest standards of professionalism, security, and clinical workflow compliance.

## 🏥 PROJECT CONTEXT

**CRITICAL UNDERSTANDING:**
- This is a **professional healthcare platform** serving real patients and healthcare providers
- **HIPAA compliance** and **patient safety** are non-negotiable priorities
- **Multi-tenant architecture** with complete data isolation between practices
- **Evidence-based clinical protocols** for TJV recovery (Day -45 to Day +200)
- **Real-time care coordination** between surgeons, nurses, physical therapists, and patients

## 🚨 ABSOLUTE PROTECTION RULES

**NEVER DELETE OR MODIFY:**
- Environment variables (.env files, SUPABASE_URL, SUPABASE_ANON_KEY, OPENAI_API_KEY)
- API keys, database connection strings, or authentication configurations
- Existing Supabase table structures, relationships, or foreign keys
- Working authentication flows, session management, or RLS policies
- Multi-tenant architecture or healthcare compliance features

**NEVER SIMPLIFY OR REMOVE:**
- Professional healthcare UI appearance and styling standards
- User role system (super_admin, practice_admin, surgeon, nurse, physical_therapist, patient)
- Complex database relationships and audit logging requirements
- Real-time features, Supabase subscriptions, or notification systems

## 🎨 MANUS-STYLE UI REQUIREMENTS

**DESIGN STANDARDS:**
- **Main content areas**: 800px max-width, centered layout
- **Sidebars**: 280px width with professional healthcare styling
- **Colors**: Primary #2563eb (blue), Secondary #10b981 (green), clean whites/grays
- **Professional appearance**: Enterprise medical software styling, never consumer-app appearance
- **Responsive design**: Desktop-first with mobile considerations
- **Accessibility**: WCAG 2.1 AA compliance for medical software

**CHAT INTERFACE REQUIREMENTS:**
- **280px sidebar** with day navigation (Day -45 to current recovery day)
- **Smart task indicators**: Green checkmarks (completed), red warnings (missed), blue dots (pending)
- **Clickable day navigation** to view historical conversations
- **Profile images** for patients and providers with professional circular avatars
- **Auto-scroll** to latest messages and **auto-focus** input field
- **Missed task recovery** with "Complete Now" buttons for overdue items

## 📊 COMPREHENSIVE FEATURE REQUIREMENTS

**PATIENT CHAT SYSTEM:**
- Manus-style sidebar with recovery timeline navigation
- Real-time messaging with AI integration (OpenAI GPT-4)
- Historical chat access for all previous recovery days
- Task completion tracking with visual indicators
- Provider profile integration and care team coordination

**PROVIDER DASHBOARD:**
- Multi-level access (Practice Admin, Clinic Admin, Individual Providers)
- Comprehensive patient list with search, filter, and sort capabilities
- Real-time patient monitoring and intervention tools
- Care team communication and coordination features

**PROTOCOL BUILDER SYSTEM:**
- Practice-level protocol creation with drag-and-drop timeline interface
- Evidence-based templates for TKA and THA recovery protocols
- Task library (exercises, forms, educational content, assessments)
- Conditional logic and frequency controls for task assignment

**INDIVIDUAL PATIENT MANAGEMENT:**
- Comprehensive patient detail pages with full recovery overview
- Real-time protocol editing and customization for individual patients
- Task modification capabilities with clinical decision support
- Progress tracking and milestone achievement monitoring

**NOTIFICATION AND ALERT SYSTEM:**
- Patient notifications for missed tasks with escalating urgency
- Provider alerts for concerning patient progress or compliance issues
- Care team coordination notifications and emergency escalation
- Progress celebrations and milestone achievement recognition

## 🔧 TECHNICAL IMPLEMENTATION STANDARDS

**DEVELOPMENT REQUIREMENTS:**
- **TypeScript**: Full TypeScript implementation with proper type definitions
- **Next.js/React**: Modern React patterns with proper state management
- **Supabase Integration**: Real-time subscriptions, RLS policies, audit logging
- **Error Handling**: Comprehensive error handling and loading states
- **Testing**: Test with real Supabase data across all user roles

**FEATURE MODULARITY:**
- All features must be **modular and configurable** through JSON configuration files
- Each feature must have its own directory under `/features/` with config.json
- All UI elements (colors, dimensions, text) must be configurable
- All behavior (API settings, thresholds, toggles) must be configurable
- Features must be toggleable (enable/disable) without breaking the app

**DATABASE OPERATIONS:**
- Use **read-only mode** when possible to prevent accidental data modification
- Always validate user permissions before data access
- Implement proper **multi-tenant data isolation**
- Add **audit logging** for all sensitive data operations
- Never modify existing schemas without explicit instruction

## 📋 DEVELOPMENT WORKFLOW

**BEFORE MAKING ANY CHANGES:**
1. **Read existing documentation** in /docs/ directory thoroughly
2. **Rate your confidence** (1-10) on understanding the requirements
3. **List all assumptions** and ask clarifying questions if needed
4. **Check existing code patterns** and maintain consistency

**WHEN IMPLEMENTING FEATURES:**
1. **Follow modular architecture** with proper feature directory structure
2. **Create configuration files** for all customizable aspects
3. **Use established UI patterns** and design system components
4. **Test with real data** across all user roles and scenarios
5. **Document all changes** and update relevant documentation

**QUALITY ASSURANCE:**
- Test all authentication flows and role-based access control
- Verify multi-tenant data isolation works correctly
- Ensure professional healthcare appearance is maintained
- Validate real-time features and Supabase subscriptions
- Test responsive design across multiple screen sizes

## 🎯 SUCCESS CRITERIA

**EVERY CHANGE MUST:**
- Maintain professional healthcare platform appearance
- Work seamlessly with real Supabase database data
- Preserve existing authentication and session management
- Follow established design patterns and component library
- Include comprehensive error handling and user feedback
- Support all user roles (patient, surgeon, nurse, PT, admin)
- Maintain healthcare compliance and clinical workflow integrity

## 📚 REFERENCE DOCUMENTATION

**Available Documentation:**
- `/docs/features/feature-editing-system.md` - Modular feature architecture
- `/docs/features/comprehensive-tjv-feature-documentation.md` - Complete feature specifications
- `/docs/development/cline-feature-management-rules.md` - Development standards
- `/docs/setup/cline-installation-instructions.md` - Setup and configuration

**Use Context7 for Current Documentation:**
Add "use context7" to your prompts when you need up-to-date documentation for:
- Supabase features and best practices
- Next.js and React patterns
- TypeScript implementation details
- Healthcare software development standards

## 🚀 IMMEDIATE PRIORITIES

**CURRENT FOCUS:**
- Connect existing code to real Supabase database data
- Implement Manus-style chat interface with 280px sidebar
- Add smart task indicators and day navigation functionality
- Ensure all features work with real patient and provider data
- Maintain professional healthcare appearance throughout

**CONFIDENCE CHECK:**
Rate your confidence (1-10) on understanding these requirements and ask any clarifying questions before proceeding. Remember: This is professional healthcare software that directly impacts patient recovery outcomes and provider efficiency.

**READY TO BUILD:** Follow all rules in .clinerules and .clineworkflows. Create modular, configurable features that maintain the highest standards of healthcare software development.

---

## 🎯 ACTIVATION CHECKLIST

After using this prompt, verify Cline understands by asking:

1. **"What type of platform are we building and what are the critical requirements?"**
2. **"What UI standards should I follow for the chat interface?"**
3. **"How should I handle database operations and patient data?"**
4. **"What's the proper workflow for adding new features?"**
5. **"What are the absolute protection rules I must never violate?"**

**If Cline demonstrates understanding of healthcare requirements, Manus-style design, database protection, and feature modularity, you're ready to proceed with development!**

