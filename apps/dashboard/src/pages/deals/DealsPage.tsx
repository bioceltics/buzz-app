import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, Pause, Play, StopCircle, Clock, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export function DealsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data with more fields
  const [deals, setDeals] = useState([
    {
      id: '1',
      title: 'Happy Hour Special',
      type: 'happy_hour',
      discount: '50% off',
      status: 'active',
      redemptions: 45,
      maxRedemptions: 100,
      views: 230,
      startTime: '4:00 PM',
      endTime: '7:00 PM',
      endDate: '2024-02-01',
    },
    {
      id: '2',
      title: '2-for-1 Appetizers',
      type: 'recurring',
      discount: 'BOGO',
      status: 'active',
      redemptions: 28,
      maxRedemptions: 50,
      views: 156,
      startTime: '11:00 AM',
      endTime: '3:00 PM',
      endDate: '2024-03-15',
    },
    {
      id: '3',
      title: 'Flash Sale Friday',
      type: 'flash_deal',
      discount: '30% off',
      status: 'scheduled',
      redemptions: 0,
      maxRedemptions: 25,
      views: 0,
      startTime: '6:00 PM',
      endTime: '9:00 PM',
      endDate: '2024-01-26',
    },
    {
      id: '4',
      title: 'Weekend Brunch Deal',
      type: 'recurring',
      discount: '20% off',
      status: 'paused',
      redemptions: 12,
      maxRedemptions: 30,
      views: 89,
      startTime: '10:00 AM',
      endTime: '2:00 PM',
      endDate: '2024-02-28',
    },
  ]);

  const handlePauseDeal = (dealId: string) => {
    setDeals(deals.map(deal =>
      deal.id === dealId
        ? { ...deal, status: deal.status === 'paused' ? 'active' : 'paused' }
        : deal
    ));
    const deal = deals.find(d => d.id === dealId);
    if (deal?.status === 'paused') {
      toast.success('Deal resumed successfully');
    } else {
      toast.success('Deal paused successfully');
    }
  };

  const handleStopDeal = (dealId: string) => {
    if (confirm('Are you sure you want to stop this deal? This will end the deal immediately.')) {
      setDeals(deals.map(deal =>
        deal.id === dealId
          ? { ...deal, status: 'ended' }
          : deal
      ));
      toast.success('Deal stopped successfully');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'paused':
        return 'bg-yellow-100 text-yellow-700';
      case 'ended':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
          <p className="text-gray-600">Manage your promotions and special offers</p>
        </div>
        <Link to="/deals/new" className="btn btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Create Deal
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search deals..."
              className="input pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select className="input w-40">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="scheduled">Scheduled</option>
            <option value="ended">Ended</option>
          </select>
          <select className="input w-40">
            <option value="all">All Types</option>
            <option value="happy_hour">Happy Hour</option>
            <option value="flash_deal">Flash Deal</option>
            <option value="recurring">Recurring</option>
          </select>
        </div>
      </div>

      {/* Deals Table */}
      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Deal</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Type</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Schedule</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Redemptions</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {deals.map((deal) => (
              <tr key={deal.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{deal.title}</p>
                  <p className="text-sm text-gray-500">{deal.discount}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded capitalize">
                    {deal.type.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
                    <span>{deal.startTime} - {deal.endTime}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Until {deal.endDate}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(deal.status)}`}>
                    {deal.status === 'active' && (
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                    )}
                    {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 mr-1.5 text-gray-400" />
                    <span className="text-gray-900 font-medium">{deal.redemptions}</span>
                    <span className="text-gray-400 mx-1">/</span>
                    <span className="text-gray-500">{deal.maxRedemptions}</span>
                  </div>
                  <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1.5">
                    <div
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${(deal.redemptions / deal.maxRedemptions) * 100}%` }}
                    />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    {/* Pause/Resume Button */}
                    {(deal.status === 'active' || deal.status === 'paused') && (
                      <button
                        onClick={() => handlePauseDeal(deal.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          deal.status === 'paused'
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-yellow-600 hover:bg-yellow-50'
                        }`}
                        title={deal.status === 'paused' ? 'Resume Deal' : 'Pause Deal'}
                      >
                        {deal.status === 'paused' ? (
                          <Play className="w-4 h-4" />
                        ) : (
                          <Pause className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    {/* Stop Button */}
                    {(deal.status === 'active' || deal.status === 'paused' || deal.status === 'scheduled') && (
                      <button
                        onClick={() => handleStopDeal(deal.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Stop Deal"
                      >
                        <StopCircle className="w-4 h-4" />
                      </button>
                    )}
                    {/* Edit Button */}
                    <Link
                      to={`/deals/${deal.id}/edit`}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit Deal"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    {/* Delete Button */}
                    <button
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Deal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Pause className="w-4 h-4 text-yellow-600" />
          <span>Pause deal temporarily</span>
        </div>
        <div className="flex items-center gap-2">
          <Play className="w-4 h-4 text-green-600" />
          <span>Resume paused deal</span>
        </div>
        <div className="flex items-center gap-2">
          <StopCircle className="w-4 h-4 text-red-600" />
          <span>Stop deal permanently</span>
        </div>
      </div>
    </div>
  );
}
