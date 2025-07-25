# Test Accounts Documentation

This document provides comprehensive information about the test accounts created for the TJV Healthcare Platform. These accounts allow testing of the complete patient journey from pre-surgery preparation through post-surgery recovery.

## Overview

The test account setup creates a complete healthcare ecosystem with:
- 1 Provider account (Orthopedic Surgeon)
- 2 Patient accounts (Pre-op and Post-op)
- Complete protocols with tasks
- Initial chat conversations
- Realistic medical data

## Test Account Credentials

### Provider Account
**Role**: Orthopedic Surgeon  
**Name**: Dr. Michael Chen  
**Email**: `test-provider@example.com`  
**Password**: `TJVDemo2024!`  
**Specialty**: Orthopedic Surgery  
**Features**:
- Can view both test patients
- Can monitor patient progress
- Can access chat conversations
- Can assign/modify protocols

### Pre-Op Patient Account
**Name**: John Smith  
**Email**: `test-preop@example.com`  
**Password**: `TJVDemo2024!`  
**Surgery Type**: Total Knee Replacement (TKR)  
**Surgery Date**: 7 days from account creation  
**Current Phase**: Pre-operative preparation  
**Features**:
- Pre-surgery tasks assigned
- Educational content available
- Health assessment forms
- Welcome chat messages

### Post-Op Patient Account
**Name**: Sarah Johnson  
**Email**: `test-postop@example.com`  
**Password**: `TJVDemo2024!`  
**Surgery Type**: Total Hip Replacement (THR)  
**Surgery Date**: 7 days ago from account creation  
**Current Phase**: Post-operative recovery (Day 7)  
**Features**:
- Recovery tasks in progress
- Some tasks already completed (Days 0-3)
- Active chat conversation about recovery
- Pain management discussions

## Test Data Details

### Medical Information

#### John Smith (Pre-Op)
- **Date of Birth**: May 15, 1970
- **Medical Conditions**: Hypertension, Type 2 Diabetes
- **Current Medications**: Metformin, Lisinopril
- **Allergies**: Penicillin
- **Insurance**: Blue Cross Blue Shield

#### Sarah Johnson (Post-Op)
- **Date of Birth**: August 22, 1968
- **Medical Conditions**: Hypertension, Type 2 Diabetes
- **Current Medications**: Metformin, Lisinopril
- **Allergies**: Penicillin
- **Insurance**: Blue Cross Blue Shield

### Protocol Tasks

#### Pre-Op Tasks (John Smith)
- Day -7: Pre-Surgery Health Assessment (Form)
- Day -7: Preparing for Your Surgery (Video)
- Day -5: Pre-Surgery Strengthening (Exercise)
- Day -3: Pre-Admission Checklist (Form)
- Day -1: Surgery Day Reminder (Message)

#### Post-Op Tasks (Sarah Johnson)
- Day 0: Post-Surgery Check-In (Completed)
- Day 1: Gentle Hip Flexion (Completed)
- Day 2: Pain Assessment (Completed)
- Day 3: Early Recovery Exercises (Completed)
- Day 5: Hip Abduction (Pending)
- Day 7: Week 1 Progress Check (Pending)
- Day 10: Walking Practice (Scheduled)
- Day 14: Two Week Follow-Up (Scheduled)

## Testing Scenarios

### 1. Pre-Op Patient Journey Testing
**Login as**: John Smith  
**Test**:
- View upcoming surgery information
- Complete pre-surgery assessment form
- Watch educational videos
- Perform pre-surgery exercises
- Interact with AI chat for questions
- Check task timeline

### 2. Post-Op Patient Journey Testing
**Login as**: Sarah Johnson  
**Test**:
- View recovery progress
- Complete pending tasks
- Submit pain assessments
- Follow exercise instructions
- Chat about recovery concerns
- Track completed vs pending tasks

### 3. Provider Dashboard Testing
**Login as**: Dr. Michael Chen  
**Test**:
- View patient list
- Monitor patient progress
- Access patient timelines
- Review completed assessments
- Monitor chat conversations
- Assign new protocols if needed

### 4. Chat Interface Testing
**Both Patients**:
- Test AI responses to common questions
- Submit pain or symptom reports
- Ask about medications
- Request exercise clarifications
- Emergency concern handling

### 5. Task Completion Flow
**Sarah Johnson (Post-Op)**:
- Complete Day 5 exercise task
- Submit Week 1 Progress Check
- Test task status updates
- Verify progress tracking

## Setup Instructions

### Running the Setup Script

1. Ensure environment variables are set in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. Run the setup script:
   ```bash
   npm run tsx scripts/create-test-accounts.ts
   ```
   or
   ```bash
   npx tsx scripts/create-test-accounts.ts
   ```

3. The script will:
   - Create all user accounts
   - Set up provider and patient records
   - Create protocols and tasks
   - Establish chat conversations
   - Mark appropriate tasks as completed

### Resetting Test Accounts

If you need to reset the test accounts, the script will automatically:
- Delete existing accounts with the same emails
- Recreate all data from scratch
- Maintain consistent test scenarios

## Expected Behaviors

### Pre-Op Patient (John Smith)
- Should see countdown to surgery
- All tasks should be in "pending" status
- Chat should focus on preparation and anxiety management
- Timeline should show tasks from Day -7 to Day 0

### Post-Op Patient (Sarah Johnson)
- Should see "Day 7 of Recovery"
- Tasks for Days 0-3 marked as completed
- Current day tasks available
- Chat includes recovery progress discussion
- Can submit pain assessments

### Provider (Dr. Michael Chen)
- Should see both patients in dashboard
- Can access detailed patient information
- Can monitor task completion rates
- Has access to patient chat histories

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Ensure Supabase service role key has admin privileges
   - Check that email confirmation is disabled for test accounts

2. **Missing Protocols**
   - Script creates protocols if they don't exist
   - Verify tenant ID matches across all records

3. **Task Generation**
   - Tasks are created based on surgery date
   - Pre-op tasks use negative day numbers
   - Post-op tasks use positive day numbers

4. **Chat Messages Not Appearing**
   - Check conversation creation succeeded
   - Verify message sender IDs are correct
   - Ensure tenant isolation isn't blocking access

## Security Notes

- Test accounts use the flag pattern in emails (@example.com)
- Passwords are secure but documented for testing
- No real patient data is used
- Test data is HIPAA-compliant (synthetic only)
- Accounts can be identified by email domain for cleanup

## Maintenance

To update test data:
1. Modify the `TEST_ACCOUNTS` object in the script
2. Adjust task creation in `createProtocolTasks()`
3. Update chat messages in `createChatConversations()`
4. Re-run the setup script

## Integration Points

The test accounts integrate with:
- Authentication system (Supabase Auth)
- User profiles and roles
- Patient records
- Provider assignments
- Protocol management
- Task scheduling
- Chat system
- Progress tracking

---

Last Updated: Current Date
Script Location: `/scripts/create-test-accounts.ts`