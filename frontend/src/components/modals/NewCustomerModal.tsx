import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { defaultPipelineStages } from '../../lib/mockData';

interface NewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialPipelineStage?: string;
  showPipelineSelector?: boolean;
}

export function NewCustomerModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialPipelineStage = 'NIEUW',
  showPipelineSelector = false 
}: NewCustomerModalProps) {
  const [activeTab, setActiveTab] = useState<'person' | 'organization'>('person');
  const [formData, setFormData] = useState({
    // Person fields
    firstName: '',
    middleName: '',
    lastName: '',
    // Organization fields
    companyName: '',
    kvk: '',
    btw: '',
    // Common fields
    email: '',
    phone: '',
    postalCode: '',
    houseNumber: '',
    houseNumberAddition: '',
    street: '',
    city: '',
    // Pipeline
    pipelineStage: initialPipelineStage,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });

    // Mock address lookup when postal code and house number are filled
    if (field === 'houseNumber' && formData.postalCode && value) {
      setFormData({
        ...formData,
        [field]: value,
        street: 'Voorbeeldstraat',
        city: 'Amsterdam',
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customerData = {
      type: activeTab === 'person' ? 'PERSON' : 'ORGANIZATION',
      ...formData,
    };
    onSave(customerData);
    onClose();
    // Reset form
    setFormData({
      firstName: '',
      middleName: '',
      lastName: '',
      companyName: '',
      kvk: '',
      btw: '',
      email: '',
      phone: '',
      postalCode: '',
      houseNumber: '',
      houseNumberAddition: '',
      street: '',
      city: '',
      pipelineStage: initialPipelineStage,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-30 backdrop-blur-sm">
      <div
        className="w-full max-w-2xl rounded-xl shadow-lg max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--panel)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b sticky top-0 z-10"
          style={{
            backgroundColor: 'var(--panel)',
            borderColor: 'var(--border)',
          }}
        >
          <h2>Nieuwe klant</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:scale-110 transition-transform"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="person" className="rounded-xl">
                Persoon
              </TabsTrigger>
              <TabsTrigger value="organization" className="rounded-xl">
                Organisatie
              </TabsTrigger>
            </TabsList>

            <TabsContent value="person" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Voornaam *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="middleName">Tussenvoegsel</Label>
                  <Input
                    id="middleName"
                    value={formData.middleName}
                    onChange={(e) => handleInputChange('middleName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Achternaam *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="organization" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Bedrijfsnaam *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  required={activeTab === 'organization'}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kvk">KvK-nummer</Label>
                  <Input
                    id="kvk"
                    value={formData.kvk}
                    onChange={(e) => handleInputChange('kvk', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="btw">BTW-nummer</Label>
                  <Input
                    id="btw"
                    value={formData.btw}
                    onChange={(e) => handleInputChange('btw', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Common Fields */}
          <div className="space-y-4 mt-6">
            <h3 className="text-lg">Contactgegevens</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefoon</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
            </div>

            {/* Pipeline & Deal Info */}
            {showPipelineSelector && (
              <>
                <h3 className="text-lg mt-6">Pipeline informatie</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pipelineStage">Pipelinefase</Label>
                    <Select
                      value={formData.pipelineStage}
                      onValueChange={(value) => handleInputChange('pipelineStage', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {defaultPipelineStages
                          .sort((a, b) => a.order - b.order)
                          .map((stage) => (
                            <SelectItem key={stage.id} value={stage.name}>
                              {stage.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            <h3 className="text-lg mt-6">Adresgegevens</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postcode</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  placeholder="1234 AB"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="houseNumber">Huisnummer</Label>
                <Input
                  id="houseNumber"
                  value={formData.houseNumber}
                  onChange={(e) => handleInputChange('houseNumber', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="houseNumberAddition">Toevoeging</Label>
                <Input
                  id="houseNumberAddition"
                  value={formData.houseNumberAddition}
                  onChange={(e) => handleInputChange('houseNumberAddition', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="street">Straat</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Plaats</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-8">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
              Annuleren
            </Button>
            <Button
              type="submit"
              className="rounded-xl"
              style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}
            >
              Opslaan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
