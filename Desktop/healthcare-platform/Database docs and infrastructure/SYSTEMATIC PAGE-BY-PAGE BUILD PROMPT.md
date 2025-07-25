# SYSTEMATIC PAGE-BY-PAGE BUILD PROMPT

## MANDATORY DOCUMENTATION TRACKING
**CRITICAL:** Every time you perform actions related to this project, append your actions to `docs/activity.md` and read that file whenever you find it necessary to assist you. Please include every prompt I give.

---

## FOUNDATION-FIRST BUILD APPROACH

You MUST build this healthcare platform systematically, page by page, with routing and security as the foundation. NO shortcuts, NO skipping steps.

### PHASE 1: ROUTING & SECURITY FOUNDATION

#### ✅ **STEP 1: SUPABASE INTEGRATION SETUP**
**Build and verify BEFORE proceeding:**

1. **Supabase Client Configuration**
   ```typescript
   // Must implement proper client setup
   - Environment variables properly configured
   - Row Level Security (RLS) enabled
   - Multi-tenant isolation working
   - Authentication client properly initialized
   ```

2. **Database Schema Implementation**
   ```sql
   -- Verify ALL tables exist with proper RLS policies
   - tenants table with proper isolation
   - users table with role-based access
   - patients table with tenant_id foreign key
   - conversations table with proper security
   - messages table with encryption
   - All RLS policies active and tested
   ```

3. **Security Middleware Setup**
   ```typescript
   // Implement ALL security headers and middleware
   - CORS properly configured
   - Rate limiting implemented
   - Security headers (CSP, HSTS, etc.)
   - Request validation middleware
   - Error handling without data leaks
   ```

**VERIFICATION REQUIRED:** Test multi-tenant isolation with 2+ test tenants before proceeding.

#### ✅ **STEP 2: AUTHENTICATION ROUTING**
**Build and verify each route:**

1. **Login Page (`/login`)**
   - Supabase Auth integration
   - Multi-tenant subdomain handling
   - Role-based redirect logic
   - Security validation
   - Error handling

2. **Registration Page (`/register`)**
   - Tenant creation for new practices
   - User role assignment
   - Email verification flow
   - Security validation

3. **Password Reset (`/reset-password`)**
   - Secure password reset flow
   - Email verification
   - Security validation

**VERIFICATION REQUIRED:** Test each auth route with multiple user roles before proceeding.

#### ✅ **STEP 3: ROLE-BASED ROUTING STRUCTURE**
**Implement and verify routing for each user type:**

1. **Patient Routes (`/patient/*`)**
   ```
   /patient/dashboard - Main chat interface
   /patient/profile - Patient profile management
   /patient/progress - Progress tracking view
   /patient/exercises - Exercise library access
   ```

2. **Provider Routes (`/provider/*`)**
   ```
   /provider/dashboard - Provider overview
   /provider/patients - Patient list and management
   /provider/patients/[id] - Individual patient detail
   /provider/protocols - Protocol management
   /provider/content - Content library management
   ```

3. **Admin Routes (`/admin/*`)**
   ```
   /admin/dashboard - Practice administration
   /admin/users - User management
   /admin/settings - Practice settings
   /admin/analytics - Practice analytics
   ```

**VERIFICATION REQUIRED:** Test route protection and role-based access for each route.

---

### PHASE 2: PAGE-BY-PAGE IMPLEMENTATION

#### ✅ **PAGE 1: PATIENT CHAT INTERFACE (`/patient/dashboard`)**

**Build Order:**
1. **Basic Layout Structure**
   - No sidebar (as specified)
   - Header with profile in top right
   - Chat container with proper styling
   - Input area with voice button
   - Tertiary buttons below input

2. **Real-time Chat Foundation**
   - Supabase realtime subscription
   - Message sending/receiving
   - Proper tenant isolation
   - Message encryption

3. **AI Integration**
   - OpenAI GPT-4 integration
   - Context-aware responses
   - Conversation memory

4. **Voice Integration**
   - OpenAI Whisper integration
   - Voice input button
   - Recording feedback
   - Transcription display

**SECURITY CHECKS:**
- [ ] All messages encrypted in database
- [ ] Tenant isolation verified
- [ ] No data leaks between patients
- [ ] Voice data properly handled
- [ ] API keys secured

**VERIFICATION:** Test with 3 different patients from different tenants.

#### ✅ **PAGE 2: PROVIDER DASHBOARD (`/provider/dashboard`)**

**Build Order:**
1. **Dashboard Layout**
   - Clean design (no sidebar clutter)
   - Patient overview cards
   - Alert notifications
   - Quick action buttons

2. **Patient List Integration**
   - Supabase query with tenant filtering
   - Real-time patient status
   - Search and filter functionality
   - Proper pagination

3. **Alert System**
   - Real-time patient alerts
   - Notification routing
   - Alert prioritization

