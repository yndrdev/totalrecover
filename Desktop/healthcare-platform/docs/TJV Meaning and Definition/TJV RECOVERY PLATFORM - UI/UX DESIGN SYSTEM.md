# TJV RECOVERY PLATFORM - UI/UX DESIGN SYSTEM

## 🎨 **BRAND COLORS & DESIGN SYSTEM**

### **Primary Color Palette:**
```css
:root {
  /* Primary Brand Colors */
  --primary-blue: #2563eb;      /* Main brand blue */
  --primary-blue-light: #3b82f6;
  --primary-blue-dark: #1d4ed8;
  
  /* Secondary Colors */
  --secondary-green: #059669;    /* Success/Health */
  --secondary-green-light: #10b981;
  --secondary-green-dark: #047857;
  
  /* Accent Colors */
  --accent-purple: #7c3aed;      /* Recovery/Progress */
  --accent-orange: #ea580c;      /* Alerts/Attention */
  --accent-teal: #0d9488;        /* Chat/Communication */
  
  /* Neutral Colors */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
  
  /* Status Colors */
  --success: #059669;
  --warning: #d97706;
  --error: #dc2626;
  --info: #2563eb;
}
```

### **Typography System:**
```css
/* Font Families */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Font Sizes */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### **Spacing System:**
```css
/* Consistent spacing scale */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

## 🏗️ **UI COMPONENT STANDARDS**

### **Button System:**
```jsx
// Primary Button (Main actions)
<Button variant="primary" size="md">
  className="bg-primary-blue hover:bg-primary-blue-dark text-white font-medium px-4 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-primary-blue focus:ring-offset-2"
</Button>

// Secondary Button (Secondary actions)
<Button variant="secondary" size="md">
  className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium px-4 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-primary-blue focus:ring-offset-2"
</Button>

// Success Button (Positive actions)
<Button variant="success" size="md">
  className="bg-secondary-green hover:bg-secondary-green-dark text-white font-medium px-4 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-secondary-green focus:ring-offset-2"
</Button>

// Warning Button (Caution actions)
<Button variant="warning" size="md">
  className="bg-accent-orange hover:bg-orange-600 text-white font-medium px-4 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-accent-orange focus:ring-offset-2"
</Button>
```

### **Card System:**
```jsx
// Standard Card
<Card>
  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6"
</Card>

// Elevated Card (Important content)
<Card variant="elevated">
  className="bg-white rounded-xl border border-gray-200 shadow-lg p-6"
</Card>

// Status Cards
<Card variant="success">
  className="bg-green-50 border border-green-200 rounded-xl p-6"
</Card>

<Card variant="warning">
  className="bg-orange-50 border border-orange-200 rounded-xl p-6"
</Card>

<Card variant="info">
  className="bg-blue-50 border border-blue-200 rounded-xl p-6"
</Card>
```

### **Input System:**
```jsx
// Standard Input
<Input>
  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-colors"
</Input>

// Select Dropdown
<Select>
  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white"
</Select>

// Textarea
<Textarea>
  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent resize-none"
</Textarea>
```

## 🎯 **HEALTHCARE UX BEST PRACTICES**

### **1. Accessibility Standards:**
- **WCAG 2.1 AA compliance** minimum
- **Color contrast ratio** 4.5:1 for normal text, 3:1 for large text
- **Keyboard navigation** for all interactive elements
- **Screen reader support** with proper ARIA labels
- **Focus indicators** clearly visible
- **Text alternatives** for all images and icons

### **2. Healthcare-Specific Design:**
- **Clear visual hierarchy** - most important information first
- **Consistent iconography** - use medical/healthcare icons
- **Status indicators** - clear success/warning/error states
- **Progress visualization** - show recovery progress clearly
- **Emergency actions** - red buttons for urgent actions
- **Calm color palette** - avoid overly bright or aggressive colors

### **3. Data Visualization:**
- **Progress bars** for recovery milestones
- **Charts and graphs** for health metrics
- **Timeline views** for treatment plans
- **Status badges** for task completion
- **Color coding** for different types of information

### **4. Mobile-First Design:**
- **Responsive layouts** that work on all devices
- **Touch-friendly** button sizes (minimum 44px)
- **Readable text** on small screens
- **Simplified navigation** for mobile
- **Offline capabilities** where possible

## 🧠 **CLAUDE CODE THINKING INSTRUCTIONS**

