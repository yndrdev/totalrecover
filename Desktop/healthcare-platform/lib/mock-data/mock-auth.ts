import { User } from '@supabase/supabase-js'
import { Database } from '@/lib/database-types'

type UserRecord = Database['public']['Tables']['users']['Row']
type PatientRecord = Database['public']['Tables']['patients']['Row']
type ProviderRecord = Database['public']['Tables']['providers']['Row']
type ProfileRecord = Database['public']['Tables']['profiles']['Row']

// Mock users data
export const mockUsers = {
  patient: {
    auth: {
      id: 'mock-patient-001',
      email: 'patient@demo.com',
      role: 'authenticated',
      app_metadata: {},
      user_metadata: {
        full_name: 'John Patient',
        role: 'patient'
      },
      aud: 'authenticated',
      created_at: '2024-01-01T00:00:00.000Z'
    } as User,
    profile: {
      id: 'mock-patient-001',
      email: 'patient@demo.com',
      first_name: 'John',
      last_name: 'Patient',
      role: 'patient',
      tenant_id: 'demo-tenant-001',
      phone: '555-0100',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z'
    } as ProfileRecord,
    user: {
      id: 'mock-patient-001',
      email: 'patient@demo.com',
      full_name: 'John Patient',
      role: 'patient',
      tenant_id: 'demo-tenant-001',
      phone: '555-0100',
      date_of_birth: '1980-01-01',
      gender: 'male',
      is_active: true,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
      last_sign_in_at: new Date().toISOString()
    } as UserRecord,
    patient: {
      id: 'mock-patient-record-001',
      user_id: 'mock-patient-001',
      profile_id: 'mock-patient-001',
      tenant_id: 'demo-tenant-001',
      mrn: 'PAT-001',
      first_name: 'John',
      last_name: 'Patient',
      date_of_birth: '1980-01-01',
      phone: '555-0100',
      email: 'patient@demo.com',
      address: {
        street: '123 Main St',
        city: 'Healthcare City',
        state: 'HC',
        zip: '12345'
      },
      emergency_contact: {
        name: 'Jane Patient',
        phone: '555-0101',
        relationship: 'Spouse'
      },
      medical_history: {},
      insurance_info: {
        provider: 'Demo Insurance',
        policy_number: 'DEMO123'
      },
      preferred_language: 'en',
      status: 'active',
      surgery_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      surgery_type: 'Total Knee Replacement',
      surgeon_id: 'mock-surgeon-001',
      protocol_id: 'mock-protocol-001',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z'
    } as PatientRecord
  },
  surgeon: {
    auth: {
      id: 'mock-surgeon-001',
      email: 'surgeon@demo.com',
      role: 'authenticated',
      app_metadata: {},
      user_metadata: {
        full_name: 'Dr. Sarah Surgeon',
        role: 'surgeon'
      },
      aud: 'authenticated',
      created_at: '2024-01-01T00:00:00.000Z'
    } as User,
    profile: {
      id: 'mock-surgeon-001',
      email: 'surgeon@demo.com',
      first_name: 'Sarah',
      last_name: 'Surgeon',
      role: 'surgeon',
      tenant_id: 'demo-tenant-001',
      phone: '555-0200',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z'
    } as ProfileRecord,
    user: {
      id: 'mock-surgeon-001',
      email: 'surgeon@demo.com',
      full_name: 'Dr. Sarah Surgeon',
      role: 'surgeon',
      tenant_id: 'demo-tenant-001',
      phone: '555-0200',
      is_active: true,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
      last_sign_in_at: new Date().toISOString()
    } as UserRecord,
    provider: {
      id: 'mock-provider-001',
      user_id: 'mock-surgeon-001',
      tenant_id: 'demo-tenant-001',
      specialty: 'Orthopedic Surgery',
      credentials: ['MD', 'FAAOS'],
      is_primary_surgeon: true,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z'
    } as ProviderRecord
  },
  nurse: {
    auth: {
      id: 'mock-nurse-001',
      email: 'nurse@demo.com',
      role: 'authenticated',
      app_metadata: {},
      user_metadata: {
        full_name: 'Nancy Nurse',
        role: 'nurse'
      },
      aud: 'authenticated',
      created_at: '2024-01-01T00:00:00.000Z'
    } as User,
    profile: {
      id: 'mock-nurse-001',
      email: 'nurse@demo.com',
      first_name: 'Nancy',
      last_name: 'Nurse',
      role: 'nurse',
      tenant_id: 'demo-tenant-001',
      phone: '555-0300',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z'
    } as ProfileRecord,
    user: {
      id: 'mock-nurse-001',
      email: 'nurse@demo.com',
      full_name: 'Nancy Nurse',
      role: 'nurse',
      tenant_id: 'demo-tenant-001',
      phone: '555-0300',
      is_active: true,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
      last_sign_in_at: new Date().toISOString()
    } as UserRecord,
    provider: {
      id: 'mock-provider-002',
      user_id: 'mock-nurse-001',
      tenant_id: 'demo-tenant-001',
      specialty: 'Nursing',
      credentials: ['RN', 'BSN'],
      is_primary_surgeon: false,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z'
    } as ProviderRecord
  },
  physical_therapist: {
    auth: {
      id: 'mock-pt-001',
      email: 'pt@demo.com',
      role: 'authenticated',
      app_metadata: {},
      user_metadata: {
        full_name: 'Peter Therapist',
        role: 'physical_therapist'
      },
      aud: 'authenticated',
      created_at: '2024-01-01T00:00:00.000Z'
    } as User,
    profile: {
      id: 'mock-pt-001',
      email: 'pt@demo.com',
      first_name: 'Peter',
      last_name: 'Therapist',
      role: 'physical_therapist',
      tenant_id: 'demo-tenant-001',
      phone: '555-0400',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z'
    } as ProfileRecord,
    user: {
      id: 'mock-pt-001',
      email: 'pt@demo.com',
      full_name: 'Peter Therapist',
      role: 'physical_therapist',
      tenant_id: 'demo-tenant-001',
      phone: '555-0400',
      is_active: true,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
      last_sign_in_at: new Date().toISOString()
    } as UserRecord,
    provider: {
      id: 'mock-provider-003',
      user_id: 'mock-pt-001',
      tenant_id: 'demo-tenant-001',
      specialty: 'Physical Therapy',
      credentials: ['PT', 'DPT'],
      is_primary_surgeon: false,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z'
    } as ProviderRecord
  },
  admin: {
    auth: {
      id: 'mock-admin-001',
      email: 'admin@demo.com',
      role: 'authenticated',
      app_metadata: {},
      user_metadata: {
        full_name: 'Admin User',
        role: 'practice_admin'
      },
      aud: 'authenticated',
      created_at: '2024-01-01T00:00:00.000Z'
    } as User,
    profile: {
      id: 'mock-admin-001',
      email: 'admin@demo.com',
      first_name: 'Admin',
      last_name: 'User',
      role: 'practice_admin',
      tenant_id: 'demo-tenant-001',
      phone: '555-0500',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z'
    } as ProfileRecord,
    user: {
      id: 'mock-admin-001',
      email: 'admin@demo.com',
      full_name: 'Admin User',
      role: 'practice_admin',
      tenant_id: 'demo-tenant-001',
      phone: '555-0500',
      is_active: true,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
      last_sign_in_at: new Date().toISOString()
    } as UserRecord,
    provider: null
  }
}

// Mock session storage key
const MOCK_SESSION_KEY = 'mock_auth_session'

// Helper to get/set mock session
export function getMockSession(): { user: User; userType: keyof typeof mockUsers } | null {
  if (typeof window === 'undefined') return null
  const session = localStorage.getItem(MOCK_SESSION_KEY)
  return session ? JSON.parse(session) : null
}

export function setMockSession(userType: keyof typeof mockUsers) {
  if (typeof window === 'undefined') return
  const user = mockUsers[userType].auth
  localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify({ user, userType }))
}

export function clearMockSession() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(MOCK_SESSION_KEY)
}

// Helper to get mock user data
export function getMockUserData(userType: keyof typeof mockUsers) {
  const mockUser = mockUsers[userType]
  return {
    user: mockUser.auth,
    profile: mockUser.profile,
    userRecord: mockUser.user,
    patientRecord: userType === 'patient' ? mockUser.patient : null,
    providerRecord: ['surgeon', 'nurse', 'physical_therapist'].includes(userType) ? mockUser.provider : null
  }
}