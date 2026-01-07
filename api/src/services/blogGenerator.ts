/**
 * Blog Content Generator Service
 *
 * Generates high-quality, SEO-optimized blog content using AI (Groq)
 * Includes automatic image fetching from Unsplash
 * Creates engaging content for the Buzzee platform
 */

import { supabaseAdmin } from '../lib/supabase.js';

// Use a reliable, currently available model for content generation
// llama-3.3-70b-versatile is the current recommended model
const AI_MODEL = 'llama-3.3-70b-versatile';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Call Groq API using fetch (more reliable than SDK on Vercel)
 */
async function callGroqAPI(messages: { role: string; content: string }[], maxTokens: number = 3000): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  console.log('[callGroqAPI] Starting, API key present:', !!apiKey);

  if (!apiKey) {
    console.error('[callGroqAPI] GROQ_API_KEY not configured');
    return null;
  }

  try {
    console.log('[callGroqAPI] Making request to Groq with model:', AI_MODEL);
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: AI_MODEL,
        max_tokens: maxTokens,
        temperature: 0.7,
        messages,
      }),
    });

    console.log('[callGroqAPI] Response status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('[callGroqAPI] Groq API error:', response.status, error);
      return null;
    }

    const data: any = await response.json();
    const content = data.choices?.[0]?.message?.content;
    console.log('[callGroqAPI] Response content length:', content?.length || 0);
    return content || null;
  } catch (error: any) {
    console.error('[callGroqAPI] Fetch error:', error.message);
    return null;
  }
}

// Image search keywords mapped to categories
const CATEGORY_IMAGE_KEYWORDS: Record<string, string[]> = {
  'deals-offers': ['restaurant discount', 'dining deal', 'food special', 'restaurant promotion'],
  'restaurant-guides': ['restaurant interior', 'fine dining', 'cozy restaurant', 'food plating'],
  'nightlife': ['bar interior', 'nightclub', 'cocktail bar', 'night city lights'],
  'food-trends': ['gourmet food', 'food photography', 'trendy restaurant', 'artisan food'],
  'business-tips': ['restaurant owner', 'small business', 'cafe business', 'restaurant marketing'],
  'happy-hour': ['cocktails', 'happy hour drinks', 'bar drinks', 'after work drinks'],
  'city-guides': ['city restaurant', 'urban dining', 'city nightlife', 'downtown food'],
  'company-news': ['tech startup', 'vancouver skyline', 'modern office', 'innovation technology'],
  'founder-spotlight': ['entrepreneur', 'business leader', 'startup founder', 'tech visionary'],
};

