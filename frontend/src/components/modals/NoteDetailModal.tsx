import { X, Calendar, User as UserIcon, Building2, User } from 'lucide-react';
import { Button } from '../ui/button';
import { formatDateTime, getCustomerFullName } from '../../lib/mockData';

interface NoteDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: any;
  onNavigateToCustomer: () => void;
}

export function NoteDetailModal({ isOpen, onClose, note, onNavigateToCustomer }: NoteDetailModalProps) {
  if (!isOpen || !note) return null;

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
            <h2 className="mb-2">Notitie Details</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Bekijk notitie informatie
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
          {/* Author and Date */}
          <div
            className="p-4 rounded-xl space-y-4"
            style={{ backgroundColor: 'var(--background)' }}
          >
            <div className="flex items-center gap-3">
              <UserIcon className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Auteur
                </p>
                <p style={{ color: 'var(--text-primary)' }}>
                  {note.authorName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Aangemaakt op
                </p>
                <p style={{ color: 'var(--text-primary)' }}>
                  {formatDateTime(note.createdAt)}
                </p>
              </div>
            </div>

            {/* Customer */}
            {note.customer && (
              <div className="flex items-center gap-3">
                {note.customer.type === 'ORGANIZATION' ? (
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
                    {getCustomerFullName(note.customer)}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <p style={{ color: 'var(--text-secondary)' }}>Inhoud</p>
            <div
              className="p-4 rounded-xl"
              style={{ backgroundColor: 'var(--background)' }}
            >
              <p style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                {note.content}
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
            variant="outline"
            onClick={onClose}
            className="rounded-xl"
          >
            Sluiten
          </Button>
        </div>
      </div>
    </div>
  );
}
