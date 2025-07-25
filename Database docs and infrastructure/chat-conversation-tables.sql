-- =====================================================
-- CHAT AND CONVERSATION SYSTEM TABLES
-- TJV Recovery Platform - Comprehensive Chat Management
-- =====================================================

-- =====================================================
-- 1. CONVERSATION MANAGEMENT
-- =====================================================

-- Chat conversations between patients and the AI system
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(user_id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Conversation Metadata
  title TEXT, -- Auto-generated or user-defined conversation title
  conversation_type TEXT DEFAULT 'general' CHECK (conversation_type IN (
    'general', 'daily_checkin', 'exercise_session', 'form_completion',
    'pain_assessment', 'medication_reminder', 'education', 'emergency'
  )),
  
  -- Conversation Context
  surgery_day INTEGER, -- Day of recovery when conversation started
  recovery_phase TEXT, -- immediate, early, intermediate, advanced, maintenance
  
  -- Conversation Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived', 'escalated')),
  is_urgent BOOLEAN DEFAULT false,
  requires_provider_attention BOOLEAN DEFAULT false,
  
  -- AI Context and Memory
  context_summary TEXT, -- AI-generated summary of conversation context
  patient_mood TEXT, -- detected mood: positive, neutral, concerned, distressed
  pain_level_mentioned INTEGER, -- last mentioned pain level (0-10)
  topics_discussed TEXT[], -- array of topics covered
  
  -- Conversation Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Provider Escalation
  escalated_to UUID REFERENCES profiles(id), -- Provider who received escalation
  escalated_at TIMESTAMPTZ,
  escalation_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual messages within conversations
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(user_id) ON DELETE CASCADE,
  
  -- Message Content
  content TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN (
    'patient_text', 'patient_voice', 'ai_response', 'system_notification',
    'task_prompt', 'form_question', 'exercise_instruction', 'provider_message'
  )),
  
  -- Message Metadata
  sender_type TEXT NOT NULL CHECK (sender_type IN ('patient', 'ai', 'system', 'provider')),
  sender_id UUID REFERENCES profiles(id), -- For provider messages
  
  -- Voice and Media
  audio_url TEXT, -- Original voice recording URL
  transcription_confidence DECIMAL, -- Confidence score for voice-to-text
  has_attachments BOOLEAN DEFAULT false,
  
  -- AI Processing
  ai_model_used TEXT DEFAULT 'gpt-4', -- Which AI model generated the response
  ai_prompt_tokens INTEGER, -- Token count for prompt
  ai_completion_tokens INTEGER, -- Token count for completion
  ai_processing_time_ms INTEGER, -- Time taken to generate response
  
  -- Clinical Information
  contains_pain_mention BOOLEAN DEFAULT false,
  mentioned_pain_level INTEGER, -- Extracted pain level (0-10)
  contains_concern BOOLEAN DEFAULT false,
  clinical_keywords TEXT[], -- Extracted clinical keywords
  sentiment_score DECIMAL, -- Sentiment analysis score (-1 to 1)
  
  -- Message Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  requires_response BOOLEAN DEFAULT false,
  
  -- Timing
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. CHAT TEMPLATES AND PROMPTS
-- =====================================================

-- AI prompt templates for different conversation types
CREATE TABLE chat_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Prompt Information
  name TEXT NOT NULL,
  description TEXT,
  prompt_type TEXT NOT NULL CHECK (prompt_type IN (
    'welcome', 'daily_checkin', 'exercise_guidance', 'pain_assessment',
    'medication_reminder', 'form_introduction', 'encouragement',
    'escalation', 'emergency_response', 'general_support'
  )),
  
  -- Prompt Content
  system_prompt TEXT NOT NULL, -- Base system prompt
  user_prompt_template TEXT, -- Template with variables
  
  -- Conditional Usage
  surgery_types TEXT[] DEFAULT ARRAY['TKA', 'THA'],
  recovery_phases TEXT[] DEFAULT ARRAY['immediate', 'early', 'intermediate', 'advanced'],
  trigger_conditions JSONB, -- Conditions for when to use this prompt
  
  -- Prompt Configuration
  max_tokens INTEGER DEFAULT 500,
  temperature DECIMAL DEFAULT 0.7,
  include_patient_context BOOLEAN DEFAULT true,
  include_conversation_history BOOLEAN DEFAULT true,
  
  -- Clinical Guidelines
  clinical_guidelines TEXT,
  safety_constraints TEXT[],
  escalation_triggers TEXT[],
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, name, version)
);

