# TJV RECOVERY - PAGE BY PAGE BUILD PROMPTS
## Complete Application Build with Database Integration

**CRITICAL CONTEXT:**
- Database schema is now complete in Supabase with chat conversation tracking
- UI/UX follows specific templates: shadcn-ui-kit-dashboard + ai-chat + conversational-form
- Clinic creates "scripts" that patients follow conversationally
- Real-time editing capabilities for PT adjustments
- Launch target: Tomorrow

---

## 🎯 PROMPT 1: AUTHENTICATION & ROUTING FOUNDATION

```
AUTHENTICATION SYSTEM WITH DATABASE INTEGRATION

Mode: healthcare-platform
Task: Build complete authentication system connected to our Supabase schema

REQUIREMENTS:
1. **Database Integration:**
   - Connect to profiles table with multi-tenant support
   - Support roles: super_admin, practice_admin, clinic_admin, surgeon, nurse, physical_therapist, patient
   - Implement tenant_id filtering and accessible_tenants array
   - Row Level Security (RLS) policies active

2. **UI Template:**
   - Use shadcn-ui-kit-dashboard login design
   - Professional healthcare styling (not childish)
   - Brand colors: #002238, #006DB1, #C8DBE9, #FFFFFF
   - Mobile-responsive for patients 40+

3. **Authentication Flow:**
   - Supabase Auth integration
   - Role-based redirects after login
   - Session persistence and management
   - Multi-tenant access control

4. **Demo Users (Create in Supabase Auth):**
   - Patient: sarah.johnson@demo.com (TKA Day 5 post-op)
   - Provider: dr.chen@demo.com (Orthopedic Surgeon)
   - Admin: admin@demo.com (Clinic Administrator)

5. **Routing Structure:**
   - /login - Authentication page
   - /patient - Patient chat interface
   - /provider - Provider dashboard
   - /admin - Admin management
   - Protected routes with role checking

VALIDATION:
✅ All demo users can log in successfully
✅ Role-based redirects work correctly
✅ Multi-tenant isolation enforced
✅ Professional healthcare appearance
✅ Mobile-optimized interface

Every time you perform actions related to the project, append your actions to docs/activity.md and read that file whenever you find it necessary to assist you.
```

---

## 🎯 PROMPT 2: PATIENT CHAT INTERFACE

```
PATIENT CHAT INTERFACE - CONVERSATIONAL FORM STYLE

Mode: chat-specialist
Task: Build patient chat interface following conversational-form approach with database integration

REQUIREMENTS:
1. **UI Template Reference:**
   - Base: https://shadcnuikit.com/dashboard/apps/ai-chat
   - Conversational flow: https://github.com/space10-community/conversational-form.git
   - NO sidebar navigation (clean chat only)
   - Professional healthcare styling for adults 40+

2. **Database Integration:**
   - Connect to conversations, messages, patients tables
   - Real-time message tracking with completion_status
   - Form/exercise/video completion tracking in chat context
   - Conversation analytics updates (total_forms_completed, etc.)

3. **Conversational Flow (Like Conversational Form):**
   - AI speaks first, always
   - Direct questions: "Do you smoke? Yes or No"
   - No traditional form sections
   - Voice input integration (OpenAI Whisper)
   - Natural conversation progression

4. **Chat Features:**
   - Real-time messaging with WebSocket
   - Voice-to-text button (prominent but not intrusive)
   - Message status indicators (sent, delivered, read)
   - Typing indicators
   - Auto-scroll to latest message

5. **Content Delivery:**
   - Pre-op forms delivered conversationally
   - Post-op daily check-ins as chat questions
   - Exercise videos embedded in chat messages
   - Educational content presented in chat context

6. **Patient Journey Integration:**
   - Automatic content based on surgery_date and current_day
   - Adaptive questioning based on previous responses
   - Progress tracking visible to patient
   - Two subtle buttons after tasks: "Progress" and "Exercises"

VALIDATION:
✅ Clean chat interface (no sidebar)
✅ AI speaks first in all interactions
✅ Voice input works on desktop and mobile
✅ Forms delivered conversationally
✅ Real-time message tracking in database
✅ Professional healthcare appearance

Every time you perform actions related to the project, append your actions to docs/activity.md and read that file whenever you find it necessary to assist you.
```

