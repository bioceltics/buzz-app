export type NotificationType =
  | 'deal_nearby'
  | 'deal_expiring'
  | 'event_reminder'
  | 'new_message'
  | 'venue_approved'
  | 'venue_rejected'
  | 'review_response'
  | 'promo'
  | 'system';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

export interface PushNotificationPayload {
  to: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
  sound?: string;
}
