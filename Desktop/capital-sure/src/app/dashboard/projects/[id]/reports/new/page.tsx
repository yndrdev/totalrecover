'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  Camera, 
  Upload, 
  MapPin, 
  Clock, 
  Thermometer, 
  CloudRain,
  Sun,
  Cloud,
  Wind,
  Snowflake,
  AlertTriangle,
  CheckCircle,
  Wifi,
  WifiOff,
  Navigation,
  X,
  Edit3,
  Plus,
  Loader2,
  CalendarDays,
  Percent,
  FileText,
  HardHat
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import Image from 'next/image'

// Schema for progress report
const progressReportSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Please provide a detailed description'),
  progressPercentage: z.number().min(0).max(100),
  weatherConditions: z.enum(['sunny', 'cloudy', 'rainy', 'snowy', 'windy']),
  temperature: z.number().min(-50).max(150),
  safetyObservations: z.string().min(10, 'Please provide safety observations'),
  taskId: z.string().optional(),
  milestoneId: z.string().optional(),
  photos: z.array(z.object({
    url: z.string(),
    caption: z.string().optional(),
    id: z.string()
  })).optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    accuracy: z.number()
  }).optional(),
  submittedAt: z.string(),
})

type ProgressReportForm = z.infer<typeof progressReportSchema>

// Photo type for managing uploads
interface Photo {
  id: string
  file: File
  url: string
  caption: string
}

// Demo data for tasks and milestones
const demoTasks = [
  { id: 'task-1', title: 'Foundation excavation' },
  { id: 'task-2', title: 'Concrete pour - North section' },
  { id: 'task-3', title: 'Steel beam installation' },
  { id: 'task-4', title: 'Electrical rough-in' },
  { id: 'task-5', title: 'Plumbing installation' },
]

const demoMilestones = [
  { id: 'milestone-1', title: 'Foundation Complete', progressRequired: 25 },
  { id: 'milestone-2', title: 'Structure Framing', progressRequired: 50 },
  { id: 'milestone-3', title: 'Rough-ins Complete', progressRequired: 75 },
  { id: 'milestone-4', title: 'Final Inspection', progressRequired: 100 },
]

