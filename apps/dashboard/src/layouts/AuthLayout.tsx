import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function AuthLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-500 p-12 flex-col justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Buzzee</h1>
          <p className="mt-2 text-primary-100">Venue Dashboard</p>
        </div>
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-2">
              Grow Your Business
            </h3>
            <p className="text-primary-100">
              Create deals, manage events, and connect with customers in
              Vancouver.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-2">
              Real-Time Analytics
            </h3>
            <p className="text-primary-100">
              Track your performance with detailed insights on views,
              redemptions, and engagement.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-2">
              Direct Communication
            </h3>
            <p className="text-primary-100">
              Chat directly with customers and build lasting relationships.
            </p>
          </div>
        </div>
        <p className="text-primary-200 text-sm">
          © 2024 Buzzee. All rights reserved.
        </p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
