// src/components/database-toggle.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { Database, Server, Settings2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { InlineLoader } from '@/components/loading-spinner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type DatabaseType = 'sqlite' | 'mongo';

interface DatabaseInfo {
  type: DatabaseType;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const databases: Record<DatabaseType, DatabaseInfo> = {
  sqlite: {
    type: 'sqlite',
    name: 'SQLite',
    icon: <Database className="h-4 w-4" />,
    description: 'Local SQL database for development',
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
  },
  mongo: {
    type: 'mongo',
    name: 'MongoDB',
    icon: <Server className="h-4 w-4" />,
    description: 'NoSQL cloud database',
    color: 'bg-green-500/10 text-green-500 border-green-500/20'
  }
};

export function DatabaseToggle() {
  const [currentDb, setCurrentDb] = useState<DatabaseType>('sqlite');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [targetDb, setTargetDb] = useState<DatabaseType>('sqlite');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Check current database type from environment or API
    checkCurrentDatabase();
  }, []);

  const checkCurrentDatabase = async () => {
    try {
      const response = await fetch(`/api/database/status`);
      if (response.ok) {
        const data = await response.json();
        setCurrentDb(data.type || 'sqlite');
      }
    } catch (error) {
      console.error('Failed to check database status:', error);
      // Default to sqlite if check fails
      setCurrentDb('sqlite');
    }
  };

  const handleDatabaseSwitch = (dbType: DatabaseType) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'You must be logged in to switch database environments.',
        variant: 'destructive',
      });
      return;
    }
    
    if (dbType === currentDb) return;
    
    setTargetDb(dbType);
    setShowConfirm(true);
  };

  const confirmSwitch = async () => {
    setIsLoading(true);
    setShowConfirm(false);

    try {
      const response = await fetch(`/api/database/switch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: targetDb }),
      });

      if (response.ok) {
        setCurrentDb(targetDb);
        toast({
          title: 'Database Switched',
          description: `Successfully switched to ${databases[targetDb].name}`,
        });
        
        // Reload the page to apply database changes
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        throw new Error('Failed to switch database');
      }
    } catch (error) {
      console.error('Database switch failed:', error);
      toast({
        title: 'Switch Failed',
        description: 'Could not switch database. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentDbInfo = databases[currentDb];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={isLoading}>
            {isLoading ? (
              <InlineLoader size="sm" className="mr-2" />
            ) : (
              <Settings2 className="h-4 w-4 mr-2" />
            )}
            <Badge variant="outline" className={`${currentDbInfo.color} mr-1`}>
              {currentDbInfo.icon}
              <span className="ml-1">{currentDbInfo.name}</span>
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="end">
          <DropdownMenuLabel>Database Environment</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {!user && (
            <div className="px-2 py-2 text-sm text-muted-foreground border rounded-md bg-muted/50 mb-2 mx-2">
              <div className="flex items-center gap-2 mb-1">
                <Lock className="h-3 w-3" />
                <span className="font-medium">Login Required</span>
              </div>
              <p className="text-xs">You must be logged in to switch database environments.</p>
            </div>
          )}
          
          {Object.values(databases).map((db) => {
            const isActive = db.type === currentDb;
            return (
              <DropdownMenuItem
                key={db.type}
                onClick={() => handleDatabaseSwitch(db.type)}
                disabled={isActive || isLoading}
                className={isActive ? 'bg-muted' : ''}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    {db.icon}
                    <div className="flex flex-col">
                      <span className="font-medium">{db.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {db.description}
                      </span>
                    </div>
                  </div>
                  {isActive && (
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch Database Environment?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to switch from{' '}
              <strong>{databases[currentDb].name}</strong> to{' '}
              <strong>{databases[targetDb].name}</strong>.
              <br /><br />
              This will change the testing environment and may require reloading 
              the application. Any unsaved progress may be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSwitch} disabled={isLoading}>
              {isLoading ? 'Switching...' : 'Switch Database'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
