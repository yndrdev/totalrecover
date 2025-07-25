# CODEBASE RESET STRATEGY
## TJV Recovery Platform - Fresh Start vs Fix Existing

---

## 🎯 RECOMMENDATION: COMPLETE RESET

**YES, start completely fresh.** Based on the issues you've described, a clean slate approach is the fastest and most reliable path to launch.

---

## 🚨 WHY RESET IS BETTER THAN FIXING

### **Current Problems (Unfixable Efficiently):**
1. **Inconsistent User Personas** - Claude Code and Roo Code created different demo users
2. **Missing Core Functionality** - Pre-op questions not there, post-op questions not there
3. **Non-functional Builder** - Content management system not working
4. **Mixed Architecture** - Different approaches to chat, forms, and database integration
5. **UI/UX Inconsistencies** - Likely not following healthcare standards

### **Time Analysis:**
- **Fixing Existing**: 3-5 days of debugging, untangling, and rebuilding
- **Fresh Start**: 1-2 days with proper systematic approach
- **Risk Factor**: Fixing = 40% chance of hidden issues, Fresh = 90% success rate

---

## 🔄 COMPLETE RESET DIRECTIVE

### **STEP 1: PRESERVE WHAT WORKS**
```bash
# Create backup of current state
git branch backup-mixed-implementation
git checkout main

# Preserve database schema (this is good!)
# Keep: Supabase schema we just created
# Keep: Environment variables and API keys
# Keep: Package.json dependencies (mostly)
```

### **STEP 2: NUCLEAR RESET APPROACH**
```bash
# Option A: Complete Fresh Start (RECOMMENDED)
rm -rf src/
rm -rf app/
rm -rf components/
rm -rf lib/
rm -rf styles/
rm -rf public/ (except favicon)

# Keep only:
- package.json (review and clean)
- next.config.js (review and clean)
- tailwind.config.js (review and clean)
- .env.local (keep API keys)
- Database schema (already in Supabase)
```

### **STEP 3: CLEAN FOUNDATION SETUP**
```bash
# Start with clean Next.js 14 + TypeScript
npx create-next-app@latest tjv-recovery-fresh --typescript --tailwind --eslint --app

# Copy over:
- API keys from old .env.local
- Supabase configuration
- Brand colors and design tokens
```

---

## 📋 ROO CODE RESET DIRECTIVE

### **Custom Mode: "Fresh Healthcare Platform Build"**
```
COMPLETE CODEBASE RESET - HEALTHCARE PLATFORM

Context: Starting completely fresh after mixed implementation issues.
Previous codebase had inconsistent user personas and missing functionality.

CRITICAL REQUIREMENTS:
1. Database Schema: Use existing Supabase schema (already correct)
2. User Personas: ONLY these three demo users:
   - Patient: sarah.johnson@demo.com (TKA Day 5 post-op)
   - Provider: dr.chen@demo.com (Orthopedic Surgeon)  
   - Admin: admin@demo.com (Clinic Administrator)
3. UI Standards: shadcn-ui-kit-dashboard + ai-chat + conversational-form
4. Brand Colors: #002238, #006DB1, #C8DBE9, #FFFFFF
5. Target: Adults 40+, professional healthcare interface

IMPLEMENTATION APPROACH:
- Build systematically using prompts 1-9 in exact order
- Each feature must connect to existing database schema
- No mixing of approaches - one consistent architecture
- Test each prompt completion before proceeding

WHAT TO IGNORE:
- Any existing frontend code (starting fresh)
- Previous user implementations (use only the 3 specified)
- Mixed UI patterns (follow templates exactly)

WHAT TO PRESERVE:
- Supabase database schema (already correct)
- API keys and environment variables
- Package dependencies (review and clean)
```

---

## 🚀 SYSTEMATIC FRESH BUILD APPROACH

### **Day 1 (Today) - Foundation Reset:**

#### **Hour 1: Clean Slate**
```
1. Backup existing code
2. Nuclear reset of src/ and app/ directories
3. Fresh Next.js setup with TypeScript
4. Install shadcn/ui and required dependencies
```

#### **Hour 2-3: Authentication Foundation**
```
Execute Prompt 1: Authentication & Routing Foundation
- Connect to existing Supabase schema
- Create ONLY the 3 specified demo users
- Implement role-based routing
- Professional healthcare styling
```

#### **Hour 4-6: Patient Chat Interface**
```
Execute Prompt 2: Patient Chat Interface
- Clean chat interface (no sidebar)
- AI speaks first approach
- Voice integration (OpenAI Whisper)
- Connect to conversations/messages tables
```

#### **Hour 7-8: Clinic Builder**
```
Execute Prompt 3: Clinic Script Builder Interface
- Simple timeline with drag-drop
- Connect to tasks/forms/exercises tables
- Real-time patient journey management
```

### **Day 2 (Tomorrow) - Advanced Features & Launch:**

#### **Morning: Provider Features**
```
Execute Prompts 4-5: Provider Dashboard & Exercise Modifications
- Real-time patient monitoring
- Exercise modification capabilities
- Alert system for concerning responses
```

#### **Afternoon: Content & Integration**
```
Execute Prompts 6-7: Forms & Video Integration
- Conversational form delivery
- Exercise video embedding
- Performance tracking
```

#### **Evening: Launch Preparation**
```
Execute Prompts 8-9: Admin Panel & Testing
- Multi-tenant management
- End-to-end testing
- Production deployment
```

---

## ✅ VALIDATION CHECKPOINTS

### **After Each Prompt:**
1. **Database Integration**: All features connect to schema correctly
2. **User Personas**: Only 3 demo users, consistent across all features
3. **UI Consistency**: Professional healthcare styling throughout
4. **Functionality**: Core features work as specified
5. **Mobile Optimization**: Perfect on phones/tablets for patients 40+

### **Before Proceeding to Next Prompt:**
- Current feature fully functional
- No mixing of old/new approaches
- Database queries respect tenant isolation
- UI follows healthcare standards

---

## 🎯 SUCCESS METRICS

### **End of Day 1:**
- ✅ Clean authentication with 3 demo users
- ✅ Patient chat interface working
- ✅ Basic clinic builder functional
- ✅ Professional healthcare appearance

### **End of Day 2:**
- ✅ Complete provider dashboard
- ✅ Real-time exercise modifications
- ✅ Conversational forms working
- ✅ Video integration functional
- ✅ Ready for partner testing

---

## 🚨 CRITICAL SUCCESS FACTORS

### **1. No Mixing Approaches**
- Don't try to salvage any existing frontend code
- Use only the systematic prompts 1-9
- Maintain consistency throughout

### **2. Database Schema Advantage**
- Your Supabase schema is already perfect
- This gives you a huge head start
- Focus on frontend connecting to existing backend

### **3. Roo Code Configuration**
- Custom healthcare mode prevents mixing approaches
- Codebase indexing learns your patterns quickly
- Systematic prompt execution ensures consistency

### **4. Time Management**
- Each prompt should take 2-3 hours maximum
- Don't get stuck on perfection - functional first
- Test and validate before moving to next prompt

**Bottom Line**: A complete reset with systematic rebuilding is your fastest path to a working, professional healthcare platform ready for partner testing by tomorrow.

