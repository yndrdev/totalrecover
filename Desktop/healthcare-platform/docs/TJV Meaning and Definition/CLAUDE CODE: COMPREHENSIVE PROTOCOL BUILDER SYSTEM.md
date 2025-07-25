# CLAUDE CODE: COMPREHENSIVE PROTOCOL BUILDER SYSTEM

## 🎯 **OBJECTIVE**
Build a comprehensive protocol builder system that allows practice-level administrators to create recovery timelines with start/stop days, frequency controls (like phone reminders), and both calendar and list view options. This system uses REAL timeline data from TJV's clinical protocols.

## 🧠 **MANDATORY THINKING APPROACH**

<thinking>
PROTOCOL BUILDER ANALYSIS:

1. USER CONTEXT:
   - Practice administrators creating standardized recovery protocols
   - Need to assign tasks (forms, exercises, videos, messages) to specific recovery days
   - Want frequency controls (show for 5 days in a row, daily reminders)
   - Need both calendar and list views for different workflow preferences
   - Timeline spans from Day -45 (enrollment) to Day +200 (long-term recovery)

2. HEALTHCARE CONSIDERATIONS:
   - This is clinical protocol creation - must be precise and reliable
   - Tasks must be delivered at the right recovery stage
   - Frequency ensures critical tasks aren't missed
   - Different surgery types (TKA vs THA) may need different protocols
   - Must support evidence-based recovery phases

3. DESIGN DECISIONS:
   - Calendar view for visual timeline management
   - List view for detailed task configuration
   - Drag-and-drop for intuitive task placement
   - Clear frequency controls (start day, stop day, repeat pattern)
   - Task type indicators (form, exercise, video, message)
   - Professional healthcare platform appearance

4. UX FLOW:
   - Create protocol → Set timeline → Add tasks → Configure frequency → Preview → Save
   - Easy switching between calendar and list views
   - Bulk operations for efficiency
   - Real-time preview of patient experience

5. IMPLEMENTATION APPROACH:
   - Use real timeline data from TJV's clinical protocols
   - Integrate with existing database structure
   - Support multiple protocol templates
   - Enable practice-level customization
</thinking>

## 📊 **REAL TIMELINE DATA STRUCTURE**

### **Complete Recovery Timeline (Day -45 to Day +200):**

#### **Phase 1: Enrollment & Pre-Surgery (Day -45 to Day -1)**
```javascript
const preOpTimeline = [
  // Enrollment Phase
  {
    day: "enrollment",
    title: "Welcome and TJV Introduction",
    type: "message",
    content: "How to use the app and download assistance",
    display: "push notification upon enrollment/automatic message",
    description: "Who's who on your care team, why remote monitoring benefits the patient through messaging the care team and a vetted program for total hip and knee patient preparation and recovery; video of an AI clinician guiding through the different options of the app; importance of completing forms for tracking progress and measurement of the success of the surgery",
    frequency: { startDay: "enrollment", stopDay: "enrollment", repeat: false }
  },
  {
    day: "enrollment",
    title: "Navigator and Surgeon Introduction",
    type: "video",
    content: "Welcome to the smart recovery journey with your surgeon and navigator.",
    display: "push notification upon enrollment",
    description: "Each team will need to have a brief surgeon introduction with this portion easily modifiable and replaced for other institutions. There are 16 surgeons in our practice and one main navigator/educator.",
    frequency: { startDay: "enrollment", stopDay: "enrollment", repeat: false }
  },
  {
    day: "enrollment",
    title: "Outcome Assessments",
    type: "form",
    content: "R or L HOOS jr Hip survey; R or L KOOS jr Knee survey; The Forgotten Joint Score, VR-12",
    display: "push notification upon enrollment",
    frequency: { startDay: "enrollment", stopDay: "enrollment", repeat: false }
  },
  {
    day: "enrollment+1",
    title: "Identifying a Care Partner",
    type: "video",
    content: "https://drive.google.com/file/d/1MJl_VM_S7lDSNzwdTefOd5TbEtkSQwdk/view?usp=sharing",
    description: "Care partner reasons and article references",
    frequency: { startDay: "enrollment+1", stopDay: "enrollment+1", repeat: false }
  },
  {
    day: "enrollment+2",
    title: "Importance of Staying Active",
    type: "message",
    content: "Staying mobile before joint replacement surgery is essential for a few key reasons: Maintains Muscle Strength, Improves Circulation, Enhances Joint Flexibility, Boosts Overall Health, Prepares the Body",
    frequency: { startDay: "enrollment+2", stopDay: "enrollment+2", repeat: false }
  },
  
  // Pre-Surgery Specific Days
  {
    day: -14,
    title: "Compression Stocking Instructions (TKA only)",
    type: "message",
    content: "You will be prescribed compression stockings, also known as TED hose. These help to prevent blood clots from developing in your legs and help control swelling.",
    videoUrl: "https://drive.google.com/file/d/11I7Ulz_ICbvjo8QtklVeYSqnv22A_1jg/view?usp=sharing",
    frequency: { startDay: -14, stopDay: -14, repeat: false }
  },
  {
    day: -5,
    title: "PRE-OP SKIN WASH",
    type: "message",
    content: "You play an important part in helping to prevent a wound infection. At your pre op appointment, you will be given instructions on how to wash your skin the night before surgery with 2% Chlorhexidine Gluconate (CHG) cloths.",
    frequency: { startDay: -5, stopDay: -1, repeat: true } // Show for 5 days
  }
];
```

