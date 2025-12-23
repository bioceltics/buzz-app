import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function AuthLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Pages handle their own full layout
  return <Outlet />;
}
