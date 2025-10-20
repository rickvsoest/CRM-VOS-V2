import { useState } from 'react';
import { Search, Plus, Trash2, User } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { NewNoteModal } from '../components/modals/NewNoteModal';
import { NoteDetailModal } from '../components/modals/NoteDetailModal';
import { mockNotes, mockCustomers, mockUsers, getCustomerFullName, formatDateTime } from '../lib/mockData';

interface NotesProps {
  onNavigate: (page: string, id?: string) => void;
}

export function Notes({ onNavigate }: NotesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewNoteModalOpen, setIsNewNoteModalOpen] = useState(false);
  const [isNoteDetailModalOpen, setIsNoteDetailModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [notes, setNotes] = useState(mockNotes);

  const handleNewNoteSave = (data: any) => {
    const currentUser = mockUsers[0]; // In real app, get from context
    const newNote = {
      id: Date.now().toString(),
      customerId: data.customerId,
      content: data.content,
      authorId: currentUser.id,
      authorName: currentUser.name,
      createdAt: new Date().toISOString(),
    };
    setNotes([newNote, ...notes]);
    import('sonner').then(({ toast }) => {
      toast.success('Notitie toegevoegd!', {
        description: 'De notitie is succesvol opgeslagen.',
      });
    });
  };

  const handleNoteClick = (note: any) => {
    setSelectedNote(note);
    setIsNoteDetailModalOpen(true);
  };

  const handleDeleteNote = (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Weet je zeker dat je deze notitie wilt verwijderen?')) {
      setNotes(notes.filter((n) => n.id !== noteId));
      import('sonner').then(({ toast }) => {
        toast.success('Notitie verwijderd!');
      });
    }
  };

  const notesWithCustomer = notes.map((note) => ({
    ...note,
    customer: mockCustomers.find((c) => c.id === note.customerId),
  }));

  const filteredNotes = notesWithCustomer.filter((note) => {
    const customerName = note.customer ? getCustomerFullName(note.customer) : '';
    return (
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.authorName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="mb-2">Notities</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Overzicht van alle notities uit het systeem
          </p>
        </div>
        <Button
          onClick={() => setIsNewNoteModalOpen(true)}
          className="rounded-xl hover:scale-105 transition-transform"
          style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nieuwe notitie
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
            placeholder="Zoek op inhoud, klant of auteur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            onClick={() => handleNoteClick(note)}
            className="p-6 rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer relative group"
            style={{ backgroundColor: 'var(--panel)' }}
          >
            {/* Delete Button */}
            <button
              onClick={(e) => handleDeleteNote(note.id, e)}
              className="absolute top-3 right-3 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ 
                backgroundColor: 'var(--error)' + '20',
                color: 'var(--error)',
              }}
              title="Notitie verwijderen"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            <div className="flex items-start justify-between mb-4 pr-10">
              <div>
                <p style={{ color: 'var(--text-primary)' }}>{note.authorName}</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {formatDateTime(note.createdAt)}
                </p>
              </div>
            </div>

            <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
              {note.content}
            </p>

            {note.customer && (
              <div
                className="pt-4 border-t"
                style={{ borderColor: 'var(--border)' }}
              >
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Klant:
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('customer-detail', note.customer.id);
                  }}
                  className="hover:underline"
                  style={{ color: 'var(--accent)' }}
                >
                  {getCustomerFullName(note.customer)}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <div
          className="p-12 rounded-xl text-center"
          style={{ backgroundColor: 'var(--panel)' }}
        >
          <p style={{ color: 'var(--text-secondary)' }}>Geen notities gevonden</p>
        </div>
      )}

      {/* New Note Modal */}
      <NewNoteModal
        isOpen={isNewNoteModalOpen}
        onClose={() => setIsNewNoteModalOpen(false)}
        onSave={handleNewNoteSave}
      />

      {/* Note Detail Modal */}
      {selectedNote && (
        <NoteDetailModal
          isOpen={isNoteDetailModalOpen}
          onClose={() => {
            setIsNoteDetailModalOpen(false);
            setSelectedNote(null);
          }}
          note={selectedNote}
          onNavigateToCustomer={() => {
            setIsNoteDetailModalOpen(false);
            if (selectedNote.customer) {
              onNavigate('customer-detail', selectedNote.customerId);
            }
          }}
        />
      )}
    </div>
  );
}

