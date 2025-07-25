"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RecoveryDayStatus } from "@/components/ui/status-indicator";
import { 
  Search, 
  Filter, 
  Users, 
  Calendar, 
  Stethoscope,
  Phone,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from "lucide-react";

interface Patient {
  id: string;
  profile_id: string;
  tenant_id: string;
  surgery_type: 'TKA' | 'THA' | 'TSA' | null;
  surgery_date: string | null;
  current_recovery_day: number;
  protocol_id: string | null;
  surgeon_id: string | null;
  primary_nurse_id?: string | null;
  physical_therapist_id?: string | null;
  phone_number?: string;
  mrn: string;
  status: string;
  created_at: string;
  updated_at: string;
  profile?: {
    id: string;
    first_name?: string;
    last_name?: string;
    full_name: string;
    email: string;
    phone?: string;
  };
  surgeon?: {
    first_name: string;
    last_name: string;
  };
  nurse?: {
    first_name: string;
    last_name: string;
  };
  pt?: {
    first_name: string;
    last_name: string;
  };
  recovery_protocols?: {
    name: string;
    description?: string;
  };
}

interface Provider {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface Protocol {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
}

interface PatientsListProps {
  patients: Patient[];
  providers: Provider[];
  protocols: Protocol[];
  loading: boolean;
  onAssignProtocol: (patientId: string, protocolId: string) => void;
  onAssignProvider: (patientId: string, field: string, providerId: string | null) => void;
  onViewPatient: (patientId: string) => void;
  onChatWithPatient: (patientId: string) => void;
}

type SortField = 'name' | 'surgery_date' | 'recovery_day' | 'surgery_type' | 'status';
type SortDirection = 'asc' | 'desc';

export default function PatientsList({
  patients,
  providers,
  protocols,
  loading,
  onAssignProtocol,
  onAssignProvider,
  onViewPatient,
  onChatWithPatient
}: PatientsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [surgeryTypeFilter, setSurgeryTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [recoveryPhaseFilter, setRecoveryPhaseFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSortedPatients = useMemo(() => {
    const filtered = patients.filter(patient => {
      const searchLower = searchTerm.toLowerCase();
      const fullName = `${patient.profile?.first_name || ""} ${patient.profile?.last_name || ""}`.toLowerCase();
      const email = patient.profile?.email?.toLowerCase() || "";
      const phone = patient.phone_number?.toLowerCase() || patient.profile?.phone?.toLowerCase() || "";
      const mrn = patient.mrn?.toLowerCase() || "";
      
      // Search filter
      const matchesSearch = fullName.includes(searchLower) ||
                           email.includes(searchLower) ||
                           phone.includes(searchLower) ||
                           mrn.includes(searchLower);
      
      // Surgery type filter
      const matchesSurgeryType = surgeryTypeFilter === "all" || 
                                patient.surgery_type === surgeryTypeFilter;
      
      // Status filter
      const matchesStatus = statusFilter === "all" || 
                            patient.status === statusFilter;
      
      // Recovery phase filter
      let matchesRecoveryPhase = true;
      if (recoveryPhaseFilter !== "all") {
        switch (recoveryPhaseFilter) {
          case "pre_surgery":
            matchesRecoveryPhase = patient.current_recovery_day < 0;
            break;
          case "early_recovery":
            matchesRecoveryPhase = patient.current_recovery_day >= 0 && patient.current_recovery_day <= 14;
            break;
          case "intermediate_recovery":
            matchesRecoveryPhase = patient.current_recovery_day > 14 && patient.current_recovery_day <= 90;
            break;
          case "advanced_recovery":
            matchesRecoveryPhase = patient.current_recovery_day > 90;
            break;
        }
      }
      
      return matchesSearch && matchesSurgeryType && matchesStatus && matchesRecoveryPhase;
    });

    // Sort patients
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      switch (sortField) {
        case 'name':
          aValue = `${a.profile?.first_name || ""} ${a.profile?.last_name || ""}`.toLowerCase();
          bValue = `${b.profile?.first_name || ""} ${b.profile?.last_name || ""}`.toLowerCase();
          break;
        case 'surgery_date':
          aValue = a.surgery_date ? new Date(a.surgery_date).getTime() : 0;
          bValue = b.surgery_date ? new Date(b.surgery_date).getTime() : 0;
          break;
        case 'recovery_day':
          aValue = a.current_recovery_day;
          bValue = b.current_recovery_day;
          break;
        case 'surgery_type':
          aValue = a.surgery_type || "";
          bValue = b.surgery_type || "";
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = "";
          bValue = "";
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [patients, searchTerm, surgeryTypeFilter, statusFilter, recoveryPhaseFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSurgeryTypeFilter("all");
    setStatusFilter("all");
    setRecoveryPhaseFilter("all");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563eb]"></div>
        <span className="ml-3 text-gray-600">Loading patients...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg border p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search patients by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Surgery Type</label>
              <Select value={surgeryTypeFilter} onValueChange={setSurgeryTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="TKA">TKA (Knee)</SelectItem>
                  <SelectItem value="THA">THA (Hip)</SelectItem>
                  <SelectItem value="TSA">TSA (Shoulder)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recovery Phase</label>
              <Select value={recoveryPhaseFilter} onValueChange={setRecoveryPhaseFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Phases" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Phases</SelectItem>
                  <SelectItem value="pre_surgery">Pre-Surgery</SelectItem>
                  <SelectItem value="early_recovery">Early Recovery (0-14 days)</SelectItem>
                  <SelectItem value="intermediate_recovery">Intermediate (15-90 days)</SelectItem>
                  <SelectItem value="advanced_recovery">Advanced (90+ days)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing {filteredAndSortedPatients.length} of {patients.length} patients
        </p>
        {filteredAndSortedPatients.length === 0 && searchTerm && (
          <div className="flex items-center text-amber-600">
            <AlertCircle className="h-4 w-4 mr-1" />
            No patients found matching your search
          </div>
        )}
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="text-left p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Patient
                    {getSortIcon('name')}
                  </div>
                </th>
                <th 
                  className="text-left p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('surgery_type')}
                >
                  <div className="flex items-center gap-2">
                    Surgery
                    {getSortIcon('surgery_type')}
                  </div>
                </th>
                <th 
                  className="text-left p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('surgery_date')}
                >
                  <div className="flex items-center gap-2">
                    Surgery Date
                    {getSortIcon('surgery_date')}
                  </div>
                </th>
                <th 
                  className="text-left p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('recovery_day')}
                >
                  <div className="flex items-center gap-2">
                    Recovery Day
                    {getSortIcon('recovery_day')}
                  </div>
                </th>
                <th className="text-left p-4 font-semibold text-gray-700">Protocol</th>
                <th className="text-left p-4 font-semibold text-gray-700">Care Team</th>
                <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedPatients.map((patient) => (
                <tr key={patient.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {patient.profile?.first_name && patient.profile?.last_name
                          ? `${patient.profile.first_name} ${patient.profile.last_name}`
                          : patient.profile?.email || "Unknown Patient"}
                      </div>
                      <div className="text-sm text-gray-600">{patient.profile?.email}</div>
                      <div className="text-sm text-gray-500">MRN: {patient.mrn}</div>
                      {(patient.phone_number || patient.profile?.phone) && (
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {patient.phone_number || patient.profile?.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      {patient.surgery_type && (
                        <Badge variant={patient.surgery_type === 'TKA' ? 'default' : 'secondary'}>
                          {patient.surgery_type}
                        </Badge>
                      )}
                      <Badge
                        variant={patient.status === 'active' ? 'default' : 'outline'}
                        className="text-xs bg-green-100 text-green-800"
                      >
                        {patient.status}
                      </Badge>
                    </div>
                  </td>
                  <td className="p-4">
                    {patient.surgery_date
                      ? new Date(patient.surgery_date).toLocaleDateString()
                      : <span className="text-gray-400">Not Set</span>
                    }
                  </td>
                  <td className="p-4">
                    <RecoveryDayStatus day={patient.current_recovery_day} />
                  </td>
                  <td className="p-4">
                    <Select
                      value={patient.protocol_id || ""}
                      onValueChange={(value) => onAssignProtocol(patient.id, value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select Protocol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No Protocol</SelectItem>
                        {protocols.map((protocol) => (
                          <SelectItem key={protocol.id} value={protocol.id}>
                            {protocol.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-4">
                    <div className="space-y-2">
                      <ProviderSelect
                        value={patient.surgeon_id}
                        providers={providers.filter(p => p.role === "surgeon")}
                        onChange={(value) => onAssignProvider(patient.id, "surgeon_id", value)}
                        placeholder="Surgeon"
                        icon={<Stethoscope className="h-3 w-3" />}
                      />
                      <ProviderSelect
                        value={patient.primary_nurse_id || null}
                        providers={providers.filter(p => p.role === "nurse")}
                        onChange={(value) => onAssignProvider(patient.id, "primary_nurse_id", value)}
                        placeholder="Nurse"
                        icon={<Users className="h-3 w-3" />}
                      />
                      <ProviderSelect
                        value={patient.physical_therapist_id || null}
                        providers={providers.filter(p => p.role === "physical_therapist")}
                        onChange={(value) => onAssignProvider(patient.id, "physical_therapist_id", value)}
                        placeholder="PT"
                        icon={<Users className="h-3 w-3" />}
                      />
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewPatient(patient.id)}
                        className="text-xs"
                      >
                        View Details
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onChatWithPatient(patient.id)}
                        className="text-xs flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <MessageSquare className="h-3 w-3" />
                        Chat
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredAndSortedPatients.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || surgeryTypeFilter !== "all" || statusFilter !== "all" || recoveryPhaseFilter !== "all"
              ? "Try adjusting your search criteria or filters."
              : "Start by adding your first patient to the system."
            }
          </p>
          {(searchTerm || surgeryTypeFilter !== "all" || statusFilter !== "all" || recoveryPhaseFilter !== "all") && (
            <Button variant="outline" onClick={clearFilters}>
              Clear all filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Provider Selection Component
interface ProviderSelectProps {
  value: string | null;
  providers: Provider[];
  onChange: (value: string | null) => void;
  placeholder: string;
  icon?: React.ReactNode;
}

function ProviderSelect({ value, providers, onChange, placeholder, icon }: ProviderSelectProps) {
  return (
    <Select value={value || ""} onValueChange={(v) => onChange(v || null)}>
      <SelectTrigger className="w-40 h-8 text-xs">
        <div className="flex items-center gap-1">
          {icon}
          <SelectValue placeholder={placeholder} />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">Unassigned</SelectItem>
        {providers.map((provider) => (
          <SelectItem key={provider.id} value={provider.id}>
            {provider.first_name} {provider.last_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}