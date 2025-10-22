import { useState, useRef } from 'react';
import { X, Plus, GripVertical, Trash2, Save } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export interface DashboardKPI {
  id: string;
  type: string;
  label: string;
  order: number;
}

interface DashboardEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (kpis: DashboardKPI[]) => void;
  kpis: DashboardKPI[];
}

const DRAG_TYPE = 'KPI_ITEM';

interface DragItem {
  id: string;
  index: number;
}

const availableKPITypes = [
  { value: 'total_customers', label: 'Totaal klanten', description: 'Alle klanten met breakdown' },
  { value: 'person_customers', label: 'Alleen personen', description: 'Aantal particuliere klanten' },
  { value: 'organization_customers', label: 'Alleen organisaties', description: 'Aantal zakelijke klanten' },
  { value: 'new_customers_month', label: 'Nieuwe klanten deze maand', description: 'Vergelijk met vorige maand' },
  { value: 'conversion_rate', label: 'Conversieratio lead → klant', description: 'Effectiviteit van pipeline (%)' },
  { value: 'avg_lead_time', label: 'Gemiddelde doorlooptijd lead', description: 'Tijd van lead tot klant (dagen)' },
  { value: 'customer_type_distribution', label: 'Verdeling klanttype', description: 'Particulier vs Organisatie (%)' },
  { value: 'leads_pipeline', label: 'Leads in pipeline', description: 'Aantal actieve leads' },
  { value: 'my_tasks', label: 'Mijn taken', description: 'Jouw toegewezen taken' },
  { value: 'open_tasks', label: 'Openstaande taken', description: 'Aantal niet afgeronde taken' },
  { value: 'tasks_by_status', label: 'Taken per status', description: 'Verdeling OPEN/IN_PROGRESS/DONE' },
  { value: 'avg_task_duration', label: 'Gemiddelde doorlooptijd taak', description: 'Tijd van creatie tot voltooiing (dagen)' },
  { value: 'tasks_per_employee', label: 'Taken per medewerker', description: 'Workload verdeling' },
  { value: 'new_notes_week', label: 'Nieuwe notities deze week', description: 'Notities van afgelopen 7 dagen' },
  { value: 'new_documents_week', label: 'Nieuwe documenten deze week', description: 'Documenten van afgelopen 7 dagen' },
  { value: 'completed_deals_month', label: 'Afgeronde deals deze maand', description: 'Aantal deals deze maand' },
  { value: 'total_notes', label: 'Totaal notities', description: 'Alle notities in systeem' },
  { value: 'overdue_tasks', label: 'Verlopen taken', description: 'Taken na deadline' },
  { value: 'recent_activity', label: 'Activiteit vandaag', description: 'Activiteiten van vandaag' },
];

