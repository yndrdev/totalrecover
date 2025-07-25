import { User } from '@supabase/supabase-js'
import { getMockSession, setMockSession, clearMockSession, mockUsers, getMockUserData } from './mock-auth'

// Mock Supabase client that mimics the real client interface
export function createMockSupabaseClient() {
  const mockClient = {
    auth: {
      getUser: async () => {
        const session = getMockSession()
        if (session) {
          return { data: { user: session.user }, error: null }
        }
        return { data: { user: null }, error: null }
      },
      
      getSession: async () => {
        const session = getMockSession()
        if (session) {
          return {
            data: {
              session: {
                user: session.user,
                access_token: 'mock-access-token',
                refresh_token: 'mock-refresh-token',
                expires_at: Date.now() + 3600000 // 1 hour from now
              }
            },
            error: null
          }
        }
        return { data: { session: null }, error: null }
      },
      
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        // Find user by email
        const userType = Object.keys(mockUsers).find(
          key => mockUsers[key as keyof typeof mockUsers].auth.email === email
        ) as keyof typeof mockUsers | undefined
        
        if (userType) {
          setMockSession(userType)
          const user = mockUsers[userType].auth
          return {
            data: {
              user,
              session: {
                user,
                access_token: 'mock-access-token',
                refresh_token: 'mock-refresh-token',
                expires_at: Date.now() + 3600000
              }
            },
            error: null
          }
        }
        
        return {
          data: { user: null, session: null },
          error: { message: 'Invalid login credentials', name: 'AuthError', status: 400 }
        }
      },
      
      signUp: async ({ email, password, options }: any) => {
        // For demo, just sign them in with a default account based on role
        const role = options?.data?.role || 'patient'
        const userType = role === 'patient' ? 'patient' : 
                        role === 'surgeon' ? 'surgeon' :
                        role === 'nurse' ? 'nurse' :
                        role === 'physical_therapist' ? 'physical_therapist' :
                        role === 'practice_admin' ? 'admin' : 'patient'
        
        setMockSession(userType as keyof typeof mockUsers)
        const user = mockUsers[userType as keyof typeof mockUsers].auth
        
        return {
          data: {
            user,
            session: {
              user,
              access_token: 'mock-access-token',
              refresh_token: 'mock-refresh-token',
              expires_at: Date.now() + 3600000
            }
          },
          error: null
        }
      },
      
      signOut: async () => {
        clearMockSession()
        return { error: null }
      },
      
      onAuthStateChange: (callback: (event: string, session: any) => void) => {
        // Mock implementation - just return unsubscribe function
        return {
          data: {
            subscription: {
              unsubscribe: () => {}
            }
          }
        }
      },
      
      admin: {
        deleteUser: async (userId: string) => {
          return { data: null, error: null }
        }
      }
    },
    
    from: (table: string) => {
      return {
        select: (columns?: string) => {
          const selectResult = {
            // Direct execution for list queries
            then: async (resolve: Function, reject: Function) => {
              try {
                const data = await selectResult.execute()
                resolve(data)
              } catch (error) {
                reject(error)
              }
            },
            execute: async () => {
              // Return list data based on table
              switch (table) {
                case 'patients':
                  return { 
                    data: [mockUsers.patient.patient], 
                    error: null 
                  }
                case 'providers':
                  return { 
                    data: [
                      mockUsers.surgeon.provider,
                      mockUsers.nurse.provider,
                      mockUsers.physical_therapist.provider
                    ], 
                    error: null 
                  }
                case 'protocols':
                  return {
                    data: [{
                      id: 'mock-protocol-001',
                      name: 'Total Knee Replacement Protocol',
                      description: 'Standard TKR recovery protocol',
                      is_active: true,
                      tenant_id: 'demo-tenant-001',
                      created_at: '2024-01-01T00:00:00.000Z'
                    }],
                    error: null
                  }
                case 'profiles':
                  return {
                    data: [
                      mockUsers.patient.profile,
                      mockUsers.surgeon.profile,
                      mockUsers.nurse.profile
                    ],
                    error: null
                  }
                default:
                  return { data: [], error: null }
              }
            },
            eq: (column: string, value: any) => ({
            single: async () => {
              const session = getMockSession()
              const mockData = session ? getMockUserData(session.userType) : null
              
              // Return appropriate data based on table
              switch (table) {
                case 'profiles':
                  return { data: mockData?.profile || mockUsers.patient.profile, error: null }
                case 'users':
                  return { data: mockData?.userRecord || mockUsers.patient.user, error: null }
                case 'patients':
                  // Return mock patient data even without session
                  return { 
                    data: mockData?.patientRecord || {
                      ...mockUsers.patient.patient,
                      id: value || 'mock-patient-001'
                    }, 
                    error: null 
                  }
                case 'providers':
                  return { 
                    data: mockData?.providerRecord || mockUsers.surgeon.provider, 
                    error: null 
                  }
                case 'tenants':
                  return { 
                    data: { 
                      id: 'demo-tenant-001',
                      name: 'Demo Healthcare',
                      settings: {}
                    }, 
                    error: null 
                  }
                case 'protocols':
                  return {
                    data: {
                      id: 'mock-protocol-001',
                      name: 'Total Knee Replacement Protocol',
                      description: 'Standard TKR recovery protocol',
                      is_active: true,
                      created_at: '2024-01-01T00:00:00.000Z'
                    },
                    error: null
                  }
                default:
                  return { data: null, error: null }
              }
            },
            limit: (count: number) => ({
              single: async () => {
                return { 
                  data: { 
                    id: 'demo-tenant-001',
                    name: 'Demo Healthcare',
                    settings: {}
                  }, 
                  error: null 
                }
              }
            })
          }),
          limit: (count: number) => ({
            single: async () => {
              return { 
                data: { 
                  id: 'demo-tenant-001',
                  name: 'Demo Healthcare',
                  settings: {}
                }, 
                error: null 
              }
            }
          })
        }),
        
        insert: async (data: any) => {
          // Mock insert - just return success
          return { data: null, error: null }
        },
        
        update: async (data: any) => ({
          eq: (column: string, value: any) => {
            // Mock update - just return success
            return { data: null, error: null }
          }
        }),
        
        rpc: async (fnName: string, params?: any) => {
          // Mock RPC calls
          console.log('Mock RPC call:', fnName, params)
          return { data: null, error: null }
        }
      }
    },
    
    // Mock channel for real-time subscriptions
    channel: (name: string) => ({
      on: (event: string, config: any, callback: Function) => ({
        subscribe: () => {
          console.log('Mock subscription:', name, event)
          return {
            unsubscribe: () => console.log('Mock unsubscribe:', name)
          }
        }
      })
    })
  }
  
  return mockClient
}