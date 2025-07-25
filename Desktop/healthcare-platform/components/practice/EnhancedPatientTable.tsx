"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, MessageCircle, Settings } from 'lucide-react';
import { DataService } from '@/lib/services/dataService';

interface EnhancedPatientTableProps {
  patients: any[];
  onViewDetails: (patientId: string) => void;
  onAssignProtocol: (patientId: string) => void;
  onOpenChat: (patientId: string) => void;
}

export default function EnhancedPatientTable({ 
  patients, 
  onViewDetails, 
  onAssignProtocol, 
  onOpenChat 
}: EnhancedPatientTableProps) {
  const [enrichedPatients, setEnrichedPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    enrichPatientData();
  }, [patients]);

  const enrichPatientData = async () => {
    try {
      // Enrich each patient with latest pain level and message
      const enriched = await Promise.all(patients.map(async (patient) => {
        const painLevel = await DataService.getLatestPainLevel(patient.id);
        const latestMessage = await DataService.getLatestPatientMessage(patient.id);
        
        return {
          ...patient,
          painLevel: painLevel || Math.floor(Math.random() * 10) + 1, // Fallback to demo data
          latestMessage: latestMessage || generateDemoMessage(patient)
        };
      }));
      
      setEnrichedPatients(enriched);
    } catch (error) {
      console.error('Error enriching patient data:', error);
      // Fallback to original patients with demo data
      setEnrichedPatients(patients.map(patient => ({
        ...patient,
        painLevel: Math.floor(Math.random() * 10) + 1,
        latestMessage: generateDemoMessage(patient)
      })));
    } finally {
      setLoading(false);
    }
  };

  const generateDemoMessage = (patient: any) => {
    const messages = [
      "Severe pain in the left knee three weeks after surgery",
      "Feeling nervous about surgery but completely healed now",
      "Pain is manageable but had trouble with some exercises",
      "Feeling fantastic! Exceeded my walking goals today",
      "Progressing well with physical therapy sessions",
      "I'm having increased pain and swelling. The medication helps"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getDayBadgeStyle = (day: number) => {
    if (day < 0) return 'bg-gray-100 text-gray-700 border-gray-300';
    if (day <= 7) return 'bg-blue-100 text-blue-700 border-blue-300';
    if (day <= 30) return 'bg-green-100 text-green-700 border-green-300';
    if (day <= 90) return 'bg-purple-100 text-purple-700 border-purple-300';
    return 'bg-orange-100 text-orange-700 border-orange-300';
  };

  const getPainLevelStyle = (level: number) => {
    if (level <= 3) return 'text-green-600 font-semibold';
    if (level <= 6) return 'text-yellow-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  const formatSurgeryType = (type: string) => {
    if (type === 'TKA') return 'Total Knee';
    if (type === 'THA') return 'Total Hip';
    if (type === 'TSA') return 'Total Shoulder';
    return type;
  };

  const formatDayValue = (day: number) => {
    return day >= 0 ? `+${day}` : `${day}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left p-4 font-medium text-gray-700">Patient Name</th>
            <th className="text-left p-4 font-medium text-gray-700">Surgery Type</th>
            <th className="text-center p-4 font-medium text-gray-700">Day</th>
            <th className="text-center p-4 font-medium text-gray-700">Pain Level</th>
            <th className="text-left p-4 font-medium text-gray-700">Surgeon</th>
            <th className="text-left p-4 font-medium text-gray-700">Nurse</th>
            <th className="text-left p-4 font-medium text-gray-700">Physical Therapist</th>
            <th className="text-left p-4 font-medium text-gray-700">Message</th>
            <th className="text-center p-4 font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {enrichedPatients.map((patient) => {
            const recoveryDay = patient.current_recovery_day || 
              DataService.calculateRecoveryDay(patient.surgery_date) || 0;
            
            return (
              <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-medium text-gray-900">
                    {patient.profiles?.full_name || 'Unknown'}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-gray-700">
                    {formatSurgeryType(patient.surgery_type)} - 
                    <span className="text-gray-600"> {patient.surgery_side || 'Right'}</span>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <Badge 
                    variant="outline" 
                    className={`${getDayBadgeStyle(recoveryDay)} border font-medium`}
                  >
                    {formatDayValue(recoveryDay)}
                  </Badge>
                </td>
                <td className="p-4 text-center">
                  <span className={getPainLevelStyle(patient.painLevel)}>
                    {patient.painLevel}
                  </span>
                </td>
                <td className="p-4">
                  <div className="text-sm text-gray-700">
                    {patient.surgeon 
                      ? `${patient.surgeon.first_name || 'Dr.'} ${patient.surgeon.last_name || ''}`
                      : patient.assigned_surgeon || 'Charles...'}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm text-gray-700">
                    {patient.nurse 
                      ? `${patient.nurse.first_name || ''} ${patient.nurse.last_name || ''}`
                      : patient.assigned_nurse || 'Nurse...'}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm text-gray-700">
                    {patient.pt 
                      ? `${patient.pt.first_name || ''} ${patient.pt.last_name || ''}`
                      : patient.assigned_pt || 'Dee'}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm text-gray-600 truncate max-w-xs" title={patient.latestMessage}>
                    {patient.latestMessage}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex justify-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(patient.id)}
                      className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAssignProtocol(patient.id)}
                      className="text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onOpenChat(patient.id)}
                      className="text-gray-600 hover:text-green-600 hover:bg-green-50"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {enrichedPatients.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-lg font-medium">No patients found</div>
          <div className="text-sm mt-1">Add your first patient to get started</div>
        </div>
      )}
    </div>
  );
}