export function DashboardEditorModal({ isOpen, onClose, onSave, kpis: currentKPIs }: DashboardEditorModalProps) {
  const [kpis, setKpis] = useState<DashboardKPI[]>(currentKPIs);
  const [selectedType, setSelectedType] = useState<string>('');

  if (!isOpen) return null;

  const handleAddKPI = () => {
    if (!selectedType) return;

    const kpiType = availableKPITypes.find((k) => k.value === selectedType);
    if (!kpiType) return;

    const newKPI: DashboardKPI = {
      id: Date.now().toString(),
      type: selectedType,
      label: kpiType.label,
      order: kpis.length,
    };

    setKpis([...kpis, newKPI]);
    setSelectedType('');
  };

  const handleRemoveKPI = (id: string) => {
    setKpis(kpis.filter((k) => k.id !== id));
  };

  const moveKPI = (dragIndex: number, hoverIndex: number) => {
    const updatedKPIs = [...kpis];
    const [removed] = updatedKPIs.splice(dragIndex, 1);
    updatedKPIs.splice(hoverIndex, 0, removed);
    
    // Update order
    const reorderedKPIs = updatedKPIs.map((kpi, index) => ({
      ...kpi,
      order: index,
    }));
    
    setKpis(reorderedKPIs);
  };

  const handleSave = () => {
    onSave(kpis);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl shadow-lg"
        style={{ backgroundColor: 'var(--panel)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div>
            <h2 style={{ color: 'var(--text-primary)' }}>Dashboard bewerken</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Voeg KPI's toe en versleep ze om de volgorde aan te passen
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
          {/* Add new KPI */}
          <div
            className="p-4 rounded-xl"
            style={{ backgroundColor: 'var(--background)' }}
          >
            <Label className="mb-3 block">Nieuwe KPI toevoegen</Label>
            <div className="flex gap-3">
              <div className="flex-1">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer een KPI type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableKPITypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div>{type.label}</div>
                          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {type.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleAddKPI}
                disabled={!selectedType}
                className="rounded-xl"
                style={{
                  backgroundColor: selectedType ? 'var(--accent)' : undefined,
                  color: selectedType ? '#FFFFFF' : undefined,
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Toevoegen
              </Button>
            </div>
          </div>

          {/* Current KPIs */}
          <div>
            <Label className="mb-3 block">
              Huidige KPI's ({kpis.length})
            </Label>
            <DndProvider backend={HTML5Backend}>
              <div className="space-y-2">
                {kpis.length === 0 ? (
                  <div
                    className="p-8 text-center rounded-xl"
                    style={{
                      backgroundColor: 'var(--background)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    Geen KPI's toegevoegd. Voeg er een toe om te beginnen.
                  </div>
                ) : (
                  kpis.map((kpi, index) => (
                    <KPIItem
                      key={kpi.id}
                      kpi={kpi}
                      index={index}
                      onRemove={handleRemoveKPI}
                      moveKPI={moveKPI}
                    />
                  ))
                )}
              </div>
            </DndProvider>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 p-6 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Annuleren
          </Button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl hover:scale-105 transition-transform"
            style={{
              backgroundColor: 'var(--accent)',
              color: '#FFFFFF',
            }}
          >
            <Save className="h-4 w-4 mr-2 inline" />
            Opslaan
          </button>
        </div>
      </div>
    </div>
  );
}

interface KPIItemProps {
  kpi: DashboardKPI;
  index: number;
  onRemove: (id: string) => void;
  moveKPI: (dragIndex: number, hoverIndex: number) => void;
}

function KPIItem({ kpi, index, onRemove, moveKPI }: KPIItemProps) {
  const [{ isDragging }, drag] = useDrag<DragItem, void, { isDragging: boolean }>({
    type: DRAG_TYPE,
    item: { id: kpi.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>({
    accept: DRAG_TYPE,
    hover: (item) => {
      if (item.index !== index) {
        moveKPI(item.index, index);
        item.index = index;
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // ✅ maak de ref en compose drag & drop
  const ref = useRef<HTMLDivElement>(null);
  drag(drop(ref));

  const kpiType = availableKPITypes.find((k) => k.value === kpi.type);

  return (
    <div
      ref={ref}
      className="flex items-center gap-3 p-4 rounded-xl cursor-move transition-all"
      style={{
        backgroundColor: isOver ? 'var(--accent)' + '20' : 'var(--background)',
        opacity: isDragging ? 0.5 : 1,
        border: isOver ? '2px dashed var(--accent)' : '2px solid transparent',
      }}
    >
      <GripVertical
        className="h-5 w-5 flex-shrink-0"
        style={{ color: 'var(--text-secondary)' }}
      />
      <div className="flex-1">
        <p style={{ color: 'var(--text-primary)' }}>{kpi.label}</p>
        {kpiType && (
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            {kpiType.description}
          </p>
        )}
      </div>
      <button
        onClick={() => onRemove(kpi.id)}
        className="p-2 rounded-lg hover:scale-110 transition-transform"
        style={{ color: 'var(--text-secondary)' }}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
