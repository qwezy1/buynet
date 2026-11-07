export interface Category {
  id: number;
  slug: string;
  name: string;
}

export interface ListingAuthor {
  id: number;
  name: string;
}

export interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  city: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: Category | null;
  author: ListingAuthor | null;
}

export interface SearchResult {
  items: Listing[];
  total: number;
  page: number;
  pages: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ListingQuery {
  q?: string;
  categoryId?: number;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc';
  page?: number;
  limit?: number;
}

export interface CreateListingPayload {
  title: string;
  description: string;
  price: number;
  city: string;
  categoryId: number;
  imageUrl?: string;
}
