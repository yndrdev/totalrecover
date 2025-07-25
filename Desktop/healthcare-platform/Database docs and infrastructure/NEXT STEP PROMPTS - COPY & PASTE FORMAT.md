# NEXT STEP PROMPTS - COPY & PASTE FORMAT
## After PROMPT 0: Fresh Project Setup Complete

---

## 🔐 PROMPT 1: SUPABASE CONNECTION & AUTHENTICATION

```
SUPABASE CONNECTION & AUTHENTICATION SYSTEM

Mode: healthcare-platform
Task: Connect to existing Supabase database and implement authentication

CONTEXT:
Fresh project setup complete. Now connecting to existing Supabase database schema with:
- Multi-tenant architecture (tenants, profiles tables)
- Chat conversation tracking (conversations, messages tables)
- Healthcare-specific tables (patients, providers, etc.)

REQUIREMENTS:
1. **Supabase Client Setup:**
   Create lib/supabase/client.ts:
   ```typescript
   import { createBrowserClient } from '@supabase/ssr'
   
   export const createClient = () =>
     createBrowserClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
     )
   ```

2. **Server-Side Supabase:**
   Create lib/supabase/server.ts:
   ```typescript
   import { createServerClient } from '@supabase/ssr'
   import { cookies } from 'next/headers'
   
   export const createClient = () => {
     const cookieStore = cookies()
     return createServerClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
       {
         cookies: {
           get(name: string) {
             return cookieStore.get(name)?.value
           },
         },
       }
     )
   }
   ```

3. **Authentication Pages:**
   - Create app/login/page.tsx - Clean, professional healthcare login
   - Create app/register/page.tsx - User registration (if needed)
   - Implement redirect logic based on user roles

4. **User Types & Demo Users:**
   Create these 3 demo users in Supabase Auth Dashboard:
   - **Patient**: sarah.johnson@demo.com (password: demo123)
   - **Provider**: dr.chen@demo.com (password: demo123)  
   - **Admin**: admin@demo.com (password: demo123)

5. **Role-Based Routing:**
   - Patient → /patient (chat interface)
   - Provider → /provider (dashboard)
   - Admin → /admin (management panel)

6. **UI Design Requirements:**
   - Use shadcn-ui components (Button, Input, Card)
   - Professional healthcare styling for adults 40+
   - Brand colors: primary: #002238, secondary: #006DB1, accent: #C8DBE9, background: #FFFFFF
   - Mobile-responsive design
   - Clean, modern healthcare interface (NOT childish)

7. **Database Integration:**
   - Connect to profiles table with tenant_id
   - Respect Row Level Security (RLS) policies
   - Handle accessible_tenants array
   - Implement proper session management

8. **Authentication Flow:**
   - Login form with email/password
   - Error handling for invalid credentials
   - Success redirect based on user role
   - Session persistence
   - Logout functionality

VALIDATION CHECKLIST:
✅ Supabase client configured correctly
✅ Authentication pages created and styled professionally
✅ All 3 demo users can log in successfully
✅ Role-based redirects working (patient→/patient, provider→/provider, admin→/admin)
✅ Professional healthcare appearance (adults 40+, not childish)
✅ Mobile-responsive design working
✅ Database connection verified
✅ Session management working
✅ Logout functionality working

Every time you perform actions related to the project, append your actions to docs/activity.md and read that file whenever you find it necessary to assist you.
```

---

## 💬 PROMPT 2: PATIENT CHAT INTERFACE

```
PATIENT CHAT INTERFACE - CONVERSATIONAL HEALTHCARE

Mode: chat-specialist
Task: Build patient chat interface following conversational-form approach

CONTEXT:
Authentication working with 3 demo users. Now building core patient experience.
Reference style: https://github.com/space10-community/conversational-form.git
UI Reference: https://shadcnuikit.com/dashboard/apps/ai-chat

REQUIREMENTS:
1. **Chat Interface Design:**
   - Create app/patient/page.tsx
   - Clean chat interface with NO sidebar navigation
   - AI speaks first, always
   - Professional healthcare styling for adults 40+
   - Mobile-optimized design
   - Full-screen chat experience

2. **Database Integration:**
   - Connect to conversations table (id, patient_id, tenant_id, created_at, updated_at)
   - Connect to messages table (id, conversation_id, sender_type, content, created_at)
   - Real-time message tracking with completion_status
   - Conversation analytics updates (total_messages, last_activity_at)

3. **Core Chat Components:**
   - Message bubbles (AI vs Patient styling)
   - Message input field
   - Send button
   - Voice input button (prominent but not intrusive)
   - Typing indicator
   - Connection status indicator
   - Auto-scroll to latest message

4. **Conversational Flow (Like conversational-form):**
   - AI greeting: "Hello Sarah, I'm here to help with your recovery. How are you feeling today?"
   - Direct questions: "Rate your pain level from 0-10" (NOT "Please rate your pain level from 0-10")
   - No traditional form sections or multiple choice lists
   - Natural conversation progression
   - One question at a time approach

5. **Voice Integration:**
   - OpenAI Whisper for voice-to-text conversion
   - Clear, accessible voice input button
   - Works on both desktop and mobile
   - Seamless voice/text switching
   - Visual feedback during voice recording

6. **Patient Journey Integration:**
   - Automatic content based on surgery_date and current recovery day
   - Adaptive questioning based on previous responses
   - Progress tracking visible to patient
   - Recovery milestone celebrations

7. **Real-time Features:**
   - WebSocket or real-time subscriptions for live messaging
   - Message status indicators (sent, delivered, read)
   - Typing indicators when AI is responding
   - Connection status monitoring

8. **UI Styling Requirements:**
   - Use shadcn-ui components (Card, Button, Input, Avatar)
   - Professional healthcare colors: #002238, #006DB1, #C8DBE9, #FFFFFF
   - Clean, modern design for adults 40+ (NOT childish or playful)
   - Proper contrast ratios for accessibility
   - Mobile-first responsive design

VALIDATION CHECKLIST:
✅ Clean chat interface created (no sidebar)
✅ AI speaks first in all interactions
✅ Voice input works on desktop and mobile
✅ Real-time messaging functional
✅ Database integration working (conversations and messages tables)
✅ Professional healthcare appearance (adults 40+)
✅ Mobile-responsive design perfect
✅ Conversational flow like conversational-form (direct questions)
✅ Message persistence working
✅ Patient can log in and see chat immediately

Every time you perform actions related to the project, append your actions to docs/activity.md and read that file whenever you find it necessary to assist you.
```

