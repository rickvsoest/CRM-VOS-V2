import { useState } from 'react';
import { Search, Plus, Edit, Trash2, Mail, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { mockUsers, User, UserRole } from '../lib/mockData';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'KLANT' as UserRole,
  });

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'KLANT',
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      // Update existing user
      setUsers(users.map((u) =>
        u.id === editingUser.id
          ? { ...u, ...formData }
          : u
      ));
    } else {
      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        ...formData,
      };
      setUsers([...users, newUser]);
    }
    
    setIsModalOpen(false);
    setEditingUser(null);
    import('sonner').then(({ toast }) => {
      toast.success(editingUser ? 'Gebruiker bijgewerkt!' : 'Gebruiker aangemaakt!', {
        description: editingUser ? 'De gebruikersgegevens zijn bijgewerkt.' : 'De nieuwe gebruiker is toegevoegd.',
      });
    });
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Weet je zeker dat je deze gebruiker wilt verwijderen?')) {
      setUsers(users.filter((u) => u.id !== id));
      import('sonner').then(({ toast }) => {
        toast.success('Gebruiker verwijderd!');
      });
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'BEHEERDER':
        return { bg: '#DC2626' + '20', color: '#DC2626' };
      case 'MEDEWERKER':
        return { bg: 'var(--accent)' + '20', color: 'var(--accent)' };
      case 'KLANT':
        return { bg: '#10B981' + '20', color: '#10B981' };
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'BEHEERDER': return 'Beheerder';
      case 'MEDEWERKER': return 'Medewerker';
      case 'KLANT': return 'Klant';
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="mb-2">Gebruikersbeheer</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Beheer gebruikersaccounts en wijzig rollen
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="rounded-xl hover:scale-105 transition-transform"
          style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nieuwe gebruiker
        </Button>
      </div>

      {/* Search */}
      <div
        className="p-6 rounded-xl shadow-sm"
        style={{ backgroundColor: 'var(--panel)' }}
      >
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

      {/* Users Table */}
      <div
        className="rounded-xl shadow-sm overflow-hidden"
        style={{ backgroundColor: 'var(--panel)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: 'var(--background)' }}>
              <tr>
                <th className="px-6 py-4 text-left" style={{ color: 'var(--text-secondary)' }}>
                  Naam
                </th>
                <th className="px-6 py-4 text-left" style={{ color: 'var(--text-secondary)' }}>
                  E-mail
                </th>
                <th className="px-6 py-4 text-left" style={{ color: 'var(--text-secondary)' }}>
                  Rol
                </th>
                <th className="px-6 py-4 text-left" style={{ color: 'var(--text-secondary)' }}>
                  Acties
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const roleColors = getRoleBadgeColor(user.role);
                return (
                  <tr
                    key={user.id}
                    className="border-t"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: 'var(--accent)' + '20',
                            color: 'var(--accent)',
                          }}
                        >
                          {user.name.charAt(0)}
                        </div>
                        <span style={{ color: 'var(--text-primary)' }}>{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
                        <span style={{ color: 'var(--text-secondary)' }}>{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        className="rounded-full"
                        style={{
                          backgroundColor: roleColors.bg,
                          color: roleColors.color,
                        }}
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        {getRoleLabel(user.role)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenModal(user)}
                          className="p-2 rounded-lg hover:scale-110 transition-transform"
                          style={{ color: 'var(--accent)' }}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 rounded-lg hover:scale-110 transition-transform"
                          style={{ color: 'var(--error)' }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div
        className="p-6 rounded-xl"
        style={{ backgroundColor: 'var(--panel)' }}
      >
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          ðŸ’¡ <strong>Tip:</strong> Beheerders hebben volledige toegang tot alle functies.
          Medewerkers kunnen klanten en taken beheren. Klanten hebben alleen toegang tot documenten.
          Wijzig de rol van een gebruiker door op het potlood-icoon te klikken.
        </p>
      </div>

      {/* Edit/Create User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-30 backdrop-blur-sm">
          <div
            className="w-full max-w-lg rounded-xl shadow-lg"
            style={{ backgroundColor: 'var(--panel)' }}
          >
            {/* Header */}
            <div
              className="p-6 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <h2>{editingUser ? 'Gebruiker bewerken' : 'Nieuwe gebruiker'}</h2>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveUser}>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="userName">Naam *</Label>
                  <Input
                    id="userName"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Voor- en achternaam"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userEmail">E-mailadres *</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="gebruiker@voorbeeld.nl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userRole">Rol *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) =>
                      setFormData({ ...formData, role: value as UserRole })
                    }
                  >
                    <SelectTrigger id="userRole">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KLANT">Klant</SelectItem>
                      <SelectItem value="MEDEWERKER">Medewerker</SelectItem>
                      <SelectItem value="BEHEERDER">Beheerder</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {formData.role === 'KLANT' && 'Kan alleen documenten uploaden en bekijken'}
                    {formData.role === 'MEDEWERKER' && 'Toegang tot pipeline en klantbeheer'}
                    {formData.role === 'BEHEERDER' && 'Volledige toegang tot alle functies'}
                  </p>
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
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="rounded-xl"
                >
                  Annuleren
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl"
                  style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}
                >
                  {editingUser ? 'Opslaan' : 'Aanmaken'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

