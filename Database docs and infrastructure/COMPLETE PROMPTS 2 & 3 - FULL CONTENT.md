# COMPLETE PROMPTS 2 & 3 - FULL CONTENT

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

9. **Message Types:**
   - Text messages from patient
   - AI responses with healthcare guidance
   - System messages for milestones
   - Voice message transcriptions
   - Progress updates and celebrations

10. **Error Handling:**
    - Network connection issues
    - Voice recording failures
    - Message send failures
    - Graceful degradation for offline use

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

8. **Patient Detail View:**
   - Individual patient overview page
   - Real-time chat monitoring
   - Progress charts and analytics
   - Exercise modification tools
   - Form completion tracking
   - Medical history access

9. **Dashboard Widgets:**
   - Total patients assigned
   - Active conversations count
   - Pending alerts count
   - Completion rates (forms, exercises)
   - Recovery progress trends
   - Recent patient activity feed

10. **UI Styling Requirements:**
    - Use shadcn-ui components (Card, Button, Badge, Avatar, Table)
    - Professional healthcare colors: #002238, #006DB1, #C8DBE9, #FFFFFF
    - Clean, modern dashboard design for healthcare professionals
    - Data visualization for patient progress
    - Proper spacing and typography for readability

11. **Responsive Design:**
    - Mobile-optimized for tablets and phones
    - Collapsible sidebar for smaller screens
    - Touch-friendly interface elements
    - Readable text sizes on all devices

12. **Performance Optimization:**
    - Efficient data loading and caching
    - Real-time updates without page refresh
    - Smooth animations and transitions
    - Fast search and filter functionality

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
✅ Quick stats widgets displaying correct data
✅ Patient detail view accessible and functional

Every time you perform actions related to the project, append your actions to docs/activity.md and read that file whenever you find it necessary to assist you.
```

