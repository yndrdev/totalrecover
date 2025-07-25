# IMMEDIATE START PROMPTS
## TJV Recovery Platform - Fresh Project Launch

---

## 🚀 PROMPT 0: FRESH PROJECT SETUP

```
FRESH HEALTHCARE PLATFORM PROJECT SETUP

Mode: healthcare-platform
Task: Set up fresh Next.js project with healthcare platform foundation

CONTEXT:
Starting completely fresh after mixed implementation issues. We have:
- Existing Supabase database schema (complete and working)
- Vercel deployment infrastructure ready
- Environment variables backed up
- GitHub repo ready to connect

REQUIREMENTS:
1. **Fresh Next.js Setup:**
   - Next.js 14 with App Router
   - TypeScript configuration
   - Tailwind CSS setup
   - ESLint configuration

2. **Install Core Dependencies:**
   ```bash
   npm install @supabase/supabase-js @supabase/ssr
   npm install openai
   npm install lucide-react
   npm install @radix-ui/react-slot
   npm install class-variance-authority
   npm install clsx tailwind-merge
   ```

3. **Setup shadcn/ui:**
   ```bash
   npx shadcn-ui@latest init
   npx shadcn-ui@latest add button
   npx shadcn-ui@latest add input
   npx shadcn-ui@latest add card
   npx shadcn-ui@latest add avatar
   npx shadcn-ui@latest add badge
   ```

4. **Environment Configuration:**
   - Copy .env.local with Supabase and OpenAI keys
   - Verify all environment variables are working

5. **Project Structure:**
   ```
   src/
   ├── app/
   │   ├── globals.css
   │   ├── layout.tsx
   │   └── page.tsx
   ├── components/
   │   └── ui/
   ├── lib/
   │   ├── supabase/
   │   └── utils.ts
   └── types/
   ```

6. **Brand Colors Setup (tailwind.config.js):**
   ```javascript
   colors: {
     primary: '#002238',
     secondary: '#006DB1', 
     accent: '#C8DBE9',
     background: '#FFFFFF'
   }
   ```

VALIDATION:
✅ Fresh Next.js project created
✅ All dependencies installed
✅ shadcn/ui components available
✅ Environment variables working
✅ Project structure organized
✅ Brand colors configured
✅ Ready for authentication setup

Every time you perform actions related to the project, append your actions to docs/activity.md and read that file whenever you find it necessary to assist you.
```

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
   ```typescript
   // lib/supabase/client.ts
   import { createBrowserClient } from '@supabase/ssr'
   
   export const createClient = () =>
     createBrowserClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
     )
   ```

2. **Server-Side Supabase:**
   ```typescript
   // lib/supabase/server.ts
   import { createServerClient } from '@supabase/ssr'
   import { cookies } from 'next/headers'
   ```

3. **Authentication Pages:**
   - `/login` - Clean, professional healthcare login
   - `/register` - User registration (if needed)
   - Redirect logic based on user roles

4. **User Types & Demo Users:**
   Create these 3 demo users in Supabase Auth:
   - **Patient**: sarah.johnson@demo.com (password: demo123)
   - **Provider**: dr.chen@demo.com (password: demo123)  
   - **Admin**: admin@demo.com (password: demo123)

5. **Role-Based Routing:**
   - Patient → `/patient` (chat interface)
   - Provider → `/provider` (dashboard)
   - Admin → `/admin` (management panel)

6. **UI Design:**
   - Use shadcn-ui components
   - Professional healthcare styling (adults 40+)
   - Brand colors: #002238, #006DB1, #C8DBE9, #FFFFFF
   - Mobile-responsive design

7. **Database Integration:**
   - Connect to profiles table
   - Respect tenant_id isolation
   - Implement Row Level Security (RLS)
   - Handle accessible_tenants array

VALIDATION:
✅ Supabase client configured correctly
✅ Authentication pages created and styled
✅ 3 demo users can log in successfully
✅ Role-based redirects working
✅ Professional healthcare appearance
✅ Mobile-responsive design
✅ Database connection verified

Every time you perform actions related to the project, append your actions to docs/activity.md and read that file whenever you find it necessary to assist you.
```

---

## 💬 PROMPT 2: PATIENT CHAT INTERFACE FOUNDATION

```
PATIENT CHAT INTERFACE - CONVERSATIONAL HEALTHCARE

Mode: chat-specialist
Task: Build patient chat interface following conversational-form approach

CONTEXT:
Authentication working. Now building core patient experience.
Reference: https://github.com/space10-community/conversational-form.git
UI Reference: https://shadcnuikit.com/dashboard/apps/ai-chat

