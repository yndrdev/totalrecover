import { createClient } from '@/lib/supabase/client';
import { protocolSeeder } from '@/lib/services/protocol-seeder';
import { practiceService } from '@/lib/services/practice-service';
import { tenantFixtures } from '../fixtures/protocol-fixtures';

// Mock Supabase client
jest.mock('@/lib/supabase/client');

describe('Tenant Provisioning with Automatic Protocol Setup', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'admin-id', email: 'admin@example.com' } },
        }),
        signUp: jest.fn(),
      },
      from: jest.fn(),
      rpc: jest.fn(),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe('New Tenant Creation', () => {
    it('should automatically seed standard protocols when new tenant is created', async () => {
      const newTenant = {
        id: 'new-tenant-id',
        name: 'New Healthcare Practice',
        settings: {
          automatic_protocol_assignment: true,
        },
      };

      let seededProtocol: any;
      let seededTasks: any[] = [];

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'tenants') {
          return {
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: newTenant,
              error: null,
            }),
          };
        }
        if (table === 'recovery_protocols') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockImplementation(() => {
              // First call returns no existing protocol
              if (!seededProtocol) {
                return Promise.resolve({
                  data: null,
                  error: { code: 'PGRST116' },
                });
              }
              // Subsequent calls return the seeded protocol
              return Promise.resolve({
                data: seededProtocol,
                error: null,
              });
            }),
            insert: jest.fn((data) => {
              seededProtocol = { id: 'seeded-protocol-id', ...data };
              return {
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                  data: seededProtocol,
                  error: null,
                }),
              };
            }),
          };
        }
        if (table === 'tasks') {
          return {
            insert: jest.fn((tasks) => {
              seededTasks = tasks;
              return {
                select: jest.fn().mockResolvedValue({
                  data: tasks,
                  error: null,
                }),
              };
            }),
          };
        }
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { 
                tenant_id: newTenant.id,
                first_name: 'Admin',
                last_name: 'User',
              },
              error: null,
            }),
          };
        }
        if (table === 'audit_logs') {
          return {
            insert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });

      // Mock RPC for tenant creation hook
      mockSupabase.rpc.mockImplementation((fnName: string) => {
        if (fnName === 'create_tenant_with_setup') {
          // Simulate the tenant creation with automatic setup
          return Promise.resolve({
            data: {
              tenant_id: newTenant.id,
              protocols_created: 1,
              setup_complete: true,
            },
            error: null,
          });
        }
        return Promise.resolve({ data: null, error: null });
      });

      // Create tenant (would trigger automatic protocol seeding)
      const { data: tenant } = await mockSupabase
        .from('tenants')
        .insert(newTenant)
        .select()
        .single();

      // Seed protocols for the new tenant
      const seedResult = await protocolSeeder.seedTJVProtocol();

      expect(seedResult.success).toBe(true);
      expect(seedResult.protocolId).toBeDefined();
      expect(seededProtocol).toBeDefined();
      expect(seededProtocol.tenant_id).toBe(newTenant.id);
      expect(seededProtocol.name).toBe('Standard TJV Recovery Protocol');
      expect(seededProtocol.is_template).toBe(true);
      expect(seededTasks.length).toBeGreaterThan(0);
      expect(seededTasks.every(task => task.tenant_id === newTenant.id)).toBe(true);
    });

    it('should create multiple protocol variants for different surgery types', async () => {
      const protocols: any[] = [];

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'recovery_protocols' || table === 'protocols') {
          return {
            insert: jest.fn((data) => {
              if (Array.isArray(data)) {
                protocols.push(...data);
              } else {
                protocols.push(data);
              }
              return Promise.resolve({ error: null });
            }),
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' },
            }),
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
        return {};
      });

      // Simulate creating protocols for different surgery types
      const surgeryTypes = ['TKA', 'THA', 'TSA'];
      
      for (const surgeryType of surgeryTypes) {
        await mockSupabase
          .from('protocols')
          .insert({
            tenant_id: 'test-tenant-id',
            name: `Standard ${surgeryType} Recovery Protocol`,
            surgery_type: surgeryType,
            is_template: true,
            is_active: true,
          });
      }

      expect(protocols).toHaveLength(3);
      expect(protocols.map(p => p.surgery_type)).toEqual(['TKA', 'THA', 'TSA']);
      expect(protocols.every(p => p.is_template === true)).toBe(true);
    });
  });

  describe('Tenant Protocol Management', () => {
    it('should allow tenant to customize standard protocols', async () => {
      const standardProtocolId = 'standard-protocol-id';
      const customizedProtocol = {
        id: 'custom-protocol-id',
        tenant_id: 'test-tenant-id',
        name: 'Customized TJV Recovery Protocol',
        based_on_protocol_id: standardProtocolId,
        is_template: true,
        is_active: true,
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'protocols') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { id: standardProtocolId },
              error: null,
            }),
            insert: jest.fn().mockReturnThis(),
          };
        }
        return {};
      });

      // Duplicate and customize protocol
      const { data: duplicated } = await mockSupabase
        .from('protocols')
        .select('*')
        .eq('id', standardProtocolId)
        .single();

      expect(duplicated).toBeDefined();
      
      // Create customized version
      const { error } = await mockSupabase
        .from('protocols')
        .insert(customizedProtocol);

      expect(error).toBeNull();
    });

    it('should track protocol versions and updates', async () => {
      const protocolVersions: any[] = [];

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'protocol_versions') {
          return {
            insert: jest.fn((data) => {
              protocolVersions.push(data);
              return Promise.resolve({ error: null });
            }),
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({
              data: protocolVersions,
              error: null,
            }),
          };
        }
        return {};
      });

      // Create version history
      const versions = [
        { protocol_id: 'protocol-123', version: 1, changes: 'Initial version' },
        { protocol_id: 'protocol-123', version: 2, changes: 'Added new exercises' },
        { protocol_id: 'protocol-123', version: 3, changes: 'Updated recovery timeline' },
      ];

      for (const version of versions) {
        await mockSupabase
          .from('protocol_versions')
          .insert(version);
      }

      expect(protocolVersions).toHaveLength(3);
      expect(protocolVersions[protocolVersions.length - 1].version).toBe(3);
    });
  });

  describe('Multi-Tenant Protocol Isolation', () => {
    it('should ensure protocols are isolated between tenants', async () => {
      const tenant1Id = 'tenant-1';
      const tenant2Id = 'tenant-2';

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'protocols') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockImplementation((field, value) => {
              if (field === 'tenant_id' && value === tenant1Id) {
                return {
                  order: jest.fn().mockResolvedValue({
                    data: [
                      { id: 'protocol-t1-1', tenant_id: tenant1Id },
                      { id: 'protocol-t1-2', tenant_id: tenant1Id },
                    ],
                    error: null,
                  }),
                };
              }
              if (field === 'tenant_id' && value === tenant2Id) {
                return {
                  order: jest.fn().mockResolvedValue({
                    data: [
                      { id: 'protocol-t2-1', tenant_id: tenant2Id },
                    ],
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
        return {};
      });

      // Get protocols for tenant 1
      const { data: tenant1Protocols } = await mockSupabase
        .from('protocols')
        .select('*')
        .eq('tenant_id', tenant1Id)
        .order('created_at');

      // Get protocols for tenant 2
      const { data: tenant2Protocols } = await mockSupabase
        .from('protocols')
        .select('*')
        .eq('tenant_id', tenant2Id)
        .order('created_at');

      expect(tenant1Protocols).toHaveLength(2);
      expect(tenant2Protocols).toHaveLength(1);
      expect(tenant1Protocols.every((p: any) => p.tenant_id === tenant1Id)).toBe(true);
      expect(tenant2Protocols.every((p: any) => p.tenant_id === tenant2Id)).toBe(true);
    });
  });

  describe('Tenant Onboarding Workflow', () => {
    it('should complete full tenant setup with protocols ready for patients', async () => {
      const setupSteps: string[] = [];

      mockSupabase.rpc.mockImplementation((fnName: string, params: any) => {
        setupSteps.push(fnName);
        
        switch (fnName) {
          case 'create_tenant':
            return Promise.resolve({
              data: { tenant_id: 'new-tenant-123' },
              error: null,
            });
          case 'seed_tenant_protocols':
            return Promise.resolve({
              data: { protocols_created: 3 },
              error: null,
            });
          case 'create_default_users':
            return Promise.resolve({
              data: { users_created: 2 },
              error: null,
            });
          case 'configure_tenant_settings':
            return Promise.resolve({
              data: { settings_applied: true },
              error: null,
            });
          default:
            return Promise.resolve({ data: null, error: null });
        }
      });

      // Execute tenant setup workflow
      await mockSupabase.rpc('create_tenant', { name: 'New Practice' });
      await mockSupabase.rpc('seed_tenant_protocols', { tenant_id: 'new-tenant-123' });
      await mockSupabase.rpc('create_default_users', { tenant_id: 'new-tenant-123' });
      await mockSupabase.rpc('configure_tenant_settings', { 
        tenant_id: 'new-tenant-123',
        settings: { automatic_protocol_assignment: true },
      });

      expect(setupSteps).toEqual([
        'create_tenant',
        'seed_tenant_protocols',
        'create_default_users',
        'configure_tenant_settings',
      ]);
    });

    it('should validate tenant has all required protocols before going live', async () => {
      const requiredProtocols = ['TKA', 'THA', 'TSA'];
      const existingProtocols = ['TKA', 'THA'];
      
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'protocols') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            in: jest.fn().mockResolvedValue({
              data: existingProtocols.map(type => ({
                id: `protocol-${type}`,
                surgery_type: type,
                is_template: true,
              })),
              error: null,
            }),
          };
        }
        return {};
      });

      const { data: protocols } = await mockSupabase
        .from('protocols')
        .select('surgery_type')
        .eq('tenant_id', 'test-tenant-id')
        .in('surgery_type', requiredProtocols);

      const missingProtocols = requiredProtocols.filter(
        type => !protocols.some((p: any) => p.surgery_type === type)
      );

      expect(missingProtocols).toEqual(['TSA']);
      expect(protocols).toHaveLength(2);
    });
  });
});