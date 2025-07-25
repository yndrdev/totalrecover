"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Video, 
  Plus, 
  Edit3, 
  Eye, 
  Search, 
  Play,
  Pause,
  Upload,
  Download,
  Share,
  Clock,
  User,
  BarChart3,
  Tag,
  Calendar,
  Trash2,
  ExternalLink
} from "lucide-react";

interface VideoContent {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number; // in seconds
  thumbnailUrl: string;
  videoUrl: string;
  uploadedBy: string;
  uploadedAt: string;
  updatedAt: string;
  tags: string[];
  viewCount: number;
  isActive: boolean;
  fileSize: number; // in MB
  resolution: string;
  format: string;
}

interface VideoAssignment {
  id: string;
  videoId: string;
  patientId: string;
  patientName: string;
  videoTitle: string;
  assignedAt: string;
  viewedAt?: string;
  completedAt?: string;
  status: 'assigned' | 'viewed' | 'completed';
  notes?: string;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [assignments, setAssignments] = useState<VideoAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('library');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoContent | null>(null);
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    category: 'education',
    tags: [''],
    videoFile: null as File | null
  });
  
  const router = useRouter();

  useEffect(() => {
    // Use mock data instead of database calls
    setTimeout(() => {
      setVideos([
        {
          id: '1',
          title: 'Knee Flexion Exercises',
          description: 'Post-surgery knee flexibility exercises for rehabilitation',
          category: 'exercise',
          duration: 420, // 7 minutes
          thumbnailUrl: '/api/placeholder/400/250',
          videoUrl: '/videos/knee-flexion.mp4',
          uploadedBy: 'Dr. Sarah Martinez',
          uploadedAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          tags: ['knee', 'flexion', 'post-surgery', 'rehabilitation'],
          viewCount: 156,
          isActive: true,
          fileSize: 45.2,
          resolution: '1080p',
          format: 'MP4'
        },
        {
          id: '2',
          title: 'Understanding Your Surgery',
          description: 'Educational video explaining the knee replacement procedure',
          category: 'education',
          duration: 600, // 10 minutes
          thumbnailUrl: '/api/placeholder/400/250',
          videoUrl: '/videos/understanding-surgery.mp4',
          uploadedBy: 'Dr. Michael Chen',
          uploadedAt: '2024-01-10T14:30:00Z',
          updatedAt: '2024-01-10T14:30:00Z',
          tags: ['education', 'surgery', 'knee replacement', 'procedure'],
          viewCount: 284,
          isActive: true,
          fileSize: 72.8,
          resolution: '1080p',
          format: 'MP4'
        },
        {
          id: '3',
          title: 'Motivation for Recovery',
          description: 'Inspirational stories from successful knee replacement patients',
          category: 'motivation',
          duration: 900, // 15 minutes
          thumbnailUrl: '/api/placeholder/400/250',
          videoUrl: '/videos/recovery-motivation.mp4',
          uploadedBy: 'Healthcare Team',
          uploadedAt: '2024-01-08T09:15:00Z',
          updatedAt: '2024-01-08T09:15:00Z',
          tags: ['motivation', 'success stories', 'recovery', 'inspiration'],
          viewCount: 98,
          isActive: true,
          fileSize: 112.5,
          resolution: '1080p',
          format: 'MP4'
        }
      ]);

      setAssignments([
        {
          id: '1',
          videoId: '1',
          patientId: 'patient-1',
          patientName: 'Sarah Johnson',
          videoTitle: 'Knee Flexion Exercises',
          assignedAt: '2024-01-16T10:00:00Z',
          viewedAt: '2024-01-16T14:30:00Z',
          status: 'viewed'
        },
        {
          id: '2',
          videoId: '2',
          patientId: 'patient-2',
          patientName: 'Robert Smith',
          videoTitle: 'Understanding Your Surgery',
          assignedAt: '2024-01-15T11:00:00Z',
          completedAt: '2024-01-15T16:45:00Z',
          status: 'completed'
        }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'education': return 'bg-blue-100 text-blue-800';
      case 'exercise': return 'bg-green-100 text-green-800';
      case 'procedure': return 'bg-purple-100 text-purple-800';
      case 'motivation': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'outline';
      case 'viewed': return 'secondary';
      case 'completed': return 'default';
      default: return 'secondary';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (mb: number) => {
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(1)} GB`;
  };

  const handleUploadVideo = async () => {
    if (!newVideo.videoFile) return;

    // In a real app, this would upload to cloud storage
    const newVideoData: VideoContent = {
      id: Date.now().toString(),
      title: newVideo.title,
      description: newVideo.description,
      category: newVideo.category,
      tags: newVideo.tags.filter(tag => tag.trim() !== ''),
      duration: 0, // Would be extracted from video
      thumbnailUrl: '', // TODO: Generate actual thumbnail from video
      videoUrl: URL.createObjectURL(newVideo.videoFile),
      uploadedBy: 'Dr. Healthcare Provider',
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewCount: 0,
      isActive: true,
      fileSize: newVideo.videoFile.size / (1024 * 1024), // Convert to MB
      resolution: '1080p',
      format: 'MP4'
    };

    setVideos([...videos, newVideoData]);
    setShowUploadModal(false);
    setNewVideo({
      title: '',
      description: '',
      category: 'education',
      tags: [''],
      videoFile: null
    });
  };

  const addTag = () => {
    setNewVideo({
      ...newVideo,
      tags: [...newVideo.tags, '']
    });
  };

  const updateTag = (index: number, value: string) => {
    const updatedTags = [...newVideo.tags];
    updatedTags[index] = value;
    setNewVideo({
      ...newVideo,
      tags: updatedTags
    });
  };

  const removeTag = (index: number) => {
    setNewVideo({
      ...newVideo,
      tags: newVideo.tags.filter((_, i) => i !== index)
    });
  };

  const assignVideo = async (videoId: string, patientId: string) => {
    const video = videos.find(v => v.id === videoId);
    if (!video) return;

    const newAssignment: VideoAssignment = {
      id: Date.now().toString(),
      videoId,
      patientId,
      patientName: 'Patient Name', // Would come from patient data
      videoTitle: video.title,
      assignedAt: new Date().toISOString(),
      status: 'assigned'
    };

    setAssignments([...assignments, newAssignment]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#006DB1' }}></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="secondary"
            onClick={() => router.push("/provider/content")}
            className="mb-4"
          >
            ← Back to Content
          </Button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Video Library</h1>
              <p className="text-gray-600 mt-2">Manage educational videos and patient assignments</p>
            </div>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => setActiveTab('library')}
                className={activeTab === 'library' ? 'text-white' : ''}
                style={activeTab === 'library' ? { backgroundColor: '#006DB1' } : {}}
              >
                Video Library
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveTab('assignments')}
                className={activeTab === 'assignments' ? 'text-white' : ''}
                style={activeTab === 'assignments' ? { backgroundColor: '#006DB1' } : {}}
              >
                Assignments
              </Button>
              <Button
                onClick={() => setShowUploadModal(true)}
                style={{ backgroundColor: '#006DB1' }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Video
              </Button>
            </div>
          </div>
        </div>

        {activeTab === 'library' ? (
          <>
            {/* Search and Filters */}
            <div className="mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search videos..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="exercise">Exercise</SelectItem>
                        <SelectItem value="procedure">Procedure</SelectItem>
                        <SelectItem value="motivation">Motivation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Video Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => (
                <Card key={video.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="relative">
                    <img 
                      src={video.thumbnailUrl} 
                      alt={video.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Button
                        variant="secondary"
                        size="lg"
                        onClick={() => {/* Play video */}}
                      >
                        <Play className="h-6 w-6 mr-2" />
                        Play
                      </Button>
                    </div>
                    <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                      {formatDuration(video.duration)}
                    </div>
                  </div>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{video.title}</CardTitle>
                        <Badge className={getCategoryColor(video.category)}>
                          {video.category}
                        </Badge>
                      </div>
                      <Video className="h-6 w-6" style={{ color: '#006DB1' }} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{video.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {formatDuration(video.duration)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        {video.viewCount} views
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        {formatFileSize(video.fileSize)} • {video.resolution}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(video.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {video.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedVideo(video);
                          setShowAssignModal(true);
                        }}
                      >
                        Assign
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {/* Share video */}}
                      >
                        <Share className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {/* Edit video */}}
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          // Assignments Tab
          <Card>
            <CardHeader>
              <CardTitle>Video Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <Video className="h-5 w-5" style={{ color: '#006DB1' }} />
                      <div>
                        <div className="font-medium text-gray-900">
                          {assignment.videoTitle}
                        </div>
                        <div className="text-sm text-gray-600">
                          Assigned to: <span className="font-medium">{assignment.patientName}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}
                        </div>
                        {assignment.viewedAt && (
                          <div className="text-sm text-gray-500">
                            Viewed: {new Date(assignment.viewedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusColor(assignment.status)}>
                        {assignment.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {/* View details */}}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Video Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
              <CardHeader>
                <CardTitle>Upload New Video</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="video-file">Video File</Label>
                  <Input
                    id="video-file"
                    type="file"
                    accept="video/*"
                    onChange={(e) => setNewVideo({...newVideo, videoFile: e.target.files?.[0] || null})}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Supported formats: MP4, MOV, AVI. Maximum size: 1GB
                  </p>
                </div>

                <div>
                  <Label htmlFor="video-title">Title</Label>
                  <Input
                    id="video-title"
                    value={newVideo.title}
                    onChange={(e) => setNewVideo({...newVideo, title: e.target.value})}
                    placeholder="Enter video title"
                  />
                </div>

                <div>
                  <Label htmlFor="video-description">Description</Label>
                  <Textarea
                    id="video-description"
                    value={newVideo.description}
                    onChange={(e) => setNewVideo({...newVideo, description: e.target.value})}
                    placeholder="Brief description of the video content"
                  />
                </div>

                <div>
                  <Label htmlFor="video-category">Category</Label>
                  <Select
                    value={newVideo.category}
                    onValueChange={(value) => setNewVideo({...newVideo, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="exercise">Exercise</SelectItem>
                      <SelectItem value="procedure">Procedure</SelectItem>
                      <SelectItem value="motivation">Motivation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Tags</Label>
                  <div className="space-y-2">
                    {newVideo.tags.map((tag, index) => (
                      <div key={index} className="flex space-x-2">
                        <Input
                          value={tag}
                          onChange={(e) => updateTag(index, e.target.value)}
                          placeholder="Enter tag"
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeTag(index)}
                          disabled={newVideo.tags.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addTag}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Tag
                    </Button>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUploadVideo}
                    className="flex-1"
                    style={{ backgroundColor: '#006DB1' }}
                    disabled={!newVideo.videoFile || !newVideo.title}
                  >
                    Upload Video
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}