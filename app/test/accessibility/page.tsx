"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { StatusIndicator, RecoveryDayStatus } from "@/components/ui/status-indicator";
import { ProgressBar, RecoveryProgress, HealthMetricProgress } from "@/components/ui/progress-bar";

export default function AccessibilityTestPage() {
  const [buttonClicks, setButtonClicks] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [selectValue, setSelectValue] = useState("");
  const [textareaValue, setTextareaValue] = useState("");
  const [activeTab, setActiveTab] = useState("components");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Accessibility & Responsive Test Page</h1>
          <p className="text-gray-600 mt-2">Test all UI components for accessibility compliance and responsive behavior</p>
        </div>

        {/* Skip to Content Link */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-[#2563eb] text-white px-4 py-2 rounded-lg">
          Skip to main content
        </a>

        <main id="main-content">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="components">Components</TabsTrigger>
              <TabsTrigger value="forms">Forms</TabsTrigger>
              <TabsTrigger value="healthcare">Healthcare UI</TabsTrigger>
              <TabsTrigger value="responsive">Responsive</TabsTrigger>
            </TabsList>

            {/* Components Tab */}
            <TabsContent value="components" className="space-y-8">
              {/* Buttons Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Buttons</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-4">
                      <Button
                        variant="primary"
                        onClick={() => setButtonClicks(buttonClicks + 1)}
                        aria-label="Primary button - Click count"
                      >
                        Primary ({buttonClicks})
                      </Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="success">Success</Button>
                      <Button variant="warning">Warning</Button>
                      <Button variant="destructive">Destructive</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="ghost">Ghost</Button>
                      <Button variant="link">Link</Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                      <Button size="sm">Small</Button>
                      <Button size="md">Medium</Button>
                      <Button size="lg">Large</Button>
                      <Button size="xl">Extra Large</Button>
                      <Button size="icon" aria-label="Icon button">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <Button disabled>Disabled</Button>
                      <Button aria-busy="true" aria-live="polite">
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                        Loading...
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cards Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Cards</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-semibold">Default Card</h3>
                        <p className="text-sm text-gray-600 mt-2">Standard card with subtle shadow</p>
                      </CardContent>
                    </Card>
                    
                    <Card variant="elevated">
                      <CardContent className="p-4">
                        <h3 className="font-semibold">Elevated Card</h3>
                        <p className="text-sm text-gray-600 mt-2">Important content with stronger shadow</p>
                      </CardContent>
                    </Card>
                    
                    <Card variant="success">
                      <CardContent className="p-4">
                        <h3 className="font-semibold">Success Card</h3>
                        <p className="text-sm text-gray-700 mt-2">Positive status or confirmation</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* Badges Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Badges</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="info">Info</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Avatar Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Avatars</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src="/placeholder-avatar.jpg" alt="User avatar" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="/placeholder-avatar.jpg" alt="Medium avatar" />
                      <AvatarFallback>AB</AvatarFallback>
                    </Avatar>
                    <Avatar className="h-16 w-16">
                      <AvatarImage src="/placeholder-avatar.jpg" alt="Large avatar" />
                      <AvatarFallback>XY</AvatarFallback>
                    </Avatar>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Forms Tab */}
            <TabsContent value="forms" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Form Controls</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6" aria-label="Test form">
                    <div>
                      <Label htmlFor="text-input">Text Input</Label>
                      <Input
                        id="text-input"
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Enter text..."
                        aria-describedby="text-input-help"
                      />
                      <p id="text-input-help" className="text-sm text-gray-600 mt-1">
                        This is a help text for the input field
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="email-input">Email Input (Required)</Label>
                      <Input
                        id="email-input"
                        type="email"
                        required
                        aria-required="true"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="disabled-input">Disabled Input</Label>
                      <Input
                        id="disabled-input"
                        type="text"
                        disabled
                        value="This input is disabled"
                      />
                    </div>

                    <div>
                      <Label htmlFor="select-input">Select Dropdown</Label>
                      <Select value={selectValue} onValueChange={setSelectValue}>
                        <SelectTrigger id="select-input" aria-label="Select an option">
                          <SelectValue placeholder="Choose an option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="option1">Option 1</SelectItem>
                          <SelectItem value="option2">Option 2</SelectItem>
                          <SelectItem value="option3">Option 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="textarea-input">Textarea</Label>
                      <Textarea
                        id="textarea-input"
                        value={textareaValue}
                        onChange={(e) => setTextareaValue(e.target.value)}
                        placeholder="Enter long text..."
                        rows={4}
                        aria-describedby="textarea-help"
                      />
                      <p id="textarea-help" className="text-sm text-gray-600 mt-1">
                        Character count: {textareaValue.length}
                      </p>
                    </div>

                    <fieldset>
                      <legend className="text-sm font-medium text-gray-700 mb-2">Checkbox Group</legend>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2 rounded" />
                          <span>Option A</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2 rounded" />
                          <span>Option B</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2 rounded" />
                          <span>Option C</span>
                        </label>
                      </div>
                    </fieldset>

                    <fieldset>
                      <legend className="text-sm font-medium text-gray-700 mb-2">Radio Group</legend>
                      <div className="space-y-2" role="radiogroup">
                        <label className="flex items-center">
                          <input type="radio" name="radio-group" className="mr-2" />
                          <span>Choice 1</span>
                        </label>
                        <label className="flex items-center">
                          <input type="radio" name="radio-group" className="mr-2" />
                          <span>Choice 2</span>
                        </label>
                        <label className="flex items-center">
                          <input type="radio" name="radio-group" className="mr-2" />
                          <span>Choice 3</span>
                        </label>
                      </div>
                    </fieldset>

                    <div className="flex space-x-4">
                      <Button type="submit" variant="primary">Submit Form</Button>
                      <Button type="reset" variant="secondary">Reset</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Healthcare UI Tab */}
            <TabsContent value="healthcare" className="space-y-8">
              {/* Status Indicators */}
              <Card>
                <CardHeader>
                  <CardTitle>Status Indicators</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-3">Recovery Day Status</h3>
                      <div className="flex flex-wrap gap-3">
                        <RecoveryDayStatus day={-30} />
                        <RecoveryDayStatus day={0} />
                        <RecoveryDayStatus day={15} />
                        <RecoveryDayStatus day={45} />
                        <RecoveryDayStatus day={90} />
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-medium mb-3">Task Status</h3>
                      <div className="flex flex-wrap gap-3">
                        <StatusIndicator variant="pending">Pending</StatusIndicator>
                        <StatusIndicator variant="inProgress">In Progress</StatusIndicator>
                        <StatusIndicator variant="completed">Completed</StatusIndicator>
                        <StatusIndicator variant="overdue">Overdue</StatusIndicator>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-medium mb-3">Health Status</h3>
                      <div className="flex flex-wrap gap-3">
                        <StatusIndicator variant="excellent">Excellent</StatusIndicator>
                        <StatusIndicator variant="good">Good</StatusIndicator>
                        <StatusIndicator variant="fair">Fair</StatusIndicator>
                        <StatusIndicator variant="poor">Poor</StatusIndicator>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Progress Bars */}
              <Card>
                <CardHeader>
                  <CardTitle>Progress Components</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Basic Progress Bars</h3>
                    <div className="space-y-4">
                      <ProgressBar value={25} label="Quarter Progress" />
                      <ProgressBar value={50} label="Half Progress" variant="success" />
                      <ProgressBar value={75} label="Three Quarters" variant="warning" />
                      <ProgressBar value={90} label="Almost Complete" variant="danger" />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-medium mb-3">Recovery Progress</h3>
                    <RecoveryProgress
                      currentDay={45}
                      totalDays={90}
                      milestones={[
                        { day: 0, label: "Surgery", completed: true },
                        { day: 7, label: "Week 1", completed: true },
                        { day: 30, label: "Month 1", completed: true },
                        { day: 60, label: "Month 2", completed: false },
                        { day: 90, label: "Month 3", completed: false },
                      ]}
                    />
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-medium mb-3">Health Metrics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <HealthMetricProgress
                        metric="Range of Motion"
                        value={120}
                        target={140}
                        unit="°"
                        trend="up"
                      />
                      <HealthMetricProgress
                        metric="Pain Level"
                        value={3}
                        target={2}
                        unit="/10"
                        trend="down"
                      />
                      <HealthMetricProgress
                        metric="Walking Distance"
                        value={500}
                        target={1000}
                        unit="m"
                        trend="up"
                      />
                      <HealthMetricProgress
                        metric="Strength"
                        value={7}
                        target={10}
                        unit="/10"
                        trend="stable"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Responsive Tab */}
            <TabsContent value="responsive" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Responsive Grid</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <Card key={num}>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-[#2563eb]">{num}</div>
                            <div className="text-sm text-gray-600">Grid Item</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Responsive Typography</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <h1 className="h1-responsive">Responsive Heading 1</h1>
                  <h2 className="h2-responsive">Responsive Heading 2</h2>
                  <h3 className="h3-responsive">Responsive Heading 3</h3>
                  <p className="text-responsive">
                    This is responsive body text that adjusts based on screen size. It ensures optimal readability
                    across all devices, from mobile phones to large desktop monitors.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mobile-First Utilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="mobile-only bg-red-100 p-4 rounded">
                      <p className="text-red-800">Visible on mobile only</p>
                    </div>
                    <div className="tablet-up bg-blue-100 p-4 rounded">
                      <p className="text-blue-800">Visible on tablet and up</p>
                    </div>
                    <div className="desktop-up bg-green-100 p-4 rounded">
                      <p className="text-green-800">Visible on desktop and up</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        {/* Accessibility Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Accessibility Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 list-disc list-inside">
              <li>All interactive elements have visible focus indicators</li>
              <li>Color contrast ratios meet WCAG 2.1 AA standards (4.5:1 for normal text)</li>
              <li>Form inputs have associated labels and help text</li>
              <li>ARIA attributes are used appropriately for screen readers</li>
              <li>Keyboard navigation is fully supported</li>
              <li>Touch targets are at least 44x44 pixels on mobile</li>
              <li>Responsive design works from 320px to 1920px+ widths</li>
              <li>Reduced motion preferences are respected</li>
              <li>High contrast mode is supported</li>
              <li>Semantic HTML is used throughout</li>
            </ul>
          </CardContent>
        </Card>

        {/* Keyboard Navigation Test */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Keyboard Navigation Test</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Try navigating this page using only your keyboard:</p>
            <ul className="space-y-1 list-disc list-inside text-sm">
              <li><kbd>Tab</kbd> - Move forward through interactive elements</li>
              <li><kbd>Shift + Tab</kbd> - Move backward through interactive elements</li>
              <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Activate buttons and links</li>
              <li><kbd>Arrow keys</kbd> - Navigate within components like tabs and selects</li>
              <li><kbd>Escape</kbd> - Close dropdowns and modals</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}