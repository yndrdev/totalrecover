// Real TJV Recovery Timeline Data - Complete Clinical Protocol
// From Day -45 (Enrollment) to Day +200 (Long-term Recovery)

export interface TimelineTask {
  day: number | string;
  type: "form" | "exercise" | "video" | "message";
  title: string;
  content: string;
  description?: string;
  questions?: string[];
  instructions?: string;
  url?: string;
  duration?: string;
  required: boolean;
  frequency?: {
    type?: 'hourly' | 'every_4_hours' | 'daily' | 'weekly';
    repeat?: boolean;
  };
}

export interface TimelinePhase {
  name: string;
  description: string;
  startDay: number;
  endDay: number;
  tasks: TimelineTask[];
}

// Phase 1: Enrollment & Scheduling (Day -45 to -15)
const enrollmentPhase: TimelineTask[] = [
  {
    day: -45,
    type: "message",
    title: "Welcome to TJV Recovery",
    content: "Welcome to your personalized recovery journey. We'll guide you every step of the way.",
    required: true
  },
  {
    day: -45,
    type: "form",
    title: "Initial Health Assessment",
    content: "Complete your baseline health questionnaire",
    questions: [
      "What is your current pain level (1-10)?",
      "List all current medications",
      "Do you have any allergies?",
      "Rate your current mobility (1-10)",
      "Any previous surgeries?"
    ],
    required: true
  },
  {
    day: -45,
    type: "video",
    title: "Welcome from Your Care Team",
    content: "Meet your surgeon and care navigator who will guide you through your recovery journey",
    url: "https://tjv-recovery.com/videos/welcome-team",
    duration: "5 minutes",
    required: true
  },
  {
    day: -30,
    type: "video",
    title: "Understanding Your Surgery",
    content: "Educational video about TKA/THA procedures",
    description: "Learn what to expect during your total joint replacement surgery",
    url: "https://tjv-recovery.com/videos/surgery-education",
    duration: "15 minutes",
    required: true
  },
  {
    day: -30,
    type: "exercise",
    title: "Pre-Surgery Strengthening",
    content: "Begin gentle strengthening exercises to prepare for surgery",
    instructions: "Perform 2 sets of 10 repetitions, twice daily",
    required: false
  },
  {
    day: -21,
    type: "form",
    title: "Pre-Surgery Planning",
    content: "Help us prepare for your surgery and recovery",
    questions: [
      "Who will be your primary caregiver after surgery?",
      "Do you have stairs in your home?",
      "What is your home bathroom setup?",
      "Any mobility aids currently in use?",
      "Preferred pharmacy for prescriptions?"
    ],
    required: true
  },
  {
    day: -21,
    type: "message",
    title: "Nutrition Guidelines",
    content: "Proper nutrition before surgery helps with healing. Focus on protein-rich foods, stay hydrated, and maintain a balanced diet.",
    required: true
  }
];

