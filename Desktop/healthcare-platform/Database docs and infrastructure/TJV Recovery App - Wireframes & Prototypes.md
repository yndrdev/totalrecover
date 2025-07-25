# TJV Recovery App - Wireframes & Prototypes

## Patient Chat Interface Wireframes

### 1. Patient Login & Welcome Screen
```
┌─────────────────────────────────────────────────────────────┐
│                    TJV Recovery                             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │              Welcome Back, Sarah!                   │   │
│  │                                                     │   │
│  │         🏥 Day 5 of Your Recovery Journey           │   │
│  │                                                     │   │
│  │              [Continue to Chat] ──────────────────► │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2. Daily Check-in Chat Flow (AI Speaks First)
```
┌─────────────────────────────────────────────────────────────┐
│  Sarah M.                                    [Profile] 👤   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🤖 Good morning, Sarah! How are you feeling today?        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  😊 Great    😐 Okay    😔 Not Good    😣 Pain      │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  🤖 Perfect! Let's check your energy levels today.         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  ⚡ High Energy    🔋 Moderate    🪫 Low Energy      │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  🤖 Great! Time for today's exercise. Here's your video:   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ▶️ Knee Flexion Exercise - 5 minutes               │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │                                             │   │   │
│  │  │           [Video Player]                    │   │   │
│  │  │                                             │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                     │   │
│  │  [▶️ Start Exercise]  [❓ Need Help]               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  🎤 [Voice Input]     Type a message...     [Send] ➤       │
│                                                             │
│  [Progress]                              [Exercises]        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3. Post-Daily Tasks - Open Chat Mode (Like Manus.im)
```
┌─────────────────────────────────────────────────────────────┐
│  Sarah M.                                    [Profile] 👤   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🤖 Excellent work today, Sarah! You've completed all      │
│      your daily tasks. How do you feel?                    │
│                                                             │
│                                        Great! Thank you 💬 │
│                                                             │
│  🤖 You're doing amazing! Is there anything else I can     │
│      help you with today?                                  │
│                                                             │
│                                                             │
│                                                             │
│                                                             │
│                                                             │
│                                                             │
│                                                             │
│                                                             │
│                                                             │
│                                                             │
│                                                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  🎤 [Voice Input]     Ask me anything...    [Send] ➤       │
│                                                             │
│  [Progress]                              [Exercises]        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4. Form Completion in Chat (Conversational Style)
```
┌─────────────────────────────────────────────────────────────┐
│  Sarah M.                                    [Profile] 👤   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🤖 Time for your weekly pain assessment. Let's start      │
│      with your knee pain level today.                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Pain Level (1-10)                                  │   │
│  │                                                     │   │
│  │  1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣ 7️⃣ 8️⃣ 9️⃣ 🔟                │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                                                      4️⃣ 💬 │
│                                                             │
│  🤖 Good! A 4 is manageable. How would you describe        │
│      the type of pain?                                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  🔥 Sharp    ⚡ Shooting    🌊 Throbbing    😣 Aching │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  🎤 [Voice Input]     Type a message...     [Send] ➤       │
│                                                             │
│  [Progress]                              [Exercises]        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Admin/Clinic Backend Interface Wireframes

