'use client'

import React, { useState } from 'react'
import { DemoProtectedRoute } from '@/components/auth/demo-auth-provider'
import { DemoHealthcareLayout } from '@/components/layout/demo-healthcare-layout'
import { Card, CardContent, CardHeader } from '@/components/ui/design-system/Card'
import { Button } from '@/components/ui/design-system/Button'
import { Input } from '@/components/ui/design-system/Input'
import { Textarea } from '@/components/ui/design-system/Textarea'
import { StatusIndicator } from '@/components/ui/design-system/StatusIndicator'
import {
  Video,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Play,
  Clock,
  Eye,
  X,
  Link,
  Save,
  ExternalLink
} from 'lucide-react'

interface VideoItem {
  id: string
  title: string
  description: string
  youtubeUrl: string
  youtubeId: string
  category: 'education' | 'exercise' | 'procedure'
  duration: string
  thumbnailUrl: string
  createdAt: string
  updatedAt: string
  tags: string[]
}

const initialVideos: VideoItem[] = [
  {
    id: '1',
    title: 'Pre-Surgery Preparation Overview',
    description: 'Complete guide to preparing patients for joint replacement surgery, including timeline and expectations.',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    youtubeId: 'dQw4w9WgXcQ',
    category: 'education',
    duration: '12:30',
    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    tags: ['pre-surgery', 'education', 'timeline']
  },
  {
    id: '2',
    title: 'Post-Op Exercise Routine - Week 1',
    description: 'Essential exercises for the first week after joint replacement surgery. Focus on gentle mobility and circulation.',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    youtubeId: 'dQw4w9WgXcQ',
    category: 'exercise',
    duration: '15:45',
    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
    tags: ['post-op', 'exercise', 'week-1', 'mobility']
  },
  {
    id: '3',
    title: 'Pain Management Strategies',
    description: 'Comprehensive overview of pain management techniques and medications for recovery.',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    youtubeId: 'dQw4w9WgXcQ',
    category: 'education',
    duration: '18:20',
    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    createdAt: '2024-01-17T10:00:00Z',
    updatedAt: '2024-01-17T10:00:00Z',
    tags: ['pain-management', 'education', 'recovery']
  }
]

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>(initialVideos)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null)
  const [previewVideo, setPreviewVideo] = useState<VideoItem | null>(null)

  const extractYouTubeId = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : ''
  }

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'education': return 'bg-blue-100 text-blue-800'
      case 'exercise': return 'bg-purple-100 text-purple-800'
      case 'procedure': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <DemoProtectedRoute>
      <DemoHealthcareLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Video Library</h1>
              <p className="text-gray-600 mt-1">
                Manage educational and exercise videos with YouTube integration
              </p>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              icon={<Plus className="h-4 w-4" />}
            >
              Add Video
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search videos, descriptions, or tags..."
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">All Categories</option>
                    <option value="education">Education</option>
                    <option value="exercise">Exercise</option>
                    <option value="procedure">Procedure</option>
                  </select>
                </div>
                <div className="text-sm text-gray-600">
                  {filteredVideos.length} videos
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <Card key={video.id} variant="default" interactive>
                <CardContent className="p-0">
                  {/* Video Thumbnail */}
                  <div className="relative">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-t-lg">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setPreviewVideo(video)}
                        icon={<Play className="h-4 w-4" />}
                      >
                        Preview
                      </Button>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {video.duration}
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                        {video.title}
                      </h3>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => {
                            setEditingVideo(video)
                            setShowAddModal(true)
                          }}
                          className="text-gray-400 hover:text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setVideos(videos.filter(v => v.id !== video.id))
                          }}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {video.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getCategoryColor(video.category)}`}>
                        {video.category}
                      </span>
                      <a
                        href={video.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add/Edit Video Modal */}
          {showAddModal && (
            <VideoModal
              video={editingVideo}
              onClose={() => {
                setShowAddModal(false)
                setEditingVideo(null)
              }}
              onSave={(videoData) => {
                if (!videoData.youtubeUrl || !videoData.title) return
                
                const youtubeId = extractYouTubeId(videoData.youtubeUrl)
                const newVideo: VideoItem = {
                  id: editingVideo?.id || Date.now().toString(),
                  title: videoData.title,
                  description: videoData.description || '',
                  youtubeUrl: videoData.youtubeUrl,
                  youtubeId,
                  category: videoData.category || 'education',
                  duration: '0:00', // Will be updated when video loads
                  thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`,
                  createdAt: editingVideo?.createdAt || new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  tags: videoData.tags || []
                }

                if (editingVideo) {
                  setVideos(videos.map(v => v.id === editingVideo.id ? newVideo : v))
                } else {
                  setVideos([...videos, newVideo])
                }
                
                setShowAddModal(false)
                setEditingVideo(null)
              }}
            />
          )}

          {/* Video Preview Modal */}
          {previewVideo && (
            <VideoPreviewModal
              video={previewVideo}
              onClose={() => setPreviewVideo(null)}
            />
          )}
        </div>
      </DemoHealthcareLayout>
    </DemoProtectedRoute>
  )
}

// Video Add/Edit Modal
function VideoModal({ video, onClose, onSave }: {
  video: VideoItem | null
  onClose: () => void
  onSave: (video: Partial<VideoItem>) => void
}) {
  const [formData, setFormData] = useState({
    title: video?.title || '',
    description: video?.description || '',
    youtubeUrl: video?.youtubeUrl || '',
    category: video?.category || 'education',
    tags: video?.tags.join(', ') || ''
  })

  const handleSave = () => {
    if (formData.title && formData.youtubeUrl) {
      onSave({
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4">
        <CardHeader
          title={video ? 'Edit Video' : 'Add New Video'}
          action={
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          }
        />
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              YouTube URL *
            </label>
            <div className="relative">
              <Link className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.youtubeUrl}
                onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Video title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the video content and when to use it..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="education">Education</option>
                <option value="exercise">Exercise</option>
                <option value="procedure">Procedure</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="exercise, post-op, week-1"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              {video ? 'Update' : 'Add'} Video
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Video Preview Modal
function VideoPreviewModal({ video, onClose }: {
  video: VideoItem
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="w-full max-w-4xl mx-4">
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">{video.title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${video.youtubeId}`}
              title={video.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="p-4">
            <p className="text-gray-600">{video.description}</p>
            <div className="flex items-center gap-4 mt-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getCategoryColor(video.category)}`}>
                {video.category}
              </span>
              <div className="flex gap-2">
                {video.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getCategoryColor(category: string) {
  switch (category) {
    case 'education': return 'bg-blue-100 text-blue-800'
    case 'exercise': return 'bg-purple-100 text-purple-800'
    case 'procedure': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}