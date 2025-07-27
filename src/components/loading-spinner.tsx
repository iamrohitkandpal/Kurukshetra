// src/components/loading-spinner.tsx
'use client'

import { motion } from 'framer-motion'
import { Loader2, Shield, Database, Server } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  variant?: 'default' | 'database' | 'security'
  className?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12'
}

const spinVariants = {
  spin: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear" as const
    }
  }
}

const pulseVariants = {
  pulse: {
    scale: [1, 1.1, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  }
}

const floatVariants = {
  float: {
    y: [0, -10, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  }
}

export function LoadingSpinner({ 
  size = 'md', 
  text, 
  variant = 'default',
  className = ''
}: LoadingSpinnerProps) {
  const renderIcon = () => {
    const iconClass = sizeClasses[size];
    
    switch (variant) {
      case 'database':
        return (
          <div className="relative">
            <motion.div
              variants={spinVariants}
              animate="spin"
            >
              <Database className={iconClass} />
            </motion.div>
            <motion.div
              className="absolute top-0 left-0"
              variants={pulseVariants}
              animate="pulse"
            >
              <Server className={`${iconClass} text-primary`} />
            </motion.div>
          </div>
        );
      case 'security':
        return (
          <motion.div
            variants={floatVariants}
            animate="float"
          >
            <Shield className={`${iconClass} text-primary`} />
          </motion.div>
        );
      default:
        return (
          <motion.div
            variants={spinVariants}
            animate="spin"
          >
            <Loader2 className={iconClass} />
          </motion.div>
        );
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="relative">
        {renderIcon()}
      </div>
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-muted-foreground text-center"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

export function FullPageLoader({ 
  text = 'Loading...', 
  variant = 'default' 
}: { 
  text?: string; 
  variant?: 'default' | 'database' | 'security' 
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-card border rounded-lg p-8 shadow-lg"
      >
        <LoadingSpinner size="lg" text={text} variant={variant} />
      </motion.div>
    </motion.div>
  );
}

export function InlineLoader({ 
  size = 'sm', 
  className = '' 
}: { 
  size?: 'sm' | 'md' | 'lg'; 
  className?: string 
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`inline-flex items-center ${className}`}
    >
      <motion.div
        variants={spinVariants}
        animate="spin"
      >
        <Loader2 className={sizeClasses[size]} />
      </motion.div>
    </motion.div>
  );
}

// Skeleton loading components for better UX
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-muted rounded-lg p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-10 h-10 bg-muted-foreground/20 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-4 bg-muted-foreground/20 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-muted-foreground/20 rounded w-1/2"></div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-3 bg-muted-foreground/20 rounded w-full"></div>
          <div className="h-3 bg-muted-foreground/20 rounded w-5/6"></div>
          <div className="h-3 bg-muted-foreground/20 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
