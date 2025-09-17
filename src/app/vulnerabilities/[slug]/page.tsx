// src/app/vulnerabilities/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { vulnerabilities } from '@/lib/vulnerabilities';
import { Header } from '@/components/header';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { VulnerabilityClientPage } from './client-page';


export default async function VulnerabilityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vulnerability = vulnerabilities.find((v) => v.slug === slug);

  if (!vulnerability) {
    notFound();
  }

  const { title, icon: Icon } = vulnerability;

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-6xl mx-auto">
          <Button asChild variant="ghost" className="mb-8">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="mb-8">
            <Icon className="h-16 w-16 text-primary mb-4" />
            <h1 className="text-5xl font-bold font-headline">{title}</h1>
            <p className="text-xl text-muted-foreground mt-2">{vulnerability.description}</p>
          </div>
          
          <VulnerabilityClientPage slug={vulnerability.slug} />

        </div>
      </main>
    </>
  );
}

export async function generateStaticParams() {
  return vulnerabilities.map((v) => ({
    slug: v.slug,
  }));
}
