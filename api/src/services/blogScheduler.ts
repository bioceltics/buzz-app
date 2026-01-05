/**
 * Blog Scheduler Service
 *
 * Handles automated daily blog post generation using node-cron
 * Can be configured to run at specific times and generate multiple posts
 */

import cron from 'node-cron';
import { generateDailyPosts, fetchTrendingTopics, generateAndSavePost } from './blogGenerator.js';
import { supabaseAdmin } from '../lib/supabase.js';

interface SchedulerConfig {
  enabled: boolean;
  postsPerDay: number;
  cronSchedule: string; // e.g., '0 9 * * *' for 9 AM daily
  timezone: string;
}

const DEFAULT_CONFIG: SchedulerConfig = {
  enabled: true,
  postsPerDay: 1,
  cronSchedule: '0 9 * * *', // Run at 9 AM daily
  timezone: 'America/Toronto',
};

class BlogScheduler {
  private config: SchedulerConfig;
  private task: cron.ScheduledTask | null = null;
  private isRunning: boolean = false;

  constructor(config?: Partial<SchedulerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start the blog scheduler
   */
  start(): void {
    if (this.task) {
      console.log('Blog scheduler is already running');
      return;
    }

    if (!this.config.enabled) {
      console.log('Blog scheduler is disabled');
      return;
    }

    console.log(`Starting blog scheduler with schedule: ${this.config.cronSchedule}`);
    console.log(`Posts per day: ${this.config.postsPerDay}`);

    this.task = cron.schedule(
      this.config.cronSchedule,
      async () => {
        await this.runDailyGeneration();
      },
      {
        scheduled: true,
        timezone: this.config.timezone,
      }
    );

    console.log('Blog scheduler started successfully');
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (this.task) {
      this.task.stop();
      this.task = null;
      console.log('Blog scheduler stopped');
    }
  }

  /**
   * Run the daily generation task manually
   */
  async runDailyGeneration(): Promise<void> {
    if (this.isRunning) {
      console.log('Blog generation already in progress, skipping...');
      return;
    }

    this.isRunning = true;
    console.log(`Starting daily blog generation at ${new Date().toISOString()}`);

    try {
      // Check if we've already generated posts today
      const today = new Date().toISOString().split('T')[0];
      const { data: todaysPosts, error: checkError } = await supabaseAdmin
        .from('blog_posts')
        .select('id')
        .eq('is_auto_generated', true)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`);

      if (!checkError && todaysPosts && todaysPosts.length >= this.config.postsPerDay) {
        console.log(`Already generated ${todaysPosts.length} posts today, skipping...`);
        this.isRunning = false;
        return;
      }

      const postsToGenerate = this.config.postsPerDay - (todaysPosts?.length || 0);

      // Try to get trending topics first
      console.log('Fetching trending topics...');
      const trendingTopics = await fetchTrendingTopics();

      if (trendingTopics.length > 0 && trendingTopics[0].source !== 'Buzzee Editorial') {
        // Generate posts based on trending topics
        console.log(`Found ${trendingTopics.length} trending topics`);
        for (let i = 0; i < Math.min(postsToGenerate, trendingTopics.length); i++) {
          const topic = trendingTopics[i];
          console.log(`Generating post for trending topic: ${topic.title}`);

          const result = await generateAndSavePost(topic.title, undefined, true);

          if (result.success) {
            console.log(`Successfully generated post: ${result.post?.title}`);
          } else {
            console.error(`Failed to generate post: ${result.error}`);
          }

          // Delay between posts
          if (i < postsToGenerate - 1) {
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        }
      } else {
        // Use predefined topics
        console.log('Using predefined topics for generation');
        const result = await generateDailyPosts(postsToGenerate);

        if (result.success) {
          console.log(`Successfully generated ${result.posts.length} posts`);
          result.posts.forEach(post => {
            console.log(`  - ${post.title}`);
          });
        }

        if (result.errors.length > 0) {
          console.error('Errors during generation:', result.errors);
        }
      }

      console.log(`Daily blog generation completed at ${new Date().toISOString()}`);
    } catch (error) {
      console.error('Daily blog generation failed:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Update scheduler configuration
   */
  updateConfig(config: Partial<SchedulerConfig>): void {
    const wasRunning = this.task !== null;

    if (wasRunning) {
      this.stop();
    }

    this.config = { ...this.config, ...config };

    if (wasRunning && this.config.enabled) {
      this.start();
    }
  }

  /**
   * Get current scheduler status
   */
  getStatus(): { running: boolean; config: SchedulerConfig; isGenerating: boolean } {
    return {
      running: this.task !== null,
      config: this.config,
      isGenerating: this.isRunning,
    };
  }

  /**
   * Get generation history/stats
   */
  async getStats(): Promise<any> {
    try {
      // Get recent generation logs
      const { data: recentLogs } = await supabaseAdmin
        .from('blog_generation_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      // Get today's posts count
      const today = new Date().toISOString().split('T')[0];
      const { count: todayCount } = await supabaseAdmin
        .from('blog_posts')
        .select('*', { count: 'exact', head: true })
        .eq('is_auto_generated', true)
        .gte('created_at', `${today}T00:00:00`);

      // Get total auto-generated posts
      const { count: totalCount } = await supabaseAdmin
        .from('blog_posts')
        .select('*', { count: 'exact', head: true })
        .eq('is_auto_generated', true);

      // Get success/failure rates
      const { count: successCount } = await supabaseAdmin
        .from('blog_generation_log')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      const { count: failureCount } = await supabaseAdmin
        .from('blog_generation_log')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'failed');

      return {
        recentLogs,
        todayCount,
        totalCount,
        successRate: successCount && (successCount + (failureCount || 0)) > 0
          ? ((successCount / (successCount + (failureCount || 0))) * 100).toFixed(1)
          : 100,
      };
    } catch (error) {
      console.error('Error getting scheduler stats:', error);
      return null;
    }
  }
}

// Create and export singleton instance
export const blogScheduler = new BlogScheduler({
  enabled: process.env.BLOG_SCHEDULER_ENABLED !== 'false',
  postsPerDay: parseInt(process.env.BLOG_POSTS_PER_DAY || '1', 10),
  cronSchedule: process.env.BLOG_CRON_SCHEDULE || '0 9 * * *',
  timezone: process.env.BLOG_TIMEZONE || 'America/Toronto',
});

// Export class for custom instances
export { BlogScheduler };
