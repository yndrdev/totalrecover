# Feature 6: Exercise System with Video Integration

## Overview

The Exercise System with Video Integration provides a comprehensive digital physical therapy platform that guides patients through their rehabilitation exercises with high-quality instructional videos, real-time feedback, and progress tracking. This feature combines evidence-based exercise protocols with modern video streaming technology, motion tracking capabilities, and AI-powered form analysis to deliver personalized physical therapy experiences that rival in-person sessions while providing detailed analytics for healthcare providers.

## Design Philosophy

The exercise system is designed to feel like having a personal physical therapist available 24/7. It emphasizes clear visual instruction, safety, and gradual progression while maintaining engagement through gamification elements and progress visualization. The system prioritizes patient safety by providing clear contraindications, proper form instruction, and automatic difficulty adjustments based on patient feedback and performance.

## User Stories

### Epic: Comprehensive Exercise Library and Delivery

**As a Patient, I want access to a comprehensive library of rehabilitation exercises with clear video instructions so that I can perform my exercises correctly and safely.**

#### User Story 6.1: Interactive Exercise Video Player
**As a Patient, I want to watch high-quality exercise videos with interactive features so that I can learn and perform exercises correctly.**

**Acceptance Criteria:**
- Given I have been assigned an exercise in my daily plan
- When I access the exercise video
- Then I should see a high-quality video demonstration of the exercise
- And I should be able to control playback (play, pause, rewind, slow motion)
- And I should see key instruction points overlaid on the video
- And I should be able to loop specific sections of the exercise
- And I should be able to adjust video quality based on my internet connection
- And I should be able to view the video in full-screen mode
- And the video should be accessible on both mobile and desktop devices

**Technical Implementation:**
- Adaptive video streaming with multiple quality levels
- Interactive video player with custom controls
- Overlay system for instruction points and safety tips
- Loop functionality for specific exercise phases
- Responsive video player for all device types

**Interactive Video Player Component:**
```typescript
<InteractiveVideoPlayer
  videoUrl={exercise.videoUrl}
  instructionPoints={exercise.instructionPoints}
  onPlaybackEvent={handlePlaybackEvent}
  enableLooping={true}
  enableSlowMotion={true}
  showInstructions={true}
  adaptiveQuality={true}
/>
```

#### User Story 6.2: Exercise Instruction and Safety Information
**As a Patient, I want detailed instructions and safety information for each exercise so that I can perform them safely and effectively.**

**Acceptance Criteria:**
- Given I am viewing an exercise
- When I access the exercise details
- Then I should see step-by-step written instructions
- And I should see safety precautions and contraindications
- And I should see the target muscle groups and benefits
- And I should see proper form cues and common mistakes to avoid
- And I should be able to access modifications for different ability levels
- And I should see equipment requirements and setup instructions
- And I should be able to ask questions about the exercise

**Technical Implementation:**
- Comprehensive exercise metadata system
- Safety information database with contraindication checking
- Exercise modification system based on patient limitations
- Interactive Q&A system for exercise-specific questions

**Exercise Details Component:**
```typescript
<ExerciseDetails
  exercise={exercise}
  patientLimitations={patient.limitations}
  onQuestionSubmit={handleExerciseQuestion}
  showModifications={true}
  showSafetyInfo={true}
  enableInteractiveGuide={true}
/>
```

#### User Story 6.3: Personalized Exercise Prescription
**As a Patient, I want my exercise program to be personalized to my surgery type, recovery phase, and individual needs so that I get the most effective rehabilitation.**

**Acceptance Criteria:**
- Given I am in a specific phase of my recovery
- When I access my exercise program
- Then I should see exercises specifically chosen for my surgery type (TKA/THA)
- And the exercises should be appropriate for my current recovery day
- And the difficulty should match my activity level and progress
- And I should see the rationale for why each exercise was prescribed
- And the program should adapt based on my pain levels and feedback
- And I should see how each exercise contributes to my recovery goals

**Technical Implementation:**
- Exercise prescription algorithm based on recovery protocols
- Patient-specific exercise filtering and selection
- Adaptive difficulty adjustment system
- Exercise rationale and goal mapping system

