# Development Rules - MANDATORY COMPLIANCE

## CRITICAL DIRECTIVES

### **1. DOCUMENTATION FIRST**
- Read ALL documentation in `/docs/` before writing ANY code
- Follow specifications exactly as documented
- No assumptions, no shortcuts, no simplifications

### **2. DATABASE SCHEMA**
- Use existing comprehensive schema EXACTLY as provided
- DO NOT simplify or modify table structures
- DO NOT create "basic" or "minimum" versions
- Follow multi-tenant architecture with RLS policies

### **3. UI/UX STANDARDS**
- Professional healthcare design for adults 40+
- Use brand colors: #002238, #006DB1, #C8DBE9, #FFFFFF
- shadcn/ui components with Tailwind CSS
- Mobile-responsive design
- NO childish or educational app styling

### **4. CHAT INTERFACE**
- AI speaks first (conversational-form approach)
- Direct questions: "Do you smoke? Yes or No"
- No "Are you ready?" prompts
- Natural conversation flow
- Voice input integration

### **5. NURSE INTERVENTION**
- All interventions happen within Patient Detail Page
- Real-time monitoring and alerts
- Exercise modification without page changes
- Professional clinical workflow

### **6. SECURITY & COMPLIANCE**
- HIPAA compliance throughout
- Multi-tenant isolation
- Row Level Security (RLS) policies
- Secure authentication and authorization

## FORBIDDEN ACTIONS
- ❌ Simplifying database schema
- ❌ Creating "basic" versions of features
- ❌ Ignoring documented specifications
- ❌ Using different UI components than specified
- ❌ Modifying comprehensive table structures
- ❌ Deviating from professional healthcare design