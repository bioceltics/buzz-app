export interface Review {
  id: string;
  user_id: string;
  venue_id: string;
  rating: number; // 1-5
  comment?: string;
  images?: string[];
  is_verified_visit: boolean;
  helpful_count: number;
  is_reported: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReviewWithUser extends Review {
  user: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface ReviewSummary {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}
