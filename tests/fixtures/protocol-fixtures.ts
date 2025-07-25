export const protocolFixtures = {
  standardTJVProtocol: {
    id: 'protocol-tjv-standard',
    tenant_id: 'test-tenant-id',
    name: 'Standard TJV Recovery Protocol',
    description: 'Complete evidence-based recovery protocol for Total Joint Replacement',
    surgery_type: 'TKA',
    activity_level: 'active',
    is_template: true,
    is_active: true,
    version: 1,
    created_by: 'system',
  },

  customProtocol: {
    id: 'protocol-custom-01',
    tenant_id: 'test-tenant-id',
    name: 'Custom Recovery Protocol',
    description: 'Customized protocol for specific patient needs',
    surgery_type: 'THA',
    activity_level: 'moderate',
    is_template: false,
    is_active: true,
    version: 1,
    created_by: 'provider-01',
  },

  protocolTasks: [
    {
      id: 'task-001',
      protocol_id: 'protocol-tjv-standard',
      day: -45,
      type: 'form',
      title: 'Pre-Surgery Health Assessment',
      description: 'Complete health questionnaire',
      required: true,
      content: 'Please complete this comprehensive health assessment',
    },
    {
      id: 'task-002',
      protocol_id: 'protocol-tjv-standard',
      day: -14,
      type: 'video',
      title: 'Preparing for Surgery',
      description: 'Educational video about surgery preparation',
      required: true,
      video_url: 'https://example.com/prep-video',
      duration: '15:00',
    },
    {
      id: 'task-003',
      protocol_id: 'protocol-tjv-standard',
      day: 0,
      type: 'message',
      title: 'Surgery Day Instructions',
      description: 'Important instructions for surgery day',
      required: true,
      content: 'Welcome to your surgery day. Follow these instructions...',
    },
    {
      id: 'task-004',
      protocol_id: 'protocol-tjv-standard',
      day: 1,
      type: 'exercise',
      title: 'Ankle Pumps',
      description: 'Begin gentle ankle pump exercises',
      required: true,
      instructions: 'Flex and point your foot 10 times, repeat every hour',
    },
    {
      id: 'task-005',
      protocol_id: 'protocol-tjv-standard',
      day: 7,
      type: 'form',
      title: 'Week 1 Progress Check',
      description: 'Report your recovery progress',
      required: true,
      content: 'How has your first week of recovery been?',
    },
  ],
};

export const tenantFixtures = {
  primaryTenant: {
    id: 'tenant-primary',
    name: 'Main Healthcare System',
    settings: {
      automatic_protocol_assignment: true,
      default_protocol_id: 'protocol-tjv-standard',
      features_enabled: ['protocols', 'chat', 'forms', 'exercises'],
    },
  },
  
  secondaryTenant: {
    id: 'tenant-secondary',
    name: 'Specialty Clinic',
    settings: {
      automatic_protocol_assignment: true,
      default_protocol_id: null,
      features_enabled: ['protocols', 'chat'],
    },
  },
};

export const patientFixtures = {
  newPatient: {
    id: 'patient-new-01',
    profile_id: 'profile-patient-01',
    tenant_id: 'tenant-primary',
    mrn: 'MRN-2025-001',
    surgery_date: '2025-03-01',
    surgery_type: 'TKA',
    status: 'active',
  },
  
  existingPatient: {
    id: 'patient-existing-01',
    profile_id: 'profile-patient-02',
    tenant_id: 'tenant-primary',
    mrn: 'MRN-2024-999',
    surgery_date: '2025-01-15',
    surgery_type: 'THA',
    status: 'active',
    protocol_id: 'protocol-tjv-standard',
  },
};

export const invitationFixtures = {
  pendingInvitation: {
    id: 'invitation-01',
    tenant_id: 'tenant-primary',
    provider_id: 'provider-01',
    invitation_token: 'inv_test_token_123',
    email: 'newpatient@example.com',
    first_name: 'John',
    last_name: 'Doe',
    surgery_type: 'TKA',
    surgery_date: '2025-03-01',
    status: 'pending',
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
};