#### **Phase 2: Surgery Day & Early Recovery (Day 0 to Day +7)**
```javascript
const earlyRecoveryTimeline = [
  {
    day: 0,
    title: "How do I sleep? (Knee Protocol)",
    type: "message",
    content: "Sleeping comfortably after knee surgery can be tough, but positioning your leg correctly can help with recovery. Back sleeping is the best position. Place a pillow under your calf (not your knee) to keep the knee straight.",
    frequency: { startDay: 0, stopDay: 2, repeat: true }
  },
  {
    day: 0,
    title: "How do I sleep? (Hip Protocol)",
    type: "message", 
    content: "Sleeping comfortably after hip surgery can be tough, but positioning your leg correctly can help with recovery. Back sleeping is the best position. If you can't sleep in that position, you can sleep on your side, with pillows between your legs.",
    frequency: { startDay: 0, stopDay: 2, repeat: true }
  },
  {
    day: 1,
    title: "Expectations After Surgery",
    type: "message",
    content: "It's time to renew your commitment to your exercise and activity program and continue the healing process. Consistent, progressive motion is a key to success and your ability to regain your strength and flexibility in the months following surgery.",
    frequency: { startDay: 1, stopDay: 1, repeat: false }
  },
  {
    day: 1,
    title: "Why are ankle pumps important",
    type: "video",
    content: "https://drive.google.com/file/d/1MTn-fxWIdbGjMPpVcnzoXJuETIUwyrza/view?usp=sharing",
    frequency: { startDay: 1, stopDay: 7, repeat: true } // Daily for first week
  },
  {
    day: 1,
    title: "Performing Your Exercises",
    type: "exercise",
    content: "You will notice that the individual performing the exercise in the video may move their arms, legs or body through a larger degree of motion than you feel you are able to do. That's OK!",
    frequency: { startDay: 1, stopDay: 14, repeat: true } // Daily for 2 weeks
  },
  {
    day: 2,
    title: "Pain Check-in",
    type: "form",
    content: "Pain can elevate this day with swelling and difficulty doing exercises very common. See an example of what knee patients should see on day 2-10.",
    frequency: { startDay: 2, stopDay: 10, repeat: true } // Daily check-in for 9 days
  },
  {
    day: 3,
    title: "Wound Care",
    type: "message",
    content: "Your bandage is waterproof and is supposed to stay on for the first 7 days after surgery. The bandage is designed to help absorb and keep you skin dry.",
    frequency: { startDay: 3, stopDay: 7, repeat: true }
  },
  {
    day: 3,
    title: "Moving to Manage Pain",
    type: "message",
    content: "Some pain is to be expected, but the following steps may help you manage it: Take your medications as instructed, Get up and walk every waking hour, Keep up with at least a few reps of your exercises.",
    frequency: { startDay: 3, stopDay: 7, repeat: true }
  },
  {
    day: 5,
    title: "Nutrition Advice",
    type: "message",
    content: "Maintain a high-fiber and high protein diet. Eat foods that are naturally grown and picked, like vegetables and fruits. Avoid processed foods.",
    frequency: { startDay: 5, stopDay: 14, repeat: false }
  },
  {
    day: 5,
    title: "Difficulty Sleeping",
    type: "message",
    content: "Sleep disturbances after surgery are normal. If you are having difficulty sleeping, try the following recommendations:",
    frequency: { startDay: 5, stopDay: 14, repeat: false }
  },
  {
    day: 7,
    title: "Wound Care - Bandage Removal",
    type: "message",
    content: "You may remove your bandage today. It is helpful to get the bandage wet in a warm shower and remove like a bandaid. You have dissolveable sutures and glue underneath the bandage.",
    frequency: { startDay: 7, stopDay: 7, repeat: false }
  }
];
```