---

## 🎯 PROMPT 3: CLINIC SCRIPT BUILDER INTERFACE

```
CLINIC SCRIPT/CHAT BUILDER - TIME-RELEASED PATIENT JOURNEY

Mode: healthcare-platform
Task: Build clinic-side script builder for creating patient conversation flows

REQUIREMENTS:
1. **UI Template:**
   - Use shadcn-ui-kit-dashboard layout
   - Clean, simple interface (not complex visual builder)
   - Professional healthcare styling
   - Drag-and-drop functionality for content ordering

2. **Database Integration:**
   - Connect to tasks, forms, exercises, educational_content tables
   - Link to recovery_protocols and patient_tasks
   - Real-time updates to patient conversations
   - Template system integration (practice_templates)

3. **Script Builder Features:**
   - **Timeline View:** Visual timeline of patient journey (Day 1, Day 2, etc.)
   - **Content Library:** Forms, exercises, videos available for assignment
   - **Drag & Drop:** Drag content onto specific days
   - **Time Release:** Set when content appears to patient
   - **Simple Upload:** Upload new forms/videos with basic metadata

4. **Content Management:**
   - **Forms:** Upload PDF, convert to conversational questions
   - **Exercises:** Upload video, set parameters (reps, sets, duration)
   - **Education:** Upload videos/PDFs with chat introduction messages
   - **Daily Check-ins:** Pre-built templates for pain, sleep, activity

5. **Real-Time Editing:**
   - **Live Patient View:** See patient's current chat state
   - **Instant Modifications:** Change content while patient is active
   - **PT Adjustments:** Modify exercises if patient reports difficulty
   - **Progress Monitoring:** Real-time completion tracking

6. **Journey Customization:**
   - **Surgery Type:** TKA vs THA protocols
   - **Activity Level:** Active vs sedentary patient paths
   - **Personalization:** Adjust based on patient responses
   - **Branching Logic:** Different paths based on progress

VALIDATION:
✅ Simple, intuitive script builder interface
✅ Timeline view with drag-and-drop functionality
✅ Real-time patient chat monitoring
✅ Instant content modifications work
✅ Upload system for forms/videos functional
✅ Database properly tracks all changes

Every time you perform actions related to the project, append your actions to docs/activity.md and read that file whenever you find it necessary to assist you.
```

---

## 🎯 PROMPT 4: PROVIDER DASHBOARD & PATIENT MONITORING

```
PROVIDER DASHBOARD - PATIENT MONITORING & INTERVENTION

Mode: healthcare-platform
Task: Build provider dashboard for monitoring patients and real-time interventions

REQUIREMENTS:
1. **UI Template:**
   - Use shadcn-ui-kit-dashboard layout
   - Clean, professional healthcare interface
   - Data visualization for patient progress
   - Alert system for concerning responses

2. **Database Integration:**
   - Connect to patients, conversations, progress_metrics tables
   - Real-time conversation monitoring
   - Alert triggers from conversation_activities
   - Multi-tenant patient filtering

3. **Dashboard Features:**
   - **Patient List:** All assigned patients with status indicators
   - **Progress Overview:** Visual progress charts and metrics
   - **Alert Center:** Concerning responses requiring attention
   - **Quick Actions:** Message patient, modify protocol, schedule call

4. **Patient Detail View:**
   - **Live Chat Monitor:** Real-time view of patient conversation
   - **Progress Tracking:** Forms completed, exercises done, videos watched
   - **Intervention Tools:** Modify exercises, send messages, escalate concerns
   - **Medical History:** Surgery details, medications, allergies

5. **Real-Time Interventions:**
   - **Exercise Modification:** Change difficulty, provide alternatives
   - **Direct Messaging:** Send encouraging messages or instructions
   - **Alert Escalation:** Notify surgeon for concerning responses
   - **Protocol Adjustments:** Modify recovery timeline based on progress

6. **Analytics & Reporting:**
   - **Patient Compliance:** Completion rates for tasks and exercises
   - **Progress Trends:** Pain levels, mobility improvements over time
   - **Outcome Metrics:** Recovery milestones and goal achievement
   - **Population Health:** Aggregate data across all patients

VALIDATION:
✅ Clean provider dashboard with patient overview
✅ Real-time chat monitoring functional
✅ Exercise modification tools work instantly
✅ Alert system triggers appropriately
✅ Progress tracking accurate and real-time
✅ Professional healthcare interface

Every time you perform actions related to the project, append your actions to docs/activity.md and read that file whenever you find it necessary to assist you.
```

