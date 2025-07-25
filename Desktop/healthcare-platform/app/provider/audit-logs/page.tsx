"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface AuditLog {
  id: string;
  tenant_id: string;
  user_id: string;
  user_role?: string;
  user_name?: string;
  action: string;
  details: Record<string, any>;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
  resource_type?: string;
  resource_id?: string;
}

interface FilterOptions {
  action?: string;
  user_id?: string;
  resource_type?: string;
  date_from?: string;
  date_to?: string;
}

export default function AuditLogsPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchAuditLogs();
  }, [filters]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from("audit_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(100);

      // Apply filters
      if (filters.action) {
        query = query.eq("action", filters.action);
      }
      if (filters.user_id) {
        query = query.eq("user_id", filters.user_id);
      }
      if (filters.resource_type) {
        query = query.eq("resource_type", filters.resource_type);
      }
      if (filters.date_from) {
        query = query.gte("timestamp", filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte("timestamp", filters.date_to);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAuditLogs(data || []);

    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes("create") || action.includes("assign")) return "default";
    if (action.includes("update") || action.includes("complete")) return "secondary";
    if (action.includes("delete") || action.includes("remove")) return "destructive";
    if (action.includes("error")) return "destructive";
    if (action.includes("auth")) return "outline";
    return "secondary";
  };

  const getResourceIcon = (resourceType?: string) => {
    switch (resourceType) {
      case "patient":
        return "👤";
      case "protocol":
        return "📋";
      case "task":
        return "✅";
      case "form":
        return "📝";
      case "chat":
        return "💬";
      default:
        return "📄";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    
    return date.toLocaleString();
  };

  const filteredLogs = auditLogs.filter(log => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        log.action.toLowerCase().includes(search) ||
        log.user_name?.toLowerCase().includes(search) ||
        JSON.stringify(log.details).toLowerCase().includes(search)
      );
    }
    return true;
  });

  const groupedLogs = {
    all: filteredLogs,
    patient: filteredLogs.filter(log => log.resource_type === "patient" || log.action.includes("patient")),
    protocol: filteredLogs.filter(log => log.resource_type === "protocol" || log.action.includes("protocol")),
    auth: filteredLogs.filter(log => log.action.includes("auth")),
    system: filteredLogs.filter(log => log.action.includes("error") || log.action.includes("system")),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563eb]"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
              <p className="text-gray-600 mt-2">Track all system activities and changes</p>
            </div>
            <Button
              variant="secondary"
              onClick={() => router.push("/provider/dashboard")}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Action Type</Label>
                <Select
                  value={filters.action || ""}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, action: value || undefined }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All actions</SelectItem>
                    <SelectItem value="assign_provider">Assign Provider</SelectItem>
                    <SelectItem value="assign_protocol">Assign Protocol</SelectItem>
                    <SelectItem value="complete_task">Complete Task</SelectItem>
                    <SelectItem value="create_protocol">Create Protocol</SelectItem>
                    <SelectItem value="auth_login">Login</SelectItem>
                    <SelectItem value="auth_logout">Logout</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Resource Type</Label>
                <Select
                  value={filters.resource_type || ""}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, resource_type: value || undefined }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All resources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All resources</SelectItem>
                    <SelectItem value="patient">Patient</SelectItem>
                    <SelectItem value="protocol">Protocol</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="form">Form</SelectItem>
                    <SelectItem value="chat">Chat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Date From</Label>
                <Input
                  type="datetime-local"
                  value={filters.date_from || ""}
                  onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value || undefined }))}
                />
              </div>

              <div>
                <Label>Date To</Label>
                <Input
                  type="datetime-local"
                  value={filters.date_to || ""}
                  onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value || undefined }))}
                />
              </div>
            </div>

            <div className="mt-4">
              <Input
                type="search"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Trail</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">
                  All Logs ({groupedLogs.all.length})
                </TabsTrigger>
                <TabsTrigger value="patient">
                  Patient ({groupedLogs.patient.length})
                </TabsTrigger>
                <TabsTrigger value="protocol">
                  Protocol ({groupedLogs.protocol.length})
                </TabsTrigger>
                <TabsTrigger value="auth">
                  Authentication ({groupedLogs.auth.length})
                </TabsTrigger>
                <TabsTrigger value="system">
                  System ({groupedLogs.system.length})
                </TabsTrigger>
              </TabsList>

              {Object.entries(groupedLogs).map(([key, logs]) => (
                <TabsContent key={key} value={key}>
                  <div className="space-y-4">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedLog(log)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="text-2xl">{getResourceIcon(log.resource_type)}</div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <Badge variant={getActionColor(log.action)}>
                                  {log.action.replace(/_/g, " ").toUpperCase()}
                                </Badge>
                                {log.resource_type && (
                                  <Badge variant="outline">{log.resource_type}</Badge>
                                )}
                              </div>
                              <div className="mt-1">
                                <span className="font-medium text-gray-900">{log.user_name || "Unknown User"}</span>
                                {log.user_role && (
                                  <span className="text-sm text-gray-600"> ({log.user_role})</span>
                                )}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {log.details.patient_id && `Patient ID: ${log.details.patient_id}`}
                                {log.details.protocol_name && ` • Protocol: ${log.details.protocol_name}`}
                                {log.details.provider_name && ` • Provider: ${log.details.provider_name}`}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500 text-right">
                            <div>{formatTimestamp(log.timestamp)}</div>
                            <div className="text-xs">{new Date(log.timestamp).toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {logs.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        No audit logs found matching your criteria
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Detail Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>Audit Log Details</CardTitle>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedLog(null)}
                  >
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Action</Label>
                    <p className="mt-1">
                      <Badge variant={getActionColor(selectedLog.action)}>
                        {selectedLog.action.replace(/_/g, " ").toUpperCase()}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <Label>Timestamp</Label>
                    <p className="mt-1">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label>User</Label>
                    <p className="mt-1">{selectedLog.user_name || "Unknown"}</p>
                  </div>
                  <div>
                    <Label>Role</Label>
                    <p className="mt-1">{selectedLog.user_role || "N/A"}</p>
                  </div>
                  {selectedLog.resource_type && (
                    <div>
                      <Label>Resource Type</Label>
                      <p className="mt-1">{selectedLog.resource_type}</p>
                    </div>
                  )}
                  {selectedLog.resource_id && (
                    <div>
                      <Label>Resource ID</Label>
                      <p className="mt-1 font-mono text-sm">{selectedLog.resource_id}</p>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <Label>Details</Label>
                  <pre className="mt-2 p-4 bg-gray-100 rounded-lg text-sm overflow-x-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>

                {selectedLog.user_agent && (
                  <div>
                    <Label>User Agent</Label>
                    <p className="mt-1 text-sm text-gray-600">{selectedLog.user_agent}</p>
                  </div>
                )}

                {selectedLog.ip_address && (
                  <div>
                    <Label>IP Address</Label>
                    <p className="mt-1 font-mono text-sm">{selectedLog.ip_address}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}