import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Tag,
  Calendar,
  BarChart3,
  MessageSquare,
  Settings,
  Menu,
  X,
  LogOut,
  Shield,
  Users,
  Building2,
  Bell,
  ChevronRight,
  Search,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Deals', href: '/deals', icon: Tag },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Messages', href: '/chat', icon: MessageSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const adminNavigation = [
  { name: 'Manage Venues', href: '/admin/venues', icon: Building2 },
  { name: 'Manage Users', href: '/admin/users', icon: Users },
];

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, venue, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // Get current page title
  const getCurrentPageTitle = () => {
    const path = location.pathname;
    const allNav = [...navigation, ...adminNavigation];
    const current = allNav.find(item => path.startsWith(item.href));
    return current?.name || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 shadow-sidebar transform transition-transform duration-300 ease-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-18 px-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-button">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-gradient">Buzz</span>
              <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-700 text-2xs font-semibold rounded-full">
                PRO
              </span>
            </div>
          </div>
          <button
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Venue Info */}
        {venue && (
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-sm">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {venue.name}
                </p>
                <p className="text-xs text-gray-500 capitalize flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${venue.status === 'active' ? 'bg-success-500' : 'bg-warning-500'}`}></span>
                  {venue.type}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
            {venue.status === 'pending' && (
              <div className="mt-3 px-3 py-2 bg-warning-50 border border-warning-200 rounded-xl text-xs text-warning-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Pending Approval
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto scrollbar-hide">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}

          {/* Admin Section */}
          {isAdmin && (
            <>
              <div className="pt-6 pb-2">
                <div className="flex items-center gap-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <Shield className="w-4 h-4" />
                  Admin
                </div>
              </div>
              {adminNavigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* User Menu */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-secondary flex items-center justify-center shadow-sm">
              <span className="text-sm font-bold text-white">
                {user?.email?.[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.user_metadata?.full_name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-all"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 h-18 flex items-center px-4 lg:px-8">
          <button
            className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Page Title - Desktop */}
          <div className="hidden lg:flex items-center">
            <h1 className="text-lg font-semibold text-gray-900">{getCurrentPageTitle()}</h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-auto px-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search deals, events, customers..."
                className="w-full pl-12 pr-4 py-2.5 bg-gray-100 border-2 border-transparent rounded-xl text-sm placeholder:text-gray-400 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
              />
              <kbd className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-white rounded-lg text-xs text-gray-400 border border-gray-200 hidden lg:inline-block">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 ml-auto">
            <button className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error-500 rounded-full ring-2 ring-white"></span>
            </button>

            {/* Mobile Search */}
            <button className="md:hidden p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
