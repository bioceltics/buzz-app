/**
 * Stripe Payment Service
 *
 * Handles subscription management, payments, and billing for venue owners
 */

import Stripe from 'stripe';

// Initialize Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

// Check if Stripe is configured
export const isStripeConfigured = !!process.env.STRIPE_SECRET_KEY;

// ============================================================================
// TYPES
// ============================================================================

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  limits: {
    activeDeals: number;
    monthlyRedemptions: number;
    analytics: boolean;
    aiFeatures: boolean;
    prioritySupport: boolean;
  };
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
}

export interface CustomerData {
  userId: string;
  email: string;
  name: string;
  venueId?: string;
}

// ============================================================================
// SUBSCRIPTION PLANS
// ============================================================================

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      'Up to 3 active deals',
      '50 redemptions/month',
      'Basic analytics',
      'Email support',
    ],
    limits: {
      activeDeals: 3,
      monthlyRedemptions: 50,
      analytics: false,
      aiFeatures: false,
      prioritySupport: false,
    },
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'For growing venues',
    priceMonthly: 29,
    priceYearly: 290, // ~17% discount
    features: [
      'Up to 10 active deals',
      '500 redemptions/month',
      'Advanced analytics',
      'AI content suggestions',
      'Priority email support',
    ],
    limits: {
      activeDeals: 10,
      monthlyRedemptions: 500,
      analytics: true,
      aiFeatures: true,
      prioritySupport: false,
    },
    stripePriceIdMonthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID,
    stripePriceIdYearly: process.env.STRIPE_STARTER_YEARLY_PRICE_ID,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For established venues',
    priceMonthly: 79,
    priceYearly: 790, // ~17% discount
    features: [
      'Unlimited active deals',
      'Unlimited redemptions',
      'Advanced analytics & insights',
      'Full AI suite',
      'Priority phone support',
      'Custom branding',
      'API access',
    ],
    limits: {
      activeDeals: -1, // unlimited
      monthlyRedemptions: -1, // unlimited
      analytics: true,
      aiFeatures: true,
      prioritySupport: true,
    },
    stripePriceIdMonthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    stripePriceIdYearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For chains and franchises',
    priceMonthly: 199,
    priceYearly: 1990, // ~17% discount
    features: [
      'Everything in Pro',
      'Multiple venue management',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
      'White-label options',
    ],
    limits: {
      activeDeals: -1,
      monthlyRedemptions: -1,
      analytics: true,
      aiFeatures: true,
      prioritySupport: true,
    },
    stripePriceIdMonthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID,
    stripePriceIdYearly: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID,
  },
];

// ============================================================================
// STRIPE SERVICE CLASS
// ============================================================================

class StripeService {
  /**
   * Create or retrieve a Stripe customer
   */
  async getOrCreateCustomer(data: CustomerData): Promise<string> {
    if (!isStripeConfigured) {
      throw new Error('Stripe is not configured');
    }

    // Search for existing customer
    const existingCustomers = await stripe.customers.list({
      email: data.email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0].id;
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email: data.email,
      name: data.name,
      metadata: {
        userId: data.userId,
        venueId: data.venueId || '',
      },
    });

