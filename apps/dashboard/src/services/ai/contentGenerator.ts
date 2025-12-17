// AI Content Generator for Deal Creation
// Generates compelling titles, descriptions, and marketing copy

export interface DealContentInput {
  venueType: 'bar' | 'restaurant' | 'club' | 'cafe' | 'hotel';
  venueName: string;
  dealType: 'discount' | 'bogo' | 'freeItem' | 'combo' | 'happyHour' | 'event';
  category: 'drinks' | 'food' | 'entry' | 'experience';
  discountValue?: number;
  discountType?: 'percentage' | 'fixed';
  itemName?: string;
  timeSlot?: 'morning' | 'lunch' | 'afternoon' | 'evening' | 'night' | 'lateNight';
  targetAudience?: 'everyone' | 'students' | 'professionals' | 'couples' | 'groups';
  mood?: 'casual' | 'upscale' | 'fun' | 'romantic' | 'energetic';
  keywords?: string[];
}

export interface GeneratedContent {
  titles: string[];
  descriptions: string[];
  hashtags: string[];
  callToAction: string[];
  tips: string[];
  estimatedEngagement: 'low' | 'medium' | 'high';
}

// Title templates by deal type
const titleTemplates: Record<string, string[]> = {
  discount: [
    '{discount} Off {item}',
    'Save {discount} on {item}',
    '{item} - {discount} Off Today',
    'Flash Deal: {discount} Off',
    '{discount} Off Everything',
  ],
  bogo: [
    'Buy One Get One {item}',
    '2-for-1 {item}',
    'BOGO {item} Special',
    'Double Up: 2-for-1 {item}',
    'Bring a Friend: BOGO {item}',
  ],
  freeItem: [
    'Free {item} with Purchase',
    'Complimentary {item}',
    'Get a Free {item}',
    'On Us: Free {item}',
    '{item} on the House',
  ],
  combo: [
    '{item} Combo Deal',
    'The Perfect Pair: {item}',
    'Bundle & Save: {item}',
    'Combo Special: {item}',
    'Best Value: {item} Combo',
  ],
  happyHour: [
    'Happy Hour: {discount} Off',
    'Happy Hour Specials',
    'Unwind Hour: {discount} Off',
    'After Work Special',
    'Golden Hour Deals',
  ],
  event: [
    'Special Event: {item}',
    'Tonight Only: {item}',
    'Exclusive: {item}',
    'Limited Time: {item}',
    'Don\'t Miss: {item}',
  ],
};

// Description templates by venue type
const descriptionTemplates: Record<string, string[]> = {
  bar: [
    'Kick back and enjoy {item} at unbeatable prices. {venueName} is the perfect spot to unwind.',
    'Raise your glass! We\'re serving up {item} with a side of great vibes.',
    'Your favorite drinks just got better. {item} awaits at {venueName}.',
    'Cheers to savings! Don\'t miss out on {item} today.',
    'Good drinks, great company, amazing prices. {item} at {venueName}.',
  ],
  restaurant: [
    'Treat your taste buds to {item} at {venueName}. Your table is waiting.',
    'Delicious food, incredible savings. Enjoy {item} today only.',
    'Hungry for a deal? {item} is on the menu at {venueName}.',
    'Satisfy your cravings with {item}. Limited time offer!',
    'Great food deserves to be shared. Bring friends for {item}.',
  ],
  club: [
    'The party starts here! Get {item} and dance the night away.',
    'VIP treatment at regular prices. {item} at {venueName}.',
    'Turn up the night with {item}. See you on the dance floor!',
    'Skip the line on boring nights. {item} gets you in the groove.',
    'Nightlife just got better. {item} exclusively at {venueName}.',
  ],
  cafe: [
    'Start your day right with {item} at {venueName}.',
    'Coffee lovers rejoice! {item} is here to brighten your day.',
    'Cozy vibes and great deals. Enjoy {item} at {venueName}.',
    'Your perfect break awaits. {item} freshly made for you.',
    'Sip, relax, repeat. {item} at your favorite spot.',
  ],
  hotel: [
    'Luxury meets value. Experience {item} at {venueName}.',
    'Elevate your stay with {item}. Exclusively for our guests.',
    'Indulge yourself with {item} at {venueName}.',
    'Premium experiences, exceptional prices. {item} awaits.',
    'Make your visit memorable with {item}.',
  ],
};

// Call-to-action phrases
const ctaTemplates = [
  'Claim your deal now',
  'Don\'t miss out - grab it today',
  'Limited spots available',
  'Show this to redeem',
  'Available while supplies last',
  'First come, first served',
  'Tap to save your spot',
  'Redeem before time runs out',
  'Claim now, enjoy later',
  'Your deal is waiting',
];

// Hashtag suggestions by category
const hashtagsByCategory: Record<string, string[]> = {
  drinks: ['#HappyHour', '#DrinkDeals', '#CheersToSavings', '#DrinkSpecials', '#Cocktails', '#CraftBeer', '#WineTime'],
  food: ['#Foodie', '#FoodDeals', '#EatLocal', '#FoodLovers', '#Delicious', '#TreatYourself', '#FoodSpecials'],
  entry: ['#NightOut', '#WeekendVibes', '#PartyTime', '#Nightlife', '#ClubDeals', '#VIPAccess', '#NightOwl'],
  experience: ['#Experience', '#TreatYourself', '#SpecialMoments', '#Exclusive', '#LimitedTime', '#DontMissOut'],
};

