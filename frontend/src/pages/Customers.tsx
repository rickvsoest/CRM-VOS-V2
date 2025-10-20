import { useState } from 'react';
import * as React from 'react';
import { Search, Plus, Download, Pencil, Trash2, Building2, User, Mail, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { SendAccountInviteModal } from '../components/modals/SendAccountInviteModal';
import { mockCustomers, getCustomerFullName, formatDateTime, defaultPipelineStages } from '../lib/mockData';
import { Customer } from "/src/lib/mockData.ts";

interface CustomersProps {
  onNavigate: (page: string, id?: string) => void;
  onOpenNewCustomer: () => void;
  onAddToPipeline?: (customer: Customer) => void;
}

export function Customers({ onNavigate, onOpenNewCustomer, onAddToPipeline }: CustomersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState<'all' | 'organizations' | 'persons'>('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [customers, setCustomers] = React.useState(mockCustomers);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Register global callback for adding customers
  React.useEffect(() => {
    (window as any).customersAddCustomer = (customer: any) => {
      setCustomers((prev) => [...prev, customer]);
    };
    return () => {
      delete (window as any).customersAddCustomer;
    };
  }, []);

  const handleSendInvite = (data: { email: string; role: string; customMessage?: string }) => {
    console.log('Sending account invite:', data);
    // In een echte app zou hier een API call komen
    // Voor nu tonen we een toast notificatie
    import('sonner').then(({ toast }) => {
      toast.success('Uitnodiging verzonden!', {
        description: `Account uitnodiging verzonden naar ${data.email}`,
      });
    });
  };

  const handleAddToPipeline = (customer: Customer, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToPipeline) {
      onAddToPipeline(customer);
      import('sonner').then(({ toast }) => {
        toast.success('Klant toegevoegd aan pipeline!', {
          description: `${getCustomerFullName(customer)} is toegevoegd aan de pipeline.`,
        });
      });
    }
  };

  // Get unique cities
  const cities = Array.from(new Set(mockCustomers.map((c) => c.city).filter(Boolean)));

  // Filter customers
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      getCustomerFullName(customer).toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.city?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCity = filterCity === 'all' || customer.city === filterCity;
    const matchesType = filterType === 'all' || customer.type === filterType;
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
    
    // Tab filtering
    const matchesTab = 
      activeTab === 'all' ||
      (activeTab === 'organizations' && customer.type === 'ORGANIZATION') ||
      (activeTab === 'persons' && customer.type === 'PERSON');

    return matchesSearch && matchesCity && matchesType && matchesStatus && matchesTab;
  });

  const organizationsCount = customers.filter((c) => c.type === 'ORGANIZATION').length;
  const personsCount = customers.filter((c) => c.type === 'PERSON').length;

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / pageSize);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1>Klanten</h1>
        <Button
          onClick={onOpenNewCustomer}
          className="rounded-xl hover:scale-105 transition-transform"
          style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nieuwe klant
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="all" className="rounded-xl">
            Alle ({customers.length})
          </TabsTrigger>
          <TabsTrigger value="organizations" className="rounded-xl">
            <Building2 className="h-4 w-4 mr-2" />
            Organisaties ({organizationsCount})
          </TabsTrigger>
          <TabsTrigger value="persons" className="rounded-xl">
            <User className="h-4 w-4 mr-2" />
            Particulieren ({personsCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {/* Search and Filters */}
          <div
            className="p-6 rounded-xl shadow-sm space-y-4 mb-6"
            style={{ backgroundColor: 'var(--panel)' }}
          >
            <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
              style={{ color: 'var(--text-secondary)' }}
            />
            <Input
              placeholder="Zoek op naam, e-mail of plaats"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterCity} onValueChange={setFilterCity}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Alle steden" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle steden</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city!}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Alle types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle types</SelectItem>
              <SelectItem value="PERSON">Persoon</SelectItem>
              <SelectItem value="ORGANIZATION">Organisatie</SelectItem>
            </SelectContent>
          </Select>
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
          <Button variant="outline" className="rounded-xl">
            <Download className="h-4 w-4 mr-2" />
            CSV Export
          </Button>
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
                  Naam
                </th>
                <th className="px-6 py-4 text-left" style={{ color: 'var(--text-secondary)' }}>
                  E-mail
                </th>
                <th className="px-6 py-4 text-left" style={{ color: 'var(--text-secondary)' }}>
                  Telefoon
                </th>
                <th className="px-6 py-4 text-left" style={{ color: 'var(--text-secondary)' }}>
                  Stad
                </th>
                <th className="px-6 py-4 text-left" style={{ color: 'var(--text-secondary)' }}>
                  Type
                </th>
                <th className="px-6 py-4 text-left" style={{ color: 'var(--text-secondary)' }}>
                  Status
                </th>
                <th className="px-6 py-4 text-left" style={{ color: 'var(--text-secondary)' }}>
                  Aangemaakt op
                </th>
                <th className="px-6 py-4 text-left" style={{ color: 'var(--text-secondary)' }}>
                  Acties
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  onClick={() => onNavigate('customer-detail', customer.id)}
                  className="border-t hover:bg-opacity-50 cursor-pointer"
                  style={{
                    borderColor: 'var(--border)',
                  }}
                >
                  <td className="px-6 py-4" style={{ color: 'var(--text-primary)' }}>
                    {getCustomerFullName(customer)}
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={`mailto:${customer.email}`}
                      className="hover:underline"
                      style={{ color: 'var(--accent)' }}
                    >
                      {customer.email}
                    </a>
                  </td>
                  <td className="px-6 py-4" style={{ color: 'var(--text-secondary)' }}>
                    {customer.phone || '-'}
                  </td>
                  <td className="px-6 py-4" style={{ color: 'var(--text-primary)' }}>
                    {customer.city}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant="secondary"
                      className="rounded-full"
                      style={{
                        backgroundColor:
                          customer.type === 'PERSON' ? '#3B82F620' : '#10B98120',
                        color: customer.type === 'PERSON' ? '#3B82F6' : '#10B981',
                      }}
                    >
                      {customer.type === 'PERSON' ? 'Persoon' : 'Organisatie'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant="secondary"
                      className="rounded-full"
                      style={{
                        backgroundColor:
                          defaultPipelineStages.find((s) => s.name === customer.status)?.color +
                            '20' || '#6B728020',
                        color:
                          defaultPipelineStages.find((s) => s.name === customer.status)?.color ||
                          '#6B7280',
                      }}
                    >
                      {defaultPipelineStages.find((s) => s.name === customer.status)?.label ||
                        customer.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4" style={{ color: 'var(--text-secondary)' }}>
                    {formatDateTime(customer.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(customer);
                          setIsInviteModalOpen(true);
                        }}
                        className="p-2 rounded-lg hover:scale-110 transition-transform"
                        style={{ color: 'var(--accent)' }}
                        title="Account uitnodiging verzenden"
                      >
                        <Mail className="h-4 w-4" />
                      </button>
                      {onAddToPipeline && (
                        <button
                          onClick={(e) => handleAddToPipeline(customer, e)}
                          className="p-2 rounded-lg hover:scale-110 transition-transform"
                          style={{ color: '#10B981' }}
                          title="Toevoegen aan pipeline"
                        >
                          <TrendingUp className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Edit action
                        }}
                        className="p-2 rounded-lg hover:scale-110 transition-transform"
                        style={{ color: 'var(--text-secondary)' }}
                        title="Bewerken"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Weet je zeker dat je deze klant wilt verwijderen?')) {
                            setCustomers(customers.filter(c => c.id !== customer.id));
                            import('sonner').then(({ toast }) => {
                              toast.success('Klant verwijderd!');
                            });
                          }
                        }}
                        className="p-2 rounded-lg hover:scale-110 transition-transform"
                        style={{ color: 'var(--error)' }}
                        title="Verwijderen"
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

        {/* Pagination */}
        <div
          className="px-6 py-4 flex items-center justify-between border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Rijen per pagina:
            </span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(parseInt(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="rounded-xl"
            >
              Vorige
            </Button>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Pagina {currentPage} van {totalPages} (Totaal {filteredCustomers.length} klanten)
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="rounded-xl"
            >
              Volgende
            </Button>
          </div>
        </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Send Account Invite Modal */}
      {selectedCustomer && (
        <SendAccountInviteModal
          isOpen={isInviteModalOpen}
          onClose={() => {
            setIsInviteModalOpen(false);
            setSelectedCustomer(null);
          }}
          customer={selectedCustomer}
          onSend={handleSendInvite}
        />
      )}
    </div>
  );
}