-- Pre-defined quick responses and suggestions
CREATE TABLE quick_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Response Information
  text TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'pain_levels', 'mood_responses', 'exercise_feedback', 'medication_questions',
    'general_questions', 'emergency_responses', 'encouragement'
  )),
  
  -- Usage Context
  surgery_types TEXT[] DEFAULT ARRAY['TKA', 'THA'],
  recovery_phases TEXT[] DEFAULT ARRAY['immediate', 'early', 'intermediate', 'advanced'],
  trigger_keywords TEXT[], -- Keywords that suggest this response
  
  -- Response Behavior
  is_voice_friendly BOOLEAN DEFAULT true, -- Can be used with voice input
  requires_followup BOOLEAN DEFAULT false,
  followup_prompt TEXT,
  
  -- Analytics
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. CHAT ATTACHMENTS AND MEDIA
-- =====================================================

-- File attachments in chat messages
CREATE TABLE message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  
  -- File Information
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- image, audio, document, video
  file_size_bytes INTEGER,
  mime_type TEXT,
  
  -- Storage Information
  file_url TEXT NOT NULL,
  thumbnail_url TEXT, -- For images and videos
  
  -- Processing Status
  is_processed BOOLEAN DEFAULT false,
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  
  -- Content Analysis (for images/documents)
  extracted_text TEXT, -- OCR results
  content_analysis JSONB, -- AI analysis of content
  
  -- Security and Compliance
  is_phi BOOLEAN DEFAULT false, -- Contains Protected Health Information
  encryption_key_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. CONVERSATION ANALYTICS AND INSIGHTS
-- =====================================================

-- Daily conversation analytics
CREATE TABLE conversation_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(user_id) ON DELETE CASCADE,
  
  -- Analytics Period
  date DATE DEFAULT CURRENT_DATE,
  
  -- Conversation Metrics
  total_conversations INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  ai_messages INTEGER DEFAULT 0,
  patient_messages INTEGER DEFAULT 0,
  
  -- Engagement Metrics
  average_response_time_seconds INTEGER,
  voice_messages_count INTEGER DEFAULT 0,
  voice_usage_percentage DECIMAL,
  
  -- Clinical Metrics
  pain_mentions_count INTEGER DEFAULT 0,
  average_pain_level DECIMAL,
  concern_flags_count INTEGER DEFAULT 0,
  escalations_count INTEGER DEFAULT 0,
  
  -- Sentiment Analysis
  average_sentiment_score DECIMAL,
  positive_interactions INTEGER DEFAULT 0,
  negative_interactions INTEGER DEFAULT 0,
  
  -- AI Performance
  total_ai_tokens INTEGER DEFAULT 0,
  average_ai_response_time_ms INTEGER,
  ai_errors_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, patient_id, date)
);

-- Conversation topics and themes tracking
CREATE TABLE conversation_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  
  -- Topic Information
  topic TEXT NOT NULL,
  topic_category TEXT CHECK (topic_category IN (
    'pain_management', 'exercise', 'medication', 'mobility', 'sleep',
    'emotional_support', 'daily_activities', 'concerns', 'progress'
  )),
  
  -- Topic Metrics
  confidence_score DECIMAL, -- AI confidence in topic identification
  message_count INTEGER DEFAULT 1, -- How many messages discussed this topic
  
  -- Clinical Relevance
  is_clinically_significant BOOLEAN DEFAULT false,
  requires_provider_review BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. PROVIDER CHAT INTERVENTIONS
-- =====================================================

