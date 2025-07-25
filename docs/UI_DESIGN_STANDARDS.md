# UI Design Standards - STRICT REQUIREMENTS

## Brand Colors (MANDATORY)
- **Primary**: #002238 (dark navy)
- **Secondary**: #006DB1 (blue)
- **Accent**: #C8DBE9 (light blue)
- **Background**: #FFFFFF (white)
- **Text Primary**: #333333 (dark gray)
- **Text Secondary**: #666666 (medium gray)
- **Success**: #10B981 (green)
- **Error**: #EF4444 (red)
- **Warning**: #F59E0B (amber)

## UI Framework Requirements
- **Component Library**: shadcn/ui components ONLY
- **Styling**: Tailwind CSS
- **Icons**: Lucide React icons
- **Fonts**: System fonts for maximum readability
- **Animations**: Subtle, professional transitions only

## Target Audience Design Principles
- **Age Group**: Adults 40+ (NOT childish or playful)
- **Font Size**: Minimum 16px base, 18px preferred
- **Contrast**: High contrast for readability
- **Touch Targets**: Minimum 44x44px for mobile
- **Spacing**: Generous padding and margins
- **Language**: Clear, professional, medical terminology when appropriate

## Chat Interface Requirements
### Layout
- **NO sidebar navigation** - Clean, focused chat experience
- Full-width chat container on desktop
- Mobile-optimized responsive design
- Fixed header with patient name
- Fixed input area at bottom

### Conversation Flow
- **AI speaks first, ALWAYS**
- Direct questions: "Rate your pain 0-10" (not "Please rate...")
- Conversational-form approach
- One question at a time
- Clear progress indicators

### Message Styling
- **AI Messages**: Left-aligned, light blue background (#F0F9FF)
- **Patient Messages**: Right-aligned, white background with border
- **System Messages**: Center-aligned, gray text
- **Timestamps**: Subtle, below messages
- **Avatar**: Professional medical icon for AI

### Input Area
- Large, accessible text input
- Send button clearly visible
- Voice input button prominent but not intrusive
- Character count for long messages
- Disabled state during AI response

## Mobile Design (Priority)
- Touch-friendly interface
- Large tap targets (minimum 44x44px)
- Thumb-reachable controls
- Keyboard-aware layout
- Smooth scrolling
- No horizontal scrolling

## Accessibility Requirements
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatible
- High contrast mode support
- Focus indicators
- Error messages clearly associated with inputs

## Professional Healthcare Appearance
### DO:
- Clean, clinical aesthetic
- Professional medical imagery
- Trust-building design elements
- Clear information hierarchy
- Consistent spacing and alignment

### DO NOT:
- Childish illustrations or cartoons
- Bright, playful colors
- Gamification elements
- Casual or informal design
- Cluttered layouts

## Component Standards
### Buttons
- Primary: Navy background (#002238), white text
- Secondary: White background, navy border and text
- Danger: Red background (#EF4444), white text
- Minimum height: 44px
- Rounded corners: 6px
- Clear hover and active states

### Forms
- Label above input
- Clear error messages
- Helper text when needed
- Proper field grouping
- Progressive disclosure for complex forms

### Cards
- White background
- Subtle shadow (shadow-sm)
- 8px border radius
- Consistent padding (24px)
- Clear section headers

## Loading States
- Professional spinner or skeleton screens
- Meaningful loading messages
- No jarring transitions
- Maintain layout stability

## Error Handling
- Clear, actionable error messages
- Professional tone
- Helpful recovery suggestions
- No technical jargon for patients
- Consistent error styling