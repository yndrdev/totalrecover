'use client'

import React, { useState } from 'react'
import { DemoProtectedRoute } from '@/components/auth/demo-auth-provider'
import { DemoHealthcareLayout } from '@/components/layout/demo-healthcare-layout'
import { Card, CardContent, CardHeader } from '@/components/ui/design-system/Card'
import { Button } from '@/components/ui/design-system/Button'
import { Input } from '@/components/ui/design-system/Input'
import { Textarea } from '@/components/ui/design-system/Textarea'
import { StatusIndicator } from '@/components/ui/design-system/StatusIndicator'
import {
  Settings,
  Save,
  Users,
  Building,
  Globe,
  Shield,
  Bell,
  Database,
  FileText,
  Clock,
  Mail,
  Phone,
  MapPin,
  Check,
  X,
  Plus,
  Edit,
  Trash2
} from 'lucide-react'

interface PracticeSettings {
  general: {
    practiceName: string
    address: string
    phone: string
    email: string
    website: string
    timezone: string
    language: string
  }
  notifications: {
    emailNotifications: boolean
    smsNotifications: boolean
    appointmentReminders: boolean
    protocolAlerts: boolean
    systemUpdates: boolean
  }
  security: {
    sessionTimeout: number
    passwordExpiry: number
    requireMFA: boolean
    allowRemoteAccess: boolean
  }
  protocols: {
    defaultProtocol: string
    autoAssignProtocols: boolean
    allowCustomProtocols: boolean
    protocolApprovalRequired: boolean
  }
  integrations: {
    ehrSystem: string
    billingSystem: string
    labSystem: string
    imagingSystem: string
  }
}

const initialSettings: PracticeSettings = {
  general: {
    practiceName: 'TJV Recovery Center',
    address: '123 Medical Plaza, Suite 400, City, ST 12345',
    phone: '(555) 123-4567',
    email: 'info@tjvrecovery.com',
    website: 'www.tjvrecovery.com',
    timezone: 'America/New_York',
    language: 'English'
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: true,
    appointmentReminders: true,
    protocolAlerts: true,
    systemUpdates: false
  },
  security: {
    sessionTimeout: 30,
    passwordExpiry: 90,
    requireMFA: true,
    allowRemoteAccess: true
  },
  protocols: {
    defaultProtocol: 'Standard TJV Recovery',
    autoAssignProtocols: true,
    allowCustomProtocols: true,
    protocolApprovalRequired: false
  },
  integrations: {
    ehrSystem: 'Epic EMR',
    billingSystem: 'NextGen',
    labSystem: 'Quest Diagnostics',
    imagingSystem: 'PACS Plus'
  }
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PracticeSettings>(initialSettings)
  const [activeTab, setActiveTab] = useState('general')
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const updateSettings = (section: keyof PracticeSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    setHasChanges(false)
    // In real app, would make API call to save settings
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Building },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'protocols', label: 'Protocols', icon: FileText },
    { id: 'integrations', label: 'Integrations', icon: Database }
  ]

  return (
    <DemoProtectedRoute>
      <DemoHealthcareLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
              <p className="text-gray-600 mt-1">
                Configure practice settings and system preferences
              </p>
            </div>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              icon={<Save className="h-4 w-4" />}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          {/* Settings Navigation */}
          <Card>
            <CardContent className="p-0">
              <div className="flex border-b border-gray-200">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Settings Content */}
          <div className="grid gap-6">
            {activeTab === 'general' && (
              <GeneralSettings
                settings={settings.general}
                onChange={(field, value) => updateSettings('general', field, value)}
              />
            )}
            {activeTab === 'notifications' && (
              <NotificationSettings
                settings={settings.notifications}
                onChange={(field, value) => updateSettings('notifications', field, value)}
              />
            )}
            {activeTab === 'security' && (
              <SecuritySettings
                settings={settings.security}
                onChange={(field, value) => updateSettings('security', field, value)}
              />
            )}
            {activeTab === 'protocols' && (
              <ProtocolSettings
                settings={settings.protocols}
                onChange={(field, value) => updateSettings('protocols', field, value)}
              />
            )}
            {activeTab === 'integrations' && (
              <IntegrationSettings
                settings={settings.integrations}
                onChange={(field, value) => updateSettings('integrations', field, value)}
              />
            )}
          </div>

          {/* Save Reminder */}
          {hasChanges && (
            <div className="fixed bottom-6 right-6">
              <Card className="shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-full">
                      <Settings className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        You have unsaved changes
                      </p>
                      <p className="text-xs text-gray-600">
                        Don&apos;t forget to save your settings
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DemoHealthcareLayout>
    </DemoProtectedRoute>
  )
}

