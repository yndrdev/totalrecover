# TJV Smart Recovery App

## Project Overview

The TJV Smart Recovery App is a comprehensive digital health platform designed to support patients undergoing Total Joint Arthroplasty (TJA) procedures, specifically Total Knee Arthroplasty (TKA) and Total Hip Arthroplasty (THA). This multi-tenant SaaS application provides personalized, timeline-based recovery programs that integrate exercise protocols, educational content, daily task management, AI-powered assistance, and continuous progress monitoring to optimize patient outcomes and reduce healthcare costs.

The platform serves as a bridge between patients and their healthcare teams, enabling remote monitoring, personalized care delivery, and data-driven decision making throughout the entire recovery journey from pre-surgery preparation (Day -30) through long-term maintenance (Day 365+).

## Tech Stack

- **Frontend**: Next.js 14+ with App Router and React
- **Mobile**: React Native for cross-platform mobile development
- **Backend**: Supabase (Database + Auth + Storage + Real-time)
- **Database**: PostgreSQL with HIPAA-compliant configuration
- **Deployment**: Vercel for web application
- **Styling**: Tailwind CSS with shadcn/ui components
- **Multi-tenancy**: Vercel Multi-Tenant Starter Kit
- **AI Integration**: OpenAI (GPT-4, Whisper) and Anthropic (Claude)
- **Voice Features**: OpenAI Whisper for voice-to-text conversion

## Key Features

### Patient Experience
- **Chat-Based Interface**: Manus.im-inspired conversational interface for all patient interactions
- **Timeline-Based Recovery**: Day-specific task releases from pre-surgery through maintenance
- **Voice Integration**: OpenAI Whisper-powered voice-to-text for accessibility
- **Progress Tracking**: Visual progress indicators and milestone celebrations
- **Smart Device Integration**: Persona IQ Smart Knee technology support

### Healthcare Provider Experience
- **Patient Dashboard**: Comprehensive patient monitoring and management
- **Task Builder**: Custom form and exercise protocol creation
- **AI Training**: Customizable AI responses for patient interactions
- **Analytics**: Progress tracking and outcome measurement tools
- **Multi-role Support**: Surgeon, nurse, and physical therapist workflows

### Administrative Features
- **Multi-tenant Architecture**: Support for multiple practices and hospitals
- **Practice Management**: Staff assignment and patient organization
- **Content Library**: Video, exercise, and educational content management
- **HIPAA Compliance**: End-to-end encryption and audit logging

## Development Workflow with Claude Code

1. Review feature specification in `/docs/features/[feature-name]/`
2. Follow the research-plan-implement workflow
3. Always preserve existing design patterns unless explicitly changing them
4. Refer to database schema before making any data structure changes
5. Implement voice-to-text features using OpenAI Whisper API
6. Follow multi-tenant architecture patterns for data isolation

## Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account and project
- Vercel account for deployment
- OpenAI API key for AI features

### Installation
```bash
# Clone the repository
git clone [repository-url]
cd tjv-recovery-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Configure Supabase, OpenAI, and other API keys

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

### Environment Variables
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Anthropic Configuration (Optional)
ANTHROPIC_API_KEY=your_anthropic_api_key

# Multi-tenant Configuration
NEXT_PUBLIC_ROOT_DOMAIN=your_domain.com
```

## Documentation Structure

All feature specifications are in `/docs/features/`. Each feature includes:
- Feature specification with user stories and acceptance criteria
- Component breakdown and technical requirements
- API requirements and endpoint specifications
- Wireframes and UI mockups

