'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, CheckCircle, Clock, Video, FileText, Activity } from 'lucide-react';

// Simplified TJV demo data - 7 days instead of 245
const demoProtocol = {
  title: "ACL Recovery Protocol - Week 1",
  description: "Initial recovery phase focusing on pain management and gentle mobility",
  totalDays: 7,
  tasks: [
    {
      day: 1,
      title: "Initial Assessment & Pain Management",
      tasks: [
        {
          id: "1-1",
          type: "video",
          title: "Welcome & Assessment Video",
          duration: "5 min",
          completed: true,
          icon: Video
        },
        {
          id: "1-2",
          type: "form",
          title: "Pain Level Check-in",
          duration: "2 min",
          completed: true,
          icon: FileText
        },
        {
          id: "1-3",
          type: "exercise",
          title: "Ankle Pumps Exercise",
          duration: "3 min",
          completed: false,
          icon: Activity
        }
      ]
    },
    {
      day: 2,
      title: "Range of Motion Introduction",
      tasks: [
        {
          id: "2-1",
          type: "video",
          title: "Quad Sets Tutorial",
          duration: "4 min",
          completed: false,
          icon: Video
        },
        {
          id: "2-2",
          type: "exercise",
          title: "Heel Slides Exercise",
          duration: "5 min",
          completed: false,
          icon: Activity
        }
      ]
    },
    {
      day: 3,
      title: "Early Mobility",
      tasks: [
        {
          id: "3-1",
          type: "video",
          title: "Walking with Crutches",
          duration: "6 min",
          completed: false,
          icon: Video
        },
        {
          id: "3-2",
          type: "form",
          title: "Daily Progress Check",
          duration: "2 min",
          completed: false,
          icon: FileText
        }
      ]
    },
    {
      day: 4,
      title: "Strengthening Begins",
      tasks: [
        {
          id: "4-1",
          type: "exercise",
          title: "Straight Leg Raises",
          duration: "4 min",
          completed: false,
          icon: Activity
        }
      ]
    },
    {
      day: 5,
      title: "Flexibility Focus",
      tasks: [
        {
          id: "5-1",
          type: "video",
          title: "Hamstring Stretch Guide",
          duration: "5 min",
          completed: false,
          icon: Video
        }
      ]
    },
    {
      day: 6,
      title: "Balance Training",
      tasks: [
        {
          id: "6-1",
          type: "exercise",
          title: "Single Leg Stands",
          duration: "3 min",
          completed: false,
          icon: Activity
        }
      ]
    },
    {
      day: 7,
      title: "Week 1 Review",
      tasks: [
        {
          id: "7-1",
          type: "form",
          title: "Weekly Progress Survey",
          duration: "5 min",
          completed: false,
          icon: FileText
        },
        {
          id: "7-2",
          type: "video",
          title: "Week 1 Summary",
          duration: "3 min",
          completed: false,
          icon: Video
        }
      ]
    }
  ]
};

interface TaskCardProps {
  task: {
    id: string;
    type: string;
    title: string;
    duration: string;
    completed: boolean;
    icon: any;
  };
  onToggle: (id: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle }) => {
  const Icon = task.icon;
  const typeColors = {
    video: 'bg-blue-100 text-blue-800',
    form: 'bg-purple-100 text-purple-800',
    exercise: 'bg-green-100 text-green-800'
  };

  return (
    <div 
      className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
        task.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300 hover:border-blue-400'
      }`}
      onClick={() => onToggle(task.id)}
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full ${typeColors[task.type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800'}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
            {task.title}
          </p>
          <p className="text-sm text-gray-500">{task.duration}</p>
        </div>
      </div>
      {task.completed && <CheckCircle className="w-5 h-5 text-green-500" />}
    </div>
  );
};

export default function RecoveryTimelinePreview() {
  const [protocol, setProtocol] = useState(demoProtocol);
  const [currentDay, setCurrentDay] = useState(1);

  const handleTaskToggle = (taskId: string) => {
    const updatedProtocol = { ...protocol };
    for (const day of updatedProtocol.tasks) {
      const task = day.tasks.find(t => t.id === taskId);
      if (task) {
        task.completed = !task.completed;
        break;
      }
    }
    setProtocol(updatedProtocol);
  };

  const completedTasks = protocol.tasks.reduce((acc, day) => 
    acc + day.tasks.filter(task => task.completed).length, 0
  );
  const totalTasks = protocol.tasks.reduce((acc, day) => acc + day.tasks.length, 0);
  const progress = (completedTasks / totalTasks) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50">
      {/* Protocol Header */}
      <Card className="mb-6 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{protocol.title}</h1>
            <p className="text-gray-600 mt-1">{protocol.description}</p>
          </div>
          <Badge variant="outline" className="text-sm">
            Preview Mode
          </Badge>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Overall Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="flex space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4 text-gray-500" />
              <span>{protocol.totalDays} days</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>{completedTasks}/{totalTasks} tasks</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Linear Kanban Timeline */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recovery Timeline</h2>
        
        <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
          {protocol.tasks.map((day, index) => (
            <button
              key={day.day}
              onClick={() => setCurrentDay(day.day)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                currentDay === day.day 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Day {day.day}
            </button>
          ))}
        </div>

        {/* Current Day Tasks */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">
              {protocol.tasks[currentDay - 1].title}
            </h3>
            <Badge variant="secondary">
              Day {currentDay} of {protocol.totalDays}
            </Badge>
          </div>
          
          <div className="space-y-3">
            {protocol.tasks[currentDay - 1].tasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onToggle={handleTaskToggle}
              />
            ))}
          </div>
        </Card>
      </div>

      {/* Preview Actions */}
      <div className="mt-6 flex justify-end space-x-3">
        <Button variant="outline">
          Reset Preview
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700">
          Save Protocol Template
        </Button>
      </div>
    </div>
  );
}