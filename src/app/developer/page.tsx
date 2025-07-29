// src/app/developer/page.tsx
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Linkedin, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function DeveloperPage() {
    const skills = ['Frontend Development', 'Backend Development', 'API Design', 'Cybersecurity', 'CTF Challenges', 'Database Management'];

    return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
           <Button asChild variant="ghost" className="mb-8">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <Card>
            <CardHeader>
              <CardTitle className="text-4xl font-headline">Brother Rohit</CardTitle>
              <CardDescription className="text-lg">Full-Stack Developer & Security Enthusiast</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground leading-relaxed">
                A passionate developer with a keen interest in building secure and scalable web applications. My journey into technology is driven by a curiosity for how things work and a commitment to making them better and safer. This platform is a product of that passion, designed to share knowledge and help others learn in a practical, hands-on way.
              </p>
              
              <div>
                 <h3 className="text-2xl font-semibold text-foreground mb-4">Skills</h3>
                 <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-muted-foreground">
                    {skills.map(skill => <li key={skill} className="flex items-center gap-2"><span>•</span> {skill}</li>)}
                 </ul>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Connect</h3>
                <div className="space-y-3">
                   <a href="mailto:brother.rohit.dev@gmail.com" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                        <Mail className="h-5 w-5" />
                        <span>brother.rohit.dev@gmail.com</span>
                    </a>
                    <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                        <Linkedin className="h-5 w-5" />
                        <span>LinkedIn Profile</span>
                    </a>
                    <div className="flex items-center gap-3 text-muted-foreground">
                         <MapPin className="h-5 w-5" />
                        <span>Kurukshetra HQ, India</span>
                    </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
    );
}
