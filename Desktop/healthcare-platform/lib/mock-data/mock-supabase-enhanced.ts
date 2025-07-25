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
                  // Generate comprehensive patient list for practice view
                  const patientsList = [
                    mockUsers.patient.patient,
                    {
                      ...mockUsers.patient.patient,
                      id: 'mock-patient-002',
                      user_id: 'mock-patient-002',
                      profile_id: 'mock-patient-002',
                      first_name: 'Jane',
                      last_name: 'Doe',
                      mrn: 'PAT-002',
                      surgery_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
                      surgery_type: 'Total Hip Replacement',
                      email: 'jane.doe@demo.com',
                      phone: '555-0102',
                      profile: {
                        id: 'mock-patient-002',
                        email: 'jane.doe@demo.com',
                        first_name: 'Jane',
                        last_name: 'Doe'
                      }
                    },
                    {
                      ...mockUsers.patient.patient,
                      id: 'mock-patient-003',
                      user_id: 'mock-patient-003',
                      profile_id: 'mock-patient-003',
                      first_name: 'Robert',
                      last_name: 'Smith',
                      mrn: 'PAT-003',
                      surgery_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
                      surgery_type: 'Total Knee Replacement',
                      email: 'robert.smith@demo.com',
                      phone: '555-0103',
                      profile: {
                        id: 'mock-patient-003',
                        email: 'robert.smith@demo.com',
                        first_name: 'Robert',
                        last_name: 'Smith'
                      }
                    },
                    {
                      ...mockUsers.patient.patient,
                      id: 'mock-patient-004',
                      user_id: 'mock-patient-004',
                      profile_id: 'mock-patient-004',
                      first_name: 'Maria',
                      last_name: 'Garcia',
                      mrn: 'PAT-004',
                      surgery_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
                      surgery_type: 'Partial Knee Replacement',
                      email: 'maria.garcia@demo.com',
                      phone: '555-0104',
                      profile: {
                        id: 'mock-patient-004',
                        email: 'maria.garcia@demo.com',
                        first_name: 'Maria',
                        last_name: 'Garcia'
                      }
                    },
                    {
                      ...mockUsers.patient.patient,
                      id: 'mock-patient-005',
                      user_id: 'mock-patient-005',
                      profile_id: 'mock-patient-005',
                      first_name: 'William',
                      last_name: 'Johnson',
                      mrn: 'PAT-005',
                      surgery_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
                      surgery_type: 'Total Hip Replacement',
                      email: 'william.johnson@demo.com',
                      phone: '555-0105',
                      profile: {
                        id: 'mock-patient-005',
                        email: 'william.johnson@demo.com',
                        first_name: 'William',
                        last_name: 'Johnson'
                      }
                    },
                    {
                      ...mockUsers.patient.patient,
                      id: 'mock-patient-006',
                      user_id: 'mock-patient-006',
                      profile_id: 'mock-patient-006',
                      first_name: 'Sarah',
                      last_name: 'Wilson',
                      mrn: 'PAT-006',
                      surgery_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
                      surgery_type: 'Total Knee Replacement',
                      email: 'sarah.wilson@demo.com',
                      phone: '555-0106',
                      status: 'active',
                      profile: {
                        id: 'mock-patient-006',
                        email: 'sarah.wilson@demo.com',
                        first_name: 'Sarah',
                        last_name: 'Wilson'
                      }
                    },
                    {
                      ...mockUsers.patient.patient,
                      id: 'mock-patient-007',
                      user_id: 'mock-patient-007',
                      profile_id: 'mock-patient-007',
                      first_name: 'James',
                      last_name: 'Brown',
                      mrn: 'PAT-007',
                      surgery_date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days ago
                      surgery_type: 'Hip Resurfacing',
                      email: 'james.brown@demo.com',
                      phone: '555-0107',
                      profile: {
                        id: 'mock-patient-007',
                        email: 'james.brown@demo.com',
                        first_name: 'James',
                        last_name: 'Brown'
                      }
                    },
                    {
                      ...mockUsers.patient.patient,
                      id: 'mock-patient-008',
                      user_id: 'mock-patient-008',
                      profile_id: 'mock-patient-008',
                      first_name: 'Patricia',
                      last_name: 'Davis',
                      mrn: 'PAT-008',
                      surgery_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
                      surgery_type: 'Total Knee Replacement',
                      email: 'patricia.davis@demo.com',
                      phone: '555-0108',
                      profile: {
                        id: 'mock-patient-008',
                        email: 'patricia.davis@demo.com',
                        first_name: 'Patricia',
                        last_name: 'Davis'
                      }
                    }
                  ]
                  
                  return { 
                    data: patientsList, 
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
                  // Include profiles for all mock patients
                  const profilesList = [
                    mockUsers.patient.profile,
                    mockUsers.surgeon.profile,
                    mockUsers.nurse.profile,
                    mockUsers.physical_therapist.profile,
                    mockUsers.admin.profile,
                    // Additional patient profiles to match the patients list
                    {
                      id: 'mock-patient-002',
                      email: 'jane.doe@demo.com',
                      first_name: 'Jane',
                      last_name: 'Doe',
                      role: 'patient',
                      tenant_id: 'demo-tenant-001',
                      phone: '555-0102',
                      created_at: '2024-01-01T00:00:00.000Z',
                      updated_at: '2024-01-01T00:00:00.000Z'
                    },
                    {
                      id: 'mock-patient-003',
                      email: 'robert.smith@demo.com',
                      first_name: 'Robert',
                      last_name: 'Smith',
                      role: 'patient',
                      tenant_id: 'demo-tenant-001',
                      phone: '555-0103',
                      created_at: '2024-01-01T00:00:00.000Z',
                      updated_at: '2024-01-01T00:00:00.000Z'
                    },
                    {
                      id: 'mock-patient-004',
                      email: 'maria.garcia@demo.com',
                      first_name: 'Maria',
                      last_name: 'Garcia',
                      role: 'patient',
                      tenant_id: 'demo-tenant-001',
                      phone: '555-0104',
                      created_at: '2024-01-01T00:00:00.000Z',
                      updated_at: '2024-01-01T00:00:00.000Z'
                    },
                    {
                      id: 'mock-patient-005',
                      email: 'william.johnson@demo.com',
                      first_name: 'William',
                      last_name: 'Johnson',
                      role: 'patient',
                      tenant_id: 'demo-tenant-001',
                      phone: '555-0105',
                      created_at: '2024-01-01T00:00:00.000Z',
                      updated_at: '2024-01-01T00:00:00.000Z'
                    },
                    {
                      id: 'mock-patient-006',
                      email: 'sarah.wilson@demo.com',
                      first_name: 'Sarah',
                      last_name: 'Wilson',
                      role: 'patient',
                      tenant_id: 'demo-tenant-001',
                      phone: '555-0106',
                      created_at: '2024-01-01T00:00:00.000Z',
                      updated_at: '2024-01-01T00:00:00.000Z'
                    },
                    {
                      id: 'mock-patient-007',
                      email: 'james.brown@demo.com',
                      first_name: 'James',
                      last_name: 'Brown',
                      role: 'patient',
                      tenant_id: 'demo-tenant-001',
                      phone: '555-0107',
                      created_at: '2024-01-01T00:00:00.000Z',
                      updated_at: '2024-01-01T00:00:00.000Z'
                    },
                    {
                      id: 'mock-patient-008',
                      email: 'patricia.davis@demo.com',
                      first_name: 'Patricia',
                      last_name: 'Davis',
                      role: 'patient',
                      tenant_id: 'demo-tenant-001',
                      phone: '555-0108',
                      created_at: '2024-01-01T00:00:00.000Z',
                      updated_at: '2024-01-01T00:00:00.000Z'
                    }
                  ]
                  
                  return {
                    data: profilesList,
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
            
            eq: (column: string, value: any) => {
              // Store conditions for filtering
              const conditions = { [column]: value }
              
              // Special handling for profiles table with patient join
              if (table === 'profiles' && column === 'role' && value === 'patient') {
                const profilesWithPatients = [
                  {
                    ...mockUsers.patient.profile,
                    patient: [mockUsers.patient.patient]
                  },
                  {
                    id: 'mock-patient-002',
                    email: 'jane.doe@demo.com',
                    first_name: 'Jane',
                    last_name: 'Doe',
                    role: 'patient',
                    tenant_id: 'demo-tenant-001',
                    phone: '555-0102',
                    created_at: '2024-01-01T00:00:00.000Z',
                    updated_at: '2024-01-01T00:00:00.000Z',
                    patient: [{
                      id: 'mock-patient-002',
                      user_id: 'mock-patient-002',
                      profile_id: 'mock-patient-002',
                      mrn: 'PAT-002',
                      surgery_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                      surgery_type: 'Total Hip Replacement',
                      status: 'active',
                      tenant_id: 'demo-tenant-001'
                    }]
                  },
                  {
                    id: 'mock-patient-003',
                    email: 'robert.smith@demo.com',
                    first_name: 'Robert',
                    last_name: 'Smith',
                    role: 'patient',
                    tenant_id: 'demo-tenant-001',
                    phone: '555-0103',
                    created_at: '2024-01-01T00:00:00.000Z',
                    updated_at: '2024-01-01T00:00:00.000Z',
                    patient: [{
                      id: 'mock-patient-003',
                      user_id: 'mock-patient-003',
                      profile_id: 'mock-patient-003',
                      mrn: 'PAT-003',
                      surgery_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                      surgery_type: 'Total Knee Replacement',
                      status: 'active',
                      tenant_id: 'demo-tenant-001'
                    }]
                  },
                  {
                    id: 'mock-patient-004',
                    email: 'maria.garcia@demo.com',
                    first_name: 'Maria',
                    last_name: 'Garcia',
                    role: 'patient',
                    tenant_id: 'demo-tenant-001',
                    phone: '555-0104',
                    created_at: '2024-01-01T00:00:00.000Z',
                    updated_at: '2024-01-01T00:00:00.000Z',
                    patient: [{
                      id: 'mock-patient-004',
                      user_id: 'mock-patient-004',
                      profile_id: 'mock-patient-004',
                      mrn: 'PAT-004',
                      surgery_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                      surgery_type: 'Partial Knee Replacement',
                      status: 'active',
                      tenant_id: 'demo-tenant-001'
                    }]
                  },
                  {
                    id: 'mock-patient-005',
                    email: 'william.johnson@demo.com',
                    first_name: 'William',
                    last_name: 'Johnson',
                    role: 'patient',
                    tenant_id: 'demo-tenant-001',
                    phone: '555-0105',
                    created_at: '2024-01-01T00:00:00.000Z',
                    updated_at: '2024-01-01T00:00:00.000Z',
                    patient: [{
                      id: 'mock-patient-005',
                      user_id: 'mock-patient-005',
                      profile_id: 'mock-patient-005',
                      mrn: 'PAT-005',
                      surgery_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                      surgery_type: 'Total Hip Replacement',
                      status: 'active',
                      tenant_id: 'demo-tenant-001'
                    }]
                  },
                  {
                    id: 'mock-patient-006',
                    email: 'sarah.wilson@demo.com',
                    first_name: 'Sarah',
                    last_name: 'Wilson',
                    role: 'patient',
                    tenant_id: 'demo-tenant-001',
                    phone: '555-0106',
                    created_at: '2024-01-01T00:00:00.000Z',
                    updated_at: '2024-01-01T00:00:00.000Z',
                    patient: [{
                      id: 'mock-patient-006',
                      user_id: 'mock-patient-006',
                      profile_id: 'mock-patient-006',
                      mrn: 'PAT-006',
                      surgery_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                      surgery_type: 'Total Knee Replacement',
                      status: 'active',
                      tenant_id: 'demo-tenant-001'
                    }]
                  },
                  {
                    id: 'mock-patient-007',
                    email: 'james.brown@demo.com',
                    first_name: 'James',
                    last_name: 'Brown',
                    role: 'patient',
                    tenant_id: 'demo-tenant-001',
                    phone: '555-0107',
                    created_at: '2024-01-01T00:00:00.000Z',
                    updated_at: '2024-01-01T00:00:00.000Z',
                    patient: [{
                      id: 'mock-patient-007',
                      user_id: 'mock-patient-007',
                      profile_id: 'mock-patient-007',
                      mrn: 'PAT-007',
                      surgery_date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
                      surgery_type: 'Hip Resurfacing',
                      status: 'active',
                      tenant_id: 'demo-tenant-001'
                    }]
                  },
                  {
                    id: 'mock-patient-008',
                    email: 'patricia.davis@demo.com',
                    first_name: 'Patricia',
                    last_name: 'Davis',
                    role: 'patient',
                    tenant_id: 'demo-tenant-001',
                    phone: '555-0108',
                    created_at: '2024-01-01T00:00:00.000Z',
                    updated_at: '2024-01-01T00:00:00.000Z',
                    patient: [{
                      id: 'mock-patient-008',
                      user_id: 'mock-patient-008',
                      profile_id: 'mock-patient-008',
                      mrn: 'PAT-008',
                      surgery_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                      surgery_type: 'Total Knee Replacement',
                      status: 'active',
                      tenant_id: 'demo-tenant-001'
                    }]
                  }
                ]
                
                return {
                  ...queryBuilder,
                  conditions,
                  
                  or: (filters: string) => queryBuilder,
                  
                  range: (from: number, to: number) => ({
                    data: profilesWithPatients.slice(from, to + 1),
                    error: null,
                    count: profilesWithPatients.length
                  }),
                  
                  then: async (resolve: Function) => {
                    resolve({ data: profilesWithPatients, error: null, count: profilesWithPatients.length })
                  }
                }
              }
              
              // Return chainable object
              const eqResult = {
                ...queryBuilder,
                conditions,
                
                // Support chained eq calls
                eq: (column2: string, value2: any) => {
                  conditions[column2] = value2
                  return eqResult
                },
                
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
                      // Return patient data matching the user_id if provided
                      const patientData = mockData?.patientRecord || mockUsers.patient.patient
                      if (conditions.user_id) {
                        patientData.user_id = conditions.user_id
                      }
                      return { 
                        data: {
                          ...patientData,
                          id: patientData.id || 'mock-patient-001'
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
                
                // Support promise-like behavior
                then: async (resolve: Function) => {
                  const result = await eqResult.single()
                  resolve(result)
                }
              }
              
              return eqResult
            },
            
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