# REAL DATA SEEDING PROMPT FOR CLAUDE CODE

## 🎯 **PROMPT: Implement Real TJV Timeline Data Seeding (100 words)**

```
Create a data seeding function that populates the database with real TJV recovery timeline data. Add a "Seed Database" button in the protocol builder that inserts the complete TJV recovery protocol from Day -45 to Day +200. Include all real tasks, forms, exercises, and educational content from the TJV clinical protocols. Create functions to save protocols, assign tasks to specific days, and test the complete data flow from protocol creation to patient assignment. Ensure all database relationships work correctly and data persists properly. Add success/error feedback for each seeding operation.
```

## 📊 **REAL TJV TIMELINE DATA TO IMPLEMENT**

### **🏥 COMPLETE RECOVERY PROTOCOL**

#### **Phase 1: Enrollment & Scheduling (Day -45 to -15)**
```javascript
const enrollmentPhase = [
  {
    day: -45,
    tasks: [
      {
        type: 'message',
        title: 'Welcome to TJV Recovery',
        content: 'Welcome to your personalized recovery journey. We\'ll guide you every step of the way.',
        required: true
      },
      {
        type: 'form',
        title: 'Initial Health Assessment',
        content: 'Complete your baseline health questionnaire',
        questions: [
          'What is your current pain level (1-10)?',
          'List all current medications',
          'Do you have any allergies?',
          'Rate your current mobility (1-10)',
          'Any previous surgeries?'
        ],
        required: true
      }
    ]
  },
  {
    day: -30,
    tasks: [
      {
        type: 'video',
        title: 'Understanding Your Surgery',
        content: 'Educational video about TKA/THA procedures',
        url: 'https://example.com/surgery-education',
        duration: '15 minutes',
        required: true
      },
      {
        type: 'exercise',
        title: 'Pre-Surgery Strengthening',
        content: 'Begin gentle strengthening exercises to prepare for surgery',
        instructions: 'Perform 2 sets of 10 repetitions, twice daily',
        required: false
      }
    ]
  }
];
```

#### **Phase 2: Pre-Surgery Preparation (Day -14 to -1)**
```javascript
const preSurgeryPhase = [
  {
    day: -14,
    tasks: [
      {
        type: 'form',
        title: 'Pre-Surgery Checklist',
        content: 'Complete final preparations for surgery',
        questions: [
          'Have you stopped taking blood thinners as instructed?',
          'Do you have your post-surgery supplies ready?',
          'Transportation arranged for surgery day?',
          'Emergency contact information updated?'
        ],
        required: true
      },
      {
        type: 'message',
        title: 'Surgery Preparation Instructions',
        content: 'Important reminders for the days leading up to your surgery',
        required: true
      }
    ]
  },
  {
    day: -7,
    tasks: [
      {
        type: 'video',
        title: 'What to Expect on Surgery Day',
        content: 'Step-by-step guide for surgery day',
        url: 'https://example.com/surgery-day-guide',
        duration: '10 minutes',
        required: true
      },
      {
        type: 'form',
        title: 'Final Health Check',
        content: 'Last health assessment before surgery',
        questions: [
          'Any new symptoms or concerns?',
          'Current pain level (1-10)?',
          'Any signs of infection?',
          'Feeling prepared for surgery?'
        ],
        required: true
      }
    ]
  },
  {
    day: -1,
    tasks: [
      {
        type: 'message',
        title: 'Surgery Tomorrow - Final Reminders',
        content: 'Nothing to eat or drink after midnight. Arrive at hospital at scheduled time.',
        required: true
      }
    ]
  }
];
```

#### **Phase 3: Immediate Post-Surgery (Day 0 to 7)**
```javascript
const immediatePostSurgery = [
  {
    day: 0,
    tasks: [
      {
        type: 'message',
        title: 'Welcome to Recovery',
        content: 'Surgery complete! Your recovery journey begins now.',
        required: true
      },
      {
        type: 'form',
        title: 'Post-Surgery Check-in',
        content: 'How are you feeling after surgery?',
        questions: [
          'Pain level (1-10)?',
          'Nausea or dizziness?',
          'Able to move toes/ankle?',
          'Any unusual symptoms?'
        ],
        required: true,
        frequency: 'every_4_hours'
      }
    ]
  },
  {
    day: 1,
    tasks: [
      {
        type: 'exercise',
        title: 'Ankle Pumps',
        content: 'Begin gentle ankle movements to prevent blood clots',
        instructions: 'Pump ankles up and down, 10 times every hour while awake',
        required: true,
        frequency: 'hourly'
      },
      {
        type: 'form',
        title: 'Daily Recovery Check',
        content: 'Daily assessment of your recovery progress',
        questions: [
          'Pain level (1-10)?',
          'Sleep quality last night?',
          'Appetite returning?',
          'Wound appearance normal?',
          'Following medication schedule?'
        ],
        required: true,
        frequency: 'daily'
      }
    ]
  },
  {
    day: 3,
    tasks: [
      {
        type: 'video',
        title: 'Safe Transfer Techniques',
        content: 'How to safely get in/out of bed and chairs',
        url: 'https://example.com/safe-transfers',
        duration: '8 minutes',
        required: true
      },
      {
        type: 'exercise',
        title: 'Bed Exercises',
        content: 'Gentle exercises you can do in bed',
        instructions: 'Quad sets, glute squeezes, ankle pumps - 10 reps each, 3x daily',
        required: true
      }
    ]
  }
];
```

