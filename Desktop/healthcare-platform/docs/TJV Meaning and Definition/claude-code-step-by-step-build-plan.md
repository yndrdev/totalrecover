# TJV RECOVERY PLATFORM - CLAUDE CODE BUILD PLAN

## 🎯 **COMPLETE STEP-BY-STEP BUILD SEQUENCE**

### **PHASE 1: FOUNDATION (Prompts 1-3)**

#### **PROMPT 1: Database Connection & Auth (75 words)**
```
Create a Next.js app with Supabase integration for a healthcare platform. Set up authentication with email/password login. Create a simple login page with professional healthcare styling using Tailwind CSS. Include a dashboard layout component with sidebar navigation. Connect to Supabase and add basic user state management with React hooks.
```

#### **PROMPT 2: Provider Dashboard Layout (85 words)**
```
Add a provider dashboard to the app we just created. Create a main dashboard page at /provider/dashboard with a sidebar containing navigation links for Dashboard, Patients, Protocols, and Chat Monitor. Include a header with user info and logout. Add placeholder cards showing patient count, active recovery count, and recent activity. Use a clean, professional healthcare design with blue and white colors.
```

#### **PROMPT 3: Patient Data Display (90 words)**
```
Add patient data to the provider dashboard. Create a patients table component that fetches data from Supabase 'patients' table. Display patient name, surgery date, recovery day, and status. Include columns for assigned surgeon, nurse, and physical therapist. Add a "View Details" button for each patient. Use real Supabase queries and handle loading states. Style the table with alternating row colors and hover effects.
```

---

### **PHASE 2: PROTOCOL BUILDER (Prompts 4-8)**

#### **PROMPT 4: Calendar Timeline Foundation (95 words)**
```
Create a protocol builder page at /provider/protocols/builder. Add a horizontal calendar timeline showing recovery days from -45 to +200. Display days in a scrollable week view with 7 days visible at a time. Include week navigation arrows and current week indicator. Each day should show the day number and whether it's pre-op, surgery day, or post-op. Use a clean grid layout with Tailwind CSS and professional healthcare styling.
```

#### **PROMPT 5: Task Creation Modal (100 words)**
```
Add task creation to the protocol builder calendar. When clicking a day, open a modal to create tasks. Include form fields for task title, type (message, form, exercise, video), and content description. Add a task type selector with icons (💬 message, 📋 form, 🏃‍♂️ exercise, 🎥 video). Store tasks in component state with day number, title, type, and content. Close modal after saving and display a small task indicator on the calendar day.
```

#### **PROMPT 6: Task Display & Management (85 words)**
```
Display tasks on the calendar timeline we created. Show task cards on each day with task type icon, title, and type label. Use different colors for each task type (green for forms, purple for exercises, blue for videos, orange for messages). Add edit and delete buttons to each task card. Include a task counter badge on days with multiple tasks. Make task cards clickable to edit.
```

#### **PROMPT 7: Frequency Controls (110 words)**
```
Add frequency controls to the task creation modal. Include a "Repeat Task" checkbox that reveals start day and stop day inputs. Add a frequency preview showing "This task will appear daily from Day X to Day Y (Z days total)". When a task has frequency settings, display it on multiple days in the calendar with a "repeats" indicator. Update the task storage to include frequency object with startDay, stopDay, and repeat boolean. Show frequency info in task cards.
```

#### **PROMPT 8: List View Toggle (95 words)**
```
Add a list view option to the protocol builder. Create a toggle button to switch between calendar and list views. In list view, display all tasks in a vertical table with columns for day, task type, title, and frequency. Include sorting by day number and filtering by task type. Add bulk selection checkboxes and a delete selected button. Keep the same task data and management functions from the calendar view. Style consistently with the calendar view.
```

---

### **PHASE 3: CHAT SYSTEM (Prompts 9-12)**

#### **PROMPT 9: Chat Interface Foundation (100 words)**
```
Create a patient chat interface at /patient/chat. Build a centered chat container with a header showing "Recovery Assistant" and current recovery day. Add a messages area with scrollable message bubbles (user messages on right, AI on left). Include an input area at the bottom with text input and send button. Use a clean, modern chat design with blue gradients in the header. Add basic message state management and display sample welcome message.
```

#### **PROMPT 10: Message Types & Buttons (90 words)**
```
Add interactive message types to the chat interface. Create button messages that display multiple choice options as clickable buttons below the message. Add form messages that show inline form fields for collecting patient data. Include a typing indicator component. When buttons are clicked, add the selection to the chat and continue the conversation. Store message history in component state with message type, content, and user selections.
```

#### **PROMPT 11: OpenAI Integration (85 words)**
```
Add OpenAI integration to the chat system. Create an API route at /api/chat that sends messages to OpenAI GPT-4 with healthcare context. Include system prompts for recovery coaching and medical guidance. Add loading states while waiting for AI responses. Handle errors gracefully with fallback messages. Send patient recovery day and previous conversation context to provide personalized responses. Display AI responses as assistant messages in the chat.
```

