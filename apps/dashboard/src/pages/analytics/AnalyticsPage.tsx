import { TrendingUp, Users, Eye, Tag, ArrowUpRight, Calendar, BarChart3 } from 'lucide-react';

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Track your venue's performance</p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-3">
          <select className="input py-2 px-4 min-w-[160px]">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="custom">Custom range</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { name: 'Profile Views', value: '2,847', change: '+12%', icon: Eye, color: 'bg-blue-500' },
          { name: 'Deal Views', value: '1,423', change: '+8%', icon: Tag, color: 'bg-primary-500' },
          { name: 'Redemptions', value: '156', change: '+23%', icon: TrendingUp, color: 'bg-green-500' },
          { name: 'New Favorites', value: '89', change: '+15%', icon: Users, color: 'bg-purple-500' },
        ].map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-500 truncate">{stat.name}</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4 text-green-500" />
                <span className="text-green-600 font-semibold">{stat.change}</span>
                <span className="text-gray-500">vs previous period</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Over Time */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Views Over Time</h3>
              <p className="text-sm text-gray-500 mt-1">Daily profile and deal views</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400">Chart visualization coming soon</p>
            </div>
          </div>
        </div>

        {/* Top Performing Deals */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Top Performing Deals</h3>
              <p className="text-sm text-gray-500 mt-1">Most redeemed deals this period</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Happy Hour Special', redemptions: 45, change: '+12%' },
              { name: '2-for-1 Appetizers', redemptions: 28, change: '+8%' },
              { name: 'Weekend Brunch Deal', redemptions: 22, change: '+15%' },
              { name: 'Late Night Snacks', redemptions: 18, change: '+5%' },
              { name: 'Student Discount', redemptions: 12, change: '+22%' },
            ].map((deal, index) => (
              <div
                key={deal.name}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm flex-shrink-0 ${
                  index === 0 ? 'bg-amber-500' :
                  index === 1 ? 'bg-gray-400' :
                  index === 2 ? 'bg-amber-700' :
                  'bg-gray-300'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{deal.name}</p>
                  <p className="text-sm text-gray-500">{deal.redemptions} redemptions</p>
                </div>
                <span className="text-sm font-semibold text-green-600 flex-shrink-0">
                  {deal.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Peak Hours */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-gray-900">Peak Hours</h3>
              <p className="text-sm text-gray-500 truncate">When customers view most</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { time: '12:00 - 2:00 PM', views: 245, percent: 85 },
              { time: '6:00 - 8:00 PM', views: 198, percent: 70 },
              { time: '8:00 - 10:00 PM', views: 156, percent: 55 },
            ].map((slot) => (
              <div key={slot.time}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 truncate">{slot.time}</span>
                  <span className="font-medium text-gray-900 flex-shrink-0 ml-2">{slot.views} views</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${slot.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Demographics */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-gray-900">Customer Types</h3>
              <p className="text-sm text-gray-500 truncate">Who's redeeming deals</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { type: 'New Customers', percent: 45, color: 'bg-blue-500' },
              { type: 'Returning', percent: 35, color: 'bg-green-500' },
              { type: 'VIP Members', percent: 20, color: 'bg-purple-500' },
            ].map((item) => (
              <div key={item.type} className="flex items-center gap-3">
                <div className={`w-3 h-3 ${item.color} rounded-full flex-shrink-0`} />
                <span className="flex-1 text-gray-700 truncate">{item.type}</span>
                <span className="font-bold text-gray-900 flex-shrink-0">{item.percent}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-gray-900">Quick Stats</h3>
              <p className="text-sm text-gray-500 truncate">This month's highlights</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 truncate">Avg. Redemption Rate</span>
              <span className="font-bold text-gray-900 flex-shrink-0 ml-2">23%</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 truncate">Most Popular Day</span>
              <span className="font-bold text-gray-900 flex-shrink-0 ml-2">Saturday</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 truncate">Avg. Time to Redeem</span>
              <span className="font-bold text-gray-900 flex-shrink-0 ml-2">2.5 hrs</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 truncate">Customer Satisfaction</span>
              <span className="font-bold text-green-600 flex-shrink-0 ml-2">4.8/5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
