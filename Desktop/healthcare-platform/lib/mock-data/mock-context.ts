// Mock context for demo mode - provides default data when no user is logged in
import { mockUsers } from './mock-auth'

export function getDefaultMockContext() {
  // Default to patient context for demo
  const defaultUser = mockUsers.patient
  
  return {
    user: defaultUser.auth,
    profile: defaultUser.profile,
    userRecord: defaultUser.user,
    patientRecord: defaultUser.patient,
    providerRecord: null,
    isAuthenticated: true, // Always true in demo mode
    role: 'patient'
  }
}

export function getMockUserByRole(role: string) {
  switch (role) {
    case 'surgeon':
      return mockUsers.surgeon
    case 'nurse':
      return mockUsers.nurse
    case 'physical_therapist':
      return mockUsers.physical_therapist
    case 'admin':
    case 'practice_admin':
      return mockUsers.admin
    default:
      return mockUsers.patient
  }
}