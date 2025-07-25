# TJV Smart Recovery App - Daily Tasks and Check-ins Specification

## Overview

The daily tasks and check-ins system is the core patient engagement component of the TJV Smart Recovery App. It provides personalized daily activities, progress monitoring, and regular check-ins tailored to each patient's surgery type, recovery phase, and individual progress.

## System Architecture

### Daily Task Categories

1. **Exercise Tasks** - Prescribed exercises based on current phase and progress
2. **Activity Tasks** - Walking, mobility, and functional activities
3. **Self-Care Tasks** - Wound care, medication management, and hygiene
4. **Educational Tasks** - Reading materials, watching videos, completing assessments
5. **Monitoring Tasks** - Pain tracking, range of motion measurements, symptom reporting

### Check-in Types

1. **Daily Check-ins** - Brief daily progress and symptom assessment
2. **Weekly Check-ins** - Comprehensive progress review and goal setting
3. **Milestone Check-ins** - Phase transition assessments
4. **Symptom-Triggered Check-ins** - Immediate assessment for concerning symptoms
5. **Care Team Check-ins** - Scheduled interactions with healthcare providers

## Daily Task Structure

### Task Framework

Each daily task contains the following components:

```json
{
  "task_id": "unique_identifier",
  "task_type": "exercise|activity|self_care|education|monitoring",
  "title": "task_name",
  "description": "detailed_instructions",
  "priority": "high|medium|low",
  "estimated_duration": "minutes",
  "phase_specific": "pre|1|2|3|4|5",
  "surgery_type": "TKA|THA|both",
  "difficulty_level": "low|general|advanced",
  "completion_criteria": "specific_requirements",
  "tracking_metrics": ["pain", "duration", "repetitions", "quality"],
  "reminders": {
    "frequency": "once|twice|three_times",
    "preferred_times": ["morning", "afternoon", "evening"],
    "custom_times": ["09:00", "14:00", "19:00"]
  },
  "dependencies": ["prerequisite_tasks"],
  "rewards": {
    "points": 10,
    "badges": ["consistency", "milestone"],
    "messages": ["Great job!", "Keep it up!"]
  }
}
```

## Phase-Specific Daily Tasks

### Pre-Surgery Phase

#### Daily Task List
1. **Pre-operative Exercises** (30 minutes)
   - Prescribed strengthening exercises
   - Range of motion activities
   - Balance and coordination work

2. **Educational Content** (15 minutes)
   - Surgery preparation videos
   - Post-operative expectation materials
   - Equipment familiarization

3. **Home Preparation** (Variable)
   - Shopping list completion
   - Home safety modifications
   - Care partner coordination

4. **Health Optimization** (Ongoing)
   - Medication compliance
   - Nutrition planning
   - Sleep hygiene

### Phase 1: Days 0-7 (Immediate Post-Op)

#### Daily Task List

**Morning Tasks:**
1. **Pain Assessment** (2 minutes)
   - Rate pain level (0-10 scale)
   - Identify pain location
   - Note pain triggers

2. **Ankle Pumps** (5 minutes)
   - 10 pumps every hour while awake
   - Circulation maintenance
   - Blood clot prevention

3. **Basic Mobility** (10 minutes)
   - Sit to stand practice
   - Walker-assisted walking
   - Bed mobility exercises

**Midday Tasks:**
4. **Prescribed Exercises** (15-20 minutes)
   - Phase 1 exercise routine
   - Focus on range of motion
   - Gentle strengthening

5. **Walking Activity** (5-10 minutes)
   - Hourly short walks with walker
   - Target: 3-5 minute sessions
   - Step count monitoring (750-1000 steps/day limit)

**Evening Tasks:**
6. **Wound Care Check** (5 minutes)
   - Visual inspection of incision
   - Note any changes or concerns
   - Photo documentation if needed

7. **Ice and Elevation** (30 minutes)
   - Ice application to surgical site
   - Leg elevation for swelling control
   - Relaxation and rest

8. **Medication Tracking** (2 minutes)
   - Record medication times
   - Note effectiveness
   - Track side effects

### Phase 2: Days 8-21 (Early Recovery)

#### Daily Task List

**Morning Tasks:**
1. **Range of Motion Assessment** (5 minutes)
   - Measure knee flexion (TKA patients)
   - Hip mobility check (THA patients)
   - Progress photo/video

2. **Advanced Exercises** (25-30 minutes)
   - Phase 2 exercise routine
   - Increased repetitions
   - Progressive strengthening

3. **Mobility Progression** (15 minutes)
   - Walker to cane transition
   - Stair climbing practice (if appropriate)
   - Balance activities

**Midday Tasks:**
4. **Functional Activities** (20 minutes)
   - Activities of daily living practice
   - Kitchen tasks
   - Light household activities

