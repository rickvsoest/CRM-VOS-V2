import { X, Download } from 'lucide-react';
import { Button } from '../ui/button';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  filename: string;
  canDownload?: boolean;
}

export function DocumentPreviewModal({
  isOpen,
  onClose,
  filename,
  canDownload = false,
}: DocumentPreviewModalProps) {
  if (!isOpen) return null;

  const isPDF = filename.toLowerCase().endsWith('.pdf');
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40 backdrop-blur-sm">
      <div
        className="w-full max-w-5xl h-[90vh] rounded-xl shadow-lg flex flex-col"
        style={{ backgroundColor: 'var(--panel)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <h2 className="truncate">{filename}</h2>
          <div className="flex items-center gap-2">
            {canDownload && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => alert('Document gedownload!')}
              >
                <Download className="h-4 w-4 mr-2" />
                Downloaden
              </Button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:scale-110 transition-transform"
              style={{ color: 'var(--text-secondary)' }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className="flex-1 p-6 overflow-auto"
          style={{ backgroundColor: 'var(--background)' }}
        >
          {isPDF && (
            <div
              className="w-full h-full rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <div className="text-center space-y-4">
                <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' + '20' }}>
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="var(--accent)"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p style={{ color: 'var(--text-primary)' }}>PDF Preview</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {filename}
                  </p>
                </div>
              </div>
            </div>
          )}

          {isImage && (
            <div className="w-full h-full flex items-center justify-center">
              <div
                className="max-w-full max-h-full rounded-xl overflow-hidden"
                style={{ backgroundColor: '#FFFFFF' }}
              >
                <div className="w-full h-full flex items-center justify-center p-12">
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' + '20' }}>
                      <svg
                        className="w-12 h-12"
                        fill="none"
                        stroke="var(--accent)"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-primary)' }}>Afbeelding Preview</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {filename}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isPDF && !isImage && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--text-secondary)' + '20' }}>
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="var(--text-secondary)"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p style={{ color: 'var(--text-primary)' }}>Document Preview</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {filename}
                  </p>
                  <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                    Preview niet beschikbaar voor dit bestandstype
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
