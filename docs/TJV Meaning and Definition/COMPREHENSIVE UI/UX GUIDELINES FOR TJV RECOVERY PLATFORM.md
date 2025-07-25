# COMPREHENSIVE UI/UX GUIDELINES FOR TJV RECOVERY PLATFORM

## 🎯 **DESIGN PHILOSOPHY**

### **Healthcare Platform Standards:**
- **Professional & Trustworthy** - Users are patients and medical professionals
- **Clean & Accessible** - Clear information hierarchy and WCAG compliance
- **Calming & Supportive** - Reduce anxiety during recovery process
- **Efficient & Intuitive** - Minimize cognitive load for all user types

## 🎨 **VISUAL DESIGN SYSTEM**

### **Color Palette:**
```css
/* Primary Colors */
--primary-blue: #2563eb;      /* Main brand color */
--primary-blue-light: #3b82f6; /* Hover states */
--primary-blue-dark: #1d4ed8;  /* Active states */

/* Secondary Colors */
--secondary-green: #059669;    /* Success, progress */
--secondary-orange: #ea580c;   /* Warnings, attention */
--secondary-red: #dc2626;      /* Errors, urgent */

/* Neutral Colors */
--gray-50: #f9fafb;           /* Background light */
--gray-100: #f3f4f6;          /* Background medium */
--gray-200: #e5e7eb;          /* Borders light */
--gray-300: #d1d5db;          /* Borders medium */
--gray-600: #4b5563;          /* Text secondary */
--gray-900: #111827;          /* Text primary */

/* Healthcare Specific */
--medical-blue: #1e40af;      /* Medical professional areas */
--patient-blue: #3b82f6;      /* Patient areas */
--recovery-green: #10b981;    /* Progress indicators */
```

### **Typography:**
```css
/* Font Family */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px - Small labels */
--text-sm: 0.875rem;   /* 14px - Body text small */
--text-base: 1rem;     /* 16px - Body text */
--text-lg: 1.125rem;   /* 18px - Subheadings */
--text-xl: 1.25rem;    /* 20px - Headings */
--text-2xl: 1.5rem;    /* 24px - Page titles */
--text-3xl: 1.875rem;  /* 30px - Main titles */

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
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

## 📱 **LAYOUT STANDARDS**

### **Container Widths:**
```css
/* Responsive containers */
--container-sm: 640px;    /* Mobile landscape */
--container-md: 768px;    /* Tablet */
--container-lg: 1024px;   /* Desktop */
--container-xl: 1280px;   /* Large desktop */
--container-2xl: 1536px;  /* Extra large */
```

### **Grid System:**
- Use CSS Grid for complex layouts
- Use Flexbox for component-level layouts
- 12-column grid system for responsive design
- Consistent gutters: 24px desktop, 16px mobile

### **Component Spacing:**
- **Cards:** 24px padding, 16px gap between elements
- **Forms:** 16px between fields, 8px between label and input
- **Buttons:** 12px vertical, 24px horizontal padding
- **Navigation:** 16px padding, 8px gap between items

## 🧩 **COMPONENT LIBRARY**

### **Buttons:**
```jsx
// Primary Button
<button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
  Primary Action
</button>

// Secondary Button
<button className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
  Secondary Action
</button>

// Danger Button
<button className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors">
  Danger Action
</button>
```

### **Form Elements:**
```jsx
// Input Field
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">
    Field Label
  </label>
  <input 
    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
    placeholder="Enter value..."
  />
</div>

// Select Dropdown
<select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
  <option>Select option...</option>
</select>

// Textarea
<textarea 
  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
  rows="4"
  placeholder="Enter details..."
></textarea>
```

### **Cards:**
```jsx
// Standard Card
<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">Card Title</h3>
  <p className="text-gray-600">Card content goes here...</p>
</div>

// Interactive Card
<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">Interactive Card</h3>
  <p className="text-gray-600">Clickable card content...</p>
</div>
```

## 🏥 **HEALTHCARE-SPECIFIC COMPONENTS**

### **Progress Indicators:**
```jsx
// Recovery Progress Bar
<div className="w-full bg-gray-200 rounded-full h-3">
  <div 
    className="bg-green-500 h-3 rounded-full transition-all duration-300"
    style={{ width: '65%' }}
  ></div>
</div>
<p className="text-sm text-gray-600 mt-2">Day 15 of 90 - 65% Complete</p>

