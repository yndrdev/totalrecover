# COMPREHENSIVE APPLICATION TESTING PROMPT

## END-TO-END TESTING & USER CREATION VERIFICATION

Use this prompt with Roo Code to systematically test every aspect of the TJV Recovery platform and ensure all functionality works correctly.

---

## MASTER TESTING PROMPT FOR ROO CODE

```
COMPREHENSIVE TJV RECOVERY PLATFORM TESTING

Mode: healthcare-platform
Task: Perform complete end-to-end testing of the entire TJV Recovery application

TESTING OBJECTIVE:
Systematically verify every aspect of the application works correctly, including user creation, authentication, patient chat, provider interface, forms, exercises, and all integrations.

TESTING PHASES:

PHASE 1: FOUNDATION & AUTHENTICATION TESTING
1. Environment & Database Setup:
   - Verify Supabase connection is working
   - Check all environment variables are loaded correctly
   - Test database connectivity and RLS policies
   - Verify multi-tenant isolation is working

2. User Creation & Authentication:
   - Test user registration for patients, providers, and admins
   - Verify email confirmation flow (if enabled)
   - Test login/logout functionality for all user types
   - Check password reset functionality
   - Verify session persistence across page refreshes
   - Test multi-tenant user isolation

3. Demo User Verification:
   - Confirm existing demo users can log in successfully
   - Test each demo user type (patient, provider, admin)
   - Verify demo users have appropriate permissions
   - Check demo user data is properly seeded

PHASE 2: PATIENT EXPERIENCE TESTING
1. Patient Chat Interface:
   - Test AI-first conversational flow
   - Verify "AI speaks first" behavior
   - Test voice input functionality (OpenAI Whisper)
   - Check real-time messaging works
   - Verify mobile responsiveness
   - Test chat history persistence

2. Pre-Surgery Forms:
   - Test conversational form delivery
   - Verify direct questions (e.g., "Do you smoke? Yes or No")
   - Check form validation and error handling
   - Test voice input for form responses
   - Verify form data saves correctly
   - Check progress tracking

3. Post-Surgery Recovery:
   - Test daily check-ins and pain assessments
   - Verify exercise video integration
   - Check progress tracking and analytics
   - Test recovery phase transitions
   - Verify AI recovery agent responses

PHASE 3: PROVIDER INTERFACE TESTING
1. Provider Dashboard:
   - Test patient list and overview
   - Verify real-time patient status updates
   - Check search and filtering functionality
   - Test responsive design on different devices

2. Patient Detail Pages:
   - Test individual patient monitoring
   - Verify real-time chat monitoring
   - Check patient progress analytics
   - Test intervention tools integration

3. Content Management:
   - Test task/form creation and upload
   - Verify video upload and assignment
   - Check exercise library management
   - Test protocol builder functionality

PHASE 4: ADVANCED FEATURES TESTING
1. Nurse Intervention System:
   - Test real-time alert system
   - Verify exercise modification workflow
   - Check intervention tracking and logging
   - Test escalation procedures

2. AI Recovery Agent:
   - Test intelligent response generation
   - Verify learning and adaptation
   - Check predictive analytics
   - Test data flywheel functionality

3. Real-Time Features:
   - Test WebSocket/SSE connections
   - Verify real-time chat updates
   - Check live patient monitoring
   - Test concurrent user handling

PHASE 5: SECURITY & COMPLIANCE TESTING
1. HIPAA Compliance:
   - Verify data encryption at rest and in transit
   - Test audit logging functionality
   - Check access controls and permissions
   - Verify PHI data handling

2. Multi-Tenant Security:
   - Test tenant isolation
   - Verify RLS policies work correctly
   - Check cross-tenant data access prevention
   - Test user permission boundaries

PHASE 6: INTEGRATION TESTING
1. External Services:
   - Test OpenAI GPT-4 integration
   - Verify OpenAI Whisper voice processing
   - Check email service integration
   - Test any third-party APIs

2. Database Operations:
   - Test CRUD operations for all entities
   - Verify data relationships and constraints
   - Check migration and seeding scripts
   - Test backup and recovery procedures

TESTING REQUIREMENTS:

1. CREATE TEST SCENARIOS:
   - Create comprehensive test cases for each feature
   - Include edge cases and error conditions
   - Test with different user roles and permissions
   - Verify mobile and desktop experiences

2. USER CREATION TESTING:
   - Create new test users for each role type
   - Verify user creation process works end-to-end
   - Test user onboarding flows
   - Check user data validation and constraints

3. DEMO USER VALIDATION:
   - Log in as each existing demo user
   - Verify their assigned roles and permissions
   - Test their specific workflows and features
   - Ensure demo data is realistic and complete

4. ERROR HANDLING:
   - Test network failure scenarios
   - Verify graceful error handling
   - Check user-friendly error messages
   - Test recovery from error states

5. PERFORMANCE TESTING:
   - Test application load times
   - Verify real-time feature responsiveness
   - Check database query performance
   - Test concurrent user scenarios

DELIVERABLES REQUIRED:

1. TESTING REPORT:
   - Document all test results
   - List any bugs or issues found
   - Provide recommendations for fixes
   - Include performance metrics

2. USER CREATION GUIDE:
   - Document how to create test users
   - Provide sample user data for testing
   - Include role-specific testing instructions
   - Create user management procedures

3. DEMO USER DOCUMENTATION:
   - List all existing demo users and their roles
   - Document their login credentials
   - Describe their intended use cases
   - Provide testing scenarios for each

4. BUG FIXES:
   - Fix any critical issues found during testing
   - Implement missing functionality
   - Improve error handling where needed
   - Optimize performance bottlenecks

VALIDATION CRITERIA:
- All authentication flows work correctly
- Patient chat interface is fully functional
- Provider dashboard displays accurate data
- Forms and exercises work as designed
- Real-time features operate smoothly
- Security measures are properly implemented
- Demo users can access their intended features
- New users can be created and function properly

Please start with Phase 1 and work systematically through each phase, documenting results and fixing any issues found before proceeding to the next phase.
```

