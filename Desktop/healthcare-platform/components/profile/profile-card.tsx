'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Edit
} from 'lucide-react'
import { format } from 'date-fns'
import { Database } from '@/lib/database-types'

type UserRecord = Database['public']['Tables']['users']['Row']

interface ProfileCardProps {
  user: UserRecord
  showEditButton?: boolean
  onEditClick?: () => void
  compact?: boolean
}

export function ProfileCard({ 
  user, 
  showEditButton = false, 
  onEditClick,
  compact = false 
}: ProfileCardProps) {
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

  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')
  }

  if (compact) {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback className="text-sm">
                  {getInitials(user.full_name || 'User')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-sm">{user.full_name || 'User'}</h3>
                <p className="text-xs text-gray-600">{user.email}</p>
              </div>
            </div>
            <Badge className={`${getRoleBadgeColor(user.role)} text-xs`}>
              {formatRole(user.role)}
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="text-lg">
                {getInitials(user.full_name || 'User')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-bold">{user.full_name || 'User'}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getRoleBadgeColor(user.role)}>
                  {formatRole(user.role)}
                </Badge>
                {user.is_active ? (
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
          {showEditButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEditClick}
              className="text-gray-600 hover:text-gray-900"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="h-4 w-4" />
            <span>{user.email}</span>
          </div>

          {user.phone && (
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="h-4 w-4" />
              <span>{user.phone}</span>
            </div>
          )}

          {user.date_of_birth && (
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(user.date_of_birth), 'MMMM d, yyyy')}</span>
            </div>
          )}

          {user.address && (user.address.street || user.address.city) && (
            <div className="flex items-start gap-2 text-gray-600">
              <MapPin className="h-4 w-4 mt-0.5" />
              <span>
                {user.address.street && `${user.address.street}, `}
                {user.address.city && `${user.address.city}`}
                {user.address.state && `, ${user.address.state}`}
                {user.address.zip && ` ${user.address.zip}`}
              </span>
            </div>
          )}

          {user.bio && (
            <div className="pt-2 border-t">
              <p className="text-gray-600 italic">&ldquo;{user.bio}&rdquo;</p>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t flex justify-between text-xs text-gray-500">
          <span>Member since {format(new Date(user.created_at), 'MMM yyyy')}</span>
          {user.last_sign_in_at && (
            <span>Last seen {format(new Date(user.last_sign_in_at), 'MMM d, yyyy')}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}