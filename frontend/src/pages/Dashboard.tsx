import { useState, useEffect } from 'react';
import { Users, CheckSquare, FileText, Mail, TrendingUp, Building2, Calendar, AlertCircle, Activity, Edit, Clock, Percent, UserCheck, PieChart, BarChart3, ArrowUpRight, ArrowDownRight, Plus, Download, Settings } from 'lucide-react';
import { mockCustomers, mockTasks, mockDocuments, mockNotes, getCustomerFullName, formatDateTime, formatDate, formatFileSize, mockUsers } from '../lib/mockData';
import type { DashboardKPI } from '../components/modals/DashboardEditorModal';
import { DashboardEditorModal } from '../components/modals/DashboardEditorModal';
import { DashboardLayoutEditor} from '../components/modals/DashboardLayoutEditor';
import type { DashboardWidget } from '../components/modals/DashboardLayoutEditor';
import { MyTasksWidget } from '../components/modals/MyTasksWidget';
import { TaskDetailModal } from '../components/modals/TaskDetailModal';
import { DocumentPreviewModal } from '../components/modals/DocumentPreviewModal';
import { NoteDetailModal } from '../components/modals/NoteDetailModal';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { BarChart, Bar, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  userName: string;
  onNavigate: (page: string, id?: string) => void;
  currentUserId?: string;
}

const defaultKPIs: DashboardKPI[] = [
  { id: '1', type: 'total_customers', label: 'Totaal klanten', order: 0 },
  { id: '2', type: 'leads_pipeline', label: 'Leads in pipeline', order: 1 },
  { id: '3', type: 'open_tasks', label: 'Open taken', order: 2 },
  { id: '4', type: 'new_documents_week', label: 'Nieuwe documenten deze week', order: 3 },
];

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