---

## SPECIFIC USER CREATION TESTING PROMPT

```
USER CREATION & MANAGEMENT TESTING

Mode: healthcare-platform
Task: Test and verify user creation functionality for all user types

SPECIFIC TESTING REQUIREMENTS:

1. PATIENT USER CREATION:
   - Create new patient users through registration
   - Test patient onboarding flow
   - Verify patient can access chat interface
   - Check patient can complete forms and exercises
   - Test patient data privacy and isolation

2. PROVIDER USER CREATION:
   - Create new provider/clinic users
   - Test provider dashboard access
   - Verify provider can manage patients
   - Check content creation and assignment capabilities
   - Test real-time monitoring features

3. ADMIN USER CREATION:
   - Create new admin users
   - Test system administration capabilities
   - Verify user management functions
   - Check system configuration access
   - Test reporting and analytics features

4. DEMO USER VALIDATION:
   - Test each existing demo user login
   - Verify demo user permissions and access
   - Check demo user data completeness
   - Test demo user workflows end-to-end
   - Document any issues with demo users

5. USER MANAGEMENT FEATURES:
   - Test user role assignment and changes
   - Verify user deactivation/reactivation
   - Check user data export capabilities
   - Test user permission modifications
   - Verify audit logging for user actions

EXPECTED OUTCOMES:
- All user types can be created successfully
- Each user type has appropriate access and permissions
- Demo users work correctly for testing purposes
- User management functions operate properly
- Security and privacy measures are enforced

Please create comprehensive test users and document the entire user creation and management process.
```

---

## DEMO USER TESTING SCENARIOS

### **Patient Demo User Testing:**
```
PATIENT DEMO USER: "Sarah Johnson" (Post-Surgery Day 5)
Test Scenarios:
1. Log in and access chat interface
2. Complete daily pain assessment
3. Watch assigned exercise video
4. Use voice input for responses
5. Test mobile experience
6. Verify data saves correctly

Expected Results:
- Smooth chat experience
- Voice input works
- Exercise videos play correctly
- Progress tracking updates
- Mobile interface responsive
```

### **Provider Demo User Testing:**
```
PROVIDER DEMO USER: "Dr. Michael Chen" (Orthopedic Surgeon)
Test Scenarios:
1. Log in to provider dashboard
2. View patient list and status
3. Access patient detail page
4. Monitor real-time chat
5. Create and assign new task
6. Review patient progress analytics

Expected Results:
- Dashboard loads with patient data
- Real-time monitoring works
- Content creation functions properly
- Analytics display correctly
- Intervention tools accessible
```

### **Admin Demo User Testing:**
```
ADMIN DEMO USER: "Jennifer Martinez" (Clinic Administrator)
Test Scenarios:
1. Log in to admin interface
2. Manage user accounts
3. Configure system settings
4. Review system analytics
5. Test content library management
6. Verify security settings

Expected Results:
- Full system access available
- User management functions work
- System configuration accessible
- Analytics and reporting functional
- Security controls operational
```

---

## VALIDATION CHECKLIST

### **✅ Authentication & Users:**
- [ ] All user types can register and log in
- [ ] Demo users work correctly
- [ ] Password reset functionality works
- [ ] Session management operates properly
- [ ] Multi-tenant isolation enforced

### **✅ Patient Experience:**
- [ ] Chat interface fully functional
- [ ] Voice input works correctly
- [ ] Forms complete and save properly
- [ ] Exercise videos play and track progress
- [ ] Mobile experience optimized

### **✅ Provider Interface:**
- [ ] Dashboard displays accurate data
- [ ] Patient monitoring works real-time
- [ ] Content creation and assignment functional
- [ ] Intervention tools accessible
- [ ] Analytics and reporting accurate

### **✅ System Integration:**
- [ ] Database operations work correctly
- [ ] Real-time features operational
- [ ] External API integrations functional
- [ ] Security measures properly implemented
- [ ] Performance meets requirements

### **✅ Error Handling:**
- [ ] Graceful error handling implemented
- [ ] User-friendly error messages displayed
- [ ] Recovery from error states possible
- [ ] Network failure scenarios handled

---

## FOLLOW-UP ACTIONS

After comprehensive testing:

1. **Document All Issues**: Create detailed bug reports for any problems found
2. **Prioritize Fixes**: Categorize issues by severity and impact
3. **Implement Solutions**: Fix critical issues before deployment
4. **Retest Fixed Issues**: Verify all fixes work correctly
5. **Update Documentation**: Document any changes or new procedures
6. **Prepare for Deployment**: Ensure system is ready for production use

This comprehensive testing approach ensures the entire TJV Recovery platform works correctly and is ready for real-world use!

