'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Phone, Calendar, User, Send, AlertCircle, CheckCircle, Plus, X } from 'lucide-react';

interface InvitePatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface PatientInvitation {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  surgeryType?: string;
  surgeryDate?: string;
  customMessage?: string;
}

export function InvitePatientModal({ isOpen, onClose, onSuccess }: InvitePatientModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isBatchMode, setIsBatchMode] = useState(false);
  
  // Single invitation form data
  const [formData, setFormData] = useState<PatientInvitation>({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    surgeryType: '',
    surgeryDate: '',
    customMessage: ''
  });

  // Batch invitations
  const [batchInvitations, setBatchInvitations] = useState<PatientInvitation[]>([]);

  const resetForm = () => {
    setFormData({
      email: '',
      phone: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      surgeryType: '',
      surgeryDate: '',
      customMessage: ''
    });
    setBatchInvitations([]);
    setError(null);
    setSuccess(null);
    setIsBatchMode(false);
  };

  const addToBatch = () => {
    // Validate required fields
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.phone) {
      setError('Please fill in all required fields');
      return;
    }

    // Add to batch
    setBatchInvitations([...batchInvitations, { ...formData }]);
    
    // Clear form for next entry
    setFormData({
      ...formData,
      email: '',
      phone: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      // Keep surgery info and message for convenience
    });
    
    setError(null);
  };

  const removeFromBatch = (index: number) => {
    setBatchInvitations(batchInvitations.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      let payload;
      
      if (isBatchMode) {
        if (batchInvitations.length === 0) {
          throw new Error('Please add at least one patient to the batch');
        }
        payload = { invitations: batchInvitations };
      } else {
        // Validate single invitation
        if (!formData.email || !formData.firstName || !formData.lastName || !formData.phone) {
          throw new Error('Please fill in all required fields');
        }
        payload = formData;
      }

      const response = await fetch('/api/invitations/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation');
      }

      if (isBatchMode) {
        const { results } = data;
        setSuccess(`Successfully sent ${results.totalSent} invitation${results.totalSent !== 1 ? 's' : ''}. ${results.totalFailed > 0 ? `${results.totalFailed} failed.` : ''}`);
      } else {
        setSuccess('Invitation sent successfully!');
      }

      // Clear form and call success callback
      setTimeout(() => {
        resetForm();
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error sending invitation:', err);
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invite Patient{isBatchMode ? 's' : ''}</DialogTitle>
          <DialogDescription>
            Send invitation{isBatchMode ? 's' : ''} to patient{isBatchMode ? 's' : ''} to join the healthcare platform
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          {/* Toggle Batch Mode */}
          <div className="flex items-center justify-between mb-4">
            <Label className="text-sm font-medium">
              {isBatchMode ? 'Batch Mode' : 'Single Invitation'}
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsBatchMode(!isBatchMode)}
            >
              {isBatchMode ? 'Single Mode' : 'Batch Mode'}
            </Button>
          </div>

          {/* Patient Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  <User className="w-4 h-4 inline mr-1" />
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required={!isBatchMode}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required={!isBatchMode}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required={!isBatchMode}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required={!isBatchMode}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>

            {/* Surgery Information */}
            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Surgery Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="surgeryType">Surgery Type</Label>
                  <Input
                    id="surgeryType"
                    placeholder="e.g., Total Knee Replacement"
                    value={formData.surgeryType}
                    onChange={(e) => setFormData({ ...formData, surgeryType: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surgeryDate">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Surgery Date
                  </Label>
                  <Input
                    id="surgeryDate"
                    type="date"
                    value={formData.surgeryDate}
                    onChange={(e) => setFormData({ ...formData, surgeryDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Custom Message */}
            <div className="space-y-2">
              <Label htmlFor="customMessage">Personal Message (Optional)</Label>
              <Textarea
                id="customMessage"
                placeholder="Add a personal message to the patient..."
                value={formData.customMessage}
                onChange={(e) => setFormData({ ...formData, customMessage: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          {/* Batch Mode: Add to List */}
          {isBatchMode && (
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={addToBatch}
                variant="secondary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add to Batch
              </Button>
            </div>
          )}

          {/* Batch List */}
          {isBatchMode && batchInvitations.length > 0 && (
            <div className="border rounded-lg p-4 space-y-2">
              <h4 className="font-medium mb-2">Batch Invitations ({batchInvitations.length})</h4>
              {batchInvitations.map((invitation, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">
                    {invitation.firstName} {invitation.lastName} - {invitation.email}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromBatch(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onClose();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || (isBatchMode && batchInvitations.length === 0)}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Invitation{isBatchMode && batchInvitations.length > 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}