import { useState } from 'react';
import { Mail, Lock, KeyRound, ArrowLeft, CheckCircle, Smartphone } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';

interface ForgotPasswordProps {
  onNavigate: (page: string) => void;
}

export function ForgotPassword({ onNavigate }: ForgotPasswordProps) {
  const [step, setStep] = useState<'email' | 'verify' | 'reset' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!email.trim()) {
      setErrors({ email: 'E-mailadres is verplicht' });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Ongeldig e-mailadres' });
      return;
    }

    setIsLoading(true);
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    import('sonner').then(({ toast }) => {
      toast.success('Verificatiecode verzonden!', {
        description: 'Controleer je e-mail voor de 6-cijferige code.',
      });
    });

    setIsLoading(false);
    setStep('verify');
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (verificationCode.length !== 6) {
      setErrors({ code: 'Voer een geldige 6-cijferige code in' });
      return;
    }

    setIsLoading(true);
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    import('sonner').then(({ toast }) => {
      toast.success('Code geverifieerd!');
    });

    setIsLoading(false);
    setStep('reset');
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!newPassword) {
      setErrors({ password: 'Wachtwoord is verplicht' });
      return;
    }

    if (newPassword.length < 8) {
      setErrors({ password: 'Wachtwoord moet minimaal 8 tekens bevatten' });
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      setErrors({ password: 'Wachtwoord moet minimaal 1 hoofdletter, 1 kleine letter en 1 cijfer bevatten' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'Wachtwoorden komen niet overeen' });
      return;
    }

    if (twoFactorCode.length !== 6) {
      setErrors({ twoFactor: 'Voer een geldige 6-cijferige 2FA code in' });
      return;
    }

    setIsLoading(true);
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    import('sonner').then(({ toast }) => {
      toast.success('Wachtwoord succesvol gewijzigd!');
    });

    setIsLoading(false);
    setStep('success');
  };

  const renderStepContent = () => {
    switch (step) {
      case 'email':
        return (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--accent)' + '20' }}>
                <KeyRound className="h-8 w-8" style={{ color: 'var(--accent)' }} />
              </div>
              <h2 className="mb-2">Wachtwoord vergeten?</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Geen probleem! Voer je e-mailadres in en we sturen je een verificatiecode.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mailadres</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
                <Input
                  id="email"
                  type="email"
                  placeholder="jan@voorbeeld.nl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
              </div>
              {errors.email && <p className="text-sm" style={{ color: 'var(--error)' }}>{errors.email}</p>}
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl"
              style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}
              disabled={isLoading}
            >
              {isLoading ? 'Verzenden...' : 'Verificatiecode verzenden'}
            </Button>
          </form>
        );

      case 'verify':
        return (
          <form onSubmit={handleVerifySubmit} className="space-y-6">
            <button
              type="button"
              onClick={() => setStep('email')}
              className="flex items-center gap-2 text-sm hover:underline mb-4"
              style={{ color: 'var(--accent)' }}
            >
              <ArrowLeft className="h-4 w-4" />
              Terug
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--accent)' + '20' }}>
                <Mail className="h-8 w-8" style={{ color: 'var(--accent)' }} />
              </div>
              <h2 className="mb-2">Controleer je e-mail</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                We hebben een 6-cijferige verificatiecode gestuurd naar
              </p>
              <p className="mt-1" style={{ color: 'var(--accent)' }}>{email}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Verificatiecode</Label>
              <Input
                id="code"
                type="text"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center tracking-widest text-2xl"
                maxLength={6}
                autoFocus
              />
              {errors.code && <p className="text-sm" style={{ color: 'var(--error)' }}>{errors.code}</p>}
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl"
              style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}
              disabled={isLoading || verificationCode.length !== 6}
            >
              {isLoading ? 'VerifiÃ«ren...' : 'VerifiÃ«ren'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleEmailSubmit}
                className="text-sm hover:underline"
                style={{ color: 'var(--accent)' }}
              >
                Code niet ontvangen? Opnieuw verzenden
              </button>
            </div>
          </form>
        );

      case 'reset':
        return (
          <form onSubmit={handleResetSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--accent)' + '20' }}>
                <Lock className="h-8 w-8" style={{ color: 'var(--accent)' }} />
              </div>
              <h2 className="mb-2">Nieuw wachtwoord instellen</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Kies een sterk wachtwoord voor je account
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nieuw wachtwoord</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
              </div>
              {errors.password && <p className="text-sm" style={{ color: 'var(--error)' }}>{errors.password}</p>}
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Minimaal 8 tekens met hoofdletter, kleine letter en cijfer
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Bevestig wachtwoord</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
              {errors.confirmPassword && <p className="text-sm" style={{ color: 'var(--error)' }}>{errors.confirmPassword}</p>}
            </div>

            <div className="p-4 rounded-xl space-y-3" style={{ backgroundColor: 'var(--background)' }}>
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                <p style={{ color: 'var(--text-primary)' }}>Bevestig met 2FA</p>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Voer de code uit je authenticator app in
              </p>
              <Input
                type="text"
                placeholder="000000"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center tracking-widest"
                maxLength={6}
              />
              {errors.twoFactor && <p className="text-sm" style={{ color: 'var(--error)' }}>{errors.twoFactor}</p>}
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl"
              style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}
              disabled={isLoading}
            >
              {isLoading ? 'Wachtwoord wijzigen...' : 'Wachtwoord wijzigen'}
            </Button>
          </form>
        );

      case 'success':
        return (
          <div className="text-center space-y-6 py-8">
            <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: '#10B98120' }}>
              <CheckCircle className="h-10 w-10" style={{ color: '#10B981' }} />
            </div>
            <div>
              <h2 className="mb-2">Wachtwoord gewijzigd!</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Je wachtwoord is succesvol gewijzigd. Je kunt nu inloggen met je nieuwe wachtwoord.
              </p>
            </div>
            <Button
              onClick={() => onNavigate('login')}
              className="w-full rounded-xl"
              style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}
            >
              Ga naar inloggen
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--background)' }}>
      <div className="w-full max-w-md">
        <Card className="p-8 rounded-2xl shadow-lg" style={{ backgroundColor: 'var(--panel)' }}>
          {renderStepContent()}
        </Card>

        {step !== 'success' && (
          <div className="text-center mt-6">
            <button
              onClick={() => onNavigate('login')}
              className="flex items-center gap-2 text-sm hover:underline mx-auto"
              style={{ color: 'var(--accent)' }}
            >
              <ArrowLeft className="h-4 w-4" />
              Terug naar inloggen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

