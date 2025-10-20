import { X, Calendar, User as UserIcon, Building2, User, Edit } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { formatDate, getCustomerFullName } from '../../lib/mockData';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: any;
  onEdit: () => void;
  onNavigateToCustomer: () => void;
}

export function TaskDetailModal({ isOpen, onClose, task, onEdit, onNavigateToCustomer }: TaskDetailModalProps) {
  if (!isOpen || !task) return null;

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'OPEN': return 'Open';
      case 'IN_PROGRESS': return 'In behandeling';
      case 'DONE': return 'Afgerond';
      case 'CANCELED': return 'Geannuleerd';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return '#3B82F6';
      case 'IN_PROGRESS': return '#F59E0B';
      case 'DONE': return '#10B981';
      case 'CANCELED': return '#DC2626';
      default: return '#6B7280';
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
            <h2 className="mb-2">Taak Details</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Bekijk en beheer taak informatie
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
        <div className="p-6 space-y-6">
          {/* Title and Status */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <h3 style={{ color: 'var(--text-primary)' }}>{task.title}</h3>
              <Badge
                className="rounded-full"
                style={{
                  backgroundColor: getStatusColor(task.status) + '20',
                  color: getStatusColor(task.status),
                }}
              >
                {getStatusLabel(task.status)}
              </Badge>
            </div>
          </div>

          {/* Task Info Grid */}
          <div
            className="p-4 rounded-xl space-y-4"
            style={{ backgroundColor: 'var(--background)' }}
          >
            {/* Deadline */}
            {task.deadline && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                <div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Deadline
                  </p>
                  <p style={{ color: 'var(--text-primary)' }}>
                    {formatDate(task.deadline)}
                  </p>
                </div>
              </div>
            )}

            {/* Assigned To */}
            {task.assignee && (
              <div className="flex items-center gap-3">
                <UserIcon className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                <div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Toegewezen aan
                  </p>
                  <p style={{ color: 'var(--text-primary)' }}>
                    {task.assignee.name}
                  </p>
                </div>
              </div>
            )}

            {/* Customer */}
            {task.customer && (
              <div className="flex items-center gap-3">
                {task.customer.type === 'ORGANIZATION' ? (
                  <Building2 className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                ) : (
                  <User className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                )}
                <div className="flex-1">
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Klant
                  </p>
                  <button
                    onClick={onNavigateToCustomer}
                    className="hover:underline text-left"
                    style={{ color: 'var(--accent)' }}
                  >
                    {getCustomerFullName(task.customer)}
                  </button>
                </div>
              </div>
            )}

            {/* Created At */}
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Aangemaakt op
                </p>
                <p style={{ color: 'var(--text-primary)' }}>
                  {formatDate(task.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {task.notes && (
            <div className="space-y-2">
              <p style={{ color: 'var(--text-secondary)' }}>Notities</p>
              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: 'var(--background)' }}
              >
                <p style={{ color: 'var(--text-primary)' }}>{task.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="p-6 border-t flex justify-end gap-3"
          style={{ borderColor: 'var(--border)' }}
        >
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl"
          >
            Sluiten
          </Button>
          <Button
            onClick={onEdit}
            className="rounded-xl"
            style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}
          >
            <Edit className="h-4 w-4 mr-2" />
            Wijzigen
          </Button>
        </div>
      </div>
    </div>
  );
}
