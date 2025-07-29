'use client';

import React, { useState } from 'react';
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
import { useAuth } from '@/hooks/use-auth';
import { Shield, ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { login } = useAuth();

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data.email, data.password);
      
      toast({
        title: '🎯 Login Successful',
        description: 'Welcome to the battlefield! Time to exploit some vulnerabilities.',
      });
      
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 500);
      
    } catch (error: unknown) {
      console.error("Login error:", error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        title: '❌ Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="absolute top-6 left-6 z-10">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="relative mx-auto w-20 h-20 mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-orange-500 rounded-2xl blur-lg opacity-50" />
              <div className="relative bg-gradient-to-r from-primary to-orange-500 p-4 rounded-2xl">
                <Shield className="h-12 w-12 text-white" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold font-headline mb-2">
              Welcome Back, Hacker
            </h1>
            <p className="text-muted-foreground">
              Ready to exploit some vulnerabilities?
            </p>
          </div>

          <Card className="backdrop-blur-sm bg-card/80 border-2 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-headline flex items-center justify-center gap-2">
                <Lock className="w-6 h-6 text-primary" />
                Secure Login
              </CardTitle>
              <CardDescription>
                Enter your credentials to access the training environment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
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
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showPassword ? "text" : "password"}
                              placeholder="Your secure password" 
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 font-semibold text-lg bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 transition-all duration-300" 
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Access Training Ground
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 p-4 bg-gradient-to-r from-secondary/20 to-secondary/30 rounded-lg border border-orange-500/20">
                <h4 className="font-semibold text-sm text-orange-500 mb-3">
                  🎯 Training Accounts (Vulnerable by Design)
                </h4>
                <div className="text-xs space-y-2">
                  <div>
                    <p><strong>Admin:</strong> admin@kurukshetra.dev / FLAG&#123;P4ssw0rd_1n_Pl41nt3xt!&#125;</p>
                  </div>
                  <div>
                    <p><strong>User:</strong> alice@example.com / password123</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">New to Kurukshetra? </span>
                <Link href="/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                  Create Account
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
