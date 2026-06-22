'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Shield, Search, Globe, Lock, Activity, Radio, Radar, UserCheck, Home, Menu, X, Monitor
} from 'lucide-react';
import { useState } from 'react';

const links = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/ip-analyzer', label: 'IP Analyzer', icon: Globe },
  { href: '/security-scanner', label: 'Security Scanner', icon: Shield },
  { href: '/phishing-detector', label: 'Phishing Detector', icon: Search },
  { href: '/privacy', label: 'Privacy Dashboard', icon: Lock },
  { href: '/password', label: 'Password Center', icon: Lock },
  { href: '/monitoring', label: 'Security Monitor', icon: Activity },
  { href: '/network', label: 'Network Analyzer', icon: Radio },
  { href: '/threat-intel', label: 'Threat Intelligence', icon: Radar },
  { href: '/footprint', label: 'Digital Footprint', icon: UserCheck },
  { href: '/os-info', label: 'OS Info', icon: Monitor },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(!open)} className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg glass text-cyber-blue">
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-border transform transition-transform duration-300 lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg cyber-gradient flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold cyber-gradient-text">CyberCode</h1>
              <p className="text-xs text-muted-foreground">Security Platform</p>
            </div>
          </Link>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-100px)]">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                  active
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(0,212,255,0.1)]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-safe animate-pulse" />
            <span>System Online</span>
          </div>
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setOpen(false)} />}
    </>
  );
}
