'use client'

import React from 'react'
import { HealthcareSidebar } from '@/components/layout/healthcare-sidebar'
import { Card, CardContent, CardHeader } from '@/components/ui/design-system/Card'

export default function SchedulePage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <HealthcareSidebar userRole="provider" userName="Practice Staff" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
                </CardHeader>
                <CardContent>
                  <p>This is a placeholder for the Schedule page.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}