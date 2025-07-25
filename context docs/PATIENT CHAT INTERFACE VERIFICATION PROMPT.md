# PATIENT CHAT INTERFACE VERIFICATION PROMPT

## CRITICAL VERIFICATION REQUIRED - PATIENT CHAT INTERFACE

**MANDATORY DOCUMENTATION TRACKING:**
Every time you perform actions related to this project, append your actions to `docs/activity.md` and read that file whenever you find it necessary to assist you. Please include every prompt I give.

---

## IMMEDIATE ACTION REQUIRED

You MUST verify that the patient chat interface is implemented EXACTLY according to specifications. This is the CORE feature that patients will use - it must be perfect.

### VERIFICATION CHECKLIST - PATIENT CHAT INTERFACE

#### ✅ **1. DESIGN COMPLIANCE VERIFICATION**
**Check these EXACT requirements:**
- [ ] NO SIDEBAR - Patient interface must have zero sidebar elements
- [ ] AI SPEAKS FIRST - Every conversation starts with AI message, not patient input
- [ ] Professional styling for adults 40+ (NOT childish or educational app styling)
- [ ] Brand colors implemented: #002238, #006DB1, #C8DBE9, #FFFFFF
- [ ] shadcn/ui components used correctly
- [ ] Matches https://shadcnuikit.com/dashboard/apps/ai-chat design patterns
- [ ] Profile avatar in top right corner
- [ ] Two tertiary buttons below input (Progress, Exercises) - subtle, not prominent

**REFERENCE:** `/Claude_Docs/docs/wireframes.md` and https://space10-community.github.io/conversational-form/landingpage/

#### ✅ **2. CONVERSATIONAL FLOW VERIFICATION**
**Test these EXACT scenarios:**
- [ ] Patient logs in → AI immediately greets them with personalized message
- [ ] Daily check-in flows conversationally (AI asks questions, patient responds)
- [ ] Exercise delivery through chat (video embedded in chat messages)
- [ ] Form completion happens within chat (no separate pages)
- [ ] After daily tasks complete → returns to open chat mode (like Manus.im)
- [ ] Voice input works with OpenAI Whisper integration

**REFERENCE:** `/Claude_Docs/docs/features/02-patient-chat-interface.md`

#### ✅ **3. TECHNICAL IMPLEMENTATION VERIFICATION**
**Verify these EXACT technical requirements:**
- [ ] Real-time messaging with WebSocket/SSE
- [ ] OpenAI GPT-4 integration for AI responses
- [ ] OpenAI Whisper for voice-to-text
- [ ] Proper tenant isolation (test with multiple patients)
- [ ] HIPAA-compliant message storage
- [ ] Mobile-responsive design (test on mobile devices)
- [ ] Voice input button with proper recording feedback

**REFERENCE:** `/Claude_Docs/docs/features/02-patient-chat-interface.md` technical specifications

#### ✅ **4. USER EXPERIENCE VERIFICATION**
**Test these EXACT user flows:**

**Flow 1: New Patient First Login**
1. Patient logs in for first time
2. AI should immediately say: "Welcome [Name]! I'm your recovery assistant..."
3. AI should explain the system and ask how they're feeling
4. Patient should be able to respond via text or voice
5. Conversation should feel natural and supportive

**Flow 2: Daily Check-in**
1. Patient returns for daily tasks
2. AI should greet them: "Good morning [Name]! Ready for today's check-in?"
3. AI should ask about mood, pain, energy (with interactive cards/buttons)
4. Patient responses should trigger appropriate follow-up questions
5. Should feel like conversation, not a form

**Flow 3: Exercise Delivery**
1. AI should say: "Time for your exercise! Here's today's video:"
2. Video should appear embedded in chat message
3. Patient should be able to start/pause video within chat
4. AI should ask for feedback after completion
5. No navigation away from chat interface

**Flow 4: Post-Tasks Open Chat**
1. After completing daily tasks
2. AI should say: "Great work! You've completed everything for today."
3. Interface should return to open chat mode
4. Patient should be able to ask any questions
5. Should feel like ChatGPT/Claude interface

#### ✅ **5. INTEGRATION VERIFICATION**
**Verify these EXACT integrations:**
- [ ] Exercise videos play within chat messages
- [ ] Forms appear as conversational elements in chat
- [ ] Task completion updates patient progress
- [ ] Nurse interventions appear seamlessly in chat
- [ ] Voice messages from staff appear in chat
- [ ] All interactions logged for clinical review