function GeneralSettings({ settings, onChange }: {
  settings: PracticeSettings['general']
  onChange: (field: string, value: string) => void
}) {
  return (
    <Card>
      <CardHeader
        title="General Settings"
        subtitle="Basic practice information and contact details"
      />
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Practice Name
          </label>
          <Input
            value={settings.practiceName}
            onChange={(e) => onChange('practiceName', e.target.value)}
            placeholder="Your Practice Name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Practice Address
          </label>
          <Textarea
            value={settings.address}
            onChange={(e) => onChange('address', e.target.value)}
            placeholder="Full practice address"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <Input
              value={settings.phone}
              onChange={(e) => onChange('phone', e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <Input
              type="email"
              value={settings.email}
              onChange={(e) => onChange('email', e.target.value)}
              placeholder="info@practice.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <Input
              value={settings.website}
              onChange={(e) => onChange('website', e.target.value)}
              placeholder="www.practice.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => onChange('timezone', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function NotificationSettings({ settings, onChange }: {
  settings: PracticeSettings['notifications']
  onChange: (field: string, value: boolean) => void
}) {
  const notificationOptions = [
    { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
    { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive notifications via text message' },
    { key: 'appointmentReminders', label: 'Appointment Reminders', description: 'Send automated appointment reminders to patients' },
    { key: 'protocolAlerts', label: 'Protocol Alerts', description: 'Get notified when protocols need attention' },
    { key: 'systemUpdates', label: 'System Updates', description: 'Receive notifications about system maintenance and updates' }
  ]

  return (
    <Card>
      <CardHeader
        title="Notification Preferences"
        subtitle="Configure how you receive system notifications and alerts"
      />
      <CardContent className="space-y-4">
        {notificationOptions.map((option) => (
          <div key={option.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">{option.label}</h4>
              <p className="text-sm text-gray-600">{option.description}</p>
            </div>
            <button
              onClick={() => onChange(option.key, !settings[option.key as keyof typeof settings])}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings[option.key as keyof typeof settings] ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings[option.key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function SecuritySettings({ settings, onChange }: {
  settings: PracticeSettings['security']
  onChange: (field: string, value: any) => void
}) {
  return (
    <Card>
      <CardHeader
        title="Security Settings"
        subtitle="Configure security policies and access controls"
      />
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout (minutes)
            </label>
            <Input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => onChange('sessionTimeout', parseInt(e.target.value))}
              placeholder="30"
            />
            <p className="text-xs text-gray-500 mt-1">
              Users will be logged out after this period of inactivity
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password Expiry (days)
            </label>
            <Input
              type="number"
              value={settings.passwordExpiry}
              onChange={(e) => onChange('passwordExpiry', parseInt(e.target.value))}
              placeholder="90"
            />
            <p className="text-xs text-gray-500 mt-1">
              Users must change passwords after this period
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">Multi-Factor Authentication</h4>
              <p className="text-sm text-gray-600">Require additional verification for login</p>
            </div>
            <button
              onClick={() => onChange('requireMFA', !settings.requireMFA)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.requireMFA ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.requireMFA ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">Remote Access</h4>
              <p className="text-sm text-gray-600">Allow staff to access system remotely</p>
            </div>
            <button
              onClick={() => onChange('allowRemoteAccess', !settings.allowRemoteAccess)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.allowRemoteAccess ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.allowRemoteAccess ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ProtocolSettings({ settings, onChange }: {
  settings: PracticeSettings['protocols']
  onChange: (field: string, value: any) => void
}) {
  const protocolOptions = [
    'Standard TJV Recovery',
    'Accelerated Recovery',
    'Conservative Approach',
    'Custom Protocol'
  ]

  return (
    <Card>
      <CardHeader
        title="Protocol Settings"
        subtitle="Configure default protocols and assignment rules"
      />
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Protocol
          </label>
          <select
            value={settings.defaultProtocol}
            onChange={(e) => onChange('defaultProtocol', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            {protocolOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            This protocol will be automatically assigned to new patients
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">Auto-Assign Protocols</h4>
              <p className="text-sm text-gray-600">Automatically assign protocols to new patients</p>
            </div>
            <button
              onClick={() => onChange('autoAssignProtocols', !settings.autoAssignProtocols)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.autoAssignProtocols ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.autoAssignProtocols ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">Allow Custom Protocols</h4>
              <p className="text-sm text-gray-600">Staff can create and modify custom protocols</p>
            </div>
            <button
              onClick={() => onChange('allowCustomProtocols', !settings.allowCustomProtocols)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.allowCustomProtocols ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.allowCustomProtocols ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">Protocol Approval Required</h4>
              <p className="text-sm text-gray-600">Custom protocols require admin approval</p>
            </div>
            <button
              onClick={() => onChange('protocolApprovalRequired', !settings.protocolApprovalRequired)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.protocolApprovalRequired ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.protocolApprovalRequired ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function IntegrationSettings({ settings, onChange }: {
  settings: PracticeSettings['integrations']
  onChange: (field: string, value: string) => void
}) {
  const integrations = [
    { key: 'ehrSystem', label: 'EHR System', options: ['Epic EMR', 'Cerner', 'Allscripts', 'eClinicalWorks', 'None'] },
    { key: 'billingSystem', label: 'Billing System', options: ['NextGen', 'AthenaHealth', 'Practice Fusion', 'Kareo', 'None'] },
    { key: 'labSystem', label: 'Laboratory System', options: ['Quest Diagnostics', 'LabCorp', 'Mayo Clinic Labs', 'Local Lab', 'None'] },
    { key: 'imagingSystem', label: 'Imaging System', options: ['PACS Plus', 'McKesson PACS', 'GE Healthcare', 'Philips IntelliSpace', 'None'] }
  ]

  return (
    <Card>
      <CardHeader
        title="System Integrations"
        subtitle="Configure connections with external healthcare systems"
      />
      <CardContent className="space-y-6">
        {integrations.map((integration) => (
          <div key={integration.key}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {integration.label}
            </label>
            <select
              value={settings[integration.key as keyof typeof settings]}
              onChange={(e) => onChange(integration.key, e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              {integration.options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        ))}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Integration Status</h4>
          <div className="space-y-2">
            {integrations.map((integration) => {
              const value = settings[integration.key as keyof typeof settings]
              const isConnected = value !== 'None'
              return (
                <div key={integration.key} className="flex items-center justify-between">
                  <span className="text-sm text-blue-800">{integration.label}</span>
                  <div className="flex items-center gap-2">
                    <StatusIndicator status={isConnected ? 'success' : 'error'} />
                    <span className="text-sm text-blue-700">
                      {isConnected ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}