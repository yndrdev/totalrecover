# Supabase Database Import - Step by Step Guide

## 🎯 **Goal: Import Your TJV Recovery Database**

We're importing 2 files in order:
1. `tjv-recovery-base-schema-fixed.sql` (database structure)
2. `demo-seed-data-basic.sql` (sample data)

## 📋 **Step-by-Step Process**

### **STEP 1: Open Supabase SQL Editor**
1. Go to your Supabase project dashboard
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New Query"** button

### **STEP 2: Import Base Schema**

#### **2a. Open the Schema File**
- Open `tjv-recovery-base-schema-fixed.sql` in a text editor
- You should see it starts with:
```sql
-- TJV RECOVERY COMPLETE SQL SCHEMA
-- Multi-tenant, HIPAA-compliant database with chat conversation tracking
```

#### **2b. Copy ALL Content**
- Select ALL content in the file (Ctrl+A / Cmd+A)
- Copy it (Ctrl+C / Cmd+C)
- The file should be about **800 lines long**

#### **2c. Paste and Run**
- Go back to Supabase SQL Editor
- Paste the content (Ctrl+V / Cmd+V)
- Click the **"Run"** button (or press Ctrl+Enter)
- Wait for completion (should show "Success" message)

### **STEP 3: Import Demo Data**

#### **3a. Create New Query**
- Click **"New Query"** again in Supabase
- This creates a fresh query window

#### **3b. Open Demo Data File**
- Open `demo-seed-data-basic.sql` in a text editor
- You should see it starts with:
```sql
-- =====================================================
-- BASIC DEMO SEED DATA FOR BASE SCHEMA
```

#### **3c. Copy ALL Content**
- Select ALL content in the file (Ctrl+A / Cmd+A)
- Copy it (Ctrl+C / Cmd+C)
- The file should be about **200 lines long**

#### **3d. Paste and Run**
- Paste into the new query window
- Click **"Run"** button
- Wait for completion

## ✅ **Verification Steps**

After both imports complete, run this verification query:

```sql
-- Copy and paste this verification query
SELECT 
  'Tenants' as table_name, COUNT(*) as row_count FROM tenants
UNION ALL
SELECT 'Profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'Patients', COUNT(*) FROM patients
UNION ALL
SELECT 'Conversations', COUNT(*) FROM conversations
UNION ALL
SELECT 'Messages', COUNT(*) FROM messages
UNION ALL
SELECT 'Exercises', COUNT(*) FROM exercises
UNION ALL
SELECT 'Forms', COUNT(*) FROM forms
UNION ALL
SELECT 'Patient Tasks', COUNT(*) FROM patient_tasks;
```

### **Expected Results:**
- Tenants: 3
- Profiles: 8
- Patients: 3
- Conversations: 3
- Messages: 9
- Exercises: 3
- Forms: 1
- Patient Tasks: 3

## 🚨 **If You Get Errors**

### **Common Error 1: "relation already exists"**
- **Meaning**: Tables already exist
- **Solution**: Skip to Step 3 (demo data only)

### **Common Error 2: "syntax error"**
- **Meaning**: Didn't copy the full file
- **Solution**: Make sure you copied the ENTIRE file content

### **Common Error 3: "permission denied"**
- **Meaning**: RLS policy issue
- **Solution**: Make sure you're the database owner

## 🎉 **Success Indicators**

You'll know it worked when:
1. ✅ No error messages during import
2. ✅ Verification query shows expected row counts
3. ✅ You can see the tables in Supabase Table Editor
4. ✅ Sample data appears in the tables

## 📞 **Next Steps After Success**

Once the database import is complete:
1. **Test the data** - Browse tables in Supabase Table Editor
2. **Verify RLS policies** - Check that security is working
3. **Move to documentation transfer** - Get Roo Code the project specs
4. **Start frontend development** - Begin building the app interface

## 🔧 **Troubleshooting Tips**

- **Take your time** - Don't rush the copy/paste steps
- **Check file sizes** - Schema file should be much larger than demo file
- **One file at a time** - Don't try to run both files together
- **Fresh query windows** - Use a new query for each file

**Ready to start? Begin with Step 1!**

