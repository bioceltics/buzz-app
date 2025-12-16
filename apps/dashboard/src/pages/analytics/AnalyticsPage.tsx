import { TrendingUp, Users, Eye, Tag } from 'lucide-react';

export function AnalyticsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Track your venue's performance</p>
      </div>

      {/* Period Selector */}
      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <select className="input w-40">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="custom">Custom range</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { name: 'Profile Views', value: '2,847', change: '+12%', icon: Eye },
          { name: 'Deal Views', value: '1,423', change: '+8%', icon: Tag },
          { name: 'Redemptions', value: '156', change: '+23%', icon: TrendingUp },
          { name: 'New Favorites', value: '89', change: '+15%', icon: Users },
        ].map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-primary-500" />
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2">{stat.change} vs previous period</p>
          </div>
        ))}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Views Over Time</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-400">Chart will be displayed here</p>
          </div>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Deals</h3>
          <div className="space-y-4">
            {[
              { name: 'Happy Hour Special', redemptions: 45 },
              { name: '2-for-1 Appetizers', redemptions: 28 },
              { name: 'Weekend Brunch Deal', redemptions: 22 },
            ].map((deal, index) => (
              <div key={deal.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                    {index + 1}
                  </span>
                  <span className="text-gray-900">{deal.name}</span>
                </div>
                <span className="text-gray-600">{deal.redemptions} redemptions</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
