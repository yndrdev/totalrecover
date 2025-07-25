import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withTenantIsolation, logAuditEvent } from '@/middleware/tenant-isolation'
import { checkPermission, filterDataByRole, sanitizeDataByRole } from '@/lib/security/rbac'

export async function GET(request: NextRequest) {
  return withTenantIsolation(request, async (req, tenantId) => {
    try {
      // Check permissions
      const { allowed, error: permError, userRole } = await checkPermission('patients', 'read')
      if (!allowed) {
        return NextResponse.json({ error: permError }, { status: 403 })
      }

      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      // Parse query parameters
      const { searchParams } = new URL(req.url)
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '10')
      const search = searchParams.get('search') || ''
      const status = searchParams.get('status') || 'all'
      
      // Build query with tenant isolation
      let query = supabase
        .from('patients')
        .select(`
          *,
          profile:profiles!patients_profile_id_fkey(
            id,
            email,
            first_name,
            last_name
          )
        `, { count: 'exact' })
        .eq('tenant_id', tenantId) // Tenant isolation

      // Apply search filter
      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,mrn.ilike.%${search}%`)
      }

      // Apply status filter
      if (status !== 'all') {
        query = query.eq('status', status)
      }

      // Apply pagination
      const start = (page - 1) * limit
      const end = start + limit - 1
      
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(start, end)

      if (error) {
        console.error('Error fetching patients:', error)
        return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 })
      }

      // Filter and sanitize data based on role
      const filteredData = filterDataByRole(data || [], userRole!, user!.id, 'patients')
      const sanitizedData = sanitizeDataByRole(filteredData, userRole!, 'patients')

      // Log audit event
      await logAuditEvent({
        userId: user!.id,
        tenantId,
        action: 'view_patients',
        resourceType: 'patients',
        metadata: { page, limit, search, status }
      })

      return NextResponse.json({
        patients: sanitizedData,
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      })
    } catch (error) {
      console.error('Error in patients GET:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

export async function POST(request: NextRequest) {
  return withTenantIsolation(request, async (req, tenantId) => {
    try {
      // Check permissions
      const { allowed, error: permError } = await checkPermission('patients', 'create')
      if (!allowed) {
        return NextResponse.json({ error: permError }, { status: 403 })
      }

      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const body = await req.json()

      // Validate required fields
      const requiredFields = ['first_name', 'last_name', 'date_of_birth', 'email']
      for (const field of requiredFields) {
        if (!body[field]) {
          return NextResponse.json(
            { error: `${field} is required` },
            { status: 400 }
          )
        }
      }

      // Create auth user for the patient
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: body.email,
        password: Math.random().toString(36).slice(-8), // Generate temp password
        options: {
          data: {
            full_name: `${body.first_name} ${body.last_name}`,
            role: 'patient',
            tenant_id: tenantId
          }
        }
      })

      if (authError) {
        console.error('Error creating auth user:', authError)
        return NextResponse.json(
          { error: 'Failed to create user account' },
          { status: 400 }
        )
      }

      // Create user record
      const { error: userError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user!.id,
          email: body.email,
          first_name: body.first_name,
          last_name: body.last_name,
          full_name: `${body.first_name} ${body.last_name}`,
          role: 'patient',
          tenant_id: tenantId,
          phone: body.phone,
          date_of_birth: body.date_of_birth
        })

      if (userError) {
        console.error('Error creating user record:', userError)
        return NextResponse.json(
          { error: 'Failed to create user record' },
          { status: 400 }
        )
      }

      // Generate MRN (Medical Record Number)
      const mrn = `MRN-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

      // Create patient record
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .insert({
          ...body,
          profile_id: authData.user!.id,  // Changed from user_id to profile_id
          tenant_id: tenantId,
          mrn: mrn,
          status: 'active',
          created_by: user!.id
        })
        .select()
        .single()

      if (patientError) {
        console.error('Error creating patient:', patientError)
        return NextResponse.json(
          { error: 'Failed to create patient record' },
          { status: 400 }
        )
      }

      // Log audit event
      await logAuditEvent({
        userId: user!.id,
        tenantId,
        action: 'create_patient',
        resourceType: 'patients',
        resourceId: patient.id,
        metadata: { patient_name: `${body.first_name} ${body.last_name}` }
      })

      return NextResponse.json(patient, { status: 201 })
    } catch (error) {
      console.error('Error in patients POST:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

export async function PUT(request: NextRequest) {
  return withTenantIsolation(request, async (req, tenantId) => {
    try {
      // Check permissions
      const { allowed, error: permError } = await checkPermission('patients', 'update')
      if (!allowed) {
        return NextResponse.json({ error: permError }, { status: 403 })
      }

      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const body = await req.json()
      
      if (!body.id) {
        return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 })
      }

      // Verify patient belongs to tenant
      const { data: existingPatient } = await supabase
        .from('patients')
        .select('tenant_id')
        .eq('id', body.id)
        .single()

      if (!existingPatient || existingPatient.tenant_id !== tenantId) {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
      }

      // Update patient
      const { data: patient, error } = await supabase
        .from('patients')
        .update({
          ...body,
          updated_at: new Date().toISOString(),
          updated_by: user!.id
        })
        .eq('id', body.id)
        .eq('tenant_id', tenantId) // Ensure tenant isolation
        .select()
        .single()

      if (error) {
        console.error('Error updating patient:', error)
        return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 })
      }

      // Log audit event
      await logAuditEvent({
        userId: user!.id,
        tenantId,
        action: 'update_patient',
        resourceType: 'patients',
        resourceId: body.id,
        metadata: { changes: body }
      })

      return NextResponse.json(patient)
    } catch (error) {
      console.error('Error in patients PUT:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

export async function DELETE(request: NextRequest) {
  return withTenantIsolation(request, async (req, tenantId) => {
    try {
      // Check permissions
      const { allowed, error: permError } = await checkPermission('patients', 'delete')
      if (!allowed) {
        return NextResponse.json({ error: permError }, { status: 403 })
      }

      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      const { searchParams } = new URL(req.url)
      const patientId = searchParams.get('id')
      
      if (!patientId) {
        return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 })
      }

      // Verify patient belongs to tenant
      const { data: existingPatient } = await supabase
        .from('patients')
        .select('tenant_id, first_name, last_name')
        .eq('id', patientId)
        .single()

      if (!existingPatient || existingPatient.tenant_id !== tenantId) {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
      }

      // Soft delete by setting status to inactive
      const { error } = await supabase
        .from('patients')
        .update({ 
          status: 'inactive',
          updated_at: new Date().toISOString(),
          updated_by: user!.id
        })
        .eq('id', patientId)
        .eq('tenant_id', tenantId) // Ensure tenant isolation

      if (error) {
        console.error('Error deleting patient:', error)
        return NextResponse.json({ error: 'Failed to delete patient' }, { status: 500 })
      }

      // Log audit event
      await logAuditEvent({
        userId: user!.id,
        tenantId,
        action: 'delete_patient',
        resourceType: 'patients',
        resourceId: patientId,
        metadata: { 
          patient_name: `${existingPatient.first_name} ${existingPatient.last_name}` 
        }
      })

      return NextResponse.json({ message: 'Patient deleted successfully' })
    } catch (error) {
      console.error('Error in patients DELETE:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}