**REFERENCE:** `/Claude_Docs/docs/features/07-nurse-intervention-system.md`

#### ✅ **6. MOBILE EXPERIENCE VERIFICATION**
**Test on actual mobile devices:**
- [ ] Chat interface works perfectly on phones
- [ ] Voice input button is easily accessible
- [ ] Text is readable without zooming
- [ ] Touch targets are appropriately sized
- [ ] Scrolling is smooth and natural
- [ ] Video playback works on mobile

---

## FAILURE CONDITIONS - IMMEDIATE FIX REQUIRED

**If ANY of these exist, the implementation is WRONG:**
- ❌ Separate pages for check-ins, exercises, or forms
- ❌ Sidebar navigation elements
- ❌ Patient has to initiate conversations
- ❌ Childish or educational app styling
- ❌ Complex form interfaces outside of chat
- ❌ Navigation away from chat for any patient tasks
- ❌ Non-responsive mobile experience
- ❌ Voice input not working properly

---

## TESTING INSTRUCTIONS

### **Step 1: Create Test Patient Account**
1. Create a test patient: "Sarah Martinez, Day 5 TKA Recovery"
2. Log in as this patient
3. Document EXACTLY what happens

### **Step 2: Test Each User Flow**
1. Test new patient login experience
2. Test daily check-in flow
3. Test exercise delivery
4. Test form completion
5. Test post-tasks open chat
6. Test voice input functionality

### **Step 3: Mobile Testing**
1. Open on mobile device
2. Test all interactions on touch screen
3. Verify voice input works on mobile
4. Check responsive design

### **Step 4: Integration Testing**
1. Test nurse intervention (have nurse modify exercise)
2. Verify real-time updates work
3. Test multi-tenant isolation

---

## REPORTING REQUIREMENTS

**You MUST provide:**
1. **Screenshots** of each major interface state
2. **Detailed description** of what works vs. what doesn't
3. **Specific fixes needed** for any issues found
4. **Confirmation** that ALL verification points pass

**Remember:** This is a healthcare platform for adults recovering from surgery. The experience must be professional, supportive, and flawless. No shortcuts, no "good enough" - it must be perfect.

**Document everything in `docs/activity.md` including this verification process and results.**



---

## REQUIRED TEST PERSONAS & SCENARIOS

### **PERSONA 1: PRE-SURGERY PATIENT**
**Profile:** Maria Rodriguez, 52, scheduled for TKA in 2 weeks
**Test Scenario:** Complete pre-operative forms and questionnaires

**REQUIRED FORMS TO TEST:**
1. **Universal Medical Questionnaire** (from `/Claude_Docs/docs/features/04-pre-surgery-forms-questionnaires.md`)
   - Medical history questions
   - Previous surgeries documentation
   - Current medications and allergies
   - Family medical history

2. **Medication Documentation**
   - Current medications list
   - Dosages and frequencies
   - Drug allergies with reaction descriptions
   - Over-the-counter medications and supplements

3. **Informed Consent Process**
   - Surgery risks and benefits explanation
   - Digital signature capability
   - Question and answer session

**SPECIFIC QUESTIONS TO TEST:**
- "Do you have any allergies to medications?"
- "List all current medications including dosage"
- "Have you had any previous surgeries?"
- "Do you have diabetes, heart disease, or high blood pressure?"
- "Are you taking any blood thinners?"

**EXPECTED CHAT FLOW:**
```
🤖 "Hi Maria! I'm your recovery assistant. Let's complete your pre-surgery forms together. How are you feeling about your upcoming surgery?"

👤 [Patient responds]

🤖 "Great! Let's start with your medical history. Do you have any allergies to medications?"

[Interactive buttons: Yes / No / Not Sure]
```

### **PERSONA 2: EARLY POST-SURGERY PATIENT**
**Profile:** John Smith, 58, Day 5 post-TKA surgery
**Test Scenario:** Daily check-ins, pain management, early exercises

**REQUIRED DAILY TASKS TO TEST:**
1. **Daily Check-in Questions**
   - Pain level assessment (1-10 scale)
   - Mood and energy levels
   - Sleep quality
   - Incision site inspection

2. **Early Recovery Exercises**
   - Ankle pumps
   - Quad sets
   - Heel slides
   - Knee flexion exercises