### Epic: Exercise Performance and Feedback

**As a Patient, I want to track my exercise performance and receive feedback so that I can improve my form and monitor my progress.**

#### User Story 6.4: Exercise Completion Tracking
**As a Patient, I want to easily track my exercise completion and performance so that I can see my progress over time.**

**Acceptance Criteria:**
- Given I am performing an exercise
- When I complete the exercise
- Then I should be able to log the number of repetitions and sets completed
- And I should be able to rate the difficulty and my perceived exertion
- And I should be able to report any pain or discomfort experienced
- And I should be able to add notes about my performance
- And my completion should be automatically saved and synced
- And I should see my progress compared to previous sessions

**Technical Implementation:**
- Exercise logging interface with voice input support
- Performance tracking and comparison system
- Pain and exertion rating scales
- Automatic progress calculation and visualization

**Exercise Completion Interface:**
```typescript
<ExerciseCompletion
  exercise={exercise}
  onComplete={handleExerciseComplete}
  enableVoiceLogging={true}
  showProgressComparison={true}
  trackPainLevels={true}
  trackExertion={true}
/>
```

#### User Story 6.5: Real-time Form Feedback (Advanced)
**As a Patient, I want to receive real-time feedback on my exercise form so that I can perform exercises correctly and safely.**

**Acceptance Criteria:**
- Given I am performing an exercise with camera-based form analysis enabled
- When I perform the exercise in front of my device camera
- Then the system should analyze my movement and provide real-time feedback
- And I should receive alerts if my form is incorrect or potentially unsafe
- And I should see visual guides overlaid on my camera feed
- And I should receive positive reinforcement when my form is correct
- And the system should adapt to my physical limitations and modifications

**Technical Implementation:**
- Computer vision and pose estimation algorithms
- Real-time movement analysis and feedback system
- Safety alert system for incorrect form
- Visual overlay system for form guidance

**Form Analysis Component:**
```typescript
<ExerciseFormAnalysis
  exercise={exercise}
  onFormFeedback={handleFormFeedback}
  enableRealTimeAnalysis={true}
  showVisualGuides={true}
  adaptToLimitations={patient.limitations}
/>
```

#### User Story 6.6: Exercise Progression and Adaptation
**As a Patient, I want my exercises to become more challenging as I improve so that I continue to make progress in my recovery.**

**Acceptance Criteria:**
- Given I have been consistently completing my exercises successfully
- When the system determines I'm ready for progression
- Then my exercise difficulty should automatically increase (more reps, longer duration, etc.)
- And I should be introduced to new, more advanced exercises
- And I should be able to provide feedback on the new difficulty level
- And I should be able to request modifications if the progression is too challenging
- And my physical therapist should be notified of significant progressions

**Technical Implementation:**
- Automatic progression algorithms based on performance data
- Exercise difficulty scaling system
- New exercise introduction workflow
- Provider notification system for progression milestones

### Epic: Specialized Exercise Programs

**As a Healthcare Provider, I want to create and assign specialized exercise programs so that patients receive targeted rehabilitation for their specific needs.**

#### User Story 6.7: Range of Motion Exercise Programs
**As a Patient, I want specific range of motion exercises so that I can regain full mobility in my joint.**

**Acceptance Criteria:**
- Given I need to improve my range of motion
- When I access my ROM exercise program
- Then I should see exercises specifically designed to improve joint flexibility
- And I should be able to measure and track my range of motion progress
- And I should receive guidance on proper stretching techniques
- And I should see visual representations of target ROM goals
- And the exercises should progress from passive to active ROM as appropriate

**Technical Implementation:**
- ROM-specific exercise library with measurement tools
- Digital goniometer for ROM measurement
- Progressive ROM exercise protocols
- Visual ROM goal tracking and comparison

#### User Story 6.8: Strengthening Exercise Programs
**As a Patient, I want progressive strengthening exercises so that I can rebuild muscle strength around my surgical site.**

**Acceptance Criteria:**
- Given I am ready for strengthening exercises in my recovery
- When I access my strengthening program
- Then I should see exercises that target specific muscle groups
- And the resistance and difficulty should progress gradually
- And I should be able to track my strength improvements
- And I should receive guidance on proper resistance levels
- And the program should include both bodyweight and equipment-based exercises

