import { useState } from 'react';
import { X, Mail, Shield } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { getCustomerFullName } from '../../lib/mockData';

interface SendAccountInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: any;
  onSend: (data: { email: string; role: string; customMessage?: string }) => void;
}

export function SendAccountInviteModal({ isOpen, onClose, customer, onSend }: SendAccountInviteModalProps) {
  const [email, setEmail] = useState(customer?.email || '');
  const [role, setRole] = useState('KLANT');
  const [customMessage, setCustomMessage] = useState('');

  if (!isOpen || !customer) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSend({ email, role, customMessage });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-30 backdrop-blur-sm">
      <div
        className="w-full max-w-lg rounded-xl shadow-lg"
        style={{ backgroundColor: 'var(--panel)' }}
      >
        {/* Header */}
        <div
          className="p-6 border-b flex items-start justify-between"
          style={{
            backgroundColor: 'var(--panel)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex-1">
            <h2 className="mb-2">Account uitnodiging verzenden</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Stuur een uitnodigingsmail naar {getCustomerFullName(customer)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:scale-110 transition-transform"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="inline h-4 w-4 mr-2" />
                E-mailadres *
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="klant@voorbeeld.nl"
                required
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">
                <Shield className="inline h-4 w-4 mr-2" />
                Rol *
              </Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KLANT">Klant</SelectItem>
                  <SelectItem value="MEDEWERKER">Medewerker</SelectItem>
                  <SelectItem value="BEHEERDER">Beheerder</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {role === 'KLANT' && 'Kan alleen documenten uploaden en bekijken'}
                {role === 'MEDEWERKER' && 'Toegang tot pipeline en klantbeheer'}
                {role === 'BEHEERDER' && 'Volledige toegang tot alle functies'}
              </p>
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-lg space-y-2" style={{ backgroundColor: 'var(--accent)' + '10' }}>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                <strong>Wat gebeurt er?</strong>
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                De ontvanger krijgt een e-mail met een beveiligde uitnodigingslink. Via deze link kan een account worden aangemaakt met 2-factor authenticatie.
              </p>
            </div>

            {/* Custom Message */}
            <div className="space-y-2">
              <Label htmlFor="customMessage">Persoonlijk bericht (optioneel)</Label>
              <textarea
                id="customMessage"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full min-h-[100px] px-3 py-2 rounded-lg border"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
                placeholder="Voeg een persoonlijk bericht toe aan de uitnodigingsmail..."
              />
            </div>

            {/* Preview */}
            <div
              className="p-4 rounded-xl space-y-2"
              style={{ backgroundColor: 'var(--background)' }}
            >
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                📧 Preview uitnodigingsmail:
              </p>
              <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                <p>Beste {getCustomerFullName(customer)},</p>
                <p className="mt-2">
                  U bent uitgenodigd voor het VOS CRM portaal. Klik op de onderstaande link om uw account aan te maken en in te loggen.
                </p>
                {customMessage && (
                  <p className="mt-2 italic" style={{ color: 'var(--text-secondary)' }}>
                    {customMessage}
                  </p>
                )}
                <p className="mt-2">
                  <a href="#" style={{ color: 'var(--accent)' }}>
                    Account aanmaken →
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="p-6 border-t flex justify-end gap-3"
            style={{ borderColor: 'var(--border)' }}
          >
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl"
            >
              Annuleren
            </Button>
            <Button
              type="submit"
              className="rounded-xl"
              style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}
            >
              <Mail className="h-4 w-4 mr-2" />
              Uitnodiging verzenden
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
