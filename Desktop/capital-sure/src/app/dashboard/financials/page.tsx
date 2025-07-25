"use client";

import * as React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  AlertCircle,
  Calendar,
  Download,
  Plus,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  Building,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const financialStats = [
  {
    title: "Total Budget",
    value: "$6,240,000",
    change: "+12.5%",
    changeType: "positive" as const,
    icon: DollarSign,
    description: "Across all active projects",
  },
  {
    title: "Total Spent",
    value: "$4,180,000",
    change: "+8.2%",
    changeType: "positive" as const,
    icon: TrendingUp,
    description: "67% of total budget",
  },
  {
    title: "Pending Payments",
    value: "$285,000",
    change: "-15.3%",
    changeType: "negative" as const,
    icon: Clock,
    description: "12 invoices pending",
  },
  {
    title: "This Month",
    value: "$520,000",
    change: "+22.1%",
    changeType: "positive" as const,
    icon: Calendar,
    description: "Monthly expenses",
  },
];

const projectBudgets = [
  {
    id: 1,
    name: "Downtown Office Complex",
    budget: 850000,
    spent: 578000,
    remaining: 272000,
    progress: 68,
    status: "On Track",
    statusColor: "status-active",
    lastPayment: "Dec 1, 2024",
    nextMilestone: "Foundation Complete",
    nextPayment: "$85,000",
  },
  {
    id: 2,
    name: "Residential Tower A",
    budget: 1200000,
    spent: 180000,
    remaining: 1020000,
    progress: 15,
    status: "Under Budget",
    statusColor: "status-completed",
    lastPayment: "Nov 15, 2024",
    nextMilestone: "Site Preparation",
    nextPayment: "$120,000",
  },
  {
    id: 3,
    name: "Shopping Center Renovation",
    budget: 650000,
    spent: 325000,
    remaining: 325000,
    progress: 50,
    status: "Over Budget",
    statusColor: "status-overdue",
    lastPayment: "Nov 28, 2024",
    nextMilestone: "Electrical Work",
    nextPayment: "$45,000",
  },
  {
    id: 4,
    name: "Highway Bridge Construction",
    budget: 2100000,
    spent: 168000,
    remaining: 1932000,
    progress: 8,
    status: "On Track",
    statusColor: "status-active",
    lastPayment: "Nov 20, 2024",
    nextMilestone: "Environmental Clearance",
    nextPayment: "$210,000",
  },
];

const recentTransactions = [
  {
    id: 1,
    type: "payment",
    description: "Material suppliers - Steel beams",
    amount: -45000,
    date: "Dec 2, 2024",
    project: "Downtown Office Complex",
    status: "completed",
    category: "Materials",
  },
  {
    id: 2,
    type: "invoice",
    description: "Client payment - Milestone 3",
    amount: 125000,
    date: "Dec 1, 2024",
    project: "Shopping Center Renovation",
    status: "completed",
    category: "Revenue",
  },
  {
    id: 3,
    type: "payment",
    description: "Equipment rental - Crane service",
    amount: -8500,
    date: "Nov 30, 2024",
    project: "Residential Tower A",
    status: "pending",
    category: "Equipment",
  },
  {
    id: 4,
    type: "payment",
    description: "Labor costs - Week 48",
    amount: -32000,
    date: "Nov 29, 2024",
    project: "Downtown Office Complex",
    status: "completed",
    category: "Labor",
  },
  {
    id: 5,
    type: "invoice",
    description: "Progress payment - Phase 2",
    amount: 85000,
    date: "Nov 28, 2024",
    project: "Highway Bridge Construction",
    status: "pending",
    category: "Revenue",
  },
];

const categoryBreakdown = [
  { name: "Labor", amount: 1680000, percentage: 40, color: "bg-primary" },
  { name: "Materials", amount: 1260000, percentage: 30, color: "bg-construction-green" },
  { name: "Equipment", amount: 840000, percentage: 20, color: "bg-safety-orange" },
  { name: "Permits & Fees", amount: 420000, percentage: 10, color: "bg-warning-yellow" },
];

