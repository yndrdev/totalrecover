"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/design-system/Button";
import { Input, Textarea } from "@/components/ui/design-system/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/design-system/Card";
import { StatusBadge } from "@/components/ui/design-system/StatusIndicator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Dumbbell, 
  FileText, 
  Settings, 
  Play,
  Eye,
  LogOut,
  ArrowLeft
} from "lucide-react";
import { colors } from '@/lib/design-system/constants'

interface BuilderInterfaceProps {
  user: User;
  profile: any;
  exercises: any[];
  forms: any[];
}

export function BuilderInterface({ user, profile, exercises, forms }: BuilderInterfaceProps) {
  const [activeTab, setActiveTab] = useState("exercises");
  const [isCreating, setIsCreating] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  // Exercise form state
  const [exerciseForm, setExerciseForm] = useState({
    name: "",
    description: "",
    instructions: "",
    exercise_type: "range_of_motion",
    body_part: "knee",
    difficulty_level: 1,
    surgery_types: ["TKA"],
    activity_levels: ["beginner"],
    equipment_needed: [],
    contraindications: [],
    precautions: [],
    modifications: [],
    progression_criteria: "",
    min_duration_seconds: 60,
    max_duration_seconds: 300,
    min_repetitions: 5,
    max_repetitions: 15,
    min_sets: 1,
    max_sets: 3,
    recovery_day_start: 1,
    recovery_day_end: 90,
    is_active: true
  });

  // Form builder state
  const [formBuilder, setFormBuilder] = useState({
    name: "",
    description: "",
    form_type: "assessment",
    fields: [] as any[],
    logic: {},
    is_active: true
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleGoBack = () => {
    if (profile.role === "admin") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/provider";
    }
  };

  const resetExerciseForm = () => {
    setExerciseForm({
      name: "",
      description: "",
      instructions: "",
      exercise_type: "range_of_motion",
      body_part: "knee",
      difficulty_level: 1,
      surgery_types: ["TKA"],
      activity_levels: ["beginner"],
      equipment_needed: [],
      contraindications: [],
      precautions: [],
      modifications: [],
      progression_criteria: "",
      min_duration_seconds: 60,
      max_duration_seconds: 300,
      min_repetitions: 5,
      max_repetitions: 15,
      min_sets: 1,
      max_sets: 3,
      recovery_day_start: 1,
      recovery_day_end: 90,
      is_active: true
    });
  };

  const resetFormBuilder = () => {
    setFormBuilder({
      name: "",
      description: "",
      form_type: "assessment",
      fields: [],
      logic: {},
      is_active: true
    });
  };

  const handleCreateExercise = async () => {
    if (!exerciseForm.name || !exerciseForm.instructions) {
      alert("Please fill in name and instructions");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from("exercises").insert({
        ...exerciseForm,
        tenant_id: profile.tenant_id
      });

      if (error) {
        console.error("Error creating exercise:", error);
        alert("Error creating exercise");
        return;
      }

      setIsCreating(false);
      resetExerciseForm();
      window.location.reload();
    } catch (error) {
      console.error("Error:", error);
      alert("Error creating exercise");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateForm = async () => {
    if (!formBuilder.name || formBuilder.fields.length === 0) {
      alert("Please fill in name and add at least one field");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from("forms").insert({
        ...formBuilder,
        tenant_id: profile.tenant_id
      });

      if (error) {
        console.error("Error creating form:", error);
        alert("Error creating form");
        return;
      }

      setIsCreating(false);
      resetFormBuilder();
      window.location.reload();
    } catch (error) {
      console.error("Error:", error);
      alert("Error creating form");
    } finally {
      setIsLoading(false);
    }
  };

  const addFormField = () => {
    const newField = {
      id: Date.now(),
      type: "text",
      label: "New Field",
      required: false,
      options: []
    };
    setFormBuilder(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  const removeFormField = (fieldId: number) => {
    setFormBuilder(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }));
  };

  const updateFormField = (fieldId: number, updates: any) => {
    setFormBuilder(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <thinking>
      Visual Design: Clean header with new design system
      UX Design: Clear navigation and user context
      Healthcare Context: Content builder for recovery exercises and forms
      </thinking> */}
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleGoBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Content Builder</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {profile.full_name} ({profile.role})
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="exercises" className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4" />
              Exercises
            </TabsTrigger>
            <TabsTrigger value="forms" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Forms
            </TabsTrigger>
          </TabsList>

          {/* <thinking>
          Visual Design: Exercise creation and management interface
          Healthcare Context: Creating therapeutic exercises for recovery
          UX Design: Clear form inputs with appropriate healthcare terminology
          </thinking> */}
          {/* Exercises Tab */}
          <TabsContent value="exercises" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Exercise Library</h2>
                <p className="text-gray-600">Create and manage recovery exercises</p>
              </div>
              <Button
                variant="primary"
                onClick={() => {
                  setIsCreating(true);
                  resetExerciseForm();
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Exercise
              </Button>
            </div>

            {/* Exercise Creation Form */}
            {isCreating && activeTab === "exercises" && (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold">Create New Exercise</h2>
                  <p className="text-sm text-gray-600">
                    Define a new exercise for patient recovery protocols
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Exercise Name</Label>
                      <Input
                        id="name"
                        value={exerciseForm.name}
                        onChange={(e) => setExerciseForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Knee Flexion Exercise"
                      />
                    </div>
                    <div>
                      <Label htmlFor="body_part">Body Part</Label>
                      <Select 
                        value={exerciseForm.body_part} 
                        onValueChange={(value) => setExerciseForm(prev => ({ ...prev, body_part: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="knee">Knee</SelectItem>
                          <SelectItem value="hip">Hip</SelectItem>
                          <SelectItem value="ankle">Ankle</SelectItem>
                          <SelectItem value="shoulder">Shoulder</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={exerciseForm.description}
                      onChange={(e) => setExerciseForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the exercise"
                    />
                  </div>

                  <div>
                    <Label htmlFor="instructions">Instructions</Label>
                    <Textarea
                      id="instructions"
                      value={exerciseForm.instructions}
                      onChange={(e) => setExerciseForm(prev => ({ ...prev, instructions: e.target.value }))}
                      placeholder="Step-by-step instructions for the exercise"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="exercise_type">Exercise Type</Label>
                      <Select 
                        value={exerciseForm.exercise_type} 
                        onValueChange={(value) => setExerciseForm(prev => ({ ...prev, exercise_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="range_of_motion">Range of Motion</SelectItem>
                          <SelectItem value="strength">Strength</SelectItem>
                          <SelectItem value="balance">Balance</SelectItem>
                          <SelectItem value="endurance">Endurance</SelectItem>
                          <SelectItem value="functional">Functional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="difficulty_level">Difficulty Level</Label>
                      <Select 
                        value={exerciseForm.difficulty_level.toString()} 
                        onValueChange={(value) => setExerciseForm(prev => ({ ...prev, difficulty_level: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Beginner (1)</SelectItem>
                          <SelectItem value="2">Intermediate (2)</SelectItem>
                          <SelectItem value="3">Advanced (3)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="min_repetitions">Min Repetitions</Label>
                      <Input
                        id="min_repetitions"
                        type="number"
                        value={exerciseForm.min_repetitions}
                        onChange={(e) => setExerciseForm(prev => ({ ...prev, min_repetitions: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="primary" onClick={handleCreateExercise} loading={isLoading}>
                      <Save className="w-4 h-4 mr-2" />
                      {isLoading ? "Creating..." : "Create Exercise"}
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={() => {
                        setIsCreating(false);
                        resetExerciseForm();
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Exercise List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exercises.map((exercise) => (
                <Card key={exercise.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{exercise.name}</h3>
                        <p className="text-sm text-gray-600">{exercise.description}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="secondary" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="secondary" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Badge variant="secondary">{exercise.body_part}</Badge>
                        <Badge variant="outline">Level {exercise.difficulty_level}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {exercise.instructions}
                      </p>
                      <div className="text-xs text-gray-500">
                        {exercise.min_repetitions}-{exercise.max_repetitions} reps
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* <thinking>
          Visual Design: Form builder interface
          Healthcare Context: Creating assessment forms for patient data
          UX Design: Dynamic field management with clear controls
          </thinking> */}
          {/* Forms Tab */}
          <TabsContent value="forms" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Form Library</h2>
                <p className="text-gray-600">Create and manage assessment forms</p>
              </div>
              <Button
                variant="primary"
                onClick={() => {
                  setIsCreating(true);
                  resetFormBuilder();
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Form
              </Button>
            </div>

            {/* Form Creation Interface */}
            {isCreating && activeTab === "forms" && (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold">Create New Form</h2>
                  <p className="text-sm text-gray-600">
                    Build a custom assessment form for patient data collection
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="form_name">Form Name</Label>
                      <Input
                        id="form_name"
                        value={formBuilder.name}
                        onChange={(e) => setFormBuilder(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Daily Pain Assessment"
                      />
                    </div>
                    <div>
                      <Label htmlFor="form_type">Form Type</Label>
                      <Select 
                        value={formBuilder.form_type} 
                        onValueChange={(value) => setFormBuilder(prev => ({ ...prev, form_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="assessment">Assessment</SelectItem>
                          <SelectItem value="intake">Intake</SelectItem>
                          <SelectItem value="followup">Follow-up</SelectItem>
                          <SelectItem value="survey">Survey</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="form_description">Description</Label>
                    <Textarea
                      id="form_description"
                      value={formBuilder.description}
                      onChange={(e) => setFormBuilder(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the form"
                    />
                  </div>

                  {/* Form Fields */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Label>Form Fields</Label>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={addFormField}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Field
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {formBuilder.fields.map((field) => (
                        <Card key={field.id} variant="default" padding="sm">
                          <div className="flex items-center justify-between mb-2">
                            <Input
                              value={field.label}
                              onChange={(e) => updateFormField(field.id, { label: e.target.value })}
                              placeholder="Field label"
                              className="flex-1 mr-2"
                            />
                            <Select
                              value={field.type}
                              onValueChange={(value) => updateFormField(field.id, { type: value })}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="scale">Scale</SelectItem>
                                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => removeFormField(field.id)}
                              className="text-red-600 ml-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => updateFormField(field.id, { required: e.target.checked })}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span>Required field</span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="primary" onClick={handleCreateForm} loading={isLoading}>
                      <Save className="w-4 h-4 mr-2" />
                      {isLoading ? "Creating..." : "Create Form"}
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={() => {
                        setIsCreating(false);
                        resetFormBuilder();
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Form List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {forms.map((form) => (
                <Card key={form.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{form.name}</h3>
                        <p className="text-sm text-gray-600">{form.description}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="secondary" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="secondary" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Badge variant="secondary">{form.form_type}</Badge>
                      <div className="text-sm text-gray-600">
                        {Array.isArray(form.fields) ? form.fields.length : Object.keys(form.fields || {}).length} fields
                      </div>
                      <div className="text-xs text-gray-500">
                        {form.is_active ? "Active" : "Inactive"}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}