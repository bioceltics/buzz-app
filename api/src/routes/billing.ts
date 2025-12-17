import { Router, Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabase.js';
import {
  stripeService,
  isStripeConfigured,
  SUBSCRIPTION_PLANS,
  getOrCreateCustomer,
  createCheckoutSession,
  createBillingPortalSession,
  getSubscriptionStatus,
} from '../services/stripe.js';

const router = Router();

/**
 * GET /api/billing/plans
 * Get available subscription plans
 */
router.get('/plans', async (req, res) => {
  try {
    // Return plans without Stripe price IDs (those are internal)
    const plans = SUBSCRIPTION_PLANS.map(({ stripePriceIdMonthly, stripePriceIdYearly, ...plan }) => plan);
    res.json({ plans, stripeConfigured: isStripeConfigured });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: 'Failed to get plans' });
  }
});

/**
 * GET /api/billing/status
 * Get current user's subscription status
 */
router.get('/status', authMiddleware, async (req: AuthRequest, res) => {
  try {
    // Get user's venue
    const { data: venue } = await supabaseAdmin
      .from('venues')
      .select('id, stripe_customer_id')
      .eq('owner_id', req.user!.id)
      .single();

    if (!venue) {
      return res.json({
        hasVenue: false,
        subscription: {
          planId: 'free',
          active: false,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
        },
      });
    }

    if (!isStripeConfigured || !venue.stripe_customer_id) {
      return res.json({
        hasVenue: true,
        venueId: venue.id,
        subscription: {
          planId: 'free',
          active: false,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
        },
      });
    }

    const status = await getSubscriptionStatus(venue.stripe_customer_id);
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === status.planId);

    res.json({
      hasVenue: true,
      venueId: venue.id,
      subscription: {
        ...status,
        plan: plan ? {
          name: plan.name,
          features: plan.features,
          limits: plan.limits,
        } : null,
      },
    });
  } catch (error) {
    console.error('Get billing status error:', error);
    res.status(500).json({ error: 'Failed to get billing status' });
  }
});

/**
 * POST /api/billing/create-checkout
 * Create a Stripe checkout session for subscription
 */
router.post('/create-checkout', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!isStripeConfigured) {
      return res.status(400).json({ error: 'Billing is not configured' });
    }

    const { planId, billingPeriod = 'monthly' } = req.body;

    if (!planId || planId === 'free') {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    // Get user details
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name')
      .eq('id', req.user!.id)
      .single();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get or create venue
    let { data: venue } = await supabaseAdmin
      .from('venues')
      .select('id, stripe_customer_id')
      .eq('owner_id', req.user!.id)
      .single();

    if (!venue) {
      return res.status(400).json({ error: 'Please create a venue first' });
    }

    // Get or create Stripe customer
    let customerId = venue.stripe_customer_id;
    if (!customerId) {
      customerId = await getOrCreateCustomer({
        userId: user.id,
        email: user.email,
        name: user.full_name || user.email,
        venueId: venue.id,
      });

      // Save customer ID to venue
      await supabaseAdmin
        .from('venues')
        .update({ stripe_customer_id: customerId })
        .eq('id', venue.id);
    }

    // Create checkout session
    const baseUrl = process.env.DASHBOARD_URL || 'http://localhost:3001';
    const checkoutUrl = await createCheckoutSession(
      customerId,
      planId,
      billingPeriod,
      `${baseUrl}/settings/billing?success=true`,
      `${baseUrl}/settings/billing?canceled=true`
    );

    res.json({ url: checkoutUrl });
  } catch (error) {
    console.error('Create checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

/**
 * POST /api/billing/portal
 * Create a Stripe billing portal session
 */
router.post('/portal', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!isStripeConfigured) {
      return res.status(400).json({ error: 'Billing is not configured' });
    }

    // Get user's venue
    const { data: venue } = await supabaseAdmin
      .from('venues')
      .select('id, stripe_customer_id')
      .eq('owner_id', req.user!.id)
      .single();

    if (!venue || !venue.stripe_customer_id) {
      return res.status(400).json({ error: 'No billing account found' });
    }

    const baseUrl = process.env.DASHBOARD_URL || 'http://localhost:3001';
    const portalUrl = await createBillingPortalSession(
      venue.stripe_customer_id,
      `${baseUrl}/settings/billing`
    );

    res.json({ url: portalUrl });
  } catch (error) {
    console.error('Create portal error:', error);
    res.status(500).json({ error: 'Failed to create billing portal' });
  }
});