// Phase 2: Pre-Surgery Preparation (Day -14 to -1)
const preSurgeryPhase: TimelineTask[] = [
  {
    day: -14,
    type: "form",
    title: "Pre-Surgery Checklist",
    content: "Complete final preparations for surgery",
    questions: [
      "Have you stopped taking blood thinners as instructed?",
      "Do you have your post-surgery supplies ready?",
      "Transportation arranged for surgery day?",
      "Emergency contact information updated?",
      "Home prepared for recovery (clear pathways, grab bars, etc.)?"
    ],
    required: true
  },
  {
    day: -14,
    type: "message",
    title: "Surgery Preparation Instructions",
    content: "Important reminders for the days leading up to your surgery. Follow all pre-operative instructions from your surgical team.",
    required: true
  },
  {
    day: -14,
    type: "video",
    title: "Preparing Your Home",
    content: "How to set up your home for a safe recovery",
    url: "https://tjv-recovery.com/videos/home-preparation",
    duration: "8 minutes",
    required: true
  },
  {
    day: -7,
    type: "video",
    title: "What to Expect on Surgery Day",
    content: "Step-by-step guide for surgery day",
    url: "https://tjv-recovery.com/videos/surgery-day-guide",
    duration: "10 minutes",
    required: true
  },
  {
    day: -7,
    type: "form",
    title: "Final Health Check",
    content: "Last health assessment before surgery",
    questions: [
      "Any new symptoms or concerns?",
      "Current pain level (1-10)?",
      "Any signs of infection (fever, redness, swelling)?",
      "Feeling prepared for surgery?",
      "Questions for your surgical team?"
    ],
    required: true
  },
  {
    day: -5,
    type: "message",
    title: "Pre-Op Skin Wash Instructions",
    content: "You play an important part in helping to prevent wound infection. Use the 2% Chlorhexidine Gluconate (CHG) cloths as instructed the night before surgery.",
    required: true,
    frequency: { repeat: true }
  },
  {
    day: -2,
    type: "message",
    title: "48 Hours Until Surgery",
    content: "Review your pre-surgery checklist. Confirm your arrival time. Pack your hospital bag with comfortable clothes and personal items.",
    required: true
  },
  {
    day: -1,
    type: "message",
    title: "Surgery Tomorrow - Final Reminders",
    content: "Nothing to eat or drink after midnight. Use CHG cloths tonight. Arrive at hospital at scheduled time. Bring insurance cards and ID.",
    required: true
  }
];

// Phase 3: Immediate Post-Surgery (Day 0 to 7)
const immediatePostSurgery: TimelineTask[] = [
  {
    day: 0,
    type: "message",
    title: "Welcome to Recovery",
    content: "Surgery complete! Your recovery journey begins now. Rest and follow your care team's instructions.",
    required: true
  },
  {
    day: 0,
    type: "form",
    title: "Post-Surgery Check-in",
    content: "How are you feeling after surgery?",
    questions: [
      "Pain level (1-10)?",
      "Nausea or dizziness?",
      "Able to move toes/ankle?",
      "Any unusual symptoms?",
      "Comfort level with pain management?"
    ],
    required: true,
    frequency: { type: 'every_4_hours' }
  },
  {
    day: 1,
    type: "exercise",
    title: "Ankle Pumps",
    content: "Begin gentle ankle movements to prevent blood clots",
    instructions: "Pump ankles up and down, 10 times every hour while awake",
    required: true,
    frequency: { type: 'hourly' }
  },
  {
    day: 1,
    type: "form",
    title: "Daily Recovery Check",
    content: "Daily assessment of your recovery progress",
    questions: [
      "Pain level (1-10)?",
      "Sleep quality last night?",
      "Appetite returning?",
      "Wound appearance normal?",
      "Following medication schedule?",
      "Any concerns to report?"
    ],
    required: true,
    frequency: { type: 'daily', repeat: true }
  },
  {
    day: 1,
    type: "video",
    title: "Hospital Mobility Basics",
    content: "Safe movement techniques in the hospital",
    url: "https://tjv-recovery.com/videos/hospital-mobility",
    duration: "6 minutes",
    required: true
  },
  {
    day: 2,
    type: "message",
    title: "Pain Management Tips",
    content: "Stay ahead of pain by taking medications as scheduled. Use ice packs for 20 minutes at a time. Keep your leg elevated when resting.",
    required: true
  },
  {
    day: 3,
    type: "video",
    title: "Safe Transfer Techniques",
    content: "How to safely get in/out of bed and chairs",
    url: "https://tjv-recovery.com/videos/safe-transfers",
    duration: "8 minutes",
    required: true
  },
  {
    day: 3,
    type: "exercise",
    title: "Bed Exercises",
    content: "Gentle exercises you can do in bed",
    instructions: "Quad sets, glute squeezes, ankle pumps - 10 reps each, 3x daily",
    required: true
  },
  {
    day: 4,
    type: "message",
    title: "Wound Care Basics",
    content: "Keep your bandage clean and dry. Watch for signs of infection: increased redness, warmth, drainage, or fever.",
    required: true
  },
  {
    day: 5,
    type: "exercise",
    title: "Standing Exercises",
    content: "Progress to standing exercises with support",
    instructions: "Heel raises, mini squats, marching in place - as tolerated",
    required: false
  },
  {
    day: 6,
    type: "form",
    title: "One Week Progress Check",
    content: "Assess your progress at one week",
    questions: [
      "Overall pain level (1-10)?",
      "Mobility compared to day 1?",
      "Confidence with exercises?",
      "Any medication side effects?",
      "Questions for follow-up appointment?"
    ],
    required: true
  },
  {
    day: 7,
    type: "message",
    title: "Bandage Removal Instructions",
    content: "You may remove your bandage today. It's helpful to get the bandage wet in a warm shower and remove like a bandaid. You have dissolvable sutures and glue underneath.",
    required: true
  }
];