REQUIREMENTS:
1. **Chat Interface Design:**
   - Clean chat interface (NO sidebar navigation)
   - AI speaks first, always
   - Professional healthcare styling for adults 40+
   - Mobile-optimized design

2. **Database Integration:**
   - Connect to conversations table
   - Connect to messages table  
   - Real-time message tracking
   - Conversation analytics updates

3. **Core Chat Features:**
   - Real-time messaging
   - Message status indicators
   - Typing indicators
   - Auto-scroll to latest message
   - Voice input button (prominent but not intrusive)

4. **Conversational Flow:**
   - AI greeting: "Hello Sarah, I'm here to help with your recovery. How are you feeling today?"
   - Direct questions: "Rate your pain level from 0-10"
   - No traditional form sections
   - Natural conversation progression

5. **Voice Integration:**
   - OpenAI Whisper for voice-to-text
   - Clear voice input button
   - Works on desktop and mobile
   - Seamless voice/text switching

6. **Patient Journey Integration:**
   - Automatic content based on surgery_date and current_day
   - Adaptive questioning based on previous responses
   - Progress tracking visible to patient

7. **UI Components:**
   - Message bubbles (AI vs Patient styling)
   - Voice input button
   - Send button
   - Typing indicator
   - Connection status

VALIDATION:
✅ Clean chat interface (no sidebar)
✅ AI speaks first in all interactions
✅ Voice input works on desktop and mobile
✅ Real-time messaging functional
✅ Database integration working
✅ Professional healthcare appearance
✅ Mobile-responsive design

Every time you perform actions related to the project, append your actions to docs/activity.md and read that file whenever you find it necessary to assist you.
```

---

## 🏥 PROMPT 3: PROVIDER DASHBOARD FOUNDATION

```
PROVIDER DASHBOARD - PATIENT MONITORING INTERFACE

Mode: healthcare-platform
Task: Build provider dashboard for patient monitoring and management

CONTEXT:
Patient chat interface working. Now building provider side for monitoring and interventions.
UI Reference: https://github.com/bundui/shadcn-ui-kit-dashboard.git

REQUIREMENTS:
1. **Dashboard Layout:**
   - Clean, professional healthcare interface
   - Patient list with status indicators
   - Real-time updates and alerts
   - Mobile-responsive design

2. **Database Integration:**
   - Connect to patients table
   - Connect to conversations table
   - Real-time conversation monitoring
   - Multi-tenant patient filtering

3. **Core Features:**
   - **Patient List**: All assigned patients with status
   - **Quick Stats**: Active conversations, alerts, completions
   - **Alert Center**: Concerning responses requiring attention
   - **Search & Filter**: Find patients quickly

4. **Patient Cards:**
   - Patient name and surgery info
   - Current recovery day
   - Last activity timestamp
   - Progress indicators
   - Alert badges for concerning responses

5. **Real-Time Features:**
   - Live conversation monitoring
   - Instant alert notifications
   - Real-time progress updates
   - WebSocket integration

6. **Navigation:**
   - Clean sidebar or top navigation
   - Patient detail view access
   - Settings and profile access
   - Logout functionality

VALIDATION:
✅ Clean provider dashboard layout
✅ Patient list displays correctly
✅ Real-time updates working
✅ Alert system functional
✅ Professional healthcare interface
✅ Mobile-responsive design
✅ Database integration verified

Every time you perform actions related to the project, append your actions to docs/activity.md and read that file whenever you find it necessary to assist you.
```

---

## 🎯 EXECUTION ORDER

### **Step 1: Fresh Setup (30 minutes)**
```bash
# Create fresh project
npx create-next-app@latest tjv-recovery-app --typescript --tailwind --eslint --app

# Use Prompt 0 with Roo Code
```

### **Step 2: Database Connection (45 minutes)**
```bash
# Use Prompt 1 with Roo Code
# Test with 3 demo users
```

### **Step 3: Patient Chat (60 minutes)**
```bash
# Use Prompt 2 with Roo Code
# Test conversational flow
```

### **Step 4: Provider Dashboard (45 minutes)**
```bash
# Use Prompt 3 with Roo Code
# Test patient monitoring
```

---

## ✅ SUCCESS CHECKPOINTS

### **After Each Prompt:**
- Feature works locally
- Database integration functional
- Professional healthcare styling
- Mobile-responsive design
- Ready for next prompt

### **Ready for Advanced Features:**
Once these 4 prompts are complete, you'll have:
- ✅ Fresh, clean project foundation
- ✅ Working authentication system
- ✅ Patient chat interface
- ✅ Provider dashboard
- ✅ Database connections verified
- ✅ Ready for exercise modifications, forms, and videos

**Time to start building! Use these prompts with Roo Code in order.**

