"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/design-system/Button";
import { Card } from "@/components/ui/design-system/Card";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  RotateCcw,
  CheckCircle,
  Clock,
  Target
} from "lucide-react";

interface VideoMessageProps {
  video: {
    id: string;
    title: string;
    description?: string;
    url: string;
    duration?: number;
    thumbnail?: string;
    type: 'exercise' | 'education' | 'demonstration';
  };
  onVideoComplete?: (videoId: string, watchTime: number) => void;
  onVideoStart?: (videoId: string) => void;
  autoPlay?: boolean;
  showControls?: boolean;
  allowFullscreen?: boolean;
}

export function VideoMessage({ 
  video, 
  onVideoComplete, 
  onVideoStart,
  autoPlay = false,
  showControls = true,
  allowFullscreen = true
}: VideoMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const watchTimeRef = useRef(0);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
      watchTimeRef.current = videoElement.currentTime;
    };

    const handlePlay = () => {
      setIsPlaying(true);
      if (onVideoStart) {
        onVideoStart(video.id);
      }
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setIsCompleted(true);
      setWatchTime(watchTimeRef.current);
      if (onVideoComplete) {
        onVideoComplete(video.id, watchTimeRef.current);
      }
    };

    const handleError = () => {
      setError("Failed to load video");
      setIsLoading(false);
    };

    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('ended', handleEnded);
    videoElement.addEventListener('error', handleError);

    return () => {
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('ended', handleEnded);
      videoElement.removeEventListener('error', handleError);
    };
  }, [video.id, onVideoStart, onVideoComplete]);

  const togglePlayPause = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play();
    }
  };

  const toggleMute = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    videoElement.muted = !videoElement.muted;
    setIsMuted(videoElement.muted);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    videoElement.currentTime = newTime;
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getVideoTypeIcon = () => {
    {/* <thinking>
    Healthcare Context: Video type indicators for different content
    - Exercise videos need clear marking for physical therapy content
    - Education videos are informational resources
    - Demonstration videos show proper technique
    Using primary blue for consistency with healthcare system branding
    </thinking> */}
    switch (video.type) {
      case 'exercise':
        return <Target className="w-4 h-4 text-secondary" />;
      case 'education':
        return <Clock className="w-4 h-4 text-primary" />;
      case 'demonstration':
        return <Play className="w-4 h-4 text-accent-purple" />;
      default:
        return <Play className="w-4 h-4 text-primary" />;
    }
  };

  const getVideoTypeBadge = () => {
    {/* <thinking>
    Healthcare Context: Content type badges
    - Exercise: Green for active/physical content
    - Education: Blue for informational content
    - Demonstration: Purple for instructional content
    Using proper semantic colors from design system
    </thinking> */}
    switch (video.type) {
      case 'exercise':
        return <Badge variant="secondary" className="bg-secondary-light/20 text-secondary-dark">Exercise</Badge>;
      case 'education':
        return <Badge variant="secondary" className="bg-primary-light/20 text-primary-navy">Education</Badge>;
      case 'demonstration':
        return <Badge variant="secondary" className="bg-accent-purple/20 text-accent-purple">Demo</Badge>;
      default:
        return <Badge variant="outline" className="border-primary-light text-primary">Video</Badge>;
    }
  };

  if (error) {
    return (
      <Card variant="error" className="max-w-md border-error">
        <div className="p-4">
          <div className="text-center space-y-2">
            <div className="text-error">⚠️</div>
            <p className="text-sm text-error">{error}</p>
            <p className="text-xs text-error/70">Please try again later</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-md">
      <div className="overflow-hidden">
        <div className="relative">
          {/* Video Element */}
          <video
            ref={videoRef}
            className="w-full h-48 object-cover bg-black"
            src={video.url}
            poster={video.thumbnail}
            muted={isMuted}
            autoPlay={autoPlay}
            playsInline
            preload="metadata"
          />
          
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p className="text-sm">Loading video...</p>
              </div>
            </div>
          )}

          {/* Play/Pause Overlay */}
          {!isLoading && (
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
              <Button
                variant="ghost"
                size="lg"
                onClick={togglePlayPause}
                className="text-white hover:text-white hover:bg-white/20 rounded-full w-16 h-16 opacity-0 hover:opacity-100 transition-opacity"
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
              </Button>
            </div>
          )}

          {/* Completed Overlay */}
          {isCompleted && (
            <div className="absolute top-2 right-2">
              <div className="bg-secondary text-white rounded-full p-2 shadow-lg">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getVideoTypeIcon()}
              <h3 className="font-medium text-gray-900 text-sm">{video.title}</h3>
            </div>
            {getVideoTypeBadge()}
          </div>

          {video.description && (
            <p className="text-xs text-gray-600">{video.description}</p>
          )}

          {/* Video Controls */}
          {showControls && !isLoading && (
            <div className="space-y-2">
              {/* Progress Bar */}
              <div 
                className="w-full bg-gray-200 rounded-full h-2 cursor-pointer"
                onClick={handleSeek}
              >
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-100"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlayPause}
                    className="text-gray-700 hover:text-primary hover:bg-primary-light/10 p-1 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="text-gray-700 hover:text-primary hover:bg-primary-light/10 p-1 transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = 0;
                        setCurrentTime(0);
                      }
                    }}
                    className="text-gray-700 hover:text-primary hover:bg-primary-light/10 p-1 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                  {allowFullscreen && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.requestFullscreen();
                        }
                      }}
                      className="text-gray-700 hover:text-primary hover:bg-primary-light/10 p-1 transition-colors"
                    >
                      <Maximize className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Completion Message */}
          {isCompleted && (
            <div className="bg-secondary-light/10 border border-secondary rounded-lg p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-secondary" />
                <span className="text-sm text-secondary-dark font-medium">Video completed!</span>
              </div>
              <p className="text-xs text-secondary mt-1">
                Watch time: {formatTime(watchTime)}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}