// Phase 4: Early Recovery (Day 8 to 30)
const earlyRecovery: TimelineTask[] = [
  {
    day: 8,
    type: "video",
    title: "Home Exercise Program",
    content: "Your complete home exercise routine",
    url: "https://tjv-recovery.com/videos/home-exercises",
    duration: "12 minutes",
    required: true
  },
  {
    day: 10,
    type: "message",
    title: "When Can I Return to Driving?",
    content: "Consider: Are you off narcotic pain medication? Can you safely enter/exit vehicle? Quick brake response? Check with your surgeon first.",
    required: true
  },
  {
    day: 10,
    type: "exercise",
    title: "Range of Motion Exercises",
    content: "Focus on improving joint flexibility",
    instructions: "Heel slides, knee bends, hip circles - 15 reps, 3x daily",
    required: true,
    frequency: { repeat: true }
  },
  {
    day: 14,
    type: "form",
    title: "Two-Week Milestone Assessment",
    content: "Important milestone check at 2 weeks",
    questions: [
      "Pain level (1-10)?",
      "Walking distance improved?",
      "Sleeping better?",
      "Wound healing well?",
      "Medication needs changing?",
      "Physical therapy started?",
      "Achieving daily goals?"
    ],
    required: true
  },
  {
    day: 14,
    type: "message",
    title: "Weaning Off Pain Medication",
    content: "You may be ready to start decreasing pain medication. It's ok if not - everyone recovers at their own pace. Discuss with your care team.",
    required: true
  },
  {
    day: 14,
    type: "video",
    title: "Returning to Daily Activities",
    content: "Guidelines for resuming normal activities",
    url: "https://tjv-recovery.com/videos/daily-activities",
    duration: "10 minutes",
    required: false
  },
  {
    day: 15,
    type: "exercise",
    title: "Walking Program",
    content: "Progressive walking to build endurance",
    instructions: "Walk 10-15 minutes, 2-3 times daily. Use assistive device as needed.",
    required: true,
    frequency: { repeat: true }
  },
  {
    day: 21,
    type: "form",
    title: "Activity Progress Check",
    content: "How are your daily activities progressing?",
    questions: [
      "Walking distance this week?",
      "Stairs manageable?",
      "Returning to normal activities?",
      "Energy levels improving?",
      "Physical therapy helping?",
      "Any setbacks or concerns?"
    ],
    required: true
  },
  {
    day: 21,
    type: "message",
    title: "Celebrating Three Weeks",
    content: "You've made it three weeks! Continue your exercises, stay active, and listen to your body. Recovery is a marathon, not a sprint.",
    required: true
  },
  {
    day: 28,
    type: "video",
    title: "One Month Recovery Tips",
    content: "What to expect in month two of recovery",
    url: "https://tjv-recovery.com/videos/month-two-preview",
    duration: "8 minutes",
    required: true
  },
  {
    day: 30,
    type: "message",
    title: "One Month Milestone",
    content: "Congratulations on your first month! Recovery varies - be patient with yourself. If your incision is healed, you may use vitamin E or lotion on your scar.",
    required: true
  }
];

