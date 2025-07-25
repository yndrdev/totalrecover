# CORE FEATURES REBUILD STRATEGY

## SITUATION ASSESSMENT & REBUILD PLAN

The TJV Recovery platform is deployed but core features (chat, forms, authentication) are broken or misaligned. Need systematic rebuild approach.

---

## ROO CODE vs CLAUDE CODE DECISION

### **🎯 RECOMMENDATION: Use ROO CODE for This Rebuild**

#### **Why Roo Code is Better for This Situation:**
- **Codebase Indexing**: Can understand the entire project structure and existing code
- **Systematic Approach**: Better for large-scale feature rebuilds
- **Context Awareness**: Understands relationships between components
- **Architectural Understanding**: Can see how features should connect
- **Consistent Implementation**: Maintains patterns across the rebuild

#### **When to Use Claude Code:**
- **Specific Bug Fixes**: Individual syntax errors or small issues
- **Targeted Problems**: Single component fixes
- **Quick Debugging**: Isolated problem solving

#### **For This Rebuild: Roo Code is the Right Choice**
- **Large Scope**: Multiple interconnected features need rebuilding
- **Architectural Work**: Need to understand and fix system relationships
- **Consistency**: Ensure all features work together properly
- **Healthcare Standards**: Maintain HIPAA compliance and security throughout

---

## CRITICAL ISSUES ASSESSMENT

### **🚨 Priority 1: Authentication (Can't Log In)**
```
AUTHENTICATION REBUILD PRIORITY

ISSUE: Cannot log in to deployed application
IMPACT: Complete system inaccessible
URGENCY: Critical - blocks all testing and usage

LIKELY CAUSES:
- Supabase authentication configuration broken
- Environment variables missing or incorrect
- Auth routes not working properly
- Session management broken
- Redirect URLs misconfigured

REBUILD APPROACH:
1. Verify Supabase connection and configuration
2. Rebuild authentication components from scratch
3. Test login/logout flow thoroughly
4. Ensure proper session management
5. Verify all auth routes work correctly
```

### **🔧 Priority 2: Chat Interface (Core Feature)**
```
CHAT INTERFACE REBUILD PRIORITY

ISSUE: Chat features mixed up or not working
IMPACT: Core patient experience broken
URGENCY: High - essential for platform functionality

LIKELY CAUSES:
- Chat components not following conversational design
- AI integration broken or misconfigured
- Real-time messaging not working
- Voice input functionality broken
- Message flow not following specifications

REBUILD APPROACH:
1. Rebuild chat interface following original specifications
2. Ensure AI-first conversational flow
3. Implement proper real-time messaging
4. Add voice input functionality
5. Test complete chat experience
```

### **⚕️ Priority 3: Preoperative Forms (Healthcare Critical)**
```
PREOPERATIVE FORMS REBUILD PRIORITY

ISSUE: Forms have weird sections, not conversational
IMPACT: Healthcare workflow broken
URGENCY: High - affects patient care

LIKELY CAUSES:
- Forms not delivered conversationally through chat
- Traditional form UI instead of chat-based
- Form builder creating wrong format
- Questions not following "Do you smoke? Yes/No" pattern
- Form flow not integrated with chat interface

REBUILD APPROACH:
1. Rebuild forms to be delivered through chat
2. Ensure conversational question format
3. Remove traditional form sections
4. Integrate with chat interface properly
5. Test complete form completion flow
```

---

## SYSTEMATIC REBUILD PROMPTS FOR ROO CODE

### **🔐 PHASE 1: AUTHENTICATION REBUILD**

```
AUTHENTICATION SYSTEM REBUILD

Mode: healthcare-platform
Task: Completely rebuild authentication system to work correctly

CURRENT PROBLEM:
- Cannot log in to deployed Vercel application
- Authentication system appears broken
- Need complete rebuild of auth functionality

REBUILD REQUIREMENTS:

1. SUPABASE AUTHENTICATION SETUP:
   - Verify Supabase project connection
   - Check environment variables are correct
   - Ensure auth configuration is proper
   - Test database connectivity

2. AUTH COMPONENTS REBUILD:
   - Create clean login page component
   - Build registration functionality
   - Implement password reset flow
   - Add proper error handling

3. SESSION MANAGEMENT:
   - Implement proper session handling
   - Add session persistence
   - Create auth state management
   - Add logout functionality

4. ROUTE PROTECTION:
   - Rebuild middleware for route protection
   - Create auth callback routes
   - Implement proper redirects
   - Add role-based access control

5. MULTI-TENANT SETUP:
   - Ensure proper tenant isolation
   - Implement RLS policies
   - Add user role management
   - Test cross-tenant security

TESTING REQUIREMENTS:
- Login works for all user types (patient, provider, admin)
- Registration creates users properly
- Password reset functions correctly
- Session persists across page refreshes
- Logout clears session completely
- Route protection works as expected

EXPECTED OUTCOME:
- Working login system on deployed Vercel app
- All user types can authenticate successfully
- Proper session management and security
- Foundation for rebuilding other features

Please start with authentication as it blocks all other testing.
```