5. **Walking Program** (20-30 minutes)
   - Extended walking sessions
   - Gradual step count increase
   - Endurance building

**Evening Tasks:**
6. **Flexibility and Stretching** (15 minutes)
   - Gentle stretching routine
   - Joint mobility work
   - Relaxation exercises

7. **Progress Documentation** (5 minutes)
   - Exercise completion logging
   - Pain and function ratings
   - Goal achievement tracking

### Phase 3: Days 22-42 (Intermediate Recovery)

#### Daily Task List

**Morning Tasks:**
1. **Functional Assessment** (10 minutes)
   - Independent walking evaluation
   - Stair climbing assessment
   - Balance and coordination tests

2. **Strengthening Routine** (35-40 minutes)
   - Progressive resistance exercises
   - Multi-joint movements
   - Functional strengthening

**Midday Tasks:**
3. **Activity Progression** (30-45 minutes)
   - Community walking
   - Driving preparation (if cleared)
   - Return to work activities

4. **Advanced Mobility** (20 minutes)
   - Uneven surface walking
   - Dynamic balance activities
   - Sport-specific movements (if appropriate)

**Evening Tasks:**
5. **Recovery Activities** (20 minutes)
   - Foam rolling or massage
   - Heat/cold therapy
   - Stress management

### Phase 4: Days 43-84 (Advanced Recovery)

#### Daily Task List

**Morning Tasks:**
1. **Performance Testing** (15 minutes)
   - Functional movement screen
   - Strength assessments
   - Endurance measurements

2. **Advanced Exercise Program** (45-60 minutes)
   - High-intensity strengthening
   - Plyometric activities (if appropriate)
   - Sport-specific training

**Midday Tasks:**
3. **Return to Activity** (60+ minutes)
   - Work-related activities
   - Recreational pursuits
   - Social activities

**Evening Tasks:**
4. **Maintenance Program** (30 minutes)
   - Flexibility and mobility
   - Injury prevention exercises
   - Recovery protocols

## Check-in System

### Daily Check-in Structure

#### Quick Daily Assessment (2-3 minutes)

```json
{
  "daily_checkin": {
    "date": "YYYY-MM-DD",
    "pain_level": {
      "current": "0-10_scale",
      "worst_today": "0-10_scale",
      "location": "knee|hip|back|other",
      "triggers": ["movement", "rest", "weather", "activity"]
    },
    "sleep_quality": {
      "hours_slept": "number",
      "quality_rating": "1-5_scale",
      "sleep_position": "back|side|recliner",
      "interruptions": "pain|bathroom|other"
    },
    "mobility_status": {
      "assistive_device": "none|walker|cane|crutches",
      "walking_distance": "feet_or_meters",
      "stairs_climbed": "number_of_steps",
      "independence_level": "1-5_scale"
    },
    "exercise_completion": {
      "prescribed_exercises_done": "percentage",
      "walking_completed": "boolean",
      "duration_exercised": "minutes",
      "difficulty_level": "too_easy|appropriate|too_hard"
    },
    "symptoms": {
      "swelling": "none|mild|moderate|severe",
      "stiffness": "none|mild|moderate|severe",
      "numbness": "none|mild|moderate|severe",
      "other_concerns": "free_text"
    },
    "mood_energy": {
      "mood_rating": "1-5_scale",
      "energy_level": "1-5_scale",
      "motivation": "1-5_scale"
    }
  }
}
```

### Weekly Check-in Structure

#### Comprehensive Weekly Assessment (10-15 minutes)

```json
{
  "weekly_checkin": {
    "week_number": "post_surgery_week",
    "overall_progress": {
      "satisfaction_with_progress": "1-5_scale",
      "goal_achievement": "percentage",
      "biggest_challenge": "free_text",
      "greatest_success": "free_text"
    },
    "functional_improvements": {
      "activities_resumed": ["driving", "work", "shopping", "cooking"],
      "new_activities_attempted": "free_text",
      "independence_changes": "improved|same|declined",
      "confidence_level": "1-5_scale"
    },
    "exercise_program": {
      "exercise_compliance": "percentage",
      "exercise_difficulty": "too_easy|appropriate|too_hard",
      "favorite_exercises": "list",
      "challenging_exercises": "list",
      "modifications_needed": "boolean"
    },
    "pain_management": {
      "average_pain_level": "0-10_scale",
      "pain_trend": "improving|stable|worsening",
      "medication_usage": "increased|same|decreased|stopped",
      "pain_management_satisfaction": "1-5_scale"
    },
    "goals_for_next_week": {
      "primary_goal": "free_text",
      "secondary_goals": "list",
      "anticipated_challenges": "free_text",
      "support_needed": "free_text"
    }
  }
}
```

### Milestone Check-in Structure

#### Phase Transition Assessment (15-20 minutes)

