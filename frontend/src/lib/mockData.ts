// Mock data for VOS CRM

export type CustomerType = 'PERSON' | 'ORGANIZATION';
export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELED';
export type UserRole = 'BEHEERDER' | 'MEDEWERKER' | 'KLANT';

export interface PipelineStage {
  id: string;
  name: string;
  label: string;
  color: string;
  order: number;
}

export interface Customer {
  id: string;
  type: CustomerType;
  status: string; // Now refers to pipeline stage name
  lastActivity?: string;
  // Person fields
  firstName?: string;
  middleName?: string;
  lastName?: string;
  // Organization fields
  companyName?: string;
  kvk?: string;
  btw?: string;
  // Common fields
  email: string;
  phone?: string;
  postalCode?: string;
  houseNumber?: string;
  houseNumberAddition?: string;
  street?: string;
  city?: string;
  createdAt: string;
}

export interface ContactPerson {
  id: string;
  customerId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: string;
}

export interface Task {
  id: string;
  title: string;
  notes?: string;
  status: TaskStatus;
  deadline?: string;
  customerId: string;
  assignedTo?: string;
  createdAt: string;
}

export interface Note {
  id: string;
  content: string;
  customerId: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface Document {
  id: string;
  filename: string;
  size: number;
  customerId: string;
  uploadedAt: string;
  driver: 'disk' | 's3';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export const mockUsers: User[] = [
  { id: '1', name: 'Anita van Soest', email: 'anita@voscrm.nl', role: 'BEHEERDER' },
  { id: '2', name: 'Rick van Soest', email: 'rick@voscrm.nl', role: 'MEDEWERKER' },
  { id: '3', name: 'Max Visser', email: 'max@example.nl', role: 'KLANT' },
];

export const defaultPipelineStages: PipelineStage[] = [
  { id: '1', name: 'NIEUW', label: 'Nieuw', color: '#94A3B8', order: 1 },
  { id: '2', name: 'CONTACT_GELEGD', label: 'Contact gelegd', color: '#3B82F6', order: 2 },
  { id: '3', name: 'OFFERTE_GESTUURD', label: 'Offerte gestuurd', color: '#8B5CF6', order: 3 },
  { id: '4', name: 'ONDERHANDELING', label: 'Onderhandeling', color: '#F59E0B', order: 4 },
  { id: '5', name: 'AFGEROND', label: 'Afgerond', color: '#10B981', order: 5 },
];

export const mockCustomers: Customer[] = [
  {
    id: '1',
    type: 'ORGANIZATION',
    status: 'AFGEROND',
    lastActivity: '2025-10-14T10:15:00Z',
    companyName: 'Bakkerij De Lekkerste',
    kvk: '12345678',
    btw: 'NL123456789B01',
    email: 'info@delekkerste.nl',
    phone: '+31 20 123 4567',
    postalCode: '1012 AB',
    houseNumber: '45',
    street: 'Damstraat',
    city: 'Amsterdam',
    createdAt: '2025-09-15T10:30:00Z',
  },
  {
    id: '2',
    type: 'PERSON',
    status: 'AFGEROND',
    lastActivity: '2025-10-13T15:30:00Z',
    firstName: 'Sophie',
    middleName: 'de',
    lastName: 'Vries',
    email: 'sophie.devries@email.nl',
    phone: '+31 6 12345678',
    postalCode: '3011 AD',
    houseNumber: '12',
    street: 'Coolsingel',
    city: 'Rotterdam',
    createdAt: '2025-10-01T14:20:00Z',
  },
  {
    id: '3',
    type: 'ORGANIZATION',
    status: 'OFFERTE_GESTUURD',
    lastActivity: '2025-10-11T14:00:00Z',
    companyName: 'Tech Solutions BV',
    kvk: '87654321',
    btw: 'NL987654321B01',
    email: 'contact@techsolutions.nl',
    phone: '+31 30 987 6543',
    postalCode: '3511 EP',
    houseNumber: '89',
    street: 'Oudegracht',
    city: 'Utrecht',
    createdAt: '2025-08-20T09:15:00Z',
  },
  {
    id: '4',
    type: 'PERSON',
    status: 'NIEUW',
    lastActivity: '2025-10-10T16:45:00Z',
    firstName: 'Lars',
    lastName: 'Janssen',
    email: 'lars.janssen@email.nl',
    phone: '+31 6 98765432',
    postalCode: '5611 DB',
    houseNumber: '34',
    street: 'Stratumseind',
    city: 'Eindhoven',
    createdAt: '2025-10-10T11:45:00Z',
  },
  {
    id: '5',
    type: 'ORGANIZATION',
    status: 'AFGEROND',
    lastActivity: '2025-10-09T11:00:00Z',
    companyName: 'Groene Vingers Tuincentrum',
    kvk: '11223344',
    btw: 'NL112233445B01',
    email: 'info@groenevingers.nl',
    phone: '+31 50 111 2222',
    postalCode: '9711 LM',
    houseNumber: '67',
    street: 'Herestraat',
    city: 'Groningen',
    createdAt: '2025-07-12T16:00:00Z',
  },
  {
    id: '6',
    type: 'PERSON',
    status: 'CONTACT_GELEGD',
    lastActivity: '2025-10-12T09:20:00Z',
    firstName: 'Emma',
    middleName: 'van',
    lastName: 'Dijk',
    email: 'emma.vandijk@email.nl',
    phone: '+31 6 55544433',
    postalCode: '2011 HZ',
    houseNumber: '23',
    street: 'Grote Markt',
    city: 'Haarlem',
    createdAt: '2025-09-28T13:30:00Z',
  },
  {
    id: '7',
    type: 'ORGANIZATION',
    status: 'ONDERHANDELING',
    lastActivity: '2025-10-15T11:30:00Z',
    companyName: 'Bouwbedrijf Jansen & Zonen',
    kvk: '55667788',
    btw: 'NL556677889B01',
    email: 'info@jansenzonen.nl',
    phone: '+31 40 555 6677',
    postalCode: '5611 AB',
    houseNumber: '101',
    street: 'Vestdijk',
    city: 'Eindhoven',
    createdAt: '2025-09-05T08:00:00Z',
  },
  {
    id: '8',
    type: 'PERSON',
    status: 'OFFERTE_GESTUURD',
    lastActivity: '2025-10-14T16:00:00Z',
    firstName: 'Michael',
    lastName: 'Peters',
    email: 'michael.peters@email.nl',
    phone: '+31 6 77788899',
    postalCode: '2514 AB',
    houseNumber: '56',
    street: 'Noordeinde',
    city: 'Den Haag',
    createdAt: '2025-10-08T10:00:00Z',
  },
];

export const mockContactPersons: ContactPerson[] = [
  {
    id: '1',
    customerId: '1',
    firstName: 'Jan',
    lastName: 'Bakker',
    email: 'jan@delekkerste.nl',
    phone: '+31 6 11112222',
    role: 'Eigenaar',
  },
  {
    id: '2',
    customerId: '1',
    firstName: 'Marie',
    lastName: 'Bakker',
    email: 'marie@delekkerste.nl',
    phone: '+31 6 22223333',
    role: 'Financieel Manager',
  },
  {
    id: '3',
    customerId: '3',
    firstName: 'Thomas',
    middleName: 'van',
    lastName: 'Berg',
    email: 'thomas@techsolutions.nl',
    phone: '+31 6 33334444',
    role: 'CTO',
  },
  {
    id: '4',
    customerId: '5',
    firstName: 'Lisa',
    lastName: 'Vermeulen',
    email: 'lisa@groenevingers.nl',
    phone: '+31 6 44445555',
    role: 'Inkoper',
  },
];

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Offerte opstellen voor website redesign',
    notes: 'Klant wil moderne uitstraling met webshop functionaliteit',
    status: 'IN_PROGRESS',
    deadline: '2025-10-20',
    customerId: '3',
    assignedTo: '2',
    createdAt: '2025-10-10T09:00:00Z',
  },
  {
    id: '2',
    title: 'Belastingaangifte Q3 controleren',
    notes: 'Controleer BTW aangifte en zorg voor goedkeuring',
    status: 'OPEN',
    deadline: '2025-10-18',
    customerId: '1',
    assignedTo: '1',
    createdAt: '2025-10-12T10:30:00Z',
  },
  {
    id: '3',
    title: 'Contractverlenging bespreken',
    status: 'DONE',
    deadline: '2025-10-05',
    customerId: '2',
    assignedTo: '2',
    createdAt: '2025-09-28T14:00:00Z',
  },
  {
    id: '4',
    title: 'Kennismakingsgesprek plannen',
    notes: 'Nieuwe klant, eerste afspraak inplannen voor intake',
    status: 'OPEN',
    deadline: '2025-10-17',
    customerId: '4',
    assignedTo: '1',
    createdAt: '2025-10-14T11:20:00Z',
  },
  {
    id: '5',
    title: 'Jaarverslag 2024 opstellen',
    status: 'CANCELED',
    customerId: '5',
    assignedTo: '2',
    createdAt: '2025-10-01T08:00:00Z',
  },
];