// Time-based modifiers
const timeModifiers: Record<string, string[]> = {
  morning: ['Rise & Shine', 'Early Bird', 'Morning Special', 'Start Your Day'],
  lunch: ['Lunch Rush', 'Midday Treat', 'Lunch Break', 'Noon Deal'],
  afternoon: ['Afternoon Delight', 'Mid-Day Escape', 'Afternoon Pick-Me-Up'],
  evening: ['Evening Special', 'Dinner Time', 'After Work', 'Evening Out'],
  night: ['Night Owl', 'After Dark', 'Night Special', 'Evening Vibes'],
  lateNight: ['Late Night', 'After Hours', 'Midnight Special', 'Night Cap'],
};

// Helper function to fill template
function fillTemplate(template: string, values: Record<string, string>): string {
  let result = template;
  Object.entries(values).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{${key}}`, 'g'), value);
  });
  return result;
}

// Generate engaging title variations
function generateTitles(input: DealContentInput): string[] {
  const templates = titleTemplates[input.dealType] || titleTemplates.discount;
  const titles: string[] = [];

  const values: Record<string, string> = {
    discount: input.discountType === 'percentage'
      ? `${input.discountValue}%`
      : `$${input.discountValue}`,
    item: input.itemName || input.category,
    venueName: input.venueName,
  };

  // Generate from templates
  templates.forEach((template) => {
    titles.push(fillTemplate(template, values));
  });

  // Add time-based variations
  if (input.timeSlot && timeModifiers[input.timeSlot]) {
    const modifier = timeModifiers[input.timeSlot][0];
    titles.push(`${modifier}: ${values.discount} Off ${values.item}`);
  }

  // Add mood-based variations
  if (input.mood) {
    const moodTitles: Record<string, string> = {
      casual: `Chill Deal: ${values.item}`,
      upscale: `Premium ${values.item} Experience`,
      fun: `Party Time: ${values.item}`,
      romantic: `Date Night: ${values.item}`,
      energetic: `Let's Go! ${values.item}`,
    };
    if (moodTitles[input.mood]) {
      titles.push(moodTitles[input.mood]);
    }
  }

  return titles.slice(0, 6);
}

// Generate compelling descriptions
function generateDescriptions(input: DealContentInput): string[] {
  const templates = descriptionTemplates[input.venueType] || descriptionTemplates.restaurant;
  const descriptions: string[] = [];

  const values: Record<string, string> = {
    discount: input.discountType === 'percentage'
      ? `${input.discountValue}%`
      : `$${input.discountValue}`,
    item: input.itemName || `our ${input.category}`,
    venueName: input.venueName,
  };

  // Generate from templates
  templates.forEach((template) => {
    descriptions.push(fillTemplate(template, values));
  });

  // Add urgency
  descriptions.push(`Only available today! ${fillTemplate(templates[0], values)}`);

  // Add social proof
  descriptions.push(`Join hundreds of happy customers enjoying ${values.item} at ${values.venueName}.`);

  return descriptions.slice(0, 5);
}

// Generate relevant hashtags
function generateHashtags(input: DealContentInput): string[] {
  const hashtags = new Set<string>();

  // Category hashtags
  const categoryTags = hashtagsByCategory[input.category] || [];
  categoryTags.forEach((tag) => hashtags.add(tag));

  // Add deal type hashtags
  hashtags.add('#Deal');
  hashtags.add('#LocalDeals');
  hashtags.add('#SaveMoney');

  // Add venue type specific
  const venueHashtags: Record<string, string[]> = {
    bar: ['#BarLife', '#DrinkUp'],
    restaurant: ['#Foodie', '#EatOut'],
    club: ['#Nightlife', '#PartyTime'],
    cafe: ['#CoffeeTime', '#CafeLife'],
    hotel: ['#Travel', '#Luxury'],
  };
  venueHashtags[input.venueType]?.forEach((tag) => hashtags.add(tag));

  // Add time-based
  if (input.timeSlot === 'evening' || input.timeSlot === 'night') {
    hashtags.add('#NightOut');
  }
  if (input.timeSlot === 'lunch') {
    hashtags.add('#LunchBreak');
  }

  // Add custom keywords as hashtags
  input.keywords?.forEach((keyword) => {
    hashtags.add(`#${keyword.replace(/\s+/g, '')}`);
  });

  return Array.from(hashtags).slice(0, 10);
}

// Generate calls-to-action
function generateCTAs(input: DealContentInput): string[] {
  const ctas = [...ctaTemplates];

  // Add urgency-based CTAs
  if (input.timeSlot === 'lunch') {
    ctas.unshift('Grab it before lunch ends!');
  }
  if (input.timeSlot === 'evening' || input.timeSlot === 'night') {
    ctas.unshift('Start your night right - claim now!');
  }

  // Add deal-type specific
  if (input.dealType === 'bogo') {
    ctas.unshift('Bring a friend and save!');
  }
  if (input.dealType === 'happyHour') {
    ctas.unshift('Clock\'s ticking - happy hour won\'t last!');
  }

  return ctas.slice(0, 5);
}

