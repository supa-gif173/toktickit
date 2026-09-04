export const API_URL = import.meta.env?.VITE_API_URL ?? "http://localhost:3000";
// --- Helper Functions ---
const getHeaders = (isMultipart = false) => {
    const headers = {};
    const stored = localStorage.getItem('toktickit_requester');
    if (stored) {
        try {
            const requester = JSON.parse(stored);
            headers['X-Requester-Id'] = requester.id;
        }
        catch (e) {
            console.error('Failed to parse requester for headers', e);
        }
    }
    if (!isMultipart) {
        headers['Content-Type'] = 'application/json';
    }
    return headers;
};
// --- API Calls ---
export async function checkSystem() {
    const healthRes = await fetch(`${API_URL}/api/health`);
    if (!healthRes.ok) {
        throw new Error("Backend is unavailable");
    }
    const categoriesRes = await fetch(`${API_URL}/api/categories`);
    if (!categoriesRes.ok) {
        throw new Error("Failed to fetch categories");
    }
    const categories = await categoriesRes.json();
    return { online: true, categories };
}
export async function fetchRequesters() {
    const res = await fetch(`${API_URL}/api/requesters`);
    if (!res.ok)
        throw new Error("Failed to fetch requesters");
    return res.json();
}
export async function fetchCategories() {
    const res = await fetch(`${API_URL}/api/categories`);
    if (!res.ok)
        throw new Error("Failed to fetch categories");
    return res.json();
}
export async function fetchSystems() {
    const res = await fetch(`${API_URL}/api/systems`);
    if (!res.ok)
        throw new Error("Failed to fetch systems");
    return res.json();
}
export async function fetchTickets(params) {
    const query = new URLSearchParams();
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== "")
                query.append(key, String(value));
        });
    }
    const res = await fetch(`${API_URL}/api/tickets?${query.toString()}`, {
        headers: getHeaders()
    });
    if (!res.ok)
        throw new Error("Failed to fetch tickets");
    return res.json();
}
export async function fetchTicketDetails(id) {
    const res = await fetch(`${API_URL}/api/tickets/${id}`, {
        headers: getHeaders()
    });
    if (!res.ok)
        throw new Error("Failed to fetch ticket details");
    return res.json();
}
export async function createTicket(payload) {
    const res = await fetch(`${API_URL}/api/tickets`, {
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
export async function uploadAttachment(file) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_URL}/api/attachments`, {
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
export async function removeAttachment(id) {
    const res = await fetch(`${API_URL}/api/attachments/${id}`, {
        method: "DELETE",
        headers: getHeaders()
    });
    if (!res.ok)
        throw new Error("Failed to remove attachment");
}
