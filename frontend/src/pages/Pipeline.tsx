import { useState } from 'react';
import * as React from 'react';
import { Search, Calendar, Plus, Settings, UserPlus, Trash2 } from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { AddExistingCustomerModal } from '../components/modals/AddExistingCustomerModal';
import { mockCustomers, defaultPipelineStages, getCustomerFullName, formatDate } from '../lib/mockData';
import type { Customer } from '../lib/mockData';
import type { PipelineStage } from '../lib/mockData';

interface PipelineProps {
  onNavigate: (page: string, id?: string) => void;
  onOpenNewCustomer: (stage?: string) => void;
  onOpenPipelineSettings: () => void;
  onCustomerAdded?: (customer: Customer) => void;
}

const DRAG_TYPE = 'CUSTOMER_CARD';

interface DragItem {
  customerId: string;
  fromStage: string;
}

export function Pipeline({ onNavigate, onOpenNewCustomer, onOpenPipelineSettings }: PipelineProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [pipelineStages] = useState<PipelineStage[]>(defaultPipelineStages);
  const [isAddExistingModalOpen, setIsAddExistingModalOpen] = useState(false);
  const [selectedStageForAdd, setSelectedStageForAdd] = useState<string>('NIEUW');
  const [allCustomers] = useState<Customer[]>(mockCustomers);

  // Register global callback for adding customers
  React.useEffect(() => {
    (window as any).pipelineAddCustomer = (customer: Customer) => {
      setCustomers((prev) => [...prev, customer]);
    };
    return () => {
      delete (window as any).pipelineAddCustomer;
    };
  }, []);

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      getCustomerFullName(customer).toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const moveCustomer = (customerId: string, toStage: string) => {
    setCustomers((prevCustomers) =>
      prevCustomers.map((customer) => {
        if (customer.id === customerId) {
          return {
            ...customer,
            status: toStage,
            lastActivity: new Date().toISOString(),
          };
        }
        return customer;
      })
    );
  };

  const handleAddExistingCustomer = (customerId: string, stage: string) => {
    const customer = allCustomers.find((c) => c.id === customerId);
    if (customer) {
      const updatedCustomer = {
        ...customer,
        status: stage,
        lastActivity: new Date().toISOString(),
      };
      setCustomers((prev) => {
        const exists = prev.find((c) => c.id === customerId);
        if (exists) {
          return prev.map((c) => (c.id === customerId ? updatedCustomer : c));
        }
        return [...prev, updatedCustomer];
      });
    }
  };

  const handleDeleteCustomer = (customerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Weet je zeker dat je deze klant uit de pipeline wilt verwijderen?')) {
      setCustomers((prev) => prev.filter((c) => c.id !== customerId));
      import('sonner').then(({ toast }) => {
        toast.success('Klant verwijderd uit pipeline!');
      });
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="mb-2">Pipeline</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Overzicht van klanten in verschillende verkoopfases</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={onOpenPipelineSettings} variant="outline" className="rounded-xl hover:scale-105 transition-transform">
              <Settings className="h-4 w-4 mr-2" />
              Statussen beheren
            </Button>
            <Button
              onClick={() => {
                setSelectedStageForAdd('NIEUW');
                setIsAddExistingModalOpen(true);
              }}
              variant="outline"
              className="rounded-xl hover:scale-105 transition-transform"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Bestaande klant toevoegen
            </Button>
            <Button
              onClick={() => onOpenNewCustomer()}
              className="rounded-xl hover:scale-105 transition-transform"
              style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nieuwe klant
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-6 rounded-xl shadow-sm space-y-4" style={{ backgroundColor: 'var(--panel)' }}>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
              <Input
                placeholder="Zoek op naam of e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Alle statussen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle statussen</SelectItem>
                {defaultPipelineStages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.name}>
                    {stage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {defaultPipelineStages
            .sort((a, b) => a.order - b.order)
            .map((stage) => (
              <PipelineColumn
                key={stage.id}
                stage={stage}
                customers={filteredCustomers.filter((c) => c.status === stage.name)}
                onNavigate={onNavigate}
                onMoveCustomer={moveCustomer}
                onAddCustomer={() => onOpenNewCustomer(stage.name)}
                onDeleteCustomer={handleDeleteCustomer}
              />
            ))}
        </div>

        {/* Add Existing Customer Modal */}
        <AddExistingCustomerModal
          isOpen={isAddExistingModalOpen}
          onClose={() => setIsAddExistingModalOpen(false)}
          onAdd={handleAddExistingCustomer}
          availableCustomers={allCustomers}
          initialStage={selectedStageForAdd}
        />
      </div>
    </DndProvider>
  );
}

interface PipelineColumnProps {
  stage: PipelineStage;
  customers: Customer[];
  onNavigate: (page: string, id?: string) => void;
  onMoveCustomer: (customerId: string, toStage: string) => void;
  onAddCustomer: () => void;
  onDeleteCustomer: (customerId: string, e: React.MouseEvent) => void;
}

function PipelineColumn({ stage, customers, onNavigate, onMoveCustomer, onAddCustomer, onDeleteCustomer }: PipelineColumnProps) {
  const [dropFlash, setDropFlash] = React.useState(false);

  const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>({
    accept: DRAG_TYPE,
    drop: (item) => {
      if (item.fromStage !== stage.name) {
        onMoveCustomer(item.customerId, stage.name);
        // korte flash na droppen
        setDropFlash(true);
        setTimeout(() => setDropFlash(false), 250);
      }
    },
    collect: (monitor) => ({
      // shallow om alleen de kolom zelf te highlighten
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  const columnRef = React.useRef<HTMLDivElement>(null);
  drop(columnRef);

  return (
    <div
      ref={columnRef}
      className="flex-shrink-0 w-80 rounded-xl transition-all duration-200"
      style={{
        backgroundColor: isOver ? 'var(--accent)10' as any : 'var(--panel)',
        border: isOver ? '2px dashed var(--accent)' : '2px solid transparent',
        boxShadow: dropFlash ? '0 0 0 4px rgba(59,130,246,0.25)' : 'none',
        transform: dropFlash ? 'scale(1.01)' : 'scale(1.0)',
      }}
    >
      {/* Column Header */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
            <h3 className="text-sm">{stage.label}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onAddCustomer}
              className="p-1 rounded-lg hover:scale-110 transition-transform"
              style={{ color: 'var(--accent)' }}
              title="Klant toevoegen aan deze fase"
            >
              <Plus className="h-4 w-4" />
            </button>
            <Badge
              variant="secondary"
              className="rounded-full"
              style={{
                backgroundColor: stage.color + '20',
                color: stage.color,
              }}
            >
              {customers.length}
            </Badge>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="p-3 space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
        {customers.map((customer) => (
          <CustomerCard
            key={customer.id}
            customer={customer}
            stage={stage.name}
            onNavigate={onNavigate}
            onDeleteCustomer={onDeleteCustomer}
          />
        ))}

        {customers.length === 0 && (
          <div
            className="p-8 text-center text-sm rounded-xl transition-all duration-200"
            style={{
              backgroundColor: isOver ? 'var(--accent)12' as any : 'var(--background)',
              color: isOver ? 'var(--accent)' : 'var(--text-secondary)',
              border: isOver ? '2px dashed var(--accent)' : '2px dashed transparent',
            }}
          >
            {isOver ? 'Laat hier los' : 'Geen klanten'}
          </div>
        )}
      </div>
    </div>
  );
}

interface CustomerCardProps {
  customer: Customer;
  stage: string;
  onNavigate: (page: string, id?: string) => void;
  onDeleteCustomer: (customerId: string, e: React.MouseEvent) => void;
}

function CustomerCard({ customer, stage, onNavigate, onDeleteCustomer }: CustomerCardProps) {
  const [{ isDragging }, drag] = useDrag<DragItem, void, { isDragging: boolean }>({
    type: DRAG_TYPE,
    item: { customerId: customer.id, fromStage: stage },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const cardRef = React.useRef<HTMLDivElement>(null);
  drag(cardRef);

  return (
    <div
      ref={cardRef}
      className="p-4 rounded-xl cursor-move hover:scale-105 transition-transform duration-200 shadow-sm relative group"
      style={{
        backgroundColor: 'var(--background)',
        opacity: isDragging ? 0.6 : 1,
        transform: isDragging ? 'scale(0.98)' : 'scale(1)',
        cursor: isDragging ? 'grabbing' : 'grab',
        boxShadow: isDragging ? '0 6px 18px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {/* Delete Button */}
      <button
        onClick={(e) => onDeleteCustomer(customer.id, e)}
        className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          backgroundColor: 'var(--error)' + '20',
          color: 'var(--error)',
        }}
        title="Verwijder uit pipeline"
      >
        <Trash2 className="h-3 w-3" />
      </button>

      {/* Customer Name */}
      <h4
        className="mb-2 pr-8"
        style={{ color: 'var(--text-primary)' }}
        onClick={() => onNavigate('customer-detail', customer.id)}
      >
        {getCustomerFullName(customer)}
      </h4>

      {/* Content - Clickable */}
      <div onClick={() => onNavigate('customer-detail', customer.id)}>
        {/* Type Badge */}
        <Badge
          variant="secondary"
          className="rounded-full mb-3"
          style={{
            backgroundColor: customer.type === 'PERSON' ? '#3B82F620' : '#10B98120',
            color: customer.type === 'PERSON' ? '#3B82F6' : '#10B981',
          }}
        >
          {customer.type === 'PERSON' ? 'Persoon' : 'Organisatie'}
        </Badge>

        {/* Last Activity */}
        {customer.lastActivity && (
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="h-3 w-3" style={{ color: 'var(--text-secondary)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>{formatDate(customer.lastActivity)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
