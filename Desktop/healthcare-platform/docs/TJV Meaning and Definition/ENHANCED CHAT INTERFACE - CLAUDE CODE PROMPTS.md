# ENHANCED CHAT INTERFACE - CLAUDE CODE PROMPTS

## 🎯 **MANUS-STYLE CHAT WITH DAY NAVIGATION**

### **PROMPT 1: Chat Sidebar Foundation (95 words)**
```
Add a sidebar to the patient chat interface. Create a left sidebar showing recovery days from the patient's enrollment day to current day. Display each day as a clickable item with day number and date. Highlight the current day in blue. Use a clean, professional design with the sidebar taking 300px width and main chat area taking the remaining space. Include a header in the sidebar showing "Recovery Timeline" and patient's current day prominently.
```

### **PROMPT 2: Day Navigation & Chat History (100 words)**
```
Add day navigation functionality to the chat sidebar. When clicking a day in the sidebar, load that day's chat conversation in the main chat area. Store chat messages with day association in the database. Add a "Return to Today" button when viewing previous days. Show a visual indicator of which day is currently being viewed. Include loading states when switching between days. Ensure the chat input is disabled when viewing previous days and enabled only for the current day.
```

### **PROMPT 3: Profile Images & Provider Info (85 words)**
```
Add profile images to the chat interface. Display the patient's profile image in the chat header along with their name and current recovery day. Show provider profile images next to their messages in the chat. Add a small provider info card showing who is available (surgeon, nurse, physical therapist) with their profile pictures. Use placeholder avatar images for now. Style the profile images as circular with a professional healthcare appearance.
```

### **PROMPT 4: Task Indicators & Missed Items (110 words)**
```
Add task completion indicators to the sidebar days. For each day in the sidebar, show a small badge indicating if there are tasks for that day and their completion status. Use green checkmark for completed days, red warning icon for days with missed tasks, and blue dot for days with pending tasks. When hovering over a day with tasks, show a tooltip listing the tasks and their status. Add a "missed tasks" counter in the sidebar header showing total incomplete tasks across all previous days.
```

### **PROMPT 5: Task Recovery & Completion (95 words)**
```
Add the ability to complete missed tasks from previous days. When viewing a previous day with incomplete tasks, show the missed tasks in a special section above the chat messages. Include "Complete Now" buttons for each missed task that open the appropriate interface (form, exercise, video). Update the task status and sidebar indicators when tasks are completed. Add a success message when catching up on missed tasks. Ensure completed tasks update in real-time across the interface.
```

### **PROMPT 6: Enhanced Chat Experience (90 words)**
```
Enhance the overall chat experience with the new sidebar. Add smooth transitions when switching between days. Include a search function to find specific conversations or topics across all days. Add a "Today's Summary" section showing current day's tasks, completed items, and next steps. Include quick action buttons for common requests like "Contact Nurse" or "Report Pain". Style everything with a professional healthcare design using blue and white colors with proper spacing and typography.
```

## 📱 **VISUAL LAYOUT DESCRIPTION**

### **Sidebar (300px width):**
```
┌─────────────────────────────┐
│ 📅 Recovery Timeline        │
│ Current: Day -12            │
├─────────────────────────────┤
│ 🔴 Day -30 (2 missed tasks) │
│ ✅ Day -29                  │
│ ✅ Day -28                  │
│ 🔵 Day -27 (1 pending)     │
│ ...                         │
│ 🔵 Day -12 (current)       │
├─────────────────────────────┤
│ ⚠️ 3 missed tasks total     │
└─────────────────────────────┘
```

### **Main Chat Area:**
```
┌─────────────────────────────────────────┐
│ 👤 Sarah Johnson - Day -12             │
│ 👨‍⚕️ Dr. Smith, 👩‍⚕️ Nurse Kelly available │
├─────────────────────────────────────────┤
│                                         │
│ [Chat messages for selected day]        │
│                                         │
│ [If viewing previous day with missed    │
│  tasks, show task recovery section]     │
│                                         │
├─────────────────────────────────────────┤
│ [Message input - only enabled for      │
│  current day]                          │
└─────────────────────────────────────────┘
```

## 🎯 **EXECUTION ORDER**

### **Phase 1: Foundation**
1. **Prompt 1** → Create sidebar structure
2. **Prompt 2** → Add day navigation

### **Phase 2: Enhancement**  
3. **Prompt 3** → Add profile images
4. **Prompt 4** → Add task indicators

### **Phase 3: Functionality**
5. **Prompt 5** → Enable task recovery
6. **Prompt 6** → Polish the experience

## ✅ **SUCCESS CRITERIA**

### **After All Prompts:**
- [ ] Sidebar shows all recovery days with proper indicators
- [ ] Can navigate to any previous day's chat
- [ ] Profile images display for patient and providers
- [ ] Missed tasks clearly indicated with red badges
- [ ] Can complete missed tasks from previous days
- [ ] Professional healthcare appearance throughout
- [ ] Smooth transitions and loading states
- [ ] Current day highlighted and easily identifiable

### **User Experience Test:**
```
Patient should be able to:
1. See their recovery timeline in sidebar
2. Click Day -25 to review that conversation
3. Notice red indicator showing missed exercise
4. Complete the missed exercise directly
5. See indicator change to green checkmark
6. Return to current day conversation
7. Continue normal chat with updated task status
```

**This creates a comprehensive, Manus-style chat interface that solves real patient compliance issues while maintaining professional healthcare standards!**

