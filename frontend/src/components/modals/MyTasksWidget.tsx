import { CheckSquare, Calendar } from 'lucide-react';
import { mockTasks, mockCustomers, getCustomerFullName, formatDate, mockUsers } from '../../lib/mockData';
import { Badge } from '../ui/badge';

interface MyTasksWidgetProps {
  userId: string;
  onNavigate: (page: string, id?: string) => void;
  onTaskClick?: (task: any) => void;
}

export function MyTasksWidget({ userId, onNavigate, onTaskClick }: MyTasksWidgetProps) {
  const myTasks = mockTasks
    .filter((t) => t.assignedTo === userId && t.status !== 'DONE' && t.status !== 'CANCELED')
    .sort((a, b) => {
      // Sort by deadline, then by status
      if (a.deadline && b.deadline) {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (a.deadline) return -1;
      if (b.deadline) return 1;
      return 0;
    })
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return { bg: '#F59E0B20', color: '#F59E0B' };
      case 'IN_PROGRESS':
        return { bg: '#3B82F620', color: '#3B82F6' };
      case 'DONE':
        return { bg: '#10B98120', color: '#10B981' };
      case 'CANCELED':
        return { bg: '#94A3B820', color: '#94A3B8' };
      default:
        return { bg: '#94A3B820', color: '#94A3B8' };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'Open';
      case 'IN_PROGRESS':
        return 'Bezig';
      case 'DONE':
        return 'Klaar';
      case 'CANCELED':
        return 'Geannuleerd';
      default:
        return status;
    }
  };

  if (myTasks.length === 0) {
    return (
      <div 
        className="p-6 rounded-xl shadow-sm h-full cursor-pointer hover:shadow-lg transition-shadow" 
        style={{ backgroundColor: 'var(--panel)' }}
        onClick={() => onNavigate('tasks')}
      >
        <div className="flex items-center gap-2 mb-4">
          <CheckSquare className="h-5 w-5" style={{ color: 'var(--accent)' }} />
          <h3>Mijn taken</h3>
        </div>
        <div
          className="p-8 text-center text-sm rounded-xl"
          style={{
            backgroundColor: 'var(--background)',
            color: 'var(--text-secondary)',
          }}
        >
          Je hebt momenteel geen taken toegewezen
        </div>
      </div>
    );
  }

  return (
    <div 
      className="p-6 rounded-xl shadow-sm h-full cursor-pointer hover:shadow-lg transition-shadow" 
      style={{ backgroundColor: 'var(--panel)' }}
      onClick={() => onNavigate('tasks')}
    >
      <div className="flex items-center gap-2 mb-4">
        <CheckSquare className="h-5 w-5" style={{ color: 'var(--accent)' }} />
        <h3>Mijn taken</h3>
      </div>
      <div className="space-y-3">
        {myTasks.map((task) => {
          const customer = mockCustomers.find((c) => c.id === task.customerId);
          const assignee = mockUsers.find((u) => u.id === task.assignedTo);
          const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'DONE';

          return (
            <div
              key={task.id}
              onClick={(e) => {
                e.stopPropagation();
                if (onTaskClick) {
                  const taskWithDetails = {
                    ...task,
                    customer,
                    assignee,
                  };
                  onTaskClick(taskWithDetails);
                } else {
                  onNavigate('tasks');
                }
              }}
              className="p-3 rounded-lg cursor-pointer hover:shadow-md transition-all"
              style={{ backgroundColor: 'var(--background)' }}
            >
              <p className="text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                {task.title}
              </p>
              {task.deadline && (
                <p className="text-xs" style={{ color: isOverdue ? '#EF4444' : 'var(--text-secondary)' }}>
                  {formatDate(task.deadline)}
                  {isOverdue && ' (verlopen)'}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
