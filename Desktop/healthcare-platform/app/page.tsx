'use client'

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Heart, Shield, Users, Activity, LogIn, Stethoscope, ChevronRight, CheckCircle, Clock, MessageSquare, BarChart, Zap, Award } from 'lucide-react';
import { AuthForm } from '@/components/auth/auth-form';

export default function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#002238' }}>
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold" style={{ color: '#002238' }}>TJV Recovery</span>
                <span className="hidden sm:inline-block text-xs text-gray-600 ml-2">Healthcare Excellence Platform</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/create-account">
                <Button size="sm" style={{ backgroundColor: '#006DB1', color: 'white' }}>
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Patient Focused */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#C8DBE9] via-white to-[#C8DBE9] opacity-30"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#006DB1] rounded-full filter blur-3xl opacity-10 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#002238] rounded-full filter blur-3xl opacity-10 translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="mb-12">
            <div className="inline-flex items-center px-6 py-3 bg-[#C8DBE9] rounded-full text-base font-medium mb-8" style={{ color: '#002238' }}>
              <Heart className="w-5 h-5 mr-2" />
              Your Recovery Journey Starts Here
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6" style={{ color: '#002238' }}>
              Welcome to
              <span className="block mt-2" style={{ color: '#006DB1' }}>TJV Recovery</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
              Experience personalized post-surgery recovery with 24/7 AI support, 
              expert guidance, and real-time progress tracking.
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link href="/auth/create-account">
              <Button size="lg" className="px-10 py-6 text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105" 
                      style={{ backgroundColor: '#006DB1', color: 'white' }}>
                <Heart className="mr-3 h-6 w-6" />
                Create Account
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="px-10 py-6 text-lg border-2" 
                      style={{ borderColor: '#002238', color: '#002238' }}>
                <LogIn className="mr-3 h-6 w-6" />
                Sign In
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" style={{ color: '#006DB1' }} />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5" style={{ color: '#006DB1' }} />
              <span>FDA Approved Protocols</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" style={{ color: '#006DB1' }} />
              <span>24/7 AI Support</span>
            </div>
          </div>
        </div>
      </section>


      {/* Features Section - Patient Focused */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#002238' }}>
              Your Recovery, Enhanced
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience a comprehensive recovery platform designed to support you every step of the way
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group">
              <div className="bg-white rounded-2xl p-8 h-full hover:shadow-lg transition-all border border-gray-100">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: '#C8DBE9' }}>
                  <MessageSquare className="h-7 w-7" style={{ color: '#002238' }} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#002238' }}>24/7 AI Recovery Assistant</h3>
                <p className="text-gray-600 mb-4">
                  Get instant answers to your recovery questions any time of day or night. Our AI assistant is always here to help.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group">
              <div className="bg-white rounded-2xl p-8 h-full hover:shadow-lg transition-all border border-gray-100">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: '#C8DBE9' }}>
                  <Activity className="h-7 w-7" style={{ color: '#002238' }} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#002238' }}>Personalized Recovery Plan</h3>
                <p className="text-gray-600 mb-4">
                  Follow a customized recovery protocol designed specifically for your procedure and individual needs.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group">
              <div className="bg-white rounded-2xl p-8 h-full hover:shadow-lg transition-all border border-gray-100">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: '#C8DBE9' }}>
                  <BarChart className="h-7 w-7" style={{ color: '#002238' }} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#002238' }}>Progress Tracking</h3>
                <p className="text-gray-600 mb-4">
                  Monitor your recovery progress with easy-to-understand charts and milestones.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group">
              <div className="bg-white rounded-2xl p-8 h-full hover:shadow-lg transition-all border border-gray-100">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: '#C8DBE9' }}>
                  <Heart className="h-7 w-7" style={{ color: '#002238' }} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#002238' }}>Direct Provider Access</h3>
                <p className="text-gray-600 mb-4">
                  Connect directly with your care team when you need additional support or have concerns.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="group">
              <div className="bg-white rounded-2xl p-8 h-full hover:shadow-lg transition-all border border-gray-100">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: '#C8DBE9' }}>
                  <Shield className="h-7 w-7" style={{ color: '#002238' }} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#002238' }}>Secure & Private</h3>
                <p className="text-gray-600 mb-4">
                  Your health information is protected with enterprise-grade security and HIPAA compliance.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="group">
              <div className="bg-white rounded-2xl p-8 h-full hover:shadow-lg transition-all border border-gray-100">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: '#C8DBE9' }}>
                  <Zap className="h-7 w-7" style={{ color: '#002238' }} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#002238' }}>Smart Reminders</h3>
                <p className="text-gray-600 mb-4">
                  Never miss an important milestone with intelligent reminders for exercises, medications, and appointments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#002238' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Start Your Recovery Journey Today
          </h2>
          <p className="text-xl mb-8" style={{ color: '#C8DBE9' }}>
            Join thousands of patients who have successfully recovered with our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/create-account">
              <Button size="lg" className="bg-white hover:bg-gray-100 px-8 py-6 text-lg shadow-lg" style={{ color: '#002238' }}>
                Create Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg">
                Sign In
                <LogIn className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-white py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#002238' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#006DB1' }}>
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">TJV Recovery</span>
              </div>
              <p className="text-sm" style={{ color: '#C8DBE9' }}>
                Your trusted partner in post-surgery recovery and rehabilitation.
              </p>
            </div>

            {/* Patient Resources */}
            <div>
              <h4 className="font-semibold mb-4">Patient Resources</h4>
              <ul className="space-y-2 text-sm" style={{ color: '#C8DBE9' }}>
                <li><a href="#" className="hover:text-white transition-colors">Recovery Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm" style={{ color: '#C8DBE9' }}>
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Healthcare Partners</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Testimonials</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm" style={{ color: '#C8DBE9' }}>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">HIPAA Compliance</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Patient Rights</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center" style={{ borderColor: '#006DB1' }}>
            <div className="text-sm mb-4 md:mb-0" style={{ color: '#C8DBE9' }}>
              © 2025 TJV Recovery Platform. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm" style={{ color: '#C8DBE9' }}>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Accessibility</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              Close
            </button>
            <AuthForm 
              mode={authMode}
              onModeChange={setAuthMode}
              showMagicLink={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}