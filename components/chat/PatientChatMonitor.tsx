"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/design-system/Card';
import { StatusBadge } from '@/components/ui/design-system/StatusIndicator';
import { Button } from '@/components/ui/design-system/Button';
import { Input } from '@/components/ui/design-system/Input';
import { Textarea } from '@/components/ui/design-system/Textarea';
import { Users, MessageSquare, Activity, Search, Send, RefreshCw } from 'lucide-react';
import { colors } from '@/lib/design-system/constants';

interface PatientData {
  id: string;
  name: string;
  email: string;
  recovery_protocol?: {
    name: string;
    phase: string;
    current_day: number;
  };
  last_activity?: string;
  unread_messages: number;
}

interface Message {
  id: string;
  content: string;
  sender_type: 'patient' | 'provider';
  created_at: string;
  sender_name?: string;
}

export function PatientChatMonitor() {
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const supabase = createClient();

  // Fetch patients
  const fetchPatients = async () => {
    try {
      const { data: patientsData, error } = await supabase
        .from('patients')
        .select(`
          *,
          recovery_protocol:recovery_protocols(name, phase),
          messages(created_at, sender_type)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process patient data
      const processedPatients = patientsData?.map(patient => {
        const messages = patient.messages || [];
        const unreadMessages = messages.filter((m: any) => 
          m.sender_type === 'patient' && new Date(m.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length;

        return {
          id: patient.id,
          name: patient.name,
          email: patient.email,
          recovery_protocol: patient.recovery_protocol ? {
            name: patient.recovery_protocol.name,
            phase: patient.recovery_protocol.phase || 'Phase 1',
            current_day: patient.current_recovery_day || 0
          } : undefined,
          last_activity: messages[0]?.created_at || patient.created_at,
          unread_messages: unreadMessages
        };
      }) || [];

      setPatients(processedPatients);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for selected patient
  const fetchMessages = async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!selectedPatient || !newMessage.trim()) return;

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('messages')
        .insert({
          patient_id: selectedPatient.id,
          content: newMessage,
          sender_type: 'provider',
          sender_id: user.id,
          sender_name: 'Provider'
        });

      if (error) throw error;

      setNewMessage('');
      await fetchMessages(selectedPatient.id);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    fetchPatients();

    // Set up real-time subscription
    const channel = supabase
      .channel('patient-updates')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'messages' 
      }, () => {
        fetchPatients();
        if (selectedPatient) {
          fetchMessages(selectedPatient.id);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchMessages(selectedPatient.id);
    }
  }, [selectedPatient]);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  {/* <thinking>
  Visual Design: Professional patient monitoring interface with new design system
  Healthcare Context: Real-time patient communication and monitoring
  UX Design: Split-view layout for efficient patient management
  </thinking> */}

  return (
    <div className="h-full flex gap-4">
      {/* Patient List */}
      <Card className="w-1/3 flex flex-col">
        <div className="p-4 border-b border-gray-300">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Patient Conversations
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-600">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              Loading patients...
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="p-4 text-center text-gray-600">
              No patients found
            </div>
          ) : (
            <div className="divide-y divide-gray-300">
              {filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    selectedPatient?.id === patient.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{patient.name}</h3>
                      <p className="text-sm text-gray-600">{patient.email}</p>
                      {patient.recovery_protocol && (
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-xs text-gray-600">
                            {patient.recovery_protocol.name}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-600">
                            Day {patient.recovery_protocol.current_day}
                          </span>
                        </div>
                      )}
                    </div>
                    {patient.unread_messages > 0 && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        {patient.unread_messages}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col">
        {selectedPatient ? (
          <>
            <div className="p-4 border-b border-gray-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedPatient.name}</h3>
                  {selectedPatient.recovery_protocol && (
                    <p className="text-sm text-gray-600">
                      {selectedPatient.recovery_protocol.phase} • Day {selectedPatient.recovery_protocol.current_day}
                    </p>
                  )}
                </div>
                <StatusBadge status="completed" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_type === 'provider' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender_type === 'provider'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender_type === 'provider' ? 'text-blue-100' : 'text-gray-600'
                    }`}>
                      {new Date(message.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-300">
              <div className="flex gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                  rows={2}
                  onKeyPress={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  loading={sending}
                  variant="primary"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-600">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Select a patient to view conversation</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}