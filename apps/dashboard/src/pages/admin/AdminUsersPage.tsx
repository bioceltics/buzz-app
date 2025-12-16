import { useState, useEffect } from 'react';
import { Search, MoreVertical, Loader2, Shield, User, Ban, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface UserData {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'venue_owner' | 'admin';
  is_suspended: boolean;
  created_at: string;
  avatar_url?: string;
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showRoleModal, setShowRoleModal] = useState<UserData | null>(null);
  const [showSuspendModal, setShowSuspendModal] = useState<UserData | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) return;

      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter !== 'all') params.append('role', roleFilter);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/users?${params}`,
        {
          headers: {
            Authorization: `Bearer ${session.data.session.access_token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Fetch users error:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== '') fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setActionLoading(userId);
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) return;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/role`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.data.session.access_token}`,
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (!response.ok) throw new Error('Failed to update role');

      toast.success('User role updated');
      setShowRoleModal(null);
      fetchUsers();
    } catch (error) {
      console.error('Role change error:', error);
      toast.error('Failed to update user role');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async () => {
    if (!showSuspendModal) return;
    setActionLoading(showSuspendModal.id);
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) return;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${showSuspendModal.id}/suspend`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.data.session.access_token}`,
          },
          body: JSON.stringify({ reason: suspendReason }),
        }
      );

      if (!response.ok) throw new Error('Failed to suspend user');

      toast.success('User suspended');
      setShowSuspendModal(null);
      setSuspendReason('');
      fetchUsers();
    } catch (error) {
      console.error('Suspend error:', error);
      toast.error('Failed to suspend user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnsuspend = async (userId: string) => {
    setActionLoading(userId);
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) return;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/unsuspend`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.data.session.access_token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to unsuspend user');

      toast.success('User unsuspended');
      fetchUsers();
    } catch (error) {
      console.error('Unsuspend error:', error);
      toast.error('Failed to unsuspend user');
    } finally {
      setActionLoading(null);
      setOpenDropdown(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      case 'venue_owner':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-gray-600">View and manage all platform users</p>
        </div>
        <button
          onClick={fetchUsers}
          className="btn btn-outline flex items-center"
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card mb-6">
        <div className="flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              className="input pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {['all', 'user', 'venue_owner', 'admin'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  roleFilter === role
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {role === 'all' ? 'All' : role === 'venue_owner' ? 'Venue Owners' : role.charAt(0).toUpperCase() + role.slice(1) + 's'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : users.length === 0 ? (
        <div className="card text-center py-12">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No users found</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">User</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Role</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Joined</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.full_name}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-gray-600">
                            {(user.full_name || user.email)
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{user.full_name || 'No name'}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded capitalize ${getRoleColor(user.role)}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        user.is_suspended
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {user.is_suspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{formatDate(user.created_at)}</td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <button
                        className="p-2 text-gray-400 hover:text-gray-600"
                        onClick={() => setOpenDropdown(openDropdown === user.id ? null : user.id)}
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {openDropdown === user.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                          <button
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                            onClick={() => {
                              setShowRoleModal(user);
                              setOpenDropdown(null);
                            }}
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            Change Role
                          </button>
                          {user.is_suspended ? (
                            <button
                              className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-gray-50 flex items-center"
                              onClick={() => handleUnsuspend(user.id)}
                              disabled={actionLoading === user.id}
                            >
                              {actionLoading === user.id ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <User className="w-4 h-4 mr-2" />
                              )}
                              Unsuspend
                            </button>
                          ) : (
                            <button
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center"
                              onClick={() => {
                                setShowSuspendModal(user);
                                setOpenDropdown(null);
                              }}
                            >
                              <Ban className="w-4 h-4 mr-2" />
                              Suspend User
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Role Change Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Change User Role</h3>
            <p className="text-gray-600 mb-4">
              Select a new role for {showRoleModal.full_name || showRoleModal.email}
            </p>
            <div className="space-y-2 mb-6">
              {['user', 'venue_owner', 'admin'].map((role) => (
                <button
                  key={role}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                    showRoleModal.role === role
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleRoleChange(showRoleModal.id, role)}
                  disabled={actionLoading !== null || showRoleModal.role === role}
                >
                  <div className="font-medium capitalize">{role.replace('_', ' ')}</div>
                  <div className="text-sm text-gray-500">
                    {role === 'user' && 'Regular app user'}
                    {role === 'venue_owner' && 'Can manage venues and deals'}
                    {role === 'admin' && 'Full platform access'}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                className="btn btn-outline"
                onClick={() => setShowRoleModal(null)}
                disabled={actionLoading !== null}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Suspend User</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for suspending {showSuspendModal.full_name || showSuspendModal.email}.
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
                className="btn bg-red-600 text-white hover:bg-red-700"
                onClick={handleSuspend}
                disabled={actionLoading !== null}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Suspending...
                  </>
                ) : (
                  'Suspend User'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {openDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setOpenDropdown(null)}
        />
      )}
    </div>
  );
}
