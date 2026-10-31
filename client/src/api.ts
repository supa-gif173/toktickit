export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// --- Types ---

export interface Category {
  createdAt?: string;
  id: string;
  name: string;
  isActive?: boolean;
}

export interface RelatedSystem {
  createdAt?: string;
  id: string;
  name: string;
  isActive?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'REQUESTER' | 'STAFF' | 'ADMIN';
  requiresPasswordChange: boolean;
  isActive?: boolean;
}

export type ActionStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface ActionTaken {
  id: string;
  ticketId: string;
  performedById: string;
  assigneeId?: string | null;
  status: ActionStatus;
  actionDateTime: string;
  description: string;
  result?: string | null;
  followUpRequired: boolean;
  followUpNote?: string | null;
  attachmentNotes?: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  performedBy?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  assignee?: {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive?: boolean;
  } | null;
}

export interface SystemStatus {
  online: boolean;
  categories: Category[];
}

export interface Attachment {
  id: string;
  ticketId?: string | null;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storageUrl: string;
  uploadedAt: string;
  deletedAt?: string | null;
  removalReason?: string | null;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  summary: string;
  description: string;
  status: string;
  requesterId: string;
  categoryId: string;
  systemId: string;
  ownerId?: string | null;
  requestedPriority: string;
  itPriority: string;
  createdAt: string;
  updatedAt: string;
  requester?: { id: string; name: string; email: string; role?: string; requiresPasswordChange?: boolean } | User;
  owner?: User | null;
  category?: Category;
  system?: RelatedSystem;
  attachments?: Attachment[];
  version?: number;
  actionsTaken?: ActionTaken[];
  problemAppearsResolved?: boolean;
}

const fetchApi = (url: string, options: RequestInit = {}) => {
  return fetch(url, {
    ...options,
    credentials: 'include',
  });
};

