'use client';

import { Button } from './ui/button';
import { Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CyberButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit';
}

export default function CyberButton({ children, onClick, disabled, loading, icon, className, type = 'button' }: CyberButtonProps) {
  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'group relative overflow-hidden rounded-lg px-5 py-2 h-auto',
        'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600',
        'text-white font-medium text-sm',
        'shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40',
        'border-0',
        'hover:scale-[1.02] active:scale-[0.98]',
        'transition-all duration-300 ease-out',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
        className
      )}
    >
      {/* Shine effect overlay */}
      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]" />

      <span className="relative z-10 flex items-center gap-2">
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : icon ? (
          <span className="group-hover:scale-110 transition-transform duration-200">{icon}</span>
        ) : null}
        <span className="group-hover:tracking-wide transition-all duration-300">{children}</span>
        {!loading && (
          <ArrowRight className="w-3.5 h-3.5 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
        )}
      </span>
    </Button>
  );
}
