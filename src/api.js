const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('token');
}

function headers() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function register(name, email, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Register failed');
  return data;
}

export async function getMe() {
  const res = await fetch(`${API_BASE}/auth/me`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Not authenticated');
  return data;
}

export async function getConstants() {
  const res = await fetch(`${API_BASE}/transaction/constants`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load constants');
  return data;
}

export async function addTransaction(body) {
  const res = await fetch(`${API_BASE}/transaction/add`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to add');
  return data;
}

export async function getMonthly(year, month) {
  const res = await fetch(`${API_BASE}/transaction/monthly?year=${year}&month=${month}`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load');
  return data;
}

export async function getWeekly(year, week) {
  const res = await fetch(`${API_BASE}/transaction/weekly?year=${year}&week=${week}`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load');
  return data;
}

export async function getYearly(year) {
  const res = await fetch(`${API_BASE}/transaction/yearly?year=${year}`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load');
  return data;
}

export async function getFilter(category, division, from, to) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (division) params.set('division', division);
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const res = await fetch(`${API_BASE}/transaction/filter?${params}`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load');
  return data;
}

export async function getCategorySummary(from, to) {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const res = await fetch(`${API_BASE}/transaction/category-summary?${params}`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load');
  return data;
}

export async function getTransactionList() {
  const res = await fetch(`${API_BASE}/transaction/list`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load');
  return data;
}

export async function canEdit(id) {
  const res = await fetch(`${API_BASE}/transaction/can-edit/${id}`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) return false;
  return data.canEdit;
}

export async function editTransaction(id, body) {
  const res = await fetch(`${API_BASE}/transaction/edit/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to edit');
  return data;
}

export async function getAccounts() {
  const res = await fetch(`${API_BASE}/account/list`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load');
  return data;
}

export async function createAccount(accountName) {
  const res = await fetch(`${API_BASE}/account/create`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ accountName }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create');
  return data;
}

export async function transfer(fromAccount, toAccount, amount) {
  const res = await fetch(`${API_BASE}/account/transfer`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ fromAccount, toAccount, amount: Number(amount) }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Transfer failed');
  return data;
}
