'use client'

import { motion } from 'framer-motion'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  HardHat,
  Heart,
  FileWarning,
  Calendar,
  TrendingUp,
  Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { KPICard } from './kpi-card'

interface SafetyIncident {
  id: string
  type: 'minor' | 'major' | 'near-miss'
  title: string
  description: string
  location: string
  reportedBy: string
  date: string
  status: 'reported' | 'investigating' | 'resolved'
  severity: 'low' | 'medium' | 'high' | 'critical'
}

interface SafetyTraining {
  id: string
  name: string
  completionRate: number
  dueDate: string
  required: boolean
  certificationType: string
}

interface SafetyDashboardProps {
  safetyScore: number
  incidentRate: number
  daysWithoutIncident: number
  activeWorkers: number
  incidents: SafetyIncident[]
  trainings: SafetyTraining[]
  className?: string
}

const incidentTypeConfig = {
  'minor': { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: AlertTriangle },
  'major': { color: 'text-red-600', bg: 'bg-red-100', icon: AlertTriangle },
  'near-miss': { color: 'text-blue-600', bg: 'bg-blue-100', icon: Eye }
}

const severityConfig = {
  low: { color: 'border-green-200 text-green-700 bg-green-50' },
  medium: { color: 'border-yellow-200 text-yellow-700 bg-yellow-50' },
  high: { color: 'border-orange-200 text-orange-700 bg-orange-50' },
  critical: { color: 'border-red-200 text-red-700 bg-red-50' }
}

export function SafetyDashboard({
  safetyScore,
  incidentRate,
  daysWithoutIncident,
  activeWorkers,
  incidents,
  trainings,
  className
}: SafetyDashboardProps) {
  const recentIncidents = incidents.slice(0, 5)
  const overdueTrainings = trainings.filter(t => new Date(t.dueDate) < new Date())
  
  const safetyKPIs = [
    {
      title: 'Safety Score',
      value: `${safetyScore}%`,
      change: 2.1,
      changeType: 'increase' as const,
      icon: Shield,
      trend: 'up' as const,
      variant: 'safety' as const
    },
    {
      title: 'Days Without Incident',
      value: daysWithoutIncident,
      change: daysWithoutIncident > 30 ? 5.2 : -1.2,
      changeType: daysWithoutIncident > 30 ? 'increase' as const : 'decrease' as const,
      icon: CheckCircle,
      trend: daysWithoutIncident > 30 ? 'up' as const : 'down' as const,
      variant: 'default' as const
    },
    {
      title: 'Incident Rate',
      value: `${incidentRate}%`,
      change: -1.5,
      changeType: 'decrease' as const,
      icon: AlertTriangle,
      trend: 'down' as const,
      variant: 'default' as const
    },
    {
      title: 'Active Workers',
      value: activeWorkers,
      change: 8.3,
      changeType: 'increase' as const,
      icon: HardHat,
      trend: 'up' as const,
      variant: 'default' as const
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('space-y-6', className)}
    >
      {/* Safety KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {safetyKPIs.map((kpi, index) => (
          <KPICard
            key={kpi.title}
            {...kpi}
            className="animate-in"
            style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
          />
        ))}
      </div>

      <div className="grid grid-construction gap-6">
        {/* Recent Incidents */}
        <div className="col-span-full lg:col-span-8">
          <Card className="p-6 touch-target-large">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileWarning className="h-5 w-5 text-primary" />
                  Recent Safety Incidents
                </h3>
                <p className="text-sm text-muted-foreground">
                  Latest safety reports and incident tracking
                </p>
              </div>
              
              <Button variant="outline" size="sm">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report Incident
              </Button>
            </div>

            {recentIncidents.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h4 className="font-medium text-foreground mb-2">No Recent Incidents</h4>
                <p className="text-sm text-muted-foreground">
                  Great job maintaining a safe work environment!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentIncidents.map((incident, index) => {
                  const typeConfig = incidentTypeConfig[incident.type]
                  const TypeIcon = typeConfig.icon
                  
                  return (
                    <motion.div
                      key={incident.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors touch-target"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className={cn('p-2 rounded-lg', typeConfig.bg)}>
                            <TypeIcon className={cn('h-4 w-4', typeConfig.color)} />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground mb-1">
                              {incident.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {incident.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>📍 {incident.location}</span>
                              <span>👤 {incident.reportedBy}</span>
                              <span>📅 {new Date(incident.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <Badge 
                            variant="outline"
                            className={cn('text-xs', severityConfig[incident.severity].color)}
                          >
                            {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
                          </Badge>
                          
                          <Badge 
                            variant={
                              incident.status === 'resolved' ? 'default' : 
                              incident.status === 'investigating' ? 'secondary' : 'outline'
                            }
                            className="text-xs"
                          >
                            {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Safety Training */}
        <div className="col-span-full lg:col-span-4">
          <Card className="p-6 touch-target-large">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Safety Training
                </h3>
                <p className="text-sm text-muted-foreground">
                  Training completion and certification status
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {trainings.map((training, index) => {
                const isOverdue = new Date(training.dueDate) < new Date()
                const isDueSoon = new Date(training.dueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                
                return (
                  <motion.div
                    key={training.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={cn(
                      'p-4 border rounded-lg touch-target',
                      isOverdue ? 'border-red-200 bg-red-50' :
                      isDueSoon ? 'border-orange-200 bg-orange-50' :
                      'border-border hover:bg-accent/50'
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-foreground mb-1">
                          {training.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs">
                          {training.required && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              Required
                            </Badge>
                          )}
                          <span className="text-muted-foreground">
                            {training.certificationType}
                          </span>
                        </div>
                      </div>
                      
                      {isOverdue && (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Completion Rate</span>
                        <span className="font-medium">{training.completionRate}%</span>
                      </div>
                      <Progress value={training.completionRate} className="h-2" />
                      
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Due: {new Date(training.dueDate).toLocaleDateString()}</span>
                        <span>
                          {isOverdue ? 'Overdue' : isDueSoon ? 'Due Soon' : 'On Track'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {overdueTrainings.length > 0 && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-red-800 mb-1">Training Alerts</h5>
                    <p className="text-sm text-red-700">
                      {overdueTrainings.length} training(s) overdue. Please update certifications.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button className="w-full mt-4" variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Training
            </Button>
          </Card>
        </div>

        {/* Safety Metrics Overview */}
        <div className="col-span-full">
          <Card className="p-6 touch-target-large">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-primary" />
              Safety Performance Trends
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {safetyScore}%
                </div>
                <div className="text-sm font-medium text-green-700 mb-1">
                  Overall Safety Score
                </div>
                <div className="text-xs text-green-600">
                  +2.1% from last month
                </div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {daysWithoutIncident}
                </div>
                <div className="text-sm font-medium text-blue-700 mb-1">
                  Days Without Incident
                </div>
                <div className="text-xs text-blue-600">
                  Target: 365 days
                </div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  {incidents.filter(i => i.status !== 'resolved').length}
                </div>
                <div className="text-sm font-medium text-orange-700 mb-1">
                  Open Incidents
                </div>
                <div className="text-xs text-orange-600">
                  Require attention
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}