export default function FinancialsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  const filteredTransactions = recentTransactions.filter((transaction) =>
    transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.project.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-display font-bold text-foreground mb-2">
              Financial Management
            </h1>
            <p className="text-body-large text-muted-foreground">
              Track budgets, expenses, and financial performance across all projects
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Button variant="construction-outline" size="construction">
              <Download className="h-5 w-5 mr-2" />
              Export Report
            </Button>
            <Button size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Add Transaction
            </Button>
          </div>
        </div>

        {/* Financial Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8"
        >
          {financialStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
            >
              <Card variant="construction" className="group hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-primary/10 group-hover:scale-110 transition-transform">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex items-center space-x-1">
                      {stat.changeType === "positive" ? (
                        <TrendingUp className="h-4 w-4 text-construction-green" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-destructive" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          stat.changeType === "positive"
                            ? "text-success"
                            : "text-destructive"
                        }`}
                      >
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-1">
                      {stat.value}
                    </h3>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="projects">Project Budgets</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Budget Overview */}
                <div className="xl:col-span-2">
                  <Card variant="construction">
                    <CardHeader>
                      <CardTitle>Budget vs Spending Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {projectBudgets.slice(0, 4).map((project) => {
                          const spentPercentage = (project.spent / project.budget) * 100;
                          return (
                            <div key={project.id} className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium text-foreground">
                                    {project.name}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {formatCurrency(project.spent)} of {formatCurrency(project.budget)}
                                  </p>
                                </div>
                                <Badge variant="outline" size="sm">
                                  {project.status}
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span className="text-muted-foreground">Budget Usage</span>
                                  <span className="font-medium">{Math.round(spentPercentage)}%</span>
                                </div>
                                <Progress 
                                value={spentPercentage} 
                                className={cn(
                                  "h-2",
                                  spentPercentage >= 90 && "[&>div]:bg-destructive",
                                  spentPercentage < 50 && "[&>div]:bg-construction-green"
                                )}
                              />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Expense Categories */}
                <div>
                  <Card variant="construction">
                    <CardHeader>
                      <CardTitle>Expense Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {categoryBreakdown.map((category) => (
                          <div key={category.name} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-foreground">
                                {category.name}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {formatCurrency(category.amount)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="flex-1 bg-muted rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${category.color}`}
                                  style={{ width: `${category.percentage}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground min-w-[3rem]">
                                {category.percentage}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Cash Flow Summary - Right Side */}
                <div>
                  <Card variant="construction">
                    <CardHeader>
                      <CardTitle>Cash Flow Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-foreground">Current Month Inflow</span>
                          <span className="text-sm text-construction-green font-semibold">+$42.5M</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-foreground">Current Month Outflow</span>
                          <span className="text-sm text-destructive font-semibold">-$38.2M</span>
                        </div>
                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-foreground">Net Cash Flow</span>
                            <span className="text-lg text-construction-green font-bold">+$4.3M</span>
                          </div>
                        </div>
                        <div className="pt-4">
                          <div className="text-xs text-muted-foreground mb-2">90-Day Forecast</div>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-muted rounded-lg p-2">
                              <div className="text-xs text-muted-foreground">30 Days</div>
                              <div className="text-sm font-semibold text-construction-green">+$12.8M</div>
                            </div>
                            <div className="bg-muted rounded-lg p-2">
                              <div className="text-xs text-muted-foreground">60 Days</div>
                              <div className="text-sm font-semibold text-construction-green">+$18.5M</div>
                            </div>
                            <div className="bg-muted rounded-lg p-2">
                              <div className="text-xs text-muted-foreground">90 Days</div>
                              <div className="text-sm font-semibold text-construction-green">+$24.2M</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="projects" className="space-y-6">
              <Card variant="construction">
                <CardHeader>
                  <CardTitle>Project Budget Tracking</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-0">
                    {projectBudgets.map((project) => (
                      <div
                        key={project.id}
                        className="p-6 border-b border-border last:border-b-0 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <h3 className="font-semibold text-foreground">
                                {project.name}
                              </h3>
                              <Badge variant="outline" size="sm">
                                {project.status}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Total Budget</p>
                                <p className="font-semibold">{formatCurrency(project.budget)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Amount Spent</p>
                                <p className="font-semibold">{formatCurrency(project.spent)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Remaining</p>
                                <p className="font-semibold">{formatCurrency(project.remaining)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Progress</p>
                                <p className="font-semibold">{project.progress}%</p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Budget Usage</span>
                                <span className="font-medium">
                                  {Math.round((project.spent / project.budget) * 100)}%
                                </span>
                              </div>
                              <Progress 
                                value={(project.spent / project.budget) * 100} 
                                className={cn(
                                  "h-2",
                                  (project.spent / project.budget) * 100 >= 90 && "[&>div]:bg-destructive",
                                  (project.spent / project.budget) * 100 < 50 && "[&>div]:bg-construction-green"
                                )}
                              />
                            </div>
                          </div>

                          <div className="lg:ml-6 lg:text-right space-y-2">
                            <div className="flex lg:flex-col items-start lg:items-end space-x-4 lg:space-x-0 lg:space-y-2">
                              <div>
                                <p className="text-xs text-muted-foreground">Next Milestone</p>
                                <p className="text-sm font-medium">{project.nextMilestone}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Expected Payment</p>
                                <p className="text-sm font-medium text-construction-green">
                                  {project.nextPayment}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="construction-outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>

              <Card variant="construction">
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-0">
                    {filteredTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="p-6 border-b border-border last:border-b-0 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-lg ${
                              transaction.amount > 0 
                                ? 'bg-construction-green/10' 
                                : 'bg-destructive/10'
                            }`}>
                              {transaction.amount > 0 ? (
                                <ArrowUpRight className="h-4 w-4 text-construction-green" />
                              ) : (
                                <ArrowDownRight className="h-4 w-4 text-destructive" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-foreground">
                                {transaction.description}
                              </h4>
                              <div className="flex items-center space-x-3 mt-1">
                                <p className="text-sm text-muted-foreground">
                                  {transaction.project}
                                </p>
                                <Badge variant="outline" size="sm">
                                  {transaction.category}
                                </Badge>
                                <Badge 
                                  variant={transaction.status === 'completed' ? 'status-completed' : 'status-pending'} 
                                  size="sm"
                                >
                                  {transaction.status === 'completed' ? (
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                  ) : (
                                    <Clock className="h-3 w-3 mr-1" />
                                  )}
                                  {transaction.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${
                              transaction.amount > 0 
                                ? 'text-construction-green' 
                                : 'text-foreground'
                            }`}>
                              {transaction.amount > 0 ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {transaction.date}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[
                  {
                    title: "Budget Performance Report",
                    description: "Detailed analysis of budget vs actual spending",
                    icon: DollarSign,
                    color: "bg-primary",
                    period: "Monthly",
                  },
                  {
                    title: "Cash Flow Projection",
                    description: "Forecast of incoming and outgoing payments",
                    icon: TrendingUp,
                    color: "bg-construction-green",
                    period: "Quarterly",
                  },
                  {
                    title: "Project Profitability",
                    description: "Profit margins and ROI analysis by project",
                    icon: Building,
                    color: "bg-safety-orange",
                    period: "Project-based",
                  },
                  {
                    title: "Expense Category Analysis",
                    description: "Breakdown of expenses by category and trends",
                    icon: Receipt,
                    color: "bg-warning-yellow",
                    period: "Monthly",
                  },
                  {
                    title: "Payment Status Report",
                    description: "Outstanding invoices and payment schedules",
                    icon: CreditCard,
                    color: "bg-primary",
                    period: "Weekly",
                  },
                  {
                    title: "Financial Health Check",
                    description: "Overall financial performance indicators",
                    icon: AlertCircle,
                    color: "bg-construction-green",
                    period: "Quarterly",
                  },
                ].map((report) => (
                  <Card key={report.title} variant="construction" className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl ${report.color} group-hover:scale-105 transition-transform`}>
                          <report.icon className="h-6 w-6 text-white" />
                        </div>
                        <Badge variant="outline" size="sm">
                          {report.period}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {report.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {report.description}
                      </p>
                      <Button variant="construction-outline" size="sm" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Generate Report
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
  );
}