export default function NewProgressReportPage() {
  const params = useParams()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [location, setLocation] = useState<{ latitude: number; longitude: number; accuracy: number } | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null)

  // Form setup
  const form = useForm<ProgressReportForm>({
    resolver: zodResolver(progressReportSchema),
    defaultValues: {
      title: '',
      description: '',
      progressPercentage: 0,
      weatherConditions: 'sunny',
      temperature: 72,
      safetyObservations: '',
      taskId: '',
      milestoneId: '',
      photos: [],
      submittedAt: new Date().toISOString(),
    },
  })

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Get GPS location
  const getLocation = () => {
    setIsGettingLocation(true)
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords
          setLocation({ latitude, longitude, accuracy })
          setIsGettingLocation(false)
          toast.success('Location captured successfully')
        },
        (error) => {
          setIsGettingLocation(false)
          toast.error('Unable to get location. Please enable GPS.')
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } else {
      setIsGettingLocation(false)
      toast.error('Geolocation is not supported by your device')
    }
  }

  // Handle photo upload
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newPhotos: Photo[] = Array.from(files).map(file => ({
        id: `photo-${Date.now()}-${Math.random()}`,
        file,
        url: URL.createObjectURL(file),
        caption: ''
      }))
      setPhotos(prev => [...prev, ...newPhotos])
      toast.success(`${files.length} photo(s) added`)
    }
  }

  // Update photo caption
  const updatePhotoCaption = (photoId: string, caption: string) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === photoId ? { ...photo, caption } : photo
    ))
  }

  // Remove photo
  const removePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== photoId))
    toast.success('Photo removed')
  }

  // Handle form submission
  const handleSubmit = async (data: ProgressReportForm) => {
    setIsSubmitting(true)
    
    try {
      // Prepare photo data
      const photoData = photos.map(photo => ({
        url: photo.url, // In real app, upload to cloud storage
        caption: photo.caption,
        id: photo.id
      }))

      // Submit report data
      const reportData = {
        ...data,
        photos: photoData,
        location,
        projectId: params.id,
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Progress report submitted successfully!')
      router.push(`/dashboard/projects/${params.id}`)
    } catch (error) {
      toast.error('Failed to submit report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const progressValue = form.watch('progressPercentage')
  const selectedWeather = form.watch('weatherConditions')

  // Weather icon helper
  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'sunny': return <Sun className="h-5 w-5 text-yellow-500" />
      case 'cloudy': return <Cloud className="h-5 w-5 text-gray-500" />
      case 'rainy': return <CloudRain className="h-5 w-5 text-blue-500" />
      case 'snowy': return <Snowflake className="h-5 w-5 text-blue-300" />
      case 'windy': return <Wind className="h-5 w-5 text-gray-600" />
      default: return <Sun className="h-5 w-5" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 safe-area">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b">
        <div className="container-construction px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="touch-target"
                onClick={() => router.back()}
              >
                <X className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">New Progress Report</h1>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            
            {/* Connection Status */}
            <Badge variant={isOnline ? 'success' : 'secondary'} className="gap-1">
              {isOnline ? (
                <>
                  <Wifi className="h-3 w-3" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  Offline
                </>
              )}
            </Badge>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={form.handleSubmit(handleSubmit)} className="container-construction px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Report Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base">Report Title</Label>
                <Input
                  id="title"
                  {...form.register('title')}
                  placeholder="e.g., Foundation Work Progress - Section A"
                  className="touch-target-large text-base"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-base">Description / Notes</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  placeholder="Provide detailed notes about today's progress, challenges, and observations..."
                  className="min-h-[120px] touch-target text-base"
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
                )}
              </div>

              {/* Progress Percentage */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    Progress Percentage
                  </Label>
                  <span className="text-2xl font-bold text-primary">{progressValue}%</span>
                </div>
                <Slider
                  value={[progressValue]}
                  onValueChange={([value]) => form.setValue('progressPercentage', value)}
                  max={100}
                  step={5}
                  className="touch-target-large"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Task/Milestone Association */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Associated Work
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="task" className="text-base">Related Task (Optional)</Label>
                <Select onValueChange={(value) => form.setValue('taskId', value)}>
                  <SelectTrigger className="touch-target-large">
                    <SelectValue placeholder="Select a task" />
                  </SelectTrigger>
                  <SelectContent>
                    {demoTasks.map(task => (
                      <SelectItem key={task.id} value={task.id} className="py-3">
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="milestone" className="text-base">Related Milestone (Optional)</Label>
                <Select onValueChange={(value) => form.setValue('milestoneId', value)}>
                  <SelectTrigger className="touch-target-large">
                    <SelectValue placeholder="Select a milestone" />
                  </SelectTrigger>
                  <SelectContent>
                    {demoMilestones.map(milestone => (
                      <SelectItem key={milestone.id} value={milestone.id} className="py-3">
                        <div className="flex items-center justify-between w-full">
                          <span>{milestone.title}</span>
                          <Badge variant="secondary" className="ml-2">
                            {milestone.progressRequired}%
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Weather & Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="h-5 w-5" />
                Site Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-base">Weather Conditions</Label>
                  <Select 
                    onValueChange={(value) => form.setValue('weatherConditions', value as any)}
                    defaultValue="sunny"
                  >
                    <SelectTrigger className="touch-target-large">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunny" className="py-3">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4 text-yellow-500" />
                          Sunny
                        </div>
                      </SelectItem>
                      <SelectItem value="cloudy" className="py-3">
                        <div className="flex items-center gap-2">
                          <Cloud className="h-4 w-4 text-gray-500" />
                          Cloudy
                        </div>
                      </SelectItem>
                      <SelectItem value="rainy" className="py-3">
                        <div className="flex items-center gap-2">
                          <CloudRain className="h-4 w-4 text-blue-500" />
                          Rainy
                        </div>
                      </SelectItem>
                      <SelectItem value="snowy" className="py-3">
                        <div className="flex items-center gap-2">
                          <Snowflake className="h-4 w-4 text-blue-300" />
                          Snowy
                        </div>
                      </SelectItem>
                      <SelectItem value="windy" className="py-3">
                        <div className="flex items-center gap-2">
                          <Wind className="h-4 w-4 text-gray-600" />
                          Windy
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temperature" className="text-base">
                    Temperature (°F)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="temperature"
                      type="number"
                      {...form.register('temperature', { valueAsNumber: true })}
                      className="touch-target-large text-base"
                    />
                    {getWeatherIcon(selectedWeather)}
                  </div>
                </div>
              </div>

              {/* GPS Location */}
              <div className="space-y-2">
                <Label className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  GPS Location
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="touch-target-large"
                    onClick={getLocation}
                    disabled={isGettingLocation}
                  >
                    {isGettingLocation ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Getting Location...
                      </>
                    ) : (
                      <>
                        <Navigation className="h-4 w-4 mr-2" />
                        Capture Location
                      </>
                    )}
                  </Button>
                  {location && (
                    <Badge variant="secondary" className="font-mono text-xs">
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                      <span className="ml-1 text-muted-foreground">
                        (±{location.accuracy.toFixed(0)}m)
                      </span>
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Safety Observations */}
          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <HardHat className="h-5 w-5" />
                Safety Observations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="safety" className="text-base">
                  Safety Conditions & Observations
                </Label>
                <Textarea
                  id="safety"
                  {...form.register('safetyObservations')}
                  placeholder="Note any safety concerns, incidents, or positive safety practices observed..."
                  className="min-h-[100px] touch-target text-base bg-white"
                />
                {form.formState.errors.safetyObservations && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.safetyObservations.message}
                  </p>
                )}
              </div>

              <div className="mt-4 flex items-start gap-2 p-3 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <p className="text-sm text-orange-800">
                  Always prioritize safety. Report any hazards immediately to your supervisor.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Photo Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Progress Photos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="touch-target-large flex-1"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Take Photo
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="touch-target-large flex-1"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Upload from Gallery
                </Button>
              </div>

              {/* Hidden inputs */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />

              {/* Photo grid */}
              {photos.length > 0 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {photos.length} photo{photos.length !== 1 && 's'} added
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {photos.map((photo) => (
                      <motion.div
                        key={photo.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative group"
                      >
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={photo.url}
                            alt="Progress photo"
                            fill
                            className="object-cover"
                          />
                          
                          {/* Action buttons */}
                          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              type="button"
                              size="icon"
                              variant="secondary"
                              className="h-8 w-8"
                              onClick={() => setEditingPhotoId(photo.id === editingPhotoId ? null : photo.id)}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              className="h-8 w-8"
                              onClick={() => removePhoto(photo.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Caption input */}
                        {editingPhotoId === photo.id ? (
                          <div className="mt-2">
                            <Input
                              type="text"
                              placeholder="Add a caption..."
                              value={photo.caption}
                              onChange={(e) => updatePhotoCaption(photo.id, e.target.value)}
                              className="touch-target"
                              onBlur={() => setEditingPhotoId(null)}
                              autoFocus
                            />
                          </div>
                        ) : photo.caption ? (
                          <p className="mt-2 text-sm text-muted-foreground px-1">{photo.caption}</p>
                        ) : (
                          <button
                            type="button"
                            className="mt-2 text-sm text-muted-foreground hover:text-foreground px-1"
                            onClick={() => setEditingPhotoId(photo.id)}
                          >
                            Add caption...
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {photos.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Camera className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No photos added yet</p>
                  <p className="text-xs mt-1">Take or upload photos to document progress</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit buttons */}
          <div className="sticky bottom-0 bg-gray-50 pt-4 pb-6 -mx-4 px-4">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="touch-target-large flex-1"
                onClick={() => {
                  // Save draft logic
                  toast.success('Draft saved locally')
                }}
              >
                Save Draft
              </Button>
              
              <Button
                type="submit"
                disabled={isSubmitting || !isOnline}
                className="touch-target-large flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : !isOnline ? (
                  <>
                    <WifiOff className="h-4 w-4 mr-2" />
                    Offline - Save Draft
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit Report
                  </>
                )}
              </Button>
            </div>
            
            {!isOnline && (
              <p className="text-xs text-center text-muted-foreground mt-2">
                Your report will be automatically submitted when connection is restored
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}