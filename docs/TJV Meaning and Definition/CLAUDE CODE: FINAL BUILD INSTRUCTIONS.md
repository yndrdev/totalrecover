# CLAUDE CODE: FINAL BUILD INSTRUCTIONS

## 🎯 **MISSION: BUILD PROFESSIONAL TJV RECOVERY PLATFORM**

You are building a **professional healthcare platform** that must meet the highest standards of design, usability, and functionality. This is not a prototype - this is a production-ready system.

## 🧠 **MANDATORY: USE THINKING FOR EVERY COMPONENT**

**BEFORE implementing ANY component, page, or feature, you MUST use `<thinking>` tags:**

```
<thinking>
1. USER CONTEXT:
   - Who will use this component? (patient, provider, admin)
   - What is their primary goal?
   - What information do they need most?
   - What actions should be easiest to perform?

2. HEALTHCARE CONSIDERATIONS:
   - Is this displaying medical/health data?
   - What are the privacy/security implications?
   - How can we make this feel trustworthy?
   - Are there compliance requirements?

3. DESIGN DECISIONS:
   - Which brand colors are appropriate for this context?
   - What typography hierarchy makes sense?
   - How should spacing and layout be organized?
   - What responsive behavior is needed?

4. UX FLOW:
   - How do users navigate to/from this component?
   - What are the most common user paths?
   - How can we minimize cognitive load?
   - What error states need handling?

5. IMPLEMENTATION APPROACH:
   - What existing components can be reused?
   - How does this integrate with the design system?
   - What data does this need from Supabase?
   - How will this perform with real data?
</thinking>
```

## 🎨 **DESIGN SYSTEM COMPLIANCE**

### **MANDATORY REQUIREMENTS:**

#### **1. Brand Colors (MUST USE EXACTLY):**
```jsx
// Primary Actions
className="bg-blue-600 hover:bg-blue-700 text-white"

// Secondary Actions  
className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"

// Success States
className="bg-green-600 hover:bg-green-700 text-white"

// Warning/Alert States
className="bg-orange-600 hover:bg-orange-700 text-white"

// Recovery Progress
className="bg-purple-600 hover:bg-purple-700 text-white"

// Chat/Communication
className="bg-teal-600 hover:bg-teal-700 text-white"
```

#### **2. Typography (MUST USE CONSISTENTLY):**
```jsx
// Page Titles
className="text-3xl font-bold text-gray-900"

// Section Headers
className="text-xl font-semibold text-gray-900"

// Subsection Headers
className="text-lg font-medium text-gray-900"

// Body Text
className="text-base text-gray-700"

// Secondary Text
className="text-sm text-gray-600"

// Caption Text
className="text-xs text-gray-500"
```

#### **3. Spacing (MUST USE DESIGN SYSTEM):**
```jsx
// Component Spacing
className="space-y-6"        // Between major sections
className="space-y-4"        // Between related items
className="space-y-3"        // Between form fields
className="space-x-3"        // Between buttons

// Padding
className="p-6"              // Card padding
className="p-4"              // Smaller card padding
className="px-4 py-2"        // Button padding
className="px-3 py-2"        // Input padding
```

#### **4. Responsive Design (MANDATORY):**
```jsx
// Grid Layouts
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"

// Responsive Text
className="text-xl md:text-2xl lg:text-3xl"

// Responsive Spacing
className="p-4 md:p-6 lg:p-8"

// Responsive Visibility
className="hidden md:block"
className="block md:hidden"
```

## 🏥 **HEALTHCARE PLATFORM STANDARDS**

### **Professional Appearance:**
- **Clean, minimal design** - avoid clutter
- **Consistent iconography** - use medical/healthcare icons
- **Clear visual hierarchy** - most important info first
- **Trustworthy colors** - blues, greens, professional grays
- **Readable typography** - sufficient contrast and size

### **User Experience:**
- **Intuitive navigation** - users should never be lost
- **Clear feedback** - loading states, success/error messages
- **Accessible design** - keyboard navigation, screen readers
- **Mobile-friendly** - works perfectly on all devices
- **Fast performance** - optimized for real data loads

### **Healthcare Context:**
- **Patient privacy** - secure, professional appearance
- **Medical accuracy** - precise language and data display
- **Emergency clarity** - urgent actions clearly marked
- **Progress visualization** - recovery progress easy to understand
- **Provider tools** - efficient workflows for healthcare staff

## 📋 **IMPLEMENTATION STANDARDS**

### **Component Structure:**
```jsx
// ALWAYS start with thinking
<thinking>
[Analysis of component requirements]
</thinking>

// Use proper component structure
export default function ComponentName() {
  // State management
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effects and data fetching
  useEffect(() => {
    fetchData();
  }, []);

  // Event handlers
  const handleAction = async () => {
    // Implementation
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error.message}</p>
      </div>
    );
  }

  // Main component
  return (
    <div className="[proper styling classes]">
      {/* Component content */}
    </div>
  );
}
```

### **Data Integration:**
```jsx
// ALWAYS use real Supabase data
const fetchData = async () => {
  try {
    setLoading(true);
    const { data, error } = await supabase
      .from('table_name')
      .select('*')
      .eq('tenant_id', tenantId);
    
    if (error) throw error;
    setData(data);
  } catch (error) {
    setError(error);
  } finally {
    setLoading(false);
  }
};

// ALWAYS handle real-time updates
useEffect(() => {
  const subscription = supabase
    .channel('table_changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'table_name'
    }, handleRealTimeUpdate)
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
}, []);
```

## 🚀 **EXECUTION CHECKLIST**

### **Before Starting Each Component:**
- [ ] Read and understand the requirements
- [ ] Use `<thinking>` tags to analyze the component
- [ ] Plan the user experience and data flow
- [ ] Choose appropriate colors and styling
- [ ] Consider responsive behavior

### **During Implementation:**
- [ ] Follow the design system exactly
- [ ] Use real Supabase data (no hardcoded content)
- [ ] Implement proper loading and error states
- [ ] Add responsive design classes
- [ ] Include accessibility features

### **After Implementation:**
- [ ] Test on different screen sizes
- [ ] Verify brand color usage
- [ ] Check accessibility (keyboard navigation)
- [ ] Ensure data integration works
- [ ] Test error scenarios

## 🎯 **SUCCESS CRITERIA**

### **Visual Quality:**
- ✅ Looks professional and trustworthy
- ✅ Consistent with healthcare platform standards
- ✅ Uses brand colors correctly
- ✅ Responsive on all devices
- ✅ Accessible to all users

### **Functionality:**
- ✅ All features work with real data
- ✅ Real-time updates function properly
- ✅ Error handling is robust
- ✅ Performance is optimized
- ✅ User flows are intuitive

### **Healthcare Standards:**
- ✅ Appropriate for medical use
- ✅ Privacy and security conscious
- ✅ Clear information hierarchy
- ✅ Professional appearance
- ✅ Trustworthy user experience

## 🔥 **FINAL DIRECTIVE**

**You are building a production-ready healthcare platform that will be used by real patients and providers. Every component must be:**

1. **THOUGHTFULLY DESIGNED** - Use thinking tags for every component
2. **PROFESSIONALLY STYLED** - Follow the design system exactly
3. **FULLY FUNCTIONAL** - Integrate with real Supabase data
4. **ACCESSIBLE** - Work for all users on all devices
5. **HEALTHCARE-APPROPRIATE** - Meet medical platform standards

**This is not a demo or prototype. This is a real healthcare platform that must work perfectly.**

**START WITH THINKING, FOLLOW THE DESIGN SYSTEM, USE REAL DATA, AND BUILD SOMETHING AMAZING!**