const getHeaders = (isMultipart = false) => {
  const headers: HeadersInit = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

// --- API Calls ---

export async function checkSystem(): Promise<SystemStatus> {
  const healthRes = await fetchApi(`${API_URL}/api/health`);
  if (!healthRes.ok) {
    throw new Error("Backend is unavailable");
  }
  const categoriesRes = await fetchApi(`${API_URL}/api/categories`);
  if (!categoriesRes.ok) {
    throw new Error("Failed to fetch categories");
  }
  const categories: Category[] = await categoriesRes.json();
  return { online: true, categories };
}

export async function fetchRequesters(): Promise<User[]> {
  const res = await fetchApi(`${API_URL}/api/requesters`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error("Failed to fetch requesters");
  return res.json();
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetchApi(`${API_URL}/api/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function fetchSystems(): Promise<RelatedSystem[]> {
  const res = await fetchApi(`${API_URL}/api/systems`);
  if (!res.ok) throw new Error("Failed to fetch systems");
  return res.json();
}

export async function fetchTickets(params?: { page?: number; limit?: number; search?: string; status?: string; category?: string; sortBy?: string; sortOrder?: 'asc' | 'desc' }): Promise<{ data: Ticket[]; meta: any }> {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") query.append(key, String(value));
    });
  }
  
  const res = await fetchApi(`${API_URL}/api/tickets?${query.toString()}`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error("Failed to fetch tickets");
  return res.json();
}

export async function fetchTicketDetails(id: string): Promise<Ticket> {
  const res = await fetchApi(`${API_URL}/api/tickets/${id}`, {
    headers: getHeaders()
  });
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error("Unauthorized Access: You do not have permission to view this ticket.");
    }
    throw new Error("Failed to fetch ticket details");
  }
  return res.json();
}

export async function fetchStaffTickets(params?: { page?: number; limit?: number; search?: string; status?: string; priority?: string; sortBy?: string; sortOrder?: 'asc' | 'desc' }): Promise<{ data: Ticket[]; meta: any }> {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") query.append(key, String(value));
    });
  }
  
  const res = await fetchApi(`${API_URL}/api/staff/tickets?${query.toString()}`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error("Failed to fetch staff tickets");
  return res.json();
}

export async function fetchStaffTicketDetails(id: string): Promise<Ticket> {
  const res = await fetchApi(`${API_URL}/api/staff/tickets/${id}`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error("Failed to fetch staff ticket details");
  return res.json();
}

export async function claimTicket(id: string): Promise<Ticket> {
  const res = await fetchApi(`${API_URL}/api/staff/tickets/${id}/claim`, {
    method: 'PATCH',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error("Failed to claim ticket");
  return res.json();
}

export async function assignTicket(id: string, ownerId: string | null): Promise<Ticket> {
  const res = await fetchApi(`${API_URL}/api/staff/tickets/${id}/assign`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ ownerId })
  });
  if (!res.ok) throw new Error("Failed to assign ticket");
  return res.json();
}

export async function updateTicketPriority(id: string, itPriority: string): Promise<Ticket> {
  const res = await fetchApi(`${API_URL}/api/staff/tickets/${id}/priority`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ itPriority })
  });
  if (!res.ok) throw new Error("Failed to update ticket priority");
  return res.json();
}

export interface StatusHistoryEntry {
  id: string;
  ticketId: string;
  fromStatus: string;
  toStatus: string;
  changedById: string;
  changedAt: string;
  changedBy?: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
}

export async function fetchTicketHistory(id: string): Promise<StatusHistoryEntry[]> {
  const res = await fetchApi(`${API_URL}/api/tickets/${id}/history`, {
    headers: getHeaders()
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch ticket history");
  }
  const data = await res.json();
  return data.history || data;
}

export async function updateTicketResolutionIndicator(id: string, problemAppearsResolved: boolean): Promise<{ problemAppearsResolved: boolean }> {
  const res = await fetchApi(`${API_URL}/api/tickets/${id}/resolve-indicator`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ problemAppearsResolved })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update resolution indicator");
  }
  return res.json();
}

export async function updateTicketStatus(id: string, status: string, expectedVersion?: number): Promise<Ticket> {
  const res = await fetchApi(`${API_URL}/api/staff/tickets/${id}/status`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status, expectedVersion })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const err: any = new Error(errorData.message || "Failed to update ticket status");
    err.code = errorData.code;
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  return data.ticket || data;
}


export async function createTicket(payload: { summary: string; description: string; categoryId: string; systemId: string; attachments: string[] }): Promise<Ticket> {
  const res = await fetchApi(`${API_URL}/api/tickets`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create ticket");
  }
  return res.json();
}

export async function uploadAttachment(file: File, ticketId?: string): Promise<Attachment> {
  const formData = new FormData();
  formData.append("file", file);
  if (ticketId) {
    formData.append("ticketId", ticketId);
  }

  const res = await fetchApi(`${API_URL}/api/attachments`, {
    method: "POST",
    headers: getHeaders(true),
    body: formData
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to upload attachment");
  }
  return res.json();
}

export async function removeAttachment(id: string, reason?: string): Promise<void> {
  const res = await fetchApi(`${API_URL}/api/attachments/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
    body: reason ? JSON.stringify({ reason }) : undefined
  });
  if (!res.ok) throw new Error("Failed to remove attachment");
}

export async function login(email: string, password: string): Promise<{ user: User }> {
  const res = await fetchApi(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to login');
  }
  return res.json();
}

export async function logout(): Promise<void> {
  await fetchApi(`${API_URL}/api/auth/logout`, { method: 'POST' });
}

export async function fetchMe(): Promise<{ user: User }> {
  const res = await fetchApi(`${API_URL}/api/auth/me`);
  if (!res.ok) throw new Error('Unauthenticated');
  return res.json();
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const res = await fetchApi(`${API_URL}/api/auth/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPassword, newPassword })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to change password');
  }
}

export async function fetchAdminUsers(params?: { search?: string; role?: string }): Promise<User[]> {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") query.append(key, String(value));
    });
  }
  
  const res = await fetchApi(`${API_URL}/api/admin/users?${query.toString()}`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function createAdminUser(payload: { name: string; email: string; role: string; isActive: boolean; password?: string }): Promise<User> {
  const res = await fetchApi(`${API_URL}/api/admin/users`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create user");
  }
  return res.json();
}

export async function fetchTicketActions(ticketId: string): Promise<ActionTaken[]> {
  const res = await fetchApi(`${API_URL}/api/tickets/${ticketId}/actions`, {
    headers: getHeaders()
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch actions");
  }
  const data = await res.json();
  return data.actions || data;
}

export async function createTicketAction(ticketId: string, payload: {
  description: string;
  status?: ActionStatus;
  assigneeId?: string | null;
  actionDateTime?: string;
  result?: string;
  followUpRequired?: boolean;
  followUpNote?: string;
  attachmentNotes?: string;
}): Promise<ActionTaken> {
  const res = await fetchApi(`${API_URL}/api/tickets/${ticketId}/actions`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const err: any = new Error(errorData.message || "Failed to create action");
    err.code = errorData.code;
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  return data.action || data;
}

export async function updateTicketAction(ticketId: string, actionId: string, payload: {
  description?: string;
  status?: ActionStatus;
  assigneeId?: string | null;
  result?: string | null;
  followUpRequired?: boolean;
  followUpNote?: string | null;
  attachmentNotes?: string | null;
  expectedVersion?: number;
}): Promise<ActionTaken> {
  const res = await fetchApi(`${API_URL}/api/tickets/${ticketId}/actions/${actionId}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const err: any = new Error(errorData.message || "Failed to update action");
    err.code = errorData.code;
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  return data.action || data;
}

export async function fetchStaffAssignees(): Promise<User[]> {
  const res = await fetchApi(`${API_URL}/api/staff/assignees`, {
    headers: getHeaders()
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch staff assignees");
  }
  return res.json();
}

export async function updateAdminUser(id: string, payload: { name?: string; email?: string; role?: string; isActive?: boolean; password?: string }): Promise<User> {
  const res = await fetchApi(`${API_URL}/api/admin/users/${id}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update user");
  }
  return res.json();
}
