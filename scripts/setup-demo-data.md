# 🚀 TJV Recovery Platform - Demo Setup Guide

## Quick Setup Instructions

### Step 1: Run SQL Script in Supabase
1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the entire content from `scripts/create-demo-accounts.sql`
3. Click **RUN** to create all database records

### Step 2: Create Auth Users
```bash
cd /Users/yndr/Desktop/healthcare-platform
npm install dotenv @supabase/supabase-js
node scripts/create-supabase-auth-users.js
```

### Step 3: Start the Application
```bash
npm run dev
```

## 🎯 Test Accounts Ready to Use

### 👤 Patient Account (Matches Screenshot Design)
- **Email:** `sarah.johnson@tjvdemo.com`
- **Password:** `DemoPass123!`
- **Login URL:** http://localhost:3000/login
- **Chat URL:** http://localhost:3000/chat

**What You'll See:**
- ✅ Day 4 recovery status (matches your screenshot)
- ✅ Dark sidebar with "CURRENT DAY" and "DAYS WITH MISSED TASKS"
- ✅ Care team: Dr. Michael Smith & Mike Chen, PT
- ✅ Real conversation history
- ✅ Missed tasks from Day 2 & Day 3 
- ✅ Quick action buttons and medical records option

### 👨‍⚕️ Provider Account
- **Email:** `dr.smith@tjvdemo.com` 
- **Password:** `DemoPass123!`
- **Dashboard URL:** http://localhost:3000/provider

**What You'll See:**
- ✅ Patient monitoring dashboard
- ✅ Sarah Johnson listed as current patient
- ✅ Recovery progress tracking
- ✅ Chat monitoring capabilities

### 🏥 Admin Account  
- **Email:** `admin@tjvdemo.com`
- **Password:** `DemoPass123!`
- **Admin URL:** http://localhost:3000/admin

### 👨‍⚕️ Physical Therapist Account
- **Email:** `mike.chen@tjvdemo.com`
- **Password:** `DemoPass123!`

## 📊 Demo Data Includes

### Patient: Sarah Johnson
- **Surgery:** Total Knee Replacement (TKA)
- **Surgery Date:** 4 days ago (Current Day 4)
- **Status:** Active recovery with some missed tasks
- **Phone:** (555) 123-4567

### Recovery Timeline
- **Day 1-2:** Completed tasks ✅
- **Day 2:** 1 missed exercise task ❌ 
- **Day 3:** 1 missed quad sets exercise ❌
- **Day 4:** 4 pending tasks (current day)

### Care Team
- **Surgeon:** Dr. Michael Smith
- **Physical Therapist:** Mike Chen, PT
- **Tenant:** TJV Demo Practice

### Sample Conversation
- AI greeting matching screenshot style
- Patient response about feeling better
- Task reminders and mobility check-ins

## 🔄 Reset Demo Data
To reset all demo data, just run the SQL script again - it uses `ON CONFLICT` clauses to update existing records.

## 🐛 Troubleshooting

### If Login Doesn't Work
1. Check that both SQL script and JavaScript script ran successfully
2. Verify environment variables in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

### If Chat Interface Looks Different
1. Make sure you're logging in as `sarah.johnson@tjvdemo.com`
2. Navigate to `/chat` after login
3. Check browser console for any errors

### If No Recovery Data Shows
1. Verify the SQL script created patient records
2. Check that patient_tasks table has data
3. Look for any database constraint errors in Supabase logs

## 🎉 You're Ready!

The platform now has:
- ✅ Real Supabase authentication working
- ✅ Patient chat interface matching your exact design
- ✅ Realistic recovery data and timeline
- ✅ Provider monitoring capabilities  
- ✅ Protocol-chat integration
- ✅ No more demo/mock data

Login as Sarah Johnson to see the exact interface from your screenshot!