// Pain Level Scale
<div className="flex items-center space-x-2">
  {[1,2,3,4,5,6,7,8,9,10].map(level => (
    <button 
      key={level}
      className={`w-8 h-8 rounded-full border-2 ${
        level <= selectedPain 
          ? 'bg-red-500 border-red-500 text-white' 
          : 'border-gray-300 text-gray-400'
      }`}
    >
      {level}
    </button>
  ))}
</div>
```

### **Status Badges:**
```jsx
// Status indicators
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
  ✓ Completed
</span>

<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
  ⏳ In Progress
</span>

<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
  ⚠ Overdue
</span>
```

## 📐 **LAYOUT PATTERNS**

### **Dashboard Layout:**
```jsx
<div className="min-h-screen bg-gray-50">
  {/* Header */}
  <header className="bg-white shadow-sm border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        {/* Logo and navigation */}
      </div>
    </div>
  </header>
  
  {/* Main Content */}
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main content area */}
      <div className="lg:col-span-2">
        {/* Primary content */}
      </div>
      
      {/* Sidebar */}
      <div className="lg:col-span-1">
        {/* Secondary content */}
      </div>
    </div>
  </div>
</div>
```

### **Form Layout:**
```jsx
<div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-8">
  <div className="mb-8">
    <h1 className="text-2xl font-bold text-gray-900">Form Title</h1>
    <p className="text-gray-600 mt-2">Form description</p>
  </div>
  
  <form className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Form fields */}
    </div>
    
    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
      <button type="button" className="secondary-button">Cancel</button>
      <button type="submit" className="primary-button">Submit</button>
    </div>
  </form>
</div>
```

## 📱 **RESPONSIVE DESIGN**

### **Breakpoints:**
```css
/* Mobile first approach */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

### **Mobile Considerations:**
- Touch targets minimum 44px
- Thumb-friendly navigation
- Simplified layouts on small screens
- Swipe gestures for navigation
- Larger text for readability

## ♿ **ACCESSIBILITY STANDARDS**

### **WCAG 2.1 AA Compliance:**
- Color contrast ratio minimum 4.5:1
- Keyboard navigation support
- Screen reader compatibility
- Focus indicators on all interactive elements
- Alt text for all images
- Semantic HTML structure

### **Implementation:**
```jsx
// Accessible button
<button 
  className="primary-button"
  aria-label="Submit recovery assessment"
  aria-describedby="submit-help"
>
  Submit Assessment
</button>
<div id="submit-help" className="sr-only">
  This will save your daily recovery progress
</div>

// Accessible form field
<div>
  <label htmlFor="pain-level" className="block text-sm font-medium text-gray-700">
    Current Pain Level
  </label>
  <input 
    id="pain-level"
    type="number"
    min="0"
    max="10"
    aria-describedby="pain-help"
    className="form-input"
  />
  <p id="pain-help" className="text-sm text-gray-500 mt-1">
    Rate your pain from 0 (no pain) to 10 (severe pain)
  </p>
</div>
```

## 🎭 **ANIMATION & INTERACTIONS**

### **Transition Standards:**
```css
/* Standard transitions */
.transition-colors { transition: color 150ms ease-in-out, background-color 150ms ease-in-out; }
.transition-shadow { transition: box-shadow 150ms ease-in-out; }
.transition-transform { transition: transform 150ms ease-in-out; }

/* Hover effects */
.hover-lift:hover { transform: translateY(-2px); }
.hover-scale:hover { transform: scale(1.02); }
```

### **Loading States:**
```jsx
// Loading spinner
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>

// Skeleton loading
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
</div>
```

## 🔍 **TESTING REQUIREMENTS**

### **Visual Testing:**
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Responsive design testing on multiple devices
- Color contrast validation
- Typography rendering verification

### **Usability Testing:**
- Navigation flow testing
- Form completion testing
- Accessibility testing with screen readers
- Performance testing on slow connections

## 📋 **IMPLEMENTATION CHECKLIST**

### **Before Any UI Development:**
- [ ] Review these guidelines thoroughly
- [ ] Set up design system CSS variables
- [ ] Create component library structure
- [ ] Test responsive breakpoints

### **For Each Component:**
- [ ] Follows color palette standards
- [ ] Uses consistent spacing
- [ ] Includes hover/focus states
- [ ] Meets accessibility requirements
- [ ] Works on mobile devices
- [ ] Includes loading states

### **For Each Page:**
- [ ] Professional appearance
- [ ] Consistent with design system
- [ ] Proper information hierarchy
- [ ] Clear navigation
- [ ] Responsive layout
- [ ] Fast loading performance

**THESE GUIDELINES ARE MANDATORY FOR ALL UI DEVELOPMENT**