-- Provider interventions in patient conversations
CREATE TABLE chat_interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(user_id) ON DELETE CASCADE,
  provider_id UUID REFERENCES profiles(id) NOT NULL,
  
  -- Intervention Details
  intervention_type TEXT NOT NULL CHECK (intervention_type IN (
    'direct_message', 'care_plan_adjustment', 'medication_change',
    'exercise_modification', 'escalation_response', 'reassurance'
  )),
  
  -- Intervention Content
  provider_message TEXT,
  internal_notes TEXT, -- Notes not visible to patient
  
  -- Intervention Context
  trigger_message_id UUID REFERENCES messages(id), -- Message that triggered intervention
  trigger_reason TEXT,
  urgency_level TEXT DEFAULT 'routine' CHECK (urgency_level IN ('routine', 'urgent', 'emergency')),
  
  -- Follow-up
  requires_followup BOOLEAN DEFAULT false,
  followup_date DATE,
  followup_completed BOOLEAN DEFAULT false,
  
  -- Outcome
  patient_response TEXT,
  intervention_outcome TEXT,
  was_effective BOOLEAN,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. INDEXES FOR PERFORMANCE
-- =====================================================

-- Chat system indexes
CREATE INDEX idx_conversations_patient_status ON conversations(patient_id, status);
CREATE INDEX idx_conversations_urgent ON conversations(requires_provider_attention, is_urgent);
CREATE INDEX idx_conversations_date ON conversations(started_at, patient_id);

CREATE INDEX idx_messages_conversation_time ON messages(conversation_id, sent_at);
CREATE INDEX idx_messages_patient_type ON messages(patient_id, message_type);
CREATE INDEX idx_messages_clinical_flags ON messages(contains_pain_mention, contains_concern);
CREATE INDEX idx_messages_pain_level ON messages(mentioned_pain_level) WHERE mentioned_pain_level IS NOT NULL;

CREATE INDEX idx_chat_prompts_type_surgery ON chat_prompts(prompt_type, surgery_types);
CREATE INDEX idx_quick_responses_category ON quick_responses(category, is_active);

CREATE INDEX idx_conversation_analytics_date ON conversation_analytics(date, tenant_id);
CREATE INDEX idx_conversation_topics_category ON conversation_topics(topic_category, is_clinically_significant);

-- =====================================================
-- 7. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all chat tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_interventions ENABLE ROW LEVEL SECURITY;

-- Conversations Policies
CREATE POLICY "Patients can view their own conversations" ON conversations
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Patients can update their own conversations" ON conversations
  FOR UPDATE USING (patient_id = auth.uid());

CREATE POLICY "Providers can view conversations in their tenant" ON conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN patients pt ON pt.user_id = patient_id
      WHERE p.id = auth.uid()
      AND p.tenant_id = pt.tenant_id
      AND p.role IN ('practice_admin', 'clinic_admin', 'surgeon', 'nurse', 'physical_therapist')
    )
  );

CREATE POLICY "System can manage all conversations" ON conversations
  FOR ALL USING (auth.uid() IS NULL); -- For system/AI operations

-- Messages Policies
CREATE POLICY "Patients can view their own messages" ON messages
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Patients can insert their own messages" ON messages
  FOR INSERT WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Providers can view messages in their tenant" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN patients pt ON pt.user_id = patient_id
      WHERE p.id = auth.uid()
      AND p.tenant_id = pt.tenant_id
      AND p.role IN ('practice_admin', 'clinic_admin', 'surgeon', 'nurse', 'physical_therapist')
    )
  );

CREATE POLICY "Providers can insert messages in their tenant" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN patients pt ON pt.user_id = patient_id
      WHERE p.id = auth.uid()
      AND p.tenant_id = pt.tenant_id
      AND p.role IN ('practice_admin', 'clinic_admin', 'surgeon', 'nurse', 'physical_therapist')
    )
  );

CREATE POLICY "System can manage all messages" ON messages
  FOR ALL USING (auth.uid() IS NULL); -- For system/AI operations

