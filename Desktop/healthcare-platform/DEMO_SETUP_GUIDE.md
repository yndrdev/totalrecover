# 🚀 DEMO SETUP GUIDE - READY FOR TESTING

## 📋 **TEST ACCOUNTS FOR DEMO**

### 👤 **PATIENT ACCOUNTS**

**Patient 1:**
- **Email:** `sarah.patient@tjvrecovery.com`
- **Password:** `Demo123!`
- **Name:** Sarah Johnson
- **Role:** Patient

**Patient 2:**
- **Email:** `mike.patient@tjvrecovery.com`
- **Password:** `Demo123!`
- **Name:** Mike Wilson
- **Role:** Patient

### 👨‍⚕️ **PROVIDER ACCOUNTS**

**Doctor:**
- **Email:** `dr.smith@tjvrecovery.com`
- **Password:** `Demo123!`
- **Name:** Dr. Robert Smith
- **Role:** Provider
- **Specialty:** Orthopedic Surgery
- **License:** MD123456

**Nurse:**
- **Email:** `nurse.jones@tjvrecovery.com`
- **Password:** `Demo123!`
- **Name:** Linda Jones
- **Role:** Provider
- **Specialty:** Nursing
- **License:** RN789012

**Admin:**
- **Email:** `admin@tjvrecovery.com`
- **Password:** `Demo123!`
- **Name:** Admin User
- **Role:** Provider
- **Specialty:** Administration
- **License:** ADM001

## 🔧 **SETUP INSTRUCTIONS**

### **Step 1: Database Reset**
1. Go to **Supabase Dashboard → SQL Editor**
2. Run the `DEMO_RESET_SCRIPT.sql` file
3. Go to **Authentication → Users** and **DELETE ALL EXISTING USERS**

### **Step 2: Disable Email Verification (For Demo)**
1. Go to **Supabase Dashboard → Authentication → Settings**
2. **Turn OFF "Enable email confirmations"**
3. This allows immediate login after registration

### **Step 3: Create Test Users**
1. Go to your app at `/register`
2. Register each user with the credentials above
3. Users should be able to login immediately

### **Step 4: Test Login Flow**
1. Go to `/login`
2. Test each account credentials
3. Verify role-based redirects:
   - **Patients** → `/chat`
   - **Providers** → `/provider`
   - **Admin** → `/admin`

## 🧪 **TESTING WORKFLOW**

### **1. Patient Testing**
```
1. Register: sarah.patient@tjvrecovery.com / Demo123!
2. Login → Should redirect to /chat
3. Test chat interface
4. Check patient dashboard features
```

### **2. Provider Testing**
```
1. Register: dr.smith@tjvrecovery.com / Demo123!
2. Login → Should redirect to /provider
3. Test provider dashboard
4. Check patient management features
```

### **3. Admin Testing**
```
1. Register: admin@tjvrecovery.com / Demo123!
2. Login → Should redirect to /admin
3. Test admin dashboard
4. Check system management features
```

## 🎯 **DEMO SCENARIOS**

### **Scenario 1: New Patient Registration**
1. Show registration form with patient/provider selection
2. Register new patient account
3. Demonstrate profile creation
4. Show dashboard redirect

### **Scenario 2: Provider Dashboard**
1. Login as Dr. Smith
2. Show patient list
3. Demonstrate patient monitoring
4. Show chat interface

### **Scenario 3: Patient Experience**
1. Login as Sarah Johnson
2. Show patient chat interface
3. Demonstrate AI interactions
4. Show recovery progress

## 🐛 **TROUBLESHOOTING**

### **If login fails:**
1. Check email verification is disabled
2. Verify user exists in Supabase Auth
3. Check console for errors
4. Ensure database tables exist

### **If dashboard shows "No profile found":**
1. Check if profile auto-creation is working
2. Verify RLS policies are correct
3. Check browser console for errors

### **If redirects don't work:**
1. Verify role assignment in profiles table
2. Check middleware configuration
3. Ensure dashboard logic is correct

## 📊 **WHAT THE DEMO WILL SHOW**

✅ **Working registration system** with role selection
✅ **Email verification** (disabled for demo)
✅ **Role-based authentication** and redirects
✅ **Auto-profile creation** for missing profiles
✅ **Patient dashboard** with chat interface
✅ **Provider dashboard** with patient management
✅ **Admin dashboard** with system oversight
✅ **Secure database** with RLS policies
✅ **Clean, professional UI** throughout

## 🚨 **BEFORE GOING LIVE**

1. **Re-enable email verification** in Supabase settings
2. **Delete demo users** and create real accounts
3. **Update RLS policies** for production security
4. **Test with real email addresses**
5. **Review all error handling**

## 📱 **QUICK ACCESS LINKS**

- **Registration:** `http://localhost:3001/register`
- **Login:** `http://localhost:3001/login`
- **Dashboard:** `http://localhost:3001/dashboard`
- **Patient Chat:** `http://localhost:3001/chat`
- **Provider Dashboard:** `http://localhost:3001/provider`
- **Admin Dashboard:** `http://localhost:3001/admin`

## 💡 **DEMO TIPS**

1. **Start with registration** to show the role selection
2. **Demo both patient and provider flows**
3. **Show auto-profile creation** working
4. **Highlight security features** (RLS, authentication)
5. **Demonstrate responsive design** on different devices

Ready for your demo! 🎉