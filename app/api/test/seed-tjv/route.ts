import { NextResponse } from 'next/server';
import { TestProtocolSeeder } from '@/lib/services/test-protocol-seeder';

export async function POST() {
  try {
    // Create a test tenant ID for seeding without authentication
    const testTenantId = `test-tenant-${Date.now()}`;
    
    const seeder = new TestProtocolSeeder();
    const result = await seeder.seedTJVProtocolForTesting(testTenantId);
    
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to seed protocol'
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'TJV protocol seeded successfully',
      data: {
        protocolId: result.protocolId,
        tasksCreated: result.tasksCreated,
        details: result.details,
        testTenantId
      }
    });
  } catch (error) {
    console.error('Error seeding TJV protocol:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to seed protocol'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to seed the TJV protocol',
    endpoint: '/api/test/seed-tjv'
  });
}