    return customer.id;
  }

  /**
   * Create a checkout session for subscription
   */
  async createCheckoutSession(
    customerId: string,
    planId: string,
    billingPeriod: 'monthly' | 'yearly',
    successUrl: string,
    cancelUrl: string
  ): Promise<string> {
    if (!isStripeConfigured) {
      throw new Error('Stripe is not configured');
    }

    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
    if (!plan || plan.id === 'free') {
      throw new Error('Invalid plan or free plan selected');
    }

    const priceId =
      billingPeriod === 'yearly' ? plan.stripePriceIdYearly : plan.stripePriceIdMonthly;

    if (!priceId) {
      throw new Error('Stripe price ID not configured for this plan');
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        planId,
        billingPeriod,
      },
    });

    return session.url || '';
  }

  /**
   * Create a billing portal session
   */
  async createBillingPortalSession(
    customerId: string,
    returnUrl: string
  ): Promise<string> {
    if (!isStripeConfigured) {
      throw new Error('Stripe is not configured');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session.url;
  }

  /**
   * Get subscription status for a customer
   */
  async getSubscriptionStatus(customerId: string): Promise<{
    active: boolean;
    planId: string;
    currentPeriodEnd: Date | null;
    cancelAtPeriodEnd: boolean;
  }> {
    if (!isStripeConfigured) {
      return {
        active: false,
        planId: 'free',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      };
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return {
        active: false,
        planId: 'free',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      };
    }

    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0]?.price.id;

    // Find plan by price ID
    let planId = 'free';
    for (const plan of SUBSCRIPTION_PLANS) {
      if (
        plan.stripePriceIdMonthly === priceId ||
        plan.stripePriceIdYearly === priceId
      ) {
        planId = plan.id;
        break;
      }
    }

    return {
      active: true,
      planId,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };
  }

  /**
   * Cancel subscription at period end
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    if (!isStripeConfigured) {
      throw new Error('Stripe is not configured');
    }

    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }

  /**
   * Reactivate a cancelled subscription
   */
  async reactivateSubscription(subscriptionId: string): Promise<void> {
    if (!isStripeConfigured) {
      throw new Error('Stripe is not configured');
    }

    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
  }

  /**
   * Get invoices for a customer
   */
  async getInvoices(
    customerId: string,
    limit: number = 10
  ): Promise<
    Array<{
      id: string;
      amount: number;
      status: string;
      date: Date;
      pdfUrl: string | null;
    }>
  > {
    if (!isStripeConfigured) {
      return [];
    }

    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit,
    });

    return invoices.data.map((invoice) => ({
      id: invoice.id,
      amount: (invoice.amount_paid || 0) / 100,
      status: invoice.status || 'unknown',
      date: new Date(invoice.created * 1000),
      pdfUrl: invoice.invoice_pdf,
    }));
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhookEvent(
    payload: string,
    signature: string
  ): Promise<{
    type: string;
    data: any;
  }> {
    if (!isStripeConfigured) {
      throw new Error('Stripe is not configured');
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    return {
      type: event.type,
      data: event.data.object,
    };
  }

  /**
   * Get plan limits
   */
  getPlanLimits(planId: string): SubscriptionPlan['limits'] {
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
    return plan?.limits || SUBSCRIPTION_PLANS[0].limits;
  }

  /**
   * Check if venue is within plan limits
   */
  async checkPlanLimits(
    venueId: string,
    planId: string,
    action: 'createDeal' | 'redemption'
  ): Promise<{ allowed: boolean; reason?: string }> {
    const limits = this.getPlanLimits(planId);

    // Unlimited plans
    if (action === 'createDeal' && limits.activeDeals === -1) {
      return { allowed: true };
    }
    if (action === 'redemption' && limits.monthlyRedemptions === -1) {
      return { allowed: true };
    }

    // Would need to check against actual usage from database
    // This is a placeholder - in production, query the database
    return { allowed: true };
  }
}

// Export singleton instance
export const stripeService = new StripeService();

// Export convenience functions
export const getOrCreateCustomer = (data: CustomerData) =>
  stripeService.getOrCreateCustomer(data);

export const createCheckoutSession = (
  customerId: string,
  planId: string,
  billingPeriod: 'monthly' | 'yearly',
  successUrl: string,
  cancelUrl: string
) => stripeService.createCheckoutSession(customerId, planId, billingPeriod, successUrl, cancelUrl);

export const createBillingPortalSession = (customerId: string, returnUrl: string) =>
  stripeService.createBillingPortalSession(customerId, returnUrl);

export const getSubscriptionStatus = (customerId: string) =>
  stripeService.getSubscriptionStatus(customerId);

export const getPlanLimits = (planId: string) =>
  stripeService.getPlanLimits(planId);