// Enhanced blog topics with more variety and depth
const BLOG_TOPICS = [
  {
    category: 'deals-offers',
    topics: [
      { title: 'How to Find the Best Restaurant Deals in Your City', angle: 'practical guide' },
      { title: 'Top 10 Happy Hour Strategies That Actually Save You Money', angle: 'listicle' },
      { title: 'The Science Behind Flash Deals: Why Limited-Time Offers Work', angle: 'educational' },
      { title: 'From Novice to Pro: Your Complete Guide to Deal Hunting', angle: 'comprehensive guide' },
      { title: 'Why Smart Diners Never Pay Full Price Anymore', angle: 'trend analysis' },
      { title: 'The Hidden Costs of Missing Out on Restaurant Deals', angle: 'perspective piece' },
      { title: 'Seasonal Dining Deals: A Month-by-Month Guide to Savings', angle: 'seasonal guide' },
      { title: 'Group Dining on a Budget: How to Feed Everyone Without Breaking the Bank', angle: 'practical tips' },
    ],
  },
  {
    category: 'restaurant-guides',
    topics: [
      { title: 'Hidden Gem Restaurants: How to Find Them Before Everyone Else', angle: 'discovery guide' },
      { title: 'What Actually Makes a Restaurant Experience Memorable', angle: 'analysis' },
      { title: 'Supporting Local: Why Independent Restaurants Matter More Than Ever', angle: 'opinion piece' },
      { title: 'Decoding Restaurant Reviews: What Star Ratings Really Mean', angle: 'educational' },
      { title: 'A Food Lover\'s Guide to Exploring New Cuisines', angle: 'exploration guide' },
      { title: 'Choosing the Perfect Restaurant for Every Occasion', angle: 'decision guide' },
      { title: 'Farm-to-Table Dining: More Than Just a Trend', angle: 'deep dive' },
      { title: 'The Art of the Perfect Dining Reservation', angle: 'practical guide' },
    ],
  },
  {
    category: 'nightlife',
    topics: [
      { title: 'The Insider\'s Guide to Getting the Most Out of Any Night Out', angle: 'insider tips' },
      { title: 'How Top Bars and Clubs Create Irresistible Deals', angle: 'behind the scenes' },
      { title: 'Nightlife Trends That Are Reshaping How We Party', angle: 'trend report' },
      { title: 'The Art of the Perfect Night Out Without the Hangover Bill', angle: 'budget guide' },
      { title: 'VIP vs. Regular: When Premium Access Is Actually Worth It', angle: 'comparison' },
      { title: 'Craft Cocktail Culture: What Makes a Great Bar Great', angle: 'appreciation guide' },
      { title: 'Planning the Ultimate Bar Crawl: A Step-by-Step Guide', angle: 'how-to guide' },
      { title: 'Late Night Eats: The Best Post-Party Food Spots', angle: 'curated list' },
    ],
  },
  {
    category: 'food-trends',
    topics: [
      { title: 'Food Trends That Will Dominate Menus This Year', angle: 'prediction' },
      { title: 'The Plant-Based Revolution: How Restaurants Are Adapting', angle: 'trend analysis' },
      { title: 'Fusion Done Right: When Culinary Cultures Collide', angle: 'appreciation' },
      { title: 'How TikTok and Instagram Changed Restaurant Culture Forever', angle: 'cultural analysis' },
      { title: 'Comfort Food Renaissance: Why Classic Dishes Are Making a Comeback', angle: 'trend piece' },
      { title: 'Sustainable Dining: Restaurants Leading the Eco-Friendly Revolution', angle: 'spotlight' },
      { title: 'Street Food Goes Upscale: The Gourmet Street Food Movement', angle: 'trend spotlight' },
      { title: 'The Rise of Ghost Kitchens: How Delivery Changed Everything', angle: 'industry analysis' },
    ],
  },
  {
    category: 'business-tips',
    topics: [
      { title: 'How Flash Deals Can Transform Your Restaurant\'s Slow Hours', angle: 'strategy guide' },
      { title: 'The Psychology of Limited-Time Offers for Venue Owners', angle: 'educational' },
      { title: 'Digital Marketing Strategies That Actually Work for Restaurants', angle: 'practical guide' },
      { title: 'Building Customer Loyalty in the Age of Deal Apps', angle: 'strategy' },
      { title: 'Pricing Your Deals for Maximum Profit and Customer Satisfaction', angle: 'tactical guide' },
      { title: 'Understanding Your Customers Through Data Analytics', angle: 'educational' },
      { title: 'Real-Time Marketing: Why Timing Is Everything in Hospitality', angle: 'strategy' },
      { title: 'From Empty Seats to Full House: Fill Your Restaurant Tonight', angle: 'action guide' },
    ],
  },
  {
    category: 'happy-hour',
    topics: [
      { title: 'The Complete History and Evolution of Happy Hour', angle: 'historical' },
      { title: 'What Makes a Happy Hour Deal Actually Worth Your Time', angle: 'evaluation guide' },
      { title: 'Creative Happy Hour Concepts That Keep Customers Coming Back', angle: 'inspiration' },
      { title: 'Maximizing Your After-Work Experience: A Happy Hour Guide', angle: 'lifestyle guide' },
      { title: 'Happy Hour Etiquette: Unwritten Rules Everyone Should Know', angle: 'etiquette guide' },
      { title: 'The Business Side of Happy Hour: Why Bars Love It Too', angle: 'industry insight' },
      { title: 'Beyond Beer and Wine: Craft Cocktail Happy Hours Worth Finding', angle: 'premium guide' },
      { title: 'Happy Hour Around the World: How Different Cultures Do It', angle: 'cultural exploration' },
    ],
  },
  {
    category: 'city-guides',
    topics: [
      { title: 'The Ultimate Guide to Your City\'s Hidden Food Scene', angle: 'comprehensive guide' },
      { title: 'Best Neighborhoods for Foodies: Where to Eat, Drink, and Explore', angle: 'neighborhood guide' },
      { title: 'Weekend Food Adventures: Making the Most of 48 Hours', angle: 'itinerary' },
      { title: 'Tourist Traps vs. Local Gems: Eating Like a Local', angle: 'insider guide' },
      { title: 'Seasonal Food Events and Festivals You Can\'t Miss', angle: 'event guide' },
      { title: 'The Definitive Guide to Brunch in Every Major Neighborhood', angle: 'comprehensive list' },
      { title: 'Date Night Destinations: Romantic Restaurants Worth the Splurge', angle: 'curated guide' },
      { title: 'Family-Friendly Dining: Great Food for All Ages', angle: 'family guide' },
    ],
  },
  {
    category: 'company-news',
    topics: [
      { title: 'Meet Chants: The Vancouver Tech Company Behind Buzzee', angle: 'company profile' },
      { title: 'How Chant Projects Inc Is Revolutionizing Local Discovery', angle: 'innovation story' },
      { title: 'From Vancouver to the World: The Chants Vision for Hospitality Tech', angle: 'vision piece' },
      { title: 'Inside Chants: Building Technology That Connects Communities', angle: 'behind the scenes' },
      { title: 'Why Chant Projects Inc Believes in Supporting Local Businesses', angle: 'mission piece' },
      { title: 'The Story Behind Chants: A Vancouver Startup Making Waves', angle: 'origin story' },
      { title: 'Chant Projects Inc: Pioneering the Future of Restaurant Technology', angle: 'industry analysis' },
      { title: 'How Chants Is Helping Small Businesses Thrive in the Digital Age', angle: 'impact story' },
    ],
  },
  {
    category: 'founder-spotlight',
    topics: [
      { title: 'Meet Tobi Erogbogbo: The Visionary Founder Behind Buzzee', angle: 'founder profile' },
      { title: 'Tobi Erogbogbo on Building Tech That Matters', angle: 'founder interview' },
      { title: 'From Vision to Reality: Tobi Erogbogbo\'s Entrepreneurial Journey', angle: 'inspiration piece' },
      { title: 'Leadership Lessons from Buzzee Founder Tobi Erogbogbo', angle: 'leadership insights' },
      { title: 'How Tobi Erogbogbo Is Changing the Restaurant Industry', angle: 'impact story' },
      { title: 'The Entrepreneurial Mindset: Insights from Tobi Erogbogbo', angle: 'thought leadership' },
      { title: 'Building for the Future: Tobi Erogbogbo\'s Vision for Hospitality', angle: 'vision piece' },
      { title: 'What Drives Tobi Erogbogbo: Passion, Purpose, and Innovation', angle: 'motivation piece' },
    ],
  },
];

