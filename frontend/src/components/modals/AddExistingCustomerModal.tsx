import { useState } from 'react';
import { X, Search, Building2, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { getCustomerFullName, defaultPipelineStages } from '../../lib/mockData';
import type { Customer } from "../../lib/mockData";
import { toast } from "sonner";
import { sendAccountInvite, isValidEmail } from "../../lib/mail";

async function handleSendInvite(customer: Customer) {
  if (!isValidEmail(customer.email)) {
    toast.warning("Geen geldig e-mailadres bekend voor deze klant.");
    return;
  }
  const link = `${location.origin}/register?email=${encodeURIComponent(customer.email)}`;
  const res = await sendAccountInvite(customer.email, link);
  if (res.ok) {
    toast.success("Uitnodiging verzonden", { description: customer.email });
  } else {
    toast.error("Versturen mislukt");
  }
}


interface AddExistingCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (customerId: string, stage: string) => void;
  availableCustomers: Customer[];
  initialStage?: string;
}

export function AddExistingCustomerModal({
  isOpen,
  onClose,
  onAdd,
  availableCustomers,
  initialStage = 'NIEUW',
}: AddExistingCustomerModalProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedStage, setSelectedStage] = useState(initialStage);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredCustomers = availableCustomers.filter((customer) =>
    getCustomerFullName(customer).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.email ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCustomerId) {
      onAdd(selectedCustomerId, selectedStage);
      setSelectedCustomerId('');
      setSearchTerm('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-30 backdrop-blur-sm">
      <div
        className="w-full max-w-2xl rounded-xl shadow-lg max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--panel)' }}
      >
        {/* Header */}
        <div
          className="p-6 border-b sticky top-0 z-10 flex items-start justify-between"
          style={{
            backgroundColor: 'var(--panel)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex-1">
            <h2 className="mb-2">Bestaande klant toevoegen</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Selecteer een klant om toe te voegen aan de pipeline
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
            {/* Search */}
            <div className="space-y-2">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                  style={{ color: 'var(--text-secondary)' }}
                />
                <Input
                  placeholder="Zoek op naam of e-mail..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Customer List */}
            <div
              className="space-y-2 max-h-64 overflow-y-auto p-4 rounded-xl"
              style={{ backgroundColor: 'var(--background)' }}
            >
              {filteredCustomers.length === 0 ? (
                <p className="text-center py-4" style={{ color: 'var(--text-secondary)' }}>
                  Geen klanten gevonden
                </p>
              ) : (
                filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    onClick={() => setSelectedCustomerId(customer.id)}
                    className="p-3 rounded-lg cursor-pointer hover:scale-105 transition-transform"
                    style={{
                      backgroundColor: selectedCustomerId === customer.id ? 'var(--accent)' + '20' : 'var(--panel)',
                      border: selectedCustomerId === customer.id ? '2px solid var(--accent)' : '2px solid transparent',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {customer.type === 'ORGANIZATION' ? (
                        <Building2 className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                      ) : (
                        <User className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                      )}
                      <div className="flex-1">
                        <p style={{ color: 'var(--text-primary)' }}>
                          {getCustomerFullName(customer)}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {customer.email}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Stage Selection */}
            {selectedCustomerId && (
              <div className="space-y-2">
                <label style={{ color: 'var(--text-primary)' }}>
                  Pipeline fase *
                </label>
                <Select value={selectedStage} onValueChange={setSelectedStage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {defaultPipelineStages.map((stage) => (
                      <SelectItem key={stage.id} value={stage.name}>
                        {stage.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
              disabled={!selectedCustomerId}
              className="rounded-xl"
              style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}
            >
              Toevoegen
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
