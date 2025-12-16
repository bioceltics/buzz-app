// Venue types
export const VENUE_TYPES = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'bar', label: 'Bar' },
  { value: 'club', label: 'Club' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'cafe', label: 'Cafe' },
  { value: 'lounge', label: 'Lounge' },
] as const;

// Deal types
export const DEAL_TYPES = [
  { value: 'happy_hour', label: 'Happy Hour' },
  { value: 'flash_deal', label: 'Flash Deal' },
  { value: 'daily_special', label: 'Daily Special' },
  { value: 'event_special', label: 'Event Special' },
  { value: 'recurring', label: 'Recurring' },
] as const;

// Event types
export const EVENT_TYPES = [
  { value: 'live_music', label: 'Live Music' },
  { value: 'dj', label: 'DJ Night' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'trivia', label: 'Trivia' },
  { value: 'sports', label: 'Sports' },
  { value: 'themed', label: 'Themed Party' },
  { value: 'special', label: 'Special Event' },
  { value: 'other', label: 'Other' },
] as const;

// Discount types
export const DISCOUNT_TYPES = [
  { value: 'percentage', label: 'Percentage Off' },
  { value: 'fixed', label: 'Fixed Amount Off' },
  { value: 'bogo', label: 'Buy One Get One' },
  { value: 'free_item', label: 'Free Item' },
] as const;

// Price range labels
export const PRICE_RANGES = [
  { value: 1, label: '$' },
  { value: 2, label: '$$' },
  { value: 3, label: '$$$' },
  { value: 4, label: '$$$$' },
] as const;

// Days of week
export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
] as const;

// Default nearby radius in meters
export const DEFAULT_NEARBY_RADIUS = 5000;

// Default pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Image constraints
export const MAX_IMAGES_PER_REVIEW = 5;
export const MAX_IMAGES_PER_VENUE = 10;

// Rating range
export const MIN_RATING = 1;
export const MAX_RATING = 5;

// Vancouver BC coordinates (default location)
export const VANCOUVER_COORDS = {
  latitude: 49.2827,
  longitude: -123.1207,
};
