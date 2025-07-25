# UPDATED CHAT PROMPT WITH SIDEBAR NAVIGATION

## 🎯 **UPDATED PROMPT 9: Patient Chat with Sidebar Navigation**

### **ORIGINAL PROMPT 9 (Basic Chat):**
```
Create a patient chat interface at /patient/chat. Build a centered chat container with a header showing "Recovery Assistant" and current recovery day. Add a messages area with scrollable message bubbles (user messages on right, AI on left). Include an input area at the bottom with text input and send button. Use a clean, modern chat design with blue gradients in the header. Add basic message state management and display sample welcome message.
```

### **UPDATED PROMPT 9: Chat with Manus-Style Sidebar (110 words)**
```
Create a patient chat interface at /patient/chat with a Manus-style sidebar navigation. Add a 280px left sidebar showing recovery timeline from Day -45 to current day. Display each day as a clickable item with day number and completion indicators (green checkmarks for completed days, red warning icons for days with missed tasks, blue dots for pending tasks). The main chat area should be max-width 800px, centered, with header showing current day and "Recovery Assistant". Include scrollable message bubbles (user right, AI left) and bottom input area. Auto-scroll to latest message and auto-focus input. Use professional healthcare colors and clean typography matching Manus design.
```

## 🎯 **ADDITIONAL SIDEBAR FUNCTIONALITY PROMPTS:**

### **PROMPT 9A: Day Navigation Functionality (95 words)**
```
Add day navigation functionality to the chat sidebar. When clicking any previous day in the sidebar, load that day's conversation history from the database. Highlight the selected day in blue and show "Day X Chat" in the header. Include a "Return to Today" button when viewing previous days. Store conversation history by day in Supabase with proper date indexing. Add smooth transitions when switching between days and maintain scroll position in the chat area.
```

### **PROMPT 9B: Task Indicators and Missed Items (100 words)**
```
Add smart task indicators to the sidebar day navigation. Query the database for each day's tasks and show completion status: green checkmark for completed days, red warning icon for days with missed tasks, blue dot for days with pending tasks. Add hover tooltips showing task details ("2 exercises completed, 1 form pending"). When viewing a previous day with missed tasks, show a "Missed Tasks" section above the chat with "Complete Now" buttons. Update indicators in real-time when tasks are completed.
```

### **PROMPT 9C: Profile Images and Provider Info (90 words)**
```
Add profile images and provider information to the chat interface. Display patient profile image in the chat header next to their name. Show provider profile images next to AI messages (surgeon, nurse, PT based on message context). Add a "Your Care Team" section in the sidebar showing assigned providers with photos and availability status. Use circular profile images with professional healthcare styling. Include provider names and roles below their photos.
```

## 🎯 **COMPLETE SIDEBAR FEATURES:**

### **✅ What the Updated Prompts Will Create:**

#### **Manus-Style Sidebar (280px):**
- Recovery timeline from Day -45 to current day
- Clickable day navigation with smooth scrolling
- Current day highlighted in blue
- Professional healthcare styling

#### **Smart Task Indicators:**
- Green checkmarks for completed days
- Red warning icons for missed tasks
- Blue dots for pending tasks
- Hover tooltips with task details
- Real-time status updates

#### **Day Navigation:**
- Click any day to view that day's chat
- Load conversation history from database
- "Return to Today" button for easy navigation
- Smooth transitions between days

#### **Profile Integration:**
- Patient profile image in header
- Provider profile images next to messages
- Care team section with provider photos
- Professional circular avatars

#### **Missed Task Recovery:**
- Missed tasks section when viewing previous days
- "Complete Now" buttons for overdue items
- Real-time completion status updates
- Success messages for task completion

## 🚀 **EXECUTION ORDER:**

1. **Send Updated Prompt 9** → Creates sidebar and basic chat
2. **Send Prompt 9A** → Adds day navigation functionality  
3. **Send Prompt 9B** → Adds task indicators and missed items
4. **Send Prompt 9C** → Adds profile images and provider info

## 🎯 **RESULT:**

This will create a **professional healthcare chat interface** that matches Manus's clean design with:
- ✅ **Focused chat area** (800px max-width, centered)
- ✅ **Professional sidebar** (280px with day navigation)
- ✅ **Smart task indicators** (visual completion status)
- ✅ **Historical chat access** (view any previous day)
- ✅ **Profile integration** (patient and provider images)
- ✅ **Missed task recovery** (catch up on overdue items)
- ✅ **Clean, healthcare-focused design** (professional appearance)

**Use the Updated Prompt 9 to replace the original basic chat prompt in your build plan!**

