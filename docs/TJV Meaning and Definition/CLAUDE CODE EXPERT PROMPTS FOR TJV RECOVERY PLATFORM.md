# CLAUDE CODE EXPERT PROMPTS FOR TJV RECOVERY PLATFORM

## 🎯 BASED ON ANTHROPIC'S PROMPT ENGINEERING BEST PRACTICES

This document applies Anthropic's proven prompt engineering techniques to create the most effective prompts for completing the TJV Recovery Platform with Claude Code.

---

## 🚀 MASTER SYSTEM PROMPT FOR CLAUDE CODE

### **System Role Assignment (Use in Claude Code Settings)**
```
You are an expert healthcare software architect and full-stack developer specializing in HIPAA-compliant medical platforms. You have 15+ years of experience building enterprise healthcare applications for Total Joint Replacement recovery programs. You understand clinical workflows, evidence-based protocols, and the critical importance of patient safety and data security in medical software.

Your expertise includes:
- Healthcare platform architecture with multi-tenant security
- Clinical workflow optimization for surgeons, nurses, and physical therapists
- Patient engagement systems with AI-powered recovery coaching
- HIPAA compliance and healthcare data protection
- Real-time care coordination and provider communication systems
- Evidence-based recovery protocols for TKA and THA procedures

You approach every task with the gravity and professionalism that healthcare software demands, knowing that your work directly impacts patient recovery outcomes and provider efficiency.
```

---

## 📋 STRUCTURED PROMPTS FOR SPECIFIC TASKS

### **PROMPT 1: MANUS-STYLE CHAT INTERFACE IMPLEMENTATION**

<instructions>
Implement a professional healthcare chat interface following Manus.im design standards for the TJV Recovery Platform. This is enterprise medical software that must maintain the highest standards of professionalism and clinical workflow compliance.
</instructions>

<context>
- Platform: TJV Recovery Platform for Total Joint Replacement patients
- Users: Patients recovering from TKA/THA surgery, healthcare providers
- Recovery Timeline: Day -45 (pre-surgery) to Day +200 (full recovery)
- Current Status: Existing Next.js/React app with Supabase backend needs chat enhancement
</context>

<requirements>
<ui_standards>
- Main chat area: 800px max-width, centered layout
- Sidebar: 280px width with recovery timeline navigation
- Colors: Primary #2563eb (healthcare blue), Secondary #10b981 (success green)
- Professional medical software appearance, never consumer-app styling
- Responsive design with mobile considerations
</ui_standards>

<sidebar_functionality>
- Day navigation from Day -45 to current recovery day
- Smart task indicators: Green checkmarks (completed), Red warnings (missed), Blue dots (pending)
- Clickable days to view historical conversations
- Hover tooltips showing task details ("2 exercises completed, 1 form pending")
- "Return to Today" button for easy navigation
</sidebar_functionality>

<chat_features>
- Auto-scroll to latest messages
- Auto-focus input field for immediate typing
- Profile images for patients and providers (circular, professional)
- Typing indicators when AI or providers are responding
- Message bubbles: User messages right-aligned, AI/provider messages left-aligned
</chat_features>

<missed_task_recovery>
- When viewing previous days with incomplete tasks, show "Complete Now" buttons
- Display what tasks were missed and why they're important for recovery
- Update completion status in real-time
- Send notifications to care team when missed tasks are completed
</missed_task_recovery>
</requirements>

<technical_specifications>
- Use TypeScript for all components with proper type definitions
- Integrate with existing Supabase real-time subscriptions
- Maintain existing authentication and RLS policies
- Add comprehensive error handling and loading states
- Test with real patient data across all user roles
</technical_specifications>

<thinking>
Before implementing, analyze the existing codebase structure, identify current chat components, and plan the integration approach. Consider how this fits with existing authentication, database schema, and real-time features.
</thinking>

Implement this step-by-step:
1. Analyze existing chat components and database schema
2. Create the 280px sidebar with day navigation
3. Implement smart task indicators with real-time updates
4. Add historical chat access functionality
5. Implement missed task recovery system
6. Test across all user roles and recovery stages