-- Chat Prompts Policies
CREATE POLICY "Users can view chat prompts in their tenant" ON chat_prompts
  FOR SELECT USING (tenant_id IN (SELECT unnest(accessible_tenants) FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Providers can manage chat prompts in their tenant" ON chat_prompts
  FOR ALL USING (
    tenant_id IN (SELECT unnest(accessible_tenants) FROM profiles WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('practice_admin', 'clinic_admin'))
  );

-- =====================================================
-- 8. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update conversation metadata when messages are added
CREATE OR REPLACE FUNCTION update_conversation_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Update conversation last message time and status
  UPDATE conversations 
  SET 
    last_message_at = NEW.sent_at,
    updated_at = NOW(),
    -- Extract pain level if mentioned
    pain_level_mentioned = CASE 
      WHEN NEW.mentioned_pain_level IS NOT NULL THEN NEW.mentioned_pain_level
      ELSE pain_level_mentioned
    END,
    -- Update urgency if concerning content
    requires_provider_attention = CASE
      WHEN NEW.contains_concern OR NEW.mentioned_pain_level > 7 THEN true
      ELSE requires_provider_attention
    END
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for conversation metadata updates
CREATE TRIGGER trigger_update_conversation_metadata
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_metadata();

-- Function to analyze message content for clinical keywords
CREATE OR REPLACE FUNCTION analyze_message_content()
RETURNS TRIGGER AS $$
DECLARE
  pain_keywords TEXT[] := ARRAY['pain', 'hurt', 'ache', 'sore', 'uncomfortable', 'agony'];
  concern_keywords TEXT[] := ARRAY['worried', 'scared', 'concerned', 'problem', 'wrong', 'emergency'];
  pain_pattern TEXT := '\b(\d+)\s*(?:out of|/)\s*10\b|\b(\d+)\s*pain\b';
  keyword TEXT;
  extracted_pain INTEGER;
BEGIN
  -- Only analyze patient messages
  IF NEW.sender_type = 'patient' THEN
    -- Check for pain mentions
    FOREACH keyword IN ARRAY pain_keywords LOOP
      IF LOWER(NEW.content) LIKE '%' || keyword || '%' THEN
        NEW.contains_pain_mention := true;
        EXIT;
      END IF;
    END LOOP;
    
    -- Extract pain level using regex
    SELECT COALESCE(
      (regexp_match(LOWER(NEW.content), pain_pattern))[1]::INTEGER,
      (regexp_match(LOWER(NEW.content), pain_pattern))[2]::INTEGER
    ) INTO extracted_pain;
    
    IF extracted_pain IS NOT NULL AND extracted_pain BETWEEN 0 AND 10 THEN
      NEW.mentioned_pain_level := extracted_pain;
      NEW.contains_pain_mention := true;
    END IF;
    
    -- Check for concern keywords
    FOREACH keyword IN ARRAY concern_keywords LOOP
      IF LOWER(NEW.content) LIKE '%' || keyword || '%' THEN
        NEW.contains_concern := true;
        EXIT;
      END IF;
    END LOOP;
    
    -- Set clinical keywords array
    NEW.clinical_keywords := ARRAY(
      SELECT unnest(pain_keywords || concern_keywords)
      WHERE LOWER(NEW.content) LIKE '%' || unnest(pain_keywords || concern_keywords) || '%'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for message content analysis
CREATE TRIGGER trigger_analyze_message_content
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION analyze_message_content();

-- Function to update daily conversation analytics
CREATE OR REPLACE FUNCTION update_conversation_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update daily analytics
  INSERT INTO conversation_analytics (
    tenant_id, patient_id, date, total_messages,
    ai_messages, patient_messages, voice_messages_count
  )
  SELECT 
    (SELECT tenant_id FROM patients WHERE user_id = NEW.patient_id),
    NEW.patient_id,
    NEW.sent_at::DATE,
    1,
    CASE WHEN NEW.sender_type = 'ai' THEN 1 ELSE 0 END,
    CASE WHEN NEW.sender_type = 'patient' THEN 1 ELSE 0 END,
    CASE WHEN NEW.message_type = 'patient_voice' THEN 1 ELSE 0 END
  ON CONFLICT (tenant_id, patient_id, date)
  DO UPDATE SET
    total_messages = conversation_analytics.total_messages + 1,
    ai_messages = conversation_analytics.ai_messages + 
      CASE WHEN NEW.sender_type = 'ai' THEN 1 ELSE 0 END,
    patient_messages = conversation_analytics.patient_messages + 
      CASE WHEN NEW.sender_type = 'patient' THEN 1 ELSE 0 END,
    voice_messages_count = conversation_analytics.voice_messages_count + 
      CASE WHEN NEW.message_type = 'patient_voice' THEN 1 ELSE 0 END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for analytics updates
CREATE TRIGGER trigger_update_conversation_analytics
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_analytics();