```json
{
  "milestone_checkin": {
    "current_phase": "1|2|3|4|5",
    "target_phase": "2|3|4|5|maintenance",
    "readiness_assessment": {
      "physical_readiness": "1-5_scale",
      "confidence_level": "1-5_scale",
      "goal_achievement": "percentage",
      "provider_clearance": "boolean"
    },
    "functional_milestones": {
      "range_of_motion": "degrees_achieved",
      "walking_distance": "distance_without_assistance",
      "stair_climbing": "boolean",
      "driving_cleared": "boolean",
      "work_readiness": "boolean"
    },
    "outcome_measures": {
      "koos_jr_score": "0-100_scale", // for knee patients
      "hoos_jr_score": "0-100_scale", // for hip patients
      "forgotten_joint_score": "0-100_scale",
      "vr12_score": "physical_mental_component"
    },
    "next_phase_preparation": {
      "education_completed": "boolean",
      "equipment_ready": "boolean",
      "support_system": "boolean",
      "questions_concerns": "free_text"
    }
  }
}
```

## Smart Notifications and Reminders

### Notification Types

1. **Task Reminders**
   - Exercise time notifications
   - Medication reminders
   - Check-in prompts
   - Educational content alerts

2. **Progress Celebrations**
   - Milestone achievements
   - Streak maintenance
   - Goal completions
   - Phase transitions

3. **Motivational Messages**
   - Daily encouragement
   - Progress highlights
   - Success stories
   - Peer comparisons

4. **Alert Notifications**
   - Missed tasks
   - Concerning symptoms
   - Care team messages
   - Appointment reminders

### Adaptive Scheduling

The system adapts task scheduling based on:

- **Patient preferences** (morning person vs evening person)
- **Compliance patterns** (best completion times)
- **Pain cycles** (avoiding high-pain periods)
- **Life schedule** (work, family commitments)
- **Progress rate** (accelerating or slowing recovery)

## Gamification Elements

### Point System

- **Daily task completion:** 10-50 points per task
- **Streak bonuses:** 2x points for 7+ day streaks
- **Milestone achievements:** 100-500 bonus points
- **Early completion:** 1.5x points for tasks done ahead of schedule

### Badge System

- **Consistency badges:** 7-day, 30-day, 90-day streaks
- **Progress badges:** Phase completions, ROM milestones
- **Challenge badges:** Difficult exercise mastery, pain management
- **Community badges:** Peer support, story sharing

### Leaderboards (Optional)

- **Weekly progress leaders**
- **Exercise completion rates**
- **Milestone achievements**
- **Community engagement**

## Care Team Integration

### Provider Dashboard

Healthcare providers can monitor:

- **Real-time task completion rates**
- **Daily check-in responses**
- **Progress trend analysis**
- **Alert notifications for concerning patterns**
- **Patient communication logs**

### Intervention Triggers

Automatic alerts are generated for:

- **Missed tasks >3 days**
- **Pain levels >8 for >2 days**
- **Declining mobility scores**
- **Concerning symptom reports**
- **Exercise compliance <50%**

## Technical Implementation

### Database Schema

```sql
-- Daily tasks table
CREATE TABLE daily_tasks (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES patients(id),
  task_template_id UUID REFERENCES task_templates(id),
  scheduled_date DATE,
  completed_at TIMESTAMP,
  completion_status VARCHAR(20) DEFAULT 'pending',
  completion_data JSONB,
  notes TEXT
);

-- Check-ins table
CREATE TABLE patient_checkins (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES patients(id),
  checkin_type VARCHAR(50),
  checkin_date DATE,
  responses JSONB,
  calculated_scores JSONB,
  flags_triggered TEXT[],
  completed_at TIMESTAMP
);

-- Task templates table
CREATE TABLE task_templates (
  id UUID PRIMARY KEY,
  task_type VARCHAR(50),
  title VARCHAR(255),
  description TEXT,
  phase VARCHAR(10),
  surgery_type VARCHAR(10),
  difficulty_level VARCHAR(20),
  estimated_duration INTEGER,
  tracking_metrics TEXT[],
  completion_criteria JSONB
);
```

### API Endpoints

```javascript
// Get daily tasks for patient
GET /api/patients/{patientId}/tasks/daily?date={YYYY-MM-DD}

// Complete a task
POST /api/patients/{patientId}/tasks/{taskId}/complete

// Submit daily check-in
POST /api/patients/{patientId}/checkins/daily

// Get check-in history
GET /api/patients/{patientId}/checkins?type={daily|weekly|milestone}

// Get progress summary
GET /api/patients/{patientId}/progress/summary

// Update task schedule
PUT /api/patients/{patientId}/tasks/schedule
```

This daily tasks and check-ins system provides a comprehensive framework for engaging patients in their recovery process while providing healthcare teams with detailed progress monitoring and intervention capabilities.

