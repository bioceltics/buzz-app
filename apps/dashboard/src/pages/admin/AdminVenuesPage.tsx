import { useState, useEffect } from 'react';
import { Check, X, Eye, Building2, Loader2, Ban, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface Venue {
  id: string;
  name: string;
  type: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  created_at: string;
  owner?: {
    id: string;
    email: string;
    full_name: string;
  };
}

interface StatusCounts {
  pending: number;
  approved: number;
  rejected: number;
  suspended: number;
}

export function AdminVenuesPage() {
  const [filter, setFilter] = useState('pending');
  const [venues, setVenues] = useState<Venue[]>([]);
  const [counts, setCounts] = useState<StatusCounts>({ pending: 0, approved: 0, rejected: 0, suspended: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [showSuspendModal, setShowSuspendModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [suspendReason, setSuspendReason] = useState('');

  const fetchVenues = async () => {
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) return;

      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/venues?${params}`,
        {
          headers: {
            Authorization: `Bearer ${session.data.session.access_token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch venues');

      const data = await response.json();
      setVenues(data.venues || []);
      if (data.counts) setCounts(data.counts);
    } catch (error) {
      console.error('Fetch venues error:', error);
      toast.error('Failed to load venues');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, [filter]);

  const handleApprove = async (venueId: string) => {
    setActionLoading(venueId);
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) return;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/venues/${venueId}/approve`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.data.session.access_token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to approve venue');

      toast.success('Venue approved!');
      fetchVenues();
    } catch (error) {
      console.error('Approve error:', error);
      toast.error('Failed to approve venue');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!showRejectModal) return;
    setActionLoading(showRejectModal);
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) return;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/venues/${showRejectModal}/reject`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.data.session.access_token}`,
          },
          body: JSON.stringify({ reason: rejectReason }),
        }
      );

      if (!response.ok) throw new Error('Failed to reject venue');

      toast.success('Venue rejected');
      setShowRejectModal(null);
      setRejectReason('');
      fetchVenues();
    } catch (error) {
      console.error('Reject error:', error);
      toast.error('Failed to reject venue');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async () => {
    if (!showSuspendModal) return;
    setActionLoading(showSuspendModal);
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) return;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/venues/${showSuspendModal}/suspend`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.data.session.access_token}`,
          },
          body: JSON.stringify({ reason: suspendReason }),
        }
      );

      if (!response.ok) throw new Error('Failed to suspend venue');

      toast.success('Venue suspended');
      setShowSuspendModal(null);
      setSuspendReason('');
      fetchVenues();
    } catch (error) {
      console.error('Suspend error:', error);
      toast.error('Failed to suspend venue');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Venues</h1>
          <p className="text-gray-600">Review and approve venue applications</p>
        </div>
        <button
          onClick={fetchVenues}
          className="btn btn-outline flex items-center justify-center w-full sm:w-auto"
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters with counts */}
      <div className="card mb-6">
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'approved', 'rejected', 'suspended'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                filter === status
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== 'all' && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    filter === status ? 'bg-white/20' : 'bg-gray-200'
                  }`}
                >
                  {counts[status as keyof StatusCounts] || 0}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : venues.length === 0 ? (
        <div className="card text-center py-12">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No venues found</p>
        </div>
      ) : (
        /* Venues List */
        <div className="space-y-4">
          {venues.map((venue) => (
            <div key={venue.id} className="card">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2 sm:block">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{venue.name}</h3>
                      <span
                        className={`sm:hidden px-2 py-0.5 rounded-full text-xs font-medium capitalize flex-shrink-0 ${
                          venue.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : venue.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : venue.status === 'suspended'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {venue.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{venue.address}</p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-600">
                      <span className="capitalize">{venue.type}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{formatDate(venue.created_at)}</span>
                      {venue.owner && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span className="hidden sm:inline">Owner: {venue.owner.full_name || venue.owner.email}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                      venue.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : venue.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : venue.status === 'suspended'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {venue.status}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4 pt-4 border-t border-gray-200">
                <button className="btn btn-outline flex items-center text-sm flex-1 sm:flex-none justify-center">
                  <Eye className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">View Details</span>
                </button>

                {venue.status === 'pending' && (
                  <>
                    <button
                      className="btn btn-primary flex items-center text-sm flex-1 sm:flex-none justify-center"
                      onClick={() => handleApprove(venue.id)}
                      disabled={actionLoading === venue.id}
                    >
                      {actionLoading === venue.id ? (
                        <Loader2 className="w-4 h-4 sm:mr-2 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 sm:mr-2" />
                      )}
                      <span className="hidden sm:inline">Approve</span>
                    </button>
                    <button
                      className="btn bg-red-600 text-white hover:bg-red-700 flex items-center text-sm flex-1 sm:flex-none justify-center"
                      onClick={() => setShowRejectModal(venue.id)}
                      disabled={actionLoading === venue.id}
                    >
                      <X className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Reject</span>
                    </button>
                  </>
                )}

                {venue.status === 'approved' && (
                  <button
                    className="btn bg-orange-600 text-white hover:bg-orange-700 flex items-center text-sm flex-1 sm:flex-none justify-center"
                    onClick={() => setShowSuspendModal(venue.id)}
                    disabled={actionLoading === venue.id}
                  >
                    <Ban className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Suspend</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reject Venue</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this venue application.
            </p>
            <textarea
              className="input min-h-[100px] mb-4"
              placeholder="Reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                className="btn btn-outline"
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectReason('');
                }}
                disabled={actionLoading !== null}
              >
                Cancel
              </button>
              <button
                className="btn bg-red-600 text-white hover:bg-red-700"
                onClick={handleReject}
                disabled={actionLoading !== null}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  'Reject Venue'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Suspend Venue</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for suspending this venue.
            </p>
            <textarea
              className="input min-h-[100px] mb-4"
              placeholder="Reason for suspension..."
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                className="btn btn-outline"
                onClick={() => {
                  setShowSuspendModal(null);
                  setSuspendReason('');
                }}
                disabled={actionLoading !== null}
              >
                Cancel
              </button>
              <button
                className="btn bg-orange-600 text-white hover:bg-orange-700"
                onClick={handleSuspend}
                disabled={actionLoading !== null}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Suspending...
                  </>
                ) : (
                  'Suspend Venue'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
