"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  UserCheck, 
  UserPlus, 
  UserMinus,
  Shield,
  Calendar,
  AlertCircle,
  Loader2,
  Search,
  CheckCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Provider {
  id: string;
  user_id: string;
  role: string;
  specialization: string;
  is_active: boolean;
  user: {
    full_name: string;
    email: string;
  };
}

interface Patient {
  id: string;
  user_id: string;
  mrn: string;
  surgery_type: string;
  surgery_date: string;
  first_name: string;
  last_name: string;
  full_name: string;
}

interface Assignment {
  id: string;
  provider_id: string;
  patient_id: string;
  assignment_type: 'primary' | 'secondary' | 'on_call' | 'temporary';
  status: 'active' | 'inactive' | 'pending';
  assigned_at: string;
  notes?: string;
  provider?: Provider;
  patient?: Patient;
}

interface ProviderAssignmentManagerProps {
  tenantId: string;
  mode?: 'patient' | 'provider' | 'full';
  patientId?: string;
  providerId?: string;
}

export default function ProviderAssignmentManager({
  tenantId,
  mode = 'full',
  patientId,
  providerId
}: ProviderAssignmentManagerProps) {
  const supabase = createClient();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [selectedPatient, setSelectedPatient] = useState<string>(patientId || '');
  const [selectedProvider, setSelectedProvider] = useState<string>(providerId || '');
  const [assignmentType, setAssignmentType] = useState<Assignment['assignment_type']>('primary');
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [tenantId, patientId, providerId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load providers
      if (mode !== 'provider') {
        const { data: providerData, error: providerError } = await supabase
          .from('providers')
          .select(`
            *,
            user:users!user_id(full_name, email)
          `)
          .eq('tenant_id', tenantId)
          .eq('is_active', true);

        if (providerError) throw providerError;
        setProviders(providerData || []);
      }

      // Load patients
      if (mode !== 'patient') {
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('last_name', { ascending: true });

        if (patientError) throw patientError;
        setPatients(patientData || []);
      }

      // Load existing assignments
      let assignmentQuery = supabase
        .from('provider_patient_assignments')
        .select(`
          *,
          provider:providers!provider_id(
            *,
            user:users!user_id(full_name, email)
          ),
          patient:patients!patient_id(*)
        `)
        .eq('tenant_id', tenantId)
        .eq('status', 'active');

      if (patientId) {
        assignmentQuery = assignmentQuery.eq('patient_id', patientId);
      }
      if (providerId) {
        assignmentQuery = assignmentQuery.eq('provider_id', providerId);
      }

      const { data: assignmentData, error: assignmentError } = await assignmentQuery;

      if (assignmentError) throw assignmentError;
      setAssignments(assignmentData || []);

    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedPatient || !selectedProvider) {
      setError('Please select both a patient and a provider');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const { data, error } = await supabase.rpc('assign_provider_to_patient', {
        p_provider_id: selectedProvider,
        p_patient_id: selectedPatient,
        p_assignment_type: assignmentType,
        p_notes: notes || null
      });

      if (error) throw error;

      setSuccess('Provider assigned successfully');
      setSelectedProvider('');
      setSelectedPatient('');
      setNotes('');
      await loadData();
    } catch (err) {
      console.error('Error assigning provider:', err);
      setError(err instanceof Error ? err.message : 'Failed to assign provider');
    } finally {
      setSaving(false);
    }
  };

  const handleUnassign = async (assignmentId: string) => {
    try {
      setSaving(true);
      setError(null);

      const { error } = await supabase
        .from('provider_patient_assignments')
        .update({
          status: 'inactive',
          unassigned_at: new Date().toISOString()
        })
        .eq('id', assignmentId);

      if (error) throw error;

      setSuccess('Provider unassigned successfully');
      await loadData();
    } catch (err) {
      console.error('Error unassigning provider:', err);
      setError(err instanceof Error ? err.message : 'Failed to unassign provider');
    } finally {
      setSaving(false);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.full_name?.toLowerCase().includes(searchLower) ||
      patient.mrn?.toLowerCase().includes(searchLower) ||
      patient.surgery_type?.toLowerCase().includes(searchLower)
    );
  });

  const getAssignmentTypeColor = (type: Assignment['assignment_type']) => {
    switch (type) {
      case 'primary': return 'bg-blue-100 text-blue-800';
      case 'secondary': return 'bg-green-100 text-green-800';
      case 'on_call': return 'bg-yellow-100 text-yellow-800';
      case 'temporary': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Assignment Form */}
      {mode === 'full' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Assign Provider to Patient
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Patient Selection */}
              <div className="space-y-2">
                <Label htmlFor="patient">Select Patient</Label>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search patients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 mb-2"
                    />
                  </div>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredPatients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{patient.full_name}</span>
                            <span className="text-xs text-gray-500">
                              MRN: {patient.mrn} • {patient.surgery_type} • {
                                new Date(patient.surgery_date).toLocaleDateString()
                              }
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Provider Selection */}
              <div className="space-y-2">
                <Label htmlFor="provider">Select Provider</Label>
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{provider.user.full_name}</span>
                          <span className="text-xs text-gray-500">
                            {provider.role} • {provider.specialization}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Assignment Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Assignment Type</Label>
                <Select value={assignmentType} onValueChange={(value) => setAssignmentType(value as Assignment['assignment_type'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary Provider</SelectItem>
                    <SelectItem value="secondary">Secondary Provider</SelectItem>
                    <SelectItem value="on_call">On-Call Provider</SelectItem>
                    <SelectItem value="temporary">Temporary Assignment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any relevant notes..."
                  rows={3}
                />
              </div>
            </div>

            <Button
              onClick={handleAssign}
              disabled={!selectedPatient || !selectedProvider || saving}
              className="w-full"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Assign Provider
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Current Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Current Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No active assignments found
            </p>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {assignment.provider?.user.full_name}
                      </span>
                      <Badge className={getAssignmentTypeColor(assignment.assignment_type)}>
                        {assignment.assignment_type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      Assigned to: {assignment.patient?.full_name} 
                      {assignment.patient?.mrn && ` (MRN: ${assignment.patient.mrn})`}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(assignment.assigned_at).toLocaleDateString()}
                      </span>
                      {assignment.notes && (
                        <span className="italic">{assignment.notes}</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnassign(assignment.id)}
                    disabled={saving}
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}