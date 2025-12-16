export type DealType = 'happy_hour' | 'flash_deal' | 'daily_special' | 'event_special' | 'recurring';

export interface Deal {
  id: string;
  venue_id: string;
  title: string;
  description: string;
  type: DealType;
  discount_type: 'percentage' | 'fixed' | 'bogo' | 'free_item';
  discount_value?: number;
  original_price?: number;
  discounted_price?: number;
  terms?: string;
  image_url?: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  max_redemptions?: number;
  redemption_count: number;
  view_count: number;
  qr_code_url?: string;
  recurring_days?: number[]; // 0-6 for Sunday-Saturday
  created_at: string;
  updated_at: string;
}

export interface DealWithVenue extends Deal {
  venue: {
    id: string;
    name: string;
    type: string;
    logo_url?: string;
    address: string;
  };
}

export interface Redemption {
  id: string;
  user_id: string;
  deal_id: string;
  venue_id: string;
  redeemed_at: string;
  created_at: string;
}

export interface UserRedemption extends Redemption {
  deal: Deal;
  venue: {
    id: string;
    name: string;
    logo_url?: string;
  };
}