### 1. Provider Dashboard (Clean, No Sidebar)
```
┌─────────────────────────────────────────────────────────────┐
│  TJV Recovery Admin                          Dr. Johnson 👤 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 Practice Overview                    📅 Today: Jan 15   │
│                                                             │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│  │   Active        │ │   Completed     │ │   Alerts        │ │
│  │   Patients      │ │   Tasks Today   │ │   Requiring     │ │
│  │                 │ │                 │ │   Attention     │ │
│  │      47         │ │      156        │ │       3         │ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ │
│                                                             │
│  🔍 Search Patients...                    [+ Add Patient]   │
│                                                             │
│  📋 Recent Patient Activity                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Sarah M.    Day 5 TKA    ✅ Completed daily tasks  │   │
│  │  John D.     Day 12 THA   ⚠️  Missed exercise       │   │
│  │  Mary K.     Day 3 TKA    ✅ Completed check-in     │   │
│  │  Tom R.      Day 21 THA   🔴 High pain reported     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [📝 Forms]  [🎥 Videos]  [💪 Exercises]  [📊 Analytics]   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2. Patient Detail View (All Info in One Place)
```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Dashboard                        Dr. Johnson 👤  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  👤 Sarah Martinez - Day 5 TKA Recovery                     │
│                                                             │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│  │   Surgery Info  │ │   Progress      │ │   Current Plan  │ │
│  │                 │ │                 │ │                 │ │
│  │  TKA - Right    │ │   Day 5/84      │ │  Daily Check-in │ │
│  │  Jan 10, 2025   │ │   85% Complete  │ │  Knee Exercise  │ │
│  │  Dr. Smith      │ │   On Track ✅   │ │  Pain Assess.   │ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ │
│                                                             │
│  📊 Recent Activity                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Today 9:00 AM  ✅ Completed daily check-in         │   │
│  │  Today 9:15 AM  ✅ Watched knee flexion video       │   │
│  │  Today 9:30 AM  ✅ Completed exercise (5 reps)      │   │
│  │  Today 10:00 AM 📝 Pain level: 4/10 (improving)     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  💬 Chat History                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🤖 Good morning! How are you feeling?              │   │
│  │  👤 Much better today, thanks!                      │   │
│  │  🤖 Great! Ready for your exercise?                 │   │
│  │  👤 Yes, let's do it                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [📝 Add Task]  [📋 Modify Plan]  [💬 Send Message]        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3. Simple Content Upload Interface
```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Dashboard                        Dr. Johnson 👤  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📝 Content Management                                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  📄 Upload Medical Form                             │   │
│  │                                                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  Drag & Drop PDF Here                       │   │   │
│  │  │           or                                │   │   │
│  │  │      [Browse Files]                         │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                     │   │
│  │  Form Name: [Pain Assessment Weekly]               │   │
│  │  Assign to: [All TKA Patients] ▼                   │   │
│  │  Schedule:  Day [7] to Day [84], Every [7] days    │   │
│  │                                                     │   │
│  │              [Upload & Assign]                      │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  🎥 Upload Exercise Video                           │   │
│  │                                                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  Drag & Drop Video Here                     │   │   │
│  │  │           or                                │   │   │
│  │  │      [Browse Files]                         │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                     │   │
│  │  Video Name: [Knee Flexion - Beginner]             │   │
│  │  Assign to:  [Individual Patient] ▼                │   │
│  │  Schedule:   Day [3] to Day [14], [Daily]          │   │
│  │                                                     │   │
│  │              [Upload & Assign]                      │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4. Protocol Builder (Simple Timeline View)
```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Dashboard                        Dr. Johnson 👤  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🗓️ Recovery Protocol Builder - TKA Standard               │
│                                                             │
│  Day:  1    5    10   15   20   25   30   35   40   45     │
│       ├────┼────┼────┼────┼────┼────┼────┼────┼────┼────    │
│       │    │    │    │    │    │    │    │    │    │        │
│  📋   │ ✓  │ ✓  │ ✓  │ ✓  │ ✓  │ ✓  │ ✓  │ ✓  │ ✓  │ ✓      │ Daily Check-in
│       │    │    │    │    │    │    │    │    │    │        │
│  💪   │    │ ✓  │ ✓  │ ✓  │ ✓  │ ✓  │ ✓  │ ✓  │ ✓  │ ✓      │ Exercise Videos
│       │    │    │    │    │    │    │    │    │    │        │
│  📝   │    │    │ ✓  │    │    │ ✓  │    │    │ ✓  │        │ Pain Assessment
│       │    │    │    │    │    │    │    │    │    │        │
│  📚   │ ✓  │    │    │ ✓  │    │    │ ✓  │    │    │        │ Education
│       │    │    │    │    │    │    │    │    │    │        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Add Content to Day 15:                            │   │
│  │                                                     │   │
│  │  [📋 Form] [🎥 Video] [💪 Exercise] [📚 Education] │   │
│  │                                                     │   │
│  │  Selected: Pain Assessment Form                     │   │
│  │  Frequency: One-time ▼                             │   │
│  │                                                     │   │
│  │              [Add to Protocol]                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [💾 Save Protocol]  [👁️ Preview Patient View]            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Mobile Patient Interface (Responsive)
```
┌─────────────────────────┐
│  TJV Recovery    👤     │
├─────────────────────────┤
│                         │
│  🤖 Good morning!       │
│     How are you         │
│     feeling today?      │
│                         │
│  ┌─────────────────┐   │
│  │  😊 Great       │   │
│  └─────────────────┘   │
│  ┌─────────────────┐   │
│  │  😐 Okay        │   │
│  └─────────────────┘   │
│  ┌─────────────────┐   │
│  │  😔 Not Good    │   │
│  └─────────────────┘   │
│  ┌─────────────────┐   │
│  │  😣 Pain        │   │
│  └─────────────────┘   │
│                         │
│                         │
│                         │
│                         │
│                         │
│                         │
├─────────────────────────┤
│  🎤  Type message... ➤ │
│                         │
│  [Progress] [Exercises] │
└─────────────────────────┘
```

## Key Design Principles Shown:

### Patient Interface:
- **AI speaks first** (like conversational form site)
- **No sidebar** (as Charlie requested)
- **Clean chat interface** after daily tasks
- **Profile in top right**
- **Tertiary buttons** below input (not prominent)
- **Professional styling** for adults 40+
- **Mobile-first responsive design**

### Admin Interface:
- **No sidebar** - clean dashboard approach
- **Simple upload system** for forms and videos
- **Easy assignment** with day ranges and frequency
- **Centralized patient details** (not scattered)
- **Timeline-based protocol builder**
- **One-click content management**

These wireframes show exactly how the backend content management flows into the patient chat interface seamlessly!

