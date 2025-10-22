// frontend/src/lib/api.ts
const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  'https://vos-crm-production.up.railway.app';

// --- Auth token helpers ---
export function getToken() {
  try {
    return localStorage.getItem('token') || '';
  } catch {
    return '';
  }
}
export function setToken(t: string) {
  try {
    localStorage.setItem('token', t);
  } catch {}
}
export function clearToken() {
  try {
    localStorage.removeItem('token');
  } catch {}
}

type Query = Record<string, string | number | boolean | undefined | null>;
function toQuery(params: Query = {}) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    usp.set(k, String(v));
  });
  const s = usp.toString();
  return s ? `?${s}` : '';
}

export async function apiFetch<T = any>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include', // voor cookie-based auth (als je dat later gebruikt)
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    const err = new Error(msg || `HTTP ${res.status}`);
    // @ts-ignore
    err.status = res.status;
    throw err;
  }

  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    return res as any;
  }
  return res.json();
}

// ---------------- Customers ----------------
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt?: string;
}

export interface CustomersResponse {
  items: Customer[];
  total: number;
  page: number;
  pageSize: number;
}

export function getApiBase() {
  return API_BASE;
}

export function buildCustomersQuery(params: {
  q?: string; page?: number; pageSize?: number; sort?: string; order?: 'asc'|'desc';
}) {
  return toQuery(params);
}

export async function getCustomers(params: {
  q?: string; page?: number; pageSize?: number; sort?: string; order?: 'asc'|'desc';
}) {
  const qs = buildCustomersQuery(params);
  return apiFetch<CustomersResponse>(`/customers${qs}`);
}

export async function createCustomer(payload: {
  firstName: string;
  infix?: string;
  lastName: string;
  email: string;
  phone?: string;
  street?: string;
  houseNumber?: string;
  postcode?: string;
  city?: string;
}) {
  return apiFetch(`/customers`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
