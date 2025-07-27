// src/components/admin-dashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { SQLiDemo } from '@/components/sqli-demo';
import { InsecureDesignDemo } from '@/components/insecure-design-demo';
import { Settings, Users, Database, Shield, AlertTriangle, Layers } from 'lucide-react';

export function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    systemName: '',
    debugMode: false,
    maintenanceMode: false,
    maxUsers: 1000,
    logLevel: 'INFO'
  });
  const [tenantId, setTenantId] = useState('tenant-123e4567-e89b-12d3-a456-426614174000');
  const [tenantData, setTenantData] = useState(null);

  // VULNERABILITY: Frontend-only admin check - easily bypassed
  const isAdmin = user?.email?.includes('admin') || false;

  useEffect(() => {
    if (isAdmin) {
      fetchAdminSettings();
    }
  }, [isAdmin]);

  const fetchAdminSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.log('Failed to fetch admin settings:', error);
    }
  };

  const updateSettings = async () => {
    try {
      // VULNERABILITY: Try alternative endpoint that bypasses main security
      const response = await fetch('/api/admin/update-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "✅ Settings Updated",
          description: data.message,
          variant: "default",
        });
        
        if (data.flag) {
          toast({
            title: "🚩 Flag Found!",
            description: data.flag,
            variant: "default",
          });
        }
      } else {
        throw new Error('Settings update failed');
      }
    } catch (error) {
      toast({
        title: "❌ Update Failed", 
        description: "Could not update settings",
        variant: "destructive",
      });
    }
  };

  const fetchTenantData = async () => {
    try {
      // VULNERABILITY: Allow users to modify tenantId and access other tenants' data
      const response = await fetch(`/api/tenants/${tenantId}/data`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTenantData(data);
        
        if (data.warning) {
          toast({
            title: "⚠️ Cross-tenant Access",
            description: data.warning,
            variant: "default",
          });
        }
        
        if (data.data?.sensitive?.flag) {
          toast({
            title: "🚩 Flag Found!",
            description: data.data.sensitive.flag,
            variant: "default",
          });
        }
      }
    } catch (error) {
      toast({
        title: "❌ Data Fetch Failed",
        description: "Could not fetch tenant data", 
        variant: "destructive",
      });
    }
  };

  // VULNERABILITY: Component renders admin controls based on frontend check only
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Access Control Demo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-orange-50 dark:bg-orange-950/20">
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Security Notice</span>
              </div>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Current user: {user?.email} | Admin status: {isAdmin ? 'Yes' : 'No'}
              </p>
            </div>
            
            {/* VULNERABILITY: Button hidden if not admin, but backend should still validate! */}
            {isAdmin && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Admin Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="systemName">System Name</Label>
                    <Input
                      id="systemName"
                      value={settings.systemName}
                      onChange={(e) => setSettings({...settings, systemName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="logLevel">Log Level</Label>
                    <Input
                      id="logLevel"
                      value={settings.logLevel}
                      onChange={(e) => setSettings({...settings, logLevel: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="debugMode"
                    checked={settings.debugMode}
                    onChange={(e) => setSettings({...settings, debugMode: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="debugMode">Debug Mode</Label>
                </div>
                <Button onClick={updateSettings}>Update Settings</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Tenant Data Access (IDOR Demo)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tenantId">Tenant ID (Try changing this)</Label>
              <Input
                id="tenantId"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                placeholder="tenant-123e4567-e89b-12d3-a456-426614174000"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Try: tenant-987f6543-e21a-34b5-c678-542331847111 or tenant-456a7890-b12c-56d7-e890-123456789abc
              </p>
            </div>
            <Button onClick={fetchTenantData}>Fetch Tenant Data</Button>
            
            {tenantData && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(tenantData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* SQL Injection Demo Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold tracking-tighter mb-4 font-headline flex items-center gap-2">
          <Database className="h-6 w-6" />
          SQL Injection Demo (A03)
        </h2>
        <p className="text-muted-foreground mb-6">
          Interactive demonstration of blind SQL injection and second-order injection vulnerabilities.
        </p>
        <SQLiDemo />
      </div>

      {/* Insecure Design Demo Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold tracking-tighter mb-4 font-headline flex items-center gap-2">
          <Layers className="h-6 w-6" />
          Insecure Design Demo (A04)
        </h2>
        <p className="text-muted-foreground mb-6">
          Interactive demonstration of business logic flaws including step bypass and client-side pricing trust.
        </p>
        <InsecureDesignDemo />
      </div>
    </div>
  );
}
