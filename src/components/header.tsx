'use client'

import Link from 'next/link';
import { Shield, LogOut, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DatabaseToggle } from '@/components/database-toggle';


export function Header() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      logout();
      toast({ 
        title: '🚪 Logged Out Successfully', 
        description: 'You have been securely logged out. Thanks for training!' 
      });
      
      // Small delay for UX, then redirect
      setTimeout(() => {
        router.push('/login');
        router.refresh();
      }, 1000);
    } catch (error) {
      console.error('Logout error:', error);
      toast({ 
        title: '❌ Logout Failed', 
        description: 'Could not log you out properly.', 
        variant: 'destructive' 
      });
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    // Use the first two letters of the username for the avatar
    return name.substring(0, 2).toUpperCase();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex items-center py-3">
        <Link href="/" className="flex items-center gap-2 mr-auto">
          <Shield className="h-8 w-8 text-primary" />
          <span className="font-bold text-lg font-headline">Kurukshetra</span>
        </Link>
        <nav className="flex items-center gap-2">
          <DatabaseToggle />
           <Button variant="ghost" asChild>
                <a 
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=iamrohitkandpal@gmail.com&su=Kurukshetra%20Security%20Platform%20Inquiry&body=Hello,%0A%0AI%20am%20contacting%20you%20regarding%20the%20Kurukshetra%20security%20training%20platform.%0A%0APlease%20let%20me%20know%20how%20I%20can%20assist%20you.%0A%0AThank%20you!"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                    <Mail className="mr-2 h-4 w-4" />
                    Contact
                </a>
            </Button>
          {loading ? (
            <div className="h-9 w-20 bg-muted rounded-md animate-pulse" />
          ) : user ? (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-9 w-9">
                    {/* The custom backend doesn't provide a photoURL */}
                    {/* <AvatarImage src={user.photoURL} alt={user.username || 'User'} /> */}
                    <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
