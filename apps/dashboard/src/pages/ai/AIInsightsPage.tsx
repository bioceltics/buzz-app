import { useState, useEffect } from 'react';
import {
  Brain,
  TrendingUp,
  Users,
  ShieldCheck,
  Zap,
  BarChart3,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  RefreshCw,
  ChevronRight,
  Calendar,
  DollarSign,
} from 'lucide-react';
import {
  aiServiceManager,
  demandForecastingService,
  pricingOptimizationService,
  customerSegmentationService,
  popularityScoringService,
  DemandForecast,
  PricingRecommendation,
  CustomerSegment,
  DealPopularityScore,
} from '@/services/ai';

export function AIInsightsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [demandForecast, setDemandForecast] = useState<DemandForecast | null>(null);
  const [pricingRec, setPricingRec] = useState<PricingRecommendation | null>(null);
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [topDeals, setTopDeals] = useState<DealPopularityScore[]>([]);
  const [aiSummary, setAiSummary] = useState<any>(null);

  useEffect(() => {
    loadAIData();
  }, []);

  const loadAIData = async () => {
    setIsLoading(true);
    try {
      // Initialize services
      await aiServiceManager.initialize();

      // Load all AI data
      const [forecast, pricing, customerSegments, deals, summary] = await Promise.all([
        demandForecastingService.forecastDemand('venue-1', new Date()),
        pricingOptimizationService.getRecommendation('venue-1', 'drinks', 25),
        customerSegmentationService.segmentCustomers('venue-1'),
        popularityScoringService.getTopDeals(5),
        aiServiceManager.getAnalyticsSummary(),
      ]);

      setDemandForecast(forecast);
      setPricingRec(pricing);
      setSegments(customerSegments);
      setTopDeals(deals);
      setAiSummary(summary);
    } catch (error) {
      console.error('Error loading AI data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Brain className="w-12 h-12 text-primary-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading AI Insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary-500" />
            AI Insights
          </h1>
          <p className="text-gray-500 mt-1">
            Machine learning powered analytics and recommendations
          </p>
        </div>
        <button
          onClick={loadAIData}
          className="btn btn-outline flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* AI Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Recommendation Accuracy</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {Math.round((aiSummary?.recommendationAccuracy || 0) * 100)}%
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+5%</span>
            <span className="text-gray-500 ml-2">vs last month</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Engagement Lift</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                +{Math.round((aiSummary?.userEngagementLift || 0) * 100)}%
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">From AI-powered recommendations</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Revenue Impact</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                +{Math.round((aiSummary?.venueRevenueLift || 0) * 100)}%
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">Attributed to AI optimization</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Fraud Prevented</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${aiSummary?.fraudValueSaved || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">{aiSummary?.fraudsPrevented || 0} suspicious activities blocked</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Demand Forecast */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Demand Forecast</h2>
                <p className="text-sm text-gray-500">Today's predicted traffic</p>
              </div>
            </div>
            <span className={`badge ${
              demandForecast?.weeklyTrend === 'increasing' ? 'badge-success' :
              demandForecast?.weeklyTrend === 'decreasing' ? 'badge-error' :
              'badge-gray'
            }`}>
              {demandForecast?.weeklyTrend || 'stable'}
            </span>
          </div>
          <div className="card-body">
            {/* Hourly forecast chart */}
            <div className="space-y-3">
              {demandForecast?.hourlyPredictions
                .filter((_, i) => i >= 10 && i <= 22)
                .map((prediction) => (
                <div key={prediction.hour} className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 w-16">
                    {prediction.hour}:00
                  </span>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        prediction.recommendation === 'create_deal'
                          ? 'bg-amber-400'
                          : prediction.recommendation === 'busy'
                          ? 'bg-green-500'
                          : 'bg-blue-400'
                      }`}
                      style={{ width: `${prediction.predictedTraffic}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-12">
                    {prediction.predictedTraffic}%
                  </span>
                  {prediction.recommendation === 'create_deal' && (
                    <span className="badge badge-warning text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      Deal
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Seasonal factors */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Seasonal Factors</h4>
              <div className="flex flex-wrap gap-2">
                {demandForecast?.seasonalFactors.map((factor, i) => (
                  <span key={i} className="px-3 py-1 bg-white rounded-full text-xs text-gray-600 border border-gray-200">
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Recommendation */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Pricing Optimization</h2>
                <p className="text-sm text-gray-500">AI-recommended deal pricing</p>
              </div>
            </div>
            <span className="badge badge-success">
              {Math.round((pricingRec?.confidence || 0) * 100)}% confident
            </span>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <p className="text-sm text-gray-500">Recommended Discount</p>
                <p className="text-3xl font-bold text-primary-600 mt-1">
                  {pricingRec?.recommendedDiscount}%
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <p className="text-sm text-gray-500">Predicted Redemptions</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {pricingRec?.predictedRedemptions}
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Competitor Average</span>
                <span className="font-medium">{pricingRec?.comparisons.competitorAvg}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Your Historical Best</span>
                <span className="font-medium">{pricingRec?.comparisons.historicalBest}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Predicted Revenue</span>
                <span className="font-bold text-green-600">${pricingRec?.predictedRevenue}</span>
              </div>
            </div>

            <div className="p-4 bg-primary-50 rounded-xl">
              <h4 className="text-sm font-semibold text-primary-900 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Reasoning
              </h4>
              <ul className="space-y-2">
                {pricingRec?.reasoning.map((reason, i) => (
                  <li key={i} className="text-sm text-primary-700 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Segments */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Customer Segments</h2>
              <p className="text-sm text-gray-500">AI-identified customer groups</p>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {segments.map((segment) => (
              <div
                key={segment.segmentId}
                className="p-4 border border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{segment.name}</h3>
                    <p className="text-sm text-gray-500">{segment.size} customers</p>
                  </div>
                  <span className={`badge ${
                    segment.characteristics.churnRisk > 0.5 ? 'badge-error' :
                    segment.characteristics.churnRisk > 0.3 ? 'badge-warning' :
                    'badge-success'
                  }`}>
                    {Math.round(segment.characteristics.churnRisk * 100)}% churn risk
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4">{segment.description}</p>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Avg Spend</span>
                    <p className="font-semibold">${segment.characteristics.avgSpend}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Lifetime Value</span>
                    <p className="font-semibold">${segment.characteristics.lifetimeValue}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Preferred Deals</p>
                  <div className="flex flex-wrap gap-1">
                    {segment.characteristics.preferredDealTypes.map((type) => (
                      <span key={type} className="px-2 py-0.5 bg-gray-100 rounded text-xs capitalize">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trending Deals */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Deal Popularity Scores</h2>
              <p className="text-sm text-gray-500">Real-time AI ranking</p>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            {topDeals.map((deal, index) => (
              <div
                key={deal.dealId}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${
                  index === 0 ? 'bg-amber-500' :
                  index === 1 ? 'bg-gray-400' :
                  index === 2 ? 'bg-amber-700' :
                  'bg-gray-300'
                }`}>
                  #{index + 1}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{deal.dealId}</span>
                    {deal.badges.map((badge) => (
                      <span key={badge} className={`badge text-xs ${
                        badge === 'hot' ? 'badge-error' :
                        badge === 'trending' ? 'badge-warning' :
                        badge === 'popular' ? 'badge-success' :
                        badge === 'new' ? 'badge-info' :
                        'badge-gray'
                      }`}>
                        {badge}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span>Score: {deal.overallScore}</span>
                    <span>Trending: {deal.trendingScore}</span>
                    <span>Velocity: {deal.velocityScore}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-600">
                    {deal.overallScore}
                  </div>
                  <div className="text-xs text-gray-500">popularity score</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active AI Models */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <Brain className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Active AI Models</h2>
              <p className="text-sm text-gray-500">{aiSummary?.activeModels || 0} models running</p>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Recommendation Engine', type: 'Collaborative + Content Filtering', accuracy: 78 },
              { name: 'Demand Forecasting', type: 'Time Series Analysis', accuracy: 82 },
              { name: 'Pricing Optimization', type: 'Price Elasticity Model', accuracy: 75 },
              { name: 'Customer Segmentation', type: 'K-Means Clustering', accuracy: 85 },
              { name: 'Fraud Detection', type: 'Anomaly Detection', accuracy: 92 },
              { name: 'Popularity Scoring', type: 'Multi-factor Ranking', accuracy: 88 },
            ].map((model) => (
              <div key={model.name} className="p-4 border border-gray-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{model.name}</h3>
                  <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                </div>
                <p className="text-sm text-gray-500 mb-3">{model.type}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${model.accuracy}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{model.accuracy}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
