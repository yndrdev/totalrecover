# TJV Smart Recovery App - Education System Specification

## Overview

The education system delivers personalized, phase-based educational content to patients throughout their total joint replacement journey. The system provides targeted information, instructional videos, and interactive content based on patient activity level, surgery type, and recovery phase.

## Education Framework

### Patient Segmentation

The education system categorizes patients into two primary groups:

1. **Active Adults** - Patients who can ambulate in community and participate in light to moderate activity/exercise
2. **Sedentary Adults** - Patients who cannot walk in community and require aids or assistance for shorter distances

### Content Delivery Phases

#### Phase 1: Enrollment and Scheduling
**Timeline:** Upon enrollment
**Focus:** Introduction and preparation

#### Phase 2: Pre-operative Appointment  
**Timeline:** 45 days before surgery
**Focus:** Surgery preparation and education

#### Phase 3: Pre-surgery Preparation
**Timeline:** 14 days before surgery
**Focus:** Final preparations and instructions

#### Phase 4: Post-surgery Recovery
**Timeline:** Day 0 through 12+ weeks
**Focus:** Recovery guidance and milestone education

#### Phase 5: Ongoing Check-ins
**Timeline:** Throughout recovery
**Focus:** Progress monitoring and troubleshooting

## Content Categories

### 1. Instructional Content
- Exercise demonstrations and techniques
- Proper use of assistive devices
- Home preparation guidelines
- Post-operative care instructions

### 2. Educational Videos
- Surgeon and care team introductions
- Virtual therapy sessions
- Equipment setup tutorials
- Recovery milestone explanations

### 3. Interactive Content
- Progress tracking tools
- Pain and symptom reporting
- Exercise logging
- Communication with care team

### 4. Reference Materials
- Surgery center maps and directions
- Equipment shopping lists
- Medication management guides
- Emergency contact information

## Phase-Specific Content

### Phase 1: Enrollment and Scheduling

#### Welcome and Introduction
**Content Type:** Video + Text
**Delivery:** Push notification upon enrollment

**Content:**
- Introduction to the care team (surgeon, nurse, physical therapists, clinical coordinators, medical assistants, athletic trainers, schedulers)
- Benefits of remote monitoring
- App navigation tutorial
- Importance of completing forms for progress tracking

#### Navigator and Surgeon Introduction
**Content Type:** Personalized video
**Delivery:** Push notification upon enrollment

**Content:**
- Welcome message from assigned surgeon
- Introduction to navigator/educator
- Overview of recovery journey
- Setting expectations for the program

#### Outcome Assessments
**Content Type:** Interactive forms
**Delivery:** Push notification upon enrollment

**Assessments:**
- HOOS Jr Hip Survey (Right or Left)
- KOOS Jr Knee Survey (Right or Left)
- Forgotten Joint Score
- VR-12 Quality of Life Assessment

#### Care Partner Identification
**Content Type:** Educational video + PDF
**Delivery:** Upon enrollment

**Content:**
- Importance of having a care partner
- Roles and responsibilities
- How to prepare care partners
- Communication strategies

### Phase 2: Pre-operative Appointment (-45 days)

#### Pre-op Shopping List
**Content Type:** Checklist + Links
**Delivery:** Push notification at -45 days

**Required Items:**
1. Rolling walker (with specific equipment recommendations)
2. Electrolyte drinks (Gatorade, Powerade)
3. Gauze pads and paper tape
4. Ace wrap (for knee patients)
5. Stool softener (Colace or equivalent)
6. Tylenol Extra Strength (if recommended by care team)

#### Tips and Tricks for Knee Patients
**Content Type:** Educational article
**Delivery:** Push notification at -30 days

**Content:**
- Day of surgery preparation tips
- Vehicle recommendations for transportation
- Home setup suggestions
- Clothing recommendations
- Recovery timeline expectations
- Pain and swelling management techniques

#### Virtual Therapy Introduction
**Content Type:** Video
**Delivery:** -45 days

**Content:**
- Introduction to remote monitoring concept
- Benefits of virtual therapy
- How to communicate with therapists
- Setting expectations for remote care

### Phase 3: Pre-surgery Preparation

#### Compression Stocking Instructions (TKA Only)
**Content Type:** Video + Text instructions
**Delivery:** -14 days

