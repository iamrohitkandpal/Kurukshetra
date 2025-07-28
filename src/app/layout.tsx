import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/hooks/use-auth';
import { Footer } from '@/components/footer';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Kurukshetra - Professional OWASP Top 10 Security Training Platform',
  description: 'Master ethical hacking with our comprehensive vulnerability testing environment. Practice penetration testing on intentionally vulnerable applications covering all OWASP Top 10 security risks.',
  keywords: ['cybersecurity', 'owasp top 10', 'penetration testing', 'ethical hacking', 'vulnerability assessment', 'security training'],
  authors: [{ name: 'Kurukshetra Security Team' }],
  openGraph: {
    title: 'Kurukshetra - OWASP Top 10 Security Training',
    description: 'Professional cybersecurity training platform for ethical hacking practice',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head />
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <div className="flex-1 flex flex-col">
              {children}
            </div>
            <Footer />
          </div>
        </AuthProvider>
        <Toaster />
        {/* Exposed environment variable - Security Misconfiguration */}
        <script dangerouslySetInnerHTML={{
          __html: `
            // This is intentionally vulnerable - exposing secrets in client-side code
            window.KURUKSHETRA_CONFIG = {
              API_VERSION: "v2.0.1",
              DEBUG_MODE: true,
              EXPOSED_SECRET: "FLAG{3xp0s3d_3nv_v4r_m1sc0nf1g}",
              INTERNAL_API_URL: "https://internal-api.kurukshetra.dev",
              DATABASE_TYPE: "sqlite",
              // WARNING: Never expose real secrets like this!
              // This is for educational purposes only
            };
            console.log("🚨 Configuration loaded - Check window.KURUKSHETRA_CONFIG");
          `
        }} />
      </body>
    </html>
  );
}
