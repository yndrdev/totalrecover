# Feature 2: Patient Chat Interface (Main Feature)

## Overview

The Patient Chat Interface serves as the primary interaction point for the TJV Smart Recovery App, providing an intelligent, conversational experience that guides patients through their recovery journey. This feature combines modern chat UI design with AI-powered responses, voice-to-text capabilities, and seamless integration with tasks, forms, and educational content. The interface adapts to each patient's recovery phase, surgery type, and individual needs while maintaining a supportive and engaging user experience.

## Design Philosophy

The chat interface follows modern design principles inspired by leading conversational AI platforms, featuring a clean, card-based layout with the brand colors (#002238, #006DB1, #C8DBE9, #FFFFFF) and utilizing the shadcn/ui component library for consistency and accessibility. The design emphasizes clarity, ease of use, and emotional support throughout the recovery process.

## User Stories

### Epic: Conversational Recovery Experience

**As a Patient, I want to interact with my recovery program through a natural chat interface so that I feel supported and can easily access the help I need.**

#### User Story 2.1: Initial Chat Welcome and Onboarding
**As a Patient, I want to receive a personalized welcome message when I first access the chat so that I understand how to use the system and feel welcomed.**

**Acceptance Criteria:**
- Given I am a newly registered patient accessing the chat for the first time
- When I open the chat interface
- Then I should see a personalized welcome message using my first name
- And I should see an introduction to my recovery assistant
- And I should be presented with quick action buttons for common tasks
- And I should see my surgery information and recovery timeline
- And I should be able to ask questions or select from suggested topics
- And the system should explain how voice input works

**Technical Implementation:**
- Welcome message generation based on patient profile data
- Dynamic quick action buttons based on recovery phase
- Surgery-specific information display
- Voice input tutorial and permission request
- Onboarding progress tracking

**UI Components:**
```typescript
<ChatWelcome 
  patientName={patient.firstName}
  surgeryType={patient.surgeryType}
  surgeryDate={patient.surgeryDate}
  currentDay={patient.currentDay}
  onQuickAction={handleQuickAction}
  onVoiceSetup={handleVoiceSetup}
/>
```

#### User Story 2.2: Natural Language Interaction
**As a Patient, I want to ask questions in natural language and receive helpful, contextual responses so that I can get the information I need quickly.**

**Acceptance Criteria:**
- Given I am in the chat interface
- When I type or speak a question about my recovery
- Then I should receive a relevant, personalized response within 3 seconds
- And the response should be tailored to my surgery type and recovery phase
- And the response should include actionable next steps when appropriate
- And the system should offer to connect me with my care team if needed
- And the conversation should feel natural and supportive

**Technical Implementation:**
- OpenAI GPT-4 integration with custom prompts
- Patient context injection (surgery type, day, previous interactions)
- Response time optimization with streaming
- Fallback to human escalation triggers
- Conversation memory and context retention

**AI Prompt Engineering:**
```typescript
const generateChatPrompt = (patient: Patient, message: string, context: ChatContext) => {
  return `You are a supportive recovery assistant for ${patient.firstName}, who had ${patient.surgeryType} surgery ${patient.currentDay} days ago. 
  
  Patient Context:
  - Surgery: ${patient.surgeryType} on ${patient.surgeryDate}
  - Current Day: ${patient.currentDay} (${getRecoveryPhase(patient.currentDay)})
  - Activity Level: ${patient.activityLevel}
  - Recent Pain Levels: ${context.recentPainLevels}
  - Completed Tasks Today: ${context.completedTasks}
  
  Guidelines:
  - Be encouraging and supportive
  - Provide specific, actionable advice
  - Reference their progress when appropriate
  - Suggest connecting with care team for medical concerns
  - Keep responses concise but thorough
  
  Patient Message: "${message}"`;
};
```

#### User Story 2.3: Voice-to-Text Integration
**As a Patient, I want to use voice input to communicate with the chat system so that I can interact hands-free, especially when mobility is limited.**

**Acceptance Criteria:**
- Given I am in the chat interface
- When I press and hold the voice input button
- Then I should see visual feedback that recording is active
- And I should be able to speak my message naturally
- And the system should convert my speech to text using OpenAI Whisper
- And I should be able to review and edit the transcribed text before sending
- And the system should handle background noise and unclear speech gracefully
- And I should receive feedback on transcription confidence

**Technical Implementation:**
- OpenAI Whisper API integration for speech-to-text
- Real-time audio recording with Web Audio API
- Visual recording indicators and waveform display
- Transcription confidence scoring and user feedback
- Edit capability before message submission
- Noise reduction and audio preprocessing

**Voice Input Component:**
```typescript
<VoiceInput
  onTranscription={handleTranscription}
  onError={handleVoiceError}
  confidenceThreshold={0.8}
  maxRecordingTime={60}
  showWaveform={true}
  enableNoiseReduction={true}
/>
```

#### User Story 2.4: Task Integration and Completion
**As a Patient, I want to complete tasks directly through the chat interface so that my recovery activities feel integrated and natural.**

**Acceptance Criteria:**
- Given I have pending tasks for today
- When the chat assistant mentions or suggests a task
- Then I should see an interactive task card within the chat
- And I should be able to complete simple tasks (like pain reporting) inline
- And I should be able to start exercise videos directly from the chat
- And I should be able to mark tasks as completed with voice or touch
- And the system should celebrate my progress and provide encouragement
- And completed tasks should update my overall progress tracking

**Technical Implementation:**
- Interactive task cards with embedded completion forms
- Video player integration within chat interface
- Voice-activated task completion ("I completed my exercises")
- Progress celebration animations and messages
- Real-time progress updates and synchronization

**Task Card Component:**
```typescript
<TaskCard
  task={task}
  onComplete={handleTaskCompletion}
  onStart={handleTaskStart}
  allowVoiceCompletion={true}
  showProgress={true}
  celebrateCompletion={true}
/>
```

#### User Story 2.5: Form Presentation and Completion
**As a Patient, I want to complete assessment forms through the chat interface so that providing health information feels conversational rather than clinical.**

**Acceptance Criteria:**
- Given I need to complete a health assessment or form
- When the form is presented in the chat
- Then I should see questions one at a time in a conversational format
- And I should be able to answer using voice, text, or selection buttons
- And I should be able to go back and modify previous answers
- And the system should validate my responses and ask for clarification if needed
- And I should see my progress through the form
- And the completed form should be saved and shared with my care team

**Technical Implementation:**
- Conversational form rendering with step-by-step presentation
- Multi-modal input support (voice, text, buttons, sliders)
- Form validation with natural language error messages
- Progress tracking and navigation controls
- Auto-save functionality with resume capability

**Conversational Form Component:**
```typescript
<ConversationalForm
  form={assessmentForm}
  onFieldComplete={handleFieldComplete}
  onFormComplete={handleFormComplete}
  allowVoiceInput={true}
  showProgress={true}
  autoSave={true}
  validationMode="conversational"
/>
```

### Epic: Intelligent Response System

**As a Patient, I want the chat system to provide intelligent, contextual responses that help me navigate my recovery effectively.**

#### User Story 2.6: Context-Aware Responses
**As a Patient, I want the chat system to remember our previous conversations and my current recovery status so that responses are relevant and personalized.**

**Acceptance Criteria:**
- Given I have had previous conversations with the system
- When I ask a follow-up question or reference something we discussed
- Then the system should understand the context and provide relevant responses
- And the system should remember my preferences and previous concerns
- And the system should track my recovery progress and adjust responses accordingly
- And the system should reference specific milestones and achievements
- And the conversation should feel continuous rather than isolated interactions

**Technical Implementation:**
- Conversation memory storage and retrieval
- Context window management for AI prompts
- Patient progress tracking integration
- Preference learning and adaptation
- Milestone recognition and celebration

**Context Management:**
```typescript
const buildConversationContext = async (patientId: string, messageHistory: Message[]) => {
  const recentMessages = messageHistory.slice(-10);
  const patientProgress = await getPatientProgress(patientId);
  const preferences = await getPatientPreferences(patientId);
  
  return {
    recentConversation: recentMessages,
    currentProgress: patientProgress,
    preferences: preferences,
    milestones: patientProgress.achievedMilestones,
    concerns: extractConcerns(recentMessages)
  };
};
```

#### User Story 2.7: Proactive Check-ins and Reminders
**As a Patient, I want the system to proactively check on my progress and remind me of important tasks so that I stay on track with my recovery.**

**Acceptance Criteria:**
- Given I haven't interacted with the system for a specified period
- When the proactive check-in time arrives
- Then I should receive a gentle reminder message about pending tasks
- And the system should ask about my current pain level and symptoms
- And I should be able to quickly update my status with voice or quick buttons
- And the system should adjust future reminders based on my response patterns
- And urgent concerns should trigger immediate care team notifications

**Technical Implementation:**
- Scheduled message system with patient-specific timing
- Proactive health status inquiries
- Quick response buttons for common updates
- Adaptive reminder frequency based on engagement
- Escalation triggers for concerning responses

**Proactive Check-in System:**
```typescript
const scheduleProactiveCheckin = (patient: Patient) => {
  const checkinTime = calculateOptimalCheckinTime(patient);
  const message = generateCheckinMessage(patient);
  
  return scheduleMessage({
    patientId: patient.id,
    scheduledFor: checkinTime,
    message: message,
    type: 'proactive_checkin',
    quickActions: ['pain_update', 'task_status', 'need_help']
  });
};
```

#### User Story 2.8: Educational Content Integration
**As a Patient, I want to receive relevant educational information through the chat so that I can learn about my recovery in context.**

**Acceptance Criteria:**
- Given I ask a question about my recovery or express concern
- When educational content is available on the topic
- Then the system should offer to share relevant articles, videos, or infographics
- And the content should be presented in an easily digestible format within the chat
- And I should be able to bookmark content for later reference
- And the system should track what content I've viewed
- And follow-up questions should be encouraged after content consumption

**Technical Implementation:**
- Educational content matching based on keywords and context
- In-chat content preview with full-screen viewing options
- Bookmark and favorites system
- Content consumption tracking
- Follow-up question prompts

**Educational Content Integration:**
```typescript
<EducationalContentCard
  content={educationalContent}
  onView={handleContentView}
  onBookmark={handleBookmark}
  showPreview={true}
  trackEngagement={true}
  suggestFollowUp={true}
/>
```

### Epic: Care Team Communication

**As a Patient, I want to communicate with my care team through the chat interface so that I can get professional support when needed.**

#### User Story 2.9: Provider Escalation and Communication
**As a Patient, I want to easily connect with my healthcare providers when I have concerns that require professional attention.**

**Acceptance Criteria:**
- Given I express a concern that requires professional attention
- When the AI determines escalation is needed or I request to speak with my care team
- Then I should be able to send a message directly to my assigned providers
- And I should see which providers are available and their typical response times
- And I should be able to mark my message as urgent if needed
- And I should receive confirmation that my message was delivered
- And I should be notified when a provider responds

**Technical Implementation:**
- AI-powered escalation trigger detection
- Provider availability status integration
- Message priority and urgency flags
- Real-time notification system using Resend and Twilio
- Provider response tracking and patient notifications

**Provider Communication Component:**
```typescript
<ProviderCommunication
  availableProviders={careTeam}
  onSendMessage={handleProviderMessage}
  urgencyLevels={['routine', 'urgent', 'emergency']}
  showAvailability={true}
  enableVoiceMessage={true}
/>
```

#### User Story 2.10: Care Team Visibility and Transparency
**As a Patient, I want to see when my care team members are reviewing my progress so that I feel connected and supported.**

**Acceptance Criteria:**
- Given my care team is reviewing my progress or messages
- When they access my information or respond to my communications
- Then I should see indicators of their activity (when appropriate)
- And I should receive notifications when they leave messages or updates
- And I should be able to see my care team's profiles and specialties
- And I should understand each team member's role in my recovery

**Technical Implementation:**
- Care team activity indicators (with privacy controls)
- Real-time notification system for provider interactions
- Care team profile integration
- Role-based communication routing

## Technical Specifications

### Chat Architecture

#### Real-time Communication
```typescript
// WebSocket connection for real-time chat
const useChatSocket = (conversationId: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/chat/${conversationId}`);
    
    ws.onopen = () => {
      setIsConnected(true);
      setSocket(ws);
    };
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };
    
    ws.onclose = () => {
      setIsConnected(false);
      setSocket(null);
    };
    
    return () => ws.close();
  }, [conversationId]);
  
  return { socket, messages, isConnected };
};
```

#### AI Integration Service
```typescript
// AI response generation service
class ChatAIService {
  private openai: OpenAI;
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  
  async generateResponse(
    message: string, 
    patient: Patient, 
    context: ChatContext
  ): Promise<AIResponse> {
    const prompt = this.buildPrompt(message, patient, context);
    
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: prompt.system },
        { role: "user", content: prompt.user }
      ],
      temperature: 0.7,
      max_tokens: 500,
      stream: true
    });
    
    return this.processStreamedResponse(completion);
  }
  
  async transcribeVoice(audioFile: File): Promise<TranscriptionResult> {
    const transcription = await this.openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en",
      response_format: "verbose_json"
    });
    
    return {
      text: transcription.text,
      confidence: transcription.confidence || 0,
      duration: transcription.duration
    };
  }
}
```

### Database Integration

#### Chat Message Storage
```sql
-- Optimized message retrieval for chat interface
CREATE OR REPLACE FUNCTION get_conversation_messages(
  p_conversation_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  sender_type TEXT,
  content TEXT,
  formatted_content JSONB,
  message_type TEXT,
  created_at TIMESTAMPTZ,
  sender_name TEXT,
  sender_avatar TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.sender_type,
    m.content,
    m.formatted_content,
    m.message_type,
    m.created_at,
    COALESCE(p.full_name, 'Recovery Assistant') as sender_name,
    p.avatar_url as sender_avatar
  FROM messages m
  LEFT JOIN profiles p ON m.sender_id = p.id
  WHERE m.conversation_id = p_conversation_id
    AND m.deleted_at IS NULL
  ORDER BY m.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### API Endpoints

#### Chat API Routes
```typescript
// Chat message endpoints
POST /api/chat/conversations/:conversationId/messages
GET /api/chat/conversations/:conversationId/messages
PUT /api/chat/messages/:messageId
DELETE /api/chat/messages/:messageId

// Voice processing endpoints
POST /api/chat/voice/transcribe
POST /api/chat/voice/upload

// AI integration endpoints
POST /api/chat/ai/generate-response
POST /api/chat/ai/analyze-sentiment
GET /api/chat/ai/suggested-responses

// Task integration endpoints
POST /api/chat/tasks/:taskId/complete
GET /api/chat/tasks/pending
POST /api/chat/tasks/:taskId/start

// Form integration endpoints
POST /api/chat/forms/:formId/start
PUT /api/chat/forms/:formId/update
POST /api/chat/forms/:formId/complete
```

### Component Library

#### Core Chat Components
```typescript
// Main chat interface
<ChatInterface
  conversationId={conversationId}
  patient={patient}
  onMessageSend={handleMessageSend}
  enableVoice={true}
  enableTasks={true}
  enableForms={true}
  theme="tjv-recovery"
/>

// Message components
<MessageBubble
  message={message}
  isOwn={message.senderId === currentUserId}
  showAvatar={true}
  showTimestamp={true}
  onReaction={handleReaction}
/>

<AIMessageBubble
  message={message}
  isTyping={isTyping}
  showSuggestions={true}
  onSuggestionClick={handleSuggestionClick}
/>

// Input components
<ChatInput
  onSend={handleSend}
  onVoiceStart={handleVoiceStart}
  onVoiceEnd={handleVoiceEnd}
  placeholder="Type your message or hold to speak..."
  enableVoice={true}
  enableAttachments={false}
/>

<VoiceRecorder
  onRecordingComplete={handleRecordingComplete}
  onTranscription={handleTranscription}
  maxDuration={60}
  showWaveform={true}
/>
```

### Styling and Theme

#### Brand Color Integration
```css
/* TJV Recovery Chat Theme */
.chat-interface {
  --primary-dark: #002238;
  --primary-blue: #006DB1;
  --primary-light: #C8DBE9;
  --primary-white: #FFFFFF;
  
  --message-user-bg: var(--primary-blue);
  --message-user-text: var(--primary-white);
  --message-ai-bg: var(--primary-light);
  --message-ai-text: var(--primary-dark);
  
  --input-border: var(--primary-blue);
  --input-focus: var(--primary-dark);
  
  --button-primary: var(--primary-blue);
  --button-secondary: var(--primary-light);
}

/* Modern card-based message styling */
.message-bubble {
  @apply rounded-2xl px-4 py-3 max-w-xs shadow-sm;
  border-radius: 1.5rem 1.5rem 0.25rem 1.5rem;
}

.message-bubble.own {
  @apply bg-primary-blue text-white ml-auto;
  border-radius: 1.5rem 1.5rem 1.5rem 0.25rem;
}

.message-bubble.ai {
  @apply bg-primary-light text-primary-dark;
}

/* Voice recording animation */
.voice-recording {
  @apply relative;
}

.voice-recording::before {
  content: '';
  @apply absolute inset-0 rounded-full bg-red-500 opacity-20;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.2; }
  50% { transform: scale(1.1); opacity: 0.4; }
}
```

### Performance Optimization

#### Message Virtualization
```typescript
// Virtual scrolling for large message histories
import { FixedSizeList as List } from 'react-window';

const VirtualizedMessageList = ({ messages }: { messages: Message[] }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <MessageBubble message={messages[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={messages.length}
      itemSize={80}
      overscanCount={5}
    >
      {Row}
    </List>
  );
};
```

#### AI Response Caching
```typescript
// Response caching for common queries
class ChatCache {
  private cache = new Map<string, CachedResponse>();
  
  generateCacheKey(message: string, patientContext: PatientContext): string {
    return `${message.toLowerCase()}_${patientContext.surgeryType}_${patientContext.recoveryDay}`;
  }
  
  async getCachedResponse(key: string): Promise<CachedResponse | null> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < 3600000) { // 1 hour
      return cached;
    }
    return null;
  }
  
  setCachedResponse(key: string, response: string): void {
    this.cache.set(key, {
      response,
      timestamp: Date.now()
    });
  }
}
```

### Testing Strategy

#### Chat Interface Tests
```typescript
// Chat functionality tests
describe('Chat Interface', () => {
  test('should send and receive messages', async () => {
    render(<ChatInterface conversationId="test-123" patient={mockPatient} />);
    
    const input = screen.getByPlaceholderText(/type your message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    fireEvent.change(input, { target: { value: 'Hello, how are you?' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
    });
  });
  
  test('should handle voice input', async () => {
    const mockTranscription = 'I completed my exercises today';
    
    render(<ChatInterface conversationId="test-123" patient={mockPatient} />);
    
    const voiceButton = screen.getByRole('button', { name: /voice input/i });
    fireEvent.mouseDown(voiceButton);
    
    // Mock voice transcription
    await act(async () => {
      await mockVoiceTranscription(mockTranscription);
    });
    
    fireEvent.mouseUp(voiceButton);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue(mockTranscription)).toBeInTheDocument();
    });
  });
});
```

### Integration with External Services

#### Twilio SMS Integration
```typescript
// SMS notification service
class SMSService {
  private twilio: Twilio;
  
  constructor() {
    this.twilio = new Twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );
  }
  
  async sendChatNotification(
    phoneNumber: string, 
    message: string, 
    conversationUrl: string
  ): Promise<void> {
    await this.twilio.messages.create({
      body: `${message}\n\nReply here: ${conversationUrl}`,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: phoneNumber
    });
  }
}
```

#### Resend Email Integration
```typescript
// Email notification service
class EmailService {
  private resend: Resend;
  
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY!);
  }
  
  async sendChatSummary(
    email: string,
    patientName: string,
    summary: ChatSummary
  ): Promise<void> {
    await this.resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: `Recovery Update for ${patientName}`,
      html: this.generateChatSummaryHTML(summary)
    });
  }
}
```

This comprehensive patient chat interface serves as the heart of the TJV Smart Recovery App, providing an intuitive, supportive, and intelligent communication platform that adapts to each patient's unique recovery journey while maintaining the highest standards of user experience and clinical effectiveness.