**Technical Implementation:**
- Progressive resistance exercise protocols
- Strength tracking and measurement tools
- Equipment-based and bodyweight exercise options
- Resistance level guidance system

#### User Story 6.9: Balance and Proprioception Training
**As a Patient, I want balance and proprioception exercises so that I can regain confidence and stability in my movement.**

**Acceptance Criteria:**
- Given I need to improve my balance and proprioception
- When I access my balance training program
- Then I should see exercises that challenge my balance safely
- And I should receive clear safety instructions for balance exercises
- And I should be able to progress from stable to unstable surface exercises
- And I should be able to track my balance improvements
- And the exercises should be appropriate for my current mobility level

**Technical Implementation:**
- Progressive balance exercise protocols
- Safety instruction system for balance training
- Balance assessment and tracking tools
- Mobility-appropriate exercise selection

## Technical Specifications

### Video Streaming Architecture

#### Adaptive Video Delivery
```typescript
class AdaptiveVideoStreamer {
  private videoQualities = [
    { quality: '1080p', bitrate: 5000, resolution: '1920x1080' },
    { quality: '720p', bitrate: 2500, resolution: '1280x720' },
    { quality: '480p', bitrate: 1000, resolution: '854x480' },
    { quality: '360p', bitrate: 500, resolution: '640x360' }
  ];
  
  async getOptimalQuality(connectionSpeed: number, deviceCapabilities: DeviceCapabilities): Promise<VideoQuality> {
    // Determine optimal quality based on connection speed and device
    const suitableQualities = this.videoQualities.filter(q => 
      q.bitrate <= connectionSpeed && 
      this.deviceSupportsResolution(deviceCapabilities, q.resolution)
    );
    
    return suitableQualities[0] || this.videoQualities[this.videoQualities.length - 1];
  }
  
  async streamVideo(videoId: string, quality: VideoQuality): Promise<VideoStream> {
    const streamUrl = await this.generateStreamUrl(videoId, quality);
    
    return {
      url: streamUrl,
      quality: quality,
      duration: await this.getVideoDuration(videoId),
      chapters: await this.getVideoChapters(videoId)
    };
  }
}
```

#### Exercise Video Management
```typescript
interface ExerciseVideo {
  id: string;
  exerciseId: string;
  title: string;
  duration: number;
  qualities: VideoQuality[];
  chapters: VideoChapter[];
  instructionPoints: InstructionPoint[];
  safetyWarnings: SafetyWarning[];
  equipment: Equipment[];
}

interface VideoChapter {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  description: string;
  keyPoints: string[];
}

interface InstructionPoint {
  timestamp: number;
  text: string;
  type: 'form_cue' | 'safety_tip' | 'modification' | 'breathing';
  position: { x: number; y: number };
}
```

### Database Schema Integration

