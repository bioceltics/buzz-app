export type UserRole = 'user' | 'venue_owner' | 'admin';

export interface User {
  id: string;
  email: string;
  phone?: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  location?: {
    latitude: number;
    longitude: number;
  };
  push_token?: string;
  notification_preferences: NotificationPreferences;
  is_suspended: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  deals: boolean;
  events: boolean;
  messages: boolean;
  nearby_alerts: boolean;
  marketing: boolean;
}

export interface UserProfile extends Pick<User, 'id' | 'full_name' | 'avatar_url'> {}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}
