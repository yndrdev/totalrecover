'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Plus,
  Calendar,
  Clock,
  User,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  FileText,
  Filter,
  Download,
  Eye,
  ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Image from 'next/image'

// Demo progress reports data
const demoReports = [
  {
    id: '1',
    title: 'Foundation Work Progress - Section A',
    description: 'Completed foundation excavation and started concrete pouring for the north section.',
    progressPercentage: 35,
    submittedBy: 'Mike Johnson',
    submittedAt: '2024-01-15T10:30:00',
    status: 'approved',
    photos: 4,
    weatherConditions: 'sunny',
    temperature: 68,
    milestone: 'Foundation Complete',
    location: { latitude: 40.7128, longitude: -74.0060 }
  },
  {
    id: '2',
    title: 'Steel Frame Installation Update',
    description: 'Steel beams for floors 1-3 have been installed. Welding work in progress.',
    progressPercentage: 45,
    submittedBy: 'Sarah Chen',
    submittedAt: '2024-01-14T15:45:00',
    status: 'pending',
    photos: 6,
    weatherConditions: 'cloudy',
    temperature: 62,
    task: 'Steel beam installation',
    location: { latitude: 40.7128, longitude: -74.0060 }
  },
  {
    id: '3',
    title: 'Electrical Rough-in Progress',
    description: 'Completed electrical conduit installation for floors 1-2. Starting wire pulling tomorrow.',
    progressPercentage: 60,
    submittedBy: 'Tom Rodriguez',
    submittedAt: '2024-01-13T11:20:00',
    status: 'approved',
    photos: 8,
    weatherConditions: 'rainy',
    temperature: 55,
    task: 'Electrical rough-in',
    location: { latitude: 40.7128, longitude: -74.0060 }
  },
  {
    id: '4',
    title: 'Concrete Pour Completion - South Wing',
    description: 'Successfully completed concrete pour for south wing foundation despite weather challenges.',
    progressPercentage: 40,
    submittedBy: 'Mike Johnson',
    submittedAt: '2024-01-12T09:15:00',
    status: 'approved',
    photos: 5,
    weatherConditions: 'rainy',
    temperature: 52,
    milestone: 'Foundation Complete',
    location: { latitude: 40.7128, longitude: -74.0060 }
  }
]

export default function ProjectReportsPage() {
  const params = useParams()
  const router = useRouter()
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter reports
  const filteredReports = demoReports.filter(report => {
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.submittedBy.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Approved
        </Badge>
      case 'pending':
        return <Badge variant="secondary" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Pending Review
        </Badge>
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/dashboard/projects/${params.id}`)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Project
          </Button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Progress Reports</h1>
            <p className="text-muted-foreground mt-1">
              Track and review all project progress submissions
            </p>
          </div>

          <Button
            onClick={() => router.push(`/dashboard/projects/${params.id}/reports/new`)}
            className="gap-2 touch-target-large"
          >
            <Plus className="h-4 w-4" />
            Submit Progress Report
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div 
        className="mb-6 flex flex-col md:flex-row gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex-1">
          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending Review</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </motion.div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent 
                className="p-6"
                onClick={() => router.push(`/dashboard/projects/${params.id}/reports/${report.id}`)}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {/* Report Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold">{report.title}</h3>
                      {getStatusBadge(report.status)}
                    </div>
                    
                    <p className="text-muted-foreground mb-3">{report.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <User className="h-4 w-4" />
                        {report.submittedBy}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {formatDate(report.submittedAt)}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <ImageIcon className="h-4 w-4" />
                        {report.photos} photos
                      </div>
                      {report.milestone && (
                        <Badge variant="outline" className="gap-1">
                          <FileText className="h-3 w-3" />
                          {report.milestone}
                        </Badge>
                      )}
                      {report.task && (
                        <Badge variant="outline" className="gap-1">
                          <FileText className="h-3 w-3" />
                          {report.task}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Progress & Actions */}
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{report.progressPercentage}%</div>
                      <div className="text-xs text-muted-foreground">Progress</div>
                    </div>
                    
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <Card className="mt-8">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No reports found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your filters'
                : 'Start documenting project progress'}
            </p>
            <Button
              onClick={() => router.push(`/dashboard/projects/${params.id}/reports/new`)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Submit First Report
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}