export const mockNotes: Note[] = [
  {
    id: '1',
    content: 'Telefoongesprek gehad over uitbreiding van diensten. Klant is tevreden en wil graag doorgroeien.',
    customerId: '1',
    authorId: '1',
    authorName: 'Anita van Soest',
    createdAt: '2025-10-14T10:15:00Z',
  },
  {
    id: '2',
    content: 'E-mail ontvangen met vraag over facturatie. Uitleg gegeven over betalingstermijnen.',
    customerId: '2',
    authorId: '2',
    authorName: 'Rick van Soest',
    createdAt: '2025-10-13T15:30:00Z',
  },
  {
    id: '3',
    content: 'Meeting gehad op kantoor. Besproken: nieuwe website, SEO strategie en social media campagne.',
    customerId: '3',
    authorId: '1',
    authorName: 'Anita van Soest',
    createdAt: '2025-10-11T14:00:00Z',
  },
  {
    id: '4',
    content: 'Klant heeft aangegeven interesse te hebben in extra dienstverlening. Follow-up gepland.',
    customerId: '4',
    authorId: '2',
    authorName: 'Rick van Soest',
    createdAt: '2025-10-10T16:45:00Z',
  },
  {
    id: '5',
    content: 'Contractonderhandelingen afgerond. Klant akkoord met voorwaarden.',
    customerId: '5',
    authorId: '1',
    authorName: 'Anita van Soest',
    createdAt: '2025-10-09T11:00:00Z',
  },
  {
    id: '6',
    content: 'Vraag ontvangen over factuurnummer 2024-089. Verduidelijking gegeven.',
    customerId: '1',
    authorId: '2',
    authorName: 'Rick van Soest',
    createdAt: '2025-10-08T09:30:00Z',
  },
];

