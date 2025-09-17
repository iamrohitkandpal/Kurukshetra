// src/app/register/page.tsx - Enhanced Professional Version
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Shield, ArrowLeft, Lock, User, Mail, Eye, EyeOff, CheckCircle, X } from 'lucide-react';
// import { PageTransition, FadeInSection, ScaleInCard } from '@/components/page-transition';
import { useState } from 'react';

const registerSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters.' }).regex(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  const watchedFields = form.watch();

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    const checks = {
      length: password.length >= 6,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    strength = Object.values(checks).filter(Boolean).length;
    return { strength, checks };
  };

  const passwordAnalysis = getPasswordStrength(watchedFields.password || '');

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed.');
      }
      
      toast({
        title: '🎉 Registration Successful',
        description: 'Welcome to the elite! You can now login and start your security journey.',
      });
      
      setTimeout(() => {
        router.push('/login');
      }, 1000);
      
    } catch (error: unknown) {
      console.error("Registration error:", error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      
      if (errorMessage.toLowerCase().includes('username')) {
        form.setError('username', { type: 'manual', message: errorMessage });
      } else if (errorMessage.toLowerCase().includes('email')) {
         form.setError('email', { type: 'manual', message: errorMessage });
      } else {
        toast({
          title: '❌ Registration Failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        {/* Navigation */}
        <div className="absolute top-6 left-6 z-10">
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/3 rounded-full blur-3xl" />
        </div>

        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
              {/* Header */}
              <div className="text-center">
                  <div className="relative mx-auto w-20 h-20 mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-primary rounded-2xl blur-lg opacity-50" />
                    <div className="relative bg-gradient-to-r from-green-500 to-primary p-4 rounded-2xl">
                      <Shield className="h-12 w-12 text-white" />
                    </div>
                  </div>
                
                <h1 className="text-3xl font-bold font-headline mb-2">
                  Join the Elite
                </h1>
                <p className="text-muted-foreground">
                  Create your account and start hacking legally
                </p>
              </div>

              {/* Registration Form */}
                <Card className="backdrop-blur-sm bg-card/80 border-2 shadow-2xl">
                  <CardHeader className="text-center pb-6">
                    <CardTitle className="text-2xl font-headline flex items-center justify-center gap-2">
                      <User className="w-6 h-6 text-primary" />
                      Create Account
                    </CardTitle>
                    <CardDescription>
                      Join thousands of ethical hackers worldwide
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                Username
                                <User className="w-3 h-3 text-primary" />
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="elite_hacker" 
                                  className="h-12 bg-background/50 border-2 focus:border-primary/50 transition-colors"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                Email Address
                                <Mail className="w-3 h-3 text-orange-500" />
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  type="email"
                                  placeholder="hacker@example.com" 
                                  className="h-12 bg-background/50 border-2 focus:border-primary/50 transition-colors"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                Password
                                <Lock className="w-3 h-3 text-green-500" />
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a strong password" 
                                    className="h-12 bg-background/50 border-2 focus:border-primary/50 transition-colors pr-12"
                                    {...field} 
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                  >
                                    {showPassword ? (
                                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                      <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </Button>
                                </div>
                              </FormControl>
                              
                              {/* Password Strength Indicator */}
                              {watchedFields.password && (
                                <div className="mt-2 space-y-2">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">Password Strength</span>
                                    <span className={`font-medium ${
                                      passwordAnalysis.strength <= 2 ? 'text-red-500' :
                                      passwordAnalysis.strength <= 3 ? 'text-yellow-500' :
                                      passwordAnalysis.strength <= 4 ? 'text-blue-500' : 'text-green-500'
                                    }`}>
                                      {passwordAnalysis.strength <= 2 ? 'Weak' :
                                       passwordAnalysis.strength <= 3 ? 'Fair' :
                                       passwordAnalysis.strength <= 4 ? 'Good' : 'Strong'}
                                    </span>
                                  </div>
                                  <div className="flex gap-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <div 
                                        key={i}
                                        className={`h-1 flex-1 rounded-full transition-colors ${
                                          i < passwordAnalysis.strength 
                                            ? passwordAnalysis.strength <= 2 ? 'bg-red-500' :
                                              passwordAnalysis.strength <= 3 ? 'bg-yellow-500' :
                                              passwordAnalysis.strength <= 4 ? 'bg-blue-500' : 'bg-green-500'
                                            : 'bg-muted'
                                        }`} 
                                      />
                                    ))}
                                  </div>
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                    {Object.entries(passwordAnalysis.checks).map(([key, passed]) => (
                                      <div key={key} className="flex items-center gap-1">
                                        {passed ? (
                                          <CheckCircle className="w-3 h-3 text-green-500" />
                                        ) : (
                                          <X className="w-3 h-3 text-muted-foreground" />
                                        )}
                                        <span className={passed ? 'text-green-500' : 'text-muted-foreground'}>
                                          {key === 'length' ? '6+ chars' :
                                           key === 'lowercase' ? 'Lowercase' :
                                           key === 'uppercase' ? 'Uppercase' :
                                           key === 'number' ? 'Number' :
                                           'Special'}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full h-12 font-semibold text-lg bg-gradient-to-r from-green-500 to-primary hover:from-green-500/90 hover:to-primary/90 transition-all duration-300" 
                          disabled={form.formState.isSubmitting}
                        >
                          {form.formState.isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                              Creating Account...
                            </>
                          ) : (
                            <>
                              <Shield className="w-4 h-4 mr-2" />
                              Join the Elite
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>

                    <div className="mt-6 text-center text-sm">
                      <span className="text-muted-foreground">Already have an account? </span>
                      <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                        Login Here
                      </Link>
                    </div>
                  </CardContent>
                </Card>

              {/* Security Notice */}
                <div className="p-4 bg-secondary/30 rounded-lg border border-primary/20 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Lock className="w-4 h-4 text-primary" />
                    <span>All data is encrypted and stored securely</span>
                  </div>
                </div>
            </div>
        </div>
      </div>
  );
}
