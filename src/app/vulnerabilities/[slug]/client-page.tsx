'use client'

import React, { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import type { Vulnerability } from '@/lib/vulnerabilities';
import { vulnerabilities } from '@/lib/vulnerabilities';
import { CodeBlock, CodeComparison } from '@/components/code-block';
import { ShieldAlert, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Client component for the Injection Demo
const InjectionDemo = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    setLoading(true);
    setResults([]);
    try {
      const response = await fetch(`/api/users/search?term=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Search failed");
      }
      setResults(data.users || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setResults([{ email: 'Error fetching users.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-200 dark:border-red-800">
        <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">Advanced SQL Injection Testing Environment</h3>
        <p className="text-sm text-red-600 dark:text-red-300">
          This demo queries the active dual-database backend. Multiple injection vectors available.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="search">Search Users</Label>
        <div className="flex gap-2">
          <Input 
            id="search" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            placeholder="Try: ' OR '1'='1' --" 
            className="font-mono"
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </div>
      
      <div>
        <h4 className="font-semibold mb-2">Results:</h4>
        <div className="bg-muted p-4 rounded-lg min-h-[100px] max-h-[300px] overflow-y-auto">
          {results.length > 0 ? (
            <div className="space-y-2">
              {results.map((r, i) => (
                <div key={i} className="bg-background p-3 rounded border">
                  <div><strong>Email:</strong> {r.email}</div>
                  {r.username && <div><strong>Username:</strong> {r.username}</div>}
                  {r.password && (
                    <div className="text-red-600"><strong>Password:</strong> {r.password}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Search results will appear here.</p>
          )}
        </div>
      </div>
    </div>
  );
};


// Client component for the Crypto Demo
const CryptoDemo = () => {
  const [text, setText] = useState('');
  const [encoded, setEncoded] = useState('');
  
  useEffect(() => {
    try {
      if (text) {
        setEncoded(btoa(text));
      } else {
        setEncoded('');
      }
    } catch (e) {
      setEncoded('Invalid input for Base64 encoding.');
    }
  }, [text]);

  return (
     <div className="space-y-4">
       <div>
         <Label htmlFor="plain">Plaintext</Label>
         <Input id="plain" value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter text to 'encrypt'"/>
       </div>
       <div>
        <h4 className="font-semibold mb-2">Base64 &quot;Encrypted&quot; Output:</h4>
        <div className="bg-secondary p-4 rounded-md min-h-[40px] font-code text-accent-foreground/80 break-all">
          {encoded || <span className="text-sm text-muted-foreground">Output will appear here.</span>}
        </div>
       </div>
     </div>
  );
}

const SSRFDemo = () => {
  const [url, setUrl] = useState('https://example.com/api/data');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFetch = async () => {
    setLoading(true);
    setResponse('');
    try {
      const apiResponse = await fetch(`/api/ssrf/fetch?url=${encodeURIComponent(url)}`);
      const data = await apiResponse.json();

      if (!apiResponse.ok) {
        throw new Error(data.message || "Failed to fetch URL");
      }
      setResponse(data.content);
    } catch(error: any) {
        toast({ title: 'Error', description: error.message, variant: 'destructive'});
        setResponse(`Error: ${error.message}`);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-end">
        <div className="w-full">
          <Label htmlFor="url">URL to Fetch</Label>
          <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://api.internal/data" />
        </div>
        <Button onClick={handleFetch} disabled={loading}>{loading ? 'Fetching...' : 'Fetch'}</Button>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Response:</h4>
        <div className="bg-secondary p-4 rounded-md min-h-[100px] font-code text-accent-foreground/80 whitespace-pre-wrap">
          {response || <span className="text-sm text-muted-foreground">Response from server will appear here.</span>}
        </div>
      </div>
    </div>
  );
};

const renderDemonstration = (slug: string, demoContent: React.ReactNode | string) => {
  switch (slug) {
    case 'access-control-flaws':
      return (
        <div className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground leading-relaxed">{demoContent}</p>
          </div>
          
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-destructive">
                <ShieldAlert className="h-5 w-5" /> 
                🚨 Exposed Admin Panel
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                This panel should require admin privileges, but access control is broken.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-background/50 rounded-lg border">
                <p className="text-sm mb-3">
                  ⚠️ <strong>Security Flaw:</strong> No server-side role verification was performed. 
                  Any authenticated user can access administrative functions.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      alert("🚨 SECURITY BREACH: Unauthorized admin action executed!");
                      console.log('🚨 CRITICAL: Access control vulnerability exploited!');
                      console.log('🎯 Look for the flag in your exploitation results!');
                    }}
                  >
                    🗑️ Delete All Users
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => alert('Admin settings accessed without authorization!')}
                  >
                    ⚙️ Admin Settings
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => alert('Financial data accessed without authorization!')}
                  >
                    💰 View Revenue
                  </Button>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground p-3 bg-orange-500/10 rounded border-l-4 border-orange-500">
                🎯 <strong>Real-world Impact:</strong> Attackers could delete data, modify settings, or access sensitive information.
              </div>
            </CardContent>
          </Card>
        </div>
      );
    case 'misconfiguration':
        return (
             <div>
                <p className="mb-4">{demoContent}</p>
                <p>An exposed API key was found (simulated):</p>
                <CodeBlock>{'NEXT_PUBLIC_API_KEY="sk_live_51H4xCKxyz789abc_secret_key_exposed"'}</CodeBlock>
                <p className="text-sm text-muted-foreground mt-2">💡 <strong>Hint:</strong> The flag might be hidden in environment variables or developer tools...</p>
            </div>
        )
    case 'vulnerable-dependencies':
        const packages = [
            { name: "express", version: "4.17.1", severity: "High", cve: "CVE-2022-24999" },
            { name: "lodash", version: "4.17.15", severity: "Medium", cve: "CVE-2020-8203" },
            { name: "react", version: "18.3.1", severity: "None", cve: "N/A" },
            { name: "next", version: "15.3.3", severity: "None", cve: "N/A" }
        ];
        return (
            <div>
                 <p className="mb-4">{demoContent}</p>
                 <p className='text-sm text-muted-foreground mb-4'>Hint: The CVE for express might contain your flag!</p>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Package</TableHead>
                            <TableHead>Version</TableHead>
                            <TableHead>Vulnerability</TableHead>
                             <TableHead>CVE</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {packages.map(p => (
                            <TableRow key={p.name}>
                                <TableCell>{p.name}</TableCell>
                                <TableCell>{p.version}</TableCell>
                                <TableCell>
                                    <Badge variant={p.severity === 'None' ? 'secondary' : 'destructive'}>{p.severity}</Badge>
                                </TableCell>
                                <TableCell>{p.cve}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    case 'injection-vulnerabilities':
        return <InjectionDemo />;
    case 'crypto-weakness':
        return <CryptoDemo />;
    case 'ssrf':
        return <SSRFDemo />;
    default:
      return <p>{demoContent}</p>;
  }
};

const FlagSubmission = ({ slug }: { slug: string }) => {
  const [flag, setFlag] = useState('');
  const { user, loading, refetchUser } = useAuth();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: 'Not Logged In', description: 'You must be logged in to submit a flag.', variant: 'destructive' });
      return;
    }

    const token = localStorage.getItem('authToken');

    try {
      const response = await fetch('/api/flags/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ slug, flag })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Incorrect flag.');
      }
      
      toast({ title: 'Success!', description: 'Flag submitted successfully!' });
      refetchUser(); // Re-fetch user data to update UI
      setFlag('');

    } catch (error: any) {
      toast({ title: 'Incorrect Flag', description: 'That flag is not correct. Try again!', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Flag</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input 
            value={flag} 
            onChange={(e) => setFlag(e.target.value)} 
            placeholder="FLAG{...}" 
            disabled={!user || loading}
          />
          <Button type="submit" disabled={!user || loading}>Submit</Button>
        </form>
         {!user && <p className="text-sm text-muted-foreground mt-2">Please log in to submit flags.</p>}
      </CardContent>
    </Card>
  )
}

const HintDialog = ({ hint }: { hint: string }) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30 hover:border-yellow-500/50">
          <Lightbulb className="mr-2 h-4 w-4 text-yellow-500" /> 
          💡 Get Strategic Hint
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            💡 Advanced Exploitation Hint
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left whitespace-pre-wrap leading-relaxed text-sm">
            {hint}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}


export function VulnerabilityClientPage({ slug }: { slug: string }) {
  const vulnerability = vulnerabilities.find((v) => v.slug === slug);

  if (!vulnerability) {
    notFound();
  }

  const { details } = vulnerability;

  return (
    <>
      <Separator className="my-8" />
      
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Overview Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-10 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Overview
            </h2>
          </div>
          <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-purple-50/30 dark:from-blue-950/30 dark:to-purple-950/20">
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <p className="text-lg leading-relaxed text-foreground/90 font-medium">
                  {details.overview}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Demonstration Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-10 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Live Demonstration
            </h2>
          </div>
          <Card className="border-l-4 border-l-red-500 bg-gradient-to-r from-red-50/50 to-orange-50/30 dark:from-red-950/30 dark:to-orange-950/20 shadow-lg">
              <CardContent className="p-8">
                  {renderDemonstration(slug, details.demonstration)}
              </CardContent>
          </Card>

          {/* Hint System */}
          {details.hint && (
            <div className="flex justify-center pt-4">
              <HintDialog hint={details.hint} />
            </div>
          )}

          {/* Flag Submission */}
          <div className="pt-6">
            <FlagSubmission slug={slug} />
          </div>
        </section>

        {/* Mitigation Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-10 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Mitigation Strategies
            </h2>
          </div>
          <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50/50 to-emerald-50/30 dark:from-green-950/30 dark:to-emerald-950/20">
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <p className="text-lg leading-relaxed text-foreground/90 font-medium">
                  {details.mitigation}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Code Examples Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-10 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full"></div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Code Analysis
            </h2>
          </div>
          <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50/50 to-indigo-50/30 dark:from-purple-950/30 dark:to-indigo-950/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-purple-700 dark:text-purple-300">
                🔍 Vulnerable vs Secure Implementation
              </CardTitle>
              <p className="text-muted-foreground leading-relaxed">
                Compare the vulnerable implementation with the secure alternative. 
                Study the differences to understand how to prevent these vulnerabilities in your own code.
              </p>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="w-full">
                <CodeComparison 
                  insecureCode={details.codeExamples.insecure}
                  secureCode={details.codeExamples.secure}
                  language="javascript"
                />
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
}