#### Exercise and Video Data
```sql
-- Exercise library with video integration
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('range_of_motion', 'strengthening', 'balance', 'functional', 'cardiovascular')),
  
  -- Exercise parameters
  default_repetitions INTEGER,
  default_sets INTEGER,
  default_duration_seconds INTEGER,
  default_rest_seconds INTEGER,
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  
  -- Targeting and benefits
  target_muscle_groups TEXT[],
  joint_movements TEXT[],
  benefits TEXT[],
  contraindications TEXT[],
  
  -- Video content
  primary_video_id UUID,
  alternative_video_ids UUID[],
  instruction_points JSONB DEFAULT '[]',
  safety_warnings JSONB DEFAULT '[]',
  
  -- Equipment and setup
  required_equipment TEXT[],
  optional_equipment TEXT[],
  space_requirements TEXT,
  setup_instructions TEXT,
  
  -- Progression and modification
  progression_criteria JSONB DEFAULT '{}',
  modifications JSONB DEFAULT '{}',
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,1),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercise videos with streaming metadata
CREATE TABLE exercise_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration_seconds INTEGER NOT NULL,
  
  -- Video files and streaming
  video_files JSONB NOT NULL, -- Different quality versions
  thumbnail_url TEXT,
  preview_url TEXT, -- Short preview clip
  
  -- Video structure
  chapters JSONB DEFAULT '[]',
  instruction_overlays JSONB DEFAULT '[]',
  safety_overlays JSONB DEFAULT '[]',
  
  -- Content metadata
  language TEXT DEFAULT 'en',
  captions_available BOOLEAN DEFAULT false,
  transcript TEXT,
  
  -- Usage tracking
  view_count INTEGER DEFAULT 0,
  completion_rate DECIMAL(4,1),
  average_watch_time_seconds INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patient exercise performance tracking
CREATE TABLE patient_exercise_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  
  -- Session details
  session_date DATE DEFAULT CURRENT_DATE,
  recovery_day INTEGER,
  
  -- Performance data
  completed_repetitions INTEGER,
  completed_sets INTEGER,
  actual_duration_seconds INTEGER,
  perceived_exertion INTEGER CHECK (perceived_exertion BETWEEN 1 AND 10),
  
  -- Pain and comfort
  pain_before INTEGER CHECK (pain_before BETWEEN 0 AND 10),
  pain_during INTEGER CHECK (pain_during BETWEEN 0 AND 10),
  pain_after INTEGER CHECK (pain_after BETWEEN 0 AND 10),
  comfort_level INTEGER CHECK (comfort_level BETWEEN 1 AND 5),
  
  -- Form and technique
  form_rating INTEGER CHECK (form_rating BETWEEN 1 AND 5),
  form_feedback JSONB DEFAULT '{}', -- AI-generated form analysis
  modifications_used TEXT[],
  
  -- Video engagement
  video_watch_time_seconds INTEGER,
  video_completion_percentage INTEGER,
  video_replays INTEGER DEFAULT 0,
  
  -- Notes and feedback
  patient_notes TEXT,
  provider_feedback TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercise progression tracking
CREATE TABLE exercise_progressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  
  -- Progression event
  progression_date DATE DEFAULT CURRENT_DATE,
  progression_type TEXT NOT NULL CHECK (progression_type IN ('difficulty_increase', 'repetition_increase', 'duration_increase', 'new_exercise_introduced')),
  
  -- Previous and new parameters
  previous_parameters JSONB NOT NULL,
  new_parameters JSONB NOT NULL,
  
  -- Progression rationale
  trigger_reason TEXT, -- 'automatic', 'provider_directed', 'patient_requested'
  performance_metrics JSONB, -- Metrics that triggered progression
  
  -- Outcome tracking
  patient_response TEXT, -- How patient responded to progression
  success_rating INTEGER CHECK (success_rating BETWEEN 1 AND 5),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### API Endpoints

#### Exercise System API
```typescript
// Exercise library endpoints
GET /api/exercises
GET /api/exercises/:exerciseId
GET /api/exercises/category/:category
GET /api/exercises/search?q={query}

// Patient exercise assignment endpoints
GET /api/patients/:patientId/exercises/assigned
GET /api/patients/:patientId/exercises/daily
POST /api/patients/:patientId/exercises/assign
DELETE /api/patients/:patientId/exercises/:exerciseId/unassign

// Exercise session tracking endpoints
POST /api/exercises/sessions/start
PUT /api/exercises/sessions/:sessionId/update
POST /api/exercises/sessions/:sessionId/complete
GET /api/exercises/sessions/:patientId/history

// Video streaming endpoints
GET /api/videos/:videoId/stream
GET /api/videos/:videoId/qualities
GET /api/videos/:videoId/chapters
POST /api/videos/:videoId/track-view

// Exercise progression endpoints
GET /api/patients/:patientId/exercises/progress
POST /api/patients/:patientId/exercises/:exerciseId/progress
GET /api/patients/:patientId/exercises/progression-history

// Form analysis endpoints (advanced)
POST /api/exercises/form-analysis/start
POST /api/exercises/form-analysis/frame
POST /api/exercises/form-analysis/complete
```

### Component Library

#### Exercise System Components
```typescript
// Main exercise interface
<ExerciseInterface
  patientId={patient.id}
  assignedExercises={exercises}
  onExerciseStart={handleExerciseStart}
  onExerciseComplete={handleExerciseComplete}
  enableFormAnalysis={true}
  showProgressTracking={true}
