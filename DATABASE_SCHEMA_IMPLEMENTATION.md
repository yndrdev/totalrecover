# TJV Healthcare Platform - Database Schema Implementation

## Overview

This document provides comprehensive documentation for the Supabase database schema implementation for the TJV Healthcare Platform. The schema is designed for a production-ready, HIPAA-compliant healthcare platform supporting multi-tenant architecture, clinical protocols, patient engagement, and comprehensive audit logging.

## Architecture Summary

### Core Features
- **Multi-tenant architecture** with tenant isolation
- **HIPAA-compliant audit logging** for all sensitive operations
- **Row Level Security (RLS)** for data protection
- **Clinical protocol management** with timeline-based tasks
- **Real-time chat system** between patients and providers
- **Dynamic form system** with digital signatures
- **Content management** for videos, exercises, and educational materials
- **Performance optimized** with strategic indexing

### Technology Stack
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Security**: Row Level Security (RLS) policies
- **Compliance**: HIPAA audit trails and data protection

## Database Schema

### Migration Files

The schema is implemented through 8 migration files:

1. **001_create_foundation_tables.sql** - Core foundation (tenants, users)
2. **002_create_organization_tables.sql** - Healthcare organizations (practices)
3. **003_create_patient_provider_tables.sql** - Patient and provider profiles
4. **004_create_protocol_content_tables.sql** - Clinical protocols and content library
5. **005_create_chat_messaging_tables.sql** - Real-time messaging system
6. **006_create_form_audit_tables.sql** - Form submissions and audit logging
7. **007_seed_initial_data.sql** - Initial data including TJV timeline
8. **008_test_schema.sql** - Schema testing and verification

### Core Tables

#### Foundation Tables

**tenants**
- Multi-tenant organization foundation
- Subscription management
- Tenant-specific settings and branding

**users**
- Extends Supabase auth.users
- Healthcare-specific roles (patient, provider, nurse, admin, super_admin)
- Tenant association for data isolation

#### Healthcare Tables

**practices**
- Healthcare practices/organizations within tenants
- Location and contact information
- Practice-specific settings

**patients**
- Patient demographics and medical information
- Medical Record Number (MRN) unique within tenant
- Emergency contacts and insurance information
- Medical history and preferences

**providers**
- Healthcare provider profiles
- NPI numbers and credentials
- Specialty and licensing information

#### Protocol Management

**protocols**
- Clinical recovery protocols
- Surgery type and activity level targeting
- Version control and activation status

**protocol_tasks**
- Individual tasks within protocols
- Timeline-based scheduling (Day -45 to +200)
- Task types: forms, videos, exercises, messages
- Frequency and dependency management

**patient_protocols**
- Protocol assignments to patients
- Surgery date and type tracking
- Assignment metadata and status

**patient_tasks**
- Individual task assignments with completion tracking
- Scheduled dates and due dates
- Response data storage
- Status tracking (pending, in_progress, completed, skipped, overdue)

#### Content Management

**content_videos**
- Educational video library
- Surgery type and phase targeting
- Duration and thumbnail management

**content_forms**
- Dynamic form definitions with JSON schema
- Estimated completion times
- Phase and surgery type targeting

**content_exercises**
- Physical therapy exercise library
- Difficulty levels and body part targeting
- Video and image attachments

#### Communication

**chat_conversations**
- Real-time chat threads
- Patient-provider communication
- Conversation types and status management

**chat_messages**
- Individual chat messages
- Message types (text, form, video, task_completion, system_notification)
- Sender types (patient, provider, ai_assistant, system)
- Read receipts and attachments

#### Compliance & Audit

**form_submissions**
- Patient form responses with digital signatures
- HIPAA-compliant audit trail data
- IP address and user agent tracking

**audit_logs**
- Comprehensive audit logging for HIPAA compliance
- All sensitive operations tracked
- 7-year data retention for compliance
- Success/failure outcome tracking

## Security Implementation

### Row Level Security (RLS)

All tables implement RLS policies for:
- **Tenant isolation** - Users can only access data from their tenant
- **Role-based access** - Different permissions for patients, providers, admins
- **Data ownership** - Patients can only access their own data
- **Provider access** - Providers can access patients within their tenant

### Audit Compliance

- **Automatic audit triggers** on all sensitive tables
- **HIPAA-compliant logging** with IP addresses and user agents
- **Data retention policies** (7 years for HIPAA compliance)
- **Access tracking** for all patient data access

## Performance Optimization

### Strategic Indexing

- **Primary indexes** on all foreign keys
- **Composite indexes** for common query patterns
- **GIN indexes** for JSON array searches (surgery_types, tags)
- **Partial indexes** for filtered queries

### Query Optimization

- **Helper functions** for complex queries
- **Materialized views** potential for analytics
- **Connection pooling** via Supabase
- **Query performance monitoring** built-in

## TJV Timeline Integration

### Complete Clinical Protocol

The schema includes the complete TJV Recovery Timeline:

- **245-day protocol** (Day -45 to Day +200)
- **6 distinct phases** of recovery
- **65+ individual tasks** including forms, videos, exercises, messages
- **Evidence-based milestones** from TJV clinical data
- **Flexible task scheduling** with frequency controls

### Timeline Phases

