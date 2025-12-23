import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Zap, BarChart3, MessageSquare, Shield } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Live Deals',
    description: 'Create time-limited offers that drive instant traffic to your venue.',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description: 'Track views, redemptions, and revenue with detailed insights.',
  },
  {
    icon: MessageSquare,
    title: 'Direct Messaging',
    description: 'Connect with customers and build lasting relationships.',
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security to protect your business data.',
  },
];

export function AuthLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="text-white font-bold text-2xl">B</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Buzzee</h1>
              <p className="text-primary-100 text-sm">Business Portal</p>
            </div>
          </div>

          {/* Hero Text */}
          <div className="mt-16">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Grow your venue with<br />
              <span className="text-primary-200">live deals</span>
            </h2>
            <p className="mt-4 text-primary-100 text-lg max-w-md">
              Join hundreds of venues using Buzzee to attract customers and boost revenue with time-limited offers.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="relative z-10 grid grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10"
            >
              <feature.icon className="w-6 h-6 text-primary-200 mb-2" />
              <h3 className="font-semibold text-white text-sm">{feature.title}</h3>
              <p className="text-primary-200 text-xs mt-1 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="relative z-10 text-primary-200 text-sm">
          &copy; {new Date().getFullYear()} Buzzee. All rights reserved.
        </p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