**SECURITY CHECKS:**
- [ ] Provider can only see their tenant's patients
- [ ] Patient data properly filtered
- [ ] No cross-tenant data leaks
- [ ] Alert system secure

**VERIFICATION:** Test with multiple providers from different tenants.

#### ✅ **PAGE 3: PATIENT DETAIL PAGE (`/provider/patients/[id]`)**

**Build Order:**
1. **Patient Information Display**
   - Complete patient profile
   - Surgery information
   - Current recovery status
   - Progress tracking

2. **Live Chat Monitor**
   - Real-time chat viewing
   - Patient conversation history
   - Intervention capabilities

3. **Intervention Tools**
   - Exercise modification interface
   - Real-time chat injection
   - Protocol adjustment tools

**SECURITY CHECKS:**
- [ ] Provider can only access their patients
- [ ] Patient data properly secured
- [ ] Intervention logging for audit
- [ ] Real-time updates secure

**VERIFICATION:** Test nurse intervention workflow completely.

#### ✅ **PAGE 4: CONTENT MANAGEMENT (`/provider/content`)**

**Build Order:**
1. **Upload Interface**
   - Simple drag-and-drop for forms/videos
   - File validation and security
   - Metadata management
   - Storage integration

2. **Assignment System**
   - Patient/protocol assignment
   - Scheduling configuration
   - Delivery tracking

3. **Library Management**
   - Content organization
   - Search and filter
   - Version control

**SECURITY CHECKS:**
- [ ] File upload validation
- [ ] Malware scanning
- [ ] Proper file permissions
- [ ] Tenant isolation for content

**VERIFICATION:** Test content upload and assignment workflow.

---

### PHASE 3: INTEGRATION & TESTING

#### ✅ **INTEGRATION TESTING**
**Test each integration point:**

1. **Chat ↔ Exercise System**
   - Exercise delivery through chat
   - Video playback in chat
   - Completion tracking

2. **Chat ↔ Form System**
   - Form delivery through chat
   - Conversational form completion
   - Data collection and storage

3. **Provider ↔ Patient Systems**
   - Real-time monitoring
   - Intervention capabilities
   - Data synchronization

#### ✅ **SECURITY TESTING**
**Comprehensive security verification:**

1. **Multi-Tenant Isolation**
   - Test with 3+ different tenants
   - Verify no data cross-contamination
   - Test all user roles and permissions

2. **Data Protection**
   - Verify encryption at rest and in transit
   - Test API security
   - Verify HIPAA compliance measures

3. **Authentication & Authorization**
   - Test all auth flows
   - Verify role-based access
   - Test session management

#### ✅ **PERFORMANCE TESTING**
**Verify system performance:**

1. **Real-time Features**
   - Chat message delivery speed
   - Real-time updates performance
   - WebSocket connection stability

2. **Database Performance**
   - Query optimization
   - Index effectiveness
   - Connection pooling

3. **Mobile Performance**
   - Mobile responsiveness
   - Touch interactions
   - Voice input performance

---

## MANDATORY CHECKPOINTS

### **CHECKPOINT 1: Foundation Complete**
**Before building any features, verify:**
- [ ] Supabase properly configured
- [ ] All database tables created with RLS
- [ ] Authentication working for all roles
- [ ] Routing protection implemented
- [ ] Security middleware active
- [ ] Multi-tenant isolation tested

### **CHECKPOINT 2: Each Page Complete**
**Before moving to next page, verify:**
- [ ] Page renders correctly on all devices
- [ ] All functionality works as specified
- [ ] Security checks pass
- [ ] Integration points tested
- [ ] Performance acceptable
- [ ] Documentation updated in `docs/activity.md`

### **CHECKPOINT 3: Integration Complete**
**Before deployment, verify:**
- [ ] All pages work together seamlessly
- [ ] Real-time features stable
- [ ] Security comprehensive
- [ ] Performance optimized
- [ ] HIPAA compliance verified

---

## FAILURE CONDITIONS - STOP IMMEDIATELY

**If ANY of these exist, STOP and fix:**
- ❌ Multi-tenant isolation not working
- ❌ Security vulnerabilities present
- ❌ Authentication bypassed
- ❌ Data leaks between tenants
- ❌ Real-time features not working
- ❌ Mobile experience broken
- ❌ Performance unacceptable

---

## REPORTING REQUIREMENTS

**For each page/step, provide:**
1. **Screenshots** of completed functionality
2. **Security test results** with evidence
3. **Performance metrics** for key operations
4. **Integration test results** with other systems
5. **Mobile testing results** on actual devices

**Document everything in `docs/activity.md` including:**
- Each step completed
- Security checks performed
- Issues found and resolved
- Performance measurements
- Integration test results

**Remember:** This is a healthcare platform handling PHI. Every step must be secure, compliant, and thoroughly tested before proceeding to the next step.

