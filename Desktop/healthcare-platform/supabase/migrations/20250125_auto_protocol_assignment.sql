-- Enable automatic protocol assignment for patients
-- This migration adds the necessary functions and triggers to automatically
-- assign standard protocols to patients when they are created

-- Function to find the appropriate protocol for a patient
CREATE OR REPLACE FUNCTION find_protocol_for_patient(
  p_tenant_id UUID,
  p_surgery_type TEXT
) RETURNS UUID AS $$
DECLARE
  v_protocol_id UUID;
BEGIN
  -- First try to find a protocol matching the exact surgery type
  SELECT id INTO v_protocol_id
  FROM protocols
  WHERE tenant_id = p_tenant_id
    AND is_template = true
    AND is_active = true
    AND (
      surgery_types @> ARRAY[p_surgery_type]
      OR surgery_type = p_surgery_type
    )
  ORDER BY created_at DESC
  LIMIT 1;

  -- If no specific protocol found, try to find a generic template
  IF v_protocol_id IS NULL THEN
    SELECT id INTO v_protocol_id
    FROM protocols
    WHERE tenant_id = p_tenant_id
      AND is_template = true
      AND is_active = true
      AND (name ILIKE '%standard%' OR name ILIKE '%TJV%')
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;

  RETURN v_protocol_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically assign protocol to new patients
CREATE OR REPLACE FUNCTION auto_assign_protocol_to_patient()
RETURNS TRIGGER AS $$
DECLARE
  v_protocol_id UUID;
  v_auto_assign_enabled BOOLEAN;
  v_patient_protocol_id UUID;
BEGIN
  -- Check if tenant has automatic protocol assignment enabled
  SELECT (settings->>'automatic_protocol_assignment')::BOOLEAN
  INTO v_auto_assign_enabled
  FROM tenants
  WHERE id = NEW.tenant_id;

  -- If not enabled or NULL, default to true for backward compatibility
  IF v_auto_assign_enabled IS NULL OR v_auto_assign_enabled = true THEN
    -- Check if patient already has an active protocol
    SELECT id INTO v_patient_protocol_id
    FROM patient_protocols
    WHERE patient_id = NEW.id
      AND status = 'active'
    LIMIT 1;

    -- Only assign if no active protocol exists
    IF v_patient_protocol_id IS NULL AND NEW.surgery_type IS NOT NULL THEN
      -- Find appropriate protocol
      v_protocol_id := find_protocol_for_patient(NEW.tenant_id, NEW.surgery_type);

      -- If protocol found, assign it
      IF v_protocol_id IS NOT NULL THEN
        -- Create patient protocol assignment
        INSERT INTO patient_protocols (
          patient_id,
          protocol_id,
          surgery_date,
          surgery_type,
          assigned_by,
          status,
          tenant_id
        ) VALUES (
          NEW.id,
          v_protocol_id,
          NEW.surgery_date,
          NEW.surgery_type,
          'system',
          'active',
          NEW.tenant_id
        ) RETURNING id INTO v_patient_protocol_id;

        -- Create patient tasks from protocol tasks
        INSERT INTO patient_tasks (
          patient_protocol_id,
          protocol_task_id,
          patient_id,
          scheduled_date,
          due_date,
          status
        )
        SELECT
          v_patient_protocol_id,
          pt.id,
          NEW.id,
          NEW.surgery_date + (pt.day || ' days')::INTERVAL,
          NEW.surgery_date + (pt.day || ' days')::INTERVAL,
          'pending'
        FROM protocol_tasks pt
        WHERE pt.protocol_id = v_protocol_id;

        -- Log the automatic assignment
        INSERT INTO audit_logs (
          action,
          details,
          user_id,
          tenant_id
        ) VALUES (
          'auto_protocol_assignment',
          jsonb_build_object(
            'patient_id', NEW.id,
            'protocol_id', v_protocol_id,
            'patient_protocol_id', v_patient_protocol_id,
            'surgery_type', NEW.surgery_type,
            'trigger', 'new_patient'
          ),
          'system',
          NEW.tenant_id
        );
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new patients
DROP TRIGGER IF EXISTS auto_assign_protocol_on_patient_create ON patients;
CREATE TRIGGER auto_assign_protocol_on_patient_create
  AFTER INSERT ON patients
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_protocol_to_patient();

-- Function to handle protocol assignment after invitation acceptance
CREATE OR REPLACE FUNCTION assign_protocol_after_invitation_acceptance()
RETURNS TRIGGER AS $$
DECLARE
  v_protocol_id UUID;
  v_patient_id UUID;
  v_patient_protocol_id UUID;
BEGIN
  -- Only proceed if status changed to 'accepted'
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' AND NEW.created_patient_id IS NOT NULL THEN
    -- Get patient details
    SELECT id, surgery_type, surgery_date 
    INTO v_patient_id
    FROM patients
    WHERE id = NEW.created_patient_id;

    IF v_patient_id IS NOT NULL THEN
      -- Find and assign protocol
      v_protocol_id := find_protocol_for_patient(NEW.tenant_id, NEW.surgery_type);

      IF v_protocol_id IS NOT NULL THEN
        -- Check if patient already has this protocol
        SELECT id INTO v_patient_protocol_id
        FROM patient_protocols
        WHERE patient_id = v_patient_id
          AND protocol_id = v_protocol_id
          AND status = 'active'
        LIMIT 1;

        -- Only create if not exists
        IF v_patient_protocol_id IS NULL THEN
          -- Create assignment
          INSERT INTO patient_protocols (
            patient_id,
            protocol_id,
            surgery_date,
            surgery_type,
            assigned_by,
            status,
            tenant_id
          ) VALUES (
            v_patient_id,
            v_protocol_id,
            NEW.surgery_date,
            NEW.surgery_type,
            NEW.provider_id,
            'active',
            NEW.tenant_id
          );
        END IF;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for invitation acceptance
DROP TRIGGER IF EXISTS assign_protocol_on_invitation_accept ON patient_invitations;
CREATE TRIGGER assign_protocol_on_invitation_accept
  AFTER UPDATE ON patient_invitations
  FOR EACH ROW
  EXECUTE FUNCTION assign_protocol_after_invitation_acceptance();

-- Function to seed protocols for new tenants
CREATE OR REPLACE FUNCTION seed_protocols_for_new_tenant()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is a healthcare tenant (not a test tenant)
  IF NEW.name NOT ILIKE '%test%' THEN
    -- Create a job to seed protocols asynchronously
    -- This would typically call the protocol seeder service
    INSERT INTO audit_logs (
      action,
      details,
      user_id,
      tenant_id
    ) VALUES (
      'tenant_created_needs_protocol_seed',
      jsonb_build_object(
        'tenant_id', NEW.id,
        'tenant_name', NEW.name,
        'created_at', NEW.created_at
      ),
      'system',
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new tenants
DROP TRIGGER IF EXISTS seed_protocols_on_tenant_create ON tenants;
CREATE TRIGGER seed_protocols_on_tenant_create
  AFTER INSERT ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION seed_protocols_for_new_tenant();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_protocols_tenant_template 
  ON protocols(tenant_id, is_template, is_active);

CREATE INDEX IF NOT EXISTS idx_patient_protocols_patient_status 
  ON patient_protocols(patient_id, status);

-- Add setting to tenants table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tenants' 
    AND column_name = 'settings'
  ) THEN
    ALTER TABLE tenants 
    ADD COLUMN settings JSONB DEFAULT '{"automatic_protocol_assignment": true}'::jsonb;
  END IF;
END $$;