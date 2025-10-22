import { useState, useEffect as React_useEffect } from 'react';
import * as React from 'react';
import { Search, Plus, CheckCircle, Clock, XCircle, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { NewTaskModal } from '../components/modals/NewTaskModal';
import { EditTaskModal } from '../components/modals/EditTaskModal';
import { TaskDetailModal } from '../components/modals/TaskDetailModal';
import { mockTasks, mockCustomers, mockUsers, getCustomerFullName, formatDate, TaskStatus } from '../lib/mockData';

interface TasksProps {
  onNavigate: (page: string, id?: string) => void;
}

export function Tasks({ onNavigate }: TasksProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('OPENSTAAND');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);

  type TaskLite = {
  id: string;
  title: string;
  notes?: string;
  status: TaskStatus;
  deadline?: string;
  customerId?: string;
  customer?: any;   // later: Customer
  assignedTo?: string;
  assignee?: any;   // later: User
  createdAt: string;
};

  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [tasks, setTasks] = useState(mockTasks);
  const getTaskCustomer = (task: { customer?: any; customerId?: string }) =>
    task.customer ?? mockCustomers.find(c => c.id === task.customerId) ?? null;
 

  // Register global callback for adding tasks
  React.useEffect(() => {
    (window as any).tasksAddTask = (task: any) => {
      setTasks((prev) => [...prev, task]);
    };
    return () => {
      delete (window as any).tasksAddTask;
    };
  }, []);

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
    import('sonner').then(({ toast }) => {
      toast.success('Taak aangemaakt!', {
        description: `Taak "${data.title}" is succesvol aangemaakt.`,
      });
    });
  };

  const handleEditTaskSave = (updatedTask: any) => {
    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    import('sonner').then(({ toast }) => {
      toast.success('Taak bijgewerkt!', {
        description: 'De wijzigingen zijn opgeslagen.',
      });
    });
  };

  const handleEditTask = (task: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingTask(task);
    setIsEditTaskModalOpen(true);
    setIsTaskDetailModalOpen(false);
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setIsTaskDetailModalOpen(true);
  };

  const handleDeleteTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Weet je zeker dat je deze taak wilt verwijderen?')) {
      setTasks(tasks.filter((t) => t.id !== taskId));
      import('sonner').then(({ toast }) => {
        toast.success('Taak verwijderd!');
      });
    }
  };

  const tasksWithDetails = tasks.map((task) => ({
    ...task,
    customer: mockCustomers.find((c) => c.id === task.customerId),
    assignee: mockUsers.find((u) => u.id === task.assignedTo),
  }));

  const filteredTasks = tasksWithDetails.filter((task) => {
  const customer = getTaskCustomer(task); // <— hier declareren

  const matchesSearch =
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer && getCustomerFullName(customer).toLowerCase().includes(searchTerm.toLowerCase()));

  let matchesStatus = true;
  if (filterStatus === 'all') {
    matchesStatus = true;
  } else if (filterStatus === 'OPENSTAAND') {
    matchesStatus = task.status !== 'DONE' && task.status !== 'CANCELED';
  } else {
    matchesStatus = task.status === filterStatus;
  }

  const matchesAssignee = filterAssignee === 'all' || task.assignedTo === filterAssignee;

  return matchesSearch && matchesStatus && matchesAssignee;
});

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2">Taken</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Overzicht van alle taken uit het systeem
          </p>
        </div>
        <Button
          onClick={() => setIsNewTaskModalOpen(true)}
          className="rounded-xl hover:scale-105 transition-transform"
          style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nieuwe taak
        </Button>
      </div>

      {/* Search and Filters */}
      <div
        className="p-6 rounded-xl shadow-sm space-y-4"
        style={{ backgroundColor: 'var(--panel)' }}
      >
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
              style={{ color: 'var(--text-secondary)' }}
            />
            <Input
              placeholder="Zoek op titel of klant..."
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
              <SelectItem value="OPENSTAAND">Openstaand</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="IN_PROGRESS">Bezig</SelectItem>
              <SelectItem value="DONE">Afgerond</SelectItem>
              <SelectItem value="CANCELED">Geannuleerd</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterAssignee} onValueChange={setFilterAssignee}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Alle medewerkers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle medewerkers</SelectItem>
              {mockUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                  Titel
                </th>
                <th className="px-6 py-4 text-left" style={{ color: 'var(--text-secondary)' }}>
                  Klant
                </th>
                <th className="px-6 py-4 text-left" style={{ color: 'var(--text-secondary)' }}>
                  Status
                </th>
                <th className="px-6 py-4 text-left" style={{ color: 'var(--text-secondary)' }}>
                  Deadline
                </th>
                <th className="px-6 py-4 text-left" style={{ color: 'var(--text-secondary)' }}>
                  Toegewezen aan
                </th>
                <th className="px-6 py-4 text-left" style={{ color: 'var(--text-secondary)' }}>
                  Acties
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr
                  key={task.id}
                  className="border-t hover:bg-opacity-50 cursor-pointer"
                  style={{ borderColor: 'var(--border)' }}
                  onClick={() => handleTaskClick(task)}
                >
                  <td className="px-6 py-4">
                    <div>
                      <p style={{ color: 'var(--text-primary)' }}>{task.title}</p>
                      {task.notes && (
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                          {task.notes}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
  {(() => {
    const customer = getTaskCustomer(task);
    if (!customer) return <span style={{ color: 'var(--text-secondary)' }}>Onbekend</span>;
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNavigate('customer-detail', customer.id);
        }}
        className="hover:underline"
        style={{ color: 'var(--accent)' }}
      >
        {getCustomerFullName(customer)}
      </button>
    );
  })()}
</td>

                  <td className="px-6 py-4">
                    <Badge
                      variant="secondary"
                      className="rounded-full inline-flex items-center gap-2"
                      style={{
                        backgroundColor: getStatusColor(task.status) + '20',
                        color: getStatusColor(task.status),
                      }}
                    >
                      {getStatusIcon(task.status)}
                      {getStatusLabel(task.status)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4" style={{ color: 'var(--text-secondary)' }}>
                    {task.deadline ? formatDate(task.deadline) : '-'}
                  </td>
                  <td className="px-6 py-4" style={{ color: 'var(--text-primary)' }}>
                    {task.assignee?.name || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleEditTask(task, e)}
                        className="p-2 rounded-lg hover:scale-110 transition-transform"
                        style={{ color: 'var(--accent)' }}
                        title="Taak bewerken"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteTask(task.id, e)}
                        className="p-2 rounded-lg hover:scale-110 transition-transform"
                        style={{ color: 'var(--error)' }}
                        title="Taak verwijderen"
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

        {filteredTasks.length === 0 && (
          <div className="p-12 text-center" style={{ color: 'var(--text-secondary)' }}>
            <p>Geen taken gevonden</p>
          </div>
        )}
      </div>

      {/* New Task Modal */}
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        onSave={handleNewTaskSave}
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
          onEdit={() => handleEditTask(selectedTask)}
          onNavigateToCustomer={() => {
  setIsTaskDetailModalOpen(false);
  const customer = getTaskCustomer(selectedTask);
  if (customer) {
    onNavigate('customer-detail', customer.id);
  }
}}

        />
      )}
    </div>
  );
}

