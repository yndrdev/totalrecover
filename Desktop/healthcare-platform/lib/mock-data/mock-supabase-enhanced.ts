import { mockUsers, getMockSession, getMockUserData } from './mock-auth'

// Enhanced mock Supabase client with better query support
export function createEnhancedMockSupabaseClient() {
  const mockClient = {
    auth: {
      getUser: async () => {
        const session = getMockSession()
        // Always return a mock user in demo mode
        const defaultUser = mockUsers.patient.auth
        if (session) {
          return { data: { user: session.user }, error: null }
        }
        // Return default patient user when no session
        return { data: { user: defaultUser }, error: null }
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
                expires_at: Date.now() + 3600000
              }
            },
            error: null
          }
        }
        return { data: { session: null }, error: null }
      },
      
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        const userType = Object.keys(mockUsers).find(
          key => mockUsers[key as keyof typeof mockUsers].auth.email === email
        ) as keyof typeof mockUsers | undefined
        
        if (userType) {
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
      
      signOut: async () => {
        return { error: null }
      },
      
      onAuthStateChange: (callback: (event: string, session: any) => void) => {
        return {
          data: {
            subscription: {
              unsubscribe: () => {}
            }
          }
        }
      }
    },
    
    from: (table: string) => {
      const queryBuilder: any = {
        select: (columns?: string) => {
          return {
            ...queryBuilder,
            
            // Direct promise support for list queries
            then: async (resolve: Function, reject: Function) => {
              try {
                const result = await queryBuilder._executeList()
                resolve(result)
              } catch (error) {
                reject(error)
              }
            },
            
            // Execute list query
            _executeList: async () => {
              switch (table) {
                case 'patients':
                  return { 
                    data: [
                      mockUsers.patient.patient,
                      {
                        ...mockUsers.patient.patient,
                        id: 'mock-patient-002',
                        first_name: 'Jane',
                        last_name: 'Doe',
                        mrn: 'PAT-002'
                      }
                    ], 
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
                    data: [
                      {
                        id: 'mock-protocol-001',
                        name: 'Total Knee Replacement Protocol',
                        description: 'Standard TKR recovery protocol',
                        is_active: true,
                        tenant_id: 'demo-tenant-001',
                        created_at: '2024-01-01T00:00:00.000Z'
                      },
                      {
                        id: 'mock-protocol-002',
                        name: 'Total Hip Replacement Protocol',
                        description: 'Standard THR recovery protocol',
                        is_active: true,
                        tenant_id: 'demo-tenant-001',
                        created_at: '2024-01-01T00:00:00.000Z'
                      }
                    ],
                    error: null
                  }
                case 'profiles':
                  return {
                    data: [
                      mockUsers.patient.profile,
                      mockUsers.surgeon.profile,
                      mockUsers.nurse.profile,
                      mockUsers.physical_therapist.profile,
                      mockUsers.admin.profile
                    ],
                    error: null
                  }
                case 'practices':
                  return {
                    data: [{
                      id: 'mock-practice-001',
                      name: 'Demo Orthopedic Practice',
                      tenant_id: 'demo-tenant-001',
                      address: '123 Medical Center Dr',
                      phone: '555-0100',
                      created_at: '2024-01-01T00:00:00.000Z'
                    }],
                    error: null
                  }
                default:
                  return { data: [], error: null }
              }
            },
            
            eq: (column: string, value: any) => ({
              ...queryBuilder,
              single: async () => {
                const session = getMockSession()
                const mockData = session ? getMockUserData(session.userType) : null
                
                switch (table) {
                  case 'profiles':
                    // Always return a profile, default to patient if no session
                    return { data: mockData?.profile || mockUsers.patient.profile, error: null }
                  case 'users':
                    return { data: mockData?.userRecord || mockUsers.patient.user, error: null }
                  case 'patients':
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
                  case 'protocols':
                    return {
                      data: {
                        id: value || 'mock-protocol-001',
                        name: 'Total Knee Replacement Protocol',
                        description: 'Standard TKR recovery protocol',
                        is_active: true,
                        tenant_id: 'demo-tenant-001',
                        created_at: '2024-01-01T00:00:00.000Z'
                      },
                      error: null
                    }
                  case 'tenants':
                    return {
                      data: {
                        id: value || 'demo-tenant-001',
                        name: 'Demo Healthcare Practice',
                        settings: {}
                      },
                      error: null
                    }
                  default:
                    // Return empty object instead of null for unknown tables
                    return { data: {}, error: null }
                }
              },
              // Support chained methods
              then: async (resolve: Function) => {
                const result = await queryBuilder.eq(column, value).single()
                resolve(result)
              }
            }),
            
            order: (column: string, options?: any) => queryBuilder,
            limit: (count: number) => queryBuilder,
            range: (from: number, to: number) => queryBuilder
          }
        },
        
        insert: async (data: any) => {
          return { data: null, error: null }
        },
        
        update: async (data: any) => ({
          eq: (column: string, value: any) => {
            return { data: null, error: null }
          }
        }),
        
        delete: () => ({
          eq: (column: string, value: any) => {
            return { data: null, error: null }
          }
        })
      }
      
      return queryBuilder
    },
    
    rpc: async (fnName: string, params?: any) => {
      console.log('Mock RPC call:', fnName, params)
      return { data: null, error: null }
    },
    
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