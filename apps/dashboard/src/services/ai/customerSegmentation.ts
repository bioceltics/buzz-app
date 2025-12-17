// Customer Segmentation Service
// Groups customers into segments and provides insights

import { CustomerSegment, CustomerInsight } from './types';

interface CustomerData {
  id: string;
  venueId: string;
  totalVisits: number;
  totalSpend: number;
  avgSpend: number;
  lastVisit: Date;
  firstVisit: Date;
  redemptionCount: number;
  favoriteCategories: string[];
  visitDays: number[]; // 0-6
  visitHours: number[]; // 0-23
  referralSource?: string;
}

// K-Means clustering implementation
function kMeans(
  data: number[][],
  k: number,
  maxIterations: number = 100
): { clusters: number[]; centroids: number[][] } {
  const n = data.length;
  if (n === 0) return { clusters: [], centroids: [] };

  const dimensions = data[0].length;

  // Initialize centroids randomly
  const centroids: number[][] = [];
  const usedIndices = new Set<number>();
  while (centroids.length < k && centroids.length < n) {
    const idx = Math.floor(Math.random() * n);
    if (!usedIndices.has(idx)) {
      usedIndices.add(idx);
      centroids.push([...data[idx]]);
    }
  }

  let clusters: number[] = new Array(n).fill(0);
  let changed = true;
  let iterations = 0;

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    // Assign points to nearest centroid
    for (let i = 0; i < n; i++) {
      let minDist = Infinity;
      let nearestCluster = 0;

      for (let j = 0; j < centroids.length; j++) {
        let dist = 0;
        for (let d = 0; d < dimensions; d++) {
          dist += Math.pow(data[i][d] - centroids[j][d], 2);
        }
        if (dist < minDist) {
          minDist = dist;
          nearestCluster = j;
        }
      }

      if (clusters[i] !== nearestCluster) {
        clusters[i] = nearestCluster;
        changed = true;
      }
    }

    // Update centroids
    for (let j = 0; j < centroids.length; j++) {
      const clusterPoints = data.filter((_, i) => clusters[i] === j);
      if (clusterPoints.length > 0) {
        for (let d = 0; d < dimensions; d++) {
          centroids[j][d] = clusterPoints.reduce((sum, p) => sum + p[d], 0) / clusterPoints.length;
        }
      }
    }
  }

  return { clusters, centroids };
}

// Normalize data for clustering
function normalize(values: number[]): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return values.map(() => 0.5);
  return values.map((v) => (v - min) / (max - min));
}

