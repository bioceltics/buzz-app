export type VenueType = 'restaurant' | 'bar' | 'club' | 'hotel' | 'cafe' | 'lounge';

export type VenueStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface Venue {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  type: VenueType;
  description?: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  latitude: number;
  longitude: number;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  cover_image_url?: string;
  images: string[];
  hours: VenueHours;
  amenities: string[];
  price_range: 1 | 2 | 3 | 4;
  rating: number;
  review_count: number;
  status: VenueStatus;
  is_featured: boolean;
  profile_views: number;
  approved_at?: string;
  approved_by?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface VenueHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

export interface DayHours {
  open: string; // HH:MM format
  close: string;
  closed?: boolean;
}

export interface VenueWithDistance extends Venue {
  distance: number; // meters
}

export interface VenueSummary {
  id: string;
  name: string;
  type: VenueType;
  logo_url?: string;
  address: string;
  rating: number;
}

export interface VenueAnalytics {
  id: string;
  venue_id: string;
  date: string;
  profile_views: number;
  deal_views: number;
  deal_redemptions: number;
  favorites_added: number;
  message_received: number;
}