export function Dashboard({ userName, onNavigate, currentUserId }: DashboardProps) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isLayoutEditorOpen, setIsLayoutEditorOpen] = useState(false);
  const [dashboardKPIs, setDashboardKPIs] = useState<DashboardKPI[]>(() => {
    const saved = localStorage.getItem('vos-dashboard-kpis');
    return saved ? JSON.parse(saved) : defaultKPIs;
  });
  const [dashboardWidgets, setDashboardWidgets] = useState<DashboardWidget[]>(() => {
    const saved = localStorage.getItem('vos-dashboard-widgets');
    return saved ? JSON.parse(saved) : defaultWidgets;
  });

  // Modal states
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [isDocumentPreviewOpen, setIsDocumentPreviewOpen] = useState(false);
  const [isNoteDetailOpen, setIsNoteDetailOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('vos-dashboard-kpis', JSON.stringify(dashboardKPIs));
  }, [dashboardKPIs]);

  useEffect(() => {
    localStorage.setItem('vos-dashboard-widgets', JSON.stringify(dashboardWidgets));
  }, [dashboardWidgets]);

  const recentCustomers = [...mockCustomers].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  const getNewCustomersPerMonth = () => {
    const months = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
    const currentDate = new Date();
    const data = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const count = mockCustomers.filter((c) => {
        const createdDate = new Date(c.createdAt);
        return createdDate.getMonth() === date.getMonth() && createdDate.getFullYear() === date.getFullYear();
      }).length;
      
      data.push({
        month: months[date.getMonth()],
        count: count,
      });
    }
    
    return data;
  };

  const getTasksCompletedPerWeek = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7));
      
      const completed = mockTasks.filter((t) => {
        if (t.status !== 'DONE') return false;
        const createdDate = new Date(t.createdAt);
        return createdDate >= weekStart && createdDate < new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      }).length;
      
      data.push({
        week: `W${Math.ceil((weekStart.getDate()) / 7)}`,
        completed: completed || Math.floor(Math.random() * 10) + 5, // Mock data for demo
      });
    }
    
    return data;
  };

  const getCustomerTypeDistribution = () => {
    const personCount = mockCustomers.filter((c) => c.type === 'PERSON').length;
    const orgCount = mockCustomers.filter((c) => c.type === 'ORGANIZATION').length;
    
    return [
      { name: 'Particulieren', value: personCount, color: '#3B82F6' },
      { name: 'Organisaties', value: orgCount, color: '#10B981' },
    ];
  };

  const getLeadsPerPhase = () => {
    const phases = [
      { name: 'NIEUW', label: 'Nieuw' },
      { name: 'CONTACT_GELEGD', label: 'Contact' },
      { name: 'OFFERTE_GESTUURD', label: 'Offerte' },
      { name: 'ONDERHANDELING', label: 'Onderhandeling' },
      { name: 'AFGEROND', label: 'Afgerond' },
    ];
    
    return phases.map((phase) => ({
      phase: phase.label,
      count: mockCustomers.filter((c) => c.status === phase.name).length,
    }));
  };

  const getUpcomingTasks = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return mockTasks
      .filter((t) => {
        if (t.status === 'DONE' || t.status === 'CANCELED') return false;
        if (!t.deadline) return false;
        const deadline = new Date(t.deadline);
        return deadline >= today && deadline <= nextWeek;
      })
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());
  };

  const getRecentDocuments = () => {
    return [...mockDocuments]
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(0, 3);
  };

  const getRecentNotes = () => {
    return [...mockNotes]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  };

  const getKPIData = (type: string) => {
    const now = new Date();
    const totalCustomers = mockCustomers.length;
    const personCustomers = mockCustomers.filter((c) => c.type === 'PERSON').length;
    const organizationCustomers = mockCustomers.filter((c) => c.type === 'ORGANIZATION').length;
    const leadsInPipeline = mockCustomers.filter((c) => c.status !== 'AFGEROND').length;
    
    // Nieuwe klanten deze maand vs vorige maand
    const thisMonthCustomers = mockCustomers.filter((c) => {
      const createdDate = new Date(c.createdAt);
      return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
    }).length;
    const lastMonthCustomers = mockCustomers.filter((c) => {
      const createdDate = new Date(c.createdAt);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return createdDate.getMonth() === lastMonth.getMonth() && createdDate.getFullYear() === lastMonth.getFullYear();
    }).length;
    const customerGrowth = lastMonthCustomers > 0 ? ((thisMonthCustomers - lastMonthCustomers) / lastMonthCustomers * 100) : 0;
    
    // Conversieratio
    const totalLeads = mockCustomers.length;
    const convertedLeads = mockCustomers.filter((c) => c.status === 'AFGEROND').length;
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100) : 0;
    
    // Gemiddelde doorlooptijd lead (dagen van creatie tot afgerond)
    const completedCustomers = mockCustomers.filter((c) => c.status === 'AFGEROND' && c.lastActivity);
    const totalLeadTime = completedCustomers.reduce((sum, c) => {
      const created = new Date(c.createdAt);
      const completed = new Date(c.lastActivity!);
      const days = Math.floor((completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);
    const avgLeadTime = completedCustomers.length > 0 ? Math.round(totalLeadTime / completedCustomers.length) : 0;
    
    // Verdeling klanttype
    const personPercentage = totalCustomers > 0 ? Math.round((personCustomers / totalCustomers) * 100) : 0;
    const orgPercentage = 100 - personPercentage;
    
    // Taken
    const myTasks = currentUserId 
      ? mockTasks.filter((t) => t.assignedTo === currentUserId && (t.status === 'OPEN' || t.status === 'IN_PROGRESS')).length
      : 0;
    const myTasksTotal = currentUserId 
      ? mockTasks.filter((t) => t.assignedTo === currentUserId).length
      : 0;
    const openTasks = mockTasks.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
    const overdueTasks = mockTasks.filter((t) => {
      if (!t.deadline) return false;
      return new Date(t.deadline) < new Date() && t.status !== 'DONE';
    }).length;
    
    // Taken per status
    const tasksByStatus = {
      OPEN: mockTasks.filter((t) => t.status === 'OPEN').length,
      IN_PROGRESS: mockTasks.filter((t) => t.status === 'IN_PROGRESS').length,
      DONE: mockTasks.filter((t) => t.status === 'DONE').length,
      CANCELED: mockTasks.filter((t) => t.status === 'CANCELED').length,
    };
    
    // Gemiddelde doorlooptijd taak
    const completedTasks = mockTasks.filter((t) => t.status === 'DONE');
    const totalTaskTime = completedTasks.reduce((sum, t) => {
      const created = new Date(t.createdAt);
      const completed = new Date(); // Mock: we hebben geen completion date
      const days = Math.floor((completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);
    const avgTaskDuration = completedTasks.length > 0 ? Math.round(totalTaskTime / completedTasks.length) : 0;
    
    // Taken per medewerker
    const tasksPerEmployee = mockUsers
      .filter((u) => u.role === 'MEDEWERKER' || u.role === 'BEHEERDER')
      .map((user) => ({
        name: user.name.split(' ')[0],
        count: mockTasks.filter((t) => t.assignedTo === user.id).length,
      }))
      .sort((a, b) => b.count - a.count);
    
    // Notities deze week
    const thisWeekNotes = mockNotes.filter((n) => {
      const createdDate = new Date(n.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdDate > weekAgo;
    }).length;
    
    // Documenten deze week
    const thisWeekDocs = mockDocuments.filter((d) => {
      const uploadDate = new Date(d.uploadedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return uploadDate > weekAgo;
    }).length;
    
    // Afgeronde deals deze maand
    const thisMonthDeals = mockCustomers.filter((c) => {
      if (c.status !== 'AFGEROND') return false;
      const activityDate = new Date(c.lastActivity || c.createdAt);
      return activityDate.getMonth() === now.getMonth() && activityDate.getFullYear() === now.getFullYear();
    }).length;

    switch (type) {
      case 'total_customers':
        return {
          icon: <Users className="h-6 w-6" />,
          value: totalCustomers,
          subValue: `${personCustomers} personen · ${organizationCustomers} organisaties`,
          color: '#3B82F6',
          onClick: () => onNavigate('customers'),
        };
      case 'person_customers':
        return {
          icon: <Users className="h-6 w-6" />,
          value: personCustomers,
          color: '#3B82F6',
          onClick: () => onNavigate('customers'),
        };
      case 'organization_customers':
        return {
          icon: <Building2 className="h-6 w-6" />,
          value: organizationCustomers,
          color: '#10B981',
          onClick: () => onNavigate('customers'),
        };
      case 'new_customers_month':
        return {
          icon: customerGrowth >= 0 ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownRight className="h-6 w-6" />,
          value: thisMonthCustomers,
          subValue: `${customerGrowth >= 0 ? '+' : ''}${customerGrowth.toFixed(1)}% vs vorige maand`,
          color: customerGrowth >= 0 ? '#10B981' : '#EF4444',
          onClick: () => onNavigate('customers'),
        };
      case 'conversion_rate':
        return {
          icon: <Percent className="h-6 w-6" />,
          value: `${conversionRate.toFixed(1)}%`,
          subValue: `${convertedLeads} van ${totalLeads} leads omgezet`,
          color: '#8B5CF6',
          onClick: () => onNavigate('pipeline'),
        };
      case 'avg_lead_time':
        return {
          icon: <Clock className="h-6 w-6" />,
          value: avgLeadTime,
          subValue: `dagen gemiddeld`,
          color: '#F59E0B',
          onClick: () => onNavigate('pipeline'),
        };
      case 'customer_type_distribution':
        return {
          icon: <PieChart className="h-6 w-6" />,
          value: `${personPercentage}/${orgPercentage}`,
          subValue: `Personen / Organisaties (%)`,
          color: '#3B82F6',
          onClick: () => onNavigate('customers'),
        };
      case 'leads_pipeline':
        return {
          icon: <TrendingUp className="h-6 w-6" />,
          value: leadsInPipeline,
          color: '#8B5CF6',
          onClick: () => onNavigate('pipeline'),
        };
      case 'my_tasks':
        return {
          icon: <UserCheck className="h-6 w-6" />,
          value: myTasks,
          subValue: `${myTasksTotal} totaal toegewezen`,
          color: '#F59E0B',
          onClick: () => onNavigate('tasks'),
        };
      case 'open_tasks':
        return {
          icon: <CheckSquare className="h-6 w-6" />,
          value: openTasks,
          color: '#F59E0B',
          onClick: () => onNavigate('tasks'),
        };
      case 'tasks_by_status':
        return {
          icon: <BarChart3 className="h-6 w-6" />,
          value: mockTasks.length,
          subValue: `${tasksByStatus.OPEN} open · ${tasksByStatus.IN_PROGRESS} bezig · ${tasksByStatus.DONE} klaar`,
          color: '#3B82F6',
          onClick: () => onNavigate('tasks'),
        };
      case 'avg_task_duration':
        return {
          icon: <Clock className="h-6 w-6" />,
          value: avgTaskDuration,
          subValue: `dagen gemiddeld`,
          color: '#10B981',
          onClick: () => onNavigate('tasks'),
        };
      case 'tasks_per_employee':
        return {
          icon: <UserCheck className="h-6 w-6" />,
          value: tasksPerEmployee.length > 0 ? tasksPerEmployee[0].count : 0,
          subValue: tasksPerEmployee.length > 0 ? `hoogste: ${tasksPerEmployee[0].name}` : 'geen taken',
          color: '#8B5CF6',
          onClick: () => onNavigate('tasks'),
        };
      case 'new_notes_week':
        return {
          icon: <Mail className="h-6 w-6" />,
          value: thisWeekNotes,
          color: '#8B5CF6',
          onClick: () => onNavigate('notes'),
        };
      case 'overdue_tasks':
        return {
          icon: <AlertCircle className="h-6 w-6" />,
          value: overdueTasks,
          color: '#EF4444',
          onClick: () => onNavigate('tasks'),
        };
      case 'new_documents_week':
        return {
          icon: <FileText className="h-6 w-6" />,
          value: thisWeekDocs,
          color: '#10B981',
          onClick: () => onNavigate('documents'),
        };
      case 'completed_deals_month':
        return {
          icon: <TrendingUp className="h-6 w-6" />,
          value: thisMonthDeals,
          color: '#10B981',
          onClick: () => onNavigate('pipeline'),
        };
      case 'total_notes':
        return {
          icon: <Mail className="h-6 w-6" />,
          value: mockNotes.length,
          color: '#8B5CF6',
          onClick: () => onNavigate('notes'),
        };
      case 'recent_activity':
        return {
          icon: <Activity className="h-6 w-6" />,
          value: thisWeekDocs + openTasks,
          color: '#F59E0B',
          onClick: () => onNavigate('dashboard'),
        };
      default:
        return {
          icon: <Users className="h-6 w-6" />,
          value: 0,
          color: '#94A3B8',
          onClick: () => {},
        };
    }
  };

  const stats = dashboardKPIs
    .sort((a, b) => a.order - b.order)
    .map((kpi) => ({
      ...getKPIData(kpi.type),
      label: kpi.label,
    }));

  const getWidgetSize = (size?: string) => {
    switch (size) {
      case 'small':
        return 'lg:col-span-1';
      case 'medium':
        return 'lg:col-span-2';
      case 'large':
        return 'lg:col-span-3';
      case 'full':
        return 'lg:col-span-4';
      default:
        return 'lg:col-span-2';
    }
  };

  const renderWidget = (widget: DashboardWidget) => {
    if (!widget.visible) return null;

    const sizeClass = getWidgetSize(widget.size);

    // Render KPI widgets
    if (widget.type === 'kpi' && widget.subtype) {
      const kpiData = getKPIData(widget.subtype);
      return (
        <div
          key={widget.id}
          className={`${sizeClass} p-6 rounded-xl shadow-sm hover:scale-105 transition-transform cursor-pointer`}
          style={{ backgroundColor: 'var(--panel)' }}
          onClick={kpiData.onClick}
        >
          <div className="flex items-center justify-between mb-2">
            <div style={{ color: kpiData.color }}>{kpiData.icon}</div>
          </div>
          <h3 className="mb-1">{kpiData.value}</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {widget.label}
          </p>
        </div>
      );
    }

    // Render Chart widgets
    if (widget.type === 'chart') {
      if (widget.subtype === 'customers_per_month') {
        return (
          <div key={widget.id} className={`${sizeClass} p-6 rounded-xl shadow-sm`} style={{ backgroundColor: 'var(--panel)' }}>
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              <h2>{widget.label}</h2>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={getNewCustomersPerMonth()}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="var(--accent)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      }
      if (widget.subtype === 'tasks_per_week') {
        return (
          <div key={widget.id} className={`${sizeClass} p-6 rounded-xl shadow-sm`} style={{ backgroundColor: 'var(--panel)' }}>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              <h2>{widget.label}</h2>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={getTasksCompletedPerWeek()}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="week" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="completed" stroke="var(--accent)" strokeWidth={2} dot={{ fill: 'var(--accent)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      }
      if (widget.subtype === 'customer_type_distribution') {
        return (
          <div key={widget.id} className={`${sizeClass} p-6 rounded-xl shadow-sm`} style={{ backgroundColor: 'var(--panel)' }}>
            <div className="flex items-center gap-2 mb-6">
              <PieChart className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              <h2>{widget.label}</h2>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie data={getCustomerTypeDistribution()} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {getCustomerTypeDistribution().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        );
      }
      if (widget.subtype === 'leads_per_phase') {
        return (
          <div key={widget.id} className={`${sizeClass} p-6 rounded-xl shadow-sm`} style={{ backgroundColor: 'var(--panel)' }}>
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              <h2>{widget.label}</h2>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={getLeadsPerPhase()}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="phase" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="var(--accent)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      }
    }

    // Render Agenda widgets
    if (widget.type === 'agenda') {
      if (widget.subtype === 'upcoming_tasks') {
        return (
          <div 
            key={widget.id} 
            className={`${sizeClass} p-6 rounded-xl shadow-sm cursor-pointer hover:shadow-lg transition-shadow`} 
            style={{ backgroundColor: 'var(--panel)' }}
            onClick={() => onNavigate('tasks')}
          >
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              <h3>{widget.label}</h3>
            </div>
            <div className="space-y-3">
              {getUpcomingTasks().slice(0, 5).map((task) => (
                <div 
                  key={task.id} 
                  onClick={(e) => {
                    e.stopPropagation();
                    const taskWithDetails = {
                      ...task,
                      customer: mockCustomers.find((c) => c.id === task.customerId),
                      assignee: mockUsers.find((u) => u.id === task.assignedTo),
                    };
                    setSelectedTask(taskWithDetails);
                    setIsTaskDetailOpen(true);
                  }} 
                  className="p-3 rounded-lg cursor-pointer hover:shadow-md transition-all" 
                  style={{ backgroundColor: 'var(--background)' }}
                >
                  <p className="text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{task.title}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{task.deadline ? formatDate(task.deadline) : 'Geen deadline'}</p>
                </div>
              ))}
              {getUpcomingTasks().length === 0 && <p className="text-sm text-center py-4" style={{ color: 'var(--text-secondary)' }}>Geen openstaande taken</p>}
            </div>
          </div>
        );
      }
      if (widget.subtype === 'recent_documents') {
        return (
          <div 
            key={widget.id} 
            className={`${sizeClass} p-6 rounded-xl shadow-sm cursor-pointer hover:shadow-lg transition-shadow`} 
            style={{ backgroundColor: 'var(--panel)' }}
            onClick={() => onNavigate('documents')}
          >
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              <h3>{widget.label}</h3>
            </div>
            <div className="space-y-3">
              {getRecentDocuments().slice(0, 3).map((doc) => (
                <div 
                  key={doc.id} 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDocument(doc);
                    setIsDocumentPreviewOpen(true);
                  }} 
                  className="p-3 rounded-lg cursor-pointer hover:shadow-md transition-all" 
                  style={{ backgroundColor: 'var(--background)' }}
                >
                  <p className="text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{doc.filename}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{formatFileSize(doc.size)} • {formatDateTime(doc.uploadedAt)}</p>
                </div>
              ))}
            </div>
          </div>
        );
      }
      if (widget.subtype === 'recent_notes') {
        return (
          <div 
            key={widget.id} 
            className={`${sizeClass} p-6 rounded-xl shadow-sm cursor-pointer hover:shadow-lg transition-shadow`} 
            style={{ backgroundColor: 'var(--panel)' }}
            onClick={() => onNavigate('notes')}
          >
            <div className="flex items-center gap-2 mb-4">
              <Mail className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              <h3>{widget.label}</h3>
            </div>
            <div className="space-y-3">
              {getRecentNotes().slice(0, 3).map((note) => (
                <div 
                  key={note.id} 
                  onClick={(e) => {
                    e.stopPropagation();
                    const noteWithCustomer = {
                      ...note,
                      customer: mockCustomers.find((c) => c.id === note.customerId),
                    };
                    setSelectedNote(noteWithCustomer);
                    setIsNoteDetailOpen(true);
                  }} 
                  className="p-3 rounded-lg cursor-pointer hover:shadow-md transition-all" 
                  style={{ backgroundColor: 'var(--background)' }}
                >
                  <p className="text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{note.content.substring(0, 60)}...</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{note.authorName} • {formatDateTime(note.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        );
      }
      if (widget.subtype === 'my_tasks') {
        return (
          <div key={widget.id} className={`${sizeClass}`}>
            <MyTasksWidget 
              userId={currentUserId || '1'} 
              onNavigate={onNavigate}
              onTaskClick={(task) => {
                setSelectedTask(task);
                setIsTaskDetailOpen(true);
              }}
            />
          </div>
        );
      }
    }

    // Render Table widgets
    if (widget.type === 'table' && widget.subtype === 'recent_customers') {
      return (
        <div key={widget.id} className={`${sizeClass} p-6 rounded-xl shadow-sm`} style={{ backgroundColor: 'var(--panel)' }}>
          <div className="flex items-center justify-between mb-6">
            <h2>{widget.label}</h2>
            <Button onClick={() => onNavigate('customers')} className="rounded-xl hover:scale-105 transition-transform" style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}>
              <Plus className="h-4 w-4 mr-2" />
              Nieuwe klant
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--background)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm" style={{ color: 'var(--text-secondary)' }}>Naam</th>
                  <th className="px-4 py-3 text-left text-sm" style={{ color: 'var(--text-secondary)' }}>Stad</th>
                  <th className="px-4 py-3 text-left text-sm" style={{ color: 'var(--text-secondary)' }}>Type</th>
                  <th className="px-4 py-3 text-left text-sm" style={{ color: 'var(--text-secondary)' }}>Toegevoegd</th>
                </tr>
              </thead>
              <tbody>
                {recentCustomers.map((customer) => (
                  <tr key={customer.id} onClick={() => onNavigate('customer-detail', customer.id)} className="border-t cursor-pointer hover:bg-opacity-50" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}>
                          {getCustomerFullName(customer).charAt(0)}
                        </div>
                        <span style={{ color: 'var(--text-primary)' }}>{getCustomerFullName(customer)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{customer.city}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="rounded-full" style={{ backgroundColor: customer.type === 'PERSON' ? '#3B82F620' : '#10B98120', color: customer.type === 'PERSON' ? '#3B82F6' : '#10B981' }}>
                        {customer.type === 'PERSON' ? 'Persoon' : 'Organisatie'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{formatDate(customer.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Welkom terug, {userName}! 👋</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Hier is een overzicht van je CRM
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setIsEditorOpen(true)}
            variant="outline"
            className="rounded-xl hover:scale-105 transition-transform"
          >
            <Edit className="h-4 w-4 mr-2" />
            KPI's aanpassen
          </Button>
          <Button
            onClick={() => setIsLayoutEditorOpen(true)}
            className="rounded-xl hover:scale-105 transition-transform"
            style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}
          >
            <Settings className="h-4 w-4 mr-2" />
            Indeling aanpassen
          </Button>
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardWidgets
          .filter((w) => w.visible)
          .sort((a, b) => a.order - b.order)
          .map((widget) => renderWidget(widget))}
      </div>

      <DashboardEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        kpis={dashboardKPIs}
        onSave={setDashboardKPIs}
      />

      <DashboardLayoutEditor
        isOpen={isLayoutEditorOpen}
        onClose={() => setIsLayoutEditorOpen(false)}
        widgets={dashboardWidgets}
        onSave={setDashboardWidgets}
      />

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          isOpen={isTaskDetailOpen}
          onClose={() => {
            setIsTaskDetailOpen(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          onNavigateToCustomer={() => {
            setIsTaskDetailOpen(false);
            if (selectedTask.customer) {
              onNavigate('customer-detail', selectedTask.customerId);
            }
          }}
          onEdit={() => {
            setIsTaskDetailOpen(false);
            // Could open edit modal here if needed
          }}
        />
      )}

      {/* Document Preview Modal */}
      {selectedDocument && (
        <DocumentPreviewModal
          isOpen={isDocumentPreviewOpen}
          onClose={() => {
            setIsDocumentPreviewOpen(false);
            setSelectedDocument(null);
          }}
        filename={
          typeof selectedDocument === 'string'
            ? selectedDocument
            : (
                selectedDocument?.filename ??
                selectedDocument?.name ??
                selectedDocument?.originalName ??
                ''
              )
            }
          canDownload={true}
        />
      )}


      {/* Note Detail Modal */}
      {selectedNote && (
        <NoteDetailModal
          isOpen={isNoteDetailOpen}
          onClose={() => {
            setIsNoteDetailOpen(false);
            setSelectedNote(null);
          }}
          note={selectedNote}
          onNavigateToCustomer={() => {
            setIsNoteDetailOpen(false);
            if (selectedNote.customer) {
              onNavigate('customer-detail', selectedNote.customerId);
            }
          }}
        />
      )}
    </div>
  );
}
