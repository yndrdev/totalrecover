# Nurse Exercise Modification Workflow

## Scenario: Modifying Patient Exercise in Real-Time

**Patient:** Sarah Martinez (Day 5 TKA Recovery)  
**Issue:** Sarah reports knee pain during current exercise  
**Nurse:** Jennifer (Physical Therapy Nurse)  
**Action Needed:** Modify exercise to lower intensity version

---

## Step-by-Step Workflow

### Step 1: Nurse Receives Alert/Notification
```
┌─────────────────────────────────────────────────────────────┐
│  TJV Recovery - Nurse Dashboard              Nurse Jen 👤   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔔 PATIENT ALERT                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ⚠️  Sarah Martinez - Exercise Difficulty            │   │
│  │                                                     │   │
│  │  Patient reported: "This exercise is causing       │   │
│  │  too much pain in my knee"                         │   │
│  │                                                     │   │
│  │  Current Exercise: Knee Flexion - Standard (5 reps)│   │
│  │  Pain Level: 7/10                                  │   │
│  │                                                     │   │
│  │  [View Patient Chat] [Modify Exercise] [Call Patient]│   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Step 2: Nurse Clicks "View Patient Chat" to See Context
```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Dashboard    Sarah Martinez Chat    Nurse Jen 👤 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  💬 Live Patient Chat (Read-Only View)                     │
│                                                             │
│  🤖 Great! Time for your knee flexion exercise.            │
│      Here's your video:                                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ▶️ Knee Flexion - Standard (5 reps)                │   │
│  │  [Currently Playing]                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                    This is causing too much pain 😣 💬     │
│                                                             │
│  🤖 I understand. Let me get your nurse to help            │
│      adjust your exercise.                                 │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🚨 NURSE INTERVENTION NEEDED                       │   │
│  │                                                     │   │
│  │  [Modify Exercise] [Send Message] [Schedule Call]   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Step 3: Nurse Clicks "Modify Exercise" - Quick Modification Interface
```
┌─────────────────────────────────────────────────────────────┐
│  Exercise Modification - Sarah Martinez     Nurse Jen 👤    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🎯 Current Exercise: Knee Flexion - Standard              │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Current Settings:                                  │   │
│  │  • Repetitions: 5                                  │   │
│  │  • Hold Time: 5 seconds                            │   │
│  │  • Sets: 2                                         │   │
│  │  • Difficulty: Standard                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  🔄 Quick Modifications:                                    │
│                                                             │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│  │  🟢 Reduce       │ │  🟡 Gentle      │ │  🔵 Alternative │ │
│  │  Intensity       │ │  Version        │ │  Exercise       │ │
│  │                 │ │                 │ │                 │ │
│  │  3 reps         │ │  Seated version │ │  Ankle pumps    │ │
│  │  3 sec hold     │ │  2 reps         │ │  instead        │ │
│  │  1 set          │ │  No hold        │ │                 │ │
│  │                 │ │                 │ │                 │ │
│  │  [Select] ✓     │ │  [Select]       │ │  [Select]       │ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ │
│                                                             │
│  📝 Message to Patient:                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  "I've adjusted your exercise to be gentler on     │   │
│  │  your knee. Try this reduced version and let me    │   │
│  │  know how it feels."                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [💾 Apply Changes & Notify Patient]                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Step 4: Changes Applied - Patient Chat Updates in Real-Time
```
┌─────────────────────────────────────────────────────────────┐
│  Sarah M.                                    [Profile] 👤   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🤖 I understand. Let me get your nurse to help            │
│      adjust your exercise.                                 │
│                                                             │
│                    This is causing too much pain 😣 💬     │
│                                                             │
│  👩‍⚕️ Hi Sarah! I've adjusted your exercise to be gentler   │
│      on your knee. Try this reduced version and let me     │
│      know how it feels.                                    │
│                                                             │
│  🤖 Here's your updated exercise:                          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ▶️ Knee Flexion - Gentle (3 reps)                  │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │                                             │   │   │
│  │  │           [Updated Video]                   │   │   │
│  │  │           Reduced intensity                 │   │   │
│  │  │                                             │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                     │   │
│  │  Changes: 3 reps (was 5), 3 sec hold (was 5)      │   │
│  │                                                     │   │
│  │  [▶️ Try New Exercise]  [Still Too Hard]           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  🎤 [Voice Input]     Type a message...     [Send] ➤       │
│                                                             │
│  [Progress]                              [Exercises]        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Step 5: Nurse Monitors Patient Response
```
┌─────────────────────────────────────────────────────────────┐
│  Sarah Martinez - Live Monitoring          Nurse Jen 👤     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 Real-Time Patient Response                              │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ✅ Patient started modified exercise                │   │
│  │  ⏱️  Exercise duration: 2 minutes                    │   │
│  │  💬 Patient message: "Much better! Thank you!"      │   │
│  │  📈 Pain level: Reduced from 7/10 to 3/10           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  🎯 Next Actions:                                           │
│                                                             │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│  │  📝 Update       │ │  📅 Schedule    │ │  💬 Send        │ │
│  │  Protocol        │ │  Follow-up      │ │  Encouragement  │ │
│  │                 │ │                 │ │                 │ │
│  │  Make this the  │ │  Check progress │ │  "Great job     │ │
│  │  new standard   │ │  tomorrow       │ │  adapting!"     │ │
│  │  for Sarah      │ │                 │ │                 │ │
│  │                 │ │                 │ │                 │ │
│  │  [Update]       │ │  [Schedule]     │ │  [Send]         │ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ │
│                                                             │
│  📋 Modification Log:                                       │
│  • 2:15 PM - Exercise modified due to pain (7/10)          │
│  • 2:18 PM - Patient completed modified version            │
│  • 2:20 PM - Pain reduced to 3/10, patient satisfied      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Alternative Modification Scenarios

### Scenario A: Nurse Wants to Replace Exercise Completely
```
┌─────────────────────────────────────────────────────────────┐
│  Exercise Replacement - Sarah Martinez                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔄 Replace Current Exercise                                │
│                                                             │
│  Current: Knee Flexion - Standard                          │
│                                                             │
│  📚 Recommended Alternatives:                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ✅ Ankle Pumps (Low Impact)                        │   │
│  │  ✅ Quad Sets (Isometric)                           │   │
│  │  ✅ Heel Slides (Gentle ROM)                        │   │
│  │  ✅ Seated Leg Extensions                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Select Alternative] → [Preview] → [Apply to Chat]        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Scenario B: Nurse Adds Additional Instructions
```
┌─────────────────────────────────────────────────────────────┐
│  Add Instructions - Sarah Martinez                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  💡 Additional Instructions for Patient:                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📝 Custom Message:                                 │   │
│  │                                                     │   │
│  │  "Sarah, apply ice for 10 minutes after this      │   │
│  │  exercise. If pain goes above 5/10, stop          │   │
│  │  immediately and message me."                      │   │
│  │                                                     │   │
│  │  🎤 [Record Voice Message]                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ⚙️ Quick Instructions:                                     │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│  │  🧊 Apply Ice    │ │  ⏱️ Take Breaks  │ │  📞 Call if     │ │
│  │  After Exercise │ │  Every 2 Reps   │ │  Pain > 5/10    │ │
│  │  [Add]          │ │  [Add]          │ │  [Add]          │ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ │
│                                                             │
│  [💾 Add to Exercise & Send]                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Features of This Workflow:

### ✅ **Real-Time Intervention**
- Nurse receives immediate alerts when patients report issues
- Can modify exercises instantly without patient leaving chat
- Changes appear immediately in patient's chat interface

### ✅ **Context-Aware Modifications**
- Nurse sees full chat context before making changes
- Quick modification options based on common scenarios
- Maintains conversation flow for patient

### ✅ **Professional Communication**
- Nurse messages appear with clear identification
- Professional tone while maintaining chat flow
- Patient knows a real person is helping them

### ✅ **Documentation & Tracking**
- All modifications are logged automatically
- Progress tracking continues with new parameters
- Audit trail for clinical documentation

### ✅ **Seamless Integration**
- No separate apps or interfaces for patient
- Everything happens within the chat they're already using
- Maintains the conversational, supportive experience

This workflow ensures that clinical expertise can be applied in real-time while maintaining the simple, chat-based experience for patients!

