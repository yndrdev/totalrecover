"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-orange-50/20 min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="relative z-10">
          <div className="container flex items-center justify-between py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-primary/10 ring-2 ring-primary/20">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <span className="text-headline font-bold text-foreground">
                  CapitalSure
                </span>
                <Badge variant="project-active" size="sm" className="ml-2">
                  Beta
                </Badge>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="#features"
                className="text-body font-medium text-muted-foreground hover:text-primary transition-colors touch-target px-3 py-2 rounded-lg hover:bg-primary/5"
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="text-body font-medium text-muted-foreground hover:text-primary transition-colors touch-target px-3 py-2 rounded-lg hover:bg-primary/5"
              >
                Pricing
              </Link>
              <Button variant="outline" size="lg" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 pb-24 pt-10 sm:pb-32 lg:pt-32 flex-1 flex items-center">
          <div className="container">
            <motion.div
              className="container-secondary mx-auto text-center"
              initial="initial"
              animate="animate"
              variants={staggerChildren}
            >
              <motion.div variants={fadeInUp}>
                <div className="flex items-center justify-center mb-6">
                  <Badge
                    variant="glass"
                    size="lg"
                    className="touch-target backdrop-blur-md shadow-lg border border-primary/20"
                  >
                    🚀 Now in Beta - Join Early Access
                  </Badge>
                </div>
              </motion.div>

              <motion.h1
                className="text-display font-bold tracking-tight text-foreground text-balance"
                variants={fadeInUp}
              >
                Universal Construction{" "}
                <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
                  Operating System
                </span>
              </motion.h1>

              <motion.p
                className="mt-6 text-body-large leading-relaxed text-muted-foreground text-balance"
                variants={fadeInUp}
              >
                Create accountability, schedule certainty, and capital
                protection for construction projects. AI-powered scheduling,
                escrow-backed payments, and immutable progress tracking.
              </motion.p>

              <motion.div
                className="mt-10 flex items-center justify-center"
                variants={fadeInUp}
              >
                <Button size="lg" asChild className="shadow-xl">
                  <Link href="/dashboard">
                    View Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                className="mt-8 flex items-center justify-center text-caption text-muted-foreground"
                variants={fadeInUp}
              >
                <Star className="h-4 w-4 text-warning mr-1" />
                <span className="mr-4">4.9/5 from 2,000+ users</span>
                <span className="mr-4">•</span>
                <span>No credit card required</span>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-blue-400 to-blue-600 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 sm:py-32 bg-background">
        <div className="container">
          <motion.div
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-headline font-bold tracking-tight text-foreground">
              Everything you need to manage construction projects
            </h2>
            <p className="mt-4 text-body-large text-muted-foreground max-w-3xl mx-auto">
              From planning to completion, our platform provides the tools and
              insights you need to deliver projects on time and on budget.
            </p>
          </motion.div>

          <motion.div
            className="mt-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
          >
            <div className="grid-construction">
              <motion.div
                className="col-span-4 md:col-span-8 xl:col-span-5"
                variants={fadeInUp}
              >
                <Card className="h-full group border" variant="elevated">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 text-primary mb-6 group-hover:scale-105 transition-transform duration-200">
                      <Clock className="h-8 w-8" />
                    </div>
                    <h3 className="text-title font-semibold text-foreground mb-4">
                      AI-Powered Scheduling
                    </h3>
                    <p className="text-body text-muted-foreground mb-6">
                      Intelligent scheduling that adapts to weather, resources,
                      and dependencies to keep your projects on track.
                    </p>
                    <ul className="space-y-4 text-body text-muted-foreground">
                      <li className="flex items-center touch-target group/item">
                        <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center mr-3 group-hover/item:bg-success/20 transition-colors">
                          <CheckCircle className="h-4 w-4 text-success" />
                        </div>
                        Critical path analysis
                      </li>
                      <li className="flex items-center touch-target group/item">
                        <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center mr-3 group-hover/item:bg-success/20 transition-colors">
                          <CheckCircle className="h-4 w-4 text-success" />
                        </div>
                        Weather integration
                      </li>
                      <li className="flex items-center touch-target group/item">
                        <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center mr-3 group-hover/item:bg-success/20 transition-colors">
                          <CheckCircle className="h-4 w-4 text-success" />
                        </div>
                        Resource optimization
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                className="col-span-4 md:col-span-8 xl:col-span-6"
                variants={fadeInUp}
              >
                <Card className="h-full group border" variant="elevated">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-warning/10 to-warning/20 text-warning mb-6 group-hover:scale-105 transition-transform duration-200">
                      <Shield className="h-8 w-8" />
                    </div>
                    <h3 className="text-title font-semibold text-foreground mb-4">
                      Escrow-Backed Payments
                    </h3>
                    <p className="text-body text-muted-foreground mb-6">
                      Secure milestone-based payments that protect both
                      contractors and clients with automated escrow management.
                    </p>
                    <ul className="space-y-4 text-body text-muted-foreground">
                      <li className="flex items-center touch-target group/item">
                        <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center mr-3 group-hover/item:bg-success/20 transition-colors">
                          <CheckCircle className="h-4 w-4 text-success" />
                        </div>
                        Automated escrow
                      </li>
                      <li className="flex items-center touch-target group/item">
                        <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center mr-3 group-hover/item:bg-success/20 transition-colors">
                          <CheckCircle className="h-4 w-4 text-success" />
                        </div>
                        Milestone payments
                      </li>
                      <li className="flex items-center touch-target group/item">
                        <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center mr-3 group-hover/item:bg-success/20 transition-colors">
                          <CheckCircle className="h-4 w-4 text-success" />
                        </div>
                        Dispute resolution
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                className="col-span-4 md:col-span-8 xl:col-span-5"
                variants={fadeInUp}
              >
                <Card className="h-full group border" variant="elevated">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-success/10 to-success/20 text-success mb-6 group-hover:scale-105 transition-transform duration-200">
                      <TrendingUp className="h-8 w-8" />
                    </div>
                    <h3 className="text-title font-semibold text-foreground mb-4">
                      Progress Tracking
                    </h3>
                    <p className="text-body text-muted-foreground mb-6">
                      Real-time progress tracking with photo documentation and
                      immutable records for complete transparency.
                    </p>
                    <ul className="space-y-4 text-body text-muted-foreground">
                      <li className="flex items-center touch-target group/item">
                        <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center mr-3 group-hover/item:bg-success/20 transition-colors">
                          <CheckCircle className="h-4 w-4 text-success" />
                        </div>
                        Photo documentation
                      </li>
                      <li className="flex items-center touch-target group/item">
                        <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center mr-3 group-hover/item:bg-success/20 transition-colors">
                          <CheckCircle className="h-4 w-4 text-success" />
                        </div>
                        Time tracking
                      </li>
                      <li className="flex items-center touch-target group/item">
                        <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center mr-3 group-hover/item:bg-success/20 transition-colors">
                          <CheckCircle className="h-4 w-4 text-success" />
                        </div>
                        Quality control
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-primary to-success py-16">
        <div className="container">
          <motion.div
            className="grid-construction"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
          >
            <motion.div
              className="col-span-4 md:col-span-2 lg:col-span-4 text-center"
              variants={fadeInUp}
            >
              <div className="text-3xl font-bold text-white">98%</div>
              <div className="text-blue-100">On-time delivery</div>
            </motion.div>
            <motion.div
              className="col-span-4 md:col-span-2 lg:col-span-4 text-center"
              variants={fadeInUp}
            >
              <div className="text-3xl font-bold text-white">$50M+</div>
              <div className="text-blue-100">Projects managed</div>
            </motion.div>
            <motion.div
              className="col-span-4 md:col-span-2 lg:col-span-4 text-center"
              variants={fadeInUp}
            >
              <div className="text-3xl font-bold text-white">15%</div>
              <div className="text-blue-100">Cost reduction</div>
            </motion.div>
            <motion.div
              className="col-span-4 md:col-span-2 lg:col-span-4 text-center"
              variants={fadeInUp}
            >
              <div className="text-3xl font-bold text-white">2000+</div>
              <div className="text-blue-100">Happy customers</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-orange-50 to-blue-50 py-16">
        <div className="container">
          <motion.div
            className="container-secondary mx-auto text-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-headline font-bold tracking-tight text-foreground">
              Ready to transform your construction projects?
            </h2>
            <p className="mt-4 text-body-large text-muted-foreground max-w-3xl mx-auto">
              Join thousands of construction professionals who trust CapitalSure
              to deliver projects on time and on budget.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="shadow-xl">
                <Link href="/auth/register">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="construction-outline"
                size="construction"
                className="shadow-lg"
              >
                Schedule Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t">
        <div className="container py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="text-title font-semibold text-foreground">
                CapitalSure
              </span>
            </div>
            <p className="text-caption text-muted-foreground">
              © 2025 CapitalSure. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
