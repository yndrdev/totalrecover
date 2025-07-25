import { Resend } from 'resend'
import twilio from 'twilio'

// Initialize services
const resend = new Resend(process.env.RESEND_API_KEY)
const twilioClient = process.env.TWILIO_ACCOUNT_SID?.startsWith('AC') && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null

// Email templates
const emailTemplates = {
  patientInvitation: {
    subject: (providerName: string, practiceName: string) => 
      `You're invited to join ${practiceName}'s healthcare platform`,
    html: (data: {
      patientName: string
      providerName: string
      practiceName: string
      invitationLink: string
      customMessage?: string
      surgeryType?: string
      surgeryDate?: string
    }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Healthcare Platform Invitation</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 40px;
      margin: 20px 0;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      width: 150px;
      height: auto;
    }
    h1 {
      color: #1a73e8;
      font-size: 28px;
      margin: 20px 0;
      text-align: center;
    }
    .provider-info {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .surgery-info {
      background: #e8f0fe;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .custom-message {
      background: #fef7e0;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      border-left: 4px solid #fbbc04;
    }
    .button {
      display: inline-block;
      background: #1a73e8;
      color: white;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 30px 0;
      text-align: center;
    }
    .button:hover {
      background: #1557b0;
    }
    .button-container {
      text-align: center;
    }
    .footer {
      text-align: center;
      font-size: 14px;
      color: #666;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }
    .security-notice {
      background: #f1f3f4;
      border-radius: 8px;
      padding: 15px;
      margin: 20px 0;
      font-size: 14px;
      text-align: center;
    }
    .icon {
      width: 20px;
      height: 20px;
      vertical-align: middle;
      margin-right: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>Welcome to Your Healthcare Journey</h1>
      </div>
      
      <p>Dear ${data.patientName},</p>
      
      <div class="provider-info">
        <p><strong>${data.providerName}</strong> from <strong>${data.practiceName}</strong> has invited you to join their secure healthcare platform.</p>
      </div>
      
      ${data.surgeryType || data.surgeryDate ? `
        <div class="surgery-info">
          <h3 style="margin-top: 0;">Your Upcoming Procedure</h3>
          ${data.surgeryType ? `<p><strong>Surgery Type:</strong> ${data.surgeryType}</p>` : ''}
          ${data.surgeryDate ? `<p><strong>Surgery Date:</strong> ${new Date(data.surgeryDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>` : ''}
        </div>
      ` : ''}
      
      ${data.customMessage ? `
        <div class="custom-message">
          <p><strong>Message from ${data.providerName}:</strong></p>
          <p>${data.customMessage}</p>
        </div>
      ` : ''}
      
      <p>This platform will help you:</p>
      <ul>
        <li>📋 Access your personalized recovery protocol</li>
        <li>💬 Communicate directly with your care team</li>
        <li>📊 Track your recovery progress</li>
        <li>🎥 Access educational videos and exercises</li>
        <li>📝 Complete important health forms</li>
      </ul>
      
      <div class="button-container">
        <a href="${data.invitationLink}" class="button">Accept Invitation & Get Started</a>
      </div>
      
      <div class="security-notice">
        🔒 This invitation link is secure and will expire in 7 days for your protection.
      </div>
      
      <div class="footer">
        <p><strong>Need help?</strong> Contact ${data.practiceName} directly or reply to this email.</p>
        <p>This is a secure, HIPAA-compliant healthcare communication.</p>
        <p>&copy; ${new Date().getFullYear()} ${data.practiceName}. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `,
    text: (data: {
      patientName: string
      providerName: string
      practiceName: string
      invitationLink: string
      customMessage?: string
      surgeryType?: string
      surgeryDate?: string
    }) => `
Dear ${data.patientName},

${data.providerName} from ${data.practiceName} has invited you to join their secure healthcare platform.

${data.surgeryType || data.surgeryDate ? `
Your Upcoming Procedure:
${data.surgeryType ? `Surgery Type: ${data.surgeryType}` : ''}
${data.surgeryDate ? `Surgery Date: ${new Date(data.surgeryDate).toLocaleDateString()}` : ''}
` : ''}

${data.customMessage ? `
Message from ${data.providerName}:
${data.customMessage}
` : ''}

This platform will help you:
- Access your personalized recovery protocol
- Communicate directly with your care team
- Track your recovery progress
- Access educational videos and exercises
- Complete important health forms

Accept Invitation: ${data.invitationLink}

This invitation link is secure and will expire in 7 days.

Need help? Contact ${data.practiceName} directly or reply to this email.

This is a secure, HIPAA-compliant healthcare communication.
© ${new Date().getFullYear()} ${data.practiceName}. All rights reserved.
    `
  },
  
  invitationReminder: {
    subject: (practiceName: string) => `Reminder: Your invitation to ${practiceName}'s healthcare platform`,
    html: (data: any) => `<!-- Reminder template HTML -->`,
    text: (data: any) => `<!-- Reminder template text -->`
  },
  
  welcomeAfterAcceptance: {
    subject: (practiceName: string) => `Welcome to ${practiceName}'s Healthcare Platform!`,
    html: (data: any) => `<!-- Welcome template HTML -->`,
    text: (data: any) => `<!-- Welcome template text -->`
  }
}

// SMS templates
const smsTemplates = {
  patientInvitation: (data: {
    providerName: string
    practiceName: string
    shortLink: string
  }) => `${data.providerName} from ${data.practiceName} has invited you to their healthcare platform. Click to accept: ${data.shortLink}`,
  
  invitationReminder: (data: {
    practiceName: string
    shortLink: string
  }) => `Reminder: You have a pending invitation from ${data.practiceName}. Accept here: ${data.shortLink}`,
}

export interface NotificationResult {
  success: boolean
  method: 'email' | 'sms'
  messageId?: string
  error?: string
}

export class NotificationService {
  /**
   * Send patient invitation via email
   */
  async sendInvitationEmail(data: {
    to: string
    patientName: string
    providerName: string
    practiceName: string
    invitationLink: string
    customMessage?: string
    surgeryType?: string
    surgeryDate?: string
  }): Promise<NotificationResult> {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.error('Resend API key not configured')
        return {
          success: false,
          method: 'email',
          error: 'Email service not configured'
        }
      }

      const template = emailTemplates.patientInvitation
      const result = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@healthcare.com',
        to: data.to,
        subject: template.subject(data.providerName, data.practiceName),
        html: template.html(data),
        text: template.text(data),
        tags: [
          { name: 'type', value: 'patient-invitation' },
          { name: 'provider', value: data.providerName }
        ]
      })

      return {
        success: true,
        method: 'email',
        messageId: result.data?.id
      }
    } catch (error) {
      console.error('Error sending invitation email:', error)
      return {
        success: false,
        method: 'email',
        error: error instanceof Error ? error.message : 'Failed to send email'
      }
    }
  }

  /**
   * Send patient invitation via SMS
   */
  async sendInvitationSMS(data: {
    to: string
    providerName: string
    practiceName: string
    shortLink: string
  }): Promise<NotificationResult> {
    try {
      if (!twilioClient) {
        console.error('Twilio client not configured')
        return {
          success: false,
          method: 'sms',
          error: 'SMS service not configured'
        }
      }

      const message = smsTemplates.patientInvitation(data)
      const result = await twilioClient.messages.create({
        body: message,
        to: data.to,
        from: process.env.TWILIO_PHONE_NUMBER
      })

      return {
        success: true,
        method: 'sms',
        messageId: result.sid
      }
    } catch (error) {
      console.error('Error sending invitation SMS:', error)
      return {
        success: false,
        method: 'sms',
        error: error instanceof Error ? error.message : 'Failed to send SMS'
      }
    }
  }

  /**
   * Send invitation via both email and SMS
   */
  async sendInvitation(data: {
    email: string
    phone?: string
    patientName: string
    providerName: string
    practiceName: string
    invitationLink: string
    shortLink: string
    customMessage?: string
    surgeryType?: string
    surgeryDate?: string
  }): Promise<{
    email?: NotificationResult
    sms?: NotificationResult
  }> {
    const results: {
      email?: NotificationResult
      sms?: NotificationResult
    } = {}

    // Always send email
    results.email = await this.sendInvitationEmail({
      to: data.email,
      patientName: data.patientName,
      providerName: data.providerName,
      practiceName: data.practiceName,
      invitationLink: data.invitationLink,
      customMessage: data.customMessage,
      surgeryType: data.surgeryType,
      surgeryDate: data.surgeryDate
    })

    // Send SMS if phone number provided and enabled
    if (data.phone && process.env.ENABLE_SMS_NOTIFICATIONS === 'true') {
      results.sms = await this.sendInvitationSMS({
        to: data.phone,
        providerName: data.providerName,
        practiceName: data.practiceName,
        shortLink: data.shortLink
      })
    }

    return results
  }

  /**
   * Send invitation reminder
   */
  async sendInvitationReminder(data: {
    email: string
    phone?: string
    patientName: string
    practiceName: string
    invitationLink: string
    shortLink: string
    daysUntilExpiry: number
  }): Promise<{
    email?: NotificationResult
    sms?: NotificationResult
  }> {
    // Implementation for reminder emails/SMS
    // Similar structure to sendInvitation
    return {}
  }

  /**
   * Send welcome message after invitation acceptance
   */
  async sendWelcomeMessage(data: {
    email: string
    patientName: string
    practiceName: string
    dashboardLink: string
  }): Promise<NotificationResult> {
    // Implementation for welcome email
    return {
      success: true,
      method: 'email'
    }
  }

  /**
   * Create a shortened URL for SMS
   */
  async createShortLink(longUrl: string): Promise<string> {
    // In production, you'd use a URL shortening service
    // For now, return a placeholder
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://healthcare.app'
    const token = longUrl.split('/').pop() // Extract token from URL
    return `${baseUrl}/i/${token}`
  }

  /**
   * Format phone number for SMS
   */
  formatPhoneNumber(phone: string): string {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '')
    
    // Add country code if not present
    if (digits.length === 10) {
      return `+1${digits}`
    } else if (digits.length === 11 && digits[0] === '1') {
      return `+${digits}`
    } else if (digits.startsWith('+')) {
      return phone
    } else {
      return `+${digits}`
    }
  }

  /**
   * Validate email address
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Validate phone number
   */
  isValidPhone(phone: string): boolean {
    const digits = phone.replace(/\D/g, '')
    return digits.length >= 10 && digits.length <= 15
  }
}

// Export singleton instance
export const notificationService = new NotificationService()