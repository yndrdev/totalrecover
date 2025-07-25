'use client'

import React, { useState } from 'react'
import { HealthcareSidebar } from '@/components/layout/healthcare-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import SimplePatientChat from '@/components/chat/SimplePatientChat'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// Test patients with different recovery days
const testPatients = [
  {
    id: 'patient-1',
    name: 'Sarah Johnson',
    surgeryDate: '2025-07-08', // Updates based on current date
    description: 'Day 15 - Mid recovery phase'
  },
  {
    id: 'patient-2',
    name: 'Michael Chen',
    surgeryDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days ago
    description: 'Day 3 - Early recovery phase'
  },
  {
    id: 'patient-3',
    name: 'Emily Rodriguez',
    surgeryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    description: 'Day -30 - Pre-surgery phase'
  }
]

export default function ProviderChatPage() {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [showAI, setShowAI] = useState(true)

  return (
    <div className="flex h-screen bg-gray-50">
      <HealthcareSidebar userRole="provider" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/provider">
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold">Patient Chat</h1>
                  <p className="text-sm text-muted-foreground">
                    Monitor and support patient recovery with AI-assisted chat
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">AI Responses:</span>
                <Button
                  variant={showAI ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowAI(!showAI)}
                >
                  {showAI ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
            </div>

            {!selectedPatient ? (
              <div>
                <h2 className="text-lg font-semibold mb-4">Select a Patient</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  {testPatients.map((patient) => (
                    <Card
                      key={patient.id}
                      className="p-6 cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => setSelectedPatient(patient.id)}
                    >
                      <h3 className="font-semibold mb-2">{patient.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Surgery: {new Date(patient.surgeryDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm font-medium text-primary">
                        {patient.description}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPatient(null)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Patient Selection
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Monitoring: {testPatients.find(p => p.id === selectedPatient)?.name}
                  </div>
                </div>
                
                <Card className="p-0 h-[800px]">
                  <SimplePatientChat
                    patientId={selectedPatient}
                    isProvider={true}
                  />
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}