// Phase 5: Advanced Recovery (Day 31 to 90)
const advancedRecovery: TimelineTask[] = [
  {
    day: 35,
    type: "exercise",
    title: "Strength Building Program",
    content: "Progress to more challenging exercises",
    instructions: "Add resistance bands or light weights as tolerated",
    required: false
  },
  {
    day: 40,
    type: "video",
    title: "Heart Healthy Exercises",
    content: "Cardiovascular fitness for recovery",
    url: "https://tjv-recovery.com/videos/cardio-exercises",
    duration: "10 minutes",
    required: false
  },
  {
    day: 45,
    type: "form",
    title: "6-Week Milestone Assessment",
    content: "Major milestone evaluation at 6 weeks",
    questions: [
      "Pain level (1-10)?",
      "Range of motion improving?",
      "Strength returning?",
      "Sleep quality good?",
      "Returning to work/activities?",
      "Overall satisfaction with progress?",
      "Goals for next 6 weeks?"
    ],
    required: true
  },
  {
    day: 45,
    type: "video",
    title: "Return to Exercise Guidelines",
    content: "Safe return to recreational activities",
    url: "https://tjv-recovery.com/videos/return-to-exercise",
    duration: "12 minutes",
    required: true
  },
  {
    day: 60,
    type: "message",
    title: "Two Month Progress",
    content: "Most patients see significant improvement by now. Continue PT exercises, stay active, and maintain healthy habits for optimal recovery.",
    required: true
  },
  {
    day: 60,
    type: "exercise",
    title: "Advanced Strengthening",
    content: "Progress to more challenging exercises",
    instructions: "Resistance training, balance work, sport-specific movements as appropriate",
    required: false
  },
  {
    day: 75,
    type: "form",
    title: "Pre-3-Month Check",
    content: "Prepare for your 3-month follow-up",
    questions: [
      "Current pain level (1-10)?",
      "Activity level compared to pre-surgery?",
      "Any lingering concerns?",
      "Questions for your surgeon?",
      "Satisfied with progress?"
    ],
    required: true
  },
  {
    day: 88,
    type: "message",
    title: "Completing Smart Recovery Program",
    content: "Congratulations on completing the smart recovery program! We wish you the best on your continued success. The messaging program will end on day 90.",
    required: true
  },
  {
    day: 88,
    type: "form",
    title: "Patient Reported Outcome Measures",
    content: "Final outcome assessment for your care team",
    questions: [
      "Overall satisfaction with surgery (1-10)?",
      "Pain compared to before surgery?",
      "Function compared to before surgery?",
      "Quality of life improvement?",
      "Would you recommend this surgery?",
      "Any ongoing concerns?"
    ],
    required: true
  },
  {
    day: 90,
    type: "form",
    title: "3-Month Comprehensive Assessment",
    content: "Complete evaluation at 3 months",
    questions: [
      "Pain level (1-10)?",
      "Function compared to before surgery?",
      "Quality of life improvement?",
      "Would you recommend this surgery?",
      "Any ongoing concerns?",
      "Goals for next 3 months?",
      "Need for continued PT?"
    ],
    required: true
  },
  {
    day: 90,
    type: "message",
    title: "Thank You and Continued Success",
    content: "Thank you for trusting us with your recovery journey. Continue your exercises and healthy lifestyle for long-term success!",
    required: true
  }
];

