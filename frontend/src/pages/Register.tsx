import { useState, useEffect } from 'react';
import { Mail, Lock, User, Smartphone, CheckCircle, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';

interface RegisterProps {
  onNavigate: (page: string) => void;
  inviteToken?: string;
}

export function Register({ onNavigate, inviteToken }: RegisterProps) {
  const [step, setStep] = useState<'validating' | 'details' | 'authenticator' | 'invalid'>('validating');
  const [inviteData, setInviteData] = useState<{ email: string; name: string; role: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate invite token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!inviteToken) {
        setStep('invalid');
        return;
      }

      // Mock token validation - in productie zou dit een API call zijn
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simuleer een geldige invite
      const mockInviteData = {
        email: 'nieuwe.medewerker@vansoest.nl',
        name: 'Nieuwe Medewerker',
        role: 'MEDEWERKER',
      };

      setInviteData(mockInviteData);
      setFormData({
        name: mockInviteData.name,
        email: mockInviteData.email,
        password: '',
        confirmPassword: '',
      });
      setStep('details');
    };

    validateToken();
  }, [inviteToken]);

  // Mock QR code URL - in productie zou dit een echte QR code genereren
  const qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/VOS%20CRM:' + encodeURIComponent(formData.email) + '?secret=JBSWY3DPEHPK3PXP&issuer=VOS%20CRM';
  const secretKey = 'JBSWY3DPEHPK3PXP';

  const validateDetails = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Naam is verplicht';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mailadres is verplicht';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Ongeldig e-mailadres';
    }

    if (!formData.password) {
      newErrors.password = 'Wachtwoord is verplicht';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Wachtwoord moet minimaal 8 tekens bevatten';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Wachtwoord moet minimaal 1 hoofdletter, 1 kleine letter en 1 cijfer bevatten';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Wachtwoorden komen niet overeen';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateDetails()) {
      setStep('authenticator');
    }
  };

  const handleAuthenticatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (verificationCode.length !== 6) {
      setErrors({ code: 'Voer een geldige 6-cijferige code in' });
      return;
    }

    // Mock verificatie - in productie zou dit de code valideren
    import('sonner').then(({ toast }) => {
      toast.success('Account succesvol aangemaakt!', {
        description: 'Je kunt nu inloggen met je gegevens.',
      });
    });
    
    // Navigeer naar login
    setTimeout(() => {
      onNavigate('login');
    }, 1500);
  };

  // Show loading state while validating
  if (step === 'validating') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--background)' }}>
        <Card className="p-8 rounded-2xl shadow-lg text-center" style={{ backgroundColor: 'var(--panel)' }}>
          <div className="w-16 h-16 mx-auto rounded-full border-4 border-t-transparent animate-spin mb-4" style={{ borderColor: 'var(--accent)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Uitnodiging valideren...</p>
        </Card>
      </div>
    );
  }

  // Show invalid token state
  if (step === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--background)' }}>
        <div className="w-full max-w-md">
          <Card className="p-8 rounded-2xl shadow-lg text-center" style={{ backgroundColor: 'var(--panel)' }}>
            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#EF444420' }}>
              <AlertCircle className="h-8 w-8" style={{ color: '#EF4444' }} />
            </div>
            <h2 className="mb-2">Ongeldige uitnodiging</h2>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              Deze uitnodigingslink is ongeldig of verlopen. Vraag je beheerder om een nieuwe uitnodiging.
            </p>
            <Button
              onClick={() => onNavigate('login')}
              className="w-full rounded-xl"
              style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}
            >
              Terug naar inloggen
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--background)' }}>
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--accent)' }}>
            <User className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-2">Account aanmaken</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {step === 'details' ? 'Welkom! Stel je wachtwoord in' : 'Beveilig je account met 2FA'}
          </p>
          {inviteData && (
            <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--accent)' + '10' }}>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Uitgenodigd als: <strong style={{ color: 'var(--accent)' }}>{inviteData.role === 'MEDEWERKER' ? 'Medewerker' : inviteData.role}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
              style={{ 
                backgroundColor: step === 'details' ? 'var(--accent)' : 'var(--accent)',
                color: '#FFFFFF'
              }}
            >
              {step === 'authenticator' ? <CheckCircle className="h-5 w-5" /> : '1'}
            </div>
            <span className="text-sm" style={{ color: step === 'details' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
              Gegevens
            </span>
          </div>
          <div className="w-12 h-0.5" style={{ backgroundColor: step === 'authenticator' ? 'var(--accent)' : 'var(--border)' }} />
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
              style={{ 
                backgroundColor: step === 'authenticator' ? 'var(--accent)' : 'var(--border)',
                color: step === 'authenticator' ? '#FFFFFF' : 'var(--text-secondary)'
              }}
            >
              2
            </div>
            <span className="text-sm" style={{ color: step === 'authenticator' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
              Authenticator
            </span>
          </div>
        </div>

        <Card className="p-8 rounded-2xl shadow-lg" style={{ backgroundColor: 'var(--panel)' }}>
          {step === 'details' ? (
            <form onSubmit={handleDetailsSubmit} className="space-y-6">
              {/* Name - Read only from invite */}
              <div className="space-y-2">
                <Label htmlFor="name">Volledige naam</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    className="pl-10"
                    disabled
                    style={{ backgroundColor: 'var(--background)', opacity: 0.7 }}
                  />
                </div>
              </div>

              {/* Email - Read only from invite */}
              <div className="space-y-2">
                <Label htmlFor="email">E-mailadres</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    className="pl-10"
                    disabled
                    style={{ backgroundColor: 'var(--background)', opacity: 0.7 }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Wachtwoord</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
                  <Input
                    id="password"
                    type="password"
                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10"
                  />
                </div>
                {errors.password && <p className="text-sm" style={{ color: 'var(--error)' }}>{errors.password}</p>}
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Minimaal 8 tekens met hoofdletter, kleine letter en cijfer
                </p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Bevestig wachtwoord</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-10"
                  />
                </div>
                {errors.confirmPassword && <p className="text-sm" style={{ color: 'var(--error)' }}>{errors.confirmPassword}</p>}
              </div>

              <Button
                type="submit"
                className="w-full rounded-xl"
                style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}
              >
                Volgende stap
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleAuthenticatorSubmit} className="space-y-6">
              {/* Back Button */}
              <button
                type="button"
                onClick={() => setStep('details')}
                className="flex items-center gap-2 text-sm hover:underline"
                style={{ color: 'var(--accent)' }}
              >
                <ArrowLeft className="h-4 w-4" />
                Terug
              </button>

              {/* Instructions */}
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: 'var(--background)' }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--accent)' + '20', color: 'var(--accent)' }}>
                    1
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-primary)' }}>Download een authenticator app</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                      Google Authenticator, Microsoft Authenticator of Authy
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: 'var(--background)' }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--accent)' + '20', color: 'var(--accent)' }}>
                    2
                  </div>
                  <div className="flex-1">
                    <p style={{ color: 'var(--text-primary)' }}>Scan de QR code</p>
                    <div className="mt-4 flex flex-col items-center gap-4">
                      <div className="p-4 rounded-xl" style={{ backgroundColor: '#FFFFFF' }}>
                        <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                          Of voer deze code handmatig in:
                        </p>
                        <code className="px-3 py-1 rounded text-sm" style={{ backgroundColor: 'var(--background)', color: 'var(--accent)' }}>
                          {secretKey}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: 'var(--background)' }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--accent)' + '20', color: 'var(--accent)' }}>
                    3
                  </div>
                  <div className="flex-1">
                    <p className="mb-3" style={{ color: 'var(--text-primary)' }}>Voer de verificatiecode in</p>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
                      <Input
                        type="text"
                        placeholder="000000"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="pl-10 text-center tracking-widest"
                        maxLength={6}
                      />
                    </div>
                    {errors.code && <p className="text-sm mt-2" style={{ color: 'var(--error)' }}>{errors.code}</p>}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full rounded-xl"
                style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}
                disabled={verificationCode.length !== 6}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Account aanmaken
              </Button>
            </form>
          )}
        </Card>

        {/* Login Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => onNavigate('login')}
            className="text-sm hover:underline"
            style={{ color: 'var(--accent)' }}
          >
            â† Terug naar inloggen
          </button>
        </div>
      </div>
    </div>
  );
}