<output_format>
Provide complete, production-ready code with:
- Full component implementations
- TypeScript interfaces and types
- Supabase integration code
- CSS/Tailwind styling
- Error handling and loading states
- Testing considerations
</output_format>

---

### **PROMPT 2: PROVIDER PROTOCOL BUILDER SYSTEM**

<instructions>
Create a comprehensive protocol builder system that allows healthcare providers to create, customize, and manage evidence-based recovery protocols for TJV patients. This system must support multi-level access control and real-time protocol modifications.
</instructions>

<context>
- Clinical Context: Evidence-based TKA and THA recovery protocols spanning Day -45 to Day +200
- User Hierarchy: Practice Admins → Clinic Admins → Individual Providers (Surgeons, Nurses, PTs)
- Protocol Types: Standard templates, custom protocols, patient-specific modifications
- Integration: Must work with existing patient management and chat systems
</context>

<requirements>
<protocol_builder_interface>
- Visual timeline editor with drag-and-drop functionality
- Task library: Exercises, forms, educational content, assessments, messages
- Day-by-day protocol visualization from Day -45 to Day +200
- Bulk task assignment across date ranges
- Conditional logic for task appearance based on patient progress
</protocol_builder_interface>

<access_control_levels>
<practice_admin>
- Create global protocol templates for entire practice network
- Manage provider permissions and clinic assignments
- Monitor protocol compliance and outcomes across all clinics
- Access comprehensive analytics and reporting
</practice_admin>

<clinic_admin>
- Customize practice protocols for specific clinic needs
- Assign patients to appropriate care teams
- Monitor clinic-specific performance metrics
- Manage provider schedules and availability
</clinic_admin>

<individual_providers>
- View assigned patient caseloads
- Modify protocols for individual patients in real-time
- Add custom tasks and instructions
- Document clinical rationale for modifications
</individual_providers>
</access_control_levels>

<task_configuration>
- Exercise tasks: Video demonstrations, instruction text, repetition goals, difficulty levels
- Form tasks: Pain assessments, functional evaluations, compliance checks
- Educational tasks: Recovery information, precautions, milestone guidance
- Message tasks: Automated check-ins, encouragement, reminders
- Assessment tasks: Provider evaluations, outcome measurements
</task_configuration>

<clinical_decision_support>
- AI-powered modification suggestions based on patient progress
- Risk assessment warnings for inappropriate protocol changes
- Evidence-based guidance with research citations
- Outcome prediction modeling for protocol modifications
- Best practice alerts when deviating from standard protocols
</clinical_decision_support>
</requirements>

<database_considerations>
- Maintain existing multi-tenant architecture
- Preserve RLS policies for data isolation
- Add audit logging for all protocol modifications
- Version control for protocol changes
- Backup and rollback capabilities
</database_considerations>

<thinking>
Consider the clinical workflow implications, provider time constraints, and the need for evidence-based modifications. Think about how this integrates with existing patient data and chat systems.
</thinking>

Implement this in phases:
1. Create the visual timeline editor interface
2. Build the task library and configuration system
3. Implement multi-level access controls
4. Add clinical decision support features
5. Integrate with existing patient management system
6. Add comprehensive audit logging and analytics

<output_format>
Provide complete implementation including:
- React components with TypeScript
- Database schema modifications (if needed)
- API endpoints for protocol management
- Access control middleware
- Clinical decision support algorithms
- Comprehensive testing strategy
</output_format>

---

### **PROMPT 3: INDIVIDUAL PATIENT PROTOCOL EDITING**

<instructions>
Create a comprehensive patient detail page system that allows providers to view complete patient information and edit recovery protocols in real-time for individual patients. This must maintain clinical workflow efficiency while ensuring patient safety.
</instructions>

<context>
- Clinical Setting: Individual patient management within TJV recovery program
- Users: Surgeons, nurses, physical therapists managing specific patients
- Patient Data: Demographics, surgery details, recovery progress, care team assignments
- Protocol Customization: Real-time modifications to standard protocols based on patient needs
</context>

