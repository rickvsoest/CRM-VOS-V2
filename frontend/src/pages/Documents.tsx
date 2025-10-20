import { useState } from 'react';
import { Search, Download, Trash2, Upload } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { DocumentPreviewModal } from '../components/modals/DocumentPreviewModal';
import { mockDocuments, mockCustomers, getCustomerFullName, formatDateTime, formatFileSize } from '../lib/mockData';

interface DocumentsProps {
  onNavigate: (page: string, id?: string) => void;
  userRole?: string;
}

export function Documents({ onNavigate, userRole = 'BEHEERDER' }: DocumentsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [previewDocument, setPreviewDocument] = useState<string | null>(null);

  // If user is KLANT, show simplified view
  if (userRole === 'KLANT') {
    return <CustomerDocumentsView />;
  }

  const documentsWithCustomer = mockDocuments.map((doc) => ({
    ...doc,
    customer: mockCustomers.find((c) => c.id === doc.customerId),
  }));

  const filteredDocuments = documentsWithCustomer.filter((doc) => {
    const customerName = doc.customer ? getCustomerFullName(doc.customer) : '';
    return (
      doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="mb-2">Documenten</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Overzicht van alle documenten uit het systeem
        </p>
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
            placeholder="Zoek op bestandsnaam of klant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-xl shadow-sm overflow-hidden"
        style={{ backgroundColor: 'var(--panel)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: 'var(--background)' }}>
              <tr>
                <th className="px-6 py-4 text-left" style={{ color: 'var(--text-secondary)' }}>
                  Bestandsnaam
                </th>
                <th className="px-6 py-4 text-left" style={{ color: 'var(--text-secondary)' }}>
                  Klant
                </th>
                <th className="px-6 py-4 text-left" style={{ color: 'var(--text-secondary)' }}>
                  Grootte
                </th>
                <th className="px-6 py-4 text-left" style={{ color: 'var(--text-secondary)' }}>
                  Uploaddatum
                </th>
                <th className="px-6 py-4 text-left" style={{ color: 'var(--text-secondary)' }}>
                  Storage
                </th>
                <th className="px-6 py-4 text-left" style={{ color: 'var(--text-secondary)' }}>
                  Acties
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc) => (
                <tr
                  key={doc.id}
                  className="border-t hover:bg-opacity-50 cursor-pointer"
                  style={{ borderColor: 'var(--border)' }}
                  onClick={() => setPreviewDocument(doc.filename)}
                >
                  <td className="px-6 py-4" style={{ color: 'var(--text-primary)' }}>
                    <span className="hover:underline">{doc.filename}</span>
                  </td>
                  <td className="px-6 py-4">
                    {doc.customer ? (
                      <button
                        onClick={() => onNavigate('customer-detail', doc.customerId)}
                        className="hover:underline"
                        style={{ color: 'var(--accent)' }}
                      >
                        {getCustomerFullName(doc.customer)}
                      </button>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)' }}>Onbekend</span>
                    )}
                  </td>
                  <td className="px-6 py-4" style={{ color: 'var(--text-secondary)' }}>
                    {formatFileSize(doc.size)}
                  </td>
                  <td className="px-6 py-4" style={{ color: 'var(--text-secondary)' }}>
                    {formatDateTime(doc.uploadedAt)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant="secondary"
                      className="rounded-full"
                      style={{
                        backgroundColor: doc.driver === 'disk' ? '#8B5CF620' : '#3B82F620',
                        color: doc.driver === 'disk' ? '#8B5CF6' : '#3B82F6',
                      }}
                    >
                      {doc.driver.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert('Document gedownload!');
                        }}
                        className="p-2 rounded-lg hover:scale-110 transition-transform"
                        style={{ color: 'var(--accent)' }}
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Weet je zeker dat je dit document wilt verwijderen?')) {
                            alert('Document verwijderd!');
                          }
                        }}
                        className="p-2 rounded-lg hover:scale-110 transition-transform"
                        style={{ color: 'var(--error)' }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDocuments.length === 0 && (
          <div className="p-12 text-center" style={{ color: 'var(--text-secondary)' }}>
            <p>Geen documenten gevonden</p>
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={previewDocument !== null}
        onClose={() => setPreviewDocument(null)}
        filename={previewDocument || ''}
        canDownload={userRole === 'BEHEERDER'}
      />
    </div>
  );
}

// Simplified view for customer role
function CustomerDocumentsView() {
  const [isDragging, setIsDragging] = useState(false);
  const myDocuments = mockDocuments.slice(0, 3); // Mock: show only customer's own documents

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: 'var(--background)' }}>
      <div className="w-full max-w-4xl space-y-8">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-4xl mb-2" style={{ color: 'var(--accent)' }}>
            VOS CRM
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Mijn documenten</p>
        </div>

        {/* Upload Zone */}
        <div
          className="p-12 rounded-xl border-2 border-dashed transition-all"
          style={{
            backgroundColor: 'var(--panel)',
            borderColor: isDragging ? 'var(--accent)' : 'var(--border)',
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            alert('Bestanden geüpload!');
          }}
        >
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' + '20' }}>
              <Upload className="h-8 w-8" style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <p style={{ color: 'var(--text-primary)' }}>
                Sleep je bestanden hier of klik om te uploaden
              </p>
              <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                Ondersteunde formaten: PDF, JPG, PNG, DOCX
              </p>
            </div>
            <Button
              className="rounded-xl mt-4"
              style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}
              onClick={() => alert('Bestand selecteren...')}
            >
              Selecteer bestanden
            </Button>
          </div>
        </div>

        {/* Documents List */}
        <div
          className="p-6 rounded-xl shadow-sm"
          style={{ backgroundColor: 'var(--panel)' }}
        >
          <h2 className="mb-4">Mijn geüploade documenten</h2>
          <div className="space-y-3">
            {myDocuments.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl flex items-center justify-between"
                style={{ backgroundColor: 'var(--background)' }}
              >
                <div>
                  <p style={{ color: 'var(--text-primary)' }}>{doc.filename}</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {formatFileSize(doc.size)} • {formatDateTime(doc.uploadedAt)}
                  </p>
                </div>
                <button
                  onClick={() => alert('Document gedownload!')}
                  className="p-2 rounded-lg hover:scale-110 transition-transform"
                  style={{ color: 'var(--accent)' }}
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