3. **Pain and Symptom Tracking**
   - Pain location and intensity
   - Swelling assessment
   - Medication effectiveness
   - Side effects monitoring

**SPECIFIC QUESTIONS TO TEST:**
- "How is your pain level today on a scale of 1-10?"
- "How did you sleep last night?"
- "Have you noticed any increased swelling or redness?"
- "Are you taking your pain medication as prescribed?"
- "How are you feeling emotionally today?"

**EXPECTED CHAT FLOW:**
```
🤖 "Good morning John! Day 5 of your recovery - you're doing great! Let's start with your daily check-in. How is your pain level today?"

[Pain scale 1-10 with emoji indicators]

🤖 "A 4 is manageable! How did you sleep last night?"

[Sleep quality options: Great / Good / Fair / Poor]

🤖 "Good to hear! Ready for today's exercises? Let's start with ankle pumps."

[Video embedded in chat with exercise instructions]
```

### **PERSONA 3: ADVANCED RECOVERY PATIENT**
**Profile:** Sarah Johnson, 45, Day 45 post-THA surgery
**Test Scenario:** Advanced exercises, return to activities, long-term planning

**REQUIRED ADVANCED TASKS TO TEST:**
1. **Advanced Exercise Program**
   - Strength training exercises
   - Balance and stability work
   - Functional movement patterns
   - Return to activity assessments

2. **Functional Assessment**
   - Walking distance and endurance
   - Stair climbing ability
   - Return to work readiness
   - Driving assessment

3. **Long-term Planning**
   - Activity modification discussions
   - Long-term exercise planning
   - Follow-up appointment scheduling
   - Maintenance program setup

**SPECIFIC QUESTIONS TO TEST:**
- "How far can you walk without discomfort?"
- "Are you ready to return to work?"
- "Have you been able to drive safely?"
- "What activities are you most excited to return to?"
- "How confident do you feel about your recovery progress?"

**EXPECTED CHAT FLOW:**
```
🤖 "Hi Sarah! Day 45 - you're in the advanced recovery phase! How are you feeling about your progress?"

👤 [Patient responds]

🤖 "Excellent! Let's assess your functional abilities. How far can you walk comfortably now?"

[Distance options: < 1 block / 1-3 blocks / 3-5 blocks / > 5 blocks]

🤖 "That's fantastic progress! Ready for today's strength training exercises?"

[Advanced exercise video with progression tracking]
```

---

## SPECIFIC FORM TESTING REQUIREMENTS

### **PRE-SURGERY FORMS TO IMPLEMENT AND TEST:**
1. **Universal Medical Questionnaire**
   - 25+ medical history questions
   - Medication documentation with OCR scanning
   - Allergy documentation with severity levels
   - Previous surgery history with dates and outcomes

2. **Informed Consent Forms**
   - Surgery-specific risk explanations
   - Digital signature capability
   - Witness signature options
   - Question and clarification process

3. **Medical Clearance Forms**
   - Cardiac risk assessment
   - Dental clearance requirements
   - Specialist clearance tracking
   - Lab work and imaging requirements

### **POST-SURGERY ASSESSMENT FORMS TO TEST:**
1. **Daily Pain and Symptom Tracking**
   - Pain level (1-10 scale with descriptors)
   - Pain location mapping
   - Swelling assessment
   - Medication effectiveness tracking

2. **Functional Assessment Forms**
   - Range of motion measurements
   - Walking distance and endurance
   - Activities of daily living checklist
   - Return to work/activity readiness

3. **Weekly Progress Assessments**
   - Overall satisfaction with recovery
   - Goal achievement tracking
   - Concerns or questions for care team
   - Quality of life measurements

---

## TESTING VALIDATION REQUIREMENTS

**For Each Persona, Verify:**
1. ✅ All forms appear conversationally in chat (no separate pages)
2. ✅ Voice input works for all question types
3. ✅ Progress is saved automatically
4. ✅ Responses trigger appropriate follow-up questions
5. ✅ Medical terminology is explained clearly
6. ✅ Forms adapt based on previous responses
7. ✅ Completion triggers appropriate next steps
8. ✅ All data is properly stored with tenant isolation

**Document in `docs/activity.md`:**
- Each persona testing session
- All forms and questions tested
- Any issues or improvements needed
- Screenshots of each major form interaction
- Verification that all acceptance criteria are met

