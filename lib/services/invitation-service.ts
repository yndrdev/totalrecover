import { createClient } from '@/lib/supabase-browser'

// Define types directly until database types are regenerated
interface PatientInvitation {
  id: string
  tenant_id: string
  practice_id?: string
  provider_id: string
  invitation_token: string
  email: string
  phone?: string
  first_name: string
  last_name: string
  date_of_birth?: string | null
  surgery_type?: string | null
  surgery_date?: string | null
  custom_message?: string | null
  status: 'pending' | 'sent' | 'opened' | 'accepted' | 'expired' | 'cancelled'
  sent_via: string[]
  sent_at?: string
  opened_at?: string
  accepted_at?: string
  expires_at: string
  email_delivery_status: any
  sms_delivery_status: any
  metadata: any
  created_patient_id?: string
  created_user_id?: string
  created_at: string
  updated_at: string
  created_by?: string
}

type PatientInvitationInsert = {
  id?: string
  tenant_id: string
  practice_id?: string | null
  provider_id: string
  invitation_token: string
  email: string
  phone?: string | null
  first_name: string
  last_name: string
  date_of_birth?: string | null
  surgery_type?: string | null
  surgery_date?: string | null
  custom_message?: string | null
  status?: 'pending' | 'sent' | 'opened' | 'accepted' | 'expired' | 'cancelled'
  sent_via?: string[]
  sent_at?: string | null
  opened_at?: string | null
  accepted_at?: string | null
  expires_at?: string
  email_delivery_status?: any
  sms_delivery_status?: any
  metadata?: any
  created_patient_id?: string | null
  created_user_id?: string | null
  created_at?: string
  updated_at?: string
  created_by?: string | null
}

type PatientInvitationUpdate = Partial<PatientInvitationInsert>

export interface InvitationData {
  email: string
  phone?: string
  firstName: string
  lastName: string
  dateOfBirth?: Date
  surgeryType?: string
  surgeryDate?: Date
  customMessage?: string
}

export interface BatchInvitationData {
  invitations: InvitationData[]
  providerId: string
  tenantId: string
  practiceId?: string
}

export interface InvitationResult {
  success: boolean
  invitation?: PatientInvitation
  error?: string
}

export interface BatchInvitationResult {
  successful: InvitationResult[]
  failed: InvitationResult[]
  totalSent: number
  totalFailed: number
}

export class InvitationService {
  private supabase = createClient()

  /**
   * Generate a secure invitation token
   */
  private generateToken(): string {
    // In browser environment, we'll use a UUID-like token
    return 'inv_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  /**
   * Create a single patient invitation
   */
  async createInvitation(
    data: InvitationData,
    providerId: string,
    tenantId: string,
    practiceId?: string
  ): Promise<InvitationResult> {
    try {
      // Check if invitation already exists for this email
      const { data: existing } = await this.supabase
        .from('patient_invitations')
        .select('id, status')
        .eq('email', data.email)
        .eq('tenant_id', tenantId)
        .in('status', ['pending', 'sent'])
        .single()

      if (existing) {
        return {
          success: false,
          error: 'An active invitation already exists for this email'
        }
      }

      // Create new invitation
      const invitationData: PatientInvitationInsert = {
        tenant_id: tenantId,
        practice_id: practiceId,
        provider_id: providerId,
        invitation_token: this.generateToken(),
        email: data.email,
        phone: data.phone,
        first_name: data.firstName,
        last_name: data.lastName,
        date_of_birth: data.dateOfBirth ? data.dateOfBirth.toISOString().split('T')[0] : null,
        surgery_type: data.surgeryType,
        surgery_date: data.surgeryDate ? data.surgeryDate.toISOString().split('T')[0] : null,
        custom_message: data.customMessage,
        status: 'pending'
      }

      const { data: invitation, error } = await this.supabase
        .from('patient_invitations')
        .insert(invitationData)
        .select()
        .single()

      if (error) {
        console.error('Error creating invitation:', error)
        return {
          success: false,
          error: 'Failed to create invitation'
        }
      }

      return {
        success: true,
        invitation
      }
    } catch (error) {
      console.error('Error in createInvitation:', error)
      return {
        success: false,
        error: 'An unexpected error occurred'
      }
    }
  }

  /**
   * Create multiple patient invitations
   */
  async createBatchInvitations(
    batchData: BatchInvitationData
  ): Promise<BatchInvitationResult> {
    const results: BatchInvitationResult = {
      successful: [],
      failed: [],
      totalSent: 0,
      totalFailed: 0
    }

    for (const invitation of batchData.invitations) {
      const result = await this.createInvitation(
        invitation,
        batchData.providerId,
        batchData.tenantId,
        batchData.practiceId
      )

      if (result.success) {
        results.successful.push(result)
        results.totalSent++
      } else {
        results.failed.push(result)
        results.totalFailed++
      }
    }

    return results
  }

  /**
   * Get invitation by token
   */
  async getInvitationByToken(token: string): Promise<PatientInvitation | null> {
    try {
      const { data, error } = await this.supabase
        .from('patient_invitations')
        .select('*')
        .eq('invitation_token', token)
        .single()

      if (error || !data) {
        return null
      }

      return data
    } catch (error) {
      console.error('Error getting invitation by token:', error)
      return null
    }
  }

  /**
   * Validate invitation token
   */
  async validateInvitation(token: string): Promise<{
    valid: boolean
    invitation?: PatientInvitation
    error?: string
  }> {
    try {
      const invitation = await this.getInvitationByToken(token)

      if (!invitation) {
        return {
          valid: false,
          error: 'Invalid invitation token'
        }
      }

      // Check if invitation is expired
      if (new Date(invitation.expires_at) < new Date()) {
        return {
          valid: false,
          error: 'Invitation has expired'
        }
      }

      // Check if invitation is already accepted
      if (invitation.status === 'accepted') {
        return {
          valid: false,
          error: 'Invitation has already been accepted'
        }
      }

      // Check if invitation is cancelled
      if (invitation.status === 'cancelled') {
        return {
          valid: false,
          error: 'Invitation has been cancelled'
        }
      }

      return {
        valid: true,
        invitation
      }
    } catch (error) {
      console.error('Error validating invitation:', error)
      return {
        valid: false,
        error: 'Failed to validate invitation'
      }
    }
  }

  /**
   * Update invitation status
   */
  async updateInvitationStatus(
    invitationId: string,
    status: 'sent' | 'opened' | 'accepted' | 'expired' | 'cancelled',
    additionalData?: Partial<PatientInvitationUpdate>
  ): Promise<boolean> {
    try {
      const updateData: PatientInvitationUpdate = {
        status,
        ...additionalData
      }

      // Add timestamp based on status
      switch (status) {
        case 'sent':
          updateData.sent_at = new Date().toISOString()
          break
        case 'opened':
          updateData.opened_at = new Date().toISOString()
          break
        case 'accepted':
          updateData.accepted_at = new Date().toISOString()
          break
      }

      const { error } = await this.supabase
        .from('patient_invitations')
        .update(updateData)
        .eq('id', invitationId)

      if (error) {
        console.error('Error updating invitation status:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updateInvitationStatus:', error)
      return false
    }
  }

  /**
   * Mark invitation as opened
   */
  async markInvitationOpened(token: string): Promise<boolean> {
    try {
      const invitation = await this.getInvitationByToken(token)
      if (!invitation) return false

      // Only update if status is 'sent' or 'pending'
      if (invitation.status === 'pending' || invitation.status === 'sent') {
        return await this.updateInvitationStatus(invitation.id, 'opened')
      }

      return true
    } catch (error) {
      console.error('Error marking invitation opened:', error)
      return false
    }
  }

  /**
   * Get invitations for a provider
   */
  async getProviderInvitations(
    providerId: string,
    filters?: {
      status?: string[]
      startDate?: Date
      endDate?: Date
      limit?: number
      offset?: number
    }
  ): Promise<{ invitations: PatientInvitation[]; total: number }> {
    try {
      let query = this.supabase
        .from('patient_invitations')
        .select('*', { count: 'exact' })
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false })

      if (filters?.status && filters.status.length > 0) {
        query = query.in('status', filters.status)
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString())
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString())
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }

