-- Create alerts table for provider notifications
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  conversation_id UUID REFERENCES conversations(id),
  
  -- Alert details
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'high_pain_score',
    'missed_medication',
    'emergency_request',
    'abnormal_vitals',
    'patient_distress',
    'task_overdue',
    'no_response_24h',
    'urgent_question'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  
  -- Alert data
  alert_data JSONB DEFAULT '{}',
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'escalated')),
  acknowledged_by UUID REFERENCES profiles(id),
  acknowledged_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_alerts_tenant_id ON alerts(tenant_id);
CREATE INDEX idx_alerts_patient_id ON alerts(patient_id);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);

-- Enable RLS
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Providers can view alerts in their tenants
CREATE POLICY "Providers can view alerts" ON alerts
  FOR SELECT
  USING (
    tenant_id = ANY(get_user_tenant_ids())
  );

-- Providers can update alerts in their tenants
CREATE POLICY "Providers can update alerts" ON alerts
  FOR UPDATE
  USING (
    tenant_id = ANY(get_user_tenant_ids())
  );

-- System can create alerts (via service role)
-- No policy needed as service role bypasses RLS

-- Create function to auto-generate alerts based on certain conditions
CREATE OR REPLACE FUNCTION generate_patient_alert()
RETURNS TRIGGER AS $$
DECLARE
  v_tenant_id UUID;
  v_patient_id UUID;
BEGIN
  -- Example: Generate alert for high pain score
  IF NEW.sender_type = 'patient' AND NEW.content ILIKE '%pain%' AND (
    NEW.content ILIKE '%severe%' OR 
    NEW.content ILIKE '%unbearable%' OR
    NEW.content ILIKE '%10/10%' OR
    NEW.content ILIKE '%9/10%'
  ) THEN
    -- Get tenant_id and patient_id from conversation
    SELECT c.tenant_id, c.patient_id INTO v_tenant_id, v_patient_id
    FROM conversations c
    WHERE c.id = NEW.conversation_id;
    
    -- Create alert
    INSERT INTO alerts (
      tenant_id,
      patient_id,
      conversation_id,
      alert_type,
      severity,
      title,
      description,
      alert_data
    ) VALUES (
      v_tenant_id,
      v_patient_id,
      NEW.conversation_id,
      'high_pain_score',
      'high',
      'High Pain Score Reported',
      'Patient reported severe pain in conversation',
      jsonb_build_object(
        'message_id', NEW.id,
        'message_content', NEW.content,
        'timestamp', NEW.created_at
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate alerts from messages
CREATE TRIGGER trigger_generate_patient_alert
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION generate_patient_alert();

-- Create view for alert statistics
CREATE OR REPLACE VIEW alert_statistics AS
SELECT
  tenant_id,
  COUNT(*) FILTER (WHERE status = 'active') as active_count,
  COUNT(*) FILTER (WHERE status = 'acknowledged') as acknowledged_count,
  COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
  COUNT(*) FILTER (WHERE severity = 'critical') as critical_count,
  COUNT(*) FILTER (WHERE severity = 'high') as high_count,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as last_24h_count,
  AVG(EXTRACT(EPOCH FROM (COALESCE(acknowledged_at, NOW()) - created_at))) as avg_acknowledgment_time_seconds
FROM alerts
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY tenant_id;

-- Grant permissions
GRANT SELECT ON alert_statistics TO authenticated;