/**
 * GET /api/billing/invoices
 * Get user's invoices
 */
router.get('/invoices', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!isStripeConfigured) {
      return res.json({ invoices: [] });
    }

    // Get user's venue
    const { data: venue } = await supabaseAdmin
      .from('venues')
      .select('id, stripe_customer_id')
      .eq('owner_id', req.user!.id)
      .single();

    if (!venue || !venue.stripe_customer_id) {
      return res.json({ invoices: [] });
    }

    const invoices = await stripeService.getInvoices(venue.stripe_customer_id);
    res.json({ invoices });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Failed to get invoices' });
  }
});

/**
 * POST /api/billing/webhook
 * Handle Stripe webhook events
 */
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    if (!isStripeConfigured) {
      return res.status(400).json({ error: 'Billing is not configured' });
    }

    const signature = req.headers['stripe-signature'] as string;
    if (!signature) {
      return res.status(400).json({ error: 'Missing signature' });
    }

    // Get raw body for signature verification
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);

    const event = await stripeService.handleWebhookEvent(rawBody, signature);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data;
        console.log('Checkout completed:', session.id);

        // Update subscription in database
        if (session.customer && session.subscription) {
          const { data: venues } = await supabaseAdmin
            .from('venues')
            .select('id')
            .eq('stripe_customer_id', session.customer);

          if (venues && venues.length > 0) {
            await supabaseAdmin
              .from('venues')
              .update({
                stripe_subscription_id: session.subscription,
                subscription_status: 'active',
              })
              .eq('id', venues[0].id);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data;
        console.log('Subscription updated:', subscription.id);

        // Update subscription status
        const { data: venues } = await supabaseAdmin
          .from('venues')
          .select('id')
          .eq('stripe_subscription_id', subscription.id);

        if (venues && venues.length > 0) {
          await supabaseAdmin
            .from('venues')
            .update({
              subscription_status: subscription.status,
            })
            .eq('id', venues[0].id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data;
        console.log('Subscription deleted:', subscription.id);

        // Downgrade to free plan
        const { data: venues } = await supabaseAdmin
          .from('venues')
          .select('id')
          .eq('stripe_subscription_id', subscription.id);

        if (venues && venues.length > 0) {
          await supabaseAdmin
            .from('venues')
            .update({
              stripe_subscription_id: null,
              subscription_status: 'canceled',
            })
            .eq('id', venues[0].id);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data;
        console.log('Payment failed:', invoice.id);

        // Notify venue owner (TODO: send email notification)
        break;
      }

      default:
        console.log('Unhandled webhook event:', event.type);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook error' });
  }
});

/**
 * GET /api/billing/usage
 * Get current usage against plan limits
 */
router.get('/usage', authMiddleware, async (req: AuthRequest, res) => {
  try {
    // Get user's venue
    const { data: venue } = await supabaseAdmin
      .from('venues')
      .select('id, stripe_customer_id')
      .eq('owner_id', req.user!.id)
      .single();

    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    // Get current plan
    let planId = 'free';
    if (isStripeConfigured && venue.stripe_customer_id) {
      const status = await getSubscriptionStatus(venue.stripe_customer_id);
      planId = status.planId;
    }

    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId) || SUBSCRIPTION_PLANS[0];

    // Get current month's start
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    // Count active deals
    const { count: activeDealCount } = await supabaseAdmin
      .from('deals')
      .select('id', { count: 'exact', head: true })
      .eq('venue_id', venue.id)
      .eq('is_active', true);

    // Count monthly redemptions
    const { count: monthlyRedemptions } = await supabaseAdmin
      .from('redemptions')
      .select('id', { count: 'exact', head: true })
      .eq('venue_id', venue.id)
      .gte('redeemed_at', monthStart.toISOString());

    res.json({
      plan: {
        id: plan.id,
        name: plan.name,
        limits: plan.limits,
      },
      usage: {
        activeDeals: {
          current: activeDealCount || 0,
          limit: plan.limits.activeDeals,
          unlimited: plan.limits.activeDeals === -1,
        },
        monthlyRedemptions: {
          current: monthlyRedemptions || 0,
          limit: plan.limits.monthlyRedemptions,
          unlimited: plan.limits.monthlyRedemptions === -1,
        },
      },
    });
  } catch (error) {
    console.error('Get usage error:', error);
    res.status(500).json({ error: 'Failed to get usage' });
  }
});

export default router;
