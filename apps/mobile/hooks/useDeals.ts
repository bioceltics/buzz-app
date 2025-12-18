import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabase';

// Mock data for demo/preview purposes
export const MOCK_DEALS = [
  {
    id: '1',
    venue_id: 'v1',
    title: '2-for-1 Cocktails',
    description: 'Enjoy our signature cocktails at half the price! Perfect for date night or catching up with friends. Choose from our extensive menu of craft cocktails, classic favorites, and seasonal specialties. Our expert mixologists have created unique blends that will delight your taste buds.',
    type: 'happy_hour' as const,
    discount_type: 'bogo' as const,
    discount_value: 50,
    original_price: 24,
    deal_price: 12,
    image_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800',
    terms: 'Valid Monday-Thursday, 5-8pm. Must purchase one cocktail at full price. Cannot be combined with other offers. Excludes premium spirits and special reserve cocktails.',
    start_time: new Date(Date.now() - 3600000).toISOString(),
    end_time: new Date(Date.now() + 86400000 * 7).toISOString(),
    is_active: true,
    is_featured: true,
    max_redemptions: 100,
    redemption_count: 45,
    qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=DEAL-001-COCKTAILS',
    venue: {
      id: 'v1',
      name: 'The Velvet Lounge',
      type: 'bar',
      logo_url: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=200',
      cover_image_url: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800',
      address: '123 Main Street, Downtown',
      phone: '+1 (555) 123-4567',
      rating: 4.7,
      review_count: 234,
    },
  },
  {
    id: '2',
    venue_id: 'v2',
    title: '30% Off All Appetizers',
    description: 'Start your meal right with our delicious appetizers at a special discount. From crispy calamari to artisan bruschetta, our appetizer menu features fresh, locally-sourced ingredients prepared by our award-winning culinary team.',
    type: 'flash_deal' as const,
    discount_type: 'percentage' as const,
    discount_value: 30,
    original_price: 18,
    deal_price: 12.6,
    image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
    terms: 'Valid for dine-in only. Cannot be combined with other offers. Maximum 3 appetizers per table. Must show deal before ordering.',
    start_time: new Date(Date.now() - 3600000).toISOString(),
    end_time: new Date(Date.now() + 86400000 * 3).toISOString(),
    is_active: true,
    is_featured: true,
    max_redemptions: 50,
    redemption_count: 23,
    qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=DEAL-002-APPETIZERS',
    venue: {
      id: 'v2',
      name: 'Bistro Garden',
      type: 'restaurant',
      logo_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200',
      cover_image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      address: '456 Oak Avenue, Midtown',
      phone: '+1 (555) 234-5678',
      rating: 4.5,
      review_count: 189,
    },
  },
  {
    id: '3',
    venue_id: 'v3',
    title: 'Free Entry Before 11PM',
    description: 'Skip the cover charge and party all night at the hottest club in town! Experience world-class DJs, stunning light shows, and an unforgettable atmosphere. VIP tables and bottle service also available.',
    type: 'event' as const,
    discount_type: 'free_item' as const,
    discount_value: 100,
    original_price: 25,
    deal_price: 0,
    image_url: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800',
    terms: 'Must arrive before 11PM. Valid ID required (21+). Dress code enforced - no athletic wear or sandals. Management reserves the right to refuse entry.',
    start_time: new Date(Date.now() - 3600000).toISOString(),
    end_time: new Date(Date.now() + 86400000 * 2).toISOString(),
    is_active: true,
    is_featured: false,
    max_redemptions: 200,
    redemption_count: 87,
    qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=DEAL-003-FREEENTRY',
    venue: {
      id: 'v3',
      name: 'Club Neon',
      type: 'club',
      logo_url: 'https://images.unsplash.com/photo-1545128485-c400e7702796?w=200',
      cover_image_url: 'https://images.unsplash.com/photo-1545128485-c400e7702796?w=800',
      address: '789 Party Lane, Entertainment District',
      phone: '+1 (555) 345-6789',
      rating: 4.3,
      review_count: 567,
    },
  },
  {
    id: '4',
    venue_id: 'v4',
    title: '$5 Espresso Drinks',
    description: 'All espresso-based drinks for just $5. Lattes, cappuccinos, americanos and more! We use single-origin beans roasted in-house for the freshest, most flavorful coffee experience. Add any flavor shot or milk alternative at no extra charge.',
    type: 'recurring' as const,
    discount_type: 'fixed' as const,
    discount_value: 3,
    original_price: 8,
    deal_price: 5,
    image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800',
    terms: 'Valid weekdays 7-10am. One per customer per day. Includes any size. Plant-based milk alternatives included.',
    start_time: new Date(Date.now() - 3600000).toISOString(),
    end_time: new Date(Date.now() + 86400000 * 30).toISOString(),
    is_active: true,
    is_featured: false,
    max_redemptions: null,
    redemption_count: 342,
    qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=DEAL-004-ESPRESSO',
    venue: {
      id: 'v4',
      name: 'Bean & Brew',
      type: 'cafe',
      logo_url: 'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=200',
      cover_image_url: 'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800',
      address: '321 Coffee Street, Arts District',
      phone: '+1 (555) 456-7890',
      rating: 4.8,
      review_count: 412,
    },
  },
  {
    id: '5',
    venue_id: 'v5',
    title: 'Spa Day Package - 40% Off',
    description: 'Relax and rejuvenate with our full spa package including a 60-minute Swedish massage, revitalizing facial treatment, and unlimited sauna access. Complimentary robe, slippers, and refreshments included. Perfect for a solo retreat or couples experience.',
    type: 'flash_deal' as const,
    discount_type: 'percentage' as const,
    discount_value: 40,
    original_price: 200,
    deal_price: 120,
    image_url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
    terms: 'Advance booking required (48 hours). Valid for new customers only. Cannot be combined with other promotions. Gratuity not included. Cancellation must be made 24 hours in advance.',
    start_time: new Date(Date.now() - 3600000).toISOString(),
    end_time: new Date(Date.now() + 86400000 * 5).toISOString(),
    is_active: true,
    is_featured: true,
    max_redemptions: 30,
    redemption_count: 18,
    qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=DEAL-005-SPAPACKAGE',
    venue: {
      id: 'v5',
      name: 'Serenity Hotel & Spa',
      type: 'hotel',
      logo_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200',
      cover_image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      address: '555 Luxury Blvd, Uptown',
      phone: '+1 (555) 567-8901',
      rating: 4.9,
      review_count: 156,
    },
  },
  {
    id: '6',
    venue_id: 'v6',
    title: 'Wine Wednesday - Half Price Bottles',
    description: 'Every bottle of wine on our menu is 50% off every Wednesday! Choose from over 100 carefully curated wines from around the world. Our sommelier is available to help you find the perfect pairing for your meal.',
    type: 'recurring' as const,
    discount_type: 'percentage' as const,
    discount_value: 50,
    original_price: 60,
    deal_price: 30,
    image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800',
    terms: 'Dine-in only. One bottle per table. Minimum food purchase of $40 required. Reservations recommended. Excludes reserve and rare vintages.',
    start_time: new Date(Date.now() - 3600000).toISOString(),
    end_time: new Date(Date.now() + 86400000 * 14).toISOString(),
    is_active: true,
    is_featured: false,
    max_redemptions: null,
    redemption_count: 78,
    qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=DEAL-006-WINEWED',
    venue: {
      id: 'v6',
      name: 'Vino & Dine',
      type: 'restaurant',
      logo_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200',
      cover_image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
      address: '888 Gourmet Row, Wine District',
      phone: '+1 (555) 678-9012',
      rating: 4.6,
      review_count: 298,
    },
  },
];