#### **Phase 3: Intermediate Recovery (Day +8 to Day +30)**
```javascript
const intermediateRecoveryTimeline = [
  {
    day: 10,
    title: "When Can I Return to Driving?",
    type: "message",
    content: "Here are a few things to consider before you return to driving:",
    frequency: { startDay: 10, stopDay: 10, repeat: false }
  },
  {
    day: 14,
    title: "Weaning Off Medication",
    type: "message",
    content: "At this point, you may be feeling ready to start decreasing you pain medication. It is ok if not, as everyone recovers at a different pace.",
    frequency: { startDay: 14, stopDay: 14, repeat: false }
  },
  {
    day: 15,
    title: "Post Op Instructions - Walking",
    type: "exercise",
    content: "Follow these instructions for walking the third and fourth weeks after your surgery",
    variants: ["average", "low", "active"], // Different intensity levels
    frequency: { startDay: 15, stopDay: 28, repeat: true }
  },
  {
    day: 30,
    title: "Recovery Varies",
    type: "message",
    content: "Congratulations on making it through your first month of recovery. The process of healing can take a while, so please be patient with yourself.",
    frequency: { startDay: 30, stopDay: 30, repeat: false }
  },
  {
    day: 30,
    title: "Using Lotion on Your Incision",
    type: "message",
    content: "If your incision is completely healed, you may start to use vitamin E or lotion on your scar.",
    frequency: { startDay: 30, stopDay: 30, repeat: false }
  }
];
```

#### **Phase 4: Advanced Recovery (Day +31 to Day +90)**
```javascript
const advancedRecoveryTimeline = [
  {
    day: 40,
    title: "Heart Healthy Exercises",
    type: "exercise",
    content: "The goal of your surgery is a hip or knee that will allow you good motion and the ability to do your everyday activities with less pain.",
    frequency: { startDay: 40, stopDay: 90, repeat: false }
  },
  {
    day: 88,
    title: "Joint Discomfort Expectations",
    type: "message",
    content: "Congrats on completing the smart recover program for your surgery. We wish you the best on your continued success. The messaging program will end on day 90.",
    frequency: { startDay: 88, stopDay: 90, repeat: false }
  },
  {
    day: 88,
    title: "Patient Reported Outcome Measures",
    type: "form",
    content: "You will be receiving a notification soon to complete your Patient Reported Outcome Measures. Please log into your app to fill this out so your care team can monitor how you're doing.",
    frequency: { startDay: 88, stopDay: 88, repeat: false }
  }
];
```

## 🏗️ **PROTOCOL BUILDER INTERFACE**

