import { ProtocolService } from '@/lib/services/protocol-service';
import { createClient } from '@/lib/supabase/client';
import { protocolFixtures, tenantFixtures } from '../../fixtures/protocol-fixtures';

// Mock the Supabase client
jest.mock('@/lib/supabase/client');

describe('ProtocolService', () => {
  let protocolService: ProtocolService;
  let mockSupabase: any;

  beforeEach(() => {
    // Reset and setup mocks
    jest.clearAllMocks();
    
    mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        }),
      },
      from: jest.fn(),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    protocolService = new ProtocolService();
  });

  describe('getProtocols', () => {
    it('should fetch all active protocols for the current tenant', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        contains: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [protocolFixtures.standardTJVProtocol],
          error: null,
        }),
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { tenant_id: 'test-tenant-id' },
              error: null,
            }),
          };
        }
        return mockQuery;
      });

      const protocols = await protocolService.getProtocols({ isActive: true });

      expect(protocols).toHaveLength(1);
      expect(protocols[0].name).toBe('Standard TJV Recovery Protocol');
      expect(mockQuery.eq).toHaveBeenCalledWith('tenant_id', 'test-tenant-id');
      expect(mockQuery.eq).toHaveBeenCalledWith('is_active', true);
    });

    it('should filter protocols by surgery type', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        contains: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [protocolFixtures.standardTJVProtocol],
          error: null,
        }),
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { tenant_id: 'test-tenant-id' },
              error: null,
            }),
          };
        }
        return mockQuery;
      });

      await protocolService.getProtocols({ surgeryType: 'TKA' });

      expect(mockQuery.contains).toHaveBeenCalledWith('surgery_types', ['TKA']);
    });
  });

  describe('assignProtocolToPatient', () => {
    it('should successfully assign a protocol to a patient', async () => {
      const patientId = 'patient-123';
      const protocolId = 'protocol-456';
      const surgeryDate = '2025-03-01';
      const surgeryType = 'TKA';

      const mockAssignment = {
        id: 'assignment-789',
        patient_id: patientId,
        protocol_id: protocolId,
        surgery_date: surgeryDate,
        surgery_type: surgeryType,
        status: 'active',
      };

      const mockProtocolTasks = protocolFixtures.protocolTasks.map(task => ({
        ...task,
        protocol_id: protocolId,
      }));

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'patient_protocols') {
          return {
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockAssignment,
              error: null,
            }),
          };
        }
        if (table === 'protocol_tasks') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({
              data: mockProtocolTasks,
              error: null,
            }),
          };
        }
        if (table === 'patient_tasks') {
          return {
            insert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });

      const result = await protocolService.assignProtocolToPatient({
        patientId,
        protocolId,
        surgeryDate,
        surgeryType,
      });

      expect(result).toEqual(mockAssignment);
      expect(mockSupabase.from).toHaveBeenCalledWith('patient_protocols');
      expect(mockSupabase.from).toHaveBeenCalledWith('protocol_tasks');
      expect(mockSupabase.from).toHaveBeenCalledWith('patient_tasks');
    });

    it('should create patient tasks with correct scheduled dates', async () => {
      const patientId = 'patient-123';
      const protocolId = 'protocol-456';
      const surgeryDate = '2025-03-01';
      const surgeryType = 'TKA';

      let capturedPatientTasks: any[] = [];

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'patient_protocols') {
          return {
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { id: 'assignment-789' },
              error: null,
            }),
          };
        }
        if (table === 'protocol_tasks') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({
              data: [
                { id: 'task-1', day: -45 },
                { id: 'task-2', day: 0 },
                { id: 'task-3', day: 7 },
              ],
              error: null,
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
        return {};
      });

      await protocolService.assignProtocolToPatient({
        patientId,
        protocolId,
        surgeryDate,
        surgeryType,
      });

      expect(capturedPatientTasks).toHaveLength(3);
      
      // Check scheduled dates are calculated correctly
      const surgeryDateObj = new Date(surgeryDate);
      
      // Pre-op task (day -45)
      const preOpDate = new Date(surgeryDateObj);
      preOpDate.setDate(surgeryDateObj.getDate() - 45);
      expect(capturedPatientTasks[0].scheduled_date).toBe(preOpDate.toISOString().split('T')[0]);
      
      // Surgery day task (day 0)
      expect(capturedPatientTasks[1].scheduled_date).toBe(surgeryDate);
      
      // Post-op task (day 7)
      const postOpDate = new Date(surgeryDateObj);
      postOpDate.setDate(surgeryDateObj.getDate() + 7);
      expect(capturedPatientTasks[2].scheduled_date).toBe(postOpDate.toISOString().split('T')[0]);
    });
  });

  describe('duplicateProtocol', () => {
    it('should create a copy of an existing protocol with new name', async () => {
      const originalProtocolId = 'protocol-original';
      const newName = 'Copied Protocol';

      const originalProtocol = {
        ...protocolFixtures.standardTJVProtocol,
        id: originalProtocolId,
        tasks: protocolFixtures.protocolTasks,
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'protocols') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: originalProtocol,
              error: null,
            }),
            insert: jest.fn().mockReturnThis(),
          };
        }
        if (table === 'protocol_tasks') {
          return {
            insert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { tenant_id: 'test-tenant-id' },
              error: null,
            }),
          };
        }
        if (table === 'users') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { tenant_id: 'test-tenant-id' },
              error: null,
            }),
          };
        }
        return {};
      });

      const result = await protocolService.duplicateProtocol(originalProtocolId, newName);

      expect(result).toBeTruthy();
      expect(mockSupabase.from).toHaveBeenCalledWith('protocols');
      expect(mockSupabase.from).toHaveBeenCalledWith('protocol_tasks');
    });
  });
});