#### **PROMPT 12: Provider Chat Monitor (95 words)**
```
Create a provider chat monitoring page at /provider/chat-monitor. Display a list of active patient conversations with patient name, last message time, and conversation status. Add a live chat view showing the patient's conversation in real-time. Include a provider intervention panel where providers can send messages or escalate issues. Add real-time updates using Supabase subscriptions. Style with a split layout showing conversation list on left and active chat on right.
```

---

### **PHASE 4: PATIENT EXPERIENCE (Prompts 13-15)**

#### **PROMPT 13: Patient Dashboard (100 words)**
```
Create a patient dashboard at /patient/dashboard. Display current recovery day prominently with progress visualization. Show today's tasks in cards with task type icons and completion status. Add a progress timeline showing completed vs upcoming milestones. Include quick access buttons for chat, exercises, and forms. Display assigned care team members (surgeon, nurse, PT) with contact options. Use encouraging, patient-friendly language and calming blue/green color scheme. Add completion checkmarks for finished tasks.
```

#### **PROMPT 14: Task Completion Flow (90 words)**
```
Add task completion functionality to the patient dashboard. When clicking a task card, open the appropriate interface (form, exercise video, educational content). Create a task completion modal with content display and completion button. Update task status in Supabase when completed. Add progress tracking and celebration animations for completed tasks. Include a "Mark Complete" button that updates the database and refreshes the dashboard. Show completion timestamps and progress indicators.
```

#### **PROMPT 15: Real-time Updates (85 words)**
```
Add real-time features using Supabase subscriptions. Update patient dashboard when new tasks are assigned or chat messages arrive. Add notification badges for unread messages and new tasks. Include live updates in provider chat monitor when patients send messages. Add connection status indicators and handle offline states. Use Supabase real-time subscriptions for instant updates across all components. Display toast notifications for important updates.
```

---

### **PHASE 5: INTEGRATION & POLISH (Prompts 16-18)**

#### **PROMPT 16: Navigation & Routing (80 words)**
```
Connect all pages with proper navigation and routing. Add protected routes that require authentication. Create role-based navigation (provider vs patient menus). Add breadcrumb navigation and active page indicators. Include a global navigation component with user profile dropdown and logout. Add loading states between page transitions. Ensure all links work correctly and maintain user session across page changes. Style navigation consistently with the healthcare theme.
```

#### **PROMPT 17: Data Integration & Validation (95 words)**
```
Replace all placeholder data with real Supabase queries. Add proper error handling and loading states throughout the app. Include form validation for all user inputs. Add data persistence for protocol builder, chat messages, and task completions. Create proper database relationships and foreign key constraints. Add user role checking and data filtering based on tenant/practice. Include retry logic for failed requests and offline handling. Test all CRUD operations work correctly.
```

#### **PROMPT 18: Final Polish & Testing (90 words)**
```
Add final polish to the entire application. Ensure consistent styling across all pages using the healthcare design system. Add responsive design for mobile devices. Include accessibility features like keyboard navigation and screen reader support. Add loading spinners, success messages, and error states. Test all user flows from login to task completion. Add performance optimizations and code cleanup. Include proper TypeScript types if using TypeScript. Verify all features work together seamlessly.
```

---

## 📋 **EXECUTION CHECKLIST**

### **Before Starting:**
- [ ] Have Supabase project ready with database URL and API keys
- [ ] Have OpenAI API key for chat functionality
- [ ] Review the UI design system colors and styling requirements

### **After Each Prompt:**
- [ ] Test the new feature works correctly
- [ ] Verify styling matches healthcare design standards
- [ ] Check that data persists properly in Supabase
- [ ] Ensure no errors in browser console

### **Success Criteria:**
- [ ] Providers can create recovery protocols with timeline
- [ ] Patients can complete tasks and chat with AI
- [ ] Real-time updates work across all interfaces
- [ ] Professional healthcare platform appearance
- [ ] All data integrates with Supabase correctly

## 🎯 **PROMPT EXECUTION TIPS**

### **For Each Prompt:**
1. **Copy the exact prompt text** (50-150 words)
2. **Wait for completion** before moving to next prompt
3. **Test the feature** works as expected
4. **Reference previous work** in follow-up prompts
5. **Keep prompts focused** on one feature at a time

### **If Claude Gets Stuck:**
- Break the prompt into smaller pieces
- Reference specific components by name
- Ask for just the core functionality first
- Add styling and polish in separate prompts

### **Success Pattern:**
```
Prompt → Test → Verify → Next Prompt → Repeat
```

**Start with Prompt 1 and work through sequentially. Each prompt builds on the previous work to create the complete TJV Recovery Platform!**

