// src/components/footer.tsx
import Link from "next/link";
import { Shield } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border/40">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Link href="/" className="flex items-center gap-2 mb-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="font-bold text-lg font-headline">
                Kurukshetra
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              An interactive, hands-on cybersecurity training platform for
              educational purposes.
            </p>
          </div>

          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            <Link
              href="/about"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              About
            </Link>
            <Link
              href="/developer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Developer
            </Link>
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=brother.rohit.dev@gmail.com&su=Kurukshetra%20Security%20Platform%20Inquiry&body=Hello,%0A%0AI%20am%20contacting%20you%20regarding%20the%20Kurukshetra%20security%20training%20platform.%0A%0APlease%20let%20me%20know%20how%20I%20can%20assist%20you.%0A%0AThank%20you!"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Contact
            </a>
          </nav>

          <div className="text-center md:text-right text-sm text-muted-foreground">
            <p>Kurukshetra HQ, India</p>
            <p>&copy; {currentYear} Kurukshetra. All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
