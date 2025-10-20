import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Toaster } from '../components/ui/sonner';
import { ShieldCheck } from 'lucide-react';
import vosLogo from '/vos-logo.png';

interface TwoFactorAuthProps {
  onVerify: (code: string) => void;
  showQR?: boolean;
}

export function TwoFactorAuth({ onVerify, showQR = false }: TwoFactorAuthProps) {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVerify(code);
  };

  return (
    <>
      <Toaster />
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--background)' }}>
        <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src={vosLogo} alt="Van Soest Office Support" className="h-20 w-auto" />
          </div>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: 'var(--accent)' }}>
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>
            Twee-stapsverificatie
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {showQR ? 'Scan de QR-code met je authenticator app' : 'Voer je 6-cijferige code in'}
          </p>
        </div>

        <div className="p-8 rounded-xl shadow-md" style={{ backgroundColor: 'var(--panel)' }}>
          {showQR && (
            <div className="mb-6 p-8 rounded-xl text-center" style={{ backgroundColor: 'var(--background)' }}>
              <div className="w-48 h-48 mx-auto rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FFFFFF' }}>
                <div className="text-gray-400">QR Code Placeholder</div>
              </div>
              <p className="mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                Scan deze code met Google Authenticator of Authy
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code">Verificatiecode</Label>
              <Input
                id="code"
                type="text"
                placeholder="123456"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="text-center text-2xl tracking-widest"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl hover:scale-105 transition-transform"
              style={{
                backgroundColor: 'var(--accent)',
                color: '#FFFFFF',
              }}
            >
              VerifiÃ«ren
            </Button>
          </form>
        </div>
      </div>
    </div>
    </>
  );
}

