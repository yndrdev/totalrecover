import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set environment variables for tests
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key';

// Mock Supabase client for testing
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
    })),
    rpc: jest.fn(),
  })),
}));

// Also mock the browser client
jest.mock('@/lib/supabase-browser', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
    })),
    rpc: jest.fn(),
  })),
}));

// Global test utilities
global.testHelpers = {
  createMockUser: (overrides = {}) => ({
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'patient',
    ...overrides,
  }),
  
  createMockPatient: (overrides = {}) => ({
    id: 'test-patient-id',
    profile_id: 'test-user-id',
    tenant_id: 'test-tenant-id',
    mrn: 'PAT-12345',
    surgery_date: '2025-02-01',
    surgery_type: 'TKA',
    status: 'active',
    ...overrides,
  }),
  
  createMockProtocol: (overrides = {}) => ({
    id: 'test-protocol-id',
    tenant_id: 'test-tenant-id',
    name: 'Standard TJV Recovery Protocol',
    description: 'Test protocol',
    is_template: true,
    is_active: true,
    ...overrides,
  }),
  
  createMockTenant: (overrides = {}) => ({
    id: 'test-tenant-id',
    name: 'Test Healthcare',
    settings: {},
    ...overrides,
  }),
};

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Increase timeout for integration tests
jest.setTimeout(30000);