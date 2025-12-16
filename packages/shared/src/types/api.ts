// Generic API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

// Auth responses
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: string;
  };
  access_token: string;
  refresh_token: string;
}

// Common query params
export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface LocationParams {
  lat: number;
  lng: number;
  radius?: number; // meters
}

export interface SearchParams extends PaginationParams {
  search?: string;
  type?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Favorites
export interface Favorite {
  id: string;
  user_id: string;
  venue_id: string;
  created_at: string;
}

export interface FavoriteWithVenue extends Favorite {
  venue: {
    id: string;
    name: string;
    type: string;
    logo_url?: string;
    address: string;
    rating: number;
  };
}
