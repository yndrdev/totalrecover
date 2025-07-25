'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  Camera, 
  Upload, 
  Users, 
  Clock, 
  Thermometer, 
  AlertTriangle,
  CheckCircle 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const dailyReportSchema = z.object({
  date: z.string(),
  weather: z.string(),
  temperature: z.number().min(-50).max(150),
  workHours: z.number().min(0).max(24),
  crewSize: z.number().min(1).max(100),
  workCompleted: z.string().min(10, 'Please provide more detail'),
  materials: z.string().optional(),
  equipmentUsed: z.string().optional(),
  safetyIncidents: z.enum(['none', 'minor', 'major']),
  incidentDescription: z.string().optional(),
  delays: z.string().optional(),
  photos: z.array(z.string()).optional(),
  nextDayPlan: z.string().min(10, 'Please provide next day plan'),
})

type DailyReportForm = z.infer<typeof dailyReportSchema>

interface DailyReportFormProps {
  onSubmit: (data: DailyReportForm) => Promise<void>
  className?: string
}

export function DailyReportForm({ onSubmit, className }: DailyReportFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])

  const form = useForm<DailyReportForm>({
    resolver: zodResolver(dailyReportSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      weather: '',
      temperature: 70,
      workHours: 8,
      crewSize: 1,
      workCompleted: '',
      materials: '',
      equipmentUsed: '',
      safetyIncidents: 'none',
      incidentDescription: '',
      delays: '',
      photos: [],
      nextDayPlan: '',
    },
  })

  const handleSubmit = async (data: DailyReportForm) => {
    setIsSubmitting(true)
    try {
      await onSubmit({ ...data, photos })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      // In a real app, upload to cloud storage and get URLs
      const newPhotos = Array.from(files).map(file => URL.createObjectURL(file))
      setPhotos(prev => [...prev, ...newPhotos])
    }
  }

  const safetyIncident = form.watch('safetyIncidents')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="p-6 touch-target-large">
        <div className="mb-6">
          <h2 className="text-title font-semibold mb-2">Daily Progress Report</h2>
          <p className="text-sm text-muted-foreground">
            Document today&apos;s work progress, materials, and safety information
          </p>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                {...form.register('date')}
                className="touch-target"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="weather">Weather</Label>
              <Select onValueChange={(value) => form.setValue('weather', value)}>
                <SelectTrigger className="touch-target">
                  <SelectValue placeholder="Select weather" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sunny">☀️ Sunny</SelectItem>
                  <SelectItem value="cloudy">☁️ Cloudy</SelectItem>
                  <SelectItem value="rainy">🌧️ Rainy</SelectItem>
                  <SelectItem value="snowy">❄️ Snowy</SelectItem>
                  <SelectItem value="windy">💨 Windy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature" className="flex items-center gap-1">
                <Thermometer className="h-4 w-4" />
                Temperature (°F)
              </Label>
              <Input
                id="temperature"
                type="number"
                {...form.register('temperature', { valueAsNumber: true })}
                className="touch-target"
              />
            </div>
          </div>

          {/* Crew & Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="crewSize" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Crew Size
              </Label>
              <Input
                id="crewSize"
                type="number"
                min="1"
                {...form.register('crewSize', { valueAsNumber: true })}
                className="touch-target"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workHours" className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Work Hours
              </Label>
              <Input
                id="workHours"
                type="number"
                min="0"
                max="24"
                step="0.5"
                {...form.register('workHours', { valueAsNumber: true })}
                className="touch-target"
              />
            </div>
          </div>

          {/* Work Description */}
          <div className="space-y-2">
            <Label htmlFor="workCompleted">Work Completed Today</Label>
            <Textarea
              id="workCompleted"
              {...form.register('workCompleted')}
              placeholder="Describe the work completed today in detail..."
              className="min-h-[100px] touch-target"
            />
            {form.formState.errors.workCompleted && (
              <p className="text-sm text-red-600">
                {form.formState.errors.workCompleted.message}
              </p>
            )}
          </div>

          {/* Materials & Equipment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="materials">Materials Used</Label>
              <Textarea
                id="materials"
                {...form.register('materials')}
                placeholder="List materials used today..."
                className="touch-target"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipmentUsed">Equipment Used</Label>
              <Textarea
                id="equipmentUsed"
                {...form.register('equipmentUsed')}
                placeholder="List equipment and machinery used..."
                className="touch-target"
              />
            </div>
          </div>

          {/* Safety Section */}
          <div className="space-y-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h3 className="font-semibold text-orange-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Safety Information
            </h3>
            
            <div className="space-y-2">
              <Label>Safety Incidents</Label>
              <Select 
                onValueChange={(value) => form.setValue('safetyIncidents', value as 'none' | 'minor' | 'major')}
                defaultValue="none"
              >
                <SelectTrigger className="touch-target">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      No incidents
                    </div>
                  </SelectItem>
                  <SelectItem value="minor">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      Minor incident
                    </div>
                  </SelectItem>
                  <SelectItem value="major">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      Major incident
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {safetyIncident !== 'none' && (
              <div className="space-y-2">
                <Label htmlFor="incidentDescription">Incident Description</Label>
                <Textarea
                  id="incidentDescription"
                  {...form.register('incidentDescription')}
                  placeholder="Describe the safety incident in detail..."
                  className="touch-target"
                />
              </div>
            )}
          </div>

          {/* Delays */}
          <div className="space-y-2">
            <Label htmlFor="delays">Delays or Issues</Label>
            <Textarea
              id="delays"
              {...form.register('delays')}
              placeholder="Report any delays, issues, or obstacles encountered..."
              className="touch-target"
            />
          </div>

          {/* Photo Upload */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Progress Photos
            </Label>
            
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                className="touch-target-large"
                onClick={() => document.getElementById('photo-upload')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Photos
              </Button>
              
              <input
                id="photo-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              
              <span className="text-sm text-muted-foreground">
                {photos.length} photo(s) selected
              </span>
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={photo}
                      alt={`Progress photo ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => setPhotos(prev => prev.filter((_, i) => i !== index))}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Next Day Plan */}
          <div className="space-y-2">
            <Label htmlFor="nextDayPlan">Next Day Plan</Label>
            <Textarea
              id="nextDayPlan"
              {...form.register('nextDayPlan')}
              placeholder="Outline the plan for tomorrow's work..."
              className="touch-target"
            />
            {form.formState.errors.nextDayPlan && (
              <p className="text-sm text-red-600">
                {form.formState.errors.nextDayPlan.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 touch-target-large"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Daily Report'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="touch-target-large"
            >
              Save Draft
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  )
}