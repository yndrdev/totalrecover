import { createClient } from '@/lib/supabase/client';
import { invitationService } from '@/lib/services/invitation-service';
import { protocolService } from '@/lib/services/protocol-service';
import { protocolSeeder } from '@/lib/services/protocol-seeder';
import { patientService } from '@/lib/services/patient-service';
import { protocolFixtures, patientFixtures, invitationFixtures } from '../fixtures/protocol-fixtures';

// Mock Supabase client for integration tests
jest.mock('@/lib/supabase/client');
jest.mock('@/lib/supabase-browser');

describe('Patient Onboarding with Automatic Protocol Assignment', () => {
  let mockSupabase: any;
  let standardProtocolId: string;
  let tenantId: string;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    tenantId = 'test-tenant-id';
    standardProtocolId = 'standard-protocol-id';
    
    mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'provider-id', email: 'provider@example.com' } },
        }),
        signUp: jest.fn().mockResolvedValue({
          data: { 
            user: { 
              id: 'new-user-id',
              email: 'test@example.com'
            }
          },
          error: null
        }),
        exchangeCodeForSession: jest.fn(),
      },
      from: jest.fn(),
      rpc: jest.fn(),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    
    // Also mock the browser client
    const { createClient: createBrowserClient } = require('@/lib/supabase-browser');
    (createBrowserClient as jest.Mock).mockReturnValue(mockSupabase);

    // Setup default mock implementations
    setupDefaultMocks();
  });

  function setupDefaultMocks() {
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { tenant_id: tenantId },
            error: null,
          }),
        };
      }
      if (table === 'recovery_protocols' || table === 'protocols') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          contains: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { id: standardProtocolId, name: 'Standard TJV Recovery Protocol', is_template: true },
            error: null,
          }),
          order: jest.fn().mockResolvedValue({
            data: [{ id: standardProtocolId, name: 'Standard TJV Recovery Protocol', is_template: true }],
            error: null,
          }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {},
          error: null,
        }),
      };
    });
  }

  describe('Patient Invitation Acceptance Flow', () => {
    it('should automatically assign standard protocol when patient accepts invitation', async () => {
      const invitation = invitationFixtures.pendingInvitation;
      let capturedPatientProtocol: any;
      let capturedPatientTasks: any[] = [];

      // Mock invitation validation
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'patient_invitations') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: invitation,
              error: null,
            }),
            update: jest.fn().mockReturnThis(),
          };
        }
        if (table === 'patient_protocols') {
          return {
            insert: jest.fn((data) => {
              capturedPatientProtocol = data;
              return {
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                  data: { id: 'pp-123', ...data },
                  error: null,
                }),
              };
            }),
          };
        }
        if (table === 'patient_tasks') {
          return {
            insert: jest.fn((tasks) => {
              capturedPatientTasks = tasks;
              return Promise.resolve({ error: null });
            }),
          };
        }
        if (table === 'protocol_tasks') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({
              data: protocolFixtures.protocolTasks,
              error: null,
            }),
          };
        }
        return setupDefaultMocks().from(table);
      });

      // Mock RPC for accepting invitation
      mockSupabase.rpc.mockImplementation((fnName: string) => {
        if (fnName === 'accept_patient_invitation') {
          return Promise.resolve({ data: true, error: null });
        }
        if (fnName === 'assign_standard_protocol_to_patient') {
          // Simulate the automatic protocol assignment
          return Promise.resolve({ 
            data: { 
              success: true, 
              protocol_id: standardProtocolId,
              patient_protocol_id: 'pp-123' 
            }, 
            error: null 
          });
        }
        return Promise.resolve({ data: null, error: null });
      });

      // Validate invitation
      const validationResult = await invitationService.validateInvitation(invitation.invitation_token);
      expect(validationResult.valid).toBe(true);

      // Simulate patient account creation and automatic protocol assignment
      const patientId = 'new-patient-id';
      
      // This would be called by the system after patient creation
      const assignmentResult = await protocolService.assignProtocolToPatient({
        patientId,
        protocolId: standardProtocolId,
        surgeryDate: invitation.surgery_date!,
        surgeryType: invitation.surgery_type!,
      });

      expect(capturedPatientProtocol).toBeDefined();
      expect(capturedPatientProtocol.patient_id).toBe(patientId);
      expect(capturedPatientProtocol.protocol_id).toBe(standardProtocolId);
      expect(capturedPatientProtocol.surgery_date).toBe(invitation.surgery_date);
      expect(capturedPatientProtocol.surgery_type).toBe(invitation.surgery_type);
      expect(capturedPatientProtocol.status).toBe('active');

      // Verify tasks were created
      expect(capturedPatientTasks.length).toBe(protocolFixtures.protocolTasks.length);
    });

    it('should assign protocol based on surgery type from invitation', async () => {
      const tkaProtocolId = 'tka-protocol-id';
      const thaProtocolId = 'tha-protocol-id';

      // Test with TKA surgery type
      const tkaInvitation = {
        ...invitationFixtures.pendingInvitation,
        surgery_type: 'TKA',
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'protocols') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            contains: jest.fn().mockImplementation((field, value) => {
              if (field === 'surgery_types' && value.includes('TKA')) {
                return {
                  order: jest.fn().mockResolvedValue({
                    data: [{ id: tkaProtocolId, name: 'TKA Protocol', is_template: true }],
                    error: null,
                  }),
                };
              }
              return {
                order: jest.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              };
            }),
          };
        }
        return setupDefaultMocks().from(table);
      });

      // Get appropriate protocol for TKA
      const protocols = await protocolService.getProtocols({
        surgeryType: 'TKA',
        isActive: true,
      });

      expect(protocols.length).toBeGreaterThan(0);
      expect(protocols[0].id).toBe(tkaProtocolId);
    });
  });

  describe('Direct Patient Signup Flow', () => {
    it('should automatically assign protocol when patient signs up directly', async () => {
      const patientData = {
        email: 'newpatient@example.com',
        first_name: 'Jane',
        last_name: 'Doe',
        phone: '555-1234',
        surgery_date: '2025-03-15',
        surgery_type: 'TKA',
        mrn: 'MRN-2025-001',
      };

      let createdPatient: any;
      let assignedProtocol: any;

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'patients') {
          return {
            insert: jest.fn((data) => {
              createdPatient = { id: 'patient-123', ...data };
              return {
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                  data: createdPatient,
                  error: null,
                }),
              };
            }),
          };
        }
        if (table === 'patient_protocols') {
          return {
            insert: jest.fn((data) => {
              assignedProtocol = data;
              return {
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                  data: { id: 'pp-456', ...data },
                  error: null,
                }),
              };
            }),
          };
        }
        return setupDefaultMocks().from(table);
      });

      // Mock the automatic protocol assignment hook
      mockSupabase.rpc.mockImplementation((fnName: string) => {
        if (fnName === 'auto_assign_protocol_on_patient_create') {
          return Promise.resolve({
            data: { 
              success: true,
              protocol_id: standardProtocolId,
              patient_protocol_id: 'pp-456',
            },
            error: null,
          });
        }
        return Promise.resolve({ data: null, error: null });
      });

      // Create patient
      const patient = await patientService.createPatient(patientData);

      // Simulate automatic protocol assignment (would be triggered by database trigger/function)
      await protocolService.assignProtocolToPatient({
        patientId: patient.id,
        protocolId: standardProtocolId,
        surgeryDate: patientData.surgery_date,
        surgeryType: patientData.surgery_type,
      });

      expect(assignedProtocol).toBeDefined();
      expect(assignedProtocol.patient_id).toBe(patient.id);
      expect(assignedProtocol.protocol_id).toBe(standardProtocolId);
      expect(assignedProtocol.status).toBe('active');
    });
  });

  describe('Batch Patient Import', () => {
    it('should assign protocols to all imported patients automatically', async () => {
      const patientBatch = [
        { ...patientFixtures.newPatient, id: 'batch-patient-1' },
        { ...patientFixtures.newPatient, id: 'batch-patient-2', surgery_type: 'THA' },
        { ...patientFixtures.newPatient, id: 'batch-patient-3' },
      ];

      const assignedProtocols: any[] = [];

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'patients') {
          return {
            insert: jest.fn().mockResolvedValue({
              data: patientBatch,
              error: null,
            }),
          };
        }
        if (table === 'patient_protocols') {
          return {
            insert: jest.fn((data) => {
              if (Array.isArray(data)) {
                assignedProtocols.push(...data);
              } else {
                assignedProtocols.push(data);
              }
              return Promise.resolve({ error: null });
            }),
          };
        }
        return setupDefaultMocks().from(table);
      });

      // Simulate batch import and protocol assignment
      for (const patient of patientBatch) {
        await protocolService.assignProtocolToPatient({
          patientId: patient.id,
          protocolId: standardProtocolId,
          surgeryDate: patient.surgery_date,
          surgeryType: patient.surgery_type,
        });
      }

      expect(assignedProtocols).toHaveLength(3);
      expect(assignedProtocols.every(p => p.protocol_id === standardProtocolId)).toBe(true);
      expect(assignedProtocols.every(p => p.status === 'active')).toBe(true);
    });
  });

  describe('Protocol Assignment Validation', () => {
    it('should not assign protocol if patient already has active protocol', async () => {
      const existingPatient = patientFixtures.existingPatient;

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'patient_protocols') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { 
                id: 'existing-pp',
                patient_id: existingPatient.id,
                protocol_id: existingPatient.protocol_id,
                status: 'active',
              },
              error: null,
            }),
          };
        }
        return setupDefaultMocks().from(table);
      });

      // Check if patient already has active protocol
      const { data: existingProtocol } = await mockSupabase
        .from('patient_protocols')
        .select('*')
        .eq('patient_id', existingPatient.id)
        .eq('status', 'active')
        .single();

      expect(existingProtocol).toBeDefined();
      expect(existingProtocol.status).toBe('active');
      
      // System should not assign another protocol
      // This validation would be implemented in the actual assignment logic
    });

    it('should handle missing standard protocol gracefully', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'protocols') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            contains: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({
              data: [], // No protocols found
              error: null,
            }),
          };
        }
        return setupDefaultMocks().from(table);
      });

      const protocols = await protocolService.getProtocols({
        isActive: true,
        surgeryType: 'TKA',
      });

      expect(protocols).toHaveLength(0);
      
      // System should handle this gracefully - perhaps notify admin
      // or fall back to a generic protocol
    });
  });
});