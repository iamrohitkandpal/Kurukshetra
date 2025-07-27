'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ClipboardCopy, Shield, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

interface CodeBlockProps {
  children: string;
  className?: string;
  language?: string;
  variant?: 'default' | 'secure' | 'insecure';
  title?: string;
}

export const CodeBlock = ({ 
  children, 
  className, 
  language = 'javascript',
  variant = 'default',
  title 
}: CodeBlockProps) => {
  const { toast } = useToast();
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(children);
    toast({
        title: "📋 Copied to clipboard!",
        description: "The code has been copied to your clipboard.",
    });
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'secure':
        return {
          border: 'border-green-500/30',
          background: 'bg-green-500/5',
          header: 'bg-green-500/10 text-green-400',
          icon: <Shield className="h-4 w-4" />
        };
      case 'insecure':
        return {
          border: 'border-red-500/30',
          background: 'bg-red-500/5',
          header: 'bg-red-500/10 text-red-400',
          icon: <AlertTriangle className="h-4 w-4" />
        };
      default:
        return {
          border: 'border-border',
          background: 'bg-secondary/50',
          header: 'bg-secondary text-foreground',
          icon: null
        };
    }
  };

  const styles = getVariantStyles();
  
  // Basic syntax highlighting for common patterns
  const highlightSyntax = (code: string) => {
    return code
      // Keywords
      .replace(/\b(const|let|var|function|class|import|export|return|if|else|for|while|try|catch|async|await)\b/g, '<span class="text-purple-400 font-semibold">$1</span>')
      // Strings
      .replace(/(['"`])(.*?)\1/g, '<span class="text-green-300">$1$2$1</span>')
      // Comments
      .replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, '<span class="text-gray-500 italic">$1</span>')
      // Numbers
      .replace(/\b(\d+)\b/g, '<span class="text-orange-400">$1</span>')
      // SQL keywords
      .replace(/\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|UNION|OR|AND|LIKE)\b/g, '<span class="text-blue-400 font-semibold">$1</span>')
      // Dangerous patterns
      .replace(/('\s*OR\s*'1'\s*=\s*'1|'\s*\|\||--|\/\*|\*\/)/gi, '<span class="bg-red-500/20 text-red-300 px-1 rounded">$1</span>')
      // Flags
      .replace(/(FLAG\{[^}]+\})/g, '<span class="bg-yellow-500/20 text-yellow-300 px-1 rounded font-bold animate-pulse">$1</span>');
  };

  return (
    <div className={cn("relative group rounded-lg border overflow-hidden", styles.border, className)}>
      {(title || variant !== 'default') && (
        <div className={cn("px-4 py-2 text-sm font-medium flex items-center gap-2", styles.header)}>
          {styles.icon}
          <span>
            {title || (variant === 'secure' ? '✅ Secure Implementation' : '🚨 Vulnerable Code')}
          </span>
          {language && (
            <span className="ml-auto text-xs opacity-70 uppercase">{language}</span>
          )}
        </div>
      )}
      <div className={cn("relative", styles.background)}>
        <pre className="p-4 overflow-x-auto">
          <code 
            className="font-mono text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: highlightSyntax(children) }}
          />
        </pre>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-background/80"
          onClick={copyToClipboard}
          aria-label="Copy code"
        >
          <ClipboardCopy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Component for side-by-side code comparison
export const CodeComparison = ({ 
  insecureCode, 
  secureCode, 
  language = 'javascript' 
}: { 
  insecureCode: string; 
  secureCode: string; 
  language?: string; 
}) => {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <CodeBlock 
        variant="insecure" 
        language={language} 
        title="🚨 Vulnerable Implementation"
      >
        {insecureCode}
      </CodeBlock>
      <CodeBlock 
        variant="secure" 
        language={language} 
        title="✅ Secure Implementation"
      >
        {secureCode}
      </CodeBlock>
    </div>
  );
};