#### **Phase 4: Early Recovery (Day 8 to 30)**
```javascript
const earlyRecovery = [
  {
    day: 14,
    tasks: [
      {
        type: 'form',
        title: 'Two-Week Milestone Assessment',
        content: 'Important milestone check at 2 weeks',
        questions: [
          'Pain level (1-10)?',
          'Walking distance improved?',
          'Sleeping better?',
          'Wound healing well?',
          'Medication needs changing?',
          'Physical therapy started?'
        ],
        required: true
      },
      {
        type: 'video',
        title: 'Driving After Surgery',
        content: 'When and how to safely return to driving',
        url: 'https://example.com/driving-guide',
        duration: '6 minutes',
        required: false
      }
    ]
  },
  {
    day: 21,
    tasks: [
      {
        type: 'exercise',
        title: 'Advanced Walking Program',
        content: 'Increase walking distance and endurance',
        instructions: 'Walk 10-15 minutes, 2-3 times daily. Use assistive device as needed.',
        required: true
      },
      {
        type: 'form',
        title: 'Activity Progress Check',
        content: 'How are your daily activities progressing?',
        questions: [
          'Walking distance this week?',
          'Stairs manageable?',
          'Returning to normal activities?',
          'Energy levels improving?'
        ],
        required: true
      }
    ]
  }
];
```

#### **Phase 5: Advanced Recovery (Day 31 to 90)**
```javascript
const advancedRecovery = [
  {
    day: 45,
    tasks: [
      {
        type: 'form',
        title: '6-Week Milestone Assessment',
        content: 'Major milestone evaluation at 6 weeks',
        questions: [
          'Pain level (1-10)?',
          'Range of motion improving?',
          'Strength returning?',
          'Sleep quality good?',
          'Returning to work/activities?',
          'Overall satisfaction with progress?'
        ],
        required: true
      },
      {
        type: 'video',
        title: 'Return to Exercise',
        content: 'Guidelines for returning to recreational activities',
        url: 'https://example.com/return-to-exercise',
        duration: '12 minutes',
        required: true
      }
    ]
  },
  {
    day: 90,
    tasks: [
      {
        type: 'form',
        title: '3-Month Outcome Assessment',
        content: 'Comprehensive evaluation at 3 months',
        questions: [
          'Pain level (1-10)?',
          'Function compared to before surgery?',
          'Quality of life improvement?',
          'Would you recommend this surgery?',
          'Any ongoing concerns?',
          'Goals for next 3 months?'
        ],
        required: true
      },
      {
        type: 'exercise',
        title: 'Advanced Strengthening',
        content: 'Progress to more challenging exercises',
        instructions: 'Resistance training, balance work, sport-specific movements as appropriate',
        required: false
      }
    ]
  }
];
```

## 🔧 **IMPLEMENTATION REQUIREMENTS**

### **Database Seeding Function:**
```javascript
const seedTJVProtocol = async () => {
  // 1. Create main protocol
  const protocol = await createProtocol({
    name: 'Standard TJV Recovery Protocol',
    description: 'Complete recovery protocol from Day -45 to Day +200',
    surgery_types: ['TKA', 'THA'],
    total_days: 245
  });

  // 2. Seed all timeline data
  const allPhases = [
    ...enrollmentPhase,
    ...preSurgeryPhase,
    ...immediatePostSurgery,
    ...earlyRecovery,
    ...advancedRecovery
  ];

  // 3. Insert each day's tasks
  for (const dayData of allPhases) {
    await createProtocolDay({
      protocol_id: protocol.id,
      day_number: dayData.day,
      tasks: dayData.tasks
    });
  }

  // 4. Create forms, exercises, videos
  await seedFormsAndContent();
  
  return protocol;
};
```

### **Testing Requirements:**
1. **Protocol Creation** - Verify protocol saves to database
2. **Task Assignment** - Confirm tasks link to correct days
3. **Data Persistence** - Ensure data survives page refresh
4. **Patient Assignment** - Test assigning protocol to patients
5. **Chat Integration** - Verify tasks appear in patient chat
6. **Progress Tracking** - Confirm completion status updates

### **Success Criteria:**
- [ ] "Seed Database" button works without errors
- [ ] All 245 days of timeline data inserted
- [ ] Forms, exercises, videos properly linked
- [ ] Protocol appears in protocol builder
- [ ] Can assign protocol to test patient
- [ ] Patient sees correct tasks in chat interface
- [ ] Task completion updates database
- [ ] Progress tracking works correctly

## 🚀 **EXECUTION STEPS**

1. **Add Seed Button** to protocol builder interface
2. **Implement seeding functions** with real TJV data
3. **Test database connections** and data persistence
4. **Verify protocol assignment** to patients
5. **Test chat integration** with real tasks
6. **Validate progress tracking** and completion status

**This will prove your entire system is connected and working with real clinical data!**