1. **Enrollment & Scheduling** (Day -45 to -15)
2. **Pre-Surgery Preparation** (Day -14 to -1)
3. **Immediate Post-Surgery** (Day 0 to 7)
4. **Early Recovery** (Day 8 to 30)
5. **Advanced Recovery** (Day 31 to 90)
6. **Long-term Recovery** (Day 91 to 200)

## Helper Functions

### Protocol Management
- `assign_protocol_to_patient()` - Assigns protocol and creates tasks
- `get_patient_timeline_tasks()` - Retrieves patient's timeline
- `get_patient_current_protocol()` - Gets active protocol status

### Communication
- `create_conversation()` - Creates patient-provider chat
- `send_message()` - Sends messages with audit trail
- `mark_messages_read()` - Handles read receipts
- `get_conversations_with_latest_message()` - Dashboard queries

### Forms & Compliance
- `submit_patient_form()` - HIPAA-compliant form submission
- `log_audit_event()` - Manual audit logging
- `get_audit_trail()` - Retrieves audit history
- `cleanup_old_audit_logs()` - Data retention management

### Utility Functions
- `get_user_tenant_id()` - User context management
- `user_has_role()` - Role checking
- `can_access_patient()` - Access validation
- `set_user_context()` - RLS context setting

## Deployment Instructions

### Prerequisites
- Supabase project with PostgreSQL database
- Supabase CLI installed
- Database connection with superuser privileges

### Migration Steps

1. **Run migrations in order:**
   ```bash
   supabase db reset
   supabase migration apply 001_create_foundation_tables
   supabase migration apply 002_create_organization_tables
   supabase migration apply 003_create_patient_provider_tables
   supabase migration apply 004_create_protocol_content_tables
   supabase migration apply 005_create_chat_messaging_tables
   supabase migration apply 006_create_form_audit_tables
   supabase migration apply 007_seed_initial_data
   supabase migration apply 008_test_schema
   ```

2. **Verify deployment:**
   ```bash
   supabase db diff
   ```

3. **Test functionality:**
   - Check RLS policies are enabled
   - Verify indexes are created
   - Test helper functions
   - Validate audit logging

### Environment Variables

Ensure these environment variables are set:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Testing & Validation

### Automated Tests

The `008_test_schema.sql` migration includes:
- **Relationship testing** - Verifies foreign key constraints
- **RLS policy validation** - Confirms security policies work
- **Index verification** - Ensures indexes are created
- **Function testing** - Tests all helper functions
- **Performance benchmarks** - Query performance analysis
- **Audit trail verification** - HIPAA compliance testing

### Manual Testing Checklist

- [ ] Create test tenant and users
- [ ] Assign protocol to test patient
- [ ] Complete form submissions
- [ ] Send chat messages
- [ ] Verify audit logs are created
- [ ] Test RLS policies with different user roles
- [ ] Validate query performance

## Production Considerations

### Monitoring
- **Query performance monitoring** via Supabase dashboard
- **Database size monitoring** for content storage
- **Audit log growth** monitoring for retention policies
- **Connection pool utilization** tracking

### Backup & Recovery
- **Automated backups** via Supabase
- **Point-in-time recovery** capability
- **Audit log preservation** for compliance
- **Disaster recovery procedures**

### Scaling
- **Read replicas** for analytics workloads
- **Connection pooling** for high concurrency
- **Table partitioning** for large audit tables
- **CDN integration** for content delivery

## Compliance & Security

### HIPAA Compliance
- ✅ **Access logging** - All patient data access logged
- ✅ **Data encryption** - At rest and in transit
- ✅ **User authentication** - Via Supabase Auth
- ✅ **Role-based access** - Via RLS policies
- ✅ **Audit trails** - 7-year retention
- ✅ **Data minimization** - Only necessary data stored

### Security Features
- ✅ **Row Level Security** on all tables
- ✅ **SQL injection protection** via parameterized queries
- ✅ **Cross-tenant isolation** via tenant_id filtering
- ✅ **API rate limiting** via Supabase
- ✅ **Input validation** via form schemas
- ✅ **Digital signatures** for form submissions

## Maintenance

### Regular Tasks
- **Audit log cleanup** (automated via function)
- **Database statistics** updates
- **Index maintenance** and optimization
- **Performance monitoring** review

### Update Procedures
- **Schema migrations** via Supabase CLI
- **Data migrations** with proper rollback plans
- **RLS policy updates** with testing
- **Function updates** with version control

## Support & Documentation

### Additional Resources
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [HIPAA Compliance Guide](https://www.hhs.gov/hipaa/)

### Team Contacts
- **Database Administrator**: [Contact Info]
- **Security Officer**: [Contact Info]
- **Development Team**: [Contact Info]

---

## Implementation Status: ✅ COMPLETE

**Total Tables Created**: 17
**RLS Policies Implemented**: ✅ All tables
**Indexes Created**: ✅ Performance optimized
**Helper Functions**: ✅ 15+ utility functions
**Audit Compliance**: ✅ HIPAA ready
**TJV Timeline**: ✅ Complete 245-day protocol
**Testing**: ✅ Comprehensive validation

The TJV Healthcare Platform database schema is production-ready and fully implements all requirements for a HIPAA-compliant healthcare platform with multi-tenant architecture, clinical protocol management, and comprehensive audit logging.