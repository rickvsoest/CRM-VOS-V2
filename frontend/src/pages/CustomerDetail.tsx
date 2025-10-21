import { useState } from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Edit, Trash2, Plus, Download, CheckCircle, Clock, XCircle, AlertCircle, TrendingUp, User, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { DocumentPreviewModal } from '../components/modals/DocumentPreviewModal';
import { NewTaskModal } from '../components/modals/NewTaskModal';
import { EditTaskModal } from '../components/modals/EditTaskModal';
import { TaskDetailModal } from '../components/modals/TaskDetailModal';
import {
  mockCustomers,
  mockNotes,
  mockTasks,
  mockDocuments,
  mockContactPersons,
  mockUsers,
  defaultPipelineStages,
  getCustomerFullName,
  formatDateTime,
  formatDate,
  formatFileSize,
  TaskStatus,
} from '../lib/mockData';

interface CustomerDetailProps {
  customerId: string;
  onNavigate: (page: string, id?: string) => void;
  onOpenNewContactPerson: () => void;
}

export function CustomerDetail({ customerId, onNavigate, onOpenNewContactPerson }: CustomerDetailProps) {
  const customer = mockCustomers.find((c) => c.id === customerId);
  const contactPersons = mockContactPersons.filter((cp) => cp.customerId === customerId);

  const [newNote, setNewNote] = useState('');
  const [pipelineStage, setPipelineStage] = useState<string>(customer?.status || 'NIEUW');
  const [previewDocument, setPreviewDocument] = useState<string | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [tasks, setTasks] = useState(mockTasks.filter((t) => t.customerId === customerId));
  const [notes, setNotes] = useState(mockNotes.filter((n) => n.customerId === customerId));
  const [documents, setDocuments] = useState(mockDocuments.filter((d) => d.customerId === customerId));

  const customerTasks = tasks;
  const customerNotes = notes;
  const customerDocuments = documents;

  const handleNewTaskSave = (data: any) => {
    const newTask = {
      id: Date.now().toString(),
      title: data.title,
      notes: data.notes,
      status: data.status,
      deadline: data.deadline,
      customerId: data.customerId,
      assignedTo: data.assignedTo,
      createdAt: new Date().toISOString(),
    };
    setTasks([...tasks, newTask]);
    
    // Also add to global window callback if available
    if ((window as any).tasksAddTask) {
      (window as any).tasksAddTask(newTask);
    }
    
    alert('Taak succesvol aangemaakt!');
  };

  const handleEditTaskSave = (updatedTask: any) => {
    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    alert('Taak succesvol bijgewerkt!');
  };

  const handleEditTask = (task: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingTask(task);
    setIsEditTaskModalOpen(true);
  };

  const handleTaskClick = (task: any) => {
    const taskWithDetails = {
      ...task,
      customer,
      assignee: mockUsers.find((u) => u.id === task.assignedTo),
    };
    setSelectedTask(taskWithDetails);
    setIsTaskDetailModalOpen(true);
  };

  const handleTaskStatusChange = (taskId: string, newStatus: TaskStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    import('sonner').then(({ toast }) => {
      toast.success('Status bijgewerkt!');
    });
  };

  const handleEditCustomer = () => {
    alert('Klant bewerken functionaliteit komt binnenkort beschikbaar!');
    // TODO: Implement edit customer modal
  };

  const handleDeleteCustomer = () => {
    if (confirm(`Weet je zeker dat je ${fullName} wilt verwijderen?`)) {
      alert('Klant verwijderd!');
      onNavigate('customers');
    }
  };

  const handleUploadDocument = () => {
    alert('Document upload functionaliteit komt binnenkort beschikbaar!');
    // TODO: Implement document upload
  };

  const handleSaveNote = () => {
    if (newNote.trim()) {
      const note = {
        id: Date.now().toString(),
        content: newNote,
        customerId: customerId,
        authorId: '1',
        authorName: 'Huidige gebruiker',
        createdAt: new Date().toISOString(),
      };
      setNotes([note, ...notes]);
      setNewNote('');
      alert('Notitie opgeslagen!');
    }
  };

  if (!customer) {
    return <div>Klant niet gevonden</div>;
  }

  const fullName = getCustomerFullName(customer);
  const fullAddress = [
    customer.street,
    customer.houseNumber,
    customer.houseNumberAddition,
    customer.postalCode,
    customer.city,
  ]
    .filter(Boolean)
    .join(' ');

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'OPEN':
        return <AlertCircle className="h-4 w-4" />;
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4" />;
      case 'DONE':
        return <CheckCircle className="h-4 w-4" />;
      case 'CANCELED':
        return <XCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'OPEN':
        return '#3B82F6';
      case 'IN_PROGRESS':
        return '#F59E0B';
      case 'DONE':
        return '#10B981';
      case 'CANCELED':
        return '#DC2626';
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case 'OPEN':
        return 'Open';
      case 'IN_PROGRESS':
        return 'Bezig';
      case 'DONE':
        return 'Afgerond';
      case 'CANCELED':
        return 'Geannuleerd';
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Back Button */}
      <button
        onClick={() => onNavigate('customers')}
        className="flex items-center gap-2 hover:scale-105 transition-transform"
        style={{ color: 'var(--accent)' }}
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Terug naar klanten</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Info Card */}
        <div className="lg:col-span-1">
          <div className="p-6 rounded-xl shadow-sm space-y-4" style={{ backgroundColor: 'var(--panel)' }}>
            <div className="flex items-center gap-4 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}
              >
                {fullName.charAt(0)}
              </div>
              <div>
                <h2>{fullName}</h2>
                <Badge
                  variant="secondary"
                  className="rounded-full mt-1"
                  style={{
                    backgroundColor: customer.type === 'PERSON' ? '#3B82F620' : '#10B98120',
                    color: customer.type === 'PERSON' ? '#3B82F6' : '#10B981',
                  }}
                >
                  {customer.type === 'PERSON' ? 'Persoon' : 'Organisatie'}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              {customer.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
                  <a href={`mailto:${customer.email}`} className="hover:underline" style={{ color: 'var(--accent)' }}>
                    {customer.email}
                  </a>
                </div>
              )}

              {customer.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
                  <a href={`tel:${customer.phone}`} className="hover:underline" style={{ color: 'var(--accent)' }}>
                    {customer.phone}
                  </a>
                </div>
              )}

              {fullAddress && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 mt-0.5" style={{ color: 'var(--text-secondary)' }} />
                  <span style={{ color: 'var(--text-primary)' }}>{fullAddress}</span>
                </div>
              )}

              <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <Label className="mb-2 block">Pipeline status</Label>
                <Select value={pipelineStage} onValueChange={setPipelineStage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {defaultPipelineStages.map((stage) => (
                      <SelectItem key={stage.id} value={stage.name}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: stage.color }}
                          />
                          {stage.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {customer.type === 'ORGANIZATION' && (
                <>
                  {customer.kvk && (
                    <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        KvK-nummer
                      </p>
                      <p style={{ color: 'var(--text-primary)' }}>{customer.kvk}</p>
                    </div>
                  )}
                  {customer.btw && (
                    <div>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        BTW-nummer
                      </p>
                      <p style={{ color: 'var(--text-primary)' }}>{customer.btw}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="pt-6 border-t space-y-3" style={{ borderColor: 'var(--border)' }}>
              <Button 
                variant="outline" 
                className="w-full rounded-xl"
                onClick={handleEditCustomer}
              >
                <Edit className="h-4 w-4 mr-2" />
                Bewerken klant
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-xl"
                style={{ color: '#EF4444', borderColor: '#EF4444' }}
                onClick={handleDeleteCustomer}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Verwijder klant
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="notes" className="space-y-6">
            <TabsList
              className="grid w-full"
              style={{
                gridTemplateColumns: customer.type === 'ORGANIZATION' ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)',
              }}
            >
              <TabsTrigger value="notes" className="rounded-xl">
                Notities
              </TabsTrigger>
              <TabsTrigger value="tasks" className="rounded-xl">
                Taken
              </TabsTrigger>
              <TabsTrigger value="documents" className="rounded-xl">
                Documenten
              </TabsTrigger>
              {customer.type === 'ORGANIZATION' && (
                <TabsTrigger value="contacts" className="rounded-xl">
                  Contactpersonen
                </TabsTrigger>
              )}
            </TabsList>

            {/* Notes Tab */}
            <TabsContent value="notes">
              <div
                className="p-6 rounded-xl shadow-sm space-y-6"
                style={{ backgroundColor: 'var(--panel)' }}
              >
                <h3>Notities</h3>

                <div className="space-y-4">
                  {customerNotes.map((note) => (
                    <div
                      key={note.id}
                      className="p-4 rounded-xl"
                      style={{ backgroundColor: 'var(--background)' }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p style={{ color: 'var(--text-primary)' }}>{note.authorName}</p>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {formatDateTime(note.createdAt)}
                          </p>
                        </div>
                      </div>
                      <p style={{ color: 'var(--text-primary)' }}>{note.content}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <Label>Nieuwe notitie toevoegen</Label>
                  <Textarea
                    placeholder="Typ hier je notitie..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={4}
                  />
                  <Button
                    className="rounded-xl"
                    style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}
                    onClick={handleSaveNote}
                  >
                    Opslaan
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks">
              <div
                className="p-6 rounded-xl shadow-sm space-y-6"
                style={{ backgroundColor: 'var(--panel)' }}
              >
                <div className="flex items-center justify-between">
                  <h3>Taken</h3>
                  <Button
                    variant="outline"
                    className="rounded-xl hover:scale-105 transition-transform"
                    onClick={() => setIsNewTaskModalOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nieuwe taak
                  </Button>
                </div>

                <div className="space-y-3">
                  {customerTasks.map((task) => {
                    const assignedUser = mockUsers.find((u) => u.id === task.assignedTo);
                    return (
                      <div
                        key={task.id}
                        className="p-4 rounded-xl cursor-pointer hover:shadow-md transition-all"
                        style={{ backgroundColor: 'var(--background)' }}
                        onClick={() => handleTaskClick(task)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 style={{ color: 'var(--text-primary)' }}>{task.title}</h4>
                          <div className="flex items-center gap-2">
                            {/* Quick Status Changer */}
                            <Select 
                              value={task.status} 
                              onValueChange={(value) => handleTaskStatusChange(task.id, value as TaskStatus, event as any)}
                            >
                              <SelectTrigger 
                                className="h-auto py-1 px-3 rounded-full w-auto border-0"
                                style={{
                                  backgroundColor: getStatusColor(task.status) + '20',
                                  color: getStatusColor(task.status),
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(task.status)}
                                  <span className="text-sm">{getStatusLabel(task.status)}</span>
                                </div>
                              </SelectTrigger>
                              <SelectContent onClick={(e) => e.stopPropagation()}>
                                <SelectItem value="OPEN">
                                  <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" style={{ color: '#3B82F6' }} />
                                    <span>Open</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="IN_PROGRESS">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" style={{ color: '#F59E0B' }} />
                                    <span>Bezig</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="DONE">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4" style={{ color: '#10B981' }} />
                                    <span>Afgerond</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="CANCELED">
                                  <div className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4" style={{ color: '#DC2626' }} />
                                    <span>Geannuleerd</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <button
                              onClick={(e) => handleEditTask(task, e)}
                              className="p-2 rounded-lg hover:scale-110 transition-transform"
                              style={{ color: 'var(--accent)' }}
                              title="Taak bewerken"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        {task.notes && (
                          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                            {task.notes}
                          </p>
                        )}
                        {assignedUser && (
                          <div className="flex items-center gap-2 text-sm mb-2">
                            <User className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                            <span style={{ color: 'var(--text-secondary)' }}>
                              Toegewezen aan: {assignedUser.name}
                            </span>
                          </div>
                        )}
                        {task.deadline && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
                            <span style={{ color: 'var(--text-secondary)' }}>
                              Deadline: {formatDate(task.deadline)}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {customerTasks.length === 0 && (
                    <p className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
                      Nog geen taken voor deze klant
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents">
              <div
                className="p-6 rounded-xl shadow-sm space-y-6"
                style={{ backgroundColor: 'var(--panel)' }}
              >
                <div className="flex items-center justify-between">
                  <h3>Documenten</h3>
                  <Button
                    className="rounded-xl"
                    style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}
                    onClick={handleUploadDocument}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Upload document
                  </Button>
                </div>

                <div className="space-y-3">
                  {customerDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-xl flex items-center justify-between hover:shadow-md transition-all cursor-pointer"
                      style={{ backgroundColor: 'var(--background)' }}
                      onClick={() => setPreviewDocument(doc.filename)}
                    >
                      <div>
                        <p style={{ color: 'var(--text-primary)' }}>{doc.filename}</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {formatFileSize(doc.size)} â€¢ {formatDateTime(doc.uploadedAt)}
                        </p>
                      </div>
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
                          style={{ color: '#EF4444' }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {customerDocuments.length === 0 && (
                    <p className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
                      Nog geen documenten voor deze klant
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Contact Persons Tab (Organization only) */}
            {customer.type === 'ORGANIZATION' && (
              <TabsContent value="contacts">
                <div
                  className="p-6 rounded-xl shadow-sm space-y-6"
                  style={{ backgroundColor: 'var(--panel)' }}
                >
                  <div className="flex items-center justify-between">
                    <h3>Contactpersonen</h3>
                    <Button
                      onClick={onOpenNewContactPerson}
                      className="rounded-xl"
                      style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nieuwe contactpersoon
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead style={{ backgroundColor: 'var(--background)' }}>
                        <tr>
                          <th
                            className="px-4 py-3 text-left rounded-tl-lg"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            Naam
                          </th>
                          <th className="px-4 py-3 text-left" style={{ color: 'var(--text-secondary)' }}>
                            E-mail
                          </th>
                          <th className="px-4 py-3 text-left" style={{ color: 'var(--text-secondary)' }}>
                            Telefoon
                          </th>
                          <th className="px-4 py-3 text-left" style={{ color: 'var(--text-secondary)' }}>
                            Rol
                          </th>
                          <th
                            className="px-4 py-3 text-left rounded-tr-lg"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            Acties
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {contactPersons.map((contact) => (
                          <tr
                            key={contact.id}
                            className="border-t"
                            style={{ borderColor: 'var(--border)' }}
                          >
                            <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                              {[contact.firstName, contact.middleName, contact.lastName]
                                .filter(Boolean)
                                .join(' ')}
                            </td>
                            <td className="px-4 py-3">
                              <a
                                href={`mailto:${contact.email}`}
                                className="hover:underline"
                                style={{ color: 'var(--accent)' }}
                              >
                                {contact.email}
                              </a>
                            </td>
                            <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                              {contact.phone || '-'}
                            </td>
                            <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                              {contact.role || '-'}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => alert('Bewerken contactpersoon')}
                                  className="p-2 rounded-lg hover:scale-110 transition-transform"
                                  style={{ color: 'var(--accent)' }}
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm('Weet je zeker dat je deze contactpersoon wilt verwijderen?')) {
                                      alert('Contactpersoon verwijderd!');
                                    }
                                  }}
                                  className="p-2 rounded-lg hover:scale-110 transition-transform"
                                  style={{ color: '#EF4444' }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {contactPersons.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center" style={{ color: 'var(--text-secondary)' }}>
                              Nog geen contactpersonen toegevoegd
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={!!previewDocument}
        onClose={() => setPreviewDocument(null)}
        filename={previewDocument || ''}
      />

      {/* New Task Modal */}
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        onSave={handleNewTaskSave}
        preSelectedCustomerId={customerId}
      />

      {/* Edit Task Modal */}
      {editingTask && (
        <EditTaskModal
          isOpen={isEditTaskModalOpen}
          onClose={() => {
            setIsEditTaskModalOpen(false);
            setEditingTask(null);
          }}
          onSave={handleEditTaskSave}
          task={editingTask}
        />
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          isOpen={isTaskDetailModalOpen}
          onClose={() => {
            setIsTaskDetailModalOpen(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          onNavigateToCustomer={() => {
            setIsTaskDetailModalOpen(false);
            // Already on customer page
          }}
          onEdit={() => {
            setIsTaskDetailModalOpen(false);
            handleEditTask(selectedTask);
          }}
        />
      )}
    </div>
  );
}