---

## 🏥 PROMPT 3: PROVIDER DASHBOARD

```
PROVIDER DASHBOARD - PATIENT MONITORING INTERFACE

Mode: healthcare-platform
Task: Build provider dashboard for patient monitoring and management

CONTEXT:
Patient chat interface working. Now building provider side for monitoring and interventions.
UI Reference: https://github.com/bundui/shadcn-ui-kit-dashboard.git

REQUIREMENTS:
1. **Dashboard Layout:**
   - Create app/provider/page.tsx
   - Clean, professional healthcare interface
   - Patient list with status indicators
   - Real-time updates and alerts
   - Mobile-responsive design
   - Professional sidebar or top navigation

2. **Database Integration:**
   - Connect to patients table (id, tenant_id, first_name, last_name, surgery_date, surgery_type)
   - Connect to conversations table for monitoring
   - Connect to messages table for real-time chat monitoring
   - Multi-tenant patient filtering (respect tenant_id)
   - Real-time conversation monitoring

3. **Core Dashboard Features:**
   - **Patient List**: All assigned patients with status indicators
   - **Quick Stats**: Active conversations, pending alerts, completion rates
   - **Alert Center**: Concerning responses requiring immediate attention
   - **Search & Filter**: Find patients quickly by name, surgery type, or date
   - **Recent Activity**: Latest patient interactions and updates

4. **Patient Cards/List Items:**
   - Patient name and profile photo
   - Surgery info (type, date, current recovery day)
   - Last activity timestamp
   - Progress indicators (forms completed, exercises done)
   - Alert badges for concerning responses (pain >6, missed check-ins)
   - Quick action buttons (view chat, send message, modify protocol)

5. **Real-Time Features:**
   - Live conversation monitoring
   - Instant alert notifications for concerning responses
   - Real-time progress updates
   - WebSocket integration for live updates
   - Push notifications for urgent alerts

6. **Navigation & Layout:**
   - Clean sidebar with navigation options
   - Patient detail view access
   - Settings and profile access
   - Logout functionality
   - Breadcrumb navigation

7. **Alert System:**
   - Visual indicators for patients needing attention
   - Color-coded priority levels (green=good, yellow=attention, red=urgent)
   - Alert types: high pain levels, missed check-ins, concerning responses
   - Quick action buttons for each alert

8. **UI Styling Requirements:**
   - Use shadcn-ui components (Card, Button, Badge, Avatar, Table)
   - Professional healthcare colors: #002238, #006DB1, #C8DBE9, #FFFFFF
   - Clean, modern dashboard design for healthcare professionals
   - Data visualization for patient progress
   - Proper spacing and typography for readability

VALIDATION CHECKLIST:
✅ Clean provider dashboard layout created
✅ Patient list displays correctly with real data
✅ Real-time updates working (new messages, alerts)
✅ Alert system functional (identifies concerning responses)
✅ Professional healthcare interface (not childish)
✅ Mobile-responsive design working
✅ Database integration verified (patients, conversations, messages)
✅ Navigation working (sidebar, patient detail access)
✅ Search and filter functionality working
✅ Provider can log in and see assigned patients

Every time you perform actions related to the project, append your actions to docs/activity.md and read that file whenever you find it necessary to assist you.
```

---

## 🎯 EXECUTION INSTRUCTIONS

### **STEP 1: Copy PROMPT 1**
```
1. Copy the entire PROMPT 1 text above
2. Paste into Roo Code
3. Wait for completion
4. Test: Log in with all 3 demo users
5. Verify role-based redirects work
```

### **STEP 2: Copy PROMPT 2**
```
1. Copy the entire PROMPT 2 text above
2. Paste into Roo Code
3. Wait for completion
4. Test: Log in as sarah.johnson@demo.com
5. Verify chat interface works and AI speaks first
```

### **STEP 3: Copy PROMPT 3**
```
1. Copy the entire PROMPT 3 text above
2. Paste into Roo Code
3. Wait for completion
4. Test: Log in as dr.chen@demo.com
5. Verify provider dashboard shows patients
```

### **SUCCESS VALIDATION:**
After all 3 prompts:
- ✅ 3 demo users can log in
- ✅ Patient sees chat interface
- ✅ Provider sees dashboard
- ✅ Admin sees management panel
- ✅ Professional healthcare styling throughout
- ✅ Mobile-responsive design working

**Ready for advanced features after these 3 prompts are complete!**

