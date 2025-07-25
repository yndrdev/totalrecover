# Total Recover

A comprehensive multi-tenant healthcare platform designed for post-surgical recovery management, enabling practices to efficiently manage patient care through the entire recovery journey.

## 🏥 Overview

Total Recover is a HIPAA-compliant healthcare application that connects surgical practices, healthcare staff, and patients through an integrated recovery management system. The platform supports both pre-operative and post-operative care with automated task assignments, real-time communication, and progress tracking.

## ✨ Key Features

### For Healthcare Practices
- **Multi-tenant Architecture**: Secure isolation between different practices
- **Staff Management**: Assign surgeons, nurses, and physical therapists to patients
- **Protocol Management**: Create and customize recovery protocols for different surgery types
- **Analytics Dashboard**: Track patient progress and recovery outcomes

### For Healthcare Staff
- **Patient Overview**: View all assigned patients in a centralized dashboard
- **Task Management**: Monitor patient task completion and recovery milestones
- **Real-time Communication**: Chat with patients and receive urgent notifications
- **Progress Tracking**: Visual indicators for patient recovery status

### For Patients
- **Personalized Recovery Plans**: Receive day-by-day tasks based on surgery type
- **Task Tracking**: Complete forms, watch educational videos, and log exercises
- **Direct Communication**: Chat with care team members
- **Progress Visualization**: See recovery progress and upcoming milestones

## 🛠️ Technology Stack

- **Frontend**: Next.js 15.4, React 19, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Styling**: Tailwind CSS with custom design system
- **Communication**: Twilio (SMS), Resend (Email)
- **AI Integration**: OpenAI API for intelligent chat responses
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Twilio account (for SMS)
- Resend account (for email)
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/[your-username]/total-recover.git
cd total-recover
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your `.env.local` with required credentials:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Twilio (SMS)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone

# Resend (Email)
RESEND_API_KEY=your_resend_api_key
```

5. Run database migrations:
```bash
# Apply migrations to your Supabase instance
# See supabase/migrations/ directory
```

6. Start the development server:
```bash
npm run dev
```

## 📁 Project Structure

```
total-recover/
├── app/                    # Next.js app directory
│   ├── patient/           # Patient-facing pages
│   ├── provider/          # Healthcare provider pages
│   └── auth/              # Authentication pages
├── components/            # React components
│   ├── ui/               # UI component library
│   ├── chat/             # Chat interface components
│   └── layout/           # Layout components
├── lib/                   # Utility functions and services
│   ├── services/         # API service layers
│   └── supabase/         # Supabase client configuration
├── supabase/             # Database migrations and seeds
│   └── migrations/       # SQL migration files
└── public/               # Static assets
```

## 🔒 Security Features

- **HIPAA Compliance**: Encrypted data storage and transmission
- **Row Level Security**: Database-level access control
- **Multi-factor Authentication**: Optional 2FA for staff accounts
- **Audit Logging**: Comprehensive activity tracking
- **Secure File Upload**: Protected document and video storage

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Test data access flows
npm run test:demo
```

## 📊 Demo Data

The project includes comprehensive seed data for testing:
- 1 Demo practice (TJV Healthcare)
- 3 Staff members (Surgeon, Nurse, Physical Therapist)
- 2 Patients (1 pre-op, 1 post-op)
- Sample tasks and protocols

Demo credentials:
- **Surgeon**: dr.chen@demo.tjv.com
- **Patient**: john.doe@demo.com
- **Password**: DemoPass123!

## 🚢 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with automatic builds on push

### Database Setup
1. Create a new Supabase project
2. Run migrations in order (see supabase/migrations/)
3. Configure authentication providers
4. Set up storage buckets for file uploads

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 🤝 Support

For support, email support@totalrecover.com or create an issue in the GitHub repository.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database by [Supabase](https://supabase.com/)
- Deployed on [Vercel](https://vercel.com/)
