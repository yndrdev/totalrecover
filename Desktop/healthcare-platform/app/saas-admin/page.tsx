'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  Building2, 
  BarChart3, 
  Shield, 
  Settings, 
  Database, 
  ArrowRight,
  Globe,
  Server,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Zap
} from 'lucide-react'

export default function SaasAdminPortal() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SaaS Admin</h1>
                <p className="text-sm text-gray-600">Platform Administration</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">SaaS Platform Administration</h2>
          <p className="text-gray-600">Platform-wide administration, multi-tenant management, and system oversight</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">47</p>
                  <p className="text-sm text-gray-600">Active Practices</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">1,247</p>
                  <p className="text-sm text-gray-600">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">23%</p>
                  <p className="text-sm text-gray-600">Growth This Month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Server className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">99.9%</p>
                  <p className="text-sm text-gray-600">Platform Uptime</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tenant Management */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Tenant Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Manage practice tenants, onboarding, and subscription plans
              </p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled>
                Manage Tenants
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <p className="text-xs text-gray-500 mt-2">Coming Soon</p>
            </CardContent>
          </Card>

          {/* Platform Analytics */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Platform Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                View comprehensive platform metrics, usage analytics, and performance data
              </p>
              <Button className="w-full bg-green-600 hover:bg-green-700" disabled>
                View Analytics
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <p className="text-xs text-gray-500 mt-2">Coming Soon</p>
            </CardContent>
          </Card>

          {/* System Monitoring */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <Server className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>System Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Monitor system health, performance metrics, and infrastructure status
              </p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700" disabled>
                System Monitor
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <p className="text-xs text-gray-500 mt-2">Coming Soon</p>
            </CardContent>
          </Card>

          {/* Global Settings */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                <Globe className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Global Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Configure platform-wide settings, features, and global configurations
              </p>
              <Button className="w-full bg-orange-600 hover:bg-orange-700" disabled>
                Global Config
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <p className="text-xs text-gray-500 mt-2">Coming Soon</p>
            </CardContent>
          </Card>

          {/* Security Center */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Security Center</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Manage platform security, compliance, and audit logs across all tenants
              </p>
              <Button className="w-full bg-red-600 hover:bg-red-700" disabled>
                Security Center
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <p className="text-xs text-gray-500 mt-2">Coming Soon</p>
            </CardContent>
          </Card>

          {/* Database Management */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-3">
                <Database className="h-6 w-6 text-teal-600" />
              </div>
              <CardTitle>Database Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Manage database operations, backups, and data lifecycle policies
              </p>
              <Button className="w-full bg-teal-600 hover:bg-teal-700" disabled>
                Database Admin
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <p className="text-xs text-gray-500 mt-2">Coming Soon</p>
            </CardContent>
          </Card>
        </div>

        {/* System Health Dashboard */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">API Gateway</span>
                  </div>
                  <span className="text-sm text-green-600">Healthy</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">Database Cluster</span>
                  </div>
                  <span className="text-sm text-green-600">Healthy</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm font-medium text-gray-900">Notification Service</span>
                  </div>
                  <span className="text-sm text-yellow-600">Warning</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">New practice onboarded</span>
                    <p className="text-xs text-gray-500">Riverside Orthopedics - 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                  <Zap className="h-5 w-5 text-purple-600" />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">System maintenance completed</span>
                    <p className="text-xs text-gray-500">Database optimization - 4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">Usage milestone reached</span>
                    <p className="text-xs text-gray-500">1M+ tasks completed - 6 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}