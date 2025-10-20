import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { mockCustomers, mockUsers, getCustomerFullName } from '../../lib/mockData';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  task: any;
}

export function EditTaskModal({ isOpen, onClose, onSave, task }: EditTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    notes: '',
    deadline: '',
    customerId: '',
    assignedTo: '',
    status: 'OPEN',
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        notes: task.notes || '',
        deadline: task.deadline || '',
        customerId: task.customerId || '',
        assignedTo: task.assignedTo || '',
        status: task.status || 'OPEN',
      });
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...task, ...formData });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-30 backdrop-blur-sm">
      <div
        className="w-full max-w-lg rounded-xl shadow-lg"
        style={{ backgroundColor: 'var(--panel)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <h2>Taak bewerken</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:scale-110 transition-transform"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Taaktitel"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerId">Klant *</Label>
            <Select
              value={formData.customerId}
              onValueChange={(value) => setFormData({ ...formData, customerId: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecteer klant" />
              </SelectTrigger>
              <SelectContent>
                {mockCustomers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {getCustomerFullName(customer)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedTo">Toegewezen aan</Label>
            <Select
              value={formData.assignedTo || 'unassigned'}
              onValueChange={(value) => setFormData({ ...formData, assignedTo: value === 'unassigned' ? '' : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecteer medewerker" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Geen toewijzing</SelectItem>
                {mockUsers
                  .filter((u) => u.role !== 'KLANT')
                  .map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notities</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Extra informatie over deze taak..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="IN_PROGRESS">Bezig</SelectItem>
                <SelectItem value="DONE">Afgerond</SelectItem>
                <SelectItem value="CANCELED">Geannuleerd</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4">
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
