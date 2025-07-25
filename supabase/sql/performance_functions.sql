-- Performance optimization functions for TJV Recovery Platform
-- These RPC functions provide efficient data aggregation and complex queries

-- Function to get tenant metrics efficiently
CREATE OR REPLACE FUNCTION get_tenant_metrics(p_tenant_id uuid)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    result json;
BEGIN
    SELECT json_build_object(
        'totalPatients', (
            SELECT COUNT(*) 
            FROM patients 
            WHERE tenant_id = p_tenant_id
        ),
        'activePatients', (
            SELECT COUNT(*) 
            FROM patients 
            WHERE tenant_id = p_tenant_id AND status = 'active'
        ),
        'activeConversations', (
            SELECT COUNT(*) 
            FROM conversations 
            WHERE tenant_id = p_tenant_id AND status = 'active'
        ),
        'completedTasks', (
            SELECT COUNT(*) 
            FROM patient_tasks pt
            JOIN patients p ON pt.patient_id = p.id
            WHERE p.tenant_id = p_tenant_id AND pt.status = 'completed'
        ),
        'totalProviders', (
            SELECT COUNT(*) 
            FROM profiles 
            WHERE tenant_id = p_tenant_id 
            AND role IN ('surgeon', 'nurse', 'physical_therapist', 'clinic_admin')
        ),
        'pendingAlerts', (
            SELECT COUNT(*) 
            FROM alerts 
            WHERE tenant_id = p_tenant_id AND status = 'active'
        )
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Function to get conversations with message counts
CREATE OR REPLACE FUNCTION get_conversations_with_counts(p_tenant_id uuid)
RETURNS TABLE(
    id uuid,
    patient_id uuid,
    title text,
    status text,
    created_at timestamptz,
    last_message_at timestamptz,
    message_count bigint,
    unread_count bigint,
    patient_name text,
    patient_email text
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.patient_id,
        c.title,
        c.status,
        c.created_at,
        c.last_message_at,
        COALESCE(msg_counts.total_messages, 0) as message_count,
        COALESCE(msg_counts.unread_messages, 0) as unread_count,
        pr.full_name as patient_name,
        pr.email as patient_email
    FROM conversations c
    LEFT JOIN patients p ON c.patient_id = p.id
    LEFT JOIN profiles pr ON p.user_id = pr.id
    LEFT JOIN (
        SELECT 
            conversation_id,
            COUNT(*) as total_messages,
            COUNT(CASE WHEN read_at IS NULL THEN 1 END) as unread_messages
        FROM messages
        GROUP BY conversation_id
    ) msg_counts ON c.id = msg_counts.conversation_id
    WHERE c.tenant_id = p_tenant_id
    AND c.status = 'active'
    ORDER BY c.last_message_at DESC NULLS LAST;
END;
$$;

-- Function to efficiently complete a patient task with side effects
CREATE OR REPLACE FUNCTION complete_patient_task(
    p_task_id uuid,
    p_completion_data jsonb DEFAULT '{}'::jsonb
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    task_record patient_tasks%ROWTYPE;
    patient_record patients%ROWTYPE;
    result json;
BEGIN
    -- Get the task and patient info
    SELECT pt.*, p.* 
    INTO task_record, patient_record
    FROM patient_tasks pt
    JOIN patients p ON pt.patient_id = p.id
    WHERE pt.id = p_task_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Task not found';
    END IF;
    
    -- Update the task
    UPDATE patient_tasks 
    SET 
        status = 'completed',
        completed_at = NOW(),
        completion_data = p_completion_data,
        updated_at = NOW()
    WHERE id = p_task_id;
    
    -- Update patient's last activity
    UPDATE patients 
    SET 
        last_activity_at = NOW(),
        updated_at = NOW()
    WHERE id = task_record.patient_id;
    
    -- Check if this completes a milestone and create alert if needed
    IF task_record.task_type = 'milestone' THEN
        INSERT INTO alerts (
            patient_id,
            tenant_id,
            alert_type,
            severity,
            message,
            status,
            created_at
        ) VALUES (
            task_record.patient_id,
            patient_record.tenant_id,
            'milestone_completed',
            'low',
            'Patient completed milestone: ' || task_record.title,
            'active',
            NOW()
        );
    END IF;
    
    -- Return success response
    SELECT json_build_object(
        'success', true,
        'task_id', p_task_id,
        'completed_at', NOW(),
        'patient_id', task_record.patient_id
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Function to get patient dashboard data efficiently
CREATE OR REPLACE FUNCTION get_patient_dashboard_data(p_patient_id uuid)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    result json;
    patient_data patients%ROWTYPE;
BEGIN
    -- Get patient record
    SELECT * INTO patient_data FROM patients WHERE id = p_patient_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Patient not found';
    END IF;
    
    SELECT json_build_object(
        'patient', row_to_json(patient_data),
        'todaysTasks', (
            SELECT json_agg(
                json_build_object(
                    'id', pt.id,
                    'title', pt.title,
                    'description', pt.description,
                    'task_type', pt.task_type,
                    'status', pt.status,
                    'estimated_duration', pt.estimated_duration
                )
            )
            FROM patient_tasks pt
            WHERE pt.patient_id = p_patient_id
            AND pt.assigned_date = patient_data.current_recovery_day
            AND pt.status != 'completed'
        ),
        'metrics', (
            SELECT json_build_object(
                'totalTasks', (
                    SELECT COUNT(*) FROM patient_tasks WHERE patient_id = p_patient_id
                ),
                'completedTasks', (
                    SELECT COUNT(*) FROM patient_tasks 
                    WHERE patient_id = p_patient_id AND status = 'completed'
                ),
                'formsCompleted', (
                    SELECT COUNT(*) FROM form_responses WHERE patient_id = p_patient_id
                ),
                'exercisesCompleted', (
                    SELECT COUNT(*) FROM exercise_completions WHERE patient_id = p_patient_id
                )
            )
        ),
        'careTeam', (
            SELECT json_build_object(
                'surgeon', surgeon_profile.*,
                'nurse', nurse_profile.*,
                'pt', pt_profile.*
            )
            FROM patients p
            LEFT JOIN profiles surgeon_profile ON p.surgeon_id = surgeon_profile.id
            LEFT JOIN profiles nurse_profile ON p.primary_nurse_id = nurse_profile.id
            LEFT JOIN profiles pt_profile ON p.physical_therapist_id = pt_profile.id
            WHERE p.id = p_patient_id
        )
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Function to update patient recovery days (run daily)
CREATE OR REPLACE FUNCTION update_patient_recovery_days()
RETURNS int
LANGUAGE plpgsql
AS $$
DECLARE
    updated_count int := 0;
BEGIN
    UPDATE patients 
    SET 
        current_recovery_day = CASE 
            WHEN surgery_date IS NOT NULL THEN 
                EXTRACT(DAY FROM (NOW() - surgery_date))::int
            ELSE 0
        END,
        updated_at = NOW()
    WHERE surgery_date IS NOT NULL;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RETURN updated_count;
END;
$$;

-- Function to get practice performance analytics
CREATE OR REPLACE FUNCTION get_practice_analytics(
    p_tenant_id uuid,
    p_start_date date DEFAULT (NOW() - INTERVAL '30 days')::date,
    p_end_date date DEFAULT NOW()::date
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    result json;
BEGIN
    SELECT json_build_object(
        'period', json_build_object(
            'start_date', p_start_date,
            'end_date', p_end_date
        ),
        'newPatients', (
            SELECT COUNT(*) 
            FROM patients 
            WHERE tenant_id = p_tenant_id 
            AND created_at::date BETWEEN p_start_date AND p_end_date
        ),
        'completedRecoveries', (
            SELECT COUNT(*) 
            FROM patients 
            WHERE tenant_id = p_tenant_id 
            AND status = 'completed'
            AND updated_at::date BETWEEN p_start_date AND p_end_date
        ),
        'tasksCompleted', (
            SELECT COUNT(*) 
            FROM patient_tasks pt
            JOIN patients p ON pt.patient_id = p.id
            WHERE p.tenant_id = p_tenant_id 
            AND pt.status = 'completed'
            AND pt.completed_at::date BETWEEN p_start_date AND p_end_date
        ),
        'averageRecoveryTime', (
            SELECT AVG(
                EXTRACT(DAY FROM (
                    CASE WHEN status = 'completed' THEN updated_at ELSE NOW() END - surgery_date
                ))
            )
            FROM patients 
            WHERE tenant_id = p_tenant_id 
            AND surgery_date IS NOT NULL
            AND surgery_date::date BETWEEN p_start_date AND p_end_date
        ),
        'surgeryTypes', (
            SELECT json_object_agg(surgery_type, count)
            FROM (
                SELECT surgery_type, COUNT(*) as count
                FROM patients 
                WHERE tenant_id = p_tenant_id
                AND created_at::date BETWEEN p_start_date AND p_end_date
                GROUP BY surgery_type
            ) surgery_counts
        ),
        'alertsByType', (
            SELECT json_object_agg(alert_type, count)
            FROM (
                SELECT alert_type, COUNT(*) as count
                FROM alerts 
                WHERE tenant_id = p_tenant_id
                AND created_at::date BETWEEN p_start_date AND p_end_date
                GROUP BY alert_type
            ) alert_counts
        )
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Function to clean up old data (maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_data(
    p_retention_days int DEFAULT 365
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    cutoff_date timestamptz;
    deleted_counts json;
    messages_deleted int := 0;
    alerts_deleted int := 0;
    logs_deleted int := 0;
BEGIN
    cutoff_date := NOW() - (p_retention_days || ' days')::interval;
    
    -- Delete old resolved alerts
    DELETE FROM alerts 
    WHERE status = 'resolved' 
    AND resolved_at < cutoff_date;
    GET DIAGNOSTICS alerts_deleted = ROW_COUNT;
    
    -- Delete old conversation messages (keep last 100 per conversation)
    WITH old_messages AS (
        SELECT id 
        FROM (
            SELECT id, 
                   ROW_NUMBER() OVER (PARTITION BY conversation_id ORDER BY sent_at DESC) as rn
            FROM messages 
            WHERE sent_at < cutoff_date
        ) ranked 
        WHERE rn > 100
    )
    DELETE FROM messages 
    WHERE id IN (SELECT id FROM old_messages);
    GET DIAGNOSTICS messages_deleted = ROW_COUNT;
    
    -- Note: Add more cleanup operations as needed
    
    SELECT json_build_object(
        'retention_days', p_retention_days,
        'cutoff_date', cutoff_date,
        'deleted', json_build_object(
            'messages', messages_deleted,
            'alerts', alerts_deleted,
            'logs', logs_deleted
        )
    ) INTO deleted_counts;
    
    RETURN deleted_counts;
END;
$$;

-- Create indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_patients_tenant_status 
ON patients(tenant_id, status) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_tenant_active 
ON conversations(tenant_id, last_message_at) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_patient_tasks_patient_date 
ON patient_tasks(patient_id, assigned_date, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation_sent 
ON messages(conversation_id, sent_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_alerts_tenant_active 
ON alerts(tenant_id, created_at) WHERE status = 'active';

-- Grant execute permissions (adjust as needed for your setup)
GRANT EXECUTE ON FUNCTION get_tenant_metrics(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_conversations_with_counts(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_patient_task(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION get_patient_dashboard_data(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_practice_analytics(uuid, date, date) TO authenticated;