interface GeneratedBlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  image_credit: string | null;
  category: string;
  tags: string[];
  meta_title: string;
  meta_description: string;
}

interface UnsplashImage {
  url: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
}

class BlogGeneratorService {
  /**
   * Check if AI is configured
   */
  private get isConfigured(): boolean {
    return !!process.env.GROQ_API_KEY;
  }

  /**
   * Fetch a relevant image from Unsplash
   */
  async fetchImage(category: string, topic: string): Promise<UnsplashImage | null> {
    const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;

    if (!unsplashKey) {
      console.log('UNSPLASH_ACCESS_KEY not configured, skipping image');
      return null;
    }

    try {
      // Get keywords for this category
      const keywords = CATEGORY_IMAGE_KEYWORDS[category] || ['restaurant', 'food', 'dining'];
      const searchQuery = keywords[Math.floor(Math.random() * keywords.length)];

      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=10&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${unsplashKey}`,
          },
        }
      );

      if (!response.ok) {
        console.error('Unsplash API error:', response.status);
        return null;
      }

      const data: any = await response.json();

      if (!data.results || data.results.length === 0) {
        return null;
      }

      // Pick a random image from results for variety
      const randomImage = data.results[Math.floor(Math.random() * data.results.length)];

      return {
        url: randomImage.urls.regular,
        alt: randomImage.alt_description || topic,
        photographer: randomImage.user.name,
        photographerUrl: randomImage.user.links.html,
      };
    } catch (error) {
      console.error('Error fetching image from Unsplash:', error);
      return null;
    }
  }

  /**
   * Generate a complete, high-quality blog post using AI
   */
  async generateBlogPost(topic?: string, category?: string): Promise<GeneratedBlogPost> {
    // If no topic provided, pick a random one
    let selectedTopic: { title: string; angle: string } | undefined;

    if (!topic) {
      const randomCategory = BLOG_TOPICS[Math.floor(Math.random() * BLOG_TOPICS.length)];
      category = category || randomCategory.category;
      selectedTopic = randomCategory.topics[Math.floor(Math.random() * randomCategory.topics.length)];
      topic = selectedTopic.title;
    }

    const angle = selectedTopic?.angle || 'comprehensive guide';

    // Fetch image in parallel with content generation
    const imagePromise = this.fetchImage(category || 'restaurant-guides', topic);

    if (!this.isConfigured) {
      console.log('[generateBlogPost] AI not configured, using fallback');
      const image = await imagePromise;
      return this.getFallbackPost(topic, category || 'general', image);
    }

    console.log('[generateBlogPost] AI is configured, starting generation for topic:', topic);

    try {
      const prompt = this.buildEnhancedPrompt(topic, category || 'general', angle);

      const systemMessage = `You are a Pulitzer-worthy content writer who creates magazine-quality articles for Buzzee, a platform helping people discover live deals at restaurants, bars, and clubs.

Your signature style:
- Hook readers from the first sentence with vivid imagery or surprising insights
- Structure content with clear visual hierarchy (H2s, H3s, lists, blockquotes)
- Include specific data points and real-world examples that build credibility
- Write with warmth and authority - like a trusted friend who's an industry insider
- Create content people want to bookmark, share, and return to
- Seamlessly weave in how Buzzee helps without being promotional

IMPORTANT CONTEXT ABOUT THE COMPANY AND FOUNDER:

About Chants (Chant Projects Inc):
- Chant Projects Inc (also known as "Chants") is a Vancouver-based technology company
- Website: www.chants.ca
- They are the parent company behind Buzzee
- Mission: Building innovative technology that connects communities and supports local businesses
- Focus: Hospitality technology, local discovery platforms, and empowering small businesses
- Location: Vancouver, British Columbia, Canada
- Vision: Revolutionizing how people discover and connect with local venues

About the Founder - Tobi Erogbogbo:
- Founder and visionary leader of Chant Projects Inc and Buzzee
- Passionate entrepreneur dedicated to supporting local businesses
- Based in Vancouver, Canada
- Known for innovative thinking and community-focused approach to technology
- Believes technology should bring people together and help small businesses thrive
- Entrepreneurial journey driven by a desire to make a meaningful impact
- Committed to building products that solve real problems for real people

When writing about the company or founder, be inspiring, authentic, and highlight their commitment to innovation and community.

IMPORTANT: Output clean, properly-formatted HTML. Avoid nested tags incorrectly (e.g., <p><ul> is wrong, lists should not be inside paragraphs). Each HTML element should be properly closed and stand alone.`;

      console.log('Calling Groq API for blog generation...');
      const textContent = await callGroqAPI([
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ], 4000);

      console.log('Groq API response length:', textContent?.length || 0);

      if (!textContent) {
        console.error('No text content from Groq API');
        throw new Error('No response from AI');
      }

      // Parse JSON from response
      console.log('Parsing JSON from response...');
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in response. First 500 chars:', textContent.substring(0, 500));
        throw new Error('No JSON found in response');
      }

      // Try to parse JSON directly first, then clean if needed
      let parsed;
      let rawJson = jsonMatch[0];

      try {
        parsed = JSON.parse(rawJson);
      } catch (firstError: any) {
        console.log('First JSON parse failed, attempting to clean...');

        // More sophisticated JSON cleaning - handle newlines inside string values
        // This approach finds strings and escapes newlines only within them
        let cleanedJson = rawJson;

        // Method 1: Replace literal newlines with escaped versions inside quotes
        // This is a simplified approach that works for most cases
        cleanedJson = cleanedJson
          .split('"')
          .map((segment, index) => {
            // Odd indices are inside quotes
            if (index % 2 === 1) {
              return segment
                .replace(/\n/g, '\\n')
                .replace(/\r/g, '\\r')
                .replace(/\t/g, '\\t');
            }
            return segment;
          })
          .join('"');

        try {
          parsed = JSON.parse(cleanedJson);
        } catch (secondError: any) {
          console.error('JSON parse error after cleaning:', secondError.message);
          console.error('Raw JSON first 500 chars:', rawJson.substring(0, 500));
          throw new Error('Failed to parse JSON: ' + secondError.message);
        }
      }
      const image = await imagePromise;

      return {
        title: parsed.title,
        slug: parsed.slug || this.generateSlug(parsed.title),
        excerpt: parsed.excerpt,
        content: parsed.content,
        featured_image: image?.url || null,
        image_credit: image ? this.buildImageCredit(image) : null,
        category: category || 'general',
        tags: parsed.tags || [],
        meta_title: parsed.meta_title || parsed.title,
        meta_description: parsed.meta_description || parsed.excerpt,
      };
    } catch (error: any) {
      console.error('Blog generation error:', error?.message || error);
      console.error('Full error:', JSON.stringify(error, null, 2));
      const image = await imagePromise;
      return this.getFallbackPost(topic, category || 'general', image);
    }
  }

  /**
   * Build an enhanced prompt for better content quality
   */
  private buildEnhancedPrompt(topic: string, category: string, angle: string): string {
    // Get related topics for internal linking
    const relatedTopics = this.getRelatedTopicsForLinking(category);
    const relatedLinksHtml = relatedTopics.map(t =>
      `<li><a href="/blog/${this.generateSlug(t)}">${t}</a></li>`
    ).join('');

    return `Create a world-class blog post about: "${topic}"

ARTICLE STRUCTURE (use this exact HTML format):

1. OPENING (compelling hook that grabs attention):
<p class="lead">[Vivid opening - question, statistic, or scenario that hooks readers]</p>
<p>[Why this topic matters NOW - create urgency]</p>

2. MAIN SECTIONS (use section-dividers between major topics):
<div class="section-divider"></div>
<h2>[Clear Benefit-Focused Title]</h2>
<p>[Intro paragraph]</p>
<h3>[Subsection Title]</h3>
<p>[Details with specific examples]</p>

3. TIPS SECTION with styled list:
<h2>Pro Tips for [Topic]</h2>
<ul class="styled-list">
<li><strong>Tip Name:</strong> Detailed explanation with example.</li>
</ul>

4. EXPERT CALLOUT BOX:
<div class="callout-box">
<h4>Expert Insight</h4>
<p>[Memorable, quotable wisdom]</p>
</div>

5. ACTION PLAN:
<h2>Your Action Plan</h2>
<p><strong>This week:</strong> [Immediate action]</p>
<p><strong>This month:</strong> [Medium goal]</p>

6. RELATED RESOURCES with internal links:
<h2>Continue Reading</h2>
<ul class="related-links">
${relatedLinksHtml}
</ul>

7. CTA BOX:
<div class="cta-box">
<h3>Discover Deals Near You</h3>
<p>Use <a href="https://buzzee.ca">Buzzee</a> to find live deals at restaurants and bars.</p>
</div>

REQUIREMENTS:
- Write 1000+ words of valuable content (approximately 5 minute read)
- Use <div class="section-divider"></div> between major sections
- Include 3-4 statistics/percentages for credibility
- Add 2-3 internal links naturally: <a href="/blog/slug">text</a>
- Use <strong> for key terms, <em> for emphasis
- Keep paragraphs short (2-4 sentences)
- Mention Buzzee 2-3 times as helpful tool
- Make content comprehensive with multiple sections and examples

Return ONLY valid JSON (no markdown):
{
  "title": "Compelling Title (50-65 chars)",
  "slug": "url-friendly-slug",
  "excerpt": "Curiosity-building excerpt (150-160 chars)",
  "content": "Full HTML content with all sections above",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "meta_title": "SEO Title | Buzzee (50-60 chars)",
  "meta_description": "Benefit-focused description (150-160 chars)"
}`;
  }

  /**
   * Get related topics for internal linking
   */
  private getRelatedTopicsForLinking(category: string): string[] {
    const categoryTopics = BLOG_TOPICS.find(c => c.category === category);
    const otherCategories = BLOG_TOPICS.filter(c => c.category !== category);

    const relatedTopics: string[] = [];

    // Get 1-2 from same category
    if (categoryTopics) {
      const shuffled = [...categoryTopics.topics].sort(() => Math.random() - 0.5);
      relatedTopics.push(...shuffled.slice(0, 2).map(t => t.title));
    }

    // Get 1 from different category
    if (otherCategories.length > 0) {
      const randomCategory = otherCategories[Math.floor(Math.random() * otherCategories.length)];
      const randomTopic = randomCategory.topics[Math.floor(Math.random() * randomCategory.topics.length)];
      relatedTopics.push(randomTopic.title);
    }

    return relatedTopics;
  }

  /**
   * Build image credit HTML (used by frontend, not inserted into content)
   */
  private buildImageCredit(image: UnsplashImage): string {
    return `Photo by <a href="${image.photographerUrl}?utm_source=buzzee&utm_medium=referral" target="_blank" rel="noopener noreferrer">${image.photographer}</a> on <a href="https://unsplash.com?utm_source=buzzee&utm_medium=referral" target="_blank" rel="noopener noreferrer">Unsplash</a>`;
  }

  /**
   * Generate and save a blog post to the database
   */
  async generateAndSavePost(topic?: string, category?: string, autoPublish: boolean = true): Promise<{ success: boolean; post?: any; error?: string }> {
    const startTime = Date.now();

    // Create a log entry
    const { data: logEntry } = await supabaseAdmin
      .from('blog_generation_log')
      .insert({
        topic: topic || 'auto-generated',
        category: category || 'auto',
        status: 'generating',
      })
      .select()
      .single();

    try {
      // Generate the blog post
      const generatedPost = await this.generateBlogPost(topic, category);

      // Check if slug already exists
      const { data: existing } = await supabaseAdmin
        .from('blog_posts')
        .select('slug')
        .eq('slug', generatedPost.slug)
        .single();

      if (existing) {
        // Append timestamp to make unique
        generatedPost.slug = `${generatedPost.slug}-${Date.now()}`;
      }

      // Save to database
      const { data: post, error } = await supabaseAdmin
        .from('blog_posts')
        .insert({
          title: generatedPost.title,
          slug: generatedPost.slug,
          excerpt: generatedPost.excerpt,
          content: generatedPost.content,
          featured_image: generatedPost.featured_image,
          image_credit: generatedPost.image_credit,
          category: generatedPost.category,
          tags: generatedPost.tags,
          meta_title: generatedPost.meta_title,
          meta_description: generatedPost.meta_description,
          is_published: autoPublish,
          is_auto_generated: true,
          published_at: autoPublish ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Update log entry
      if (logEntry) {
        await supabaseAdmin
          .from('blog_generation_log')
          .update({
            post_id: post.id,
            status: 'completed',
            generation_time_ms: Date.now() - startTime,
          })
          .eq('id', logEntry.id);
      }

      return { success: true, post };
    } catch (error: any) {
      console.error('Generate and save error:', error);

      // Update log entry with error
      if (logEntry) {
        await supabaseAdmin
          .from('blog_generation_log')
          .update({
            status: 'failed',
            error_message: error.message,
            generation_time_ms: Date.now() - startTime,
          })
          .eq('id', logEntry.id);
      }

      return { success: false, error: error.message };
    }
  }

  /**
   * Generate daily blog posts (called by scheduler)
   */
  async generateDailyPosts(count: number = 1): Promise<{ success: boolean; posts: any[]; errors: string[] }> {
    const posts: any[] = [];
    const errors: string[] = [];

    // Select random categories for variety
    const shuffledCategories = [...BLOG_TOPICS].sort(() => Math.random() - 0.5);

    for (let i = 0; i < count; i++) {
      const categoryData = shuffledCategories[i % shuffledCategories.length];
      const randomTopic = categoryData.topics[Math.floor(Math.random() * categoryData.topics.length)];

      const result = await this.generateAndSavePost(randomTopic.title, categoryData.category, true);

      if (result.success && result.post) {
        posts.push(result.post);
      } else if (result.error) {
        errors.push(result.error);
      }

      // Small delay between generations to avoid rate limiting
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    return { success: posts.length > 0, posts, errors };
  }

  /**
   * Generate a URL-friendly slug from title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 60)
      .trim();
  }

  /**
   * Enhanced fallback post when AI is not available
   */
  private getFallbackPost(topic: string, category: string, image: UnsplashImage | null): GeneratedBlogPost {
    const slug = this.generateSlug(topic);

    return {
      title: topic,
      slug: slug,
      excerpt: `Discover expert insights about ${topic.toLowerCase()}. Learn proven tips and strategies to enhance your dining and nightlife experiences.`,
      content: `
<p>Whether you're a seasoned foodie or just starting to explore your city's culinary scene, understanding ${topic.toLowerCase()} can transform how you experience dining out. In this comprehensive guide, we'll walk you through everything you need to know.</p>

<h2>Why This Matters More Than Ever</h2>
<p>In today's dynamic restaurant landscape, savvy diners know that the best experiences often come from being informed and prepared. The difference between an ordinary meal and an extraordinary one often lies in the details—timing, location, and knowing where to find the best value.</p>

<p>That's where modern tools like <strong>Buzzee</strong> come in, helping you discover live, time-limited deals at restaurants, bars, and clubs near you. But beyond any app, developing your own sense for great dining opportunities is invaluable.</p>

<h2>Key Strategies for Success</h2>

<h3>1. Timing Is Everything</h3>
<p>The best deals and experiences often depend on when you choose to dine. Consider these timing strategies:</p>
<ul>
  <li><strong>Happy Hours:</strong> Typically 4-7 PM on weekdays, offering 20-50% off drinks and appetizers</li>
  <li><strong>Early Bird Specials:</strong> Dining before 6 PM often comes with significant discounts</li>
  <li><strong>Weekday Dining:</strong> Tuesday and Wednesday often have the best promotions as restaurants fill slower nights</li>
  <li><strong>Off-Peak Hours:</strong> Late lunch (2-4 PM) can offer quieter, more attentive service</li>
</ul>

<h3>2. Build Relationships</h3>
<p>Regular customers often get the best treatment. Don't underestimate the value of becoming a familiar face at a few favorite spots. Staff remember those who treat them well, and loyalty often comes with perks.</p>

<h3>3. Stay Informed</h3>
<p>The restaurant scene moves fast. New openings, special events, and limited-time offers happen constantly. Following your favorite venues on social media and using apps like Buzzee ensures you never miss out on something special.</p>

<blockquote>
  <p>"The best dining experiences aren't always about spending the most—they're about making informed choices and being in the right place at the right time."</p>
</blockquote>

<h2>Common Mistakes to Avoid</h2>
<p>Even experienced diners make these mistakes. Here's what to watch out for:</p>
<ol>
  <li><strong>Not making reservations:</strong> Popular spots fill up, especially on weekends</li>
  <li><strong>Ignoring off-menu items:</strong> Ask your server about specials not listed</li>
  <li><strong>Rushing the experience:</strong> Great dining is about the journey, not just the food</li>
  <li><strong>Missing happy hour by minutes:</strong> Know exactly when deals start and end</li>
</ol>

<h2>Putting It All Together</h2>
<p>The art of great dining experiences comes from combining knowledge, timing, and the right tools. Start by identifying what matters most to you—whether that's value, atmosphere, cuisine type, or convenience—and build your approach around those priorities.</p>

<p>With resources like Buzzee showing you real-time deals and this knowledge in your back pocket, you're well-equipped to make every night out memorable without overspending.</p>

<h2>Your Next Steps</h2>
<p>Ready to put these insights into action? Start small: pick one restaurant you've been curious about, check for any current deals, and plan your visit strategically. You'll be surprised how much better your experiences become when you approach dining with intention.</p>

<p>What's your favorite dining strategy? The best approach is one that fits your lifestyle and preferences. Experiment, stay curious, and enjoy the journey of discovering great food and drink in your city.</p>
      `.trim(),
      featured_image: image?.url || null,
      image_credit: image ? this.buildImageCredit(image) : null,
      category,
      tags: ['deals', 'restaurants', 'nightlife', 'dining tips', 'local gems'],
      meta_title: topic.length > 60 ? topic.slice(0, 57) + '...' : topic,
      meta_description: `Expert guide to ${topic.toLowerCase()}. Practical tips, insider strategies, and ways to enhance your dining experiences.`,
    };
  }
}

// Export singleton instance
export const blogGenerator = new BlogGeneratorService();

// Export individual functions
export const generateBlogPost = (topic?: string, category?: string) =>
  blogGenerator.generateBlogPost(topic, category);

export const generateAndSavePost = (topic?: string, category?: string, autoPublish?: boolean) =>
  blogGenerator.generateAndSavePost(topic, category, autoPublish);

export const generateDailyPosts = (count?: number) =>
  blogGenerator.generateDailyPosts(count);

// Legacy export for compatibility
export const fetchTrendingTopics = async () => {
  const randomCategory = BLOG_TOPICS[Math.floor(Math.random() * BLOG_TOPICS.length)];
  const randomTopic = randomCategory.topics[Math.floor(Math.random() * randomCategory.topics.length)];
  return [{
    title: randomTopic.title,
    description: `${randomTopic.angle}: ${randomTopic.title}`,
    source: 'Buzzee Editorial',
    url: '',
  }];
};