<requirements>
<patient_overview_dashboard>
- Comprehensive patient demographics and medical history
- Surgery details: Type (TKA/THA), date, surgeon, complications
- Current recovery status: Day in recovery, milestone achievements, overall progress
- Assigned care team: Surgeon, nurse, PT with contact information and availability
- Recent activity feed: Latest chat messages, completed tasks, assessments
- Alert system: Concerning symptoms, missed milestones, compliance issues
</patient_overview_dashboard>

<protocol_customization_interface>
- Visual timeline showing patient's current protocol (Day -45 to Day +200)
- Real-time editing capabilities: Add, remove, modify tasks on any day
- Task modification tools: Adjust difficulty, frequency, instructions, due dates
- Custom task creation: Patient-specific exercises, assessments, instructions
- Clinical notes: Document rationale for all modifications
- Change tracking: Complete audit trail of who changed what and when
</protocol_customization_interface>

<task_management_system>
- Task status tracking: See completion status for every assigned task
- Progress visualization: Charts showing completion rates, pain levels, functional improvements
- Missed task recovery: Tools to help patients catch up on overdue activities
- Provider intervention: Direct messaging and escalation capabilities
- Outcome tracking: Monitor how modifications affect patient progress
</task_management_system>

<clinical_safety_features>
- Modification warnings: Alerts for potentially inappropriate changes
- Evidence-based suggestions: Research-backed recommendations for adjustments
- Risk stratification: Identify patients at risk for poor outcomes
- Escalation protocols: Automatic alerts for concerning patterns
- Peer review: Option for second opinions on significant modifications
</clinical_safety_features>
</requirements>

<integration_requirements>
- Seamless integration with chat system for provider-patient communication
- Real-time updates to patient's mobile interface when protocols change
- Notification system for care team coordination
- Integration with existing analytics and reporting systems
- Maintain all existing security and compliance features
</integration_requirements>

<thinking>
Consider the provider's workflow during patient visits, the need for quick access to critical information, and the importance of maintaining clinical decision-making efficiency while ensuring comprehensive documentation.
</thinking>

Build this systematically:
1. Design the comprehensive patient overview dashboard
2. Create the real-time protocol editing interface
3. Implement task modification and custom task creation tools
4. Add clinical safety features and decision support
5. Integrate with existing chat and notification systems
6. Add comprehensive audit logging and change tracking

<output_format>
Deliver production-ready code with:
- Complete patient detail page components
- Real-time protocol editing functionality
- Clinical decision support integration
- Comprehensive error handling
- Mobile-responsive design
- Integration with existing systems
</output_format>

---

### **PROMPT 4: REAL-TIME NOTIFICATION AND ALERT SYSTEM**

<instructions>
Implement a comprehensive notification and alert system that coordinates care between patients and providers, escalates concerning situations, and celebrates recovery milestones. This system must support real-time communication while maintaining HIPAA compliance.
</instructions>

<context>
- Healthcare Environment: Multi-provider care teams managing TJV recovery patients
- Communication Needs: Patient reminders, provider alerts, care coordination, emergency escalation
- Compliance Requirements: HIPAA-compliant messaging, audit logging, secure notifications
- User Types: Patients, surgeons, nurses, physical therapists, practice administrators
</context>

<requirements>
<patient_notification_system>
<daily_reminders>
- Gentle reminders for incomplete tasks (exercises, forms, check-ins)
- Escalating urgency for persistently missed critical tasks
- Visual indicators in chat sidebar (red badges on days with missed tasks)
- Educational messaging about recovery impact of missed activities
- Catch-up suggestions and modified schedules for missed tasks
</daily_reminders>

<progress_celebrations>
- Milestone achievement notifications with encouraging messages
- Task completion celebrations with positive reinforcement
- Progress updates showing advancement through recovery stages
- Motivational messages during difficult recovery periods
- Success stories from similar patients (anonymized)
</progress_celebrations>
</patient_notification_system>