### **TASK 1: Main Builder Interface (60 minutes)**

#### **Page: `/provider/protocols/builder`**
```jsx
<thinking>
PROTOCOL BUILDER INTERFACE ANALYSIS:

1. USER NEEDS:
   - Practice admins need to create standardized recovery protocols
   - Must be able to assign tasks to specific recovery days
   - Need frequency controls (start/stop days, repetition)
   - Want both calendar and list views for different workflows
   - Need to see the complete timeline from Day -45 to Day +200

2. DESIGN DECISIONS:
   - Tabbed interface: Protocol Details, Recovery Timeline, Preview
   - Calendar view for visual timeline management
   - List view for detailed task configuration
   - Drag-and-drop for intuitive task placement
   - Frequency controls with start/stop day selectors
   - Task type indicators with color coding

3. UX FLOW:
   - Start with protocol details (name, description, surgery type)
   - Move to timeline view (calendar or list)
   - Add tasks with drag-and-drop or form
   - Configure frequency for each task
   - Preview patient experience
   - Save and activate protocol

4. HEALTHCARE CONTEXT:
   - Must be precise and reliable for clinical use
   - Clear visual indicators for different task types
   - Easy to understand frequency patterns
   - Professional appearance for medical staff
</thinking>

export default function ProtocolBuilder() {
  const [protocol, setProtocol] = useState({
    name: '',
    description: '',
    surgery_types: ['TKA', 'THA'],
    timeline_start: -45,
    timeline_end: 200,
    is_active: false
  });
  
  const [tasks, setTasks] = useState([]);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'
  const [selectedDay, setSelectedDay] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'timeline', 'preview'

  // Load real timeline data
  useEffect(() => {
    loadDefaultTimeline();
  }, []);

  const loadDefaultTimeline = () => {
    const defaultTasks = [
      ...preOpTimeline,
      ...earlyRecoveryTimeline,
      ...intermediateRecoveryTimeline,
      ...advancedRecoveryTimeline
    ];
    setTasks(defaultTasks);
  };

  return (
    <DashboardLayout title="Protocol Builder" subtitle="Create standardized recovery protocols">
      <div className="max-w-7xl mx-auto">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'details', name: 'Protocol Details', icon: '📋' },
              { id: 'timeline', name: 'Recovery Timeline', icon: '📅' },
              { id: 'preview', name: 'Preview', icon: '👁️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <ProtocolDetailsTab 
            protocol={protocol} 
            setProtocol={setProtocol} 
          />
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-6">
            {/* View Mode Toggle */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold text-gray-900">Recovery Timeline</h3>
                <span className="text-sm text-gray-600">
                  Day {protocol.timeline_start} to Day +{protocol.timeline_end}
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'calendar'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    📅 Calendar View
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    📋 List View
                  </button>
                </div>

                {/* Add Task Button */}
                <Button
                  onClick={() => setShowTaskForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  + Add Task
                </Button>
              </div>
            </div>

            {/* Timeline Content */}
            {viewMode === 'calendar' ? (
              <CalendarTimelineView 
                tasks={tasks}
                setTasks={setTasks}
                selectedDay={selectedDay}
                setSelectedDay={setSelectedDay}
                protocol={protocol}
              />
            ) : (
              <ListTimelineView 
                tasks={tasks}
                setTasks={setTasks}
                protocol={protocol}
              />
            )}
          </div>
        )}

        {activeTab === 'preview' && (
          <ProtocolPreviewTab 
            protocol={protocol}
            tasks={tasks}
          />
        )}

        {/* Task Form Modal */}
        {showTaskForm && (
          <TaskFormModal
            isOpen={showTaskForm}
            onClose={() => setShowTaskForm(false)}
            onSave={(task) => {
              setTasks([...tasks, { ...task, id: Date.now() }]);
              setShowTaskForm(false);
            }}
            selectedDay={selectedDay}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

// Calendar Timeline View Component
const CalendarTimelineView = ({ tasks, setTasks, selectedDay, setSelectedDay, protocol }) => {
  const [currentWeek, setCurrentWeek] = useState(0);
  
  // Generate week ranges
  const generateWeeks = () => {
    const weeks = [];
    const totalDays = protocol.timeline_end - protocol.timeline_start + 1;
    const weeksCount = Math.ceil(totalDays / 7);
    
    for (let i = 0; i < weeksCount; i++) {
      const startDay = protocol.timeline_start + (i * 7);
      const endDay = Math.min(startDay + 6, protocol.timeline_end);
      weeks.push({ startDay, endDay, days: [] });
      
      for (let day = startDay; day <= endDay; day++) {
        weeks[i].days.push(day);
      }
    }
    return weeks;
  };

  const weeks = generateWeeks();
  const currentWeekData = weeks[currentWeek];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Week Navigation */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <button
          onClick={() => setCurrentWeek(Math.max(0, currentWeek - 1))}
          disabled={currentWeek === 0}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50"
        >
          ← Previous Week
        </button>
        
        <div className="text-center">
          <h4 className="text-lg font-semibold text-gray-900">
            Week {currentWeek + 1} of {weeks.length}
          </h4>
          <p className="text-sm text-gray-600">
            Day {currentWeekData.startDay} to Day {currentWeekData.endDay}
          </p>
        </div>
        
        <button
          onClick={() => setCurrentWeek(Math.min(weeks.length - 1, currentWeek + 1))}
          disabled={currentWeek === weeks.length - 1}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50"
        >
          Next Week →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        <div className="grid grid-cols-7 gap-4">
          {/* Day Headers */}
          {currentWeekData.days.map((day) => (
            <div key={day} className="text-center">
              <div className="text-sm font-medium text-gray-900 mb-2">
                Day {day}
              </div>
              <div className="text-xs text-gray-500 mb-4">
                {day < 0 ? 'Pre-Op' : day === 0 ? 'Surgery' : 'Post-Op'}
              </div>
              
              {/* Tasks for this day */}
              <div className="space-y-2 min-h-[200px] bg-gray-50 rounded-lg p-2">
                {tasks
                  .filter(task => {
                    // Check if task should appear on this day based on frequency
                    const { startDay, stopDay, repeat } = task.frequency;
                    const taskStartDay = typeof startDay === 'string' ? 
                      (startDay.includes('enrollment') ? -45 : parseInt(startDay)) : 
                      startDay;
                    const taskStopDay = typeof stopDay === 'string' ? 
                      (stopDay.includes('enrollment') ? -45 : parseInt(stopDay)) : 
                      stopDay;
                    
                    if (repeat) {
                      return day >= taskStartDay && day <= taskStopDay;
                    } else {
                      return day === taskStartDay;
                    }
                  })
                  .map((task, index) => (
                    <TaskCard
                      key={`${task.id}-${day}-${index}`}
                      task={task}
                      day={day}
                      onEdit={() => editTask(task)}
                      onDelete={() => deleteTask(task.id)}
                    />
                  ))}
                
                {/* Drop Zone */}
                <div
                  onClick={() => setSelectedDay(day)}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-2 text-center text-xs text-gray-500 hover:border-blue-400 hover:text-blue-600 cursor-pointer"
                >
                  + Add Task
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Task Card Component
const TaskCard = ({ task, day, onEdit, onDelete }) => {
  const getTaskTypeColor = (type) => {
    switch (type) {
      case 'form': return 'bg-green-100 text-green-800 border-green-200';
      case 'exercise': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'video': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'message': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTaskTypeIcon = (type) => {
    switch (type) {
      case 'form': return '📋';
      case 'exercise': return '🏃‍♂️';
      case 'video': return '🎥';
      case 'message': return '💬';
      default: return '📄';
    }
  };

  return (
    <div className={`border rounded-lg p-2 text-xs ${getTaskTypeColor(task.type)}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium">
          {getTaskTypeIcon(task.type)} {task.type}
        </span>
        <div className="flex space-x-1">
          <button
            onClick={onEdit}
            className="text-gray-600 hover:text-blue-600"
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            className="text-gray-600 hover:text-red-600"
          >
            🗑️
          </button>
        </div>
      </div>
      <div className="font-medium text-gray-900 mb-1 truncate">
        {task.title}
      </div>
      
      {/* Frequency Indicator */}
      {task.frequency.repeat && (
        <div className="text-xs text-gray-600 bg-white bg-opacity-50 rounded px-1">
          Repeats: Day {task.frequency.startDay} - {task.frequency.stopDay}
        </div>
      )}
    </div>
  );
};
```

### **TASK 2: Frequency Control System (45 minutes)**

#### **Task Form with Frequency Controls:**
```jsx
const TaskFormModal = ({ isOpen, onClose, onSave, selectedDay }) => {
  const [task, setTask] = useState({
    title: '',
    type: 'message',
    content: '',
    videoUrl: '',
    frequency: {
      startDay: selectedDay || 1,
      stopDay: selectedDay || 1,
      repeat: false,
      pattern: 'daily' // daily, weekly, custom
    }
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Task">
      <div className="space-y-6">
        {/* Basic Task Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Type
            </label>
            <select
              value={task.type}
              onChange={(e) => setTask({ ...task, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="message">💬 Message</option>
              <option value="form">📋 Form</option>
              <option value="exercise">🏃‍♂️ Exercise</option>
              <option value="video">🎥 Video</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={task.title}
              onChange={(e) => setTask({ ...task, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Task title"
            />
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content
          </label>
          <textarea
            value={task.content}
            onChange={(e) => setTask({ ...task, content: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Task content or instructions"
          />
        </div>

        {/* Frequency Controls */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-3">
            📱 Frequency Controls (Like Phone Reminders)
          </h4>
          
          <div className="space-y-4">
            {/* Repeat Toggle */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="repeat"
                checked={task.frequency.repeat}
                onChange={(e) => setTask({
                  ...task,
                  frequency: { ...task.frequency, repeat: e.target.checked }
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="repeat" className="text-sm font-medium text-gray-700">
                Repeat this task for multiple days
              </label>
            </div>

            {/* Start and Stop Days */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Day
                </label>
                <input
                  type="number"
                  value={task.frequency.startDay}
                  onChange={(e) => setTask({
                    ...task,
                    frequency: { ...task.frequency, startDay: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 1"
                />
              </div>
              
              {task.frequency.repeat && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stop Day
                  </label>
                  <input
                    type="number"
                    value={task.frequency.stopDay}
                    onChange={(e) => setTask({
                      ...task,
                      frequency: { ...task.frequency, stopDay: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 5"
                  />
                </div>
              )}
            </div>

            {/* Frequency Preview */}
            {task.frequency.repeat && (
              <div className="bg-white border border-blue-200 rounded-lg p-3">
                <div className="text-sm text-blue-800">
                  <strong>Preview:</strong> This task will appear daily from Day {task.frequency.startDay} to Day {task.frequency.stopDay} 
                  ({task.frequency.stopDay - task.frequency.startDay + 1} days total)
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Like a phone reminder that shows up every day for {task.frequency.stopDay - task.frequency.startDay + 1} days
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={() => onSave(task)}
            disabled={!task.title || !task.content}
          >
            Add Task
          </Button>
        </div>
      </div>
    </Modal>
  );
};
```

### **TASK 3: List View with Bulk Operations (30 minutes)**

#### **List Timeline View:**
```jsx
const ListTimelineView = ({ tasks, setTasks, protocol }) => {
  const [sortBy, setSortBy] = useState('day');
  const [filterType, setFilterType] = useState('all');
  const [selectedTasks, setSelectedTasks] = useState([]);

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === 'day') {
      return a.frequency.startDay - b.frequency.startDay;
    }
    if (sortBy === 'type') {
      return a.type.localeCompare(b.type);
    }
    return a.title.localeCompare(b.title);
  });

  const filteredTasks = sortedTasks.filter(task => {
    if (filterType === 'all') return true;
    return task.type === filterType;
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Controls */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort by
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="day">Recovery Day</option>
              <option value="type">Task Type</option>
              <option value="title">Title</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="message">💬 Messages</option>
              <option value="form">📋 Forms</option>
              <option value="exercise">🏃‍♂️ Exercises</option>
              <option value="video">🎥 Videos</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedTasks.length > 0 && (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              {selectedTasks.length} selected
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => bulkDelete(selectedTasks)}
            >
              Delete Selected
            </Button>
          </div>
        )}
      </div>

      {/* Task List */}
      <div className="divide-y divide-gray-200">
        {filteredTasks.map((task, index) => (
          <TaskListItem
            key={task.id}
            task={task}
            isSelected={selectedTasks.includes(task.id)}
            onSelect={(selected) => {
              if (selected) {
                setSelectedTasks([...selectedTasks, task.id]);
              } else {
                setSelectedTasks(selectedTasks.filter(id => id !== task.id));
              }
            }}
            onEdit={() => editTask(task)}
            onDelete={() => deleteTask(task.id)}
          />
        ))}
      </div>
    </div>
  );
};

const TaskListItem = ({ task, isSelected, onSelect, onEdit, onDelete }) => {
  const getTaskTypeColor = (type) => {
    switch (type) {
      case 'form': return 'bg-green-100 text-green-800';
      case 'exercise': return 'bg-purple-100 text-purple-800';
      case 'video': return 'bg-blue-100 text-blue-800';
      case 'message': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskTypeIcon = (type) => {
    switch (type) {
      case 'form': return '📋';
      case 'exercise': return '🏃‍♂️';
      case 'video': return '🎥';
      case 'message': return '💬';
      default: return '📄';
    }
  };

  return (
    <div className={`p-6 hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
      <div className="flex items-center space-x-4">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />

        {/* Task Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTaskTypeColor(task.type)}`}>
              {getTaskTypeIcon(task.type)} {task.type}
            </span>
            
            <span className="text-sm font-medium text-gray-900">
              Day {task.frequency.startDay}
              {task.frequency.repeat && ` - ${task.frequency.stopDay}`}
            </span>
            
            {task.frequency.repeat && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                📱 Repeats {task.frequency.stopDay - task.frequency.startDay + 1} days
              </span>
            )}
          </div>
          
          <h4 className="text-lg font-medium text-gray-900 mb-1">
            {task.title}
          </h4>
          
          <p className="text-sm text-gray-600 line-clamp-2">
            {task.content}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onEdit}
          >
            Edit
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};
```

## ✅ **COMPLETION CHECKLIST**

### **Protocol Builder Features:**
- [ ] Tabbed interface (Details, Timeline, Preview)
- [ ] Calendar view with week navigation
- [ ] List view with sorting and filtering
- [ ] Drag-and-drop task placement
- [ ] Frequency controls (start/stop days, repetition)
- [ ] Real timeline data integration
- [ ] Task type indicators and color coding
- [ ] Bulk operations for efficiency

### **Frequency System:**
- [ ] Start day and stop day controls
- [ ] Repeat toggle for multi-day tasks
- [ ] Visual frequency preview
- [ ] Phone reminder-style functionality
- [ ] Daily repetition patterns

### **Real Data Integration:**
- [ ] Pre-surgery timeline (Day -45 to Day -1)
- [ ] Surgery day and early recovery (Day 0 to Day +7)
- [ ] Intermediate recovery (Day +8 to Day +30)
- [ ] Advanced recovery (Day +31 to Day +200)
- [ ] Surgery type variations (TKA vs THA)

**ESTIMATED TIME: 2.5 hours**
**PRIORITY: HIGH - Core protocol creation functionality**

