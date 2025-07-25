"use client";

import { useState } from "react";
import { Button } from "@/components/ui/design-system/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/design-system/Card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  CheckCircle, 
  Clock, 
  Activity, 
  Dumbbell, 
  FileText,
  Heart,
  Target,
  Calendar,
  PlayCircle,
  Pause,
  SkipForward
} from "lucide-react";

{/* <thinking>
Healthcare Context: Task card component for patient recovery tasks
- Update all old TJV colors to new design system
- Maintain clear visual hierarchy for task types
- Ensure accessibility for patient interaction
- Professional medical interface appearance
</thinking> */}

interface TaskCardProps {
  task: {
    id: string;
    type: 'exercise' | 'assessment' | 'form' | 'education' | 'walking';
    title: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'completed';
    metadata?: {
      // Exercise specific
      reps?: number;
      sets?: number;
      duration?: number;
      video_url?: string;
      
      // Assessment specific
      questions?: any[];
      scale?: string;
      
      // Walking specific
      target_steps?: number;
      current_steps?: number;
      
      // General
      estimated_time?: number;
      instructions?: string;
    };
  };
  onStart?: (taskId: string) => void;
  onComplete?: (taskId: string, data?: any) => void;
  showProgress?: boolean;
  allowVoiceCompletion?: boolean;
}

export function TaskCard({ 
  task, 
  onStart, 
  onComplete, 
  showProgress = true,
  allowVoiceCompletion = true 
}: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  
  const getTaskIcon = () => {
    switch (task.type) {
      case 'exercise':
        return <Dumbbell className="w-5 h-5 text-blue-600" />;
      case 'assessment':
        return <Activity className="w-5 h-5 text-blue-600" />;
      case 'form':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'education':
        return <Target className="w-5 h-5 text-blue-600" />;
      case 'walking':
        return <Heart className="w-5 h-5 text-blue-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
    }
  };
  
  const getStatusBadge = () => {
    switch (task.status) {
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">✅ Completed</Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">⏳ In Progress</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-gray-200 text-gray-900">📋 Pending</Badge>;
      default:
        return null;
    }
  };

  const handleStartTask = () => {
    if (onStart) {
      onStart(task.id);
    }
    setIsExpanded(true);
  };

  const handleCompleteTask = (data?: any) => {
    if (onComplete) {
      onComplete(task.id, data);
    }
  };

  const renderPainRatingScale = () => {
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-900 font-medium">Rate your pain level (1-10):</p>
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
            <Button
              key={rating}
              variant={selectedRating === rating ? "primary" : "secondary"}
              size="sm"
              onClick={() => setSelectedRating(rating)}
              className={`h-12 text-lg font-bold ${
                selectedRating === rating 
                  ? "bg-blue-600 text-white" 
                  : "border-gray-200 text-gray-900 hover:bg-gray-50"
              }`}
            >
              {rating}
            </Button>
          ))}
        </div>
        {selectedRating && (
          <div className="pt-2">
            <Button
              onClick={() => handleCompleteTask({ pain_level: selectedRating })}
              variant="primary"
              className="w-full"
            >
              Submit Rating
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderExerciseContent = () => {
    const { reps, sets, duration, video_url } = task.metadata || {};
    
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          {reps && sets && (
            <span className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              {reps} reps × {sets} sets
            </span>
          )}
          {duration && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {duration} minutes
            </span>
          )}
        </div>
        
        {video_url && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">Exercise Video</span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isVideoPlaying ? 'Pause' : 'Play'}
              </Button>
            </div>
            
            {isVideoPlaying && (
              <div className="mt-3 bg-black rounded-lg overflow-hidden">
                <video 
                  width="100%" 
                  height="200" 
                  controls 
                  autoPlay
                  className="w-full h-48 object-cover"
                  onEnded={() => setIsVideoPlaying(false)}
                >
                  <source src={video_url} type="video/mp4" />
                  <div className="bg-gray-100 h-48 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <PlayCircle className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">Video not supported</p>
                      <p className="text-xs">({video_url})</p>
                    </div>
                  </div>
                </video>
              </div>
            )}
          </div>
        )}
        
        <div className="flex gap-2 pt-2">
          <Button
            variant="secondary"
            onClick={() => handleCompleteTask({ completed: true })}
            className="flex-1"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark Complete
          </Button>
          {allowVoiceCompletion && (
            <Button
              variant="secondary"
              size="sm"
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            >
              Need Help?
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderWalkingProgress = () => {
    const { target_steps, current_steps } = task.metadata || {};
    const progress = target_steps ? Math.min((current_steps || 0) / target_steps * 100, 100) : 0;
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Progress:</span>
          <span className="font-medium text-gray-900">
            {current_steps || 0} / {target_steps || 0} steps
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="text-center">
          <span className="text-lg font-bold text-blue-600">{Math.round(progress)}%</span>
          <p className="text-sm text-gray-600">Complete</p>
        </div>
        
        {progress >= 100 && (
          <Button
            onClick={() => handleCompleteTask({ steps_completed: current_steps })}
            variant="primary"
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Goal Achieved! 🎉
          </Button>
        )}
      </div>
    );
  };

  const renderTaskContent = () => {
    switch (task.type) {
      case 'assessment':
        return renderPainRatingScale();
      case 'exercise':
        return renderExerciseContent();
      case 'walking':
        return renderWalkingProgress();
      default:
        return (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">{task.description}</p>
            <Button
              onClick={() => handleCompleteTask()}
              variant="primary"
              className="w-full"
            >
              Complete Task
            </Button>
          </div>
        );
    }
  };

  return (
    <Card className="max-w-sm bg-white border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getTaskIcon()}
            <h3 className="text-gray-900 text-base font-semibold">{task.title}</h3>
          </div>
          {getStatusBadge()}
        </div>
        
        {task.description && (
          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
        )}
        
        {task.metadata?.estimated_time && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {task.metadata.estimated_time} minutes
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        {task.status === 'pending' && !isExpanded ? (
          <Button
            onClick={handleStartTask}
            variant="primary"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Task
          </Button>
        ) : task.status === 'completed' ? (
          <div className="text-center py-4">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-green-800 font-medium">Task Completed!</p>
          </div>
        ) : (
          renderTaskContent()
        )}
      </CardContent>
    </Card>
  );
}