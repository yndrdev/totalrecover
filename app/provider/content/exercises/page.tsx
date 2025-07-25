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
import { SkeletonCard } from "@/components/ui/design-system/Skeleton";
import { 
  Activity, 
  Plus, 
  Edit3, 
  Eye, 
  Search, 
  Filter,
  Clock,
  Target,
  User,
  BarChart3,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";

interface Exercise {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  instructions: string[];
  videoUrl?: string;
  imageUrl?: string;
  targetArea: string;
  equipment?: string[];
  completionCount: number;
  averageRating: number;
  created_at: string;
  updated_at: string;
}

interface ExerciseAssignment {
  id: string;
  exercise_id: string;
  patient_id: string;
  assigned_date: string;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  completion_date?: string;
  notes?: string;
  patient_name: string;
  exercise_title: string;
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [assignments, setAssignments] = useState<ExerciseAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('library');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [showNewExercise, setShowNewExercise] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [newExercise, setNewExercise] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner' as const,
    duration: 15,
    instructions: [''],
    targetArea: '',
    equipment: ['']
  });
  
  const router = useRouter();

  useEffect(() => {
    // Use mock data instead of database calls
    setTimeout(() => {
      setExercises([
        {
          id: '1',
          title: 'Knee Flexion Exercise',
          description: 'Gentle knee bending exercise to improve range of motion after surgery',
          category: 'Range of Motion',
          difficulty: 'beginner',
          duration: 10,
          instructions: [
            'Sit in a comfortable chair with back support',
            'Slowly bend your knee as far as comfortable',
            'Hold for 5 seconds',
            'Slowly straighten your leg',
            'Repeat 10 times'
          ],
          targetArea: 'Knee',
          equipment: ['Chair'],
          completionCount: 45,
          averageRating: 4.2,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          title: 'Ankle Pumps',
          description: 'Simple ankle exercises to improve circulation and prevent blood clots',
          category: 'Circulation',
          difficulty: 'beginner',
          duration: 5,
          instructions: [
            'Lie down or sit comfortably',
            'Point your toes away from you',
            'Pull your toes back toward you',
            'Repeat this pumping motion',
            'Continue for 2-3 minutes'
          ],
          targetArea: 'Ankle',
          equipment: [],
          completionCount: 78,
          averageRating: 4.5,
          created_at: '2024-01-12T14:30:00Z',
          updated_at: '2024-01-12T14:30:00Z'
        },
        {
          id: '3',
          title: 'Quad Strengthening',
          description: 'Strengthen the quadriceps muscles to support knee recovery',
          category: 'Strengthening',
          difficulty: 'intermediate',
          duration: 20,
          instructions: [
            'Lie on your back with legs straight',
            'Tighten the muscle on top of your thigh',
            'Push your knee down into the surface',
            'Hold for 5 seconds',
            'Relax and repeat 15 times'
          ],
          targetArea: 'Quadriceps',
          equipment: ['Exercise mat'],
          completionCount: 32,
          averageRating: 4.0,
          created_at: '2024-01-10T09:15:00Z',
          updated_at: '2024-01-10T09:15:00Z'
        }
      ]);

      setAssignments([
        {
          id: '1',
          exercise_id: '1',
          patient_id: 'patient-1',
          assigned_date: '2024-01-16T10:00:00Z',
          due_date: '2024-01-20T10:00:00Z',
          status: 'completed',
          completion_date: '2024-01-18T14:30:00Z',
          patient_name: 'Sarah Johnson',
          exercise_title: 'Knee Flexion Exercise'
        },
        {
          id: '2',
          exercise_id: '2',
          patient_id: 'patient-2',
          assigned_date: '2024-01-15T11:00:00Z',
          due_date: '2024-01-18T11:00:00Z',
          status: 'in_progress',
          patient_name: 'Robert Smith',
          exercise_title: 'Ankle Pumps'
        }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || exercise.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'in_progress': return 'outline';
      case 'completed': return 'default';
      case 'overdue': return 'destructive';
      default: return 'secondary';
    }
  };

  const handleCreateExercise = async () => {
    // In a real app, this would save to the database
    const newExerciseData: Exercise = {
      id: Date.now().toString(),
      ...newExercise,
      instructions: newExercise.instructions.filter(i => i.trim() !== ''),
      equipment: newExercise.equipment.filter(e => e.trim() !== ''),
      completionCount: 0,
      averageRating: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setExercises([...exercises, newExerciseData]);
    setShowNewExercise(false);
    setNewExercise({
      title: '',
      description: '',
      category: '',
      difficulty: 'beginner',
      duration: 15,
      instructions: [''],
      targetArea: '',
      equipment: ['']
    });
  };

  const addInstructionStep = () => {
    setNewExercise({
      ...newExercise,
      instructions: [...newExercise.instructions, '']
    });
  };

  const updateInstructionStep = (index: number, value: string) => {
    const updatedInstructions = [...newExercise.instructions];
    updatedInstructions[index] = value;
    setNewExercise({
      ...newExercise,
      instructions: updatedInstructions
    });
  };

  const removeInstructionStep = (index: number) => {
    setNewExercise({
      ...newExercise,
      instructions: newExercise.instructions.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto py-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="flex justify-between items-center">
              <div>
                <div className="h-9 w-48 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-5 w-80 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="flex space-x-4">
                <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 w-36 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Search and Filters Skeleton */}
          <div className="mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
                  <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse" />
                  <div className="w-48 h-10 bg-gray-200 rounded animate-pulse" />
                  <div className="w-48 h-10 bg-gray-200 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Exercise Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <SkeletonCard />
              </Card>
            ))}
          </div>
        </div>
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
              <h1 className="text-3xl font-bold text-gray-900">Exercise Library</h1>
              <p className="text-gray-600 mt-2">Manage physical therapy exercises and patient assignments</p>
            </div>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => setActiveTab('library')}
                className={activeTab === 'library' ? 'text-white' : ''}
                style={activeTab === 'library' ? { backgroundColor: '#006DB1' } : {}}
              >
                Exercise Library
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
                onClick={() => setShowNewExercise(true)}
                style={{ backgroundColor: '#006DB1' }}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Exercise
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
                          placeholder="Search exercises..."
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
                        <SelectItem value="Range of Motion">Range of Motion</SelectItem>
                        <SelectItem value="Strengthening">Strengthening</SelectItem>
                        <SelectItem value="Circulation">Circulation</SelectItem>
                        <SelectItem value="Balance">Balance</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="All Difficulties" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Difficulties</SelectItem>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Exercise Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExercises.map((exercise) => (
                <Card key={exercise.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{exercise.title}</CardTitle>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getDifficultyColor(exercise.difficulty)}>
                            {exercise.difficulty}
                          </Badge>
                          <Badge variant="outline">{exercise.category}</Badge>
                        </div>
                      </div>
                      <Activity className="h-6 w-6" style={{ color: '#006DB1' }} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{exercise.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {exercise.duration} minutes
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Target className="h-4 w-4 mr-2" />
                        {exercise.targetArea}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        {exercise.completionCount} completions
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        {exercise.averageRating}/5.0 rating
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedExercise(exercise);
                          setShowAssignModal(true);
                        }}
                      >
                        Assign
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {/* View details */}}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {/* Edit exercise */}}
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
              <CardTitle>Exercise Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <Activity className="h-5 w-5" style={{ color: '#006DB1' }} />
                      <div>
                        <div className="font-medium text-gray-900">
                          {assignment.exercise_title}
                        </div>
                        <div className="text-sm text-gray-600">
                          Assigned to: <span className="font-medium">{assignment.patient_name}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Due: {new Date(assignment.due_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusColor(assignment.status)}>
                        {assignment.status.replace('_', ' ')}
                      </Badge>
                      {assignment.completion_date && (
                        <span className="text-xs text-gray-500">
                          Completed: {new Date(assignment.completion_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* New Exercise Modal */}
        {showNewExercise && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
              <CardHeader>
                <CardTitle>Create New Exercise</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="exercise-title">Exercise Title</Label>
                    <Input
                      id="exercise-title"
                      value={newExercise.title}
                      onChange={(e) => setNewExercise({...newExercise, title: e.target.value})}
                      placeholder="Enter exercise title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="exercise-category">Category</Label>
                    <Select
                      value={newExercise.category}
                      onValueChange={(value) => setNewExercise({...newExercise, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Range of Motion">Range of Motion</SelectItem>
                        <SelectItem value="Strengthening">Strengthening</SelectItem>
                        <SelectItem value="Circulation">Circulation</SelectItem>
                        <SelectItem value="Balance">Balance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="exercise-description">Description</Label>
                  <Textarea
                    id="exercise-description"
                    value={newExercise.description}
                    onChange={(e) => setNewExercise({...newExercise, description: e.target.value})}
                    placeholder="Brief description of the exercise"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="exercise-difficulty">Difficulty</Label>
                    <Select
                      value={newExercise.difficulty}
                      onValueChange={(value) =>
                        setNewExercise({...newExercise, difficulty: value as 'beginner' | 'intermediate' | 'advanced'})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="exercise-duration">Duration (minutes)</Label>
                    <Input
                      id="exercise-duration"
                      type="number"
                      value={newExercise.duration}
                      onChange={(e) => setNewExercise({...newExercise, duration: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="exercise-target">Target Area</Label>
                    <Input
                      id="exercise-target"
                      value={newExercise.targetArea}
                      onChange={(e) => setNewExercise({...newExercise, targetArea: e.target.value})}
                      placeholder="e.g., Knee, Hip, Ankle"
                    />
                  </div>
                </div>

                <div>
                  <Label>Instructions</Label>
                  <div className="space-y-2">
                    {newExercise.instructions.map((instruction, index) => (
                      <div key={index} className="flex space-x-2">
                        <Input
                          value={instruction}
                          onChange={(e) => updateInstructionStep(index, e.target.value)}
                          placeholder={`Step ${index + 1}`}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeInstructionStep(index)}
                          disabled={newExercise.instructions.length === 1}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addInstructionStep}
                    >
                      Add Step
                    </Button>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowNewExercise(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateExercise}
                    className="flex-1"
                    style={{ backgroundColor: '#006DB1' }}
                  >
                    Create Exercise
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