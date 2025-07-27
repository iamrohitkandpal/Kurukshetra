// src/components/sqli-demo.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Search, User, Database, AlertTriangle } from 'lucide-react';

export function SQLiDemo() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Profile update states
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [skills, setSkills] = useState('');
  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false);
  
  // Profile lookup states
  const [lookupUsername, setLookupUsername] = useState('');
  const [lookupResults, setLookupResults] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  const performSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    
    try {
      const response = await fetch(`/api/search/users?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      setSearchResults(data);
      
      if (data.flag) {
        toast({
          title: "🚩 Flag Found!",
          description: data.flag,
          variant: "default",
        });
      }
      
      // Show subtle hints for blind SQLi
      if (data.metadata?.layout) {
        console.log(`Search layout hint: ${data.metadata.layout}`);
      }
      
    } catch (error) {
      toast({
        title: "❌ Search Failed",
        description: "Search service error",
        variant: "destructive",
      });
    }
    
    setSearchLoading(false);
  };

  const updateProfile = async () => {
    setProfileUpdateLoading(true);
    
    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          bio,
          location,
          website,
          skills
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "✅ Profile Updated",
          description: data.message,
          variant: "default",
        });
        
        if (data.hint) {
          toast({
            title: "💡 Hint",
            description: data.hint,
            variant: "default",
          });
        }
      }
      
    } catch (error) {
      toast({
        title: "❌ Update Failed",
        description: "Profile update error",
        variant: "destructive",
      });
    }
    
    setProfileUpdateLoading(false);
  };

  const lookupProfile = async () => {
    if (!lookupUsername.trim()) return;
    
    setLookupLoading(true);
    
    try {
      const response = await fetch(`/api/profile/lookup?username=${encodeURIComponent(lookupUsername)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      setLookupResults(data);
      
      if (data.flag) {
        toast({
          title: "🚩 Second-Order SQLi Flag!",
          description: data.flag,
          variant: "default",
        });
      }
      
      if (data.hint) {
        toast({
          title: "🔍 Second-Order Injection",
          description: data.hint,
          variant: "default",
        });
      }
      
    } catch (error) {
      toast({
        title: "❌ Lookup Failed",
        description: "Profile lookup error",
        variant: "destructive",
      });
    }
    
    setLookupLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Blind SQL Injection Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            User Search (Blind SQLi)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Search Notice</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                ✅ Search works great, even with weird inputs. Our robust system handles all characters!
              </p>
            </div>
            
            <div>
              <Label htmlFor="search">Search Users</Label>
              <div className="flex gap-2">
                <Input
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter username or email to search..."
                  onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                />
                <Button onClick={performSearch} disabled={searchLoading}>
                  {searchLoading ? 'Searching...' : 'Search'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Try: admin, alice, or more creative inputs like: admin' OR '1'='1' --
              </p>
            </div>

            {searchResults && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h4 className="font-medium mb-2">Search Results:</h4>
                <div className="text-sm space-y-2">
                  <p><strong>Query:</strong> {searchResults.query}</p>
                  <p><strong>Message:</strong> {searchResults.message}</p>
                  <p><strong>Count:</strong> {searchResults.results?.length || 0}</p>
                  <p><strong>Layout:</strong> {searchResults.metadata?.layout}</p>
                  
                  {searchResults.results && searchResults.results.length > 0 && (
                    <div className="mt-2">
                      <strong>Users Found:</strong>
                      <ul className="list-disc list-inside ml-4">
                        {searchResults.results.map((result: any, index: number) => (
                          <li key={index}>
                            {result.username} ({result.email}) - {result.level} {result.role}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profile Update - Second-Order Injection Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Update (Second-Order Setup)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Profile System</span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                📝 Express yourself! Our profile system accepts rich content and uses it in various features.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
                {/* Need to sanitize stored user inputs later */}
                <p className="text-xs text-muted-foreground mt-1">
                  Try creative bios like: Developer interested in ' UNION SELECT password FROM users --
                </p>
              </div>
              <div>
                <Label htmlFor="skills">Skills</Label>
                <Textarea
                  id="skills"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="Your technical skills..."
                  rows={3}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Your location"
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yoursite.com"
                />
              </div>
            </div>
            
            <Button onClick={updateProfile} disabled={profileUpdateLoading}>
              {profileUpdateLoading ? 'Updating...' : 'Update Profile'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profile Lookup - Second-Order Injection Trigger */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Profile Lookup (Second-Order Trigger)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-950/20">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Smart Recommendations</span>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                🤖 Our AI analyzes user profiles to find similar users with matching interests!
              </p>
            </div>
            
            <div>
              <Label htmlFor="lookup">Username to Lookup</Label>
              <div className="flex gap-2">
                <Input
                  id="lookup"
                  value={lookupUsername}
                  onChange={(e) => setLookupUsername(e.target.value)}
                  placeholder="Enter username to view their profile..."
                  onKeyPress={(e) => e.key === 'Enter' && lookupProfile()}
                />
                <Button onClick={lookupProfile} disabled={lookupLoading}>
                  {lookupLoading ? 'Looking up...' : 'Lookup Profile'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                First update your profile with SQLi payload, then lookup your own username
              </p>
            </div>

            {lookupResults && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h4 className="font-medium mb-2">Profile Lookup Results:</h4>
                <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(lookupResults, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
