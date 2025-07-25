'use client'

import { motion } from 'framer-motion'
import { Cloud, Sun, CloudRain, AlertTriangle, Thermometer, Wind } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface WeatherWidgetProps {
  weather: {
    condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy'
    temperature: number
    humidity: number
    windSpeed: number
    uvIndex: number
    workSuitability: 'ideal' | 'caution' | 'poor' | 'unsafe'
    alerts?: string[]
  }
  location: string
  className?: string
  variant?: 'vertical' | 'horizontal'
}

const conditionConfig = {
  sunny: { icon: Sun, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  cloudy: { icon: Cloud, color: 'text-gray-500', bg: 'bg-gray-50' },
  rainy: { icon: CloudRain, color: 'text-blue-500', bg: 'bg-blue-50' },
  stormy: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' }
}

const suitabilityConfig = {
  ideal: { color: 'green', label: 'Ideal Work Conditions' },
  caution: { color: 'yellow', label: 'Work with Caution' },
  poor: { color: 'orange', label: 'Poor Work Conditions' },
  unsafe: { color: 'red', label: 'Unsafe - Consider Delays' }
}

export function WeatherWidget({ weather, location, className, variant = 'vertical' }: WeatherWidgetProps) {
  const condition = conditionConfig[weather.condition]
  const suitability = suitabilityConfig[weather.workSuitability]
  const Icon = condition.icon

  if (variant === 'horizontal') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className={className}
      >
        <Card className="p-4 touch-target">
          <div className="flex items-center gap-4">
            {/* Weather Icon */}
            <div className={cn('p-3 rounded-lg flex-shrink-0', condition.bg)}>
              <Icon className={cn('h-8 w-8', condition.color)} />
            </div>

            {/* Temperature */}
            <div className="flex-shrink-0">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">{weather.temperature}°</span>
                <span className="text-sm text-muted-foreground">F</span>
              </div>
              <p className="text-sm text-muted-foreground capitalize">
                {weather.condition}
              </p>
            </div>

            {/* Divider */}
            <div className="h-12 w-px bg-border flex-shrink-0" />

            {/* Metrics */}
            <div className="flex gap-4 flex-shrink-0">
              <div className="text-sm">
                <p className="text-muted-foreground">Humidity</p>
                <p className="font-medium">{weather.humidity}%</p>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">Wind</p>
                <p className="font-medium">{weather.windSpeed} mph</p>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">UV Index</p>
                <p className={cn(
                  'font-medium',
                  weather.uvIndex >= 8 ? 'text-red-600' :
                  weather.uvIndex >= 6 ? 'text-orange-600' :
                  weather.uvIndex >= 3 ? 'text-yellow-600' :
                  'text-green-600'
                )}>
                  {weather.uvIndex}
                </p>
              </div>
            </div>

            {/* Work Suitability Badge */}
            <div className="ml-auto">
              <Badge 
                variant="outline"
                className={cn(
                  'font-medium',
                  suitability.color === 'green' && 'border-green-200 text-green-700 bg-green-50',
                  suitability.color === 'yellow' && 'border-yellow-200 text-yellow-700 bg-yellow-50',
                  suitability.color === 'orange' && 'border-orange-200 text-orange-700 bg-orange-50',
                  suitability.color === 'red' && 'border-red-200 text-red-700 bg-red-50'
                )}
              >
                {suitability.label}
              </Badge>
            </div>
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className={className}
    >
      <Card className="p-6 touch-target-large">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">Weather</h3>
            <p className="text-sm text-muted-foreground">{location}</p>
          </div>
          
          <div className={cn('p-3 rounded-lg', condition.bg)}>
            <Icon className={cn('h-6 w-6', condition.color)} />
          </div>
        </div>

        {/* Main Weather Info */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">{weather.temperature}°</span>
              <span className="text-lg text-muted-foreground">F</span>
            </div>
            <p className="text-sm text-muted-foreground capitalize">
              {weather.condition}
            </p>
          </div>
          
          <div className="text-right space-y-1">
            <div className="flex items-center gap-1 text-sm">
              <Thermometer className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Humidity:</span>
              <span className="font-medium">{weather.humidity}%</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Wind className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Wind:</span>
              <span className="font-medium">{weather.windSpeed} mph</span>
            </div>
          </div>
        </div>

        {/* Work Suitability */}
        <div className="space-y-3">
          <Badge 
            variant="outline"
            className={cn(
              'w-full justify-center py-2 font-medium',
              suitability.color === 'green' && 'border-green-200 text-green-700 bg-green-50',
              suitability.color === 'yellow' && 'border-yellow-200 text-yellow-700 bg-yellow-50',
              suitability.color === 'orange' && 'border-orange-200 text-orange-700 bg-orange-50',
              suitability.color === 'red' && 'border-red-200 text-red-700 bg-red-50'
            )}
          >
            {suitability.label}
          </Badge>

          {/* Alerts */}
          {weather.alerts && weather.alerts.length > 0 && (
            <div className="space-y-2">
              {weather.alerts.map((alert, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-2 p-2 rounded-md bg-orange-50 border border-orange-200"
                >
                  <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-orange-700">{alert}</p>
                </div>
              ))}
            </div>
          )}

          {/* Additional Metrics */}
          <div className="pt-3 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">UV Index:</span>
              <span className={cn(
                'font-medium',
                weather.uvIndex >= 8 ? 'text-red-600' :
                weather.uvIndex >= 6 ? 'text-orange-600' :
                weather.uvIndex >= 3 ? 'text-yellow-600' :
                'text-green-600'
              )}>
                {weather.uvIndex} 
                {weather.uvIndex >= 8 ? ' (Very High)' :
                 weather.uvIndex >= 6 ? ' (High)' :
                 weather.uvIndex >= 3 ? ' (Moderate)' :
                 ' (Low)'
                }
              </span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}