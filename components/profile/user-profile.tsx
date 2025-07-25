'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  Phone, 
  Mail, 
  Calendar,
  MapPin,
  Shield,
  Activity,
  Edit2,
  Save,
  X,
  Camera,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase-browser'

interface UserProfileProps {
  userId?: string
  mode?: 'view' | 'edit'
}

export function UserProfile({ userId, mode = 'view' }: UserProfileProps) {
  const { user, userRecord, patientRecord, providerRecord, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(mode === 'edit')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Profile form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    bio: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: ''
    }
  })

  // Load current user data
  useEffect(() => {
    if (userRecord) {
      setFormData({
        full_name: userRecord.full_name || '',
        email: userRecord.email || '',
        phone: userRecord.phone || '',
        date_of_birth: userRecord.date_of_birth || '',
        gender: userRecord.gender || '',
        bio: userRecord.bio || '',
        address: {
          street: userRecord.address?.street || '',
          city: userRecord.address?.city || '',
          state: userRecord.address?.state || '',
          zip: userRecord.address?.zip || ''
        }
      })
    }
  }, [userRecord])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const result = await updateProfile({
      full_name: formData.full_name,
      phone: formData.phone,
      date_of_birth: formData.date_of_birth,
      gender: formData.gender,
      bio: formData.bio,
      address: formData.address
    })

    setLoading(false)

    if (result.success) {
      setSuccess('Profile updated successfully!')
      setIsEditing(false)
      setTimeout(() => setSuccess(null), 3000)
    } else {
      setError(result.error || 'Failed to update profile')
    }
  }

  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false)
    setError(null)
    // Reset form data
    if (userRecord) {
      setFormData({
        full_name: userRecord.full_name || '',
        email: userRecord.email || '',
        phone: userRecord.phone || '',
        date_of_birth: userRecord.date_of_birth || '',
        gender: userRecord.gender || '',
        bio: userRecord.bio || '',
        address: {
          street: userRecord.address?.street || '',
          city: userRecord.address?.city || '',
          state: userRecord.address?.state || '',
          zip: userRecord.address?.zip || ''
        }
      })
    }
  }

  if (!userRecord) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            Loading profile...
          </div>
        </CardContent>
      </Card>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'patient':
        return 'bg-blue-100 text-blue-800'
      case 'provider':
        return 'bg-purple-100 text-purple-800'
      case 'nurse':
        return 'bg-green-100 text-green-800'
      case 'admin':
        return 'bg-orange-100 text-orange-800'
      case 'super_admin':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={userRecord.avatar_url || undefined} />
                <AvatarFallback className="text-lg">
                  {getInitials(userRecord.full_name || 'User')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{userRecord.full_name || 'User'}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getRoleBadgeColor(userRecord.role)}>
                    {userRecord.role.charAt(0).toUpperCase() + userRecord.role.slice(1).replace('_', ' ')}
                  </Badge>
                  {userRecord.is_active ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-red-600 border-red-600">
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {!isEditing && user?.id === userRecord.id && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>

          {/* Alerts */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              <div className="flex items-start gap-2">
                <Activity className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p>{success}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Details */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>
                  Your basic profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        required
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{userRecord.full_name || 'Not set'}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    {isEditing ? (
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>
                          {userRecord.date_of_birth 
                            ? format(new Date(userRecord.date_of_birth), 'MMMM d, yyyy')
                            : 'Not set'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    {isEditing ? (
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => setFormData({ ...formData, gender: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-sm">
                        {userRecord.gender 
                          ? userRecord.gender.charAt(0).toUpperCase() + userRecord.gender.slice(1).replace('_', ' ')
                          : 'Not set'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  ) : (
                    <div className="text-sm text-gray-600">
                      {userRecord.bio || 'No bio provided'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  How we can reach you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{userRecord.email}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{userRecord.phone || 'Not set'}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Address</Label>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        placeholder="Street address"
                        value={formData.address.street}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          address: { ...formData.address, street: e.target.value }
                        })}
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          placeholder="City"
                          value={formData.address.city}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            address: { ...formData.address, city: e.target.value }
                          })}
                        />
                        <Input
                          placeholder="State"
                          value={formData.address.state}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            address: { ...formData.address, state: e.target.value }
                          })}
                        />
                        <Input
                          placeholder="ZIP"
                          value={formData.address.zip}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            address: { ...formData.address, zip: e.target.value }
                          })}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <span>
                        {userRecord.address?.street ? (
                          <>
                            {userRecord.address.street}<br />
                            {userRecord.address.city}, {userRecord.address.state} {userRecord.address.zip}
                          </>
                        ) : (
                          'No address provided'
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Account Status</Label>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      Your account is {userRecord.is_active ? 'active' : 'inactive'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Account Created</Label>
                  <div className="text-sm text-gray-600">
                    {format(new Date(userRecord.created_at), 'MMMM d, yyyy \'at\' h:mm a')}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Last Updated</Label>
                  <div className="text-sm text-gray-600">
                    {format(new Date(userRecord.updated_at), 'MMMM d, yyyy \'at\' h:mm a')}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button variant="outline" type="button" disabled>
                    Change Password
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    Password changes are managed through the authentication system
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: '#006DB1' }}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </form>
      </Tabs>
    </div>
  )
}