// Generate tips for better deal performance
function generateTips(input: DealContentInput): string[] {
  const tips: string[] = [];

  // Discount optimization
  if (input.discountValue && input.discountValue < 15) {
    tips.push('Consider increasing discount to 15-25% for better engagement');
  }
  if (input.discountValue && input.discountValue > 50) {
    tips.push('High discounts attract deal-seekers - consider limiting redemptions');
  }

  // Timing tips
  if (input.timeSlot === 'morning') {
    tips.push('Morning deals work best for cafes and breakfast spots');
  }
  if (input.timeSlot === 'lunch') {
    tips.push('Lunch deals (11AM-2PM) have highest conversion for restaurants');
  }
  if (input.timeSlot === 'evening') {
    tips.push('Evening deals (5-8PM) are peak time for bars and restaurants');
  }

  // Category tips
  if (input.category === 'drinks' && input.dealType !== 'happyHour') {
    tips.push('Consider framing drink deals as "Happy Hour" for higher appeal');
  }
  if (input.category === 'entry') {
    tips.push('Entry deals work best mid-week (Tue-Thu) to drive traffic');
  }

  // Content tips
  tips.push('Add high-quality photos to increase engagement by 40%');
  tips.push('Deals with specific item names convert 25% better than generic offers');
  tips.push('Including end time creates urgency and drives faster redemption');

  return tips.slice(0, 5);
}

// Estimate engagement level
function estimateEngagement(input: DealContentInput): 'low' | 'medium' | 'high' {
  let score = 50;

  // Discount value impact
  if (input.discountValue) {
    if (input.discountValue >= 30) score += 20;
    else if (input.discountValue >= 20) score += 10;
    else if (input.discountValue < 15) score -= 10;
  }

  // Deal type impact
  const dealTypeScores: Record<string, number> = {
    bogo: 15,
    happyHour: 10,
    freeItem: 12,
    combo: 8,
    discount: 5,
    event: 10,
  };
  score += dealTypeScores[input.dealType] || 0;

  // Time slot impact
  const timeScores: Record<string, number> = {
    lunch: 10,
    evening: 15,
    night: 12,
    afternoon: 5,
    morning: 3,
    lateNight: 8,
  };
  score += timeScores[input.timeSlot || 'evening'] || 0;

  // Category impact
  if (input.category === 'drinks') score += 5;

  if (score >= 75) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
}

// Main content generation function
export async function generateDealContent(input: DealContentInput): Promise<GeneratedContent> {
  // Simulate AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    titles: generateTitles(input),
    descriptions: generateDescriptions(input),
    hashtags: generateHashtags(input),
    callToAction: generateCTAs(input),
    tips: generateTips(input),
    estimatedEngagement: estimateEngagement(input),
  };
}

// Quick suggestion for title while typing
export function suggestTitle(partialTitle: string, dealType: string): string[] {
  const suggestions: string[] = [];
  const templates = titleTemplates[dealType] || titleTemplates.discount;

  // Find matching templates
  templates.forEach((template) => {
    if (template.toLowerCase().includes(partialTitle.toLowerCase())) {
      suggestions.push(template);
    }
  });

  // Add common completions
  const commonPhrases = [
    ' - Limited Time Only',
    ' - Today Only',
    ' Special',
    ' Deal',
    ' - Don\'t Miss Out',
  ];

  commonPhrases.forEach((phrase) => {
    suggestions.push(partialTitle + phrase);
  });

  return suggestions.slice(0, 5);
}

// Improve existing description
export function improveDescription(description: string): string[] {
  const improvements: string[] = [];

  // Add urgency
  if (!description.toLowerCase().includes('today') && !description.toLowerCase().includes('now')) {
    improvements.push(description + ' Available today only!');
  }

  // Add call-to-action
  if (!description.toLowerCase().includes('claim') && !description.toLowerCase().includes('get')) {
    improvements.push(description + ' Claim yours now.');
  }

  // Make it shorter if too long
  if (description.length > 150) {
    const shortened = description.substring(0, 120).trim() + '...';
    improvements.push(shortened);
  }

  // Add emoji version
  const emojiMap: Record<string, string> = {
    'drink': '🍹',
    'food': '🍽️',
    'pizza': '🍕',
    'burger': '🍔',
    'coffee': '☕',
    'beer': '🍺',
    'wine': '🍷',
    'party': '🎉',
    'music': '🎵',
    'save': '💰',
    'deal': '🔥',
  };

  let emojiVersion = description;
  Object.entries(emojiMap).forEach(([word, emoji]) => {
    if (description.toLowerCase().includes(word)) {
      emojiVersion = emoji + ' ' + emojiVersion;
    }
  });
  if (emojiVersion !== description) {
    improvements.push(emojiVersion);
  }

  return improvements;
}

export const contentGenerator = {
  generateDealContent,
  suggestTitle,
  improveDescription,
};
