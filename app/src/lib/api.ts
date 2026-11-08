import type {
  AuthResponse,
  Category,
  CreateListingPayload,
  Listing,
  ListingQuery,
  SearchResult,
  User,
} from '@/types';

const API_BASE = '/api';
const TOKEN_KEY = 'buynet_token';
const USER_KEY = 'buynet_user';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function saveAuth(auth: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, auth.token);
  localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
  window.dispatchEvent(new Event('buynet-auth'));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event('buynet-auth'));
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    let message = `Ошибка ${res.status}`;
    try {
      const body = await res.json();
      if (Array.isArray(body.message)) message = body.message.join('. ');
      else if (body.message) message = body.message;
    } catch {
      // оставляем дефолтное сообщение
    }
    throw new ApiError(res.status, message);
  }
  return res.json() as Promise<T>;
}

// ---------- Auth ----------

export function login(email: string, password: string) {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function register(email: string, name: string, password: string) {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, name, password }),
  });
}

// ---------- Listings ----------

export function searchListings(query: ListingQuery) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) {
      params.set(key, String(value));
    }
  });
  const qs = params.toString();
  return apiFetch<SearchResult>(`/listings${qs ? `?${qs}` : ''}`);
}

export function getListing(id: number) {
  return apiFetch<Listing>(`/listings/${id}`);
}

export function getMyListings() {
  return apiFetch<Listing[]>('/listings/mine');
}

export function createListing(payload: CreateListingPayload) {
  return apiFetch<Listing>('/listings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function deleteListing(id: number) {
  return apiFetch<{ ok: boolean }>(`/listings/${id}`, { method: 'DELETE' });
}

export function updateListing(id: number, payload: CreateListingPayload) {
  return apiFetch<Listing>(`/listings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

// ---------- Categories ----------

export function getCategories() {
  return apiFetch<Category[]>('/categories');
}

// ---------- Favorites ----------

export function getFavoriteIds() {
  return apiFetch<number[]>('/favorites');
}

export function addFavorite(listingId: number) {
  return apiFetch<{ ok: boolean }>(`/favorites/${listingId}`, { method: 'POST' });
}

export function removeFavorite(listingId: number) {
  return apiFetch<{ ok: boolean }>(`/favorites/${listingId}`, { method: 'DELETE' });
}
