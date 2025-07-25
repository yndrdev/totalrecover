# Setting Up Exercise Database Tables

Since the exercise tables need to be created in Supabase, please follow these steps:

## Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor (left sidebar)
3. Click "New query"

## Step 2: Execute the Exercise Tables SQL

Copy and paste the entire contents of `scripts/setup-exercises.sql` into the SQL editor and run it. This will create:

- `exercises` - Exercise library with video integration
- `exercise_videos` - Exercise videos with streaming metadata
- `patient_exercise_sessions` - Patient exercise performance tracking
- `exercise_progressions` - Exercise progression tracking
- `daily_checkin_questions` - Daily check-in questions
- `patient_daily_progress` - Patient daily progress and adaptation
- `preop_form_responses` - Pre-surgery form responses with medical validation

## Step 3: Run the Seed Script

After the tables are created, run:

```bash
node scripts/seed-exercises.js
```

This will populate the database with:
- 5 sample exercise videos
- 5 exercises (Knee Flexion, Heel Slides, Quadriceps Sets, Ankle Pumps, Straight Leg Raises)
- 7 daily check-in questions

## Troubleshooting

If you encounter errors:
1. Make sure you're connected to the correct Supabase project
2. Ensure the default tenant exists (run `node scripts/setup-default-tenant.js`)
3. Check that all required environment variables are set