export const mockDocuments: Document[] = [
  {
    id: '1',
    filename: 'Contract_2025.pdf',
    size: 245680,
    customerId: '1',
    uploadedAt: '2025-09-20T10:00:00Z',
    driver: 'disk',
  },
  {
    id: '2',
    filename: 'Offerte_Website.pdf',
    size: 156234,
    customerId: '3',
    uploadedAt: '2025-10-11T14:30:00Z',
    driver: 's3',
  },
  {
    id: '3',
    filename: 'BTW_Aangifte_Q3.xlsx',
    size: 89456,
    customerId: '1',
    uploadedAt: '2025-10-12T09:15:00Z',
    driver: 'disk',
  },
  {
    id: '4',
    filename: 'Identiteitsbewijs_Sophie.pdf',
    size: 1245678,
    customerId: '2',
    uploadedAt: '2025-10-02T11:00:00Z',
    driver: 's3',
  },
  {
    id: '5',
    filename: 'Jaarverslag_2024.pdf',
    size: 3456789,
    customerId: '5',
    uploadedAt: '2025-10-05T16:20:00Z',
    driver: 'disk',
  },
];

export function getCustomerFullName(customer: Customer): string {
  if (customer.type === 'ORGANIZATION') {
    return customer.companyName || 'Onbekende organisatie';
  }
  const parts = [
    customer.firstName,
    customer.middleName,
    customer.lastName,
  ].filter(Boolean);
  return parts.join(' ') || 'Onbekende persoon';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