<provider_alert_system>
<patient_monitoring_alerts>
- Missed task alerts: Notify providers when patients miss critical activities
- Progress concern alerts: Patients falling behind expected recovery timeline
- Pain level alerts: Concerning pain reports or unusual patterns
- Compliance alerts: Patterns of non-adherence to protocol
- Emergency alerts: Immediate notifications for urgent patient needs
</patient_monitoring_alerts>

<care_coordination_notifications>
- Team updates: Notify care team members of important patient changes
- Protocol modification alerts: When protocols are modified by team members
- Appointment coordination: Schedule and remind about in-person visits
- Communication requests: When patients request provider contact
- Outcome milestones: Celebrate patient achievements with entire care team
</care_coordination_notifications>
</provider_alert_system>

<escalation_protocols>
- Automatic escalation for missed critical milestones
- Pain level thresholds triggering provider review
- Non-compliance patterns requiring intervention
- Emergency situations requiring immediate response
- After-hours coverage and on-call notification systems
</escalation_protocols>
</requirements>

<technical_implementation>
- Real-time notifications using Supabase subscriptions
- Push notifications for mobile devices
- Email notifications for non-urgent communications
- SMS alerts for urgent situations (with patient consent)
- In-app notification center with read/unread status
- Notification preferences and customization options
</technical_implementation>

<compliance_and_security>
- HIPAA-compliant message encryption
- Audit logging for all notifications sent and received
- Patient consent management for different notification types
- Secure provider authentication for sensitive alerts
- Data retention policies for notification history
</compliance_and_security>

<thinking>
Consider the balance between keeping providers informed and avoiding alert fatigue. Think about the clinical significance of different types of alerts and appropriate escalation timelines.
</thinking>

Implement in priority order:
1. Core notification infrastructure with Supabase real-time
2. Patient reminder and celebration systems
3. Provider alert and escalation systems
4. Care team coordination notifications
5. Mobile push notification integration
6. Comprehensive audit logging and compliance features

<output_format>
Provide complete implementation including:
- Notification service architecture
- Real-time subscription management
- Alert prioritization and escalation logic
- Mobile push notification setup
- HIPAA compliance features
- Testing and monitoring systems
</output_format>

---

### **PROMPT 5: DATABASE INTEGRATION AND REAL DATA CONNECTION**

<instructions>
Connect the existing TJV Recovery Platform codebase to real Supabase database data, replacing all mock data and demo content with proper database queries. Ensure all features work seamlessly with real patient and provider information while maintaining security and performance.
</instructions>

<context>
- Current State: Existing Next.js application with some mock data and demo content
- Target State: Fully functional platform using real Supabase database
- Database: Comprehensive schema with patients, providers, protocols, messages, tasks
- Security: Multi-tenant RLS policies, role-based access control, audit logging
</context>

<requirements>
<data_migration_strategy>
- Identify and catalog all mock data, demo content, and hardcoded arrays
- Map existing components to corresponding database tables
- Replace mock API calls with real Supabase queries
- Ensure proper error handling for database operations
- Add loading states for all data fetching operations
</data_migration_strategy>

<database_query_optimization>
- Use proper joins and relationships for complex data retrieval
- Implement efficient pagination for large datasets
- Add proper indexing for frequently queried fields
- Use Supabase's real-time subscriptions for live updates
- Implement caching strategies for frequently accessed data
</database_query_optimization>

<security_implementation>
- Verify RLS policies are working correctly for all tables
- Test multi-tenant data isolation across different practices
- Implement proper user authentication and session management
- Add audit logging for all sensitive data operations
- Ensure HIPAA compliance for all data access patterns
</security_implementation>

<real_time_features>
- Chat messages updating in real-time across all participants
- Task completion status updating immediately in provider dashboards
- Protocol modifications reflecting instantly in patient interfaces
- Notification delivery and read status synchronization
- Care team coordination with live status updates
</real_time_features>
</requirements>