### **💬 PHASE 2: CHAT INTERFACE REBUILD**

```
CHAT INTERFACE COMPLETE REBUILD

Mode: chat-specialist
Task: Rebuild chat interface following original TJV Recovery specifications

CURRENT PROBLEM:
- Chat features are mixed up or not working correctly
- Not following conversational design principles
- Core patient experience is broken

REBUILD SPECIFICATIONS:

1. CONVERSATIONAL DESIGN:
   - AI speaks first, always
   - No sidebar navigation
   - Clean, professional chat interface
   - Mobile-optimized for patients 40+
   - Brand colors: #002238, #006DB1, #C8DBE9, #FFFFFF

2. CHAT FUNCTIONALITY:
   - Real-time messaging with WebSocket/SSE
   - Message history persistence
   - Proper message threading
   - Typing indicators
   - Message status (sent, delivered, read)

3. VOICE INTEGRATION:
   - OpenAI Whisper for voice-to-text
   - Voice recording with visual feedback
   - Voice message playback
   - Seamless voice/text switching

4. AI INTEGRATION:
   - OpenAI GPT-4 for responses
   - Context-aware conversations
   - Healthcare-appropriate responses
   - Patient recovery guidance

5. FORM INTEGRATION:
   - Forms delivered through chat interface
   - Conversational question format
   - No traditional form fields
   - Natural conversation flow

TESTING REQUIREMENTS:
- Chat interface loads and works smoothly
- AI responds appropriately to patient messages
- Voice input records and transcribes correctly
- Real-time messaging functions properly
- Mobile experience is optimized
- Forms appear as natural conversation

EXPECTED OUTCOME:
- Professional, conversational chat interface
- Seamless patient experience
- Working voice and text input
- Foundation for form delivery system

This is the core patient experience - must work perfectly.
```

### **📋 PHASE 3: PREOPERATIVE FORMS REBUILD**

```
PREOPERATIVE FORMS CONVERSATIONAL REBUILD

Mode: healthcare-platform
Task: Rebuild preoperative forms to be delivered conversationally through chat

CURRENT PROBLEM:
- Preoperative forms have weird sections
- Not delivered conversationally
- Traditional form UI instead of chat-based
- Not following healthcare workflow specifications

REBUILD SPECIFICATIONS:

1. CONVERSATIONAL DELIVERY:
   - All forms delivered through chat interface
   - AI asks questions one at a time
   - Direct questions: "Do you smoke? Yes or No"
   - No "Are you ready?" confirmations
   - Natural conversation flow

2. PREOPERATIVE FORM CONTENT:
   - Medical history questions
   - Current medications
   - Allergies and reactions
   - Previous surgeries
   - Current symptoms
   - Consent acknowledgments

3. QUESTION FORMAT:
   - Direct, clear questions
   - Simple response options
   - Voice input supported
   - Progress tracking
   - Ability to go back and modify

4. DATA HANDLING:
   - HIPAA-compliant data storage
   - Proper encryption
   - Multi-tenant isolation
   - Audit logging
   - Provider access to responses

5. INTEGRATION:
   - Seamless with chat interface
   - Provider can assign forms to patients
   - Real-time completion tracking
   - Automated reminders
   - Progress notifications

TESTING REQUIREMENTS:
- Forms appear as natural chat conversation
- Questions are clear and direct
- Voice input works for all questions
- Data saves correctly and securely
- Providers can view completed forms
- HIPAA compliance maintained

EXPECTED OUTCOME:
- Natural, conversational form completion
- Professional healthcare experience
- Proper data collection and storage
- Seamless integration with chat interface

This is critical for healthcare workflow - must be professional and compliant.
```

### **🏥 PHASE 4: PROVIDER INTERFACE REBUILD**

