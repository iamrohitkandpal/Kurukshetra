// src/app/about/page.tsx
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AboutPage() {
  const technologies = [
    'Next.js',
    'React',
    'Tailwind CSS',
    'ShadCN UI',
    'Node.js',
    'Express',
    'MongoDB',
    'SQLite',
    'JWT',
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <Button asChild variant="ghost" className="mb-8">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-4xl font-headline">About Kurukshetra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                <strong>Kurukshetra: Secure the Perimeter</strong> is an interactive, hands-on cybersecurity training platform designed for educational purposes. Our mission is to provide developers, students, and security enthusiasts with a safe, controlled environment to learn about and exploit common web application vulnerabilities.
              </p>
              <p>
                By interacting with real, albeit intentionally flawed, backend systems, users gain practical experience in identifying and understanding security risks that are prevalent in the wild.
              </p>
              
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Core Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {technologies.map((tech) => (
                    <Badge key={tech} variant="secondary">{tech}</Badge>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-destructive/10 border border-destructive/50 rounded-lg text-destructive-foreground">
                <p className="font-bold">Disclaimer:</p>
                <p>This is an intentionally vulnerable application created for cybersecurity training. The vulnerabilities are real and designed to be exploited within this platform. Do not replicate these insecure practices in production environments.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
