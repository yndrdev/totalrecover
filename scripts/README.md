# TJV Recovery Platform - Data Population Scripts

This directory contains scripts for populating the TJV Recovery Platform database with real healthcare data extracted from the Claude_Docs.

## Files

- `populate-real-data.ts` - Main script that populates the database with comprehensive healthcare data

## Data Populated

### 1. Master Exercise Library (12 exercises)
- **Range of Motion Exercises**: Ankle Pumps, Heel Slides, Hip Abduction, Hip Extension
- **Strengthening Exercises**: Quad Sets, Straight Leg Raises, Hip Extension, Hip Abduction
- **Balance Exercises**: Single Leg Stance, Heel-to-Toe Walking
- **Functional Exercises**: Sit to Stand, Step-Ups
- **Cardiovascular**: Progressive Walking

Each exercise includes:
- Detailed descriptions and instructions
- Target muscle groups and joint movements
- Surgery type compatibility (TKA/THA)
- Difficulty progression
- Equipment requirements
- Safety contraindications
- Modifications for different ability levels

### 2. Daily Check-in Questions (10 questions)
- Pain level assessment (0-10 scale)
- Swelling assessment (0-10 scale)
- Sleep quality assessment (0-10 scale)
- Mood assessment (0-10 scale)
- Exercise compliance tracking
- Exercise difficulty feedback
- Medication tracking
- Activity level (step count)
- Recovery concerns (open text)
- New symptoms reporting (open text)

### 3. Pre-Surgery Forms (5 forms)
- **Universal Medical Questionnaire**: Comprehensive medical history
- **Informed Consent - TKA**: Total knee replacement consent
- **Informed Consent - THA**: Total hip replacement consent
- **Cardiac Risk Assessment**: Heart health evaluation
- **Anesthesia Consent**: Anesthesia risks and preferences

Each form includes:
- Structured JSON schema
- Required/optional field validation
- Digital signature support
- Conditional logic
- Estimated completion times

### 4. Demo Users (6 accounts)
- **Patients**: 
  - sarah.johnson@demo.com (TKA patient, 2 weeks post-op)
  - michael.chen@demo.com (THA patient, 3 weeks post-op)
- **Providers**:
  - dr.smith@demo.com (Orthopedic Surgeon)
  - nurse.williams@demo.com (Orthopedic Nurse)
  - pt.davis@demo.com (Physical Therapist)
  - admin@demo.com (Practice Administrator)

## Prerequisites

1. Node.js and npm installed
2. Environment variables configured:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Usage

### Option 1: Direct Execution
```bash
# Install dependencies if not already done
npm install

# Run the population script
npx tsx scripts/populate-real-data.ts
```

### Option 2: Add to package.json
Add this script to your `package.json`:

```json
{
  "scripts": {
    "populate-data": "tsx scripts/populate-real-data.ts"
  }
}
```

Then run:
```bash
npm run populate-data
```

## Expected Output

The script will:
1. ✅ Create/verify demo tenant
2. ✅ Populate 12 comprehensive exercises
3. ✅ Add 10 daily check-in questions
4. ✅ Create 5 pre-surgery forms
5. ✅ Set up 6 demo user accounts
6. ✅ Assign appropriate exercises to patients
7. ✅ Create sample conversations

## Demo Login Credentials

After running the script, you can test with these accounts:

- **Patients**: 
  - sarah.johnson@demo.com
  - michael.chen@demo.com
- **Providers**:
  - dr.smith@demo.com
  - nurse.williams@demo.com  
  - pt.davis@demo.com
  - admin@demo.com

## Data Sources

All data was carefully extracted from the comprehensive healthcare documentation in the `Claude_Docs` folder, including:

- `06-exercise-system-video-integration.md` - Exercise system specifications
- `Feature 4_ Pre-Surgery Forms and Questionnaires.md` - Form requirements
- `Feature 5_ Post-Surgery Recovery Journey.md` - Recovery tracking specifications
- `database-schema (1).md` - Complete database structure

## Safety and Compliance

- All exercise data follows evidence-based orthopedic protocols
- Forms comply with medical documentation standards
- Patient data includes realistic recovery timelines
- Proper tenant isolation maintained
- Demo data is clearly labeled and separate from production

## Troubleshooting

- **Environment Variables**: Ensure Supabase URL and service key are correct
- **Database Schema**: Verify all required tables exist in your Supabase instance
- **Permissions**: Service role key must have full database access
- **Duplicates**: Script handles duplicate entries gracefully with upsert operations

## Next Steps

After populating data:
1. Test patient chat interface with real exercises
2. Verify daily check-in questions display correctly
3. Test form completion workflows
4. Validate multi-tenant data isolation
5. Test provider dashboards with real patient data

This script transforms your TJV Recovery Platform from hardcoded demo data to a comprehensive healthcare application with real, structured medical content.