/>

// Video player with exercise features
<ExerciseVideoPlayer
  video={exerciseVideo}
  exercise={exercise}
  onPlaybackEvent={handlePlaybackEvent}
  onInstructionPointReach={handleInstructionPoint}
  enableInteractiveOverlays={true}
  showChapterNavigation={true}
/>

// Exercise performance tracking
<ExercisePerformanceTracker
  exercise={exercise}
  onPerformanceUpdate={handlePerformanceUpdate}
  onSessionComplete={handleSessionComplete}
  enableVoiceInput={true}
  showRealTimeMetrics={true}
/>

// Exercise progression interface
<ExerciseProgressionManager
  patientId={patient.id}
  exercise={exercise}
  onProgressionApply={handleProgression}
  showProgressionHistory={true}
  enableAutoProgression={true}
/>

// Form analysis component (advanced)
<ExerciseFormAnalyzer
  exercise={exercise}
  onFormFeedback={handleFormFeedback}
  enableRealTimeAnalysis={true}
  showVisualGuides={true}
  cameraPermissions={cameraPermissions}
/>
```

### Advanced Features

#### Computer Vision Form Analysis
```typescript
class ExerciseFormAnalyzer {
  private poseEstimator: PoseEstimator;
  private exerciseModels: Map<string, ExerciseModel>;
  
  async analyzeForm(videoFrame: ImageData, exercise: Exercise): Promise<FormAnalysis> {
    // Extract pose landmarks from video frame
    const pose = await this.poseEstimator.estimatePose(videoFrame);
    
    // Get exercise-specific model
    const exerciseModel = this.exerciseModels.get(exercise.id);
    if (!exerciseModel) {
      throw new Error(`No form analysis model available for exercise: ${exercise.name}`);
    }
    
    // Analyze form against ideal model
    const analysis = await exerciseModel.analyzePose(pose);
    
    return {
      overallScore: analysis.score,
      feedback: analysis.feedback,
      corrections: analysis.corrections,
      safetyAlerts: analysis.safetyAlerts,
      confidence: analysis.confidence
    };
  }
  
  async provideRealTimeFeedback(pose: Pose, exercise: Exercise): Promise<RealTimeFeedback> {
    const exerciseModel = this.exerciseModels.get(exercise.id);
    const feedback = await exerciseModel.getRealTimeFeedback(pose);
    
    return {
      message: feedback.message,
      type: feedback.type, // 'correction', 'encouragement', 'warning'
      urgency: feedback.urgency,
      visualCues: feedback.visualCues
    };
  }
}
```

#### Exercise Prescription Algorithm
```typescript
class ExercisePrescriptionEngine {
  prescribeExercises(
    patient: Patient, 
    recoveryDay: number, 
    currentCapabilities: PatientCapabilities
  ): ExercisePrescription {
    const baseProtocol = this.getBaseProtocol(patient.surgeryType, patient.activityLevel);
    const dayExercises = baseProtocol.getExercisesForDay(recoveryDay);
    
    // Adapt exercises based on patient capabilities and progress
    const adaptedExercises = dayExercises.map(exercise => 
      this.adaptExercise(exercise, currentCapabilities, patient.limitations)
    );
    
    // Add progression exercises if patient is ready
    const progressionExercises = this.getProgressionExercises(
      patient, 
      currentCapabilities, 
      recoveryDay
    );
    
    return {
      exercises: [...adaptedExercises, ...progressionExercises],
      totalEstimatedTime: this.calculateTotalTime(adaptedExercises),
      difficultyLevel: this.calculateOverallDifficulty(adaptedExercises),
      goals: this.getSessionGoals(recoveryDay, patient.surgeryType)
    };
  }
  