### **MANDATORY: Use <thinking> Tags**
```
Before implementing any component or page, Claude Code MUST use <thinking> tags to:

<thinking>
1. DESIGN ANALYSIS:
   - What is the primary purpose of this component/page?
   - Who are the users and what are their needs?
   - What information hierarchy is most important?

2. UX CONSIDERATIONS:
   - How will users navigate through this interface?
   - What are the most common user actions?
   - How can we minimize cognitive load?
   - What accessibility considerations are needed?

3. VISUAL DESIGN:
   - Which brand colors should be used for this context?
   - What typography hierarchy makes sense?
   - How should spacing and layout be organized?
   - What interactive states are needed?

4. HEALTHCARE CONTEXT:
   - Is this displaying medical/health information?
   - Are there any compliance considerations?
   - How can we make this feel trustworthy and professional?
   - What error states or edge cases need handling?

5. IMPLEMENTATION PLAN:
   - What components can be reused?
   - How will this integrate with the design system?
   - What responsive considerations are needed?
   - How will this perform with real data?
</thinking>
```

### **Design Decision Framework:**
```
For every design decision, consider:
1. USER NEEDS: Does this serve the user's primary goal?
2. BRAND CONSISTENCY: Does this match our design system?
3. ACCESSIBILITY: Can all users interact with this?
4. HEALTHCARE CONTEXT: Is this appropriate for medical use?
5. PERFORMANCE: Will this work well with real data?
```

## 📱 **RESPONSIVE DESIGN STANDARDS**

### **Breakpoints:**
```css
/* Mobile First Approach */
--mobile: 320px;      /* Small phones */
--mobile-lg: 480px;   /* Large phones */
--tablet: 768px;      /* Tablets */
--desktop: 1024px;    /* Small desktops */
--desktop-lg: 1280px; /* Large desktops */
--desktop-xl: 1536px; /* Extra large screens */
```

### **Layout Patterns:**
```jsx
// Mobile: Stack vertically
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

// Responsive spacing
<div className="p-4 md:p-6 lg:p-8">

// Responsive text
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">

// Responsive containers
<div className="max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl mx-auto">
```

## 🎨 **COMPONENT EXAMPLES**

### **Dashboard Layout:**
```jsx
<DashboardLayout>
  <div className="min-h-screen bg-gray-50">
    {/* Header */}
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* User menu, notifications, etc. */}
        </div>
      </div>
    </header>

    {/* Main Content */}
    <main className="max-w-7xl mx-auto px-6 py-8">
      {children}
    </main>
  </div>
</DashboardLayout>
```

### **Chat Interface Styling:**
```jsx
<div className="flex flex-col h-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg">
  {/* Chat Header */}
  <div className="bg-gradient-to-r from-primary-blue to-primary-blue-light text-white p-6 rounded-t-xl">
    <h2 className="text-xl font-semibold">Recovery Assistant</h2>
    <p className="text-blue-100">Day {recoveryDay} Check-in</p>
  </div>

  {/* Messages */}
  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
    {/* Message bubbles with proper styling */}
  </div>

  {/* Input Area */}
  <div className="bg-white border-t border-gray-200 p-4 rounded-b-xl">
    {/* Input with consistent styling */}
  </div>
</div>
```

### **Status Indicators:**
```jsx
// Recovery Day Status
<span className={`px-3 py-1 rounded-full text-sm font-medium ${
  recoveryDay < 0 ? 'bg-orange-100 text-orange-800' :
  recoveryDay === 0 ? 'bg-red-100 text-red-800' :
  recoveryDay <= 30 ? 'bg-blue-100 text-blue-800' :
  'bg-green-100 text-green-800'
}`}>
  Day {recoveryDay}
</span>

// Task Status
<span className={`px-2 py-1 rounded-full text-xs font-medium ${
  status === 'completed' ? 'bg-green-100 text-green-800' :
  status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
  status === 'overdue' ? 'bg-red-100 text-red-800' :
  'bg-gray-100 text-gray-800'
}`}>
  {status}
</span>
```

## ✅ **IMPLEMENTATION CHECKLIST**

### **Before Starting Any Component:**
- [ ] Use `<thinking>` tags to analyze requirements
- [ ] Consider user needs and healthcare context
- [ ] Plan responsive behavior
- [ ] Choose appropriate colors from brand palette
- [ ] Ensure accessibility compliance

### **During Implementation:**
- [ ] Use consistent spacing from design system
- [ ] Apply proper typography hierarchy
- [ ] Include hover and focus states
- [ ] Add loading and error states
- [ ] Test on multiple screen sizes

### **After Implementation:**
- [ ] Verify brand color usage
- [ ] Test keyboard navigation
- [ ] Check color contrast ratios
- [ ] Validate responsive behavior
- [ ] Ensure consistent with other components

## 🎯 **CLAUDE CODE DIRECTIVE**

**MANDATORY APPROACH:**
1. **ALWAYS use `<thinking>` tags** before implementing any UI component
2. **FOLLOW the brand color palette** exactly as specified
3. **IMPLEMENT responsive design** for all screen sizes
4. **ENSURE accessibility compliance** with WCAG 2.1 AA
5. **MAINTAIN consistency** across all components
6. **CONSIDER healthcare context** in all design decisions
7. **TEST thoroughly** on different devices and browsers

**This design system ensures a professional, accessible, and consistent healthcare platform that users can trust and navigate easily.**

