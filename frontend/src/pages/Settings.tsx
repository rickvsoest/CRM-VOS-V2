import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { mockUsers, UserRole } from '../lib/mockData';
import { Shield, User, Users } from 'lucide-react';

interface SettingsProps {
  currentUser: { name: string; email: string; role: UserRole };
  is2FAEnabled: boolean;
  onToggle2FA: () => void;
}

export function Settings({ currentUser, is2FAEnabled, onToggle2FA }: SettingsProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword === confirmPassword) {
      alert('Wachtwoord succesvol gewijzigd!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      alert('Wachtwoorden komen niet overeen');
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'BEHEERDER':
        return { bg: '#DC262620', color: '#DC2626' };
      case 'MEDEWERKER':
        return { bg: '#3B82F620', color: '#3B82F6' };
      case 'KLANT':
        return { bg: '#10B98120', color: '#10B981' };
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="mb-2">Instellingen</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Beheer je account en beveiligingsvoorkeuren
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl">
          <TabsTrigger value="profile" className="rounded-xl">
            <User className="h-4 w-4 mr-2" />
            Profiel
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-xl">
            <Shield className="h-4 w-4 mr-2" />
            Beveiliging
          </TabsTrigger>
          {currentUser.role === 'BEHEERDER' && (
            <TabsTrigger value="roles" className="rounded-xl">
              <Users className="h-4 w-4 mr-2" />
              Rollenbeheer
            </TabsTrigger>
          )}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div
            className="p-6 rounded-xl shadow-sm space-y-6"
            style={{ backgroundColor: 'var(--panel)' }}
          >
            <h3>Gebruikersinformatie</h3>

            <div className="space-y-4 max-w-2xl">
              <div className="space-y-2">
                <Label>Naam</Label>
                <Input value={currentUser.name} disabled />
              </div>

              <div className="space-y-2">
                <Label>E-mailadres</Label>
                <Input value={currentUser.email} disabled />
              </div>

              <div className="space-y-2">
                <Label>Rol</Label>
                <Badge
                  variant="secondary"
                  className="rounded-full"
                  style={{
                    backgroundColor: getRoleBadgeColor(currentUser.role).bg,
                    color: getRoleBadgeColor(currentUser.role).color,
                  }}
                >
                  {currentUser.role}
                </Badge>
              </div>
            </div>

            <div
              className="pt-6 border-t space-y-6 max-w-2xl"
              style={{ borderColor: 'var(--border)' }}
            >
              <h3>Wachtwoord wijzigen</h3>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Huidig wachtwoord</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nieuw wachtwoord</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Bevestig nieuw wachtwoord</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="rounded-xl"
                  style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}
                >
                  Wachtwoord wijzigen
                </Button>
              </form>
            </div>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div
            className="p-6 rounded-xl shadow-sm space-y-6"
            style={{ backgroundColor: 'var(--panel)' }}
          >
            <h3>Beveiligingsinstellingen</h3>

            <div className="max-w-2xl space-y-6">
              <div
                className="flex items-center justify-between p-6 rounded-xl"
                style={{ backgroundColor: 'var(--background)' }}
              >
                <div>
                  <p style={{ color: 'var(--text-primary)' }}>
                    Twee-stapsverificatie (2FA)
                  </p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Extra beveiligingslaag voor je account
                  </p>
                </div>
                <Switch checked={is2FAEnabled} onCheckedChange={onToggle2FA} />
              </div>

              {is2FAEnabled && (
                <div
                  className="p-6 rounded-xl space-y-4"
                  style={{ backgroundColor: 'var(--background)' }}
                >
                  <h3 className="text-lg">QR-code setup</h3>
                  <div className="w-48 h-48 rounded-xl flex items-center justify-center mx-auto" style={{ backgroundColor: '#FFFFFF' }}>
                    <div className="text-gray-400">QR Code Placeholder</div>
                  </div>
                  <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
                    Scan deze code met Google Authenticator of Authy
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Roles Management Tab (Admin only) */}
        {currentUser.role === 'BEHEERDER' && (
          <TabsContent value="roles">
            <div
              className="p-6 rounded-xl shadow-sm space-y-6"
              style={{ backgroundColor: 'var(--panel)' }}
            >
              <div className="flex items-center justify-between">
                <h3>Gebruikersbeheer</h3>
                <Button
                  className="rounded-xl"
                  style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}
                >
                  Nieuwe gebruiker
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: 'var(--background)' }}>
                    <tr>
                      <th
                        className="px-6 py-4 text-left rounded-tl-lg"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        Naam
                      </th>
                      <th className="px-6 py-4 text-left" style={{ color: 'var(--text-secondary)' }}>
                        E-mail
                      </th>
                      <th
                        className="px-6 py-4 text-left rounded-tr-lg"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        Rol
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-t"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <td className="px-6 py-4" style={{ color: 'var(--text-primary)' }}>
                          {user.name}
                        </td>
                        <td className="px-6 py-4" style={{ color: 'var(--text-secondary)' }}>
                          {user.email}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant="secondary"
                            className="rounded-full"
                            style={{
                              backgroundColor: getRoleBadgeColor(user.role).bg,
                              color: getRoleBadgeColor(user.role).color,
                            }}
                          >
                            {user.role}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: 'var(--background)' }}
              >
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  💡 <strong>Tip:</strong> Beheerders hebben volledige toegang. Medewerkers kunnen klanten en taken beheren.
                  Klanten hebben alleen toegang tot hun eigen pagina.
                </p>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