  private adaptExercise(
    exercise: Exercise, 
    capabilities: PatientCapabilities, 
    limitations: PatientLimitation[]
  ): AdaptedExercise {
    let adaptedExercise = { ...exercise };
    
    // Adapt based on pain levels
    if (capabilities.painLevel > 6) {
      adaptedExercise.repetitions = Math.round(exercise.repetitions * 0.7);
      adaptedExercise.intensity = Math.max(1, exercise.intensity - 1);
    }
    
    // Adapt based on range of motion limitations
    const romLimitation = limitations.find(l => l.type === 'range_of_motion');
    if (romLimitation) {
      adaptedExercise.modifications.push(romLimitation.modification);
      adaptedExercise.targetROM = Math.min(exercise.targetROM, romLimitation.maxROM);
    }
    
    // Adapt based on strength limitations
    const strengthLimitation = limitations.find(l => l.type === 'strength');
    if (strengthLimitation) {
      adaptedExercise.resistance = Math.min(exercise.resistance, strengthLimitation.maxResistance);
    }
    
    return adaptedExercise;
  }
}
```

### Performance Optimization

#### Video Streaming Optimization
```typescript
class VideoStreamOptimizer {
  private cdn: CDNService;
  private cache: VideoCache;
  
  async optimizeVideoDelivery(videoId: string, userLocation: string): Promise<OptimizedStream> {
    // Get nearest CDN edge server
    const edgeServer = await this.cdn.getNearestEdge(userLocation);
    
    // Check if video is cached at edge
    const cachedVideo = await this.cache.get(videoId, edgeServer);
    if (cachedVideo) {
      return {
        streamUrl: cachedVideo.url,
        latency: cachedVideo.latency,
        quality: cachedVideo.quality
      };
    }
    
    // Pre-cache popular videos
    await this.preCachePopularVideos(edgeServer);
    
    return {
      streamUrl: await this.generateStreamUrl(videoId, edgeServer),
      latency: await this.estimateLatency(edgeServer),
      quality: await this.determineOptimalQuality(userLocation)
    };
  }
  
  async preCachePopularVideos(edgeServer: EdgeServer): Promise<void> {
    const popularVideos = await this.getPopularVideos();
    
    for (const video of popularVideos) {
      if (!await this.cache.exists(video.id, edgeServer)) {
        await this.cache.preload(video.id, edgeServer);
      }
    }
  }
}
```

### Testing and Quality Assurance

#### Exercise System Testing
```typescript
describe('Exercise System', () => {
  describe('Exercise Prescription', () => {
    test('should prescribe appropriate exercises for recovery day', () => {
      const patient = createMockPatient({ surgeryType: 'TKA', activityLevel: 'active' });
      const capabilities = createMockCapabilities({ painLevel: 3, rom: 90 });
      
      const prescription = exercisePrescriptionEngine.prescribeExercises(patient, 14, capabilities);
      
      expect(prescription.exercises).toHaveLength(4);
      expect(prescription.exercises.every(e => e.surgeryType.includes('TKA'))).toBe(true);
      expect(prescription.difficultyLevel).toBe(2);
    });
    
    test('should adapt exercises for high pain levels', () => {
      const patient = createMockPatient({ surgeryType: 'TKA' });
      const capabilities = createMockCapabilities({ painLevel: 8 });
      
      const prescription = exercisePrescriptionEngine.prescribeExercises(patient, 7, capabilities);
      
      const exercise = prescription.exercises[0];
      expect(exercise.repetitions).toBeLessThan(exercise.baseRepetitions);
      expect(exercise.intensity).toBeLessThan(exercise.baseIntensity);
    });
  });
  
  describe('Form Analysis', () => {
    test('should detect incorrect form', async () => {
      const mockPose = createMockPose({ kneeAngle: 45 }); // Too shallow for squat
      const exercise = createMockExercise({ type: 'squat', targetKneeAngle: 90 });
      
      const analysis = await formAnalyzer.analyzeForm(mockPose, exercise);
      
      expect(analysis.overallScore).toBeLessThan(0.7);
      expect(analysis.corrections).toContain('Squat deeper to reach target knee angle');
    });
  });
});
```

This comprehensive Exercise System with Video Integration provides patients with professional-grade physical therapy guidance while giving healthcare providers detailed insights into patient performance and progress, ultimately improving recovery outcomes through technology-enhanced rehabilitation.