// Calculate RFM scores (Recency, Frequency, Monetary)
function calculateRFM(customer: CustomerData): { recency: number; frequency: number; monetary: number } {
  const daysSinceLastVisit = Math.floor(
    (Date.now() - customer.lastVisit.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Recency score (1-5, 5 is most recent)
  let recency = 5;
  if (daysSinceLastVisit > 90) recency = 1;
  else if (daysSinceLastVisit > 60) recency = 2;
  else if (daysSinceLastVisit > 30) recency = 3;
  else if (daysSinceLastVisit > 14) recency = 4;

  // Frequency score (1-5, 5 is most frequent)
  let frequency = 5;
  if (customer.totalVisits <= 1) frequency = 1;
  else if (customer.totalVisits <= 3) frequency = 2;
  else if (customer.totalVisits <= 6) frequency = 3;
  else if (customer.totalVisits <= 10) frequency = 4;

  // Monetary score (1-5, 5 is highest spender)
  let monetary = 5;
  if (customer.totalSpend < 50) monetary = 1;
  else if (customer.totalSpend < 100) monetary = 2;
  else if (customer.totalSpend < 200) monetary = 3;
  else if (customer.totalSpend < 400) monetary = 4;

  return { recency, frequency, monetary };
}

// Calculate churn probability
function calculateChurnProbability(customer: CustomerData): number {
  const daysSinceLastVisit = Math.floor(
    (Date.now() - customer.lastVisit.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Base churn probability on days since last visit
  let baseChurn = Math.min(0.9, daysSinceLastVisit / 120);

  // Adjust based on visit frequency
  const avgDaysBetweenVisits = customer.totalVisits > 1
    ? (Date.now() - customer.firstVisit.getTime()) / (customer.totalVisits * 24 * 60 * 60 * 1000)
    : 30;

  if (daysSinceLastVisit > avgDaysBetweenVisits * 2) {
    baseChurn = Math.min(0.95, baseChurn + 0.2);
  } else if (daysSinceLastVisit < avgDaysBetweenVisits) {
    baseChurn = Math.max(0.05, baseChurn - 0.1);
  }

  // Adjust based on total visits (loyal customers less likely to churn)
  if (customer.totalVisits > 10) {
    baseChurn *= 0.7;
  } else if (customer.totalVisits > 5) {
    baseChurn *= 0.85;
  }

  return Math.round(baseChurn * 100) / 100;
}

// Calculate customer lifetime value
function calculateLifetimeValue(customer: CustomerData): number {
  const customerAge = Math.max(1, Math.floor(
    (Date.now() - customer.firstVisit.getTime()) / (1000 * 60 * 60 * 24 * 30)
  )); // months

  const monthlySpend = customer.totalSpend / customerAge;
  const churnProb = calculateChurnProbability(customer);
  const expectedLifespan = 1 / Math.max(0.1, churnProb); // months

  return Math.round(monthlySpend * expectedLifespan);
}

export class CustomerSegmentationService {
  private customerData: Map<string, CustomerData[]> = new Map();
  private segments: Map<string, CustomerSegment[]> = new Map();

  // Segment customers for a venue
  async segmentCustomers(venueId: string): Promise<CustomerSegment[]> {
    const customers = this.customerData.get(venueId) || this.generateMockCustomers(venueId);

    if (customers.length < 5) {
      return this.getDefaultSegments(venueId, customers);
    }

    // Prepare feature matrix for clustering
    const features: number[][] = customers.map((c) => {
      const rfm = calculateRFM(c);
      return [
        rfm.recency,
        rfm.frequency,
        rfm.monetary,
        c.redemptionCount / Math.max(c.totalVisits, 1), // redemption rate
      ];
    });

    // Normalize features
    const normalized: number[][] = [];
    for (let d = 0; d < 4; d++) {
      const column = features.map((f) => f[d]);
      const normalizedColumn = normalize(column);
      for (let i = 0; i < customers.length; i++) {
        if (!normalized[i]) normalized[i] = [];
        normalized[i][d] = normalizedColumn[i];
      }
    }

    // Run K-Means clustering
    const k = Math.min(5, Math.floor(customers.length / 3));
    const { clusters } = kMeans(normalized, k);

    // Build segments from clusters
    const segmentMap = new Map<number, CustomerData[]>();
    clusters.forEach((cluster, i) => {
      const existing = segmentMap.get(cluster) || [];
      existing.push(customers[i]);
      segmentMap.set(cluster, existing);
    });

    // Create segment objects
    const segments: CustomerSegment[] = [];
    const segmentProfiles = [
      { name: 'VIP Champions', description: 'High-value, frequent visitors who redeem deals regularly' },
      { name: 'Loyal Regulars', description: 'Consistent visitors with moderate spending' },
      { name: 'Deal Hunters', description: 'Visit primarily for deals, price-sensitive' },
      { name: 'At-Risk', description: 'Previously active customers showing decline' },
      { name: 'New Explorers', description: 'Recent customers still discovering your venue' },
    ];

    let segmentIndex = 0;
    segmentMap.forEach((segmentCustomers, clusterId) => {
      const profile = segmentProfiles[segmentIndex % segmentProfiles.length];

      // Calculate segment stats
      const avgSpend = segmentCustomers.reduce((sum, c) => sum + c.avgSpend, 0) / segmentCustomers.length;
      const avgVisits = segmentCustomers.reduce((sum, c) => sum + c.totalVisits, 0) / segmentCustomers.length;
      const avgChurn = segmentCustomers.reduce((sum, c) => sum + calculateChurnProbability(c), 0) / segmentCustomers.length;
      const avgLTV = segmentCustomers.reduce((sum, c) => sum + calculateLifetimeValue(c), 0) / segmentCustomers.length;

      // Determine preferred deal types
      const categoryCount = new Map<string, number>();
      segmentCustomers.forEach((c) => {
        c.favoriteCategories.forEach((cat) => {
          categoryCount.set(cat, (categoryCount.get(cat) || 0) + 1);
        });
      });
      const preferredDealTypes = Array.from(categoryCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([cat]) => cat);

      // Marketing recommendations
      const marketingRecommendations: string[] = [];
      if (avgChurn > 0.5) {
        marketingRecommendations.push('Send re-engagement campaign with exclusive offer');
        marketingRecommendations.push('Personal outreach for high-value members');
      }
      if (avgSpend > 50) {
        marketingRecommendations.push('Offer VIP perks and early access to deals');
        marketingRecommendations.push('Create referral program incentives');
      }
      if (avgVisits < 3) {
        marketingRecommendations.push('Send welcome series with first-timer deals');
        marketingRecommendations.push('Highlight menu favorites and best deals');
      }

      segments.push({
        segmentId: `segment-${venueId}-${clusterId}`,
        name: profile.name,
        description: profile.description,
        size: segmentCustomers.length,
        characteristics: {
          avgSpend: Math.round(avgSpend),
          visitFrequency: Math.round(avgVisits * 10) / 10,
          preferredDealTypes,
          churnRisk: Math.round(avgChurn * 100) / 100,
          lifetimeValue: Math.round(avgLTV),
        },
        customers: segmentCustomers.map((c) => c.id),
        marketingRecommendations,
      });

      segmentIndex++;
    });

    // Sort by lifetime value
    segments.sort((a, b) => b.characteristics.lifetimeValue - a.characteristics.lifetimeValue);

    this.segments.set(venueId, segments);
    return segments;
  }

  // Get insights for a specific customer
  async getCustomerInsight(venueId: string, customerId: string): Promise<CustomerInsight | null> {
    const customers = this.customerData.get(venueId);
    const customer = customers?.find((c) => c.id === customerId);

    if (!customer) return null;

    const segments = this.segments.get(venueId) || await this.segmentCustomers(venueId);
    const customerSegment = segments.find((s) => s.customers.includes(customerId));

    const churnProbability = calculateChurnProbability(customer);
    const lifetimeValue = calculateLifetimeValue(customer);

    // Predict next visit
    let nextVisitPrediction: Date | null = null;
    if (customer.totalVisits > 1) {
      const avgDaysBetweenVisits = Math.floor(
        (customer.lastVisit.getTime() - customer.firstVisit.getTime()) /
        ((customer.totalVisits - 1) * 24 * 60 * 60 * 1000)
      );
      nextVisitPrediction = new Date(customer.lastVisit.getTime() + avgDaysBetweenVisits * 24 * 60 * 60 * 1000);
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (churnProbability > 0.6) {
      recommendations.push('High churn risk - send win-back offer');
      recommendations.push('Schedule personal outreach');
    }
    if (customer.totalVisits > 5 && lifetimeValue > 300) {
      recommendations.push('Candidate for VIP program');
      recommendations.push('Offer exclusive preview of new deals');
    }
    if (customer.redemptionCount / customer.totalVisits > 0.5) {
      recommendations.push('Deal-responsive - prioritize promotional communications');
    }

    return {
      customerId,
      segment: customerSegment?.name || 'Uncategorized',
      lifetimeValue,
      visitCount: customer.totalVisits,
      avgSpend: customer.avgSpend,
      churnProbability,
      nextVisitPrediction,
      preferences: customer.favoriteCategories,
      recommendations,
    };
  }

  // Get default segments for small customer bases
  private getDefaultSegments(venueId: string, customers: CustomerData[]): CustomerSegment[] {
    return [
      {
        segmentId: `segment-${venueId}-all`,
        name: 'All Customers',
        description: 'All customers (segmentation requires more data)',
        size: customers.length,
        characteristics: {
          avgSpend: customers.length > 0
            ? Math.round(customers.reduce((sum, c) => sum + c.avgSpend, 0) / customers.length)
            : 0,
          visitFrequency: customers.length > 0
            ? Math.round(customers.reduce((sum, c) => sum + c.totalVisits, 0) / customers.length * 10) / 10
            : 0,
          preferredDealTypes: ['drinks', 'food'],
          churnRisk: 0.3,
          lifetimeValue: 200,
        },
        customers: customers.map((c) => c.id),
        marketingRecommendations: [
          'Build customer base to enable advanced segmentation',
          'Collect more customer interaction data',
        ],
      },
    ];
  }

  // Generate mock customer data
  private generateMockCustomers(venueId: string): CustomerData[] {
    const customers: CustomerData[] = [];
    const categories = ['drinks', 'food', 'entry', 'combo'];

    for (let i = 0; i < 100; i++) {
      const firstVisit = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
      const lastVisit = new Date(firstVisit.getTime() + Math.random() * (Date.now() - firstVisit.getTime()));
      const totalVisits = 1 + Math.floor(Math.random() * 20);
      const avgSpend = 15 + Math.random() * 60;

      customers.push({
        id: `customer-${venueId}-${i}`,
        venueId,
        totalVisits,
        totalSpend: avgSpend * totalVisits,
        avgSpend,
        lastVisit,
        firstVisit,
        redemptionCount: Math.floor(totalVisits * (0.3 + Math.random() * 0.5)),
        favoriteCategories: categories.slice(0, 1 + Math.floor(Math.random() * 3)),
        visitDays: [Math.floor(Math.random() * 7), Math.floor(Math.random() * 7)],
        visitHours: [12 + Math.floor(Math.random() * 10)],
      });
    }

    this.customerData.set(venueId, customers);
    return customers;
  }

  // Load actual customer data
  loadCustomerData(venueId: string, customers: CustomerData[]): void {
    this.customerData.set(venueId, customers);
  }
}

export const customerSegmentationService = new CustomerSegmentationService();
