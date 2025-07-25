# Automatic Protocol Assignment System

## Overview

The Automatic Protocol Assignment System ensures that every patient in the healthcare platform receives the appropriate recovery protocol without requiring manual intervention from clinic or practice staff. This system operates seamlessly across multiple patient onboarding scenarios.

## Key Features

### 1. Zero Manual Setup Required
- Standard protocols are automatically assigned to all new patients
- No provider action needed for standard care pathways
- Protocols are matched based on surgery type
- Fallback to generic protocols if specific type not found

### 2. Multiple Entry Points Supported
- **Patient Invitation Flow**: Protocols assigned when patients accept invitations
- **Direct Patient Signup**: Automatic assignment during registration
- **Batch Import**: Bulk patient imports receive protocols automatically
- **Provider-Created Patients**: Manual patient creation triggers assignment

### 3. Tenant-Level Configuration
- Each tenant has standard protocols seeded automatically
- Protocols are isolated between tenants
- Customization allowed while maintaining templates
- Version tracking for protocol updates

## Technical Implementation

### Database Layer

#### Automatic Assignment Trigger
```sql
-- Trigger fires after patient insertion
CREATE TRIGGER auto_assign_protocol_on_patient_create
  AFTER INSERT ON patients
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_protocol_to_patient();
```

#### Protocol Matching Logic
1. First attempts exact surgery type match
2. Falls back to generic "Standard TJV Recovery Protocol"
3. Checks tenant settings for auto-assignment preference
4. Prevents duplicate assignments

### Service Layer

#### Protocol Auto-Assignment Service
Located at: `/lib/services/protocol-auto-assignment.ts`

Key methods:
- `autoAssignProtocolToPatient()` - Core assignment logic
- `ensureTenantProtocolsSeeded()` - Ensures protocols exist
- `handleInvitationAcceptance()` - Invitation flow integration
- `handleBatchPatientImport()` - Bulk assignment support

#### Protocol Seeder Service
Located at: `/lib/services/protocol-seeder.ts`

- Seeds 245-day recovery timeline
- Creates all task types (forms, exercises, videos, messages)
- Maintains phase structure from clinical data
- Supports validation of seeded data

### Application Layer

#### Patient Creation Flows

1. **Invitation Acceptance** (`/app/auth/invite/[token]/page.tsx`)
   - Captures surgery details from invitation
   - Creates patient record
   - Triggers automatic protocol assignment

2. **Direct Signup** (`/app/auth/signup/page.tsx`)
   - Collects surgery information during registration
   - Patient creation triggers assignment

3. **Provider Dashboard** (`/app/provider/patients/new/page.tsx`)
   - Provider enters patient details
   - System assigns protocol automatically

## Configuration

### Tenant Settings
```json
{
  "automatic_protocol_assignment": true,
  "default_protocol_id": null,
  "protocol_matching_rules": {
    "TKA": "Standard TKA Recovery Protocol",
    "THA": "Standard THA Recovery Protocol",
    "TSA": "Standard TSA Recovery Protocol"
  }
}
```

### Environment Variables
```env
# Enable/disable automatic assignment globally
ENABLE_AUTO_PROTOCOL_ASSIGNMENT=true

# Default protocol assignment delay (ms)
PROTOCOL_ASSIGNMENT_DELAY=1000
```

## Testing

### Test Coverage

1. **Unit Tests**
   - Protocol service logic
   - Seeder functionality
   - Assignment service methods

2. **Integration Tests**
   - Patient onboarding flows
   - Tenant provisioning
   - Multi-tenant isolation

3. **E2E Tests**
   - Complete patient journey
   - Provider workflows
   - Batch operations

### Running Tests
```bash
# Run all protocol tests
npm test tests/**/*protocol*

# Run specific test suite
npm test tests/integration/patient-onboarding.test.ts

# Run with coverage
npm test -- --coverage
```

## Monitoring & Troubleshooting

### Audit Logs
All automatic assignments are logged in `audit_logs` table:
```sql
SELECT * FROM audit_logs 
WHERE action = 'auto_protocol_assignment'
ORDER BY created_at DESC;
```

### Common Issues

1. **No Protocol Assigned**
   - Check if tenant has seeded protocols
   - Verify surgery type matches available protocols
   - Ensure tenant settings allow auto-assignment

2. **Duplicate Assignments**
   - System prevents multiple active protocols
   - Check patient_protocols for existing assignments

3. **Missing Tasks**
   - Verify protocol_tasks exist for protocol
   - Check task creation in patient_tasks

### Debug Queries
```sql
-- Check tenant protocols
SELECT * FROM protocols 
WHERE tenant_id = ? AND is_template = true;

-- Verify patient assignment
SELECT pp.*, p.name as protocol_name
FROM patient_protocols pp
JOIN protocols p ON pp.protocol_id = p.id
WHERE pp.patient_id = ?;

-- Check assignment failures
SELECT * FROM audit_logs
WHERE action = 'auto_protocol_assignment'
AND details->>'error' IS NOT NULL;
```

## Best Practices

1. **Always Seed Protocols First**
   - Run protocol seeder during tenant setup
   - Verify protocols exist before going live

2. **Monitor Assignment Success**
   - Set up alerts for assignment failures
   - Track assignment metrics in dashboards

3. **Test Surgery Type Matching**
   - Ensure all expected surgery types have protocols
   - Test fallback behavior

4. **Version Control Protocols**
   - Track changes to protocol templates
   - Maintain backward compatibility

## Future Enhancements

1. **Smart Protocol Selection**
   - ML-based protocol matching
   - Patient history consideration
   - Outcome-based optimization

2. **Dynamic Protocol Creation**
   - AI-generated protocols for edge cases
   - Provider preference learning
   - Automatic protocol updates

3. **Advanced Configuration**
   - Rule-based assignment engine
   - Conditional protocol selection
   - Multi-protocol support

## Support

For issues with automatic protocol assignment:
1. Check audit logs for errors
2. Verify tenant configuration
3. Ensure protocols are properly seeded
4. Contact technical support with tenant ID and patient ID