      const { data, error, count } = await query

      if (error) {
        console.error('Error getting provider invitations:', error)
        return { invitations: [], total: 0 }
      }

      return {
        invitations: data || [],
        total: count || 0
      }
    } catch (error) {
      console.error('Error in getProviderInvitations:', error)
      return { invitations: [], total: 0 }
    }
  }

  /**
   * Cancel invitation
   */
  async cancelInvitation(invitationId: string): Promise<boolean> {
    return await this.updateInvitationStatus(invitationId, 'cancelled')
  }

  /**
   * Resend invitation (creates a new token and resets expiry)
   */
  async resendInvitation(invitationId: string): Promise<InvitationResult> {
    try {
      const { data: invitation, error } = await this.supabase
        .from('patient_invitations')
        .select('*')
        .eq('id', invitationId)
        .single()

      if (error || !invitation) {
        return {
          success: false,
          error: 'Invitation not found'
        }
      }

      if (invitation.status === 'accepted') {
        return {
          success: false,
          error: 'Cannot resend accepted invitation'
        }
      }

      // Generate new token and update expiry
      const newToken = this.generateToken()
      const newExpiry = new Date()
      newExpiry.setDate(newExpiry.getDate() + 7) // 7 days from now

      const { data: updated, error: updateError } = await this.supabase
        .from('patient_invitations')
        .update({
          invitation_token: newToken,
          expires_at: newExpiry.toISOString(),
          status: 'pending',
          sent_at: null,
          opened_at: null
        })
        .eq('id', invitationId)
        .select()
        .single()

      if (updateError || !updated) {
        return {
          success: false,
          error: 'Failed to resend invitation'
        }
      }

      return {
        success: true,
        invitation: updated
      }
    } catch (error) {
      console.error('Error resending invitation:', error)
      return {
        success: false,
        error: 'An unexpected error occurred'
      }
    }
  }

  /**
   * Get invitation statistics for a provider
   */
  async getInvitationStats(providerId: string): Promise<{
    total: number
    pending: number
    sent: number
    opened: number
    accepted: number
    expired: number
    cancelled: number
  }> {
    try {
      const { data, error } = await this.supabase
        .from('patient_invitations')
        .select('status')
        .eq('provider_id', providerId)

      if (error || !data) {
        return {
          total: 0,
          pending: 0,
          sent: 0,
          opened: 0,
          accepted: 0,
          expired: 0,
          cancelled: 0
        }
      }

      const stats = {
        total: data.length,
        pending: 0,
        sent: 0,
        opened: 0,
        accepted: 0,
        expired: 0,
        cancelled: 0
      }

      data.forEach(invitation => {
        switch (invitation.status) {
          case 'pending':
            stats.pending++
            break
          case 'sent':
            stats.sent++
            break
          case 'opened':
            stats.opened++
            break
          case 'accepted':
            stats.accepted++
            break
          case 'expired':
            stats.expired++
            break
          case 'cancelled':
            stats.cancelled++
            break
        }
      })

      return stats
    } catch (error) {
      console.error('Error getting invitation stats:', error)
      return {
        total: 0,
        pending: 0,
        sent: 0,
        opened: 0,
        accepted: 0,
        expired: 0,
        cancelled: 0
      }
    }
  }
}

// Export singleton instance
export const invitationService = new InvitationService()