---

## 🎯 PROMPT 5: REAL-TIME EXERCISE MODIFICATION SYSTEM

```
REAL-TIME EXERCISE MODIFICATION - PT INTERVENTION TOOLS

Mode: healthcare-platform
Task: Build real-time exercise modification system for PT interventions

REQUIREMENTS:
1. **Database Integration:**
   - Connect to exercise_completions, messages, conversation_activities
   - Real-time updates to patient chat interface
   - Modification tracking and audit trail
   - Provider notification system

2. **Alert Triggers:**
   - Pain levels > 6/10 during exercises
   - Patient reports "can't do" or "too difficult"
   - Multiple skipped exercises
   - Concerning voice responses or text

3. **Modification Interface:**
   - **Quick Options:** Reduce intensity, gentle version, alternative exercise
   - **Custom Instructions:** PT can write specific modifications
   - **Video Replacement:** Swap exercise videos instantly
   - **Parameter Adjustment:** Change reps, sets, duration in real-time

4. **Patient Experience:**
   - **Seamless Transition:** Modifications appear naturally in chat
   - **PT Identification:** Clear indication when PT intervenes
   - **Encouragement:** Supportive messaging with modifications
   - **Progress Continuity:** Modified exercises still count toward goals

5. **Intervention Workflow:**
   - **Alert Generation:** Automatic alerts for concerning responses
   - **PT Notification:** Real-time alerts to assigned PT
   - **Quick Response:** One-click modification options
   - **Patient Update:** Instant delivery to patient chat
   - **Outcome Tracking:** Monitor effectiveness of modifications

6. **Audit & Compliance:**
   - **Modification Log:** All changes tracked with timestamps
   - **Reason Codes:** Why modification was made
   - **Outcome Tracking:** Did modification help or hinder?
   - **Provider Attribution:** Which PT made which changes

VALIDATION:
✅ Alerts trigger correctly for concerning responses
✅ PT can modify exercises in real-time
✅ Changes appear instantly in patient chat
✅ Audit trail captures all modifications
✅ Patient experience remains smooth and encouraging
✅ Outcome tracking functional

Every time you perform actions related to the project, append your actions to docs/activity.md and read that file whenever you find it necessary to assist you.
```

---

## 🎯 PROMPT 6: FORM BUILDER & CONVERSATIONAL DELIVERY

```
FORM BUILDER - CONVERSATIONAL MEDICAL INTAKE

Mode: healthcare-platform
Task: Build form creation system that delivers forms conversationally through chat

REQUIREMENTS:
1. **Database Integration:**
   - Connect to forms, form_responses, messages tables
   - Chat integration tracking (chat_started_at, chat_completed_at)
   - Response validation and storage
   - Progress tracking in conversation context

2. **Form Builder Interface:**
   - **Simple Creation:** Upload PDF or create from scratch
   - **Question Types:** Text, multiple choice, yes/no, number, date
   - **Conversational Preview:** See how form appears in chat
   - **Validation Rules:** Required fields, format validation
   - **Conditional Logic:** Show/hide questions based on responses

3. **Conversational Delivery:**
   - **One Question at a Time:** Never show traditional form layout
   - **Natural Language:** "Do you smoke? Yes or No" not "Smoking Status: [ ]"
   - **Voice Input Support:** All questions accept voice responses
   - **Progress Indicators:** Subtle progress without overwhelming
   - **Completion Celebration:** Positive reinforcement when done

4. **Pre-Built Medical Forms:**
   - **Universal Medical Questionnaire:** Allergies, medications, conditions
   - **Pre-Op Assessment:** Surgery readiness, concerns, expectations
   - **Daily Check-ins:** Pain, sleep, activity, mood
   - **Functional Assessments:** Mobility, independence, goals

5. **Response Handling:**
   - **Real-Time Validation:** Immediate feedback for invalid responses
   - **Smart Parsing:** Handle voice-to-text variations
   - **Follow-Up Questions:** Automatic clarification when needed
   - **Provider Alerts:** Flag concerning responses immediately

6. **Integration Features:**
   - **Template System:** Use practice_templates for consistency
   - **Multi-Tenant:** Forms available across tenant hierarchy
   - **Version Control:** Track form changes and updates
   - **Analytics:** Completion rates, time to complete, abandonment

VALIDATION:
✅ Forms delivered one question at a time in chat
✅ Voice input works for all question types
✅ Responses properly validated and stored
✅ Provider alerts trigger for concerning answers
✅ Form builder interface intuitive and functional
✅ Pre-built medical forms available and working

Every time you perform actions related to the project, append your actions to docs/activity.md and read that file whenever you find it necessary to assist you.
```

