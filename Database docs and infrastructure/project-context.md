# Claude Code Project Context - TJV Smart Recovery App

## Project Constraints and Guidelines

### What TO DO:
- Always read the complete feature specification before coding
- Follow the research-plan-implement workflow
- Preserve existing design patterns and components
- Use TypeScript for all new code
- Follow Next.js App Router conventions with multi-tenant architecture
- Use Supabase client patterns established in the codebase
- Maintain consistent styling with existing Tailwind classes and shadcn/ui components
- Implement proper multi-tenant data isolation using tenant_id
- Follow HIPAA compliance requirements for all patient data handling
- Use OpenAI Whisper API for voice-to-text features with proper error handling
- Implement AI model switching between OpenAI and Anthropic based on task requirements
- Create chat-based interfaces following Manus.im design patterns
- Use timeline-based task release system for patient recovery phases
- Implement proper role-based access controls for different user types

### What NOT TO DO:
- Do not change existing design/styling unless explicitly requested
- Do not modify database schema without checking docs/database-schema.md
- Do not create new API routes without documenting them
- Do not alter authentication flows without approval
- Do not use different state management patterns than established
- Do not implement features without proper multi-tenant isolation
- Do not store patient data without encryption
- Do not implement voice features without proper fallback mechanisms
- Do not use the word "phase" in user-facing content (use "stage" or "period" instead)
- Do not create traditional dashboard layouts (use chat-based interfaces for patients)
- Do not implement complex node-based form builders (use simplified chat-flow builders)

### Code Standards:
- Use TypeScript interfaces for all data structures
- Follow React Server Component patterns where appropriate
- Use Supabase RLS (Row Level Security) for multi-tenant data access
- Implement proper error handling and loading states for all AI integrations
- Use consistent naming conventions following healthcare domain terminology
- Implement proper audit logging for all patient data access
- Use proper encryption for sensitive medical information
- Follow accessibility guidelines for 40+ age demographic users

### Multi-Tenant Architecture Requirements:
- All database tables must include tenant_id for data isolation
- Use subdomain-based tenant routing (practice.tjvrecovery.com)
- Implement tenant-specific AI training data isolation
- Ensure proper tenant context in all API calls
- Use tenant-specific content libraries and customizations

### Healthcare-Specific Requirements:
- Implement HIPAA-compliant data handling throughout
- Use medical terminology consistently across the application
- Follow healthcare UI/UX best practices for older adults
- Implement proper consent management for all forms
- Use validated medical assessment tools and scoring systems
- Ensure proper medical device integration protocols

### AI Integration Requirements:
- Use OpenAI GPT-4 as primary conversational AI
- Implement Anthropic Claude for complex medical reasoning
- Use OpenAI Whisper for all voice-to-text conversion
- Implement proper AI response training and customization per tenant
- Ensure AI responses are medically appropriate and safe
- Implement proper fallback mechanisms when AI services are unavailable

### Voice Integration Requirements:
- Use OpenAI Whisper API for speech-to-text conversion
- Implement proper audio recording and processing
- Provide visual feedback during voice recording
- Implement proper error handling for voice recognition failures
- Ensure voice features work across all supported devices
- Provide text alternatives for all voice interactions

### Patient Interface Requirements:
- Use chat-based interface as primary patient interaction method
- Implement pre-loaded conversation threads with tasks
- Use large touch targets and high contrast for accessibility
- Implement progress indicators and milestone celebrations
- Use simple, clear language appropriate for medical context
- Implement proper task completion tracking and validation

### Before Making Changes:
1. Read the relevant feature specification in `/docs/features/[feature-name]/`
2. Understand the current multi-tenant architecture
3. Plan the implementation approach considering HIPAA compliance
4. Confirm no existing functionality will break
5. Verify proper tenant isolation will be maintained
6. Ensure AI integrations follow established patterns
7. Test voice features across different devices and browsers

### Emergency Protocols:
- If AI services fail, provide clear fallback messaging
- If voice recognition fails, always provide text input alternatives
- If tenant isolation is compromised, immediately log and alert
- If HIPAA compliance is at risk, halt implementation and review

### Testing Requirements:
- Test all features with multiple tenant configurations
- Verify proper data isolation between tenants
- Test voice features across different browsers and devices
- Validate AI responses for medical appropriateness
- Test accessibility features with screen readers
- Verify HIPAA compliance in all data handling scenarios

### Performance Requirements:
- Optimize for mobile devices used by 40+ age demographic
- Ensure fast loading times for video content
- Implement proper caching for AI responses
- Optimize voice processing for real-time feedback
- Use progressive loading for large content libraries

### Documentation Requirements:
- Document all AI training data and model configurations
- Maintain audit logs for all patient data access
- Document all API integrations and fallback procedures
- Keep security protocols and compliance measures documented
- Document all voice feature implementations and limitations