// Phase 6: Long-term Recovery (Day 91 to 200)
const longTermRecovery: TimelineTask[] = [
  {
    day: 120,
    type: "form",
    title: "4-Month Check-in",
    content: "Long-term recovery assessment",
    questions: [
      "Current pain level (1-10)?",
      "Activity level satisfaction?",
      "Any new concerns?",
      "Meeting personal goals?"
    ],
    required: false
  },
  {
    day: 120,
    type: "message",
    title: "Maintaining Your Progress",
    content: "Continue regular exercise, maintain healthy weight, and stay active. Your new joint should allow you to enjoy activities with less pain.",
    required: false
  },
  {
    day: 150,
    type: "form",
    title: "5-Month Progress",
    content: "Optional check-in",
    questions: [
      "How is your new joint feeling?",
      "Any limitations in activities?",
      "Questions or concerns?"
    ],
    required: false
  },
  {
    day: 180,
    type: "form",
    title: "6-Month Milestone",
    content: "Half-year comprehensive assessment",
    questions: [
      "Pain level (1-10)?",
      "Satisfaction with surgery outcome?",
      "Return to desired activities?",
      "Any ongoing concerns?",
      "Need for follow-up care?"
    ],
    required: true
  },
  {
    day: 180,
    type: "message",
    title: "6-Month Celebration",
    content: "Congratulations on reaching 6 months! Most recovery is complete, but continue to protect your joint with regular exercise and healthy habits.",
    required: true
  },
  {
    day: 200,
    type: "message",
    title: "Long-term Success",
    content: "Your active participation in recovery has brought you here. Remember annual check-ups and maintain your exercise routine for lasting success!",
    required: true
  }
];

// Compile all phases
export const completeTimelineData: TimelinePhase[] = [
  {
    name: "Enrollment & Scheduling",
    description: "Initial assessment and surgery preparation",
    startDay: -45,
    endDay: -15,
    tasks: enrollmentPhase
  },
  {
    name: "Pre-Surgery Preparation",
    description: "Final preparations before surgery",
    startDay: -14,
    endDay: -1,
    tasks: preSurgeryPhase
  },
  {
    name: "Immediate Post-Surgery",
    description: "Hospital stay and initial recovery",
    startDay: 0,
    endDay: 7,
    tasks: immediatePostSurgery
  },
  {
    name: "Early Recovery",
    description: "First month of home recovery",
    startDay: 8,
    endDay: 30,
    tasks: earlyRecovery
  },
  {
    name: "Advanced Recovery",
    description: "Building strength and returning to activities",
    startDay: 31,
    endDay: 90,
    tasks: advancedRecovery
  },
  {
    name: "Long-term Recovery",
    description: "Maintaining progress and long-term success",
    startDay: 91,
    endDay: 200,
    tasks: longTermRecovery
  }
];

// Export all tasks as a flat array
export const allTimelineTasks: TimelineTask[] = [
  ...enrollmentPhase,
  ...preSurgeryPhase,
  ...immediatePostSurgery,
  ...earlyRecovery,
  ...advancedRecovery,
  ...longTermRecovery
];

// Helper function to get tasks for a specific day
export function getTasksForDay(day: number): TimelineTask[] {
  return allTimelineTasks.filter(task => {
    const taskDay = typeof task.day === 'string' ? -45 : task.day;
    return taskDay === day;
  });
}

// Helper function to get phase name for a day
export function getPhaseForDay(day: number): string {
  for (const phase of completeTimelineData) {
    if (day >= phase.startDay && day <= phase.endDay) {
      return phase.name;
    }
  }
  return "Recovery";
}

// Stats about the timeline
export const timelineStats = {
  totalDays: 245, // From -45 to +200
  totalTasks: allTimelineTasks.length,
  phases: completeTimelineData.length,
  taskTypes: {
    forms: allTimelineTasks.filter(t => t.type === 'form').length,
    exercises: allTimelineTasks.filter(t => t.type === 'exercise').length,
    videos: allTimelineTasks.filter(t => t.type === 'video').length,
    messages: allTimelineTasks.filter(t => t.type === 'message').length
  }
};