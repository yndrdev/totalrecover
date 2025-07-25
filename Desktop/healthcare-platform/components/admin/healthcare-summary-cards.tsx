"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/design-system/Card";
import { useEffect, useState } from "react";
import { User, UserCheck, Activity, AlertTriangle } from "lucide-react";
import { colors } from '@/lib/design-system/constants';

function CountAnimation({ number }: { number: number }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const duration = 1000;
    const steps = 50;
    const increment = number / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= number) {
        setCount(number);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [number]);
  
  return <>{count}</>;
}

interface SummaryData {
  totalPatients: number;
  activeProviders: number;
  completedTasks: number;
  systemAlerts: number;
  monthlyMetrics: {
    patientGrowth: number;
    taskCompletion: number;
    revenue: number;
  };
}

export function HealthcareSummaryCards({ data }: { data: SummaryData }) {
  {/* <thinking>
  Visual Design: Summary cards with new design system colors
  Healthcare Context: Key metrics for healthcare administrators
  UX Design: Grid layout with animated counters
  </thinking> */}
  
  return (
    <div className="overflow-hidden rounded-md border border-gray-300">
      <div className="grid md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:bg-gray-50 rounded-none border-y-transparent border-s-transparent transition-colors">
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <h3 className="text-gray-900 font-semibold">Total Patients</h3>
            <div className="absolute end-4 top-0 flex size-12 items-center justify-center rounded-full bg-blue-100 p-4">
              <User className="size-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="font-display text-3xl font-bold text-gray-900">
              <CountAnimation number={data.totalPatients} />
            </div>
            <p className="text-xs text-gray-600">
              <span className="text-green-600">+{data.monthlyMetrics.patientGrowth}%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:bg-gray-50 rounded-none border-y-transparent border-s-transparent transition-colors">
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <h3 className="text-gray-900 font-semibold">Active Providers</h3>
            <div className="absolute end-4 top-0 flex size-12 items-center justify-center rounded-full bg-green-100 p-4">
              <UserCheck className="size-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="font-display text-3xl font-bold text-gray-900">
              <CountAnimation number={data.activeProviders} />
            </div>
            <p className="text-xs text-gray-600">
              <span className="text-green-600">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:bg-gray-50 rounded-none border-y-transparent border-s-transparent transition-colors">
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <h3 className="text-gray-900 font-semibold">Completed Tasks</h3>
            <div className="absolute end-4 top-0 flex size-12 items-center justify-center rounded-full bg-purple-100 p-4">
              <Activity className="size-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="font-display text-3xl font-bold text-gray-900">
              <CountAnimation number={data.completedTasks} />
            </div>
            <p className="text-xs text-gray-600">
              <span className="text-green-600">+{data.monthlyMetrics.taskCompletion}%</span> completion rate
            </p>
          </CardContent>
        </Card>

        <Card className="hover:bg-gray-50 rounded-none border-transparent transition-colors">
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <h3 className="text-gray-900 font-semibold">System Alerts</h3>
            <div className="absolute end-4 top-0 flex size-12 items-center justify-center rounded-full bg-orange-100 p-4">
              <AlertTriangle className="size-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="font-display text-3xl font-bold text-gray-900">
              <CountAnimation number={data.systemAlerts} />
            </div>
            <p className="text-xs text-gray-600">
              <span className="text-orange-600">Requires attention</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}