```
PROVIDER INTERFACE REBUILD

Mode: healthcare-platform
Task: Rebuild provider dashboard and patient management interface

CURRENT PROBLEM:
- Provider interface may be broken or misaligned
- Need clean, professional healthcare provider experience

REBUILD SPECIFICATIONS:

1. PROVIDER DASHBOARD:
   - Clean, professional design
   - Patient list with status indicators
   - Real-time patient activity monitoring
   - Search and filtering capabilities
   - No sidebar clutter (as specified)

2. PATIENT DETAIL PAGES:
   - Individual patient monitoring
   - Real-time chat monitoring
   - Form completion status
   - Progress analytics
   - Intervention tools

3. CONTENT MANAGEMENT:
   - Simple form creation and assignment
   - Exercise video upload and management
   - Task assignment to patients
   - Protocol builder functionality

4. REAL-TIME FEATURES:
   - Live patient chat monitoring
   - Instant notifications for patient issues
   - Real-time intervention capabilities
   - Progress tracking updates

5. NURSE INTERVENTION SYSTEM:
   - Alert system for patient issues
   - Exercise modification tools
   - Real-time chat intervention
   - Progress monitoring and reporting

TESTING REQUIREMENTS:
- Provider can log in and access dashboard
- Patient list displays correctly
- Real-time monitoring works
- Content creation and assignment functional
- Intervention tools accessible and working

EXPECTED OUTCOME:
- Professional provider experience
- Efficient patient management
- Real-time monitoring capabilities
- Complete healthcare workflow support

This ensures providers can effectively manage patient care.
```

---

## REBUILD EXECUTION STRATEGY

### **🎯 Execution Order (Critical Path)**

#### **Week 1: Foundation**
1. **Day 1-2**: Authentication rebuild (Priority 1)
2. **Day 3-4**: Basic chat interface (Priority 2)
3. **Day 5**: Initial testing and bug fixes

#### **Week 2: Core Features**
1. **Day 1-2**: Complete chat functionality
2. **Day 3-4**: Preoperative forms rebuild
3. **Day 5**: Integration testing

#### **Week 3: Provider Interface**
1. **Day 1-2**: Provider dashboard rebuild
2. **Day 3-4**: Patient management features
3. **Day 5**: End-to-end testing

### **🔧 Roo Code Configuration for Rebuild**

#### **Custom Mode for Rebuild:**
```yaml
slug: "system-rebuild"
name: "System Rebuild Specialist"
description: "Rebuilds core healthcare platform features systematically"
roleDefinition: |
  You are a senior healthcare platform architect specializing in rebuilding
  complex systems. You understand the TJV Recovery platform requirements
  and can systematically rebuild features to work correctly together.
  
  REBUILD PRINCIPLES:
  - Follow original specifications exactly
  - Ensure HIPAA compliance throughout
  - Maintain security and multi-tenant isolation
  - Create clean, professional healthcare interfaces
  - Test thoroughly at each step
  
groups: ["read", "edit", "execute", "browser"]
customInstructions: |
  Before rebuilding any feature:
  1. Use codebase_search to understand current implementation
  2. Reference original specifications and requirements
  3. Build systematically, testing each component
  4. Ensure integration with other features
  5. Maintain healthcare compliance and security standards
```

### **🧪 Testing Strategy**

#### **After Each Phase:**
```
PHASE TESTING CHECKLIST

AUTHENTICATION TESTING:
- [ ] Can log in as patient, provider, admin
- [ ] Session persists across page refreshes
- [ ] Logout works correctly
- [ ] Password reset functional
- [ ] Multi-tenant isolation working

CHAT TESTING:
- [ ] Chat interface loads and works
- [ ] AI responds appropriately
- [ ] Voice input functions correctly
- [ ] Real-time messaging works
- [ ] Mobile experience optimized

FORMS TESTING:
- [ ] Forms delivered conversationally
- [ ] Questions are direct and clear
- [ ] Voice input works for responses
- [ ] Data saves correctly
- [ ] Provider can view responses

PROVIDER TESTING:
- [ ] Dashboard displays patient data
- [ ] Real-time monitoring works
- [ ] Content creation functional
- [ ] Intervention tools accessible
- [ ] Analytics and reporting working
```

---

## SUCCESS CRITERIA

### **🎯 Rebuild Success Indicators**

#### **Technical Success:**
- All users can log in successfully
- Chat interface works smoothly
- Forms are delivered conversationally
- Provider interface is functional
- Real-time features operational

#### **User Experience Success:**
- Professional healthcare appearance
- Intuitive patient experience
- Efficient provider workflow
- Mobile-optimized interface
- Voice input works seamlessly

#### **Business Success:**
- Ready for partner testing
- HIPAA compliant and secure
- Scalable architecture
- Maintainable codebase
- Documentation complete

### **🚀 Deployment Strategy**

#### **Staged Rollout:**
1. **Staging Environment**: Test rebuilt features
2. **Limited Production**: Small user group testing
3. **Partner Testing**: Healthcare partner validation
4. **Full Production**: Complete rollout

This systematic approach will get your TJV Recovery platform back on track with properly functioning core features!

