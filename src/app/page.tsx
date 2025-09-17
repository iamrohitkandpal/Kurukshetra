// src/app/page.tsx - Enhanced Professional Version
'use client'

import Link from 'next/link';
import { Header } from '@/components/header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { vulnerabilities } from '@/lib/vulnerabilities';
import { cn } from '@/lib/utils';
import { ArrowRight, CheckCircle, Shield, Zap, Target, Lock, AlertTriangle, Trophy, Users, BookOpen, Code2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { AdminDashboard } from '@/components/admin-dashboard';
import { PageTransition, FadeInSection, StaggeredContainer, StaggeredItem, ScaleInCard } from '@/components/page-transition';

export default function Home() {
  const { user } = useAuth();
  const [foundFlags, setFoundFlags] = useState<string[]>([]);

  useEffect(() => {
    if (user?.flagsFound) {
      setFoundFlags(user.flagsFound);
    } else {
      setFoundFlags([]);
    }
  }, [user]);

  const getSeverityClass = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-600/80 text-primary-foreground border-red-700 shadow-red-500/20';
      case 'high':
        return 'bg-orange-600 text-white border-orange-700 shadow-orange-500/20';
      case 'medium':
        return 'bg-yellow-500 text-black border-yellow-600 shadow-yellow-500/20';
      case 'low':
        return 'bg-blue-600 text-white border-blue-700 shadow-blue-500/20';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4" />;
      case 'high':
        return <Zap className="w-4 h-4" />;
      case 'medium':
        return <Target className="w-4 h-4" />;
      case 'low':
        return <Lock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const completedCount = foundFlags.length;
  const totalCount = vulnerabilities.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <PageTransition>
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1">
          {/* Hero Section */}
          <section className="container mx-auto px-4 py-12 md:py-20">
            <FadeInSection>
              <div className="text-center mb-16">
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <Shield className="w-16 h-16 text-primary" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 font-headline bg-gradient-to-r from-primary via-purple-500 to-orange-500 bg-clip-text text-transparent">
                  Kurukshetra
                </h1>
                <p className="text-2xl md:text-3xl font-semibold text-muted-foreground mb-4">
                  Professional OWASP Top 10 Security Training
                </p>
                <p className="text-lg text-muted-foreground max-w-6xl mx-auto mb-8">
                  Master ethical hacking with our comprehensive vulnerability testing environment. 
                  Practice penetration testing on intentionally vulnerable applications covering all OWASP Top 10 security risks.
                </p>
                
                {user && (
                  <div className="bg-secondary/50 backdrop-blur-sm rounded-xl p-6 max-w-md mx-auto mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-semibold">Progress</span>
                      <span className="text-sm text-muted-foreground">{completedCount}/{totalCount}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-3 mb-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Trophy className="w-4 h-4" />
                      <span>{Math.round(progressPercentage)}% Complete</span>
                    </div>
                  </div>
                )}
              </div>
            </FadeInSection>

            {/* Stats Section */}
            <FadeInSection delay={0.2}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl p-4 mb-3">
                    <BookOpen className="w-8 h-8 text-primary mx-auto" />
                  </div>
                  <div className="text-2xl font-bold">10</div>
                  <div className="text-sm text-muted-foreground">OWASP Categories</div>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-br from-orange-500/20 to-orange-500/10 rounded-xl p-4 mb-3">
                    <Target className="w-8 h-8 text-orange-500 mx-auto" />
                  </div>
                  <div className="text-2xl font-bold">{totalCount}</div>
                  <div className="text-sm text-muted-foreground">Vulnerabilities</div>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl p-4 mb-3">
                    <Code2 className="w-8 h-8 text-green-500 mx-auto" />
                  </div>
                  <div className="text-2xl font-bold">Multi-DB</div>
                  <div className="text-sm text-muted-foreground">SQL & NoSQL</div>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-xl p-4 mb-3">
                    <Users className="w-8 h-8 text-purple-500 mx-auto" />
                  </div>
                  <div className="text-2xl font-bold">Pro</div>
                  <div className="text-sm text-muted-foreground">Grade Training</div>
                </div>
              </div>
            </FadeInSection>
          </section>

          {/* Vulnerability Modules */}
          <section className="container mx-auto px-4 py-8">
            <FadeInSection delay={0.4}>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4 font-headline">
                  OWASP Top 10 Vulnerability Modules
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  Each module provides hands-on experience with real-world security vulnerabilities, 
                  complete with live demonstrations, code examples, and practical exploitation techniques.
                </p>
              </div>
            </FadeInSection>

            <StaggeredContainer>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {vulnerabilities.map((vuln, index) => (
                  <StaggeredItem key={vuln.slug}>
                    <ScaleInCard delay={index * 0.1}>
                      <Link href={`/vulnerabilities/${vuln.slug}`} className="group block h-full">
                        <Card className={cn(
                          "h-full flex flex-col relative overflow-hidden border-2 transition-all duration-300 ease-out",
                          foundFlags.includes(vuln.slug) 
                            ? "border-green-500/50 bg-green-500/5 shadow-lg shadow-green-500/10" 
                            : "border-border hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
                        )}>
                          {/* Success Overlay */}
                          {foundFlags.includes(vuln.slug) && (
                            <div className="absolute top-4 right-4 z-10">
                              <div className="bg-green-500 rounded-full p-2">
                                <CheckCircle className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          )}

                          <CardHeader className="pb-4">
                            <div className="flex justify-between items-start mb-4">
                              <div className="bg-gradient-to-br from-secondary to-secondary/50 p-3 rounded-xl">
                                <vuln.icon className="w-8 h-8 text-primary" />
                              </div>
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-sm font-medium flex items-center gap-1 shadow-sm",
                                  getSeverityClass(vuln.severity)
                                )}
                              >
                                {getSeverityIcon(vuln.severity)}
                                {vuln.severity}
                              </Badge>
                            </div>
                            <CardTitle className="text-xl font-headline group-hover:text-primary transition-colors">
                              {vuln.title}
                            </CardTitle>
                          </CardHeader>
                          
                          <CardContent className="flex-grow flex flex-col justify-between pt-0">
                            <CardDescription className="mb-6 text-base leading-relaxed">
                              {vuln.description}
                            </CardDescription>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className="w-2 h-2 bg-primary rounded-full opacity-60" />
                                <span>Interactive Demo</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm font-semibold text-primary group-hover:text-primary/80 transition-colors">
                                Exploit Now
                                <ArrowRight className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </ScaleInCard>
                  </StaggeredItem>
                ))}
              </div>
            </StaggeredContainer>

            {/* Call to Action */}
            {!user && (
              <FadeInSection delay={1.0}>
                <div className="text-center mt-16 p-8 bg-gradient-to-r from-primary/10 via-purple-500/10 to-orange-500/10 rounded-2xl border border-primary/20">
                  <h3 className="text-2xl font-bold mb-4">Ready to Begin Your Security Journey?</h3>
                  <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                    Join thousands of security professionals who trust Kurukshetra for hands-on cybersecurity training.
                    Start practicing ethical hacking today with our comprehensive OWASP Top 10 modules.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg" className="font-semibold">
                      <Link href="/register">
                        Start Training <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link href="/about">
                        Learn More
                      </Link>
                    </Button>
                  </div>
                </div>
              </FadeInSection>
            )}
            
            {/* Admin Dashboard Section - Access Control Demo */}
            {user && (
              <FadeInSection delay={0.8}>
                <div className="mt-16">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold tracking-tighter mb-4 font-headline">
                      Live Access Control Demo
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                      Interactive demonstration of broken access control vulnerabilities (A01). 
                      Try manipulating tenant IDs and discovering alternative admin endpoints.
                    </p>
                  </div>
                  <AdminDashboard />
                </div>
              </FadeInSection>
            )}
          </section>
        </main>
      </div>
    </PageTransition>
  );
}