---

## 🎯 PROMPT 7: VIDEO & EXERCISE INTEGRATION

```
VIDEO & EXERCISE SYSTEM - CHAT-EMBEDDED CONTENT

Mode: healthcare-platform
Task: Build exercise video system integrated with chat conversations

REQUIREMENTS:
1. **Database Integration:**
   - Connect to exercises, exercise_completions, messages tables
   - Video engagement tracking (watched_seconds, completion_percentage)
   - Performance data collection (pain_before, pain_after, difficulty)
   - Real-time progress updates

2. **Video Integration:**
   - **Chat Embedding:** Videos appear naturally in chat messages
   - **Progress Tracking:** Track watch time and completion
   - **Replay Functionality:** Easy to replay difficult sections
   - **Mobile Optimization:** Works perfectly on phones/tablets

3. **Exercise Library:**
   - **Categorized Content:** Range of motion, strengthening, balance, functional
   - **Surgery-Specific:** TKA vs THA appropriate exercises
   - **Difficulty Levels:** Progressive difficulty based on recovery day
   - **Equipment Variations:** Chair, bed, standing, equipment-free options

4. **Performance Tracking:**
   - **Pre-Exercise Questions:** "Rate your pain level 0-10"
   - **Exercise Parameters:** Reps, sets, duration tracking
   - **Post-Exercise Assessment:** Pain, difficulty, completion
   - **Voice Feedback:** "I completed 10 reps" via voice input

5. **Adaptive Delivery:**
   - **Day-Based Progression:** Exercises appropriate for recovery day
   - **Performance-Based:** Adjust difficulty based on previous performance
   - **PT Modifications:** Real-time exercise changes from PT
   - **Patient Preferences:** Remember successful exercise types

6. **Engagement Features:**
   - **Encouragement Messages:** Motivational content during exercises
   - **Progress Celebration:** Acknowledge improvements and milestones
   - **Social Proof:** "Most patients at your stage can do this"
   - **Goal Setting:** Personal targets and achievement tracking

VALIDATION:
✅ Videos embedded naturally in chat interface
✅ Watch time and engagement properly tracked
✅ Performance data collected and stored
✅ PT can modify exercises in real-time
✅ Mobile video playback optimized
✅ Progress tracking accurate and motivating

Every time you perform actions related to the project, append your actions to docs/activity.md and read that file whenever you find it necessary to assist you.
```

---

## 🎯 PROMPT 8: ADMIN PANEL & MULTI-TENANT MANAGEMENT

```
ADMIN PANEL - MULTI-TENANT MANAGEMENT SYSTEM

Mode: healthcare-platform
Task: Build admin panel for super admin and practice management

REQUIREMENTS:
1. **Database Integration:**
   - Connect to tenants, master_templates, practice_templates tables
   - Multi-tenant hierarchy management
   - Template deployment and customization
   - Usage analytics across all tenants

2. **Super Admin Features:**
   - **Tenant Management:** Create/edit practices and clinics
   - **Template Library:** Master templates for all practices
   - **Global Analytics:** Usage across all tenants
   - **Support Tools:** Help practices with setup and issues

3. **Practice Admin Features:**
   - **Clinic Management:** Manage child clinics
   - **Template Customization:** Modify master templates for practice
   - **Provider Management:** Add/remove surgeons, nurses, PTs
   - **Patient Analytics:** Practice-wide patient outcomes

4. **Template System:**
   - **Master Templates:** Created by super admin
   - **Practice Customization:** Practices can modify within rules
   - **Deployment Tools:** Push updates to all clinics
   - **Version Control:** Track template changes and rollbacks

5. **Analytics Dashboard:**
   - **Usage Metrics:** Forms completed, exercises done, videos watched
   - **Outcome Tracking:** Recovery times, patient satisfaction
   - **Compliance Monitoring:** Provider engagement, patient adherence
   - **Financial Metrics:** ROI, cost per patient, efficiency gains

6. **Support & Training:**
   - **Onboarding Workflows:** Guide new practices through setup
   - **Training Materials:** Video tutorials, documentation
   - **Support Ticketing:** Help desk for practices
   - **Best Practices:** Share successful implementations

VALIDATION:
✅ Multi-tenant hierarchy properly managed
✅ Template system functional and secure
✅ Analytics accurate across all tenants
✅ Practice customization within proper bounds
✅ Support tools accessible and helpful
✅ Performance optimized for large scale

Every time you perform actions related to the project, append your actions to docs/activity.md and read that file whenever you find it necessary to assist you.
```

