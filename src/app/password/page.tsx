'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import StatCard from '@/components/StatCard';
import ThreatMeter from '@/components/ThreatMeter';
import { Key, RefreshCw, Copy, Lock, Shield, Eye, EyeOff, Check, X, AlertTriangle } from 'lucide-react';
import CyberButton from '@/components/CyberButton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

function calculateEntropy(password: string) {
  let pool = 0;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/[0-9]/.test(password)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(password)) pool += 32;
  return password.length * Math.log2(pool || 1);
}

function checkStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 15;
  if (password.length >= 16) score += 10;
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^a-zA-Z0-9]/.test(password)) score += 15;
  if (password.length > 20) score += 10;
  if (/(.)\1{3,}/.test(password)) score -= 10;
  if (/^[a-zA-Z]+$/.test(password)) score -= 15;
  if (/^[0-9]+$/.test(password)) score -= 20;
  return Math.min(100, Math.max(0, score));
}

function checkCommonPatterns(password: string) {
  const common = ['password', '123456', 'qwerty', 'admin', 'letmein', 'welcome', 'monkey', 'dragon', 'master', 'login', 'abc123', 'passw0rd', 'iloveyou', 'sunshine', 'princess', 'football'];
  const lower = password.toLowerCase();
  const found = common.filter(p => lower.includes(p));
  return found;
}

function generatePassword(length: number, useUpper: boolean, useLower: boolean, useNumbers: boolean, useSymbols: boolean) {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  let chars = '';
  if (useUpper) chars += upper;
  if (useLower) chars += lower;
  if (useNumbers) chars += numbers;
  if (useSymbols) chars += symbols;
  if (!chars) return '';

  let password = '';
  const crypto = typeof window !== 'undefined' ? window.crypto : null;
  const array = new Uint32Array(length);
  crypto?.getRandomValues(array);

  for (let i = 0; i < length; i++) {
    password += chars[array[i] % chars.length];
  }

  // Ensure at least one of each selected type
  if (useUpper && !/[A-Z]/.test(password)) password = password.slice(0, -1) + upper[array[0] % upper.length];
  if (useLower && !/[a-z]/.test(password)) password = password.slice(0, -1) + lower[array[1] % lower.length];
  if (useNumbers && !/[0-9]/.test(password)) password = password.slice(0, -1) + numbers[array[2] % numbers.length];
  if (useSymbols && !/[^a-zA-Z0-9]/.test(password)) password = password.slice(0, -1) + symbols[array[3] % symbols.length];

  return password;
}

export default function PasswordCenter() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [generated, setGenerated] = useState('');
  const [vault, setVault] = useState<{ name: string; value: string }[]>([]);
  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem('cybercode_vault');
      if (v) setVault(JSON.parse(v));
    } catch {}
  }, []);

  const strength = checkStrength(password);
  const entropy = calculateEntropy(password);
  const commonPatterns = checkCommonPatterns(password);

  const handleGenerate = () => {
    const p = generatePassword(length, useUpper, useLower, useNumbers, useSymbols);
    setGenerated(p);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const encryptToVault = async (name: string, value: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
    const exportKey = await crypto.subtle.exportKey('raw', key);
    const combined = btoa(String.fromCharCode(...new Uint8Array(exportKey))) + '.' + btoa(String.fromCharCode(...iv)) + '.' + btoa(String.fromCharCode(...new Uint8Array(encrypted)));
    const newVault = [...vault, { name: name || 'Password ' + (vault.length + 1), value: combined }];
    setVault(newVault);
    localStorage.setItem('cybercode_vault', JSON.stringify(newVault));
  };

  const removeFromVault = (index: number) => {
    const newVault = vault.filter((_, i) => i !== index);
    setVault(newVault);
    localStorage.setItem('cybercode_vault', JSON.stringify(newVault));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold cyber-gradient-text">Password Security Center</h1>
        <p className="text-muted-foreground text-sm mt-1">Generate, analyze, and manage secure passwords</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass border-border/50">
          <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Key className="w-4 h-4" /> Password Generator</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {generated && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 font-mono text-sm break-all">
                <span className="flex-1">{generated}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="cursor-pointer" onClick={() => copyToClipboard(generated)}>
                        {copied ? <Check className="w-4 h-4 text-safe" /> : <Copy className="w-4 h-4" />}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent><p>Copy</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1"><span>Length: {length}</span></div>
                <Slider value={length} onValueChange={(v) => setLength(typeof v === 'number' ? v : Array.isArray(v) ? v[0] : length)} min={8} max={64} step={1} className="[&_[role=slider]]:bg-cyber-blue" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['Uppercase', useUpper, setUseUpper],
                  ['Lowercase', useLower, setUseLower],
                  ['Numbers', useNumbers, setUseNumbers],
                  ['Symbols', useSymbols, setUseSymbols],
                ].map(([label, checked, setter]) => (
                  <div key={label as string} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <span className="text-xs">{label as string}</span>
                    <Switch checked={checked as boolean} onCheckedChange={setter as any} />
                  </div>
                ))}
              </div>
            </div>
            <CyberButton onClick={handleGenerate} className="w-full" icon={<RefreshCw className="w-4 h-4" />}>
              Generate Password
            </CyberButton>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Shield className="w-4 h-4" /> Password Analyzer</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password to analyze..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="cyber-input pr-10"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {password && (
              <>
                <ThreatMeter score={100 - strength} label="Strength" size="lg" />
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-muted/30">
                    <span className="text-muted-foreground">Entropy:</span>
                    <span className="ml-1 font-bold">{entropy.toFixed(1)} bits</span>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30">
                    <span className="text-muted-foreground">Length:</span>
                    <span className="ml-1 font-bold">{password.length} chars</span>
                  </div>
                </div>
                <div className="space-y-1">
                  {[
                    ['Lowercase', /[a-z]/.test(password)],
                    ['Uppercase', /[A-Z]/.test(password)],
                    ['Numbers', /[0-9]/.test(password)],
                    ['Symbols', /[^a-zA-Z0-9]/.test(password)],
                    ['8+ chars', password.length >= 8],
                  ].map(([label, valid]) => (
                    <div key={label as string} className="flex items-center gap-2 text-xs">
                      {valid ? <Check className="w-3 h-3 text-safe" /> : <X className="w-3 h-3 text-muted-foreground" />}
                      <span className={valid ? 'text-safe' : 'text-muted-foreground'}>{label as string}</span>
                    </div>
                  ))}
                </div>
                {commonPatterns.length > 0 && (
                  <div className="p-2 rounded-lg bg-danger/5 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3 text-danger" />
                    <span className="text-danger">Contains common pattern: {commonPatterns.join(', ')}</span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-border/50">
        <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Lock className="w-4 h-4" /> Local Encrypted Vault</CardTitle></CardHeader>
        <CardContent>
          {generated && (
            <div className="flex gap-2 mb-4">
              <Input id="vault-name" placeholder="Name for this password..." className="flex-1 bg-background/50 border-border/50" />
              <Button variant="outline" onClick={() => {
                const name = (document.getElementById('vault-name') as HTMLInputElement)?.value;
                encryptToVault(name, generated);
              }} className="border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/10">
                Save to Vault
              </Button>
            </div>
          )}
          {vault.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No passwords saved yet</p>
          ) : (
            <div className="space-y-2">
              {vault.map((v, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <span className="text-xs font-medium">{v.name}</span>
                  <Button size="sm" variant="ghost" className="h-6 text-xs text-danger" onClick={() => removeFromVault(i)}>Remove</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
