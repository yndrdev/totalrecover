"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, AlertTriangle, Bell, CheckCircle2, Clock, MessageSquare, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Alert {
  id: string;
  patientId: string;
  patientName: string;
  conversationId: string;
  type: 'high_pain_score' | 'missed_medication' | 'emergency_request' | 'no_response_24h' | 'urgent_question';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedAt?: Date;
  messageContent?: string;
}

interface RealTimeAlertsProps {
  tenantId: string;
  providerId: string;
}

// Helper function to format time distance
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export default function RealTimeAlerts({ tenantId, providerId }: RealTimeAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'acknowledged'>('active');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Analyze messages for potential alerts
  const analyzeMessageForAlerts = (message: any, patient: any): Alert | null => {
    const content = message.content.toLowerCase();
    const now = new Date();

    // High pain score detection
    if (message.sender_type === 'patient' && (
      content.includes('pain') && (
        content.includes('severe') ||
        content.includes('unbearable') ||
        content.includes('10/10') ||
        content.includes('9/10') ||
        content.includes('worst') ||
        content.includes('can\'t sleep') ||
        content.includes('can\'t bear')
      )
    )) {
      return {
        id: `alert-${message.id}`,
        patientId: patient.id,
        patientName: patient.name,
        conversationId: message.conversation_id,
        type: 'high_pain_score',
        severity: 'high',
        title: 'High Pain Score Reported',
        description: `${patient.name} reported severe pain`,
        timestamp: new Date(message.created_at),
        acknowledged: false,
        messageContent: message.content
      };
    }

    // Emergency request detection
    if (message.sender_type === 'patient' && (
      content.includes('emergency') ||
      content.includes('urgent') ||
      content.includes('help') && content.includes('now') ||
      content.includes('911') ||
      content.includes('ambulance')
    )) {
      return {
        id: `alert-${message.id}`,
        patientId: patient.id,
        patientName: patient.name,
        conversationId: message.conversation_id,
        type: 'emergency_request',
        severity: 'critical',
        title: 'Emergency Request',
        description: `${patient.name} may need immediate assistance`,
        timestamp: new Date(message.created_at),
        acknowledged: false,
        messageContent: message.content
      };
    }

    // Medication concerns
    if (message.sender_type === 'patient' && (
      content.includes('forgot') && content.includes('medication') ||
      content.includes('missed') && content.includes('dose') ||
      content.includes('ran out') && content.includes('medication')
    )) {
      return {
        id: `alert-${message.id}`,
        patientId: patient.id,
        patientName: patient.name,
        conversationId: message.conversation_id,
        type: 'missed_medication',
        severity: 'medium',
        title: 'Medication Compliance Issue',
        description: `${patient.name} reported medication issues`,
        timestamp: new Date(message.created_at),
        acknowledged: false,
        messageContent: message.content
      };
    }

    return null;
  };

  // Load alerts from messages
  useEffect(() => {
    const loadAlerts = async () => {
      setLoading(true);
      
      try {
        // Get recent messages with patient info
        const { data: conversations, error } = await supabase
          .from('conversations')
          .select(`
            id,
            patient_id,
            patients!inner(
              id,
              profiles!inner(
                id,
                name
              )
            ),
            messages!inner(
              id,
              content,
              sender_type,
              created_at
            )
          `)
          .eq('tenant_id', tenantId)
          .gte('messages.created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('messages.created_at', { ascending: false });

        if (error) throw error;

        // Analyze messages for alerts
        const detectedAlerts: Alert[] = [];
        conversations?.forEach((conv: any) => {
          const patient = conv.patients[0];
          const patientProfile = patient.profiles[0];
          
          conv.messages.forEach((message: any) => {
            const alert = analyzeMessageForAlerts(message, {
              id: patient.id,
              name: patientProfile.name
            });
            
            if (alert) {
              detectedAlerts.push(alert);
            }
          });
        });

        // Check for no response alerts
        const { data: noResponseConvs } = await supabase
          .from('conversations')
          .select(`
            id,
            patient_id,
            patients!inner(
              id,
              profiles!inner(
                id,
                name
              )
            ),
            messages!inner(
              id,
              sender_type,
              created_at
            )
          `)
          .eq('tenant_id', tenantId)
          .order('messages.created_at', { ascending: false });

        noResponseConvs?.forEach((conv: any) => {
          const lastProviderMessage = conv.messages.find((m: any) => m.sender_type === 'provider');
          const lastPatientMessage = conv.messages.find((m: any) => m.sender_type === 'patient');
          
          if (lastProviderMessage && (!lastPatientMessage || 
              new Date(lastProviderMessage.created_at) > new Date(lastPatientMessage.created_at))) {
            const hoursSinceMessage = (Date.now() - new Date(lastProviderMessage.created_at).getTime()) / (1000 * 60 * 60);
            
            if (hoursSinceMessage > 24) {
              const patient = conv.patients[0];
              const patientProfile = patient.profiles[0];
              
              detectedAlerts.push({
                id: `no-response-${conv.id}`,
                patientId: patient.id,
                patientName: patientProfile.name,
                conversationId: conv.id,
                type: 'no_response_24h',
                severity: 'medium',
                title: 'No Patient Response',
                description: `${patientProfile.name} hasn't responded in ${Math.floor(hoursSinceMessage)} hours`,
                timestamp: new Date(lastProviderMessage.created_at),
                acknowledged: false
              });
            }
          }
        });

        setAlerts(detectedAlerts);
      } catch (error) {
        console.error('Error loading alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();

    // Subscribe to new messages
    const subscription = supabase
      .channel('provider-alerts')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages' 
      }, async (payload: any) => {
        // Get patient info for the new message
        const { data: conv } = await supabase
          .from('conversations')
          .select(`
            patient_id,
            patients!inner(
              id,
              profiles!inner(
                id,
                name
              )
            )
          `)
          .eq('id', payload.new.conversation_id)
          .single();

        if (conv) {
          const patient = conv.patients[0];
          const patientProfile = patient.profiles[0];
          
          const alert = analyzeMessageForAlerts(payload.new, {
            id: patient.id,
            name: patientProfile.name
          });
          
          if (alert) {
            setAlerts(prev => [alert, ...prev]);
          }
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [tenantId, supabase]);

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, acknowledged: true, acknowledgedAt: new Date() }
        : alert
    ));
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'active') return !alert.acknowledged;
    if (filter === 'acknowledged') return alert.acknowledged;
    return true;
  });

  const getSeverityIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'medium':
        return <Bell className="w-5 h-5 text-yellow-500" />;
      default:
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'high':
        return 'bg-orange-50 border-orange-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-100 h-96 rounded-lg" />;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Patient Alerts</h2>
        <Badge variant="outline" className="gap-2">
          <Bell className="w-4 h-4" />
          {filteredAlerts.filter(a => !a.acknowledged).length} Active
        </Badge>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="acknowledged">Acknowledged</TabsTrigger>
        </TabsList>

        <TabsContent value={filter}>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {filteredAlerts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No alerts to display</p>
                </div>
              ) : (
                filteredAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className={cn(
                      "p-4 rounded-lg border transition-all",
                      getSeverityColor(alert.severity),
                      alert.acknowledged && "opacity-60"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getSeverityIcon(alert.severity)}
                        <div className="flex-1">
                          <h4 className="font-medium">{alert.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                          {alert.messageContent && (
                            <blockquote className="mt-2 p-2 bg-white/50 rounded text-sm italic">
                              &ldquo;{alert.messageContent}&rdquo;
                            </blockquote>
                          )}
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                            <span>{formatTimeAgo(alert.timestamp)}</span>
                            {alert.acknowledged && alert.acknowledgedAt && (
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Acknowledged {formatTimeAgo(alert.acknowledgedAt)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {!alert.acknowledged && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="ml-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  );
}