---

## 🎯 PROMPT 9: INTEGRATION TESTING & DEPLOYMENT

```
INTEGRATION TESTING & PRODUCTION DEPLOYMENT

Mode: healthcare-platform
Task: Complete end-to-end testing and production deployment

REQUIREMENTS:
1. **End-to-End Testing:**
   - **Patient Journey:** Complete pre-op to post-op flow
   - **Provider Workflow:** Script creation to patient monitoring
   - **Real-Time Features:** Exercise modifications, alerts, interventions
   - **Multi-Tenant:** Cross-tenant isolation and access controls

2. **Performance Testing:**
   - **Chat Real-Time:** WebSocket performance under load
   - **Database Queries:** Optimized for thousands of patients
   - **Video Streaming:** Smooth playback on mobile devices
   - **Voice Processing:** OpenAI Whisper integration reliability

3. **Security Validation:**
   - **RLS Policies:** Multi-tenant data isolation verified
   - **HIPAA Compliance:** Audit logging, encryption, access controls
   - **Authentication:** Role-based access properly enforced
   - **Data Protection:** Patient data properly secured

4. **Mobile Optimization:**
   - **Responsive Design:** Perfect on phones and tablets
   - **Touch Interactions:** Voice button, video controls optimized
   - **Performance:** Fast loading, smooth scrolling
   - **Offline Capability:** Basic functionality when connection poor

5. **Production Deployment:**
   - **Environment Variables:** All API keys and secrets configured
   - **Database Migrations:** Schema properly deployed
   - **CDN Setup:** Video and static assets optimized
   - **Monitoring:** Error tracking, performance monitoring

6. **Launch Readiness:**
   - **Demo Data:** Three patient personas ready for testing
   - **Training Materials:** Quick start guides for providers
   - **Support Documentation:** Troubleshooting and FAQ
   - **Backup Systems:** Data backup and recovery procedures

VALIDATION:
✅ Complete patient journey works end-to-end
✅ Real-time features perform under load
✅ Security and compliance verified
✅ Mobile experience optimized
✅ Production deployment successful
✅ Ready for partner testing and launch

Every time you perform actions related to the project, append your actions to docs/activity.md and read that file whenever you find it necessary to assist you.
```

---

## 🚀 IMPLEMENTATION STRATEGY

### **Day 1 (Today) - Foundation:**
- Prompts 1-3: Authentication, Patient Chat, Clinic Builder
- Focus on core functionality and database integration

### **Day 2 (Tomorrow) - Launch:**
- Prompts 4-6: Provider Dashboard, Modifications, Forms
- Prompts 7-9: Videos, Admin, Testing & Deployment

### **Success Metrics:**
- ✅ All demo users can log in and use their interfaces
- ✅ Patient chat delivers forms conversationally
- ✅ Clinic can create and modify patient journeys
- ✅ Real-time exercise modifications work
- ✅ Professional healthcare appearance throughout
- ✅ Mobile-optimized for patients 40+

### **Critical Success Factors:**
1. **Database Integration:** Every feature connects to our schema
2. **UI Consistency:** Follow shadcn-ui-kit-dashboard + ai-chat templates
3. **Conversational Flow:** Like conversational-form, AI speaks first
4. **Real-Time Features:** Instant modifications and monitoring
5. **Professional Appearance:** Healthcare-grade, not childish
6. **Mobile Optimization:** Perfect for patients 40+

