import { useState } from 'react';
import { X, Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { defaultPipelineStages, PipelineStage } from '../../lib/mockData';

interface PipelineSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stages: PipelineStage[]) => void;
}

const PRESET_COLORS = [
  '#94A3B8', '#3B82F6', '#8B5CF6', '#F59E0B', '#10B981',
  '#EF4444', '#EC4899', '#06B6D4', '#84CC16', '#F97316',
];

export function PipelineSettingsModal({ isOpen, onClose, onSave }: PipelineSettingsModalProps) {
  const [stages, setStages] = useState<PipelineStage[]>(defaultPipelineStages);
  const [editingStage, setEditingStage] = useState<PipelineStage | null>(null);

  if (!isOpen) return null;

  const handleAddStage = () => {
    const newStage: PipelineStage = {
      id: Date.now().toString(),
      name: '',
      label: '',
      color: PRESET_COLORS[stages.length % PRESET_COLORS.length],
      order: stages.length + 1,
    };
    setEditingStage(newStage);
  };

  const handleSaveStage = () => {
    if (!editingStage || !editingStage.label.trim() || !editingStage.name.trim()) return;

    if (editingStage.id && stages.find((s) => s.id === editingStage.id)) {
      setStages(stages.map((s) => (s.id === editingStage.id ? editingStage : s)));
    } else {
      setStages([...stages, editingStage]);
    }
    setEditingStage(null);
  };

  const handleDeleteStage = (id: string) => {
    if (confirm('Weet je zeker dat je deze status wilt verwijderen?')) {
      setStages(stages.filter((s) => s.id !== id));
    }
  };

  const handleSaveAll = () => {
    onSave(stages);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-30 backdrop-blur-sm">
      <div
        className="w-full max-w-3xl rounded-xl shadow-lg max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--panel)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b sticky top-0 z-10"
          style={{
            backgroundColor: 'var(--panel)',
            borderColor: 'var(--border)',
          }}
        >
          <h2>Pipeline statussen beheren</h2>
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
          <div>
            <p style={{ color: 'var(--text-secondary)' }}>
              Beheer de statussen die in de pipeline worden getoond. Sleep om de volgorde te wijzigen.
            </p>
          </div>

          {/* Stages List */}
          <div className="space-y-3">
            {stages
              .sort((a, b) => a.order - b.order)
              .map((stage, index) => (
                <div
                  key={stage.id}
                  className="p-4 rounded-xl flex items-center gap-4"
                  style={{ backgroundColor: 'var(--background)' }}
                >
                  <GripVertical
                    className="h-5 w-5 cursor-grab"
                    style={{ color: 'var(--text-secondary)' }}
                  />
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: stage.color }}
                  />
                  <div className="flex-1">
                    <p style={{ color: 'var(--text-primary)' }}>{stage.label}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {stage.name}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingStage(stage)}
                      className="p-2 rounded-lg hover:scale-110 transition-transform"
                      style={{ color: 'var(--accent)' }}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteStage(stage.id)}
                      className="p-2 rounded-lg hover:scale-110 transition-transform"
                      style={{ color: 'var(--error)' }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>

          <Button
            onClick={handleAddStage}
            variant="outline"
            className="w-full rounded-xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nieuwe status toevoegen
          </Button>

          {/* Edit Stage Form */}
          {editingStage && (
            <div
              className="p-6 rounded-xl space-y-4"
              style={{ backgroundColor: 'var(--background)' }}
            >
              <h3>
                {editingStage.id && stages.find((s) => s.id === editingStage.id)
                  ? 'Status bewerken'
                  : 'Nieuwe status'}
              </h3>

              <div className="space-y-2">
                <Label htmlFor="stageLabel">Weergavenaam *</Label>
                <Input
                  id="stageLabel"
                  value={editingStage.label}
                  onChange={(e) =>
                    setEditingStage({ ...editingStage, label: e.target.value })
                  }
                  placeholder="bijv. In behandeling"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stageName">Systeemnaam * (geen spaties)</Label>
                <Input
                  id="stageName"
                  value={editingStage.name}
                  onChange={(e) =>
                    setEditingStage({
                      ...editingStage,
                      name: e.target.value.toUpperCase().replace(/\s+/g, '_'),
                    })
                  }
                  placeholder="bijv. IN_BEHANDELING"
                />
              </div>

              <div className="space-y-2">
                <Label>Kleur</Label>
                <div className="flex gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setEditingStage({ ...editingStage, color })}
                      className="w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform"
                      style={{
                        backgroundColor: color,
                        borderColor:
                          editingStage.color === color ? 'var(--accent)' : 'transparent',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setEditingStage(null)}
                  className="rounded-xl flex-1"
                >
                  Annuleren
                </Button>
                <Button
                  onClick={handleSaveStage}
                  disabled={!editingStage.label.trim() || !editingStage.name.trim()}
                  className="rounded-xl flex-1"
                  style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}
                >
                  Opslaan
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="p-6 border-t flex justify-end gap-3"
          style={{ borderColor: 'var(--border)' }}
        >
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Annuleren
          </Button>
          <Button
            onClick={handleSaveAll}
            className="rounded-xl"
            style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}
          >
            Opslaan
          </Button>
        </div>
      </div>
    </div>
  );
}