<specific_integration_tasks>
<patient_data_integration>
- Connect patient dashboard to real patient records
- Link recovery timeline to actual surgery dates and progress
- Integrate task completion tracking with database
- Connect pain assessments and outcome measurements
- Link care team assignments to provider records
</patient_data_integration>

<provider_data_integration>
- Connect provider dashboards to real patient caseloads
- Link protocol modifications to database versioning
- Integrate provider messaging with real conversation history
- Connect analytics to actual patient outcome data
- Link scheduling and availability to provider records
</provider_data_integration>

<protocol_data_integration>
- Connect protocol builder to template and instance tables
- Link task assignments to actual patient protocols
- Integrate modification tracking with audit logs
- Connect outcome tracking to real patient progress data
- Link evidence-based recommendations to research database
</protocol_data_integration>
</specific_integration_tasks>

<performance_considerations>
- Optimize database queries for large patient populations
- Implement proper connection pooling and resource management
- Add monitoring for query performance and bottlenecks
- Use database functions for complex calculations
- Implement proper error handling and retry logic
</performance_considerations>

<thinking>
Analyze the existing codebase to understand current data flow, identify all mock data sources, and plan the migration strategy. Consider the impact on user experience during the transition and ensure no functionality is lost.
</thinking>

Execute this migration systematically:
1. Audit existing codebase for all mock data and demo content
2. Create comprehensive database query functions
3. Replace mock data with real database calls component by component
4. Test all user flows with real data across different user roles
5. Optimize performance and add proper error handling
6. Validate security and compliance with real data

<output_format>
Deliver complete database integration including:
- Comprehensive audit of mock data removal
- Production-ready database query functions
- Real-time subscription implementations
- Security validation and testing results
- Performance optimization recommendations
- Complete testing strategy for real data scenarios
</output_format>

---

## 🎯 PROMPT ENGINEERING BEST PRACTICES APPLIED

### **Key Techniques Used:**

1. **Clear Role Assignment**: Each prompt establishes Claude as a healthcare software expert
2. **Structured XML Tags**: Using `<instructions>`, `<context>`, `<requirements>`, etc.
3. **Chain of Thought**: Including `<thinking>` sections for complex analysis
4. **Specific Context**: Detailed healthcare domain knowledge and constraints
5. **Sequential Steps**: Breaking complex tasks into manageable phases
6. **Output Format Control**: Specifying exactly what deliverables are needed

### **Healthcare-Specific Optimizations:**

- **Clinical Context**: Every prompt includes clinical workflow considerations
- **Safety First**: Patient safety and HIPAA compliance emphasized throughout
- **Professional Standards**: Enterprise medical software appearance requirements
- **Evidence-Based**: References to clinical protocols and research-backed approaches
- **Multi-User Awareness**: Consideration of different healthcare provider roles

### **Success Criteria Integration:**

- **Functional Requirements**: Specific technical implementations required
- **Quality Standards**: Professional healthcare platform appearance
- **Security Requirements**: HIPAA compliance and data protection
- **Performance Metrics**: Real-time functionality and user experience
- **Clinical Outcomes**: Impact on patient recovery and provider efficiency

---

## 🚀 IMPLEMENTATION STRATEGY

### **Phase 1: Foundation (Prompts 1-2)**
Use Prompts 1 and 2 to establish the core chat interface and protocol builder system.

### **Phase 2: Patient Management (Prompt 3)**
Implement individual patient protocol editing and management features.

### **Phase 3: Communication (Prompt 4)**
Add comprehensive notification and alert systems for care coordination.

### **Phase 4: Data Integration (Prompt 5)**
Connect everything to real Supabase data and eliminate all mock content.

### **Success Validation:**
After each prompt, verify that:
- All healthcare standards are maintained
- Security and compliance requirements are met
- Professional appearance is preserved
- Real-time functionality works correctly
- All user roles can access appropriate features

**These expert-level prompts leverage Anthropic's proven techniques to ensure Claude Code delivers production-ready, healthcare-compliant software that meets the highest standards of medical platform development.**