// Helper function to get a mock deal by ID
export function getMockDealById(id: string) {
  return MOCK_DEALS.find(deal => deal.id === id) || null;
}

// Extract mock venues from deals for venue detail page
export const MOCK_VENUES = MOCK_DEALS.map(deal => ({
  ...deal.venue,
  description: `Welcome to ${deal.venue.name}! We're a premier ${deal.venue.type} located in the heart of the city. Our establishment offers an exceptional experience with top-notch service, amazing atmosphere, and unforgettable moments.`,
  latitude: 40.7128 + Math.random() * 0.05,
  longitude: -74.0060 + Math.random() * 0.05,
  price_range: Math.floor(Math.random() * 3) + 1,
  website: `https://www.${deal.venue.name.toLowerCase().replace(/\s+/g, '')}.com`,
  is_verified: true,
  hours: {
    monday: '11:00 AM - 10:00 PM',
    tuesday: '11:00 AM - 10:00 PM',
    wednesday: '11:00 AM - 10:00 PM',
    thursday: '11:00 AM - 11:00 PM',
    friday: '11:00 AM - 12:00 AM',
    saturday: '10:00 AM - 12:00 AM',
    sunday: '10:00 AM - 9:00 PM',
  },
}));

// Helper function to get a mock venue by ID
export function getMockVenueById(id: string) {
  return MOCK_VENUES.find(venue => venue.id === id) || null;
}

// Get mock deals for a specific venue
export function getMockDealsByVenueId(venueId: string) {
  return MOCK_DEALS.filter(deal => deal.venue_id === venueId);
}

interface Deal {
  id: string;
  venue_id: string;
  title: string;
  description: string;
  type: 'happy_hour' | 'flash_deal' | 'event' | 'recurring';
  discount_type: 'percentage' | 'fixed' | 'bogo' | 'free_item';
  discount_value: number;
  original_price: number;
  deal_price: number;
  image_url: string;
  terms: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  is_featured: boolean;
  venue: {
    id: string;
    name: string;
    type: string;
    logo_url: string;
    address: string;
  };
}

interface UseDealsOptions {
  category?: string;
  search?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export function useDeals(options: UseDealsOptions = {}) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [featuredDeals, setFeaturedDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('deals')
        .select(`
          *,
          venue:venues(id, name, type, logo_url, address)
        `)
        .eq('is_active', true)
        .gte('end_time', new Date().toISOString())
        .lte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });

      // Filter by category
      if (options.category && options.category !== 'all') {
        query = query.eq('venue.type', options.category);
      }

      // Search filter
      if (options.search) {
        query = query.or(
          `title.ilike.%${options.search}%,description.ilike.%${options.search}%`
        );
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Filter out deals with null venues (category filter)
      const filteredDeals = (data || []).filter((deal) => deal.venue !== null);

      // Use mock data if no deals found from database
      if (filteredDeals.length === 0) {
        setDeals(MOCK_DEALS);
        setFeaturedDeals(MOCK_DEALS.filter((deal) => deal.is_featured));
      } else {
        setDeals(filteredDeals);
        setFeaturedDeals(filteredDeals.filter((deal) => deal.is_featured));
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching deals:', err);
      // Use mock data as fallback when there's an error
      setDeals(MOCK_DEALS);
      setFeaturedDeals(MOCK_DEALS.filter((deal) => deal.is_featured));
    } finally {
      setIsLoading(false);
    }
  }, [options.category, options.search, options.latitude, options.longitude]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  return {
    deals,
    featuredDeals,
    isLoading,
    error,
    refetch: fetchDeals,
  };
}
