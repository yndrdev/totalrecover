# Supabase SQL Import Instructions

## 🚨 **Important: Don't Run the `\i` Commands!**

The `\i` commands in the setup guide are **PostgreSQL command line instructions**. In Supabase, you need to copy and paste the **actual SQL content** from each file.

## 📋 **Correct Import Process for Supabase:**

### **Step 1: Open Supabase SQL Editor**
1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"

### **Step 2: Import Files in This Exact Order**

#### **File 1: Base Schema**
1. Open `tjv-recovery-complete-sql-schema.sql`
2. Copy **ALL** the content (it should be several hundred lines)
3. Paste into Supabase SQL Editor
4. Click "Run" button
5. Wait for completion (should show "Success")

#### **File 2: Exercise System Tables**
1. Open `exercise-system-tables.sql`
2. Copy **ALL** the content
3. Paste into a new query in Supabase
4. Click "Run"

#### **File 3: Forms and Questions Tables**
1. Open `forms-questions-tables.sql`
2. Copy **ALL** the content
3. Paste into a new query in Supabase
4. Click "Run"

#### **File 4: Chat and Conversation Tables**
1. Open `chat-conversation-tables.sql`
2. Copy **ALL** the content
3. Paste into a new query in Supabase
4. Click "Run"

#### **File 5: Exercise Seed Data**
1. Open `exercise-seed-data.sql`
2. Copy **ALL** the content
3. Paste into a new query in Supabase
4. Click "Run"

#### **File 6: Forms Seed Data**
1. Open `forms-questions-seed-data.sql`
2. Copy **ALL** the content
3. Paste into a new query in Supabase
4. Click "Run"

#### **File 7: Chat Seed Data**
1. Open `chat-conversation-seed-data.sql`
2. Copy **ALL** the content
3. Paste into a new query in Supabase
4. Click "Run"

#### **File 8: Demo Data**
1. Open `comprehensive-demo-seed-data.sql`
2. Copy **ALL** the content
3. Paste into a new query in Supabase
4. Click "Run"

## ✅ **Verification**

After running all files, run this query to verify:

```sql
SELECT 
  'Patients' as entity, COUNT(*) as count FROM patients
UNION ALL
SELECT 'Exercises', COUNT(*) FROM exercises
UNION ALL
SELECT 'Form Templates', COUNT(*) FROM form_templates
UNION ALL
SELECT 'Questions', COUNT(*) FROM questions
UNION ALL
SELECT 'Conversations', COUNT(*) FROM conversations
UNION ALL
SELECT 'Messages', COUNT(*) FROM messages;
```

You should see:
- Patients: 3
- Exercises: 25+
- Form Templates: 4
- Questions: 15+
- Conversations: 3+
- Messages: 10+

## 🔧 **If You Get Errors:**

1. **"relation does not exist"** - Run the table creation files first
2. **"duplicate key value"** - Skip that file, it's already imported
3. **"syntax error"** - Make sure you copied the entire file content

## 📁 **File Sizes to Expect:**

- `exercise-system-tables.sql` - ~500 lines
- `exercise-seed-data.sql` - ~800 lines  
- `forms-questions-tables.sql` - ~400 lines
- `forms-questions-seed-data.sql` - ~600 lines
- `chat-conversation-tables.sql` - ~300 lines
- `chat-conversation-seed-data.sql` - ~400 lines
- `comprehensive-demo-seed-data.sql` - ~500 lines

Each file should have substantial content - if you're only seeing a few lines, you might be looking at the wrong file or the setup guide instead of the actual SQL files.