### Core Features Documentation
- **Authentication**: Multi-tenant user authentication and role management
- **Patient Chat**: Main conversational interface for patient interactions
- **Task Builder**: Dynamic form and task creation system
- **Pre-Surgery Forms**: Medical questionnaires and consent forms
- **Recovery Phases**: Timeline-based recovery program management
- **Exercise System**: Video-based exercise protocols with progress tracking
- **Education System**: Educational content delivery and tracking
- **Daily Tasks**: Task management and completion tracking
- **Practice Dashboard**: Healthcare provider patient management interface
- **AI System**: Intelligent response system with training capabilities
- **Voice Integration**: OpenAI Whisper voice-to-text implementation
- **Progress Tracking**: Analytics and outcome measurement
- **Smart Device Integration**: Persona IQ Smart Knee connectivity

## User Types and Roles

### Primary Users (Patients)
- **Active Adults**: Patients capable of community ambulation and moderate activity
- **Sedentary Adults**: Patients with limited mobility requiring assistive devices
- **Age Range**: Typically 45-85 years old
- **Surgery Types**: TKA and THA patients

### Secondary Users (Healthcare Providers)
- **SaaS Owner**: Platform administration and multi-tenant management
- **Practice Admin**: Practice-level configuration and staff management
- **Surgeons**: Primary care oversight and clinical decision making
- **Nurses**: Patient education and symptom monitoring
- **Physical Therapists**: Exercise prescription and progress monitoring

## Multi-Tenant Architecture

The application supports multiple organizational levels:

```
SaaS Owner (Platform Level)
├── Hospital/Practice 1
│   ├── Practice Admin
│   ├── Surgeons
│   ├── Nurses
│   ├── Physical Therapists
│   └── Patients
├── Hospital/Practice 2
│   └── [Same structure]
└── Hospital/Practice N
    └── [Same structure]
```

Each tenant has isolated data, customizable AI training, and independent content libraries while sharing the core platform infrastructure.

## AI Integration Strategy

### Model Usage
- **Primary AI**: OpenAI GPT-4 for conversational responses and content generation
- **Alternative AI**: Anthropic Claude for complex reasoning and analysis
- **Voice Processing**: OpenAI Whisper for speech-to-text conversion
- **Model Switching**: Dynamic selection based on task complexity and requirements

### AI Training
- Practice-specific AI training data
- Patient interaction learning
- Anonymized data for HIPAA compliance
- Continuous improvement through feedback loops

## Security and Compliance

### HIPAA Compliance
- End-to-end encryption for all patient data
- Audit logging for all data access and modifications
- Role-based access controls
- Data anonymization for AI training
- Secure multi-tenant data isolation

### Authentication
- Multi-factor authentication support
- Role-based permissions
- Session management
- API key security

## Development Guidelines

⚠️ **Important for Claude Code**: Always read the feature specification completely before implementing. Do not make assumptions about requirements.

### What TO DO:
- Always read the complete feature specification before coding
- Follow the research-plan-implement workflow
- Preserve existing design patterns and components
- Use TypeScript for all new code
- Follow Next.js App Router conventions
- Use Supabase client patterns established in the codebase
- Maintain consistent styling with existing Tailwind classes
- Implement voice features using OpenAI Whisper API
- Follow multi-tenant data isolation patterns

### What NOT TO DO:
- Do not change existing design/styling unless explicitly requested
- Do not modify database schema without checking docs/database-schema.md
- Do not create new API routes without documenting them
- Do not alter authentication flows without approval
- Do not use different state management patterns than established
- Do not implement voice features without proper error handling

## Deployment

### Web Application
- Deploy to Vercel using the multi-tenant starter kit
- Configure custom domains for tenant isolation
- Set up environment variables for production

### Mobile Application
- Build React Native apps for iOS and Android
- Deploy to App Store and Google Play Store
- Configure deep linking for web integration

## Contributing

1. Read the relevant feature specification in `/docs/features/`
2. Create a feature branch from `main`
3. Implement following the established patterns
4. Test thoroughly including voice features
5. Submit pull request with documentation updates

## License

[License information to be added]

## Support

For technical support and questions:
- Documentation: `/docs/` directory
- Feature Specifications: `/docs/features/`
- API Documentation: [To be added]
- Contact: [Contact information to be added]

