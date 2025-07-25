'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import EnhancedPatientChat from '@/components/chat/EnhancedPatientChat'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// Test patients with different recovery days
const testPatients = [
  {
    id: 'test-patient-1',
    name: 'John Doe',
    surgeryDate: '2025-01-08', // Day 15 post-surgery
    description: 'Day 15 - Mid recovery phase'
  },
  {
    id: 'test-patient-2', 
    name: 'Jane Smith',
    surgeryDate: '2025-01-20', // Day 3 post-surgery
    description: 'Day 3 - Early recovery phase'
  },
  {
    id: 'test-patient-3',
    name: 'Bob Johnson',
    surgeryDate: '2025-02-22', // Day -30 pre-surgery
    description: 'Day -30 - Pre-surgery phase'
  }
]

export default function TestProtocolChatPage() {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [showAI, setShowAI] = useState(true)

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/demo">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Test Protocol-Driven Chat</h1>
            <p className="text-sm text-muted-foreground">
              Test the protocol-driven predictive chat system with different patient scenarios
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
          <h2 className="text-lg font-semibold mb-4">Select a Test Patient</h2>
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
              Testing with patient: {testPatients.find(p => p.id === selectedPatient)?.name}
            </div>
          </div>
          
          <Card className="p-0 h-[800px]">
            <EnhancedPatientChat
              patientId={selectedPatient}
              providerId="test-provider"
              isProvider={false}
            />
          </Card>
        </div>
      )}
    </div>
  )
}