**Content:**
- Purpose of compression stockings
- Proper application technique
- Wearing schedule (2 weeks post-surgery)
- Care and maintenance instructions
- Video demonstration of easier application method

#### Pre-op Skin Wash Instructions
**Content Type:** Video + Checklist
**Delivery:** -5 days

**Content:**
- Importance of infection prevention
- Step-by-step CHG cloth instructions
- Do's and Don'ts list
- Timing guidelines
- Safety precautions

### Phase 4: Post-surgery Recovery

#### Day 0: Immediate Post-operative

**How to Sleep (Surgery-Specific)**

*Knee Protocol:*
- Back sleeping is optimal
- Pillow placement under calf (not knee)
- Side sleeping alternatives
- Recliner option if needed
- Positioning reminders before standing

*Hip Protocol:*
- Back sleeping preferred
- Side sleeping with pillow between legs
- Recliner alternative
- Movement preparation before standing

#### Day 1: Early Recovery

**Expectations After Surgery**
**Content Type:** Educational article

**Content:**
- Normal post-surgical symptoms (bruising, swelling, numbness)
- Clothing recommendations
- Constipation management
- Pain management expectations
- Timeline for improvement

**Why Ankle Pumps Are Important**
**Content Type:** Video demonstration

**Content:**
- Circulation benefits
- Blood clot prevention
- Proper technique
- Frequency recommendations

### Activity-Level Specific Content

#### For Active Adults

**Staying Active Prior to Surgery**
**Content:** 
- Target step count: 6,000-8,000 steps per day
- Benefits of maintaining activity
- Strategies for increasing daily steps
- Cardiovascular health maintenance

#### For Sedentary Adults

**Gentle Movement Strategies**
**Content:**
- Low-impact activity options
- Pain management techniques
- Adaptive exercises for limited mobility
- Breaking down activities into manageable segments
- Support system utilization

## Smart Knee Integration (Persona IQ)

### Pre-surgery Education (-30 days)

**Persona IQ Introduction**
**Content Type:** Educational article + links

**Content:**
- Smart knee technology overview
- Benefits of connected implant
- Data collection explanation
- mymobility app introduction
- Website and brochure links

### Post-surgery Setup (-2 to +6 days)

**Home Base Station Setup**
**Content Type:** Video tutorial + instructions

**Content:**
- Unboxing and setup instructions
- Placement guidelines (within 6 feet of bed)
- Web portal login process
- Troubleshooting common issues
- Support contact information (1-844-799-8208)

### Ongoing Monitoring (+7 days)

**Smart Knee Data Interpretation**
**Content Type:** Educational article

**Content:**
- Understanding data types (steps, range of motion)
- Data accuracy expectations
- Differences from phone/watch step counts
- Tibial motion goals (45-55 degrees)
- Care team monitoring explanation

## Content Delivery System

### Push Notification Strategy

```json
{
  "notification_types": {
    "educational_content": {
      "trigger": "timeline_based",
      "frequency": "as_scheduled",
      "priority": "medium"
    },
    "exercise_reminders": {
      "trigger": "time_based",
      "frequency": "daily",
      "priority": "high"
    },
    "milestone_achievements": {
      "trigger": "progress_based",
      "frequency": "as_earned",
      "priority": "high"
    },
    "check_in_reminders": {
      "trigger": "schedule_based",
      "frequency": "weekly",
      "priority": "medium"
    }
  }
}
```

### Content Personalization

The system personalizes content based on:

1. **Surgery Type** (TKA vs THA)
2. **Activity Level** (Active vs Sedentary)
3. **Recovery Phase** (Timeline-based)
4. **Progress Metrics** (ROM, pain levels, compliance)
5. **Smart Knee Integration** (If applicable)

### Content Library Structure

```json
{
  "content_item": {
    "id": "unique_identifier",
    "title": "content_title",
    "type": "video|article|checklist|interactive",
    "category": "instructional|educational|reference|assessment",
    "target_audience": "active|sedentary|all",
    "surgery_types": ["TKA", "THA", "both"],
    "delivery_phase": "enrollment|pre_op|post_op|ongoing",
    "delivery_timeline": "days_relative_to_surgery",
    "content_url": "link_to_content",
    "display_content": "preview_text",
    "duration": "estimated_time_to_complete",
    "prerequisites": ["required_prior_content"],
    "follow_up_actions": ["subsequent_content_or_tasks"],
    "tracking_metrics": ["completion", "engagement", "feedback"]
  }
}
```

## Interactive Features

### Progress Tracking Integration

Educational content is integrated with progress tracking:

- **Completion tracking** for all educational materials
- **Knowledge checks** to ensure understanding
- **Application verification** through exercise performance
- **Feedback collection** for content improvement

### Communication Tools

#### Care Team Messaging
- Direct messaging with assigned care team members
- Photo sharing for wound checks or exercise form
- Video calls for virtual consultations
- Emergency contact protocols

#### Peer Support (Future Enhancement)
- Patient community forums
- Success story sharing
- Peer mentorship programs
- Group educational sessions

## Assessment and Feedback

### Content Effectiveness Metrics

1. **Engagement Metrics**
   - Content completion rates
   - Time spent on materials
   - Return visits to content
   - Sharing frequency

2. **Learning Outcomes**
   - Knowledge check scores
   - Practical application success
   - Behavior change indicators
   - Self-reported confidence levels

3. **Clinical Outcomes**
   - Correlation with recovery milestones
   - Complication reduction
   - Patient satisfaction scores
   - Healthcare utilization patterns

### Continuous Improvement

The system incorporates feedback loops:

- **Patient feedback** on content usefulness
- **Care team input** on clinical effectiveness
- **Usage analytics** for optimization
- **Outcome correlation** for evidence-based updates

## Technical Implementation

### Content Management System

```sql
-- Content library table
CREATE TABLE educational_content (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  target_audience VARCHAR(50),
  surgery_types TEXT[],
  delivery_phase VARCHAR(50),
  delivery_timeline INTEGER, -- days relative to surgery
  content_url VARCHAR(500),
  display_content TEXT,
  duration INTEGER, -- minutes
  prerequisites TEXT[],
  follow_up_actions TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Content delivery tracking
CREATE TABLE content_delivery (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES patients(id),
  content_id UUID REFERENCES educational_content(id),
  delivered_at TIMESTAMP,
  opened_at TIMESTAMP,
  completed_at TIMESTAMP,
  engagement_score INTEGER,
  feedback_rating INTEGER,
  feedback_comments TEXT
);

-- Push notifications
CREATE TABLE push_notifications (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES patients(id),
  content_id UUID REFERENCES educational_content(id),
  notification_type VARCHAR(50),
  scheduled_for TIMESTAMP,
  sent_at TIMESTAMP,
  opened_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending'
);
```

### API Endpoints

```javascript
// Get educational content for patient
GET /api/patients/{patientId}/education

// Mark content as completed
POST /api/patients/{patientId}/education/{contentId}/complete

// Submit content feedback
POST /api/patients/{patientId}/education/{contentId}/feedback

// Get content library
GET /api/education?surgeryType={type}&phase={phase}&audience={audience}

// Schedule content delivery
POST /api/patients/{patientId}/education/schedule

// Get patient progress on educational content
GET /api/patients/{patientId}/education/progress
```

### Content Delivery Algorithm

```javascript
function scheduleEducationalContent(patient) {
  const {
    surgeryType,
    surgeryDate,
    activityLevel,
    currentPhase,
    smartKneeEnabled
  } = patient;

  // Calculate days relative to surgery
  const daysFromSurgery = calculateDaysFromSurgery(surgeryDate);
  
  // Get applicable content
  let content = contentLibrary.filter(item => {
    return item.surgery_types.includes(surgeryType) &&
           item.target_audience.includes(activityLevel) &&
           item.delivery_timeline <= daysFromSurgery &&
           !isAlreadyDelivered(patient.id, item.id);
  });

  // Add smart knee content if applicable
  if (smartKneeEnabled) {
    content = content.concat(getSmartKneeContent(daysFromSurgery));
  }

  // Schedule delivery
  content.forEach(item => {
    scheduleNotification(patient.id, item.id, item.delivery_timeline);
  });

  return content;
}
```

This education system specification provides a comprehensive framework for delivering personalized, timeline-based educational content that supports patients throughout their total joint replacement journey.

