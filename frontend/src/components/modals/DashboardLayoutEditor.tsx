import { useState } from 'react';
import { X, GripVertical, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export interface DashboardWidget {
  id: string;
  type: 'kpi' | 'chart' | 'agenda' | 'table';
  subtype?: string;
  label: string;
  order: number;
  visible: boolean;
  size?: 'small' | 'medium' | 'large' | 'full';
}

interface DashboardLayoutEditorProps {
  isOpen: boolean;
  onClose: () => void;
  widgets: DashboardWidget[];
  onSave: (widgets: DashboardWidget[]) => void;
}

const availableWidgets = [
  // KPI widgets
  { type: 'kpi', subtype: 'total_customers', label: 'Totaal klanten', defaultSize: 'small' },
  { type: 'kpi', subtype: 'leads_pipeline', label: 'Leads in pipeline', defaultSize: 'small' },
  { type: 'kpi', subtype: 'open_tasks', label: 'Open taken', defaultSize: 'small' },
  { type: 'kpi', subtype: 'new_documents_week', label: 'Nieuwe documenten', defaultSize: 'small' },
  { type: 'kpi', subtype: 'completed_deals_month', label: 'Afgesloten deals', defaultSize: 'small' },
  { type: 'kpi', subtype: 'conversion_rate', label: 'Conversieratio', defaultSize: 'small' },
  { type: 'kpi', subtype: 'avg_deal_time', label: 'Gemiddelde doorlooptijd', defaultSize: 'small' },
  
  // Chart widgets
  { type: 'chart', subtype: 'customers_per_month', label: 'Nieuwe klanten per maand', defaultSize: 'medium' },
  { type: 'chart', subtype: 'tasks_per_week', label: 'Taken afgerond per week', defaultSize: 'medium' },
  { type: 'chart', subtype: 'customer_type_distribution', label: 'Verdeling klanttype', defaultSize: 'medium' },
  { type: 'chart', subtype: 'leads_per_phase', label: 'Leads per fase', defaultSize: 'medium' },
  
  // Agenda widgets
  { type: 'agenda', subtype: 'upcoming_tasks', label: 'Openstaande taken', defaultSize: 'small' },
  { type: 'agenda', subtype: 'recent_documents', label: 'Recente documenten', defaultSize: 'small' },
  { type: 'agenda', subtype: 'recent_notes', label: 'Recente notities', defaultSize: 'small' },
  { type: 'agenda', subtype: 'my_tasks', label: 'Mijn taken', defaultSize: 'medium' },
  
  // Table widgets
  { type: 'table', subtype: 'recent_customers', label: 'Laatst toegevoegd', defaultSize: 'full' },
];

export function DashboardLayoutEditor({ isOpen, onClose, widgets, onSave }: DashboardLayoutEditorProps) {
  const [editedWidgets, setEditedWidgets] = useState<DashboardWidget[]>(widgets);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newWidgets = [...editedWidgets];
    const draggedWidget = newWidgets[draggedIndex];
    newWidgets.splice(draggedIndex, 1);
    newWidgets.splice(index, 0, draggedWidget);

    // Update order
    newWidgets.forEach((w, i) => {
      w.order = i;
    });

    setEditedWidgets(newWidgets);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const toggleVisibility = (id: string) => {
    setEditedWidgets(editedWidgets.map((w) => 
      w.id === id ? { ...w, visible: !w.visible } : w
    ));
  };

  const updateSize = (id: string, size: 'small' | 'medium' | 'large' | 'full') => {
    setEditedWidgets(editedWidgets.map((w) => 
      w.id === id ? { ...w, size } : w
    ));
  };

  const removeWidget = (id: string) => {
    setEditedWidgets(editedWidgets.filter((w) => w.id !== id));
  };

  const addWidget = (widgetConfig: any) => {
    const newWidget: DashboardWidget = {
      id: Date.now().toString(),
      type: widgetConfig.type,
      subtype: widgetConfig.subtype,
      label: widgetConfig.label,
      order: editedWidgets.length,
      visible: true,
      size: widgetConfig.defaultSize,
    };
    setEditedWidgets([...editedWidgets, newWidget]);
  };

  const handleSave = () => {
    onSave(editedWidgets);
    onClose();
  };

  const resetToDefault = () => {
    const defaultWidgets: DashboardWidget[] = [
      { id: '1', type: 'kpi', subtype: 'total_customers', label: 'Totaal klanten', order: 0, visible: true, size: 'small' },
      { id: '2', type: 'kpi', subtype: 'leads_pipeline', label: 'Leads in pipeline', order: 1, visible: true, size: 'small' },
      { id: '3', type: 'kpi', subtype: 'open_tasks', label: 'Open taken', order: 2, visible: true, size: 'small' },
      { id: '4', type: 'kpi', subtype: 'new_documents_week', label: 'Nieuwe documenten', order: 3, visible: true, size: 'small' },
      { id: '5', type: 'chart', subtype: 'customers_per_month', label: 'Nieuwe klanten per maand', order: 4, visible: true, size: 'medium' },
      { id: '6', type: 'chart', subtype: 'tasks_per_week', label: 'Taken afgerond per week', order: 5, visible: true, size: 'medium' },
      { id: '7', type: 'chart', subtype: 'customer_type_distribution', label: 'Verdeling klanttype', order: 6, visible: true, size: 'medium' },
      { id: '8', type: 'chart', subtype: 'leads_per_phase', label: 'Leads per fase', order: 7, visible: true, size: 'medium' },
      { id: '9', type: 'agenda', subtype: 'upcoming_tasks', label: 'Openstaande taken', order: 8, visible: true, size: 'small' },
      { id: '10', type: 'agenda', subtype: 'recent_documents', label: 'Recente documenten', order: 9, visible: true, size: 'small' },
      { id: '11', type: 'agenda', subtype: 'recent_notes', label: 'Recente notities', order: 10, visible: true, size: 'small' },
      { id: '12', type: 'table', subtype: 'recent_customers', label: 'Laatst toegevoegd', order: 11, visible: true, size: 'full' },
    ];
    setEditedWidgets(defaultWidgets);
  };

  if (!isOpen) return null;

  const visibleWidgets = editedWidgets.filter((w) => w.visible);
  const hiddenWidgets = editedWidgets.filter((w) => !w.visible);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-30 backdrop-blur-sm">
      <div
        className="w-full max-w-4xl rounded-xl shadow-lg max-h-[90vh] overflow-hidden flex flex-col"
        style={{ backgroundColor: 'var(--panel)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div>
            <h2>Dashboard indeling aanpassen</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Sleep widgets om ze opnieuw te ordenen
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Visible Widgets */}
          <div>
            <h3 className="mb-4">Zichtbare widgets ({visibleWidgets.length})</h3>
            <div className="space-y-2">
              {visibleWidgets.map((widget, index) => (
                <div
                  key={widget.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className="p-4 rounded-xl border cursor-move hover:scale-[1.02] transition-transform"
                  style={{
                    backgroundColor: draggedIndex === index ? 'var(--accent)20' : 'var(--background)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div className="flex items-center gap-4">
                    <GripVertical className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span style={{ color: 'var(--text-primary)' }}>{widget.label}</span>
                        <span
                          className="text-xs px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: 'var(--accent)20',
                            color: 'var(--accent)',
                          }}
                        >
                          {widget.type}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            Grootte:
                          </Label>
                          <Select
                            value={widget.size || 'medium'}
                            onValueChange={(value: any) => updateSize(widget.id, value)}
                          >
                            <SelectTrigger className="h-8 text-xs w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Klein (1/4)</SelectItem>
                              <SelectItem value="medium">Normaal (1/2)</SelectItem>
                              <SelectItem value="large">Groot (3/4)</SelectItem>
                              <SelectItem value="full">Volledig (1/1)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleVisibility(widget.id)}
                        className="p-2 rounded-lg hover:scale-110 transition-transform"
                        style={{ color: 'var(--text-secondary)' }}
                        title="Verbergen"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeWidget(widget.id)}
                        className="p-2 rounded-lg hover:scale-110 transition-transform"
                        style={{ color: '#EF4444' }}
                        title="Verwijderen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {visibleWidgets.length === 0 && (
                <p className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
                  Geen zichtbare widgets. Voeg widgets toe hieronder.
                </p>
              )}
            </div>
          </div>

          {/* Hidden Widgets */}
          {hiddenWidgets.length > 0 && (
            <div>
              <h3 className="mb-4">Verborgen widgets ({hiddenWidgets.length})</h3>
              <div className="space-y-2">
                {hiddenWidgets.map((widget) => (
                  <div
                    key={widget.id}
                    className="p-4 rounded-xl border opacity-50"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span style={{ color: 'var(--text-primary)' }}>{widget.label}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleVisibility(widget.id)}
                        className="rounded-xl"
                      >
                        Tonen
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Widget */}
          <div>
            <h3 className="mb-4">Widget toevoegen</h3>
            <div className="grid grid-cols-2 gap-2">
              {availableWidgets
                .filter((aw) => !editedWidgets.some((w) => w.subtype === aw.subtype))
                .map((widgetConfig) => (
                  <button
                    key={widgetConfig.subtype}
                    onClick={() => addWidget(widgetConfig)}
                    className="p-3 rounded-xl border text-left hover:scale-105 transition-transform"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                      <div>
                        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                          {widgetConfig.label}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {widgetConfig.type}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex justify-between p-6 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <Button
            variant="outline"
            onClick={resetToDefault}
            className="rounded-xl"
          >
            Standaardinstellingen
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="rounded-xl">
              Annuleren
            </Button>
            <Button
              onClick={handleSave}
              className="rounded